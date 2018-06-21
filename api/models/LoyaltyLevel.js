/**
 * LoyaltyLevel.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const moment = require('moment');
module.exports = {

  attributes: {
    name: { type: 'string', required: true },
    description: { type: 'string', required: true },
    pointPerMonth: { type: 'integer', required: true },
    symbol: { type: 'string', required: true, defaultsTo: 't' }
  },
  findCache: () => {
    return new Promise((resolve, reject) => {
      let ranks = cache.get('ranks');
      if (ranks) return resolve(ranks);
      LoyaltyLevel.find({ sort: 'pointPerMonth asc' }).then(ranks => {
        return resolve(ranks);
      })
    })
  },
  getNextRank: (user, time) => {
    return new Promise((resolve, reject) => {
      if (!time) time = moment();
      //find first month point
      PointHistory.findOne({
        user: user.id,
        createdAt: {
          '<': time.startOf('month').toDate()
        },
        sort: 'createdAt DESC'
      }).then(history => {
        let firstPoint = 0;
        if (history) firstPoint = history.currentPoint;
        let point = user.loyaltyPoint - firstPoint;
        LoyaltyLevel.findCache().then(ranks => {
          let nextRank = ranks[0];
          let currentIndex = 0;
          for (var i = 0; i < ranks.length; i++) {
            if (point < ranks[i].pointPerMonth) {
              nextRank = ranks[i];
              currentIndex = i - 1;
              break;
            }
          }
          resolve({ currentRank: ranks[currentIndex], nextRank, nextPoint: nextRank.pointPerMonth - point });
        })
      })
    })
  },
  ranking: () => {
    let lastDay = moment().subtract(2, 'days');
    Customer.find().then(customers => {
      customers.forEach(customer => {
        if (!customer.loyaltyPoint) customer.loyaltyPoint = 0;
        LoyaltyLevel.getNextRank(customer, lastDay).then(rs => {
          Customer.update({ id: customer.id }, { loyaltyLevel: rs.currentRank.symbol }).then(() => { });
        });
      })
    })
  }
};

