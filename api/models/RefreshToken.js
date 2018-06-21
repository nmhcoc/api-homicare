/**
 * Token.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
let moment = require('moment');
module.exports = {
  EXPIRE: 604800,
  attributes: {
    type: {
      type: 'string',
      required: true
    },
    client: {
      type: 'string',
      required: true
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
    },
    renewToken: function () {
      RefreshToken.update(
        {
          id: this.id
        },
        {
          expiredAt: moment().add(Conf.data.REFRESH_TOKEN_EXPIRE, 'days').toDate()
        }).then(rs => {
        })
    }
  },
  createNewToken: (user, type, client) => {
    return new Promise((resolve, reject) => {
      let token = sails.services.auth.createTokenString();
      let expiredAt = moment().add(RefreshToken.EXPIRE, 'seconds').toDate();
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
      RefreshToken.create(data).then(token => {
        resolve(token);
      }, err => {
        reject(err);
      })
    })
  },
  removeExpiredRefreshToken: () => {
    RefreshToken.destroy({ expiredAt: { '<': new Date() } }).then(rs => { })
  },
};

