/**
 * Voucher.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
let objectid = require('mongodb').ObjectID;
const moment = require('moment');
module.exports = {
  attributes: {
    name: {
      type: 'string', required: true
    },
    desc: {
      type: 'string'
    },
    code: {
      type: 'string', required: true
    },
    nUse: {
      type: 'integer', required: true
    },
    nUsed: {
      type: 'integer', required: true
    },
    nRemain: {
      type: 'integer', required: true
    },
    limitADay: {
      type: 'integer',
    },
    startTime: {
      type: 'datetime', required: true
    },
    endTime: {
      type: 'datetime', required: true
    },
    type: {
      type: 'string', required: true,
      enum: ['discountPercent', 'gift', 'discountCash']
    },
    value: {
      type: 'float', required: true
    },
    maxCash: {
      type: 'float', required: true,
    },
    status: {
      type: 'boolean', required: true
    },
    usedByDates:{
      type: 'array'
    },
    usedByUsers: {
      type: 'array'
    },
    phone: { type: 'string' },
    useVoucher: (user, order) => {
    }
  },
  useVoucher: (voucher, user) => {
    return new Promise((resolve, reject) => {
      Voucher.native(function (err, collection) {
        collection.update({ _id: objectid(voucher.id) }, { $inc: { nUsed: 1, nRemain: -1 }, $addToSet: { usedByUsers: user } }).then(rs => {
          resolve();
        })
      })
    })
  },
  increaseNumberOfUsed: (voucher, inc) => {
    return new Promise((resolve, reject) => {
      Voucher.native(function (err, collection) {
        collection.update({ _id: objectid(voucher) }, { $inc: { nUsed: inc, nRemain: -inc }}).then(rs => {
          resolve();
        })
      })
    })
  },
  calculateVoucher: (opts) => {
    return new Promise((resolve, reject) => {
      let startPrice = opts.price;
      log.log2File('voucher', `calculateVoucher - opts = ${JSON.stringify(opts)}`);
      if (opts.voucher) {
        let query = {
          code: opts.voucher,
          nRemain: { '>': 0 },
          endTime: { '>=': new Date() },
          startTime: { '<=': new Date() }
        }
        Voucher.findOne(query).then(voucher => {
          if (!voucher)
            return reject({ err: 4, desc: 'invalid voucher code' });
          
          var u_by_d = voucher.usedByDates || [];
          if (voucher.limitADay) {
            log.log2File('voucher', `calculateVoucher - 000 ${JSON.stringify(voucher)}`);
            let currentDate = moment().startOf('day').toDate().toISOString();
            let lastCount = u_by_d.length ? u_by_d[u_by_d.length - 1] : {};
            if (lastCount.date == currentDate && lastCount.count >= voucher.limitADay) {
              return reject({err: 4, desc: 'The number of voucher has reached to limit today'});
            }
            if (!u_by_d.length || lastCount.date != currentDate) {
              u_by_d.push({ date: currentDate, count: 1 });
            } else{
              u_by_d[u_by_d.length - 1].count += 1
            }
          }
          let discount = 0;
          switch (voucher.type) {
            case 'discountPercent':
              discount = opts.price * voucher.value / 100;
              if (discount > voucher.maxCash) {
                discount = voucher.maxCash;
              }
              opts.price -= discount;
              opts.desc.push({
                type: PriceApply.TYPE.VOUCHER,
                meta: voucher.id,
                startPrice,
                endPrice: opts.price,
                discount: startPrice - opts.price
              });
              // opts.desc.push(`${voucher.name}: ${discount}`);
              break;
            case 'discountCash':
              discount = voucher.value;
              // opts.desc.push(`${voucher.name}: ${discount}`);
              opts.price -= discount;
              opts.desc.push({
                type: PriceApply.TYPE.VOUCHER,
                meta: voucher.id,
                startPrice,
                endPrice: opts.price,
                discount: startPrice - opts.price
              });
              break;
            default: return reject({ err: 5, msg: 'err_invalid_voucher' });
          }

          voucher.nRemain -= 1;
          voucher.nUsed += 1;
          if(voucher.limitADay && u_by_d.length)
            voucher.usedByDates = u_by_d;
          voucher.save().then((rs) => {
            log.log2File('voucher', `calculateVoucher - opts after = ${JSON.stringify(opts)}`)
            return resolve(opts);
          },(err) => {
            return reject({ err: 5, msg: 'err_invalid_voucher' });
          })
        })
      } else {
        return resolve(opts);
      }
    })
  }
};

