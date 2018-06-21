/**
 * Account.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const objectid = require('mongodb').ObjectID;
module.exports = {
  ACCOUNTS: {
    CASH: '59a511bd4fccf7b829ebaf85',
    BANK: '59a633a882d2c9095c2ff043',
    PAYABLE: '59a511bd4fccf7b829ebaf86',
    INCOME: '59a511bd4fccf7b829ebaf87',
    EXTERNAL: '59a513eb82d2c92f2c2d01c4',
    TEMP: '59c1c040e121ffc8338d4b40'
  },
  attributes: {
    user: { type: 'string', defaultsTo: 'none' },
    balance: { type: 'integer', required: true, defaultsTo: 0 },
    pendingTransactions: { type: 'array' },
    name: { type: 'string', required: true, defaultsTo: 'debit' },
    type: { type: 'string', required: true, defaultsTo: 'system', enum: ['system', 'customer', 'partner'] },
    accounting: { type: 'string', enum: ['assets', 'equity'] },
    updateUserBalance: function () {
      return new Promise((resolve, reject) => {
        switch (this.type) {
          case 'customer':
            Customer.update({ id: this.user }, { balance: this.balance }).then(user => {
              resolve(user);
            })
            break;
          case 'partner':
            Partner.update({ id: this.user }, { balance: this.balance }).then(user => {
              resolve(user);
            })
            break;
          default:
            resolve();
            break;
        }
      })
    }
  },

  cashIn: (opts) => {
    return new Promise((resolve, reject) => {
      let { type, user, amount, userType, officer, transaction } = opts;
      if (!type || !user || !amount || !userType || !officer) return reject({ err: 1, msg: 'invalid params' });
      amount = Number(amount);
      let destAccount = Account.ACCOUNTS.CASH;
      let desc = 'Người dùng nạp tiền mặt vào tài khoản hệ thống - tiền mặt';
      if (type == 'bank') {
        if (!transaction) return reject({ err: 1, msg: 'invalid params' });
        destAccount = Account.ACCOUNTS.BANK;
        desc = 'Người dùng nạp tiền mặt vào tài khoản hệ thống - chuyển khoản'
      }
      Account.findOne({ user: user, type: userType }).then(userAccount => {
        if (!userAccount) return reject({ err: 3, desc: 'account not exists' });
        Journal.debit({ account: destAccount, refAccount: userAccount.id, debit: amount, desc, object: transaction, createdBy: officer.id }).then(rs => {
          Journal.credit({ account: userAccount.id, refAccount: destAccount, credit: amount, desc, object: transaction, createdBy: officer.id }).then(rs => {
            Transaction.create({ source: userAccount.id, value: amount, desc: 'Nạp tiền vào tài khoản', state: 'done' }).then(rs => {
              resolve();
              Push.pushUpdateBalance({ user, type: userAccount.type });
            }, err => {
            });
          })
        })
      });
    })
  },

  cashOut: (opts) => {
    return new Promise((resolve, reject) => {
      let { user, amount, userType, officer } = opts;
      if (!user || !amount || !userType || !officer) return reject({ err: 1, msg: 'invalid params' });
      amount = Number(amount);
      let desc = 'Rút tiền mặt tại điểm giao dịch';
      Account.findOne({ user: user, type: userType }).then(userAccount => {
        if (!userAccount) return reject({ err: 3, desc: 'account not exists' });
        if (userAccount.balance < amount) return reject({ err: 3, msg: 'insufficent fund' });
        Journal.credit({ account: Account.ACCOUNTS.CASH, refAccount: userAccount.id, credit: amount, desc, object: officer.id, createdBy: officer.id }).then(rs => {
          Journal.debit({ account: userAccount.id, refAccount: Account.ACCOUNTS.CASH, debit: amount, desc, object: officer.id, createdBy: officer.id }).then(rs => {
            Transaction.create({ source: userAccount.id, value: amount, desc, state: 'done' }).then(rs => {
              resolve();
              Push.pushUpdateBalance({ user, type: userAccount.type });
            }, err => {
            });
          })
        })
      });
    })
  },

  payOrder: (opts) => {
    return new Promise((resolve, reject) => {
      let { order } = opts;
      log.log2File('account', `payOrder - orderid = ${order.id} & paymentMethod = ${order.paymentMethod}`);
      switch (order.paymentMethod) {
        case '0': return payOrderByCash(opts);
        case '1': return payOrderByAccount(opts);
        default:
          Push.pushOrderRemindPayOtp({ order });
          break;
      }
    });
  },

  payOrderByCard: (opts) => {
    return new Promise((resolve, reject) => {
      let { order } = opts;
      let cardId = order.paymentMethod;
      //find card
      Card.findOne({ id: cardId }).then(card => {
        if (!card) return reject({ err: 3, desc: "cannot find card" });
        //find customer
        // let desc = 
        Customer.findOne({ id: order.customer }).then(customer => {
          log.log2File('account', `payOrderByCard - orderid = ${order.id} & customer = ${customer.id} (${customer.name}) & cardid = ${cardId} & area = ${card.area}`)
          if (card.area == 'domestic') {
            payment.pay(card, order.price, customer, order).then(trans => {
              resolve(trans);
            }, err => {
              reject(err);
            })
          } else { //international
            payment.interPay(card, order.price, customer, order).then(rs => {
              resolve(rs);
            }, err => {
              reject(err);
            })
          }
        })
      })
    })
  },
  finishOrderOnlinePayment: (opts) => {
    return new Promise((resolve, reject) => {
      let { order, createdBy } = opts;
      log.log2File('account', `finishOrderOnlinePayment - orderid = ${order.id} & createdBy = ${createdBy}`);
      //find partner account
      Account.findOne({ user: order.partner, type: 'partner' }).then(partnerAccount => {
        Job.getPaymentFee({ order }).then(fee => {
          let income = (order.price - fee) * Conf.data.VNN_FEE;
          let partnerMoney = order.price - fee - income;
          let desc = 'Thu phí đơn hàng - tính thu nhập cho đối tác';
          Journal.debit({ account: Account.ACCOUNTS.BANK, refAccount: partnerAccount.id, debit: order.price - fee, desc, object: order.id, createdBy }).then(rs => {
            Journal.credit({ account: Account.ACCOUNTS.INCOME, refAccount: Account.ACCOUNTS.BANK, credit: income, desc, object: order.id, createdBy }).then(rs => {
              Journal.credit({ account: partnerAccount.id, refAccount: Account.ACCOUNTS.BANK, credit: partnerMoney, desc, object: order.id, createdBy }).then(rs => {
                Transaction.create({ source: partnerAccount.id, value: partnerMoney, desc: 'Thanh toán hoàn thành công việc', state: 'done' }).then(rs => {
                  Push.pushUpdateBalance({ user: order.partner, type: 'partner' });
                  pubsub.publish('ORDER.PAID', { order });
                  resolve();
                }, err => {
                });
              })
            });
          })
        })
      })
    })
  },
  activeInviteCode: (opts) => {
    return new Promise((resolve, reject) => {
      let { user, code, type } = opts;
      let owner = code.owner;
      Account.findOne({ type, user }).then(userAccount => {
        Account.findOne({ type, user: owner }).then(ownerAccount => {
          let desc = 'Tặng tài khoản sử dụng mã giới thiệu';
          Journal.debit({ account: Account.ACCOUNTS.PAYABLE, refAccount: `${userAccount.id}-${ownerAccount.id}`, debit: Conf.data.INVITE_CODE_GIFT + Conf.data.INVITE_CODE_GIFT_OWNER, desc, object: code.code, createdBy: user }).then(() => {
            Journal.credit({ account: userAccount.id, refAccount: Account.ACCOUNTS.PAYABLE, credit: Conf.data.INVITE_CODE_GIFT, desc, object: code.code, createdBy: user }).then(() => {
              Journal.credit({ account: ownerAccount.id, refAccount: Account.ACCOUNTS.PAYABLE, credit: Conf.data.INVITE_CODE_GIFT_OWNER, desc, object: code.code, createdBy: user }).then(() => {
                Transaction.create({ source: userAccount.id, value: Conf.data.INVITE_CODE_GIFT, desc, state: 'done' }).then(rs => {
                  Transaction.create({ source: ownerAccount.id, value: Conf.data.INVITE_CODE_GIFT, desc, state: 'done' }).then(rs => {
                    Push.pushUpdateBalance({ user, type });
                    Push.pushUpdateBalance({ user: owner, type });
                    resolve();
                  });
                });

              })
            })
          })
        })
      });
    })
  },
  initialize: () => {
    return new Promise((resolve, reject) => {
      //create list accounts
      let accounts = [{
        id: Account.ACCOUNTS.CASH,
        balance: 0,
        name: 'CASH',
        accounting: 'assets'
      }, {
        id: Account.ACCOUNTS.TEMP,
        balance: 0,
        name: 'TEMP',
      }, {
        id: Account.ACCOUNTS.BANK,
        balance: 0,
        name: 'BANK',
        accounting: 'assets'
      }, {
        id: Account.ACCOUNTS.PAYABLE,
        balance: 0,
        name: 'PAYABLE',
        accounting: 'assets'
      }, {
        id: Account.ACCOUNTS.INCOME,
        balance: 0,
        name: 'INCOME',
        createdAt: new Date()
      }, {
        id: Account.ACCOUNTS.EXTERNAL,
        balance: 0,
        name: 'EXTERNAL',
        createdAt: new Date()
      }];
      Account.create(accounts).then(rs => {
        resolve();
      });
    });
  }
};

let payOrderByAccount = (opts) => {
  return new Promise((resolve, reject) => {
    let { order } = opts;
    //customer pay by account
    Job.findOne({ id: order.job }).then(job => {
      Account.findOne({ type: 'customer', user: order.customer }).then(customerAccount => {
        Account.findOne({ type: 'partner', user: order.partner }).then(partnerAccount => {
          let income = order.price * 0.15;
          let desc = `Khấu trừ tài khoản khách hàng - Thu phí đơn hàng + tính thu nhập cho đối tác`;
          Journal.credit({ account: Account.ACCOUNTS.INCOME, refAccount: customerAccount.id, credit: income, desc, object: order.id }).then(rs => {
            Journal.credit({ account: partnerAccount.id, refAccount: customerAccount.id, credit: order.price - income, desc, object: order.id }).then(rs => {
              Journal.debit({ account: customerAccount.id, refAccount: `${partnerAccount.id},${Account.ACCOUNTS.INCOME}`, debit: order.price, desc, object: order.id }).then(rs => {
                Transaction.create({ source: partnerAccount.id, value: order.price - income, desc: 'Thanh toán phí đơn hàng', state: 'done' }).then(rs => {
                  Transaction.create({ source: customerAccount.id, value: order.price, desc: 'Thu phí đơn hàng', state: 'done' }).then(rs => { });
                  Push.pushUpdateBalance({ user: order.customer, type: 'customer' });
                  Push.pushUpdateBalance({ user: order.partner, type: 'partner' });
                  pubsub.publish('ORDER.PAID', { order });
                  resolve();
                }, err => {
                })
              })
            })
          })
        });
      });
    });
  })
}
let payOrderByCash = (opts) => {
  return new Promise((resolve, reject) => {
    let { order, createdBy } = opts;
    //find partner account

    Account.findOne({ user: order.partner, type: 'partner' }).then(partnerAccount => {
      let income = order.price * Conf.data.VNN_FEE;
      let desc = 'Thu phí đơn hàng - tính thu nhập cho đối tác';
      Journal.credit({ account: Account.ACCOUNTS.INCOME, refAccount: partnerAccount.id, credit: income, desc, object: order.id, createdBy }).then(rs => {
        Journal.debit({ account: partnerAccount.id, refAccount: Account.ACCOUNTS.INCOME, debit: income, desc, object: order.id, createdBy }).then(rs => {
          Transaction.create({ source: partnerAccount.id, value: income, desc: 'Khấu trừ thực hiện đơn hàng', state: 'done' }).then(rs => {
            Push.pushUpdateBalance({ user: order.partner, type: 'partner' });
            pubsub.publish('ORDER.PAID', { order });
            resolve();
          }, err => {
          })
        })
      });
    })
  })
}