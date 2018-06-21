/**
 * FreeTimeController
 *
 * @description :: Server-side logic for managing freetimes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const moment = require('moment');
module.exports = {
    partnerFindFreeTime: (req, res) => {
        FreeTime.find({ user: req.info.user.id }, { select: ['date', 'shift'] }).then(freetime => {
            res.json({ err: 0, freetime })
        })
    },
    partnerRegisterFreeTime: (req, res) => {
        let { data } = req.body;
        if (!data) return res.paramError();
        FreeTime.destroy({
            user: req.info.user.id
        }).then(rs => {
            let days = [];
            data.forEach(day => {
                day.date = new Date(day.date);
                day.user = req.info.user.id;
            })
            FreeTime.native((err, collection) => {
                collection.insert(data).then(rs => {
                    res.ok();
                })
            })
        })
    },
    adminFindFreeTime: (req, res) => {
        let { partnerId } = req.body;
        if (!partnerId) return res.paramsError();
        FreeTime.find({ user: partnerId }, { select: ['date', 'shift'] }).then(freetime => {
            res.json({ err: 0, freetime });
        })
    }
};

