/**
 * Notification.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    user: { type: 'string' },
    type: { type: 'integer' },
    push_title: { type: 'string' },
    push_body: { type: 'string' },
    content: { type: 'string' },
    action: { type: 'string' },
    status: { type: 'boolean', defaultsTo: true },
    read: { type: 'boolean', defaultsTo: false },
    pushedAt: { type: 'datetime' }
  },
  updateUserCount: (user, type) => {
    return new Promise((resolve, reject) => {
      Notification.count({ user, read: false, status: true }).then(count => {
        switch (type) {
          case Auth.USER_TYPE.CUSTOMER:
            Customer.update({ id: user }, { unreadNotification: count }).then(() => { resolve() });
            break;
          case Auth.USER_TYPE.PARTNER:
            Partner.update({ id: user }, { unreadNotification: count }).then(() => { resolve() });
            break;
          case Auth.USER_TYPE.OFFICER:
            Officer.update({ id: user }, { unreadNotification: count }).then(() => { resolve() });
            break;
        }
      })
    })
  },
  createNotification: (opts) => {
    return new Promise((resolve, reject) => {
      let { user, type, push_title, push_body, title, content, action } = opts;
      new Promise((resolve, reject) => {
        switch (type) {
          case Auth.USER_TYPE.CUSTOMER:
            Customer.findOne({ id: user }).then(user => {
              resolve(user);
            })
            break;
          case Auth.USER_TYPE.PARTNER:
            Partner.findOne({ id: user }).then(user => {
              resolve(user);
            })
            break;
        }
      }).then(user => {
        if (!user) return;
        if (type == Auth.USER_TYPE.OFFICER) {
          Notification.create({ user: user.id, type, push_title, push_body, title, content, action }).then(rs => {
            Notification.updateUserCount(user.id, type);
            resolve(rs);
          });
        } else {
          Notification.create({ user: user.id, type, push_title, push_body, title, content, action }).then(notify => {
            Notification.updateUserCount(user.id, type);
            let msg = {
              to: user.firebaseToken,
              notification: {
                title: push_title,
                body: push_body
              },
              data: {
                title, content, action
              }
            }
            Push.pushNotification('partner', msg).then(() => {

              resolve();
            }, () => {
              reject();
            });
          }, err => {
            console.log('cannot create notification ', err);
          });
        }
      })
    });
  }
};

