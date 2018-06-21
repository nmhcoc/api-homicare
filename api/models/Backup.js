/**
 * Backup.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const mongoBackup = require('mongodb-backup');
const moment = require('moment');
const path = require('path');
module.exports = {

  attributes: {

  },
  backupDatabase: () => {
    let folder = path.join(__dirname, '../../backup');
    let fname = `${moment().format('D-M-Y')}.tar`
    log.file('backup', `[BACKING UP DATABASE INTO FILE ${path.join(folder, fname)}...]`);
    let connection = sails.config.connections[sails.config.models.connection];
    let uri = `mongodb://${connection.user}:${connection.password}@${connection.host}:${connection.port}/${connection.database}`;
    if (!connection.user) {
      uri = `mongodb://${connection.host}:${connection.port}/${connection.database}`;
    }
    mongoBackup({
      uri,
      root: folder,
      tar: fname,
      callback: function (err) {
        if (err) {
          log.file('backup', `[BACKUP FAILURE] [${JSON.stringify(err)}]`);
        } else {
          log.file('backup', `[BACKUP SUCCESSFUL!] [${path.join(folder, fname)}]`)
        }
      }
    });
  }
};

