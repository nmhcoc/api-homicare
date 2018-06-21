/**
 * Otp.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
let moment = require('moment');
module.exports = {

  attributes: {
    action: {
      type: 'string',
      required: true
    },
    otp: {
      type: 'string',
      required: true
    },
    expiredAt: {
      type: 'datetime'
    },
    phone: { type: 'string', required: true }
  },
  createNewOtp: (opts) => {
    let { action, time, phone } = opts;
    return new Promise((resolve, reject) => {
      let otp = sails.services.auth.generateOtp();
      time = time ? time : Conf.data.OTP_EXPIRE;
      Otp.create({
        action,
        otp,
        phone,
        expiredAt: moment().add(time, 'seconds').toDate()
      }).then(otp => {
        resolve(otp);
      })
    })
  }
};

