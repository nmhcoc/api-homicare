/**
 * BackendUser.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'string', required: true
    },
    username: {
      type: 'string', required: true
    },
    roles: {
      type: 'array'
    }
  },
  createBackendUser: (username, password, name, email, roles) => {
    return new Promise((resolve, reject) => {
      BackendUser.create({ username, name, roles }).then(user => {
        password = auth.hashPassword(password);
        Auth.create({
          phone: username,
          password,
          type: 'backend',
          user: user.id
        }).then(auth => {
          resolve({ user, auth })
        }, err => {
          reject(err);
        })
      }, err => {
        reject(err)
      })
    })

  }
};

