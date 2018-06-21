const _ = require('lodash')
let methods = {};
let moment = require('moment');
let process = (input) => {
  let { order, controller } = input;
  if (!order) {
    return log.file('processorder', `[SOMETHING WENT WRONG, YOU MAY DELETED ORDER INFO] [STOP CURRENT FLOW]`);
  }
  if (!input.controller) input.controller = order.controller;
  controller = input.controller;
  if (controller != order.controller) {
    log.file('processorder', `[ANOTHER PROCESS RUNNING] [${moment().format()}] [ORDER: ${order.id}] [INPUT CONTROLLER: ${controller}] [ORDER CONTROLLER: ${order.controller}]`);
    return; //new process
  }
  switch (order.status) {
    case sails.config.ORDER_STATUS.CREATE:
      status1(input);
      break;
    case sails.config.ORDER_STATUS.FINDING_PARTNER:
      status2(input);
      break;
    // case sails.config.ORDER_STATUS.PARTNER_ACCEPT:
    //   status5(input);
    //   break;
    default:
      log.file('processorder', 'unknown type');
      break;
  }
}
let status1 = (input) => {
  log.file('processorder', `[START FIND PARTNERS] [${moment().format()}] [ORDER: ${input.order.id}]`);
  let { order } = input;

  if (!input.retries) {
    input.retries = 1;
  } else {
    input.retries++;
  }
  //find busy partners
  Order.find({
    status: [sails.config.ORDER_STATUS.PARTNER_ACCEPT, sails.config.ORDER_STATUS.STARTED],
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
  }).then(orders => {
    let listBusyPartners = [order.customer];
    orders.forEach(o => {
      if (!_.includes(listBusyPartners, o.partner)) {
        listBusyPartners.push(o.partner);
      }
    })
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
      isOnline: true
    }
    if (order.paymentMethod == 'cash') {
      partnerQuery.balance = {
        '>=': sails.config.MIN_BALANCE_PUSH_JOB
      }
    }
    Partner.find(partnerQuery).then(partners => {
      if (partners.length == 0) {
        //cannot find partner
        if (input.retries >= sails.config.FIND_PARTNER_RETRIES) {
          //cannot find partner, please retry in another time
          //set status = PENDING
          order.status = sails.config.ORDER_STATUS.PENDING;
          order.save();
          //log file
          log.file('processorder', `[CANNOT FIND PARTNER=> SET ORDER PENDING] [${moment().format()}] [ORDER: ${order.id}]`);
        } else {
          log.file('processorder', `[WAIT TO RETRY] [${moment().format()}] [ORDER: ${order.id}] [RETRY: ${input.retries}]`);
          //continue finding after retries time
          setTimeout(() => {
            process(input);
          }, sails.config.PARTNER_RETRIES_TIME);
        }
      } else {
        //there're available 
        partners = _.shuffle(partners);
        //select first partner
        // let partner = partners[0];
        // order.partner = partner.id;
        // partners.splice(0, 1);
        order.partners = [];
        partners.forEach(p => {
          order.partners.push(p.id);
        });
        order.status = sails.config.ORDER_STATUS.FINDING_PARTNER;
        order.save().then(rs => {
          process(input);
        })
        //save partner and partners to order, change status to 2 <=> finding partner
      }
    })
  })
}
let status2 = (input) => {
  let { order, controller } = input;
  if (order.partners.length == 0) {
    //cannot find partner
    //update status = pending
    order.status = sails.config.ORDER_STATUS.PENDING;
    order.save();
    //log file
    sails.services.log.file('processorder', `[CANNOT FIND PARTNER] [${moment().format()}] [ORDER: ${order.id}]`);
  } else {
    let nextPartnerId = order.partners[0];
    log.file('processorder', `[PUSH TO NEXT PARTNER] [${moment().format()}] [ORDER: ${input.order.id}] [PARTNER: ${nextPartnerId}]`);
    order.partners.splice(0, 1);
    order.partner = nextPartnerId;

    //update order
    order.save().then(rs => {
      //check if next partner busy
      let query = {
        status: [sails.config.ORDER_STATUS.PARTNER_ACCEPT, sails.config.ORDER_STATUS.STARTED],
        partner: nextPartnerId,
        or: [
          {
            startTime: {
              '<=': new Date(order.startTime)
            },
            endTime: {
              '>': new Date(order.startTime)
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
      }
      Customer.findOne({ id: order.customer }).then(customerInfo => {
        Partner.findOne({ id: order.partner, isOnline: true }).then(partnerInfo => {
          if (!partnerInfo) return process({ order, controller: order.controller });
          Order.findOne(query).then(busy => {
            if (busy) {
              //next partner
              process(input);
            } else {
              //IF PARTNER IS FREE
              //push 
              let msg = {
                to: partnerInfo.firebaseToken,
                notification: {
                  title: sails.__('PUSH_NEW_JOB_TITLE'),
                  body: sails.__('PUSH_NEW_JOB_BODY')
                },
                data: Object.assign({}, order, {
                  flag: sails.config.PUSH_FLAG.PARTNER.NEW_JOB,//new job
                  customer: customerInfo,
                  orderId: order.id
                })
              }
              sails.services.common.pushNotification('partner', msg).then(() => {
                //on push success
                setTimeout(function () {
                  //refresh order
                  Order.findOne({ id: order.id }).then(order => {
                    input.order = order;
                    process(input)
                  })
                }, sails.config.PARTNER_ACCEPT_TIMEOUT);
              }, () => {
                //on push failed
                //reprocess
                input.order = order;
                process(input);
              })
            }
          })
        })
      });


    })
  }
}
let status5 = (input) => {
  let { order } = input;
  new Promise((resolve, reject) => {
    let start = moment(input.order.startTime).add(-sails.config.PARTNER_REMIND_FIRST, 'minutes');
    let now = moment();
    let duration = start.diff(now);
    if (duration > 0) {
      setTimeout(function () {
        //find customer 
        //push before 10 minutes
        process(input);
        resolve();
      }, duration);
    } else {
      let start = moment(input.order.startTime).add(-sails.config.PARTNER_REMIND_SECOND, 'minutes');
      let duration = start.diff(now);
      if (duration > 0) {
        setTimeout(function () {
          //wait for push on time
          resolve();
        }, duration);
      } else {
        //push ontime immediate
        resolve();
      }
    }
  }).then(() => {
    Customer.findOne({ id: order.customer }).then(customerInfo => {
      Partner.findOne({ id: order.partner }).then(partnerInfo => {
        //push to partner
        let msg = {
          to: partnerInfo.firebaseToken,
          notification: {
            title: sails.__('PUSH_ORDER_ONTIME_TITLE'),
            body: sails.__('PUSH_ORDER_ONTIME_BODY')
          },
          data: {
            customer: customerInfo,
            order: input.order,
            flag: sails.config.PUSH_FLAG.PARTNER.REMIND_START_TIME
          }
        }
        sails.services.common.pushNotification('partner', msg).then(() => { }, () => { });
        //push to customer
        msg = {
          to: customerInfo.firebaseToken,
          notification: {
            title: 'Nhân viên của chúng tôi sắp đến thực hiện công việc'
          },
          data: {
            partner: partnerInfo,
            order: input.order,
            flag: sails.config.PUSH_FLAG.CUSTOMER.REMIND_START_TIME
          }
        }
        sails.services.common.pushNotification('customer', msg).then(() => { }, () => { });;
      })
    })
  })
}

methods.process = process;
methods.cronReminder = () => {
  const a = moment().startOf('minute').add(30, 'minutes').toDate();
  const b = moment().endOf('minute').add(30, 'minutes').toDate();
  const c = moment().startOf('minute').add(10, 'minutes').toDate();
  const d = moment().endOf('minute').add(10, 'minutes').toDate();
  const query = {
    server: sails.config.SERVER_ID,
    status: sails.config.ORDER_STATUS.PARTNER_ACCEPT,
    startTime: {
      or: [
        {
          '>=': a,
          '<=': b
        },
        {
          '>=': c,
          '<=': d
        },
      ]
    }
  }
  Order.find(query).then(orders => {
    if (orders.length == 0) {
      return;
    }
    let customerIds = [], partnerIds = [];
    orders.forEach(order => {
      customerIds.push(order.customer);
      partnerIds.push(order.partners);
    });
    Customer.find({ id: customerIds }).then(customers => {
      Partner.find({ id: partnerIds }).then(partners => {
        orders.forEach(order => {
          let customerInfo = null, partnerInfo = null;
          //find customer info
          for (var i = 0; i < customers.length; i++) {
            if (customers[i].id == order.customer) {
              customerInfo = customers[i];
              break;
            }
          }
          //find partner info
          for (var i = 0; i < partners.length; i++) {
            if (partners[i].id == order.partner) {
              partnerInfo = partners[i];
              break;
            }
          }
          if (customer && partner) {
            let msg = {
              to: partnerInfo.firebaseToken,
              notification: {
                title: sails.__('PUSH_ORDER_ONTIME_TITLE'),
                body: sails.__('PUSH_ORDER_ONTIME_BODY')
              },
              data: {
                customer: customerInfo,
                order: input.order,
                flag: sails.config.PUSH_FLAG.PARTNER.REMIND_START_TIME
              }
            }
            common.pushNotification('partner', msg).then(() => { }, () => { });
            //push to customer
            msg = {
              to: customerInfo.firebaseToken,
              notification: {
                title: 'Nhân viên của chúng tôi sắp đến thực hiện công việc'
              },
              data: {
                partner: partnerInfo,
                order: input.order,
                flag: sails.config.PUSH_FLAG.CUSTOMER.REMIND_START_TIME
              }
            }
            common.pushNotification('customer', msg).then(() => { }, () => { });
          }
        })
      })
    })
  });
}
module.exports = methods;