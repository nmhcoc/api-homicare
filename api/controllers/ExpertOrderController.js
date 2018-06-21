/**
 * ExpertOrderController
 *
 * @description :: Server-side logic for managing expertorders
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    customerCreateExpertOrder: (req, res) => {
        let { job, expert, date, shift } = req.body;
        if (!job || !expert || !date || !shift) return res.paramError();
        ExpertOrder.create({ job, expert, date, shift, customer: req.info.user.id }).then(expert => {
            res.ok();
        })
    },
    customerFindExpertOrders: (req, res) => {
        let { skip, limit, startTime, endTime } = req.body;
        if (skip == null || !limit) return res.paramError();
        let query = { skip, limit, customer: req.info.user.id };
        if (startTime) {
            query.date = { '>': new Date(startTime) };
        }
        if (endTime) {
            query.date = { '<': new Date(endTime) };
        }
        ExpertOrder.find(query).then(expertOrders => {
            let ids = [];
            expertOrders.forEach(order => {
                ids.push(order.expert)
            });
            Expert.find({ id: ids }).then(experts => {

                let ids = [];
                experts.forEach(expert => {
                    if (!expert.companies) expert.companies = []
                    expert.companies.forEach(com => {
                        if (!_.includes(ids, com)) {
                            ids.push(com)
                        }
                    })
                });
                Company.find({ id: ids }, { select: ['name', 'address', 'avatar', 'phone'] }).then(companies => {
                    companies.forEach(company => {
                        for (var i = 0; i < experts.length; i++) {
                            let expert = experts[i];
                            if (_.includes(expert.companies, company.id)) {
                                if (!expert.companyInfos) expert.companyInfos = [];
                                expert.companyInfos.push(company);
                            }
                        }
                    })
                    expertOrders.forEach(order => {
                        for (var i = 0; i < experts.length; i++) {
                            if (experts[i].id == order.expert) {
                                order.expert = experts[i];
                            }
                        }
                    });
                    res.json({ err: 0, expertOrders });
                })
            })

        })
    },
    officerFindExpertOrders: (req, res) => {
        let { skip, limit, startTime, endTime, customer } = req.body;
        if (!skip == null || !limit) return res.paramError();
        let query = { skip, limit, sort: 'createdAt DESC' };
        if (startTime) {
            query.date = { '>': new Date(startTime) };
        }
        if (endTime) {
            query.date = { '<': new Date(endTime) };
        }
        if (customer) {
            query.customer = customer;
        }
        ExpertOrder.find(query).then(orders => {
            let ids = [], listCustomers = [];
            orders.forEach(e => {
                ids.push(e.expert);
                listCustomers.push(e.customer);
            })
            Expert.find({ id: ids }).then(experts => {
                Customer.find({ id: listCustomers }).then(customers => {
                    orders.forEach(order => {
                        for (var i = 0; i < experts.length; i++) {
                            if (order.expert == experts[i].id) {
                                order.expert = experts[i];
                            }
                        }
                        for (var i = 0; i < customers.length; i++) {
                            if (order.customer == customers[i].id) {
                                order.customer = customers[i];
                            }
                        }
                    });
                    ExpertOrder.count(query).then(count => {
                        res.json({ err: 0, orders, count });
                    })
                })

            })

        })
    },
    officerLockExpertOrder: (req, res) => {
        let { expertOrderId } = req.body;
        if (!expertOrderId) return res.paramError();
        ExpertOrder.findOne({ id: expertOrderId }).then(expertOrder => {
            if (!expertOrder) return res.json({ err: 2, msg: 'order is not exists' });
            expertOrder.status = 1;
            expertOrder.bookedBy = req.info.user.id;
            expertOrder.save().then(rs => {
                res.ok();
            })
        })
    },
    officerUnlockExpertOrder: (req, res) => {
        let { expertOrderId } = req.body;
        if (!expertOrderId) return res.paramError();
        ExpertOrder.findOne({ id: expertOrderId, status: 1, bookedBy: req.info.user.id }).then(expertOrder => {
            if (!expertOrder) return res.json({ err: 2, msg: 'order is not exists' });
            expertOrder.status = 0;
            expertOrder.bookedBy = req.info.user.id;
            expertOrder.save().then(rs => {
                res.ok();
            })
        })
    },
    officerBookExpertOrder: (req, res) => {
        let { expertOrderId, bookedTime, officerNote } = req.body;
        if (!expertOrderId || !bookedTime || !officerNote) return res.paramError();
        ExpertOrder.findOne({ id: expertOrderId, status: 1, bookedBy: req.info.user.id }).then(expertOrder => {
            if (!expertOrder) return res.json({ err: 2, msg: 'order is not exists' });
            expertOrder.status = 2;
            expertOrder.bookedBy = req.info.user.id;
            expertOrder.bookedAt = new Date();
            expertOrder.bookedTime = bookedTime;
            expertOrder.officerNote = officerNote;
            expertOrder.save().then(rs => {
                res.ok();
            })
        })
    }
};

