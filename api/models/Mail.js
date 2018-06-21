/**
 * Mail.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const request = require('request')
const moment = require('moment');
const sgMail = require('@sendgrid/mail');
module.exports = {
  TEMPLATES: {
    REGISTER: '908lgkr',
    SUB_REGISTER: 'XÁC NHẬN ĐĂNG KÝ DỊCH VỤ HOMICARE',
    FINISHED_CUSTOMER: '908lgkr',
    FINISHED_PARTNER: '908lgkr',
    SUB_FINISHED: 'KẾT THÚC CÔNG VIỆC',
    RESETPASS: '908lgkr',
    SUB_RESETPASS: 'RESET PASSWORD'
  },
  attributes: {
    mailTo: {
      type: 'string', required: true
    },
    subject: {
      type: 'string'
    },
    substitutions: {
      type: 'array'
    },
    templateId: {
      type: 'string', required: true
    },
    userSender: {
      type: 'string', required: true
    },
    mailFrom: {
      type: 'string', required: true
    },
    userReceiver: {
      type: 'string', required: true
    },
    status: {
      type: 'string', enum: ['pending', 'done', 'failure'], defaultsTo: 'pending'
    },
    userType: {
      type: 'string', required: true
    },
    mailType: {
      type: 'string'
    },
    // changeStatus: function () {
    //   // this.
    // }
  },

  sendCreateOfficer: (opts) => {
    return new Promise((resolve, reject) => {
      let { user, password, username } = opts;
      if (!user || !password) return reject({ err: 1, msg: 'paramError' });
      Officer.findOne({ id: user }).then(officer => {
        let opts1 = {
          mailTo: officer.email,
          mailFrom: Conf.data.MAIL_FROM,
          userType: 'officer',
          subject: 'Đăng ký thành công tài khoản Homicare',
          substitutions: [
            { key: 'name', value: officer.name },
            { key: 'username', value: username },
            { key: 'password', value: password }
          ],
          userSender: Conf.data.MAIL_SENDER,
          userReceiver: officer.name,
          templateId: Conf.data.MAIL_TEMPLATE_CREATE_OFFICER,
          status: 'pending',
          mailType: 'register'
        }
        sendMail(opts1).then(result => {
          resolve(result)
        })
      })

    })

  },

  sendRegisterMail: (opts) => {
    return new Promise((resolve, reject) => {
      let { userType, userId } = opts;
      if (!userType || !userId) return reject({ err: 1, msg: 'paramError' });
      new Promise((resolve, reject) => {
        switch (userType) {
          case 'customer':
            Customer.findOne({ id: userId }).then(customer => {
              resolve(customer);
            });
            break;
          case 'partner':
            Partner.findOne({ id: userId }).then(partner => {
              resolve(partner);
            });
            break;
        }
      }).then(user => {
        let opts1 = {
          mailTo: user.email,
          mailFrom: Conf.data.MAIL_FROM,
          userType: userType,
          subject: Mail.TEMPLATES.SUB_REGISTER,
          substitutions: [{ key: 'name', value: user.name }],
          userSender: sails.config.MAIL.USERSENDER,
          userReceiver: user.name,
          templateId: Conf.data.MAIL_TEMPLATE_REGISTER,
          status: 'pending',
          mailType: 'register'
        }
        sendMail(opts1).then(result => {
          resolve(result)
        })
      })

    })

  },

  sendMailfinishJob: (opts) => {
    return new Promise((resolve, reject) => {
      let { orderId } = opts;
      if (!orderId) return reject({ err: 1, msg: 'paramError' });
      Order.findOne({ id: orderId }).then(order => {
        if (!order) return reject();
        Job.findOne({ id: order.job }).then(job => {
          if (!job) return reject();
          Customer.findOne({ id: order.customer }).then(customer => {
            if (!customer) return reject();
            Partner.findOne({ id: order.partner }).then(partner => {
              if (!partner) return reject();
              let optsPartner = {
                mailTo: partner.email,
                mailFrom: Conf.data.MAIL_FROM,
                userType: 'partner',
                subject: Mail.TEMPLATES.SUB_FINISHED,
                substitutions: [
                  { key: 'name', value: partner.name },
                  { key: 'startTime', value: moment(order.startTime).format('DD/MM/YYYY, h:mm:ss a') },
                  { key: 'endTime', value: moment(order.finishedAt).format('DD/MM/YY, h:mm:ss a') },
                  { key: 'job', value: job.name },
                  { key: 'price', value: order.price }
                ],
                userSender: Conf.data.MAIL_SENDER,
                userReceiver: partner.name,
                templateId: Conf.data.MAIL_TEMPLATE_FINISHED_ORDER_PARTNER,
                status: 'pending',
                mailType: 'finishJob'
              }
              let optsCustomer = {
                mailTo: customer.email,
                mailFrom: Conf.data.MAIL_FROM,
                userType: 'customer',
                subject: Mail.TEMPLATES.SUB_FINISHED,
                substitutions: [
                  { key: 'name', value: customer.name },
                  { key: 'startTime', value: moment(order.startTime).format('DD/MM/YYYY, h:mm:ss a') },
                  { key: 'endTime', value: moment(order.startTime).format('DD/MM/YYYY, h:mm:ss a') },
                  { key: 'price', value: order.price },
                  { key: 'job', value: job.name }
                ],
                userSender: Conf.data.MAIL_SENDER,
                userReceiver: customer.name,
                templateId: Conf.data.MAIL_TEMPLATE_FINISHED_ORDER_CUSTOMER,
                status: 'pending',
                mailType: 'finishJob'
              }
              sendMail(optsPartner).then(result => {
                resolve(result)
              })
              sendMail(optsCustomer).then(result => {
                resolve(result)
              })
            })
          })
        })
      })
    })
  },

  sendMailResetPass: (opts) => {
    return new Promise((resolve, reject) => {
      let { userId, password, type } = opts
      if (!userId || !password || !type) return reject({ err: 1, msg: 'paramError' })
      new Promise((resolve, reject) => {
        switch (type) {
          case 'customer':
            Customer.findOne({ id: userId }).then(customer => {
              resolve(customer)
            })
            break;
          case 'partner':
            Partner.findOne({ id: userId }).then(partner => {
              resolve(partner)
            })
            break;
          case 'officer':
            Officer.findOne({ id: userId }).then(office => {
              resolve(office)
            })
            break;
        }
      }).then(user => {
        let opts1 = {
          mailTo: user.email,
          mailFrom: Conf.data.MAIL_FROM,
          userType: type,
          subject: Mail.TEMPLATES.SUB_RESETPASS,
          substitutions: [{ key: 'name', value: user.name }, { key: 'newPass', value: password }],
          userSender: sails.config.MAIL.USERSENDER,
          userReceiver: user.name,
          templateId: Conf.data.MAIL_TEMPLATE_RESET_PASSWORD,
          status: 'pending',
          mailType: 'sendNewPass'
        }
        sendMail(opts1).then(result => {
          resolve(result)
        })
      })
    })
  },
  bootstrap: () => {
    pubsub.subscribe('USER.REGISTER', (msg, data) => {
      let { type, user, auth, account } = data;
      Mail.sendRegisterMail({ userType: type, userId: user.id });
    })
    pubsub.subscribe('ORDER.FINISHED', (msg, data) => {
      let { order } = data;
      Mail.sendMailfinishJob({ orderId: order.id });
    })
  }
};

let sendMail = (opts) => {
  return new Promise((resolve, reject) => {
    sgMail.setApiKey(Conf.data.SECRET_KEY);
    let subs = {};
    if (opts.substitutions) {
      for (var i in opts.substitutions) {
        subs[opts.substitutions[i].key] = opts.substitutions[i].value;
      }
    }
    Mail.create(opts).then(mail => {
      var msg = {
        'to': mail.mailTo,
        'subject': mail.subject,
        'from': Conf.data.MAIL_FROM,
        'templateId': mail.templateId,
        'substitutions': subs,
        'substitutionWrappers': ['{{', '}}'],
      }
      console.log(JSON.stringify(subs));
      sgMail.send(msg)
        .then(() => {
          console.log('Mail sent successfully');
          Mail.update(mail.id, { status: 'done' }).then(() => {
            resolve();
          })
        })
        .catch(error => {
          Mail.update(mail.id, { status: 'failure' }).then(() => {
            resolve();
          })
        });
    }, err => {
      console.log('create mail failure');
      reject(err);
    })
  })

}
