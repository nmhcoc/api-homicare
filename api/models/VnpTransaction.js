/**
 * VnpTransaction.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    order: { type: 'string' },
    orderType: { type: 'string' },
    params: { type: 'string' },
    status: { type: 'string', enum: ['pending', 'failure', 'success'], defaultsTo: 'pending' },
    desc: { type: 'string' },
    response: { type: 'string' }
  }
};

