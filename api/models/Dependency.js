/**
 * Dependency.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'string', required: true
    },
    birth: {
      type: 'datetime', required: true
    },
    relation: {
      type: 'string', required: true
    },
    user: {
      type: 'string', required: true
    },
    avatar: {
      type: 'string', required: true
    },
    gender: {
      type: 'integer', required: true
    }
  }
};

