/**
 * BruteForce.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const moment = require('moment');
module.exports = {
  BRUTE_FORCE: 6,
  attributes: {
    client: { type: 'string', required: true },
    user: { type: 'string', required: true },
    type: { type: 'string', required: true, enum: ['login', 'forgotpasword', 'register'] },
    ip: { type: 'string', required: true },
    count: { type: 'string', required: true, defaultsTo: 1 }
  },

  protectRegister: (opts) => {
    return new Promise((resolve, reject) => {
      let { client, user, ip } = opts;
      BruteForce.findOne({ client, user, ip, type: 'register' }).then(brute => {
        if (!brute) {
          return BruteForce.create({ client, user, type: 'register', ip }).then(brute => {
            resolve(brute);
          })
        }
        if (brute.count < BruteForce.BRUTE_FORCE) {
          brute.count++;
          brute.save().then(() => {
            return resolve(brute);
          });
        } else {
          return reject();
        }
      })
    })
  },
  protectLogin: (opts) => {
    return new Promise((resolve, reject) => {
      let { client, user, ip } = opts;
      BruteForce.findOne({ client, user, ip, type: 'login' }).then(brute => {
        if (!brute) {
          return BruteForce.create({ client, user, type: 'login', ip }).then(brute => {
            resolve(brute);
          })
        }
        if (brute.count < BruteForce.BRUTE_FORCE) {
          brute.count++;
          brute.save().then(() => {
            return resolve(brute);
          });
        } else {
          return reject();
        }
      })
    })
  },
  removeExpiredBruteForce: () => {
    let time = moment().add(30, 'minutes').toDate();
    BruteForce.destroy({ updatedAt: { '<': time } }).then(rs => { });
  }
};