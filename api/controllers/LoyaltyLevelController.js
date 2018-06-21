/**
 * LoyaltyLevelController
 *
 * @description :: Server-side logic for managing loyaltylevels
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    findUpdate: (req, res) => {
        LoyaltyLevel.find().then(ranks => {
            res.json({ err: 0, ranks });
        })
    },
    findCache: (req, res) => {
        LoyaltyLevel.findCache().then(ranks => {
            res.json({ err: 0, ranks });
        })
    },
    getNextRank: (req, res) => {
        LoyaltyLevel.getNextRank(req.info.user).then(rank => {
            rank.err = 0;
            res.json(rank);
        })
    },
    create: (req, res) => {
        let { name, description, pointPerMonth, symbol } = req.body;
        if (!name || !description || pointPerMonth == null || !symbol) return res.paramError();
        LoyaltyLevel.create({ name, description, pointPerMonth, symbol }).then(() => {
            res.ok();
        }, err => {
            res.paramError();
        })
    },
    update: (req, res) => {
        let { id, name, description, pointPerMonth, symbol } = req.body;
        if (!id || !name || !description || pointPerMonth == null || !symbol) return res.paramError();
        LoyaltyLevel.update({ id }, { name, description, pointPerMonth, symbol }).then(() => {
            res.ok();
        }, err => {
            res.paramError();
        })
    },
    delete: (req, res) => {
        let { id } = req.body;
        if (!id) return res.paramError();
        LoyaltyLevel.destroy({ id }).then(() => {
            res.ok();
        })
    }
};

