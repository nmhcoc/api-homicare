/**
 * Transaction.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    source: { type: 'string', required: true },
    destination: { type: 'string' },
    value: { type: 'float', required: true },
    state: { type: 'string', enum: ['pending', 'applied', 'done', 'cancelling', 'cancelled'], required: true }, //state initial, pending, applied, done, canceling, and canceled.
    lastModified: {
      type: 'datetime',
      defaultsTo: new Date()
    },

  }
};

