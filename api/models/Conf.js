/**
 * Configuration.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
let data = {};
const fs = require('fs');
module.exports = {
  INTERVAL_UPDATE: 5000,
  attributes: {
    key: {
      type: 'string', required: true
    },
    value: {
      type: 'string', required: true
    },
    desc: {
      type: 'string',
      defaultsTo: ''
    },
    type: { type: 'string', enum: ['boolean', 'string', 'number'], required: true, defaultsTo: 'string' }
  },
  bootstrap: () => {
    return new Promise((resolve, reject) => {
      Conf.updateConfig().then(rs => {
        resolve();
      })
    })
  },
  initialize: () => {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync('./log')) {
        fs.mkdirSync('./log');
      }
      if (!fs.existsSync('./upload')) {
        fs.mkdirSync('./upload');
      }
      if (!fs.existsSync('./upload/report')) {
        fs.mkdirSync('./upload/report');
      }
      if (!fs.existsSync('./upload/job')) {
        fs.mkdirSync('./upload/job');
      }
      if (!fs.existsSync('./upload/post')) {
        fs.mkdirSync('./upload/post');
      }
      if (!fs.existsSync('./upload/profile')) {
        fs.mkdirSync('./upload/profile');
      }
      let configs = [
        { key: 'PAYPLUS_HOST', value: 'http://service.payplus.com.vn', type: 'string' },
        { key: 'PAYPLUS_BASIC_TOKEN', value: 'Basic 8xjbZx1zo8D0AkX6V2zxuoMxG6XPGSTC', type: 'string' },
        { key: 'PAYPLUS_SECRET', value: '8ab9ba27-7b93-457d-a327-db8522ea9882', type: 'string' },
        //account kit
        { key: 'ACCOUNT_KIT_APP_ID', value: '477372835965944', type: 'string' },
        { key: 'ACCOUNT_KIT_APP_SECRET', value: 'fb0362bdeb0660349086a529f070b3e5', type: 'string' },
        { key: 'ACCOUNT_KIT_VERSION', value: 'v1.1', type: 'string' },

        { key: 'INVITE_CODE_GIFT', value: '10000', type: 'number' },
        { key: 'INTRODUCTION_SITE', value: 'http://viecnhanhanh.vn', type: 'string' },
        { key: 'OTP_EXPIRE', value: '300', type: 'number' },
        { key: 'REFRESH_TOKEN_EXPIRE', value: '7', type: 'number' }, //days
        { key: 'TOKEN_EXPIRE', value: '1', type: 'number' }, //days

        { key: 'FIREBASE_PARTNER', value: 'AAAAu5PEgCU:APA91bFAXPsgpLcqq47cihP-5dXu0ydMBwbjN0Pctx5NxZtdlA9JOsrkZ8YH9DoS9u11FIIBSosksH77LpPcLFgTMnNgWBcyujuXziCdBclRdsRtEBoSmp6AzljlSH_0-8mpH0RO8LQh', type: 'string' },
        { key: 'FIREBASE_CUSTOMER', value: 'AAAA6d-3-nM:APA91bFOdQ6ohmj-VN_ufomtIDzqMdgVT5KEK0zatYhwmhh3dm9_4QJJzIG-aojGTrZ87JlENrDh2g1BtvJjovuAg8O6O1xgtqx7kD5-ogpIsiNYO6Zsqj1CKjQ3rI6Xy1y1KiZzQJOB', type: 'string' },

        { key: 'PARTNER_ACCEPT_TIMEOUT', value: '30000', type: 'number' },
        { key: 'PARTNER_RETRIES_TIME', value: '5000', type: 'number' },
        { key: 'PARTNER_REMIND_FIRST', value: '30', type: 'number' },
        { key: 'ORDER_PENDING_EXPIRE_TIME', value: '7200', type: 'number' },
        { key: 'PARTNER_REMIND_SECOND', value: '10', type: 'number' },
        { key: 'ORDER_PROCESS_TIMEOUT', value: '3600', type: 'number' },
        { key: 'FIND_PARTNER_RETRIES', value: '3', type: 'number' },
        { key: 'MIN_BALANCE_PUSH_JOB', value: '50000', type: 'number' },
        { key: 'ORDER_START_DELTA', value: '3', type: 'number' },
        { key: 'AVATAR_SIZE', value: '256', type: 'number' },

        { key: 'MAIL_URL', value: 'https://mailalchemy.com/cms', type: 'string' },
        { key: 'MAIL_FROM', value: 'hotro@viecnhanhanh.vn', type: 'string' },
        { key: 'SECRET_KEY', value: '8b6aead0-a266-4c1f-ac0f-b97ddd21121b', type: 'string' },
        //mail templates
        { key: 'MAIL_TEMPLATE_REGISTER', value: '908lgkr', type: 'string' },
        { key: 'MAIL_TEMPLATE_FINISHED_ORDER_CUSTOMER', value: '908lgkr', type: 'string' },
        { key: 'MAIL_TEMPLATE_FINISHED_ORDER_PARTNER', value: '908lgkr', type: 'string' },
        { key: 'MAIL_TEMPLATE_RESET_PASSWORD', value: '908lgkr', type: 'string' },
        { key: '', value: '', type: 'string' },
        { key: '', value: '', type: 'string' },

      ];
      Conf.create(configs).then(rs => {
        resolve();
      })
    })
  },
  data,//return data config
  updateConfig: () => {
    return new Promise((resolve, reject) => {
      Conf.find().then(rs => {
        rs.forEach(con => {
          switch (con.type) {
            case 'boolean':
              data[con.key] = con.value == 'true' ? true : false;
              break;
            case 'number':
              data[con.key] = Number(con.value);
              break;
            default:
              data[con.key] = con.value;
              break;
          }
        });
        resolve();
      })
    })
  }
};