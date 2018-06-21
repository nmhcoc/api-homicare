/**
 * PromotionController
 *
 * @description :: Server-side logic for managing promotions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    customerFindPromotions: (req, res) => {

    },
    findPromotions: (req, res) => {
        let { skip, limit } = req.body;
        if (skip == null || !limit) return res.paramError();
        let query = { skip, limit };
        Promotion.find(query, { select: ['name', 'startTime', 'endTime'] }).then(promotions => {
            Promotion.count(query).then(count => {
                res.json({ err: 0, promotions, count });
            })
        })
    },
    adminCreatePromotion: (req, res) => {
        let { name, startTime, endTime, type, percent, fixedCash, maxValue, nUse, status } = req.body;
        if (!name || !startTime || !endTime || !type || !percent || !fixedCash || !maxValue || !nUse) return res.paramError();
        Promotion.create({ name, startTime, endTime, type, percent, fixedCash, maxValue, nUse, status }).then(rs => {
            res.ok();
        }, info => {
            res.json({ err: 1, desc: 'parameter', info })
        })
    },
    adminFindPromotions: (req, res) => {
        let { name, limit, skip, startTime, endTime, type, percent, fixedCash, maxValue, nUse, status } = req.body;
        if (skip == null || !limit) return res.paramsError();
        let query = { skip, limit };
        if (startTime) {
            query.endTime = {
                '>=': new Date(startTime)
            }
        }
        if (endTime) {
            query.startTime = {
                '<=': new Date(endTime)
            }
        }
        if (name) {
            query.name = { contains: name }
        }
        if (type) {
            query.type = type;
        }
        if (percent) {
            query.percent = percent;
        }
        if (fixedCash) {
            query.fixedCash = fixedCash;
        }
        if (maxValue) {
            query.maxValue = maxValue;
        }
        if (nUse) {
            query.nUse = nUse;
        }
        if (status) {
            query.status = status;
        }
        Promotion.find(query).then(promotions => {
            Promotion.count(query).then(count => {
                res.json({ err: 0, promotions, count });
            })
        })
    },
    adminDeletePromotion: (req, res) => {
        let { promotionId } = req.body;
        if (!promotionId) return res.paramsError();
        Promotion.findOne({ id: promotionId }).then(promotion => {
            if (!promotion) return res.json({ err: 2, desc: 'promotion is not exists' });
            promotion.status = false;
            promotion.save().then(rs => {
                res.ok();
            })
        })
    },

};

