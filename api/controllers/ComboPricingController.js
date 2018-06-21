/**
 * ComboPricingController
 *
 * @description :: Server-side logic for managing combopricings
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    find: (req, res) => {
        let { skip, limit } = req.body;
        if (skip == null || !limit) return res.paramError();
        ComboPricing.find({ skip, limit }).then(pcicings => {
            res.json({ err: 0, pcicings });
        })
    },
    create: (req, res) => {
        let { combo, price, description } = req.body;
        if (!combo || !price || !description) return res.paramError();
        ComboPricing.create({ combo, price, description }).then(() => {
            res.ok();
        })
    },
    delete: (req, res) => {
        let { id } = req.body;
        if (!id) return res.paramError();
        ComboPricing.destroy({ id }).then(() => {
            res.ok();
        })
    },
    update: (req, res) => {
        let { id, combo, price, description } = req.body;
        if (!id || !combo || !price || !description) return res.paramError();
        ComboPricing.update({ id }, { combo, price, description }).then(() => {
            res.ok();
        })
    }
};

