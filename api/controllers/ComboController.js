/**
 * ComboController
 *
 * @description :: Server-side logic for managing comboes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    find: (req, res) => {
        let { skip, limit } = req.body;
        if (skip == null || !limit) return res.paramError();
        Combo.find({ skip, limit }).then(combos => {
            let ids = [];
            combos.map(com => {
                ids.push(com.id);
            })
            ComboPricing.find({ combo: ids }).then(pricing => {
                combos.map(combo => {
                    pricing.map(price => {
                        if (price.combo == combo.id) {
                            if (!combo.price) combo.price = [];
                            combo.price.push(price);
                        }
                    })
                });
                res.json({ err: 0, combos });
            })
        })
    },
    create: (req, res) => {
        let { name, type, description, title, image } = req.body;
        if (!name || !type || !description || !title || !image) return res.paramError();
        Combo.create({ name, type, description, title }).then(() => {
            res.ok();
        })
    },
    delete: (req, res) => {
        let { id } = req.body;
        if (!id) return res.paramError();
        Combo.destroy({ id }).then(() => {
            res.ok();
        })
    },
    update: (req, res) => {
        let { id, name, type, description, title, image } = req.body;
        if (!id || !name || !type || !description || !title || !image) return res.paramError();
        Combo.update({ id }, { name, type, description, title, image }).then(() => {
            res.ok();
        })
    }
};

