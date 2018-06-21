/**
 * ConfigurationController
 *
 * @description :: Server-side logic for managing configurations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    findConfigs: (req, res) => {
        Conf.find().then(confs => {
            return res.json({ err: 0, confs });
        })
    },
    createConfig: (req, res) => {
        let { key, value, desc, type } = req.body;
        if (!key || !value || !type) return res.paramError();
        Conf.create({ key, value, desc, type }).then(rs => {
            res.ok();
        }, err => {
            res.paramError();
        });
    },
    editConfig: (req, res) => {
        let { confId, key, value, desc, type } = req.body;
        if (!confId || !key || !value || !type) return res.paramError();
        Conf.update({ id: confId }, { key, value, desc, type }).then(rs => {
            return res.ok();
        }, err => {
            return res.paramError();
        });
    },
    deleteConfig: (req, res) => {
        let { confId } = req.body;
        if (!confId) return res.paramError();
        Conf.destroy({ id: confId }).then(rs => {
            return res.ok();
        })
    }
};

