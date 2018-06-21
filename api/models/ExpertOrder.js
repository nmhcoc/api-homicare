/**
 * ExpertOrder.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    job: { type: 'string', required: true },
    expert: { type: 'string' },
    customer: { type: 'string' },
    date: { type: 'datetime' },
    shift: { type: 'string', enum: ['morning', 'afternoon', 'evening'] },
    bookedTime: { type: 'datetime' },
    officerNote: { type: 'string' },
    bookedBy: { type: 'string' },
    bookedAt: { type: 'string' },
    status: { type: 'integer', required: true, defaultsTo: 0 }, //0: created, 1: lock, 2. processed
  }
};

