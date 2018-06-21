/**
 * Officer.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
let objectid = require('mongodb').ObjectId;
module.exports = {

  attributes: {
    name: {
      type: 'string'
    },
    username: {
      type: 'string', required: true
    },
    address: {
      type: 'string'
    },
    email: {
      type: 'string'
    },
    roles: {
      type: 'array'
    },
    avatar: {
      type: 'string',
      defaultsTo: 'profile/default_avatar.png'
    },
    changedPassword: {
      type: 'boolean',
      defaultsTo: true
    },
    unreadNotification: { type: 'integer', defaultsTo: 0 },
    agency: { type: 'string', defaultsTo: '' }
  },
  addUserRole: (officerId, userRoleId) => {
    return new Promise((resolve, reject) => {
      Officer.native((err, collection) => {
        collection.update({ _id: objectid(officerId) }, {
          $addToSet: {
            roles: userRoleId
          }
        }).then(rs => resolve(), err => reject())
      })
    })
  },
  removeUserRole: (officerId, userRoleId) => {
    return new Promise((resolve, reject) => {
      Officer.native((err, collection) => {
        collection.update({ _id: objectid(officerId) }, {
          $pull: {
            roles: userRoleId
          }
        }).then(rs => resolve(), err => reject())
      })
    })
  },
  createOfficer: (opts) => {
    return new Promise((resolve, reject) => {
      let { name, username, password, email, roles, avatar, address, phone } = opts;
      Officer.findOne({ username }).then(oldUser => {
        if (oldUser) return reject({ err: 1, desc: 'user exists' });
        Officer.create({ name, username, address, email, avatar, roles, phone }).then(user => {
          Auth.createAuth({ type: 'officer', username, password, officer: user.id }).then(auth => {
            resolve({ user, auth });
          });
        }, err => {
          reject()
        })
      })
    })
  },
  initialize: () => {
    return new Promise((resolve, reject) => {
      //create admin officer
      Officer.createOfficer({
        name: 'Administrator', username: 'admin', password: '1', email: 'tungdo@neonstudio.us', roles: ['59e7035867afe9c438a67ccb']
      }).then(user => {
      })
    });
  }
};

