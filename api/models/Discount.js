/**
 * Discount.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    startTime: {
      type: 'datetime',
      required: true
    },
    endTime: {
      type: 'datetime',
      required: true
    },
    type: {
      type: 'string',
      enum: ['cash', 'percent']
    },
    percent: {
      type: 'float'
    },
    fixedCash: {
      type: 'float'
    },
    maxValue: {
      type: 'float'
    },
    maxUsePerUser: {
      type: 'integer'
    }
  }
};

