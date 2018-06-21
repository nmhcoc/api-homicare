/**
 * UserRole.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const objectid = require('mongodb').ObjectID;
module.exports = {

  attributes: {
    name: { type: 'string', required: true },
    permissions: { type: 'array', defaultsTo: [] },
    menus: { type: 'array', defaultsTo: [] }
  },
  updateRolePermissions: (userRoleId, permissions) => {
    return new Promise((resolve, reject) => {
      if (!userRoleId || !permissions) return reject();
      try {
        permissions = JSON.parse(permissions);
        UserRole.update({ id: userRoleId }, { permissions }).then(() => resolve());
      } catch (err) {
        reject();
      }
    })
  },
  updateRoleMenus: (userRoleId, menus) => {
    return new Promise((resolve, reject) => {
      if (!userRoleId || !menus) return reject();
      try {
        menus = JSON.parse(menus);
        UserRole.update({ id: userRoleId }, { menus }).then(() => resolve());
      } catch (err) {
        reject();
      }
    })
  },
  initialize: () => {
    return new Promise((resolve, reject) => {
      //create role admin
      let controllers = auth.getControllers();
      let permissions = [];
      controllers.forEach(ctrl => {
        ctrl.actions.forEach(action => {
          let name = `${ctrl.model}.${action.toLowerCase()}`;
          permissions.push(name);
        })
      });
      UserRole.create({
        id: '59e7035867afe9c438a67ccb',
        name: 'admin',
        permissions,
        menus: ['59db5ff64feccc3a75f44de9', '59db600b4feccc3a75f44dea', '59db63204feccc3a75f44df2']
      }).then(adminRole => {
      })
    })
  }
};

