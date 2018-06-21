/**
 * Configuration.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    key: {
      type: 'string', required: true
    },
    value: {
      type: 'string', required: true
    },
    note: {
      type: 'string'
    }
  },
  startConjob: () => {
    setInterval(() => {

    }, sails.config.ORDER_PROCESS_TIMEOUT)
  }
};
let sync = () => {

}

