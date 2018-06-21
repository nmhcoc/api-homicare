/**
 * LoyaltyController
 *
 * @description :: Server-side logic for managing loyalties
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    // register: (req, res) => {
    //     let { type, id } = req.body;
    //     if (!type || !id) return res.paramError();
    //     switch (type) {
    //         case 'customer':
    //             Customer.findOne({ id }).then(user => {
    //                 Loyalty.register({ type, user }).then(() => {
    //                     res.ok();
    //                 }, err => {
    //                     res.json(err);
    //                 });
    //             })
    //             break;
    //         case 'partner':
    //             Partner.findOne({ id }).then(user => {
    //                 Loyalty.register({ type, user }).then(() => {
    //                     res.ok();
    //                 }, err => {
    //                     res.json(err);
    //                 });
    //             })
    //             break;
    //     }

    // },
    myPromotions: (req, res) => {
        let { skip, limit } = req.body;
        if (skip == null || !limit) return res.paramError();
        Loyalty.myPromotions({ type: req.info.client.name, user: req.info.user, skip, limit }).then(rs => {
            res.json(rs);
        }, err => {
            res.json(err);
        })
    },
    getCode: (req, res) => {
        let { promotionId } = req.body;
        if (!promotionId) return res.paramError();
        Loyalty.getCode({ type: req.info.client.name, user: req.info.user, promotionId }).then(rs => {
            res.json(rs);
        }, err => {
            res.json(err);
        })
    },
    comment: (req, res) => {
        let { content, promotionId } = req.body;
        if (!content || !promotionId) return res.paramError();
        Loyalty.comment({ type: req.info.client.name, user: req.info.user, content, promotionId }).then(rs => {
            res.json(rs);
        }, err => {
            res.json(err);
        })
    },
    rate: (req, res) => {
        let { promotionId, rate } = req.body;
        if (!promotionId || !rate) return res.paramError();
        Loyalty.rate({ type: req.info.client.name, user: req.info.user, rate, promotionId }).then(rs => {
            res.json(rs);
        }, err => {
            res.json(err);
        })
    }
};

