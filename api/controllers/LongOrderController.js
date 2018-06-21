/**
 * LongOrderController
 *
 * @description :: Server-side logic for managing longorders
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    customerCreateLongOrder: (req, res) => {
        let { job, dependency, startTime, endTime, customerNote, address } = req.body;
        if (!job || !dependency || !startTime || !endTime || !address) return res.paramError();
        LongOrder.create({ job, dependency, startTime, endTime, customer: req.info.user.id, customerNote, address }).then(order => {
            res.ok();
        }, err => {
            res.paramError();
        })
    },
    customerFindLongOrders: (req, res) => {
        let { status, startTime, endTime, limit, skip } = req.body;
        if (!limit || skip == null) return res.paramError();
        LongOrder.find({ customer: req.info.user.id, skip, limit, sort: 'createdAt DESC' }).then(longOrders => {
            res.json({ err: 0, longOrders });
        })
    },
    officerFindLongOrders: (req, res) => {
        let { customer, dependency, startTime, endTime, limit, skip } = req.body;
        if (!limit || skip == null) return res.paramError();
        let query = { skip, limit, sort: 'createdAt DESC' };
        if (customer) {
            query.customer = customer;
        }
        if (dependency) {
            query.dependency = dependency;
        }
        if (startTime) {
            query.endTime = {
                '>=': new Date(startTime)
            }
        }
        if (endTime) {
            query.startTime = {
                '<=': new Date(endTime)
            }
        }
        LongOrder.find(query).then(longOrders => {
            let ids = [];
            longOrders.forEach(order => {
                ids.push(order.customer);
            })
            Customer.find({ id: ids }).then(customers => {
                longOrders.forEach(order => {
                    for (var i = 0; i < customers.length; i++) {
                        if (order.customer == customers[i].id) {
                            order.customer = customers[i];
                        }
                    }
                });
                LongOrder.count(query).then(count => {
                    res.json({ err: 0, count, longOrders });
                })
            })

        })
    },
    officerProcessLongOrder: (req, res) => {
        let { longOrderId, dependency, resolveStartTime, resolveEndTime, officerNote, company } = req.body;
        if (!longOrderId || !dependency || !resolveEndTime || !resolveStartTime || !officerNote) return res.paramError();
        LongOrder.findOne({ id: longOrderId, status: 1, processBy: req.info.user.id }).then(longOrder => {
            if (!longOrder) return res.json({ err: 2, msg: 'order is process by another dispatcher' });
            longOrder.dependency = dependency;
            longOrder.resolveEndTime = resolveEndTime;
            longOrder.resolveStartTime = resolveStartTime;
            longOrder.officerNote = officerNote;
            longOrder.company = company;
            longOrder.processedAt = new Date();
            longOrder.status = 2;
            longOrder.save().then(rs => res.ok());
        })
    },
    officerLockLongOrder: (req, res) => {
        let { longOrderId } = req.body;
        if (!longOrderId) return res.paramError();
        LongOrder.findOne({ id: longOrderId, status: 0 }).then(longOrder => {
            if (!longOrder) return res.json({ err: 2, msg: 'order is process by another user' });
            longOrder.status = 1;
            longOrder.processBy = req.info.user.id;
            longOrder.save().then(rs => res.ok());
        });
    },
    officerUnLockLongOrder: (req, res) => {
        let { longOrderId } = req.body;
        if (!longOrderId) return res.paramError();
        LongOrder.findOne({ id: longOrderId, status: 1, processBy: req.info.user.id }).then(longOrder => {
            if (!longOrder) return res.json({ err: 2, msg: 'something went wrong' });
            longOrder.status = 0;
            longOrder.save().then(rs => res.ok());
        });
    }
};

