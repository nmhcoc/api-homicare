/**
 * ComboOrderController
 *
 * @description :: Server-side logic for managing comboorders
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    order: (req, res) => {
        let { combo, price, customerNote, voucher, dependency, paymentMethod, address, startTime } = req.body;
        if (!combo) return res.paramError();
        ComboOrder.create({ combo, price, customerNote, voucher, dependency, paymentMethod, address, startTime }).then(() => {
            res.ok();
        })
    },
    find: (req, res) => {
        let { skip, limit } = req.body;
        if (skip == null || !limit) return res.paramError();
        ComboOrder.find({ skip, limit, customer: req.info.user.id }).then(combos => {
            res.json({ err: 0, combos });
        })
    }
};

