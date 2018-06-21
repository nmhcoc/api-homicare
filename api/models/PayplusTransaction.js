/**
 * PayplusTransaction.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    amount: {
      type: 'string', required: true
    },
    card: {
      type: 'string', required: true
    },
    user: {
      type: 'string', required: true
    },
    order: { type: 'string' },
    payplusTransaction: {
      type: 'string'
    },
    result: {
      type: 'string'
    }
  }
};

