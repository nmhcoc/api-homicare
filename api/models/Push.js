/**
 * Push.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
let FCM = require('fcm-node');
const moment = require('moment');
let pushNotification = (type, message) => {
  let serverKey = Conf.data.FIREBASE_PARTNER;
  switch (type) {
    case 'customer':
      serverKey = Conf.data.FIREBASE_CUSTOMER;
      break;
    case 'partner':
      serverKey = Conf.data.FIREBASE_PARTNER;
      break;
  }
  var fcm = new FCM(serverKey);
  return new Promise((resolve, reject) => {
    if (!message.notification.sound) message.notification.sound = 'default';
    if (!message.notification.vibrate) message.notification.vibrate = 'default';
    fcm.send(message, function (err, response) {
      log.file('push', `[${moment().format()}] [MESSAGE: ${JSON.stringify(message)}] [ERR: ${JSON.stringify(err)}] [RESPONSE: ${JSON.stringify(response)}]`);
      if (!err) {
        resolve();
      } else {
        reject(err);
      }
    });
  })
}
module.exports = {
  PUSH_FLAG: {
    CUSTOMER: {
      PARTNER_FOUND: 1,
      PARTNER_NOTFOUND: 2,
      REMIND_START_TIME: 3,
      PARTNER_FINISH_JOB: 4,
      PARTNER_CANCEL_JOB: 5,
      REMIND_CONFIRM_PAY: 6,
      PARTNER_START_JOB: 7,
      BALANCE_UPDATED: 8,
      LOYALTY_UPDATED: 9
    },
    PARTNER: {
      NEW_JOB: 1,
      REMIND_START_TIME: 2,
      CUSTOMER_CANCEL_JOB: 3,
      REMIND_END_TIME: 4,
      BALANCE_UPDATED: 5
    }
  },
  attributes: {
    type: { type: 'string', enum: ['customer', 'partner'] },
    user: { type: 'string' },
    status: { type: 'string' },
    result: { type: 'string' },
    firebaseToken: { type: 'string' },
    message: { type: 'string' }
  },
  pushOrderAccept: (opts) => {
    let { order } = opts;
    if (!order) return reject();
    return new Promise((resolve, reject) => {
      Customer.findOne({ id: order.customer }).then(customer => {
        Partner.findOne({ id: order.partner }).then(partner => {
          let msg = {
            to: customer.firebaseToken,
            notification: {
              title: sails.__('PARTNER_FOUND_TITLE'),//'Đã tìm được người nhận việc',
              body: sails.__('PARTNER_FOUND_BODY')
            },
            data: {
              partner,
              flag: Push.PUSH_FLAG.CUSTOMER.PARTNER_FOUND
            }
          }
          pushNotification('customer', msg).then(() => { }, () => { });

          log.log2File('push', `pushOrderAccept - orderid = ${order.id} & partner = ${partner.id} (${partner.name}) & customer = ${customer.id} (${customer.name})`);
        })
      })

    })
  },

  pushOrderStart: (opts) => {
    return new Promise((resolve, reject) => {
      let { order } = opts;
      if (!order) return reject();
      Customer.findOne({ id: order.customer }).then(customer => {
        Partner.findOne({ id: order.partner }).then(partner => {
          let msg = {
            to: customer.firebaseToken,
            notification: {
              title: sails.__('PARTNER_START_JOB_TITLE'),//'Nhân viên bắt đầu làm việc',
              body: sails.__('PARTNER_START_JOB_BODY')
            },
            data: {
              partner,
              order,
              flag: Push.PUSH_FLAG.CUSTOMER.PARTNER_START_JOB
            }
          }
          pushNotification('customer', msg).then(() => { }, () => { });

          log.log2File('push', `pushOrderStart - orderid = ${order.id} & partner = ${partner.id} (${partner.name}) & customer = ${customer.id} (${customer.name})`);
        })
      })
    })
  },

  pushOrderFinish: (opts) => {
    return new Promise((resolve, reject) => {
      let { order } = opts;
      if (!order) return reject();
      Customer.findOne({ id: order.customer }).then(customer => {
        Partner.findOne({ id: order.partner }).then(partner => {
          let msg = {
            to: customer.firebaseToken,
            notification: {
              title: sails.__('PARTNER_FINISH_JOB_TITLE'),//'Nhân viên hệ thống đã hoàn thành công việc',
              body: sails.__('PARTNER_FINISH_JOB_BODY')
            },
            data: {
              partner,
              order,
              flag: Push.PUSH_FLAG.CUSTOMER.PARTNER_FINISH_JOB
            }
          }
          pushNotification('customer', msg).then(() => { }, () => { });

          log.log2File('push', `pushOrderFinish - orderid = ${order.id} & partner = ${partner.id} (${partner.name}) & customer = ${customer.id} (${customer.name})`);
        })
      })
    })
  },

  pushOrderCannotFindPartner: (opts) => {
    return new Promise((resolve, reject) => {
      let { order } = opts;
      if (!order) return reject();
      Customer.findOne({ id: order.customer }).then(customer => {
        if (!customer) return;
        let msg = {
          to: customer.firebaseToken,
          notification: {
            title: sails.__('PUSH_CANNOT_FIND_PARTNER_TITLE'),
            body: sails.__('PUSH_CANNOT_FIND_PARTNER_BODY')
          },
          data: {
            flag: Push.PUSH_FLAG.CUSTOMER.PARTNER_NOTFOUND
          }
        }
        pushNotification('customer', msg).then(() => { }, () => { });
        log.log2File('push', `pushOrderCannotFindPartner - orderid = ${order.id} & customer = ${customer.id} (${customer.name})`);
      })
    })
  },
  pushOrderPartnerCancel: (opts) => {
    return new Promise((resolve, reject) => {
      let { order } = opts;
      if (!order) return reject();
      Customer.findOne({ id: order.customer }).then(customerInfo => {
        Partner.findOne({ id: order.partner }).then(partner => {
          if (!customerInfo) return;
          let msg = {
            to: customerInfo.firebaseToken,
            notification: {
              title: sails.__('PUSH_CUSTOMER_CANCEL_TITLE'),
              body: sails.__('PUSH_CUSTOMER_CANCEL_BODY')
            },
            data: {
              partner,
              order,
              flag: Push.PUSH_FLAG.CUSTOMER.PARTNER_CANCEL_JOB
            }
          }
          pushNotification('customer', msg).then(() => {
            resolve();
          }, () => {
            reject()
          });

          log.log2File('push', `pushOrderPartnerCancel - orderid = ${order.id} & partner = ${partner.id} (${partner.name}) & customer = ${customerInfo.id} (${customerInfo.name})`);
        })
      })
    })
  },
  pushOrderCustomerCancel: (opts) => {
    return new Promise((resolve, reject) => {
      let { order } = opts;
      if (!order) return reject();
      Partner.findOne({ id: order.partner }).then(partnerInfo => {
        Customer.findOne({ id: order.customer }).then(customer => {
          if (!partnerInfo) return console.log('cannot find customer to push');
          let msg = {
            to: partnerInfo.firebaseToken,
            notification: {
              title: sails.__('PUSH_CUSTOMER_CANCEL_TITLE'),
              body: sails.__('PUSH_CUSTOMER_CANCEL_BODY')
            },
            data: {
              customer,
              order,
              flag: Push.PUSH_FLAG.PARTNER.CUSTOMER_CANCEL_JOB
            }
          }
          pushNotification('partner', msg).then(() => {
            resolve();
          }, () => {
            reject()
          });

          log.log2File('push', `pushOrderCustomerCancel - orderid = ${order.id} & customer = ${customer.id} (${customer.name}) & partner = ${partnerInfo.id} (${partnerInfo.name})`);
        })
      })
    })
  },
  pushLoyaltyUpdated: (user) => {
    return new Promise((resolve, reject) => {
      let msg = {
        to: user.firebaseToken,
        notification: {
          title: sails.__('LOYALTY_UPDATED_TITLE'),
          body: sails.__('LOYALTY_UPDATED_BODY')
        },
        data: {
          flag: Push.PUSH_FLAG.CUSTOMER.LOYALTY_UPDATED,
          user
        }
      }
      pushNotification('customer', msg).then(() => { }, () => { });
      log.log2File('push', `pushLoyaltyUpdated - userid = ${user.id} (${user.name})`);
    })
  },
  pushOrderRemindPayOtp: (opts) => {
    return new Promise((resolve, reject) => {
      let { order } = opts;
      if (!order) return reject();
      Customer.findOne({ id: order.customer }).then(customerInfo => {
        Partner.findOne({ id: order.partner }).then(partner => {
          if (!customerInfo) return reject();
          let msg = {
            to: customerInfo.firebaseToken,
            notification: {
              title: sails.__('REMIND_PAY_ORDER_TITLE'),
              body: sails.__('REMIND_PAY_ORDER_BODY')
            },
            data: {
              flag: Push.PUSH_FLAG.CUSTOMER.REMIND_CONFIRM_PAY,
              order: Object.assign({}, order, { customer: customerInfo, partner }),
            }
          }
          pushNotification('customer', msg).then(() => { }, () => { });

          log.log2File('push', `pushOrderRemindPayOtp - orderid = ${order.id} & customer = ${customerInfo.id} (${customerInfo.name}) & partner = ${partner.id} (${partner.name})`);
        })
      })
    })
  },
  pushOrderOnTime: (opts) => {
    return new Promise((resolve, reject) => {
      let { order } = opts;
      if (!order) return reject();
      Partner.findOne({ id: order.partner }).then(partnerInfo => {
        Customer.findOne({ id: order.customer }).then(customerInfo => {
          if (!partnerInfo || !customerInfo) return reject();
          //push to partner
          let msg = {
            to: partnerInfo.firebaseToken,
            notification: {
              title: sails.__('PUSH_ORDER_ONTIME_TITLE'),
              body: sails.__('PUSH_ORDER_ONTIME_BODY')
            },
            data: {
              customer: customerInfo,
              order,
              flag: Push.PUSH_FLAG.PARTNER.REMIND_START_TIME
            }
          }
          pushNotification('partner', msg).then(() => { }, () => { });
          //push to customer
          msg = {
            to: customerInfo.firebaseToken,
            notification: {
              title: sails.__('PUSH_ORDER_ONTIME_TITLE_CUSTOMER'),
              body: sails.__('PUSH_ORDER_ONTIME_BODY_CUSTOMER')
            },
            data: {
              partner: partnerInfo,
              order,
              flag: Push.PUSH_FLAG.CUSTOMER.REMIND_START_TIME
            }
          }
          pushNotification('customer', msg).then(() => { }, () => { });

          log.log2File('push', `pushOrderOnTime - orderid = ${order.id} & customer = ${customerInfo.id} (${customerInfo.name}) & partner = ${partnerInfo.id} (${partnerInfo.name})`);
        })
      })
    })
  },
  pushUpdateBalance: (opts) => {

    let { type, user } = opts;
    log.file('push', `[UPDATE BALANCE] [type: ${type}] [user: ${user}]`)
    new Promise((resolve, reject) => {
      switch (type) {
        case 'customer':
          Customer.findOne({ id: user }).then(user => resolve(user));
          break;
        case 'partner':
          Partner.findOne({ id: user }).then(user => resolve(user));
          break;
      }
    }).then(user => {
      let msg = {};
      switch (type) {
        case 'customer':
          msg = {
            to: user.firebaseToken,
            notification: {
              title: sails.__('PUSH_BALANCE_UPDATE_TITLE'),
              body: sails.__('PUSH_BALANCE_UPDATE_BODY')
            },
            data: {
              flag: Push.PUSH_FLAG.CUSTOMER.BALANCE_UPDATED
            }
          }
          break;
        case 'partner':
          msg = {
            to: user.firebaseToken,
            notification: {
              title: sails.__('PUSH_BALANCE_UPDATE_TITLE'),
              body: sails.__('PUSH_BALANCE_UPDATE_BODY')
            },
            data: {
              flag: Push.PUSH_FLAG.PARTNER.BALANCE_UPDATED
            }
          }
          break;
      }
      pushNotification(type, msg).then(() => { }, () => { });

      log.log2File('push', `pushUpdateBalance - type = ${type} & userid = ${user.id} (${user.name})`);
    })
  },
  pushNewJob: (opts) => {
    return new Promise((resolve, reject) => {
      let { order } = opts;
      if (!order) return reject();
      Partner.findOne({ id: order.partner }).then(partnerInfo => {
        Customer.findOne({ id: order.customer }).then(customerInfo => {
          if (!partnerInfo || !customerInfo) return reject();
          let msg = {
            to: partnerInfo.firebaseToken,
            notification: {
              title: sails.__('PUSH_NEW_JOB_TITLE'),
              body: sails.__('PUSH_NEW_JOB_BODY')
            },
            data: Object.assign({}, order, {
              flag: Push.PUSH_FLAG.PARTNER.NEW_JOB,//new job
              customer: customerInfo,
              orderId: order.id
            })
          }
          pushNotification('partner', msg).then(() => {
            resolve();
          }, () => {
            reject();
          });

          log.log2File('push', `pushNewJob - orderid = ${order.id} & partner = ${partnerInfo.id} (${partnerInfo.name}) & customer = ${customerInfo.id} (${customerInfo.name})`);
        })
      })
    })
  },
  bootstrap: () => {
    pubsub.subscribe('ORDER.FINISHED', (msg, data) => {
      let { order } = data;
      Push.pushOrderFinish({ order });
    })
    pubsub.subscribe('ORDER.PARTNER_START', (msg, data) => {
      let { order } = data;
      Push.pushOrderStart({ order });
    })
    pubsub.subscribe('ORDER.PARTNER_CANCEL', (msg, data) => {
      let { order } = data;
      Push.pushOrderPartnerCancel({ order });
    })
    pubsub.subscribe('ORDER.CUSTOMER_CANCEL', (msg, data) => {
      let { order } = data;
      Push.pushOrderCustomerCancel({ order });
    })
    pubsub.subscribe('ORDER.CANNOT_FIND_PARTNER', (msg, data) => {
      let { order } = data;
      Push.pushOrderCannotFindPartner({ order });
    })
  },
  pushNotification: pushNotification
};

