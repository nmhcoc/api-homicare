/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
let objectid = require('mongodb').ObjectID;
const moment = require('moment');
module.exports = {

  attributes: {
    name: {
      type: 'string',
      size: 50,
      required: true
    },
    phone: {
      type: 'string',
      size: 20,
      unique: true,
      required: true
    },
    birth: {
      type: 'datetime'
    },
    address: {
      type: 'string',
    },
    email: {
      type: 'email',
    },
    avatar: {
      defaultsTo: 'default_avatar.png'
    },
    roles: {
      type: 'array',
      required: true
    },
    isPartner: {
      type: 'boolean'
    },
    waitingForReview: {
      type: 'boolean'
    },
    partnerFirebaseToken: {
      type: 'string'
    },
    customerFirebaseToken: {
      type: 'string'
    },
    isOnline: {
      type: 'boolean'
    },
    jobs: {
      type: 'array'
    },
    averangeRate: {
      type: 'float'
    },
    experience: {
      type: 'integer'
    },
    category: {
      type: 'string'
    },
    nOrderCancelled: {
      type: 'integer'
    },
    nOrderDenied: {
      type: 'integer'
    },
    lastOnlineAt: {
      type: 'datetime'
    },
    latitude: {
      type: 'float'
    },
    longitude: {
      type: 'float'
    },
    nReport: {
      type: 'integer'
    },
    totalTime: {
      type: 'integer'
    },
    nRate: {
      type: 'integer'
    },
    totalRate: {
      type: 'integer'
    },
    averangeRating: {
      type: 'float'
    },
    idNumber: {
      type: 'string'
    },
    certificate: {
      type: 'array'
    },
    identityCard: {
      type: 'string'
    },
    isBlock: {
      type: 'boolean'
    },
    approvedAt: {
      type: 'datetime'
    },
    approvedBy: {
      type: 'string'
    },
    blockedAt: {
      type: 'datetime'
    },
    districtsOfWorking: {
      type: 'array'
    },
    balance: {
      type: 'integer',
    },
    refBalance: {
      type: 'integer'
    }
  },
  startConjob: () => {
    setInterval(() => {
      offlineUserTimeout();
    }, 30000)
  },

};

let offlineUserTimeout = () => {
  let time = moment().add(-60, 'seconds').toDate();
  User.update({ lastOnlineAt: { '<': time } }, { isOnline: false }).then(rs => {
  });
}