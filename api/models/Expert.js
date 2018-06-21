/**
 * Expert.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'string', required: true
    },
    avatar: {
      type: 'string',
      required: true
    },
    degree: {
      type: 'string',
      required: true
    },
    academic: { type: 'string' },
    histories: { type: 'string' },
    companies: { type: 'array' },
    jobs: {
      type: 'string',
      required: true
    },
    experience: {
      type: 'integer',
      required: true
    }
  }
};

