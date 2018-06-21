/**
 * Client.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const objectid = require('mongodb').ObjectID;
module.exports = {

  attributes: {
    name: {
      type: 'string',
      required: true
    },
    key: {
      type: 'string',
      required: true
    }
  },
  initialize: () => {
    return new Promise((resolve, reject) => {
      //create clients  
      let clients = [{
        name: 'customer',
        key: '3FrXFLglG5tLo399fHu1BAYZkJ4BnhQq',
      }, {
        name: 'partner',
        key: 'xxnBpuxNrRKs6H6Wq3J7KzYDkPFAyzW9',
      }, {
        name: 'officer',
        key: 'yeGzz5y6kkT3lUV4rlw0qG6QPKkZ4CSv'
      }];
      Client.create(clients).then(rs => {
        resolve();
      })
    })
  }
};

