/**
 * Promotion.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'string', required: true
    },
    startTime: {
      type: 'datetime',
      required: true
    },
    endTime: {
      type: 'datetime',
      required: true
    },
    type: {
      type: 'string',
      enum: ['cash', 'percent']
    },
    percent: {
      type: 'float'
    },
    fixedCash: {
      type: 'float'
    },
    maxValue: {
      type: 'float'
    },
    nUse: {
      type: 'integer', required: true
    },
    nUsed: {
      type: 'integer',
    },
    nRemain: {
      type: 'integer'
    },
    status: {
      type: 'boolean', required: true
    },
    paymentMethod: {
      type: 'string', enum: ['cash', 'percent', 'both']
    },
    job: {
      type: 'string'
    },
    usedByUsers: {
      type: 'array'
    },
    usedByOrders: {
      type: 'array'
    }
  },
  usePromotion: (promotionId, order) => {
    return new Promise((resolve, reject) => {
      Promotion.native(function (err, collection) {
        collection.update({ _id: objectid(promotionId) }, { $inc: { nUsed: 1, nRemain: -1 }, $push: { usedByUsers: user } }).then(rs => {
          resolve();
        })
      })
    })
  },
  calculatePromotion: (opts) => {
    return new Promise((resolve, reject) => {
      let startPrice = opts.price;
      //use promotion
      Promotion.find({
        status: true,
        startTime: { '<=': new Date(opts.startTime) },
        endTime: { '>=': new Date(opts.startTime) }
      }).then(promotions => {
        promotions.forEach(promotion => {
          switch (promotion.type) {
            case 'percent':
              discount = opts.price * promotion.percent / 100;
              if (discount > promotion.maxValue) {
                discount = promotion.maxValue;
              }
              // opts.desc.push(`${promotion.name}: ${discount}`);
              opts.price -= discount;
              opts.desc.push({
                type: PriceApply.TYPE.PROMOTION,
                meta: voucher.id,
                startPrice,
                endPrice: opts.price,
                discount: discount
              });
              break;
            case 'cash':
              discount = promotion.value;
              opts.price -= discount;
              opts.desc.push({
                type: PriceApply.TYPE.PROMOTION,
                meta: voucher.id,
                startPrice,
                endPrice: opts.price,
                discount: discount
              });
              break;
          }
        })
        resolve(opts);
      })
    })
  }
};

