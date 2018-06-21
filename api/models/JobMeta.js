/**
 * JobMeta.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    job: { type: 'string', required: true },
    key: { type: 'string' },
    val: { type: 'string' }
  },
  calculateJobMeta: (opts) => {
    return new Promise((resolve, reject) => {
      let startPrice = opts.price;
      JobMeta.find({ job: opts.jobId }).then(metas => {
        //calculate duration
        for (var i = 0; i < metas.length; i++) {
          if (metas[i].key.search('hours') == -1) continue;
          if (`hours${opts.duration}` == metas[i].key) {
            opts.price = Number(metas[i].val);
            break;
          }
        }
        opts.originPrice = opts.price;
        opts.desc.push({
          type: PriceApply.TYPE.META,
          meta: metas[i].id,
          startPrice, endPrice: opts.price,
          discount: startPrice - opts.price
        });
        // opts.oldPrice = opts.price;
        return resolve(opts);
      })
    })
  }
};

