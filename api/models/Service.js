/**
 * Service.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    address: {
      type: 'string', required: true
    },
    jobs: {
      type: 'array', required: true
    },
    price: {
      type: 'integer', required: true
    },
    customer: {
      type: 'string', required: true
    },
    status: { type: 'integer', defaultsTo: 0 }, // status: 0: created, 1: lock, 2. processed,
    processBy: { type: 'string' },
    customerNote: { type: 'string' },
    startTime: { type: 'datetime' },
    paymentMethod: { type: 'string' },
    paymentStatus: { type: 'string', defaultsTo: 'pending' }
  }
};

