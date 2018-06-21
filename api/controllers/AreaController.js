/**
 * AreaController
 *
 * @description :: Server-side logic for managing areas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    create: (req, res) => {
        let { latitude, longitude, radius, name } = req.body;
        if (!latitude || !longitude || !radius || !name) return res.paramError();
        Area.create({ latitude, longitude, radius, name }).then(() => {
            res.ok();
        }, err => {
            res.paramError();
        })
    },
    find: (req, res) => {
        Area.find().then(areas => {
            res.json({ err: 0, areas });
        });
    },
    update: (req, res) => {
        let { id, latitude, longitude, radius, name } = req.body;
        if (!id || !latitude || !longitude || !radius || !name) return res.paramError();
        Area.update({ id }, { latitude, longitude, radius, name }).then(() => {
            res.ok();
        }, err => {
            res.paramError();
        })
    },
    delete: (req, res) => {
        let { id } = req.body;
        if (!id) return res.paramError();
        Area.destroy({ id }).then(() => {
            res.ok();
        }, err => {
            res.paramError();
        })
    }
};

