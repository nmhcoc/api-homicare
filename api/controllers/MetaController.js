/**
 * MetaController
 *
 * @description :: Server-side logic for managing metas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    findJobAndCategories: (req, res) => {
        Job.find().then(jobs => {
            Category.find().then(categories => {
                CancelReason.find({ type: req.info.client.name }, { select: ['reason'] }).then(cancelReasons => {
                    res.json({ err: 0, jobs, categories, cancelReasons })
                })
            })
        })
    }
};

