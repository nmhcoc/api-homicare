/**
 * CancelReasonController
 *
 * @description :: Server-side logic for managing cancelreasons
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    findCancelReasons: (req, res) => {
        let { type } = req.body;
        let query = {};
        if (type) {
            query.type = type;
        }
        CancelReason.find(query).then(cancelReasons => {
            res.json({ err: 0, cancelReasons })
        })
    },
    createCancelReason: (req, res) => {
        let { type, reason } = req.body;
        CancelReason.create({ type, reason }).then(rs => {
            res.ok();
        })
    },
    deleteCancelReason: (req, res) => {
        let { cancelReasonId } = req.body;
        if (!cancelReasonId) return res.paramsError();
        CancelReason.destroy({ id: cancelReasonId }).then(rs => res.ok())
    },
    editCancelReason: (req, res) => {
        let { cancelReasonId, type, reason } = req.body;
        CancelReason.update({ id: cancelReasonId }, { type, reason }).then(rs => {
            res.ok();
        }, err => {
            res.attrsError();
        })
    }
};

