/**
 * AgencyController
 *
 * @description :: Server-side logic for managing agencies
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const moment = require('moment');
module.exports = {
    findPartners: (req, res) => {
        let { skip, limit, phone } = req.body;
        //find agency
        Agency.findOne({ id: req.info.user.agency }).then(agency => {
            if (!agency) return res.json({ err: 2, msg: 'invalid_agency' });
            let query = { agency: agency.id, skip, limit };
            if (phone) Object.assign(query, { phone });
            Partner.find(query).then(partners => {
                res.json({ err: 0, partners });
            })
        })
    },
    findOrders: (req, res) => {
        let { skip, limit, partner, startTime, endTime } = req.body;
        if (skip == null || !limit) return res.paramError();
        Agency.findOne({ id: req.info.user.agency }).then(agency => {
            if (!agency) return res.paramError();
            Partner.find({ agency: agency.id }).then(partners => {
                let ids = [];
                partners.map(partner => {
                    ids.push(partner.id);
                });
                let query = { partner: ids, skip, limit };
                if (partner) Object.assign(query, { partner });
                if (startTime) Object.assign(query, { startTime: { '>=': moment(startTime).toDate() } });
                if (endTime) Object.assign(query, { startTime: { '<=': moment(startTime).toDate() } });
                Order.find(query).then(orders => {
                    res.json({ err: 0, orders })
                })
            })

        })

    },
    find: (req, res) => {
        let { skip, limit } = req.body;
        if (skip == null || !limit) return res.paramError();
        Agency.find({ skip, limit }).then(agencies => {
            res.json({ err: 0, agencies });
        })
    },
    create: (req, res) => {
        let { name, phone, email } = req.body;
        if (!name || !phone || !email) return res.paramError();
        Agency.create({ name, phone, email }).then(() => {
            res.ok();
        }, err => {
            res.paramError();
        })
    },
    update: (req, res) => {
        let { id, name, phone, email } = req.body;
        if (!id || !name || !phone || !email) return res.paramError();
        Agency.update({ id }, { name, phone, email }).then(() => {
            res.ok();
        }, err => {
            res.paramError();
        })
    },
    delete: (req, res) => {
        let { id } = req.body;
        if (!id) return res.paramError();
        Agency.destroy({ id }).then(() => {
            res.ok();
        }, err => {
            res.paramError();
        })
    }
};

