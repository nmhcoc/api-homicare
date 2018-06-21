/**
 * ComboOrder.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    combo: { model: 'combo' },
    price: { model: 'comboPricing' },
    customer: { model: 'customer' },
    status: { type: 'string', defaultsTo: 'pending' },
    customerNote: { type: 'string' },
    voucher: { type: 'string' },
    dependency: { type: 'string' },
    paymentMethod: { type: 'string' },
    address: { type: 'string' },
    startTime: { type: 'string' }
  }
};

