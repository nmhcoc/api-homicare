/**
 * Lab.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'string', required: true
    },
    phone: {
      type: 'string', required: true
    },
    user: {
      type: 'string', required: true
    },
    email: {
      type: 'email', required: true
    },
    jobs: {
      type: 'array', required: true
    },
    address: {
      type: 'string', required: true
    },
    isActive: {
      type: 'boolean', required: true, defaultsTo: true
    }
  }
};

