/**
 * Loyalty.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const request = require('request');
const moment = require('moment');
module.exports = {

  attributes: {
    user: { type: 'string', required: true },
    point: { type: 'integer', defaultsTo: 0 },
    level: { type: 'string', defaultsTo: 'member' },
    levelName: { type: 'string', defaultsTo: 'Thân thiết' },
    calculateRankAt: {
      type: 'datetime', defaultsTo: function () {
        return moment().add(-1, 'years').toDate()
      }
    },
    updateUserPoint: function () {
      return new Promise((resolve, reject) => {
        Customer.update({ id: this.user }, { loyaltyPoint: this.point }).then(() => {
          resolve();
        })
      })
    }
  },
  getToken: (opts) => {
    return new Promise((resolve, reject) => {
      let { user } = opts;
      callMpointApi('/api/merchant/login', { phone: user.phone, merchantKey: Conf.data.MPOINT_MERCHANT_KEY }).then(rs => {
        if (rs.err != 0) return reject(rs);
        if (rs.err == 0) {
          Loyalty.create({ user: user.id, token: rs.token, expiredAt: new Date(rs.expiredAt) }).then(() => {
            resolve(rs.token)
          });
        }
      }, err => {
        reject(err);
      })
    })
  },

  getCode: (opts) => {
    return new Promise((resolve, reject) => {
      let { user, promotionId } = opts;
      Loyalty.getToken({ user }).then(token => {
        let input = {
          promotionId
        };
        callMpointApi('/api/getcode', input, token).then(rs => {
          resolve(rs);
        }, err => {
          resolve(err);
        })
      })
    })
  },
  myPromotions: (opts) => {
    return new Promise((resolve, reject) => {
      let { user, skip, limit } = opts;
      Loyalty.getToken({ user }).then(token => {
        let input = {
          start: skip,
          number: limit
        };
        callMpointApi('/api/listMyPromotions', input, token).then(rs => {
          resolve(rs);
        }, err => {
          resolve(err);
        })
      })
    })
  },
  comment: (opts) => {
    return new Promise((resolve, reject) => {
      let { user, content, promotionId } = opts;
      Loyalty.getToken({ user }).then(token => {
        let input = {
          promotionId, content
        };
        callMpointApi('/api/comment', input, token).then(rs => {
          resolve(rs);
        }, err => {
          resolve(err);
        })
      })
    })
  },
  rate: (opts) => {
    return new Promise((resolve, reject) => {
      let { user, rate, promotionId } = opts;
      Loyalty.getToken({ user }).then(token => {
        let input = {
          promotionId, rate
        };
        callMpointApi('/api/rate', input, token).then(rs => {
          resolve(rs);
        }, err => {
          resolve(err);
        })
      })
    })
  },
  addPointToMpoint: (opts) => {
    return new Promise((resolve, reject) => {
      let url = '/api/merchant/addPointCustomer';
      let { user, point } = opts;
      Customer.findOne({ id: user }).then(customer => {
        let input = {
          phone: customer.phone,
          point,
          merchantKey: Conf.data.MPOINT_MERCHANT_KEY
        }
        callMpointApi(url, input).then(res => {
          resolve(res)
        }, err => {
          reject(err);
        })
      })
    })
  },
  getLoyalty: (user) => {
    return new Promise((resolve, reject) => {
      Loyalty.findOne({ user }).then(loyalty => {
        if (loyalty) return resolve(loyalty);
        reject();
      })
    })
  },
  addPoint: (opts) => {
    return new Promise((resolve, reject) => {
      let { user, point, desc } = opts;
      Loyalty.findOne({ user }).then(loyalty => {
        if (!loyalty) {
          log.file('loyalty', `[CANNOT FIND CUSTOMER LOYALTY] [CUSTOMER: ${user}]`)
          return;
        }
        PointHistory.create({ user, addPoint: point, currentPoint: loyalty.point + point, desc }).then(point => {
          Loyalty.addPointToMpoint({ user, point }).then(res => {
          })
          Loyalty.update({ id: loyalty.id }, { point: loyalty.point + point }).then(() => {
            Customer.update({ id: loyalty.user }, { loyaltyPoint: loyalty.point + point }).then(updated => {
              Push.pushLoyaltyUpdated(updated[0]);
              resolve();
            })
          })
        });
      })
    })
  },
  bootstrap: () => {
    //create unregistered 
    Loyalty.find({}, { select: ['user'] }).then(loyalties => {
      let ids = [];
      loyalties.forEach(l => {
        ids.push(l.user);
      })
      Customer.find({ id: { '!': ids } }).then(customers => {
        let cusIds = [];
        customers.forEach(cus => {
          cusIds.push({ user: cus.id });
        });
        Loyalty.create(cusIds).then(rs => {
          log.file('loyalty', `[CREATE CUSTOMER LOYALTY ENTRY] [${rs}]`);
        })
      })
    })
    pubsub.subscribe('ORDER.PAID', (msg, data) => {
      let { order } = data;
      log.file('loyalty', `[ON CUSTOMER PAID ORDER => ADD POINT] [ORDER: ${order.id}]`);
      let point = Math.floor(order.price * 7 / 100 / 1000);
      log.log2File('loyalty', `bootstrap - orderid = ${order.id} & event = ORDER.PAID & customer = ${order.customer} & point = ${point}`);
      Loyalty.addPoint({ user: order.customer, point, desc: 'Tặng điểm sử dụng dịch vụ' });
    });
    pubsub.subscribe('USER.REGISTER', (msg, data) => {
      let { type, user } = data;
      if (type == 'partner') return;
      Loyalty.create({ user: user.id })
    })
  }
};

let callMpointApi = (url, input, token) => {
  return new Promise((resolve, reject) => {
    let option = {
      method: 'POST',
      uri: `${Conf.data.MPOINT_HOST}${url}`,
      headers: {
        'Authorization': `Bearer ${token}`
      },
      form: input,
    }
    log.file('mpoint', `[REQUEST] [${JSON.stringify(option)}]`)
    request(option, (err, response, body) => {
      log.file('mpoint', `[RESPONSE] [${body}]`)
      if (err) return reject({ err: 2 })
      try {
        body = JSON.parse(body);
        resolve(body);
      } catch (err) {
        return reject();
      }
    })
  })
}

