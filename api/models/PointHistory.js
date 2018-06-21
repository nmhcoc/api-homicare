/**
 * PointHistory.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    user: { type: 'string' },
    addPoint: { type: 'integer', defaultsTo: 0 },
    subPoint: { type: 'integer', defaultsTo: 0 },
    currentPoint: { type: 'integer', defaultsTo: 0 },
    desc: { type: 'string', defaultsTo: '' },
    sync: { type: 'string', defaultsTo: 'pending', enum: ['penidng', 'done'] },
    trans: { type: 'string' }
  }
};

