/**
 * Faq.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    answer: { type: 'string' },
    question: { type: 'string' },
    combo: { model: 'combo' },
    job: { model: 'job' }
  }
};

