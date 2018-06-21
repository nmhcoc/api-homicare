/**
 * Token.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
let moment = require('moment');
module.exports = {
  EXPIRE: 86400,
  attributes: {
    type: {
      type: 'string',
      required: true
    },
    client: {
      type: 'string',
      required: true,
      enum: ['customer', 'partner', 'officer']
    },
    token: {
      type: 'string',
      required: true
    },
    expiredAt: {
      type: 'datetime',
      required: true
    },
    customer: {
      type: 'string'
    },
    partner: {
      type: 'string'
    },
    officer: {
      type: 'string'
    }
  },
  createNewToken: (user, type, client) => {
    return new Promise((resolve, reject) => {
      let token = sails.services.auth.createTokenString();
      let expiredAt = moment().add(Conf.data.TOKEN_EXPIRE, 'days').toDate();
      let data = {
        type, client, token, expiredAt
      };
      switch (client) {
        case 'customer':
          data.customer = user;
          break;
        case 'partner':
          data.partner = user;
          break;
        case 'officer':
          data.officer = user;
          break;

      }
      Token.create(data).then(token => {
        resolve(token);
      }, err => {
        reject(err);
      })
    })
  },
  removeExpiredToken: () => {
    Token.destroy({ expiredAt: { '<': new Date() } }).then(rs => { })
  }
};

