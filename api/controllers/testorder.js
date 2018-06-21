/**
 * OrderController
 *
 * @description :: Server-side logic for managing orders
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
let _ = require('lodash');
let moment = require('moment');
let objectid = require('mongodb').ObjectID;
const sharp = require('sharp');
const path = require('path');
module.exports = {
    customerRateOrder: (req, res) => {
        let { orderId, rate } = req.body;
        if (!orderId || !rate) return res.paramError();
        //find order
        Order.findOne({ id: orderId }).then(order => {
            if (!order) return res.json({ err: 2, desc: 'order is not exists' });
            if (order.customer != req.info.user.id) return res.json({ err: 3, desc: 'customer is not owner' });
            if (order.rate) return res.json({ err: 4, desc: 'order is already rated' });
            order.rate = true;
            order.save().then(rs => {
                //find partner info
                User.findOne({ id: order.partner }).then(partner => {
                    if (!partner.nRate) partner.nRate = 1;
                    if (!partner.totalRate) partner.totalRate = rate;
                    if (!partner.totalTime) partner.totalTime = order.duration;
                    if (!partner.averangeRating) partner.averangeRating = rate;
                    partner.nRate++;
                    partner.totalRate += rate;
                    partner.totalTime += order.duration;
                    partner.averangeRating = partner.totalRate / partner.nRate;
                    partner.save().then(rs => {
                        res.ok();
                    })
                })
            })

        })
    },

    customerReportOrder: (req, res) => {
        let { orderId, content } = req.body;
        if (!orderId || !content) return res.paramError();
        Order.findOne({ id: orderId }).then(order => {
            if (order.customer != req.info.user.id) return res.json({ err: 2, desc: 'customer is not owner' });
            order.report = content;
            User.increasePartnerReport(order.partner).then(rs => {
                res.ok();
            })
        })
    },
    pricing: (req, res) => {
        let { jobId, duration, startTime, voucher, paymentMethod } = req.body;
        Order.pricingByJob({ jobId, duration, startTime, voucher, paymentMethod }).then(price => {
            res.json(price);
        }, err => {
            res.json(err);
        })
    },
    customerCancelOrder: (req, res) => {
        let { orderId, reason } = req.body;
        if (!orderId) return res.paramError();
        Order.findOne({ id: orderId }).then(order => {
            if (!order) return res.json({ err: 2, desc: 'order is not exist' }); //order not exists
            if (order.customer != req.info.user.id) return res.json({ err: 3, desc: 'customer is not owner' }); //customer is not owner
            let time = moment(order.startTime).add(-10, 'minutes').toDate();
            let now = new Date();
            if (now > time) {
                return res.json({ err: 4, desc: 'invalid time' }); //cannot cancel before 30 minutes
            }
            //update order status = 9
            order.status = 9;
            order.customerCancelReason = reason;
            order.save().then(rs => {
                res.ok();
            });

            //push notification to partner
            User.findOne({ id: order.partner }).then(partner => {
                if (!partner) return console.log('cannot find customer to push');
                let msg = {
                    to: partner.partnerFirebaseToken,
                    notification: {
                        title: 'Khách hàng đã hủy lịch',
                        body: '!'
                    },
                    data: {
                        customer: req.info.user,
                        order,
                        flag: sails.config.PUSH_FLAG.PARTNER.CUSTOMER_CANCEL_JOB
                    }
                }
                sails.services.common.pushNotification('partner', msg).then(() => { }, () => { });
            })
        })
    },

    customerCreateOrder: (req, res) => {
        let { district, address, startTime, duration, job, customerNote, paymentMethod, voucher } = req.body;
        if (!duration) duration = 2;
        if (!paymentMethod) paymentMethod = 'cash';
        if (!district || !address || !startTime || !duration || !job || !paymentMethod) return res.paramError();
        startTime = moment(startTime).toDate();
        let nextTime = moment().add(10, 'minutes').toDate();
        if (startTime < nextTime) return res.json({ err: 2, desc: 'invalid time' }); //invalid time
        let endTime = moment(startTime).add(duration, 'hours').toDate();
        Order.pricingByJob({ jobId: job, duration, startTime, voucher, paymentMethod }).then(priceInfo => {
            let { price } = priceInfo;
            //check money
            // ì (paymentMethod != 'cash'){

            // }
            //check valid
            new Promise((resolve, reject) => {
                //user have enough money
                resolve();
            }).then(rs => {
                let query = {
                    customer: req.info.user.id,
                    startTime,
                    duration, district, customerNote, address, job, endTime, price, paymentMethod,
                    status: 1,
                    controller: sails.services.auth.createTokenString(),
                    server: sails.config.SERVER_ID
                };
                Order.create(query).then(order => {
                    res.ok();
                    let input = {
                        order,
                        controller: order.controller,
                        server: order.server
                    }
                    sails.services.processorder.process(input);
                });
            }, err => {
                res.json({ err: 3, desc: 'insuffient fund' })
            })

        }, err => {
            res.json(err);
        })

    },

    partnerUploadReport: (req, res) => {
        let { orderId } = req.body;
        if (!orderId) return res.paramError(); //parameter error
        if (!req.file('file')) return res.paramError();
        Order.findOne({ id: orderId, partner: req.info.user.id }).then(order => {
            if (!order) return res.json({ err: 2, desc: 'user is not owner' });
            if (!req.file('file')) return res.paramError();
            req.file('file').upload({
                dirname: path.join(sails.services.common.getImageFolder(), 'report')
            }, (err, uploadedFiles) => {
                if (!uploadedFiles || uploadedFiles.length == 0) { return res.paramError() }
                let reports = [];
                if (!order.reports) order.reports = [];
                uploadedFiles.forEach(f => {
                    order.reports.push(`report/${path.basename(f.fd)}`);
                })
                order.save().then(rs => {
                    res.ok();
                })
            });
        })
    },

    partnerFinishOrder: (req, res) => {
        let { orderId, partnerNote } = req.body;
        if (!orderId) return res.paramError();
        Order.findOne({ id: orderId, status: 5 }).then(order => {
            if (!order) return res.json({ err: 2, desc: 'order is not exists' }); //order not exists
            if (order.partner != req.info.user.id) return res.json({ err: 3, desc: 'partner is not owner' }); //partner is not owner
            //update order status = 6 and startedAt
            order.partnerNote = partnerNote;
            order.status = 8;
            order.finishedAt = new Date()
            order.save().then(rs => {
                res.ok();
                //customer pay order
                Order.userPayOrderByCash({ order }).then(rs => {
                    order.paymentStatus = 'paid';
                    order.save().then(rs => { });
                    //save user balance
                    Account.findOne({ user: req.info.user.id }).then(acc => {
                        req.info.user.balance = acc.balance;
                        req.info.user.save().then(rs => { });
                    })
                }, err => {
                    order.paymentStatus = JSON.stringify(err);
                    order.save().then(rs => { });
                })
                User.findOne({ id: order.customer }).then(customer => {
                    if (!customer) return console.log('cannot find customer to push')
                    let msg = {
                        to: customer.customerFirebaseToken,
                        notification: {
                            title: 'Nhân viên hệ thống đã hoàn thành công việc',
                            body: 'Cảm ơn quý khách đã sử dụng dịch vụ'
                        },
                        data: {
                            partner: req.info.user,
                            order,
                            flag: sails.config.PUSH_FLAG.CUSTOMER.PARTNER_FINISH_JOB
                        }
                    }
                    sails.services.common.pushNotification('customer', msg).then(() => { }, () => { });
                })
            })
        })
    },
    partnerStartOrder: (req, res) => {
        let { orderId } = req.body;
        if (!orderId) return res.paramError();
        Order.findOne({ id: orderId }).then(order => {
            if (!order) return res.json({ err: 2, desc: 'order is not exists' }); //order not exists
            if (order.partner != req.info.user.id) return res.json({ err: 3, desc: 'partner is not owner' }); //partner is not owner
            //update order status = 6 and startedAt
            order.status = 6;
            order.startedAt = new Date();
            order.save().then(rs => {
                res.ok();
            });
        });
    },
    partnerCancelOrder: (req, res) => {
        let { orderId, reason } = req.body;
        if (!orderId) return res.paramError();
        Order.findOne({ id: orderId }).then(order => {
            if (!order) return res.json({ err: 2, desc: 'order is not exists' }); //order not exists
            if (order.partner != req.info.user.id) return res.json({ err: 3, desc: 'partner is not owner' }); //partner is not owner
            let time = moment(order.startTime).add(-10, 'minutes').toDate();
            let now = new Date();
            if (now > time) {
                return res.json({ err: 4, desc: 'invalid time' }); //cannot cancel before 30 minutes
            }
            //return success
            res.ok();
            //increase partner cancelled
            User.native((err, collection) => {
                collection.update({
                    _id: req.info.user.id
                }, {
                        $inc: {
                            nOrderCancelled: 1
                        }
                    }).then(rs => { });
            });
            //update order status = 7
            order.status = 7;
            order.customerCancelReason = reason;
            order.save().then(rs => {

            })
            //push notification to customer
            User.findOne({ id: order.customer }).then(customer => {
                if (!customer) return console.log('cannot find customer to push');
                let msg = {
                    to: customer.customerFirebaseToken,
                    notification: {
                        title: 'Nhân viên đã hủy lịch',
                        body: 'Chúng tôi xin lỗi vì sự bất tiện này. Quý khách vui lòng tạo lại một việc khác!'
                    },
                    data: {
                        partner: req.info.user,
                        order,
                        flag: sails.config.PUSH_FLAG.CUSTOMER.PARTNER_CANCEL_JOB
                    }
                }
                sails.services.common.pushNotification('customer', msg).then(() => { }, () => { });
            })
        })
    },
    partnerDenyOrder: (req, res) => {
        let { orderId } = req.body;
        if (!orderId) return res.paramError();
        Order.findOne({ id: orderId }).then(order => {
            if (!order) return res.json({ err: 2, desc: 'order is not exists' }); //order not exists
            if (order.partner != req.info.user) return res.json({ err: 3, desc: 'partner is not owner' }); //partner is not owner
            //increase order denied
            User.native((err, collection) => {
                collection.update({
                    _id: req.info.user.id
                }, {
                        $inc: {
                            nOrderDenied: 1
                        }
                    }).then(rs => { });
            });
            let controller = sails.services.auth.createController();
            //update order
            order.controller = controller;
            order.save().then(rs => {
                //start process
                let input = {
                    order,
                    controller
                };
                log.file('processorder', `[PARTNER DENIED, START NEW THREAD ] [${moment().format()}] [ORDER: ${order.id}] [PARTNER: ${req.info.user.id}]`);
                sails.services.processorder.process(input);
            })
        })
    },
    partnerAcceptOrder: (req, res) => {
        let { orderId } = req.body;
        if (!orderId) return res.paramError();
        Order.findOne({ id: orderId }).then(order => {
            if (!order) return res.json({ err: 2, desc: 'order is not exists' }); //order not exists
            if (order.partner != req.info.user.id) return res.json({ err: 3, desc: 'partner is not owner' }); //partner is not owner
            order.status = 5;
            order.controller = sails.services.auth.createController();;
            order.save().then(rs => {
                //return partner result
                res.ok();
                //process order
                let input = {
                    order,
                    controller: order.controller
                };
                sails.services.log.file('processorder', `[PARTNER ACCEPT, START NEW THREAD] [${moment().format()}] [ORDER: ${order.id}] [PARTNER: ${req.info.user.id}]`);
                sails.services.processorder.process(input);
                //push notification to customer
                User.findOne({ id: order.customer }).then(customer => {
                    let msg = {
                        to: customer.customerFirebaseToken,
                        notification: {
                            title: 'Đã tìm được người nhận việc',
                            body: 'Hệ thống đã tìm được người làm, sẽ liên lạc lại vơi quý khách'
                        },
                        data: {
                            partner: {
                                category: req.info.user.category,
                                experience: req.info.user.experience,
                                jobs: req.info.user.jobs,
                                name: req.info.user.name,
                                avatar: req.info.user.avatar,
                                birth: req.info.user.birth,
                                averangeRating: req.info.user.averangeRating,
                                phone: req.info.user.phone,
                                totalTime: req.info.user.totalTime ? req.info.user.totalTime : 0
                            },
                            flag: sails.config.PUSH_FLAG.CUSTOMER.PARTNER_FOUND
                        }
                    }
                    sails.services.common.pushNotification('customer', msg).then(() => { }, () => { });
                });
            })
        })
    },



    partnerFindOrders: (req, res) => {
        let { skip, limit, startDate, endDate, status } = req.body;
        if ((!skip && skip !== 0) || !limit) return res.paramError();
        let arr = [];
        let query = {
            skip, limit,
            partner: req.info.user.id
        };
        if (status) {
            try {
                arr = JSON.parse(status);
                query.status = arr;
                // query.status = status;
            } catch (err) {
                return res.json({ err: 2, desc: 'invalid status' })
            }
        }

        if (startDate) {
            if (!query.startTime) query.startTime = {};
            query.startTime['>='] = new Date(startDate);
        }
        if (endDate) {
            if (!query.startTime) query.startTime = {};
            query.startTime['<='] = new Date(endDate);
        }
        Order.find(query,
            { select: ['id', 'customer', 'duration', 'customerNote', 'address', 'job', 'startTime', 'price', 'status', 'averangeRating'] }
        ).then(orders => {
            let listUsers = [];
            orders.forEach(order => {
                listUsers.push(order.customer);
            })
            User.find({
                id: listUsers
            }, {
                    select: ['id', 'name', 'avatar', 'birth', 'phone', 'jobs', 'experience', 'category']
                }).then(users => {
                    for (var o in orders) {
                        for (var u in users) {
                            if (orders[o].customer == users[u].id) {
                                orders[o].customer = users[u];
                            }
                        }
                    }
                    res.json({
                        err: 0,
                        orders
                    })
                });
        })
    },
    customerFindOrders: (req, res) => {
        let { skip, limit, startDate, endDate, status } = req.body;
        if ((!skip && skip !== 0) || !limit) return res.paramError();
        let arr = [];
        let query = {
            skip, limit,
            customer: req.info.user.id
        };
        if (status) {
            try {
                arr = JSON.parse(status);
                query.status = arr;
                // query.status = status;
            } catch (err) {
                return res.json({ err: 2, desc: 'invalid status' })
            }
        }

        if (startDate) {
            if (!query.startTime) query.startTime = {};
            query.startTime['>='] = new Date(startDate);
        }
        if (endDate) {
            if (!query.startTime) query.startTime = {};
            query.startTime['<='] = new Date(endDate);
        }
        Order.find(query).then(orders => {
            let listUsers = [];
            orders.forEach(order => {
                listUsers.push(order.partner);
            })
            User.find({
                isPartner: true,
                id: listUsers
            }, {
                    select: ['id', 'name', 'avatar', 'birth', 'phone']
                }).then(users => {
                    for (var o in orders) {
                        for (var u in users) {
                            if (orders[o].partner == users[u].id) {
                                orders[o].partner = users[u];
                            }
                        }
                    }
                    res.json({
                        err: 0,
                        orders
                    })
                });
        })
    },
    adminFindOrders: (req, res) => {
        let { skip, limit, startDate, endDate, search, status } = req.body;
        if ((!skip && skip !== 0) || !limit) return res.paramError();
        let arr = [];
        let query = {
            skip, limit
        };
        if (status !== null) {
            try {
                arr = JSON.parse(status);
                query.status = arr
            } catch (err) {
                return res.json({ err: 2 }) //parse json err
            }
        }
        if (startDate) {
            if (!query.startTime) query.startTime = {};
            query.startTime['>='] = new Date(startDate);
        }
        if (endDate) {
            if (!query.startTime) query.startTime = {};
            query.startTime['<='] = new Date(endDate);
        }
        if (search) {
            query.or = [
                {
                    customer: search
                }, {
                    partner: search
                }, {
                    job: job
                }]
        }
        Order.find(query).then(orders => {
            let users = [];
            orders.forEach(order => {
                if (!_.includes(users, order.customer)) {
                    users.push(order.customer);
                }
            })
            User.find({ id: users }).then(users => {
                for (var o in orders) {
                    for (var u in users) {
                        if (orders[o].customer == users[u].id) {
                            orders[o].customer = users[u];
                        }
                    }
                }
                res.json({ err: 0, orders })
            });
        });
    }
};

