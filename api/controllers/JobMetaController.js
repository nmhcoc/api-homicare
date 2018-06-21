/**
 * JobMetaController
 *
 * @description :: Server-side logic for managing jobmetas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    findJobMetas: (req, res) => {
        JobMeta.find().then(metas => {
            res.json({ err: 0, metas });
        })
    },
    createJobMeta: (req, res) => {
        let { job, key, val } = req.body;
        if (!job || !key || !val) return res.paramError();
        JobMeta.create({ job, key, val }).then(rs => {
            res.ok();
        }, err => {
            res.json({ err: 2, msg: 'invalid key' })
        })
    },
    deleteJobMeta: (req, res) => {
        let { metaId } = req.body;
        if (!metaId) return res.paramError();
        JobMeta.destroy({ id: metaId }).then(rs => {
            res.ok();
        })
    },
    editJobMeta: (req, res) => {
        let { metaId, key, val } = req.body;
        if (!metaId || !key || !val) return res.paramError();
        JobMeta.update({ id: metaId }, { key, val }).then(rs => res.ok(), rs => res.json({ err: 2, msg: "invalid key" }));
    }
};

