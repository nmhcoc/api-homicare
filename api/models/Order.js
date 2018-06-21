/**
 * Order.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const _ = require('lodash');
const moment = require('moment');
const schedule = require('node-schedule');
let cronData = {};
//event
//ORDER.CREATED, ORDER.FINISHED, ORDER.PARTNER_DENY, ORDER.PARTNER_ACCEPT, ORDER.PARTNER_CANCEL, ORDER.CUSTOMER_CANCEL,ORDER.CUSTOMER_REPORT,ORDER.PARTNER_START
module.exports = {
  BOOK_TYPE: {
    MANUAL: 1,
    AUTO: 2
  },
  ORDER_STATUS: {
    CREATE: 1,
    FINDING_PARTNER: 2,
    TIMEOUT: 3,
    DENIED: 4,
    PARTNER_ACCEPT: 5,
    STARTED: 6,
    PARTNER_CANCEL: 7,
    FINISHED: 8,
    CUSTOMER_CANCEL: 9,
    CANNOT_FIND_PARTNER: 10,
    FINISH_WITH_RATE: 11,
    PENDING: 12
  },
  attributes: {
    customer: { type: 'string', required: true },
    startTime: { type: 'datetime', required: true },
    duration: { type: 'float', required: true },
    endTime: { type: 'datetime', required: true },
    district: { type: 'string' },
    customerNote: { type: 'string' },
    customerCancelReason: { type: 'string' },
    partnerCancelReason: { type: 'string' },
    address: { type: 'string' },
    latitude: { type: 'float', defaultsTo: 0 },
    longitude: { type: 'float', defaultsTo: 0 },
    job: { type: 'string', required: true },
    originPrice: { type: 'float' },
    price: { type: 'float', required: true },
    pricing: { type: 'json' },
    paymentMethod: { type: 'string', defaultsTo: '0', required: true },
    status: { type: 'integer', required: true },
    controler: { type: 'string' },
    server: { type: 'string' },
    partners: { type: 'array' },
    allPartners: { type: 'array' },
    partner: { type: 'string' },
    reports: { type: 'array' },
    partnerNote: { type: 'string' },
    finishedAt: { type: 'datetime' },
    reportImages: { type: 'array' },
    paymentStatus: { type: 'string', enum: ['pending', 'done'], defaultsTo: 'pending' },
    rate: { type: 'integer' },
    improval: { type: 'string' },
    rateString: { type: 'string' },
    partnerRate: { type: 'integer' },
    rated: { type: 'boolean', defaultsTo: false },
    findingRetries: { type: 'integer', defaultsTo: 0 },
    checkInviteCode: { type: 'boolean', defaultsTo: false },
    bookType: { type: 'integer', defaultsTo: 2 },
    createdBy: { type: 'string' },
    updatePaymentStatus: function (status) {
      return new Promise((resolve, reject) => {
        this.paymentStatus = status;
        this.save().then(() => {
          resolve();
        })
      })
    },
    partnerDeny: function () {
      return new Promise((resolve, reject) => {
        Task.destroyOrderTasks(this.id);
        log.log2File('order', `partnerDeny - orderid = ${this.id} => find next partner + pubsub.publish deny event`)
        Order.nextPartner(this.id, this);
        pubsub.publish('ORDER.PARTNER_DENY', { order: this });
        resolve();
      })
    },
    partnerAccept: function (opts) {
      return new Promise((resolve, reject) => {
        let { partner } = opts;
        if (partner.inviteCode) {
          this.checkInviteCode = true;
        }
        Task.destroyOrderTasks(this.id);
        this.status = Order.ORDER_STATUS.PARTNER_ACCEPT;
        log.log2File('order', `partnerAccept - orderid = ${this.id} & status = Order.ORDER_STATUS.PARTNER_ACCEPT & partner = ${partner.id} (${partner.name}) & inviteCode = ${partner.inviteCode}`);
        this.save().then(rs => {
          //return partner result
          //schedule next push remind
          let tasks = [{
            name: 'Remind order before 10 minutes',
            model: 'Order',
            action: 'remindOrder',
            status: true,
            cronType: Task.CRON_TYPE.DATE,
            state: Task.STATE.RUNNING,
            taskType: Task.TASK_TYPE.ORDER,
            date: moment(this.startTime).add(-10, 'minutes').toDate(),
            meta: this.id,
          }]
          if (moment(this.startTime).add(-32, 'minutes').diff(moment()) > 0) {
            tasks.push({
              name: 'Remind order before 30 minutes',
              model: 'Order',
              action: 'remindOrder',
              status: true,
              cronType: Task.CRON_TYPE.DATE,
              state: Task.STATE.RUNNING,
              taskType: Task.TASK_TYPE.ORDER,
              date: moment(this.startTime).add(-30, 'minutes').toDate(),
              meta: this.id,
            });
          }
          Task.create(tasks).then(tasks => {
            tasks.forEach(task => {
              Task.schedule(task);
            })
          })
          Push.pushOrderAccept({ order: this });
          pubsub.publish('ORDER.PARTNER_ACCEPT', { order: this });
          return resolve();
        })
      })
    },
    partnerFinish: function (partnerNote, rate) {
      return new Promise((resolve, reject) => {
        Task.destroyOrderTasks(this.id);
        this.partnerNote = partnerNote;
        this.status = Order.ORDER_STATUS.FINISHED;
        this.finishedAt = new Date();
        this.partnerRate = rate;
        this.save().then(rs => {
          pubsub.publish('ORDER.FINISHED', { order: this });
          log.log2File('order', `partnerFinish - orderid = ${this.id} & partner = ${this.partner}`);
          Account.payOrder({ order: this, createdBy: this.partner });
          resolve();
        })
      })
    },
    partnerCancel: function () {
      return new Promise((resolve, reject) => {
        Task.destroyOrderTasks(this.id);
        this.status = Order.ORDER_STATUS.PARTNER_CANCEL;
        this.save().then(rs => {
          pubsub.publish('ORDER.PARTNER_CANCEL', { order: this });
          //return success
          return resolve();
        });
      })
    },
    partnerStart: function () {
      return new Promise((resolve, reject) => {
        //update order status = 6 and startedAt
        this.status = Order.ORDER_STATUS.STARTED;
        this.startedAt = new Date();
        this.save().then(rs => {
          pubsub.publish('ORDER.PARTNER_START', { order: this });
          return resolve();
        });
      })
    },
    customerCancel: function () {
      return new Promise((resolve, reject) => {
        Task.destroyOrderTasks(this.id);
        this.status = Order.ORDER_STATUS.CUSTOMER_CANCEL;
        this.save().then(rs => {
          pubsub.publish('ORDER.CUSTOMER_CANCEL', { order: this });
          //return success
          return resolve();
        });
      })
    },
    customerReport: function (content) {
      return new Promise((resolve, reject) => {
        this.report = content;
        this.save().then(() => {
          pubsub.publish('ORDER.CUSTOMER_REPORT', { order: this });
          resolve();
        }, err => {
          reject();
        })
      })
    }
  },
  findPartners: (id, order) => {
    new Promise((resolve, reject) => {
      if (order) return resolve(order);
      Order.findOne({ id }).then(order => {
        resolve(order);
      })
    }).then(order => {
      Task.destroyOrderTasks(order.id);
      order.status = Order.ORDER_STATUS.FINDING_PARTNER;
      order.save().then(() => {
        Order.findAvailablePartners({ order, isOnline: true }).then(partners => {
          log.log2File('order', `findPartners - orderid = ${order.id} & available partner = ${JSON.stringify(partners)}`)
          if (partners.length == 0) {
            //cannot find partner
            if (order.findingRetries < 2) {
              order.findingRetries++;
              log.file('order', `[CANNOT FIND PARTNER=>INCREASE RETRIES TO ${order.findingRetries}] [${moment().format()}] [ORDER: ${order.id}]`);
              log.log2File('order', `findPartners - orderid = ${order.id} & finding retry = ${order.findingRetries}`);
              order.save().then(rs => {
                //schedule next find
                let tasks = [{
                  name: `Retry find partner [${order.findingRetries}]]`,
                  model: 'Order',
                  action: 'findPartners',
                  status: true,
                  cronType: Task.CRON_TYPE.DATE,
                  state: Task.STATE.RUNNING,
                  taskType: Task.TASK_TYPE.ORDER,
                  date: moment().add(10, 'seconds').toDate(),
                  meta: id,
                }];
                Task.create(tasks).then(tasks => {
                  tasks.forEach(task => {
                    Task.schedule(task);
                  })
                })
              })
            } else {
              log.log2File('order', `findPartners - orderid = ${order.id} & set order pending`);
              Order.setOrderPending(order.id, order);
            }
          } else {
            //there're available 
            order.partners = [];
            partners.forEach(p => {
              order.partners.push(p.id);
            });
            order.allPartners = order.partners;
            order.status = Order.ORDER_STATUS.FINDING_PARTNER;
            order.save().then(() => {
              log.log2File('order', `findPartners - orderid = ${order.id} & call nextPartner to find next partner`);

              Order.nextPartner(order.id, order);
              //schedule to push partners
            }, err => {
            })
          }
        })
      })
    })
  },
  setOrderPending: (id, order) => {
    return new Promise((resolve, reject) => {
      new Promise((resolve, reject) => {
        if (order) return resolve(order);
        Order.findOne({ id }).then(order => {
          resolve(order);
        })
      }).then(order => {
        if (moment(order.startTime).diff(moment(), 'minutes') < 40) {
          log.file('order', `[CANNOT FIND PARTNER=>CANCEL ORDER] [${moment().format()}] [ORDER: ${order.id}]`);
          log.log2File('order', `setOrderPending - orderid = ${order.id} & order status = Order.ORDER_STATUS.CANNOT_FIND_PARTNER`)
          pubsub.publish('ORDER.CANNOT_FIND_PARTNER', { order });
          order.status = Order.ORDER_STATUS.CANNOT_FIND_PARTNER;
        } else {
          log.file('order', `[CANNOT FIND PARTNER=>SET ORDER PENDING] [${moment().format()}] [ORDER: ${order.id}]`);
          log.log2File('order', `setOrderPending - orderid = ${order.id} & order status = Order.ORDER_STATUS.PENDING`)
          order.status = Order.ORDER_STATUS.PENDING;
        }
        order.save().then(() => {
          resolve(order);
        })
      })
    })
  },
  nextPartner: (id, order) => {
    return new Promise((resolve, reject) => {
      new Promise((resolve, reject) => {
        if (order) return resolve(order);
        Order.findOne({ id }).then(order => {
          resolve(order);
        })
      }).then(order => {
        if (!order) {
          log.log2File('order', `nextPartner - orderid = ${id} & order not found = ${order}`);
          return reject();
        }

        log.log2File('order', `nextPartner - orderid = ${order.id} & partners = ${JSON.stringify(order.partners)}`);
        if (order.partners.length == 0) {
          Order.setOrderPending(order.id, order).then(rs => {
            resolve();
          })
          return;
        }
        order.partner = order.partners[0];
        order.partners.splice(0, 1);
        order.status = Order.ORDER_STATUS.FINDING_PARTNER;
        Order.find({
          status: [Order.ORDER_STATUS.PARTNER_ACCEPT, Order.ORDER_STATUS.STARTED],
          partner: order.partner,
          or: [
            {
              startTime: {
                '<=': new Date(order.startTime)
              },
              endTime: {
                '>=': new Date(order.startTime)
              }
            },
            {
              startTime: {
                '<': new Date(order.endTime)
              },
              endTime: {
                '>=': new Date(order.endTime)
              }
            }
          ]
        }, { select: ['id'] }).then(busyOrders => {
          log.log2File('order', `nextPartner - orderid = ${order.id} & busyOrders = ${JSON.stringify(busyOrders)}`);
          if (busyOrders.length > 0) {
            return;
          }
          //check if partner is available
          Partner.findOne({
            id: order.partner, approved: true,
            isBlock: false,
            isOnline: true,
          }).then(partnerInfo => {

            if (!partnerInfo) {
              log.log2File('order', `nextPartner - orderid = ${order.id} & partnerInfo = null => find next partner`);
              return Order.nextPartner(order.id, order);
            }
            order.save().then(() => {
              log.log2File('order', `nextPartner - orderid = ${order.id} & partnerInfo = ${partnerInfo.id} (${partnerInfo.name})`);
              Push.pushNewJob({ order }).then(() => {
                //schedule next partner
                let task = {
                  name: 'Next partner',
                  model: 'Order',
                  action: 'nextPartner',
                  status: true,
                  cronType: Task.CRON_TYPE.DATE,
                  state: Task.STATE.RUNNING,
                  taskType: Task.TASK_TYPE.ORDER,
                  date: moment().add(Conf.data.PARTNER_ACCEPT_TIMEOUT, 'seconds').toDate(),
                  meta: order.id,
                }
                Task.create(task).then(task => {
                  Task.schedule(task);
                })
              }, err => {
                log.log2File('order', `nextPartner - orderid = ${order.id} & pushNewJob error => find next partner`);
                Order.nextPartner(order.id, order);
              });;
            })
          })
        })
      })
    });
  },
  remindOrder: (id, order) => {
    return new Promise((resolve, reject) => {
      new Promise((resolve, reject) => {
        if (order) return resolve(order);
        Order.findOne({ id }).then(order => {
          resolve(order);
        })
      }).then(order => {
        Push.pushOrderOnTime({ order }).then(rs => {
          resolve();
        }, err => {
          reject();
        })
      })
    })
  },
  createOrder: (opts) => {
    return new Promise((resolve, reject) => {
      let { district, address, startTime, duration, job, customerNote, paymentMethod, voucher, customer, latitude, longitude, bookType, createdBy, maxPrice, dependency } = opts;
      Job.isJobAvailable(job, latitude, longitude).then(() => {
        if (!duration) duration = 2;
        if (!bookType) bookType = Order.BOOK_TYPE.AUTO;
        if (!district || !address || !startTime || !duration || !job || paymentMethod == null) return reject({ err: 1, msg: 'invalid param' });
        paymentMethod = paymentMethod.toString();
        startTime = moment(startTime).toDate();
        let nextTime = moment().add(10, 'minutes').toDate();
        if (startTime < nextTime) return reject({ err: 2, desc: 'err_invalid_time' }); //invalid time
        let endTime = moment(startTime).add(duration, 'hours').toDate();
        Job.pricingJobs({ jobId: job, duration, startTime, voucher, paymentMethod }).then(priceInfo => {
          let { price } = priceInfo;
          //check money
          if ((paymentMethod == '1') && (customer.balance < priceInfo.price)) return reject({ err: 3, msg: 'err_insufficent_fund' })
          let query = {
            dependency,
            customer: customer.id,
            startTime,
            latitude, longitude,
            duration, district, customerNote, address, job, endTime,
            price,
            originPrice: priceInfo.originPrice,
            paymentMethod, bookType,
            status: 1,
            server: sails.config.SERVER_ID,
            // pricing: priceInfo.desc,
            createdBy
          };
          if (customer.inviteCode) {
            query.checkInviteCode = true;
          }
          Order.create(query).then(order => {
            let pricing = priceInfo.desc;
            pricing.map(item => {
              item.order = order.id;
            });
            PriceApply.create(pricing).then(() => {
              pubsub.publish('ORDER.CREATED', { order });
              resolve(order);
            }, err => {
              reject({ err: 9, msg: 'err_cannot_create_pricing_items' });
            })

          }, err => {
            reject(err)
          });
        }, err => {
          reject(err);
        })
      }, err => {
        return reject({ err: 7, msg: 'err_invalid_area' })
      })
    })
  },
  findAvailablePartners: (opts) => {
    return new Promise((resolve, reject) => {
      let { order, isOnline } = opts;
      //find busy partners
      Order.find({
        status: [Order.ORDER_STATUS.PARTNER_ACCEPT, Order.ORDER_STATUS.STARTED],
        or: [
          {
            startTime: {
              '<=': new Date(order.startTime)
            },
            endTime: {
              '>=': new Date(order.startTime)
            }
          },
          {
            startTime: {
              '<': new Date(order.endTime)
            },
            endTime: {
              '>=': new Date(order.endTime)
            }
          }
        ]
      }, { select: ['partner'] }).then(orders => {
        let listBusyPartners = [];
        orders.forEach(o => {
          if (!_.includes(listBusyPartners, o.partner)) {
            listBusyPartners.push(o.partner);
          }
        })

        log.log2File('order', `findAvailablePartners - orderid = ${order.id} & busy partners = ${JSON.stringify(listBusyPartners)}`)

        //find available partner
        let partnerQuery = {
          id: {
            '!': listBusyPartners
          },
          jobs: {
            contains: order.job
          },
          approved: true,
          isBlock: false,
          // isOnline: true
        }
        if (isOnline) partnerQuery.isOnline = isOnline;
        if (order.paymentMethod == '0') {
          partnerQuery.balance = {
            '>=': Conf.data.MIN_BALANCE_PUSH_JOB
          }
        }
        Partner.find(partnerQuery).then(partners => {
          sortPartners({ order, partners }).then(partners => {
            order.partners = [];
            partners.forEach(p => {
              order.partners.push(p.id);
            });
            order.allPartners = order.partners;
            return resolve(partners);
          })
        })
      })
    })
  }
};


let sortPartners = (opts) => {
  return new Promise((resolve, reject) => {
    let { partners, order } = opts;
    partners.forEach(partner => {
      partner.distance = common.GPSdistance(order.latitude, order.longitude, partner.latitude, partner.longitude);
    })
    partners.sort(function (x, y) {
      return x.distance - y.distance;
    })
    resolve(partners);
  })
}