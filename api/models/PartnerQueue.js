/**
 * PartnerQueue.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
let queue = [];
const moment = require('moment');
module.exports = {
  SLEEPING_TIME: 5000,
  attributes: {
    partner: {
      type: 'string', required: true
    },
    jobs: {
      type: 'array', required: true
    },
    districtsOfWorking: {
      type: 'array'
    },
    controller: { type: 'string', defaultsTo: sails.config.SERVER_ID },
    status: {
      type: 'string',
      enum: ['created', 'processing', 'done'],
      defaultsTo: 'created'
    },
    process: {
      type: 'string', defaultsTo: 'waiting...'
    }
  },
  bootstrap: () => {
    return new Promise((resolve, reject) => {
      nextPartner();
      resolve();
    })
  }
};

let nextPartner = () => {
  PartnerQueue.findOne({ status: 'created', controller: sails.config.SERVER_ID }).then(item => {
    if (!item) {
      // log.file('partnerQueue', ` [NO PARTNER IN QUEUE, WAITING FOR NEXT RUN]`);
      return setTimeout(() => {
        nextPartner()
      }, PartnerQueue.SLEEPING_TIME);
    }
    //find all pending orders
    let time = moment().add(30, 'minutes').toDate();
    Order.find({ job: item.jobs, status: Order.ORDER_STATUS.PENDING, startTime: { '>': time }, server: sails.config.SERVER_ID }).then(pendingOrders => {
      if (pendingOrders.length == 0) {
        // log.file('partnerQueue', ` [NO ORDER IS PENDING, SET CURRENT ITEM STATUS=DONE AND GO NEXT PARTNER]`);
        item.status = 'done';
        item.process = 'no order pending'
        return item.save().then(rs => {
          nextPartner();
        });
      }

      //find all upcoming partner's orders
      Order.find({ partner: item.partner, status: [Order.ORDER_STATUS.PARTNER_ACCEPT, Order.ORDER_STATUS.STARTED], server: sails.config.SERVER_ID }).then(upcomingOrders => {
        let foundValidOrder = true;
        let validOrder = null;
        for (var i = 0; i < pendingOrders.length; i++) {
          foundValidOrder = true;
          let pending = pendingOrders[i];
          upcomingOrders.forEach(upcoming => {
            if ((pending.startTime >= upcoming.startTime && pending.startTime <= upcoming.endTime) ||
              (pending.endTime >= upcoming.startTime && pending.endTime <= upcoming.endTime)) {
              foundValidOrder = false;
            }
          })
          if (foundValidOrder) {
            validOrder = pending;
            break;
          }
        }
        if (!validOrder) {
          item.status = 'done';
          item.process = 'cannot find valid order';
          return item.save().then(rs => {
            nextPartner();
          })
        } else {
          validOrder.partners = [item.partner];
          validOrder.allpartners = [item.partner];
          Order.nextPartner(validOrder.id, validOrder);
          item.status = 'done';
          item.process = 'Found order and pushed';
          item.save().then(() => {
            nextPartner();
          })
          // validOrder.partner = item.partner;
          // validOrder.status = Order.ORDER_STATUS.FINDING_PARTNER;//finding partner
          // validOrder.save().then(rs => {
          //   item.status = 'done';
          //   item.process = 'found order and pushed'
          //   item.save().then(rs => {
          //     log.file('partnerQueue', ` [SAVE PARTNER STATUS = DONE] [PARTNER=${item.partner}]`);
          //     nextPartner();
          //   })
          //   log.file('partnerQueue', ` [FOUND ORDER MATCH PARTNER=> PUSH NEW JOB] [ORDER: ${validOrder.id}] [PARTNER: ${item.partner}]`);
          //   Push.pushNewJob({ order: validOrder }).then(() => {
          //     //success
          //   }, err => {
          //     validOrder.status = Order.ORDER_STATUS.PENDING;
          //     validOrder.save();
          //   });
          //   setTimeout(() => {
          //     Order.findOne({ id: validOrder.id, status: Order.ORDER_STATUS.FINDING_PARTNER }).then(validOrder => {
          //       if (!validOrder) return;
          //       validOrder.status = Order.ORDER_STATUS.PENDING;
          //       validOrder.save();
          //     });
          //   }, Conf.data.PARTNER_ACCEPT_TIMEOUT)
          // })
        }
      })
    })
  })
}