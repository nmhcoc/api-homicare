/**
 * PriceApply.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  TYPE: {
    VOUCHER: 1,
    PROMOTION: 2,
    META: 3,
    FEE: 4
  },
  attributes: {
    order: { type: 'string', required: true },
    type: { type: 'integer', required: true },
    voucher: { type: 'string' },
    promotion: { type: 'string' },
    meta: { type: 'string' },
    startPrice: { type: 'float', required: true },
    endPrice: { type: 'float', required: true },
    discount: { type: 'float', required: true },
    desc: { type: 'string' }
  },
};

