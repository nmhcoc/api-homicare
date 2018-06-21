/**
 * Auth.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  USER_TYPE: {
    CUSTOMER: 1,
    PARTNER: 2,
    OFFICER: 3
  },
  attributes: {
    type: {
      type: 'string',
      enum: ['partner', 'customer', 'officer']
    },
    phone: {
      type: 'string',
      defaultsTo: 'none'
    },
    username: {
      type: 'string'
    },
    password: {
      type: 'string', required: true
    },
    partner: {
      type: 'string'
    },
    customer: {
      type: 'string'
    },
    backend: {
      type: 'string'
    },
    isPasswordValid: function (password) {
      return auth.comparePassword(password, this.password);
    }
  },
  createAuth: (opts) => {
    return new Promise((resolve, reject) => {
      opts.password = auth.hashPassword(opts.password);
      Auth.create(opts).then(auth => {
        resolve(auth);
      }, err => {
        reject()
      });
    });
  }
};

