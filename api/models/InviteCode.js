/**
 * InviteCode.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const moment = require('moment');
const objectid = require('mongodb').ObjectID;
const _ = require('lodash');

module.exports = {

  attributes: {
    code: {
      type: 'string', required: true
    },
    type: { type: 'string', required: true },
    owner: { type: 'string' },
    nUsed: {
      type: 'integer', defaultsTo: 0
    },
    users: {
      type: 'array'
    },
  },
  activeCode: (opts) => {
    return new Promise((resolve, reject) => {
      let { code, user, type } = opts;
      InviteCode.findOne({ type, code }).then(code => {
        if (!code.users) code.users = [];
        if (_.includes(code.users, user)) return reject();
        Account.activeInviteCode({ user, code, type }).then(() => {
          code.users.push(user);
          code.save().then(() => {
            return resolve();
          })
        })
      })
    })
  },
  bootstrap: () => {
    return new Promise((resolve, reject) => {
      pubsub.subscribe('ORDER.PAID', (msg, data) => {
        let { order } = data;
        if (!order.checkInviteCode) {
          log.file('invitecode', `[ORDER FINISHED WITHOUT INVITE CODE CHECK] [ORDER: ${order.id}]`);
          log.log2File('invitecode', `bootstrap - orderid = ${order.id} & event = ORDER.PAID & order finished without invite code`);
          return;
        }
        Customer.findOne({ id: order.customer }).then(customer => {
          Partner.findOne({ id: order.partner }).then(partner => {
            if (customer.inviteCode) {
              log.file('invitecode', `[ACTIVE INVITE CODE IN ORDER FOR CUSTOMER] [ORDER: ${order.id}] [CODE: ${customer.inviteCode}] [CUSTOMER: ${customer.id}]`);
              log.log2File('invitecode', `bootstrap - orderid = ${order.id} & event = ORDER.PAID@ ACTIVE INVITE CODE & customer = ${customer.id} (${customer.name}) & inviteCode = ${customer.inviteCode}`);
              InviteCode.activeCode({ type: 'customer', code: customer.inviteCode, user: customer.id }).then(() => {
                Customer.update({ id: customer.id }, { inviteCode: '' }).then(() => { });
              })
            }
            if (partner.inviteCode) {
              log.file('invitecode', `[ACTIVE INVITE CODE IN ORDER FOR PARTNER] [ORDER: ${order.id}] [CODE: ${partner.inviteCode}] [PARTNER: ${partner.id}]`);
              log.log2File('invitecode', `bootstrap - orderid = ${order.id} & event = ORDER.PAID@ ACTIVE INVITE CODE & partner = ${partner.id} (${partner.name}) & inviteCode = ${partner.inviteCode}`);
              InviteCode.activeCode({ type: 'partner', code: partner.inviteCode, user: partner.id }).then(rs => {
                Partner.update({ id: partner.id }, { inviteCode: '' }).then(() => { });
              })
            }
          })
        })
      })
      resolve();
    })
  }
};

