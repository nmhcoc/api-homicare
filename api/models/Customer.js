/**
 * Customer.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const objectid = require('mongodb').ObjectId;
module.exports = {

  attributes: {
    name: { type: 'string', size: 50, required: true },
    gender: { type: 'integer', defaultsTo: 1 },
    phone: { type: 'string', size: 20, unique: true, required: true },
    birth: { type: 'datetime' },
    address: { type: 'string', defaultsTo: '' },
    email: { type: 'email', defaultsTo: '' },
    avatar: { type: 'string', defaultsTo: 'profile/default_avatar.png' },
    firebaseToken: { type: 'string' },
    averangeRating: { type: 'float', defaultsTo: 0 },
    nOrderCancelled: { type: 'integer', defaultsTo: 0 },
    lastOnlineAt: { type: 'datetime' },
    latitude: { type: 'float', defaultsTo: 0 },
    longitude: { type: 'float', defaultsTo: 0 },
    nReport: { type: 'integer', defaultsTo: 0 },
    nRate: { type: 'integer', defaultsTo: 0 },
    totalRate: { type: 'integer', defaultsTo: 0 },
    averangeRate: { type: 'float', defaultsTo: 5 },
    isBlock: { type: 'boolean', defaultsTo: false },
    blockedAt: { type: 'datetime' },
    balance: { type: 'integer', defaultsTo: 0 },
    refBalance: { type: 'integer', defaultsTo: 0 },
    loyaltyPoint: { type: 'integer', defaultsTo: 0 },
    nOrder: { type: 'integer', defaultsTo: 0 },
    nCancel: { type: 'integer', defaultsTo: 0 },
    nPartnerCancel: { type: 'integer', defaultsTo: 0 },
    totalSpend: { type: 'integer', defaultsTo: 0 },
    inviteCode: { type: 'string' },
    unreadNotification: { type: 'integer', defaultsTo: 0 },
    deleteAllInfo: function () {
      return new Promise((resolve, reject) => {
        let promises = [];
        //delete account
        promises.push(new Promise((resolve, reject) => {
          Account.destroy({ user: this.id, type: 'customer' }).then(() => {
            resolve();
          })
        }))
        //delete auth
        promises.push(new Promise((resolve, reject) => {
          Auth.destroy({ customer: this.id }).then(() => {
            resolve();
          })
        }))
        //delete order
        promises.push(new Promise((resolve, reject) => {
          Order.destroy({
            or: [{
              customer: this.id
            }, {
              partner: this.id
            }]
          }).then(() => {
            resolve();
          })
        }))
        //delete invite code
        promises.push(new Promise((resolve, reject) => {
          InviteCode.destroy({ owner: this.id, type: 'customer' }).then(() => {
            resolve();
          })
        }))
        //delete customer
        promises.push(new Promise((resolve, reject) => {
          Customer.destroy({ id: this.id }).then(() => {
            resolve();
          })
        }))
        Promise.all(promises).then(() => {
          resolve();
        })
      })

    },
    bloodType: { type: 'string' },
    height: { type: 'float' },
    weight: { type: 'float' },
    allergic: { type: 'string' },
    chronicDiseases: { type: 'string' },
    addRate: function (order, rate) {
      return new Promise((resolve, reject) => {
        if (!this.nRate) this.nRate = 0;
        if (!this.totalRate) this.totalRate = 0;
        if (!this.totalTime) this.totalTime = 0;
        if (!this.averangeRating) this.averangeRating = 0;
        this.nRate++;
        this.totalRate += rate;
        this.totalTime += order.duration;
        this.averangeRating = this.totalRate / this.nRate;
        this.save().then(rs => {
          resolve();
        }, err => {
          reject();
        })
      })

    }
  },
  increaseDetail: (customer, opts) => {
    return new Promise((resolve, reject) => {
      Customer.native((err, collection) => {
        collection.update({ _id: objectid(customer) }, {
          $set: {
            updatedAt: new Date()
          },
          $inc: opts
        }).then(() => {
          resolve();
        }, err => {
          reject();
        })
      })
    })
  },
  createCustomer: (opts) => {
    return new Promise((resolve, reject) => {
      let { name, phone, password, birth, address, email, avatar, inviteCode, code } = opts;
      if (!auth.checkPasswordStrength(password)) return reject({ err: 8, msg: 'ERR_WEAK_PASSWORD' });
      Customer.findOne({ phone }).then(oldUser => {
        if (oldUser) return reject({ err: 1, msg: 'ERR_USER_EXISTS' });
        Customer.create({ name, phone, birth, address, email, avatar, inviteCode }).then(user => {
          Auth.createAuth({ type: 'customer', phone, password, customer: user.id }).then(auth => {
            Account.create({ user: user.id, type: 'customer' }).then(account => {
              resolve({ user, auth, account });
            });
          });
        }, err => {
          console.error("Create customer error", JSON.stringify(err));
          reject(err)
        })
      })
    })
  },
  bootstrap: () => {
    pubsub.subscribe('ORDER.PAID', function (msg, data) {
      let { order } = data;
      Customer.increaseDetail(order.customer, { totalSpend: order.price }).then(() => {
        log.file('customer', `[ON ORDER PAID => INCREASE TOTAL SPEND] [CUSTOMER: ${order.customer}] [ORDER: ${order.id}]`);
        log.log2File('customer', `bootstrap - orderid = ${order.id} & event = ORDER.PAID & customer = ${order.customer} & opts = { totalSpend: ${order.price} }`);
      });
    });
    pubsub.subscribe('ORDER.CREATED', function (msg, data) {
      let { order } = data;
      Customer.increaseDetail(order.customer, { nOrder: 1 }).then(() => {
        log.file('customer', `[ON ORDER CREATED => INCREASE NUMBER ORDER] [CUSTOMER: ${order.customer}] [ORDER: ${order.id}`);
        log.log2File('customer', `bootstrap - orderid = ${order.id} & event = ORDER.CREATED & customer = ${order.customer} & opts = { nOrder: 1 }`);
      });
    });
    pubsub.subscribe('ORDER.PARTNER_CANCEL', function (msg, data) {
      let { order } = data;
      Customer.increaseDetail(order.customer, { nOrder: 1 }).then(() => {
        log.file('customer', `[ON PARTNER CANCEL => INCREASE NUMBER PARTNER CANCEL] [CUSTOMER: ${order.customer}] [ORDER: ${order.id}`);
        log.log2File('customer', `bootstrap - orderid = ${order.id} & event = ORDER.PARTNER_CANCEL & customer = ${order.customer} & opts = { nOrder: 1 }`);
      });
    });
    pubsub.subscribe('ORDER.CUSTOMER_CANCEL', function (msg, data) {
      let { order } = data;
      Customer.increaseDetail(order.customer, { nCancel: 1 }).then(() => {
        log.file('customer', `[ON CUSTOMER CANCEL => INCREASE NUMBER CANCEL] [CUSTOMER: ${order.customer}] [ORDER: ${order.id}`);
        log.log2File('customer', `bootstrap - orderid = ${order.id} & event = ORDER.CUSTOMER_CANCEL & customer = ${order.customer} & opts = { nCancel: 1 }`);
      });
    });
  }
};

