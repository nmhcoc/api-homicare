/**
 * Job.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const objectid = require('mongodb').ObjectID;
module.exports = {

  attributes: {
    name: { type: 'string', required: true },
    status: { type: 'boolean', },
    icon: { type: 'string', },
    price: { type: 'integer' },
    parent: { type: 'string' },
    description: { type: 'string' },
    title: { type: 'string' },
    type: {
      type: 'string',
      enum: ['category', 'job']
    },
    schedule: {
      type: 'string',
      enum: ['one', 'repeat', 'both']
    },
    cities: { type: 'array' },
    fee: { type: 'float' },
    fixedFee: { type: 'float' },
    commision: { type: 'float' },
    areas: { type: 'array' }
  },
  isJobAvailable: (id, lat, lng) => {
    return new Promise((resolve, reject) => {
      Job.findAvailableJobs(lat, lng).then(jobs => {
        return resolve(true);
        jobs.forEach(job => {
          if (job.id == id) {
            return resolve(true);
          }
        })
        return reject();
      })
    })
  },
  findAvailableJobs: (lat, lng) => {
    return new Promise((resolve, reject) => {
      Area.detectAreas(lat, lng).then(areas => {
        let ids = [];
        areas.forEach(area => {
          ids.push(ids.push(area.id));
        })
        Job.find().then(jobs => {
          let rs = [];
          jobs.forEach(job => {
            let intersects = _.intersection(job.areas, ids)
            if (intersects.length > 0) {
              rs.push(job);
            }
          })
          resolve(rs);
        })
      });
    });
  },
  afterDestroy: (val, cb) => {
    Partner.native((err, collection) => {
      collection.update({}, {
        $pull: {
          jobs: val.id
        }
      }).then(rs => {
        cb()
      });
    })
  },

  getPaymentFee: (opts) => {
    return new Promise((resolve, reject) => {
      let { order } = opts;
      Job.findOne({ id: order.job }).then(job => {
        job.fee = Number(job.fee);
        job.fixedFee = Number(job.fixedFee);
        let fee = order.price * job.fee / 100 + job.fixedFee;
        resolve(fee);
      })
    })
  },

  pricingJobs: (opts) => {
    let { jobId, duration, startTime, voucher, paymentMethod, saved } = opts;
    return new Promise((resolve, reject) => {
      Job.findOne({ id: jobId })
        .then(job => {
          if (!job) {
            return reject({ err: 3, desc: 'cannot find job' });
          }
          opts.job = job;
          // opts.price = job.price * duration;
          opts.price = job.price;
          opts.oldPrice = opts.price;
          opts.desc = [];
          Voucher.calculateVoucher(opts).then(opts => {
            Promotion.calculatePromotion(opts).then(opts => {
              // opts = calculateFee(opts);
              opts.err = 0;
              resolve(opts);
            }, err => {
              reject(err);
            })
          }, err => {
            reject(err);
          });
          // JobMeta.calculateJobMeta(opts).then(opts => {
          //   Voucher.calculateVoucher(opts).then(opts => {
          //     Promotion.calculatePromotion(opts).then(opts => {
          //       opts = calculateFee(opts);
          //       opts.err = 0;
          //       resolve(opts);
          //     }, err => {
          //       reject(err);
          //     })
          //   }, err => {
          //     reject(err);
          //   });
          // }, err => {
          //   res.json(err);
          // });
        });
    })
  },
  initialize: () => {
    return new Promise((resolve, reject) => {
      //create jobs
      let jobs = [{
        id: '5964908bae78430c50c4acac',
        name: "Giúp việc gia đình",
        status: true,
        fee: 3,
        fixedFee: 4000,
        category: '',
        icon: '',
        price: 1000
      },
      {
        id: '596c840fe180902aa46ccfd4',
        name: "Vệ sinh văn phòng",
        status: true,
        category: '',
        icon: '',
        price: 2000
      },
      {
        id: '597ff163320a081224111958',
        name: "Điện nước",
        status: true,
        category: '',
        icon: '',
        price: 3000
      }];
      Job.create(jobs).then(rs => {
        resolve();
      }, err => {
        reject();
      });
    });
  }
};
let calculateFee = (opts) => {
  let fee = opts.job.fee;
  let fixedFee = opts.job.fixedFee;
  let newPrice = ((opts.price + fixedFee) * 100) / (100 - fee);
  let startPrice = opts.price;
  opts.price = Math.ceil((newPrice / 1000)) * 1000;

  opts.desc.push({
    type: PriceApply.TYPE.FEE,
    startPrice,
    endPrice: opts.price,
    discount: startPrice - opts.price
  });
  // opts.price = newPrice;
  return opts;
}
// let calculateJobMeta = (opts) => {
//   return new Promise((resolve, reject) => {
//     JobMeta.find({ job: opts.jobId }).then(metas => {
//       //calculate duration
//       for (var i = 0; i < metas.length; i++) {
//         if (metas[i].key.search('hours') == -1) continue;
//         if (`hours${opts.duration}` == metas[i].key) {
//           opts.price = Number(metas[i].val);
//           break;
//         }
//       }
//       opts.desc.push(`Số tiền thực hiện ${opts.job.name} trong thời gian ${opts.duration} giờ:  ${opts.price}`);
//       opts.oldPrice = opts.price;
//       return resolve(opts);
//     })
//   })
// }

// let calculatePromotion = (opts) => {
//   return new Promise((resolve, reject) => {
//     //use promotion
//     Promotion.find({
//       status: true,
//       startTime: { '<=': new Date(opts.startTime) },
//       endTime: { '>=': new Date(opts.startTime) }
//     }).then(promotions => {
//       promotions.forEach(promotion => {
//         switch (promotion.type) {
//           case 'percent':
//             discount = opts.price * promotion.percent / 100;
//             if (discount > promotion.maxValue) {
//               discount = promotion.maxValue;
//             }
//             opts.desc.push(`${promotion.name}: ${discount}`);
//             break;
//           case 'cash':
//             discount = promotion.value;
//             opts.desc.push(`${promotion.name}: ${discount}`);
//             break;
//         }
//         opts.price -= discount;
//       })
//       resolve(opts);
//     })
//   })
// }
// let calculateVoucher = (opts) => {
//   return new Promise((resolve, reject) => {
//     if (opts.voucher) {
//       Voucher.findOne({ code: opts.voucher }).then(voucher => {
//         if (!voucher) reject({ err: 4, desc: 'invalid voucher code' });
//         let discount = 0;
//         switch (voucher.type) {
//           case 'discountPercent':
//             discount = opts.price * voucher.value / 100;
//             if (discount > voucher.maxCash) {
//               discount = voucher.maxCash;
//             }
//             opts.desc.push(`${voucher.name}: ${discount}`);
//             break;
//           case 'discountCash':
//             discount = voucher.value;
//             opts.desc.push(`${voucher.name}: ${discount}`);
//             break;
//           default: return reject({ err: 5, desc: 'invalid voucher type' });
//         }
//         opts.price -= discount;
//         return resolve(opts);
//       })
//     } else {
//       return resolve(opts);
//     }
//   })
// }