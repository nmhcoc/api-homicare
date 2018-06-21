/**
 * PointHistoryController
 *
 * @description :: Server-side logic for managing pointhistories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    find: (req, res) => {
        let { skip, limit } = req.body;
        if (skip == null || !limit) return res.paramError();
        PointHistory.find({ user: req.info.user.id }).then(points => {
            res.json({ err: 0, points });
        })
    }
};

