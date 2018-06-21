/**
 * Card.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    user: { type: 'string', required: true },
    brand: { type: 'string', required: true },
    name: { type: 'string', required: true },
    expireDate: { type: 'string' },
    expiryMonth: { type: 'string' },
    expiryYear: { type: 'string' },
    cardScheme: { type: 'string', required: true },
    token: { type: 'string', required: true },
    isActive: { type: 'boolean', required: true },
    status3ds: { type: 'string', defaultsTo: 'false' },
    area: { type: 'string', defaultsTo: 'domestic', enum: ['domestic', 'international'] }
  },
};

