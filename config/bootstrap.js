/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */
const _ = require('lodash');
const objectid = require('mongodb').ObjectId;
const fs = require('fs');
const moment = require('moment');
module.exports.bootstrap = function (cb) {
  // Notification.createNotification({
  //   user: '59f14623d374aadc66cafa86',
  //   type: Auth.USER_TYPE.CUSTOMER,
  //   push_title: 'tieu de push',
  //   push_body: 'body push',
  //   title: 'khuyen mai test',
  //   content: 'noi dung khuyen mai test',
  //   action: 'no_action'
  // })
  //start conjob
  bootstrapAllControllers().then(() => {
    cb();
  });
  // initAllControllers(); 
  // if (_.includes(process.argv, 'init')) {
    // initAllControllers();
  // }
  // if (process.env.NODE_ENV === 'production') {
  //   return cb();
  // }

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
};

let bootstrapAllControllers = () => {
  return new Promise((resolve, reject) => {
    let promises = [];
    for (var index in sails.models) {
      let model = sails.models[index];
      if (model.bootstrap) {
        promises.push(model.bootstrap());
      }
    }
    Promise.all(promises).then(rs => {
      resolve()
    })
  })
}

let initAllControllers = () => {
  return new Promise((resolve, reject) => {
    let promises = [];
    for (var index in sails.models) {
      let model = sails.models[index];
      if (model.initialize) {
        promises.push(model.initialize());
      }
    }
    Promise.all(promises).then(rs => {
      resolve()
    })
  })
}
