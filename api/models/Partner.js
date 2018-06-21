/**
 * Partner.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const objectid = require('mongodb').ObjectId; 4
const moment = require('moment');
module.exports = {

  attributes: {
    name: { type: 'string', size: 100, required: true },
    gender: { type: 'integer', defaultsTo: 1 },
    phone: { type: 'string', size: 20, unique: true, required: true },
    birth: { type: 'datetime', },
    address: { type: 'string', },
    email: { type: 'email', },
    avatar: { type: 'string', defaultsTo: 'profile/default_avatar.png' },
    approved: { type: 'boolean', defaultsTo: false, required: true },
    firebaseToken: { type: 'string' },
    isOnline: { type: 'boolean', defaultsTo: false },
    jobs: { type: 'array', defaultsTo: [] },
    averangeRate: { type: 'float', defaultsTo: 5 },
    experience: { type: 'integer' },
    category: { type: 'string' },
    nOrderCancelled: { type: 'integer', defaultsTo: 0 },
    nOrderDenied: { type: 'integer', defaultsTo: 0 },
    lastOnlineAt: { type: 'datetime' },
    latitude: { type: 'float', defaultsTo: 0 },
    longitude: { type: 'float', defaultsTo: 0 },
    nReport: { type: 'integer', defaultsTo: 0 },
    totalTime: { type: 'integer', defaultsTo: 0 },
    nRate: { type: 'integer', defaultsTo: 0 },
    totalRate: { type: 'integer', defaultsTo: 0 },
    averangeRating: { type: 'float', defaultsTo: 0 },
    nearestRate: {type:'json', defaultsTo:[]},
    idNumber: { type: 'string' },
    certificate: { type: 'array' },
    identityCard: { type: 'string' },
    isBlock: { type: 'boolean', defaultsTo: false },
    approvedAt: { type: 'datetime' },
    approvedBy: { type: 'string' },
    blockedAt: { type: 'datetime' },
    blockedBy: { type: 'string' },
    unblockedBy: { type: 'string' },
    //deprecate
    districtsOfWorking: { type: 'array' },
    balance: { type: 'integer', defaultsTo: 0 },
    refBalance: { type: 'integer', defaultsTo: 0 },
    inviteCode: { type: 'string' },
    unreadNotification: { type: 'integer', defaultsTo: 0 },
    agency: { type: 'string', defaultsTo: '' },
    deleteAllInfo: function () {
      return new Promise((resolve, reject) => {
        let promises = [];
        //delete account
        promises.push(new Promise((resolve, reject) => {
          Account.destroy({ user: this.id, type: 'partner' }).then(() => {
            resolve();
          })
        }))
        //delete auth
        promises.push(new Promise((resolve, reject) => {
          Auth.destroy({ partner: this.id }).then(() => {
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
          InviteCode.destroy({ owner: this.id, type: 'partner' }).then(() => {
            resolve();
          })
        }))
        //delete partner
        promises.push(new Promise((resolve, reject) => {
          Partner.destroy({ id: this.id }).then(() => {
            resolve();
          })
        }))
        Promise.all(promises).then(() => {
          resolve();
        })
      })

    },
    //deprecated
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

    },

    //author: chuongla
    addRate: function(order, rate, rateString){
      return new Promise((resolve, reject) => {
        if (!this.nRate) this.nRate = 0;
        if (!this.totalRate) this.totalRate = 0;
        if (!this.totalTime) this.totalTime = 0;
        if (!this.averangeRating) this.averangeRating = 0;
        this.nRate++;
        this.totalRate += rate;
        this.totalTime += order.duration;
        this.averangeRating = this.totalRate / this.nRate;
        if(!this.nearestRate)
          this.nearestRate = [];
        //chi luu 3 rate gan nhat, thu tu tu newest => oldest, neu qua 3 rate thi xoa bo cai cu
        if(this.nearestRate.length >= 3)
          this.nearestRate.splice(2, 1);
        // this.nearestRate.splice(0, 0, {customer: order.customer, rate, rateString});
        
        let thisPartner = this;
        Customer.findOne({id: order.customer}).then((c) => {
          thisPartner.nearestRate.splice(0, 0, {customer: c.name, rate, rateString});
          thisPartner.save().then(rs => {
            resolve();
          }, err => {
            reject();
          })
        })
        // this.save().then(rs => {
        //   resolve();
        // }, err => {
        //   reject();
        // })
      })
    }
  },
  increaseDetail: (partner, opts) => {
    return new Promise((resolve, reject) => {
      Partner.native((err, collection) => {
        collection.update({ _id: objectid(partner) }, {
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
  increasePartner: (partnerId, opts) => {
    return new Promise((resolve, reject) => {
      Partner.native((err, collection) => {
        collection.update({ _id: objectid(partnerId) }, {
          $inc: opts
        }).then(rs => {
          resolve();
        })
      })
    })
  },
  createPartner: (opts) => {
    return new Promise((resolve, reject) => {
      let { name, phone, password, birth, address, email, avatar, inviteCode, code, jobs, gender } = opts;
      if (!auth.checkPasswordStrength(password)) return reject({ err: 8, msg: 'ERR_WEAK_PASSWORD' });
      Partner.findOne({ phone }).then(oldUser => {
        if (oldUser) return reject({ err: 1, msg: 'ERR_USER_EXISTS' });
        Partner.create({ name, phone, birth, address, email, avatar, jobs, inviteCode, gender }).then(user => {
          Auth.createAuth({ type: 'partner', phone, password, partner: user.id }).then(auth => {
            Account.create({ user: user.id, type: 'partner' }).then(account => {
              resolve({ user, auth, account });
            });
          });
        }, err => {
          console.error("Create partner error", JSON.stringify(err));
          reject()
        })
      })
    })
  },
  setOfflinePartners: () => {
    let time = moment().add(-60, 'seconds').toDate();
    Partner.update({ lastOnlineAt: { '<': time } }, { isOnline: false }).then(rs => { });
    //log.log2File('partner', `setOfflinePartners`);
  },
  bootstrap: () => {
    pubsub.subscribe('ORDER.PAID', function (msg, data) {
      let { order } = data;
      log.log2File('partner', `bootstrap - orderid = ${order.id} & event = ORDER.PAID & partner = ${order.partner}`);
    });

    pubsub.subscribe('ORDER.CUSTOMER_REPORT', function (msg, data) {
      let { order } = data;
      Partner.increaseDetail(order.partner, { nReport: 1 }).then(() => {
        log.file('partner', `[ON ORDER REPORT => INCREASE NUMBER REPORT] [PARTNER: ${order.partner}] [ORDER: ${order.id}]`);
        log.log2File('partner', `bootstrap - orderid = ${order.id} & event = ORDER.CUSTOMER_REPORT & partner = ${order.partner}`);
      });
    });
    pubsub.subscribe('ORDER.PARTNER_DENY', function (msg, data) {
      let { order } = data;
      Partner.increaseDetail(order.partner, { nOrderDenied: 1 }).then(() => {
        log.file('partner', `[ON ORDER DENY => INCREASE NUMBER ORDER DENIED] [PARTNER: ${order.partner}] [ORDER: ${order.id}]`);
        log.log2File('partner', `bootstrap - orderid = ${order.id} & event = ORDER.PARTNER_DENY & partner = ${order.partner}`);
      });
    });
    // pubsub.subscribe('ORDER.PARTNER_DENY', function (msg, data) {
    //   let { order } = data;
    //   Partner.increaseDetail(order.partner, { nOrderDenied: 1 }).then(() => {
    //     log.file('partner', `[ON ORDER DENY => INCREASE NUMBER ORDER DENIED] [PARTNER: ${order.partner}] [ORDER: ${order.id}]`);
    //   });
    // });
  }
};

