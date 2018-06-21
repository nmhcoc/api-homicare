/**
 * CancelReason.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const objectid = require('mongodb').ObjectID;
module.exports = {

  attributes: {
    reason: {
      type: 'string', required: true
    },
    type: {
      type: 'string', required: true
    }
  },
  initialize: () => {
    return new Promise((resolve, reject) => {
      let reasons = [{
        reason: 'Bận việc khác', type: 'customer', createdAt: new Date()
      }, {
        reason: 'Bận việc khác', type: 'partner', createdAt: new Date()
      }];

      CancelReason.create(reasons).then(() => {
        resolve();
      })
    })
  }
};

