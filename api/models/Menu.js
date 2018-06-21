/**
 * Menu.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: { type: 'string', required: true },
    state: { type: 'string' },
    parent: { type: 'string' }
  },
  initialize: () => {
    return new Promise((resolve, reject) => {
      let menus = [{
        "id": "59db5ff64feccc3a75f44de9",
        "name": "System Configuration",
        "state": "root.systemconfiguration",
        "parent": null,
      },
      {
        "id": "59db600b4feccc3a75f44dea",
        "name": "Menu management",
        "state": "root.systemconfiguration.menu",
        "parent": "59db5ff64feccc3a75f44de9",
      },
      {
        "id": "59db63204feccc3a75f44df2",
        "name": "Usergroup",
        "state": "root.systemconfiguration.usergroup",
        "parent": "59db5ff64feccc3a75f44de9"
      }];
      Menu.create(menus).then(rs => {
        resolve();
      })
    })
  }
};

