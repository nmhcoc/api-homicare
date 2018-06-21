/**
 * LongOrder.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */


///status: 0: created, 1: lock, 2. processed

module.exports = {
  attributes: {
    customer: { type: 'string', required: true },
    job: { type: 'string', required: true },
    address: { type: 'string' },
    customerNote: { type: 'string' },
    officerNote: { type: 'string' },
    startTime: { type: 'datetime', required: true },
    endTime: { type: 'datetime', required: true },
    resolveStartTime: { type: 'datetime' },
    resolveEndTime: { type: 'datetime' },
    dependency: { type: 'string', required: true },
    company: { type: 'string' },
    processBy: { type: 'string' }, //user that process order
    processedAt: { type: 'datetime' },
    status: { type: 'integer', defaultsTo: 0 } // status: 0: created, 1: lock, 2. processed
  }
};

