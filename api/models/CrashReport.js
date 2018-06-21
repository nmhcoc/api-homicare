/**
 * CrashReport.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    platform: { type: 'string', required: true },
    uuid: { type: 'string' },
    name: { type: 'string' },
    desc: { type: 'string' }
  }
};

