/**
 * ServiceController
 *
 * @description :: Server-side logic for managing services
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    officerFindServices: (req, res) => {
        let { status, user, job, limit, skip } = req.body;
        if ((!skip == null) || !limit) return res.paramError();
        skip = Number(skip);
        limit = Number(limit);
        let option = { limit, skip };
        if (status) option.status = status;
        if (user) option.status = user;
        if (job) option.job = job;
        Service.find(option).then(services => {
            let users = [];
            let jobs = [];
            services.forEach(s => {
                users.push(s.user);
            })
            Customer.find({ id: users }).then(customers => {
                services.forEach(service => {
                    for (var i = 0; i < customers.length; i++) {
                        if (service.customer == customers[i].id) {
                            service.customer = customers[i];
                        }
                    }
                })
            })
            res.json({ err: 0, services })
        })
    },
    officerLockService: (req, res) => {
        let { serviceId } = req.body;
        if (!serviceId) return res.paramError();
        Service.findOne({ id: serviceId, status: 0 }).then(service => {
            if (!service) return res.json({ err: 2, msg: 'order is not exists' });
            service.status = 1;
            service.processBy = req.info.user.id;
            service.save().then(rs => {
                res.ok();
            })
        })
    },
    officerUnlockService: (req, res) => {
        let { serviceId } = req.body;
        if (!serviceId) return res.paramError();
        Service.findOne({ id: serviceId, status: 1, processBy: req.info.user.id }).then(service => {
            if (!service) return res.json({ err: 2, msg: 'order is not exists' });
            service.status = 0;
            service.processBy = req.info.user.id;
            service.save().then(rs => {
                res.ok();
            })
        })
    },
    officerProcessService: (req, res) => {
        let { serviceId } = req.body;
        if (!serviceId) return res.paramError();
        Service.findOne({ id: serviceId, status: 1, processBy: req.info.user.id }).then(service => {
            if (!service) return res.json({ err: 2, msg: 'order is not exists' });
            service.status = 2;
            service.processBy = req.info.user.id;
            service.processAt = new Date();
            service.save().then(rs => {
                res.ok();
            })
        })
    },
    customerOrderService: (req, res) => {
        let { address, services, startTime, customerNote, paymentMethod } = req.body;
        if (!address || !services || !startTime || !paymentMethod) return res.paramError();
        try {
            services = JSON.parse(services);
        } catch (err) {
            return res.paramError();
        }
        Job.find({ id: services }).then(jobs => {
            let price = 0;
            jobs.forEach(j => {
                price += Number(j.price);
            })
            Service.create({
                address,
                jobs: services,
                price,
                customer: req.info.user.id,
                status: 0, //created
                customerNote,
                paymentMethod,
                startTime
                // price: 
            }).then(order => {
                switch (paymentMethod) {
                    case 'cash':
                        res.ok();
                        break;
                    case 'online':
                        //CREATE PAYMENT URL
                        let { language } = req.body;
                        let info = { order, ip: req.clientIp, language, bankCode: '', orderType: 'service' };
                        Vnp.createPayOrderUrl(info).then(rs => {
                            res.json({ err: 0, vnpUrl: rs.vnpUrl, trans: rs.trans.id });
                        });
                        break;
                }
            }, err => {
                res.paramError();
            });
        })
    },
    customerFindServices: (req, res) => {
        let { skip, limit, startTime, endTime } = req.body;
        if (skip == null || !limit) return res.paramError();
        let query = { skip, limit, customer: req.info.user.id };
        Service.find(query).then(services => {
            Service.count(query).then(count => {
                res.json({ err: 0, services });
            })
        })
    }
};

