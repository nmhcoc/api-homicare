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

    findPartnerByConditions: (req, res) => {
        let { paymentMethod, job, startTime, duration, address, latitude, longitude } = req.body;
        if (paymentMethod == null || !job || !startTime || !duration || !address || !latitude || !longitude) return res.paramError();
        let endTime = moment(startTime).add(duration, 'hours').toDate();
        let input = { paymentMethod, job, startTime, endTime, duration, address, latitude, longitude };
        Order.findAvailablePartners({ order: input, isOnline: false }).then(partners => {
            res.json({ err: 0, partners });
        })
    },

    manualBookOrder: (req, res) => {
        let { customer, partner } = req.body;
        if (!customer || !partner) return res.paramError();
        req.body.bookType = Order.BOOK_TYPE.MANUAL;
        req.body.createdBy = req.info.user.id;
        log.log2File('orderctrl', `manualBookOrder - customer = ${customer} & partner = ${partner} & createdBy = ${req.body.createdBy}`)
        Customer.findOne({ id: customer }).then(customer => {
            Partner.findOne({ id: partner }).then(partnerInfo => {
                req.body.customer = customer;
                Order.createOrder(req.body).then(order => {
                    order.partner = partner;
                    order.status = Order.ORDER_STATUS.FINDING_PARTNER;
                    order.save().then(() => {
                        Push.pushNewJob({ order });
                        // order.partnerAccept({ partner: partnerInfo }).then(() => {
                        //     res.ok();
                        // })
                        res.ok();
                    })
                    log.log2File('orderctrl', `manualBookOrder (auto accept) - orderid = ${order.id} & customer = ${customer} & partner = ${partner}`);
                }, err => {
                    res.json(err);
                })
            })
        });
    },
    /**
     * goi khi customer chon thanh toan tren push popup 
     */
    customerPayByCard: (req, res) => {
        let { orderId } = req.body;
        let token = req.headers.authorization.split(' ')[1];
        log.log2File('orderctrl', `customerPayByCard - orderid = ${orderId}`);
        if (!orderId) return res.paramError();
        Order.findOne({ id: orderId, paymentStatus: 'pending', paymentMethod: { '!': ['0', '1'] } }).then(order => {
            if (!order) return res.json({ err: 2, msg: 'order is not exists' });
            Card.findOne({ id: order.paymentMethod }).then(card => {
                if (!card) return res.paramError();
                log.log2File('orderctrl', `customerPayByCard - orderid = ${orderId} & paymentMethod = ${order.paymentMethod} & area = ${card.area}`);
                if (card.area == 'domestic') {
                    Account.payOrderByCard({ order }).then(trans => {
                        res.json({ err: 0, type: 'api', trans: trans.id })
                    }, err => {
                        res.json(err);
                    })
                } else { //international
                    res.json({ err: 0, type: 'webview', url: `${Conf.data.API_HOST}/order/customerPay3DSForm?token=${token}&orderId=${orderId}` });
                }
            })
        }, err => {
            res.json(err)
        })
    },

    customerPay3DSForm: (req, res) => {
        let { orderId } = req.query;
        let token = req.query.token;
        if (!orderId) return res.paramError();
        Order.findOne({ id: orderId, paymentStatus: 'pending', paymentMethod: { '!': ['0', '1'] } }).then(order => {
            if (!order) return res.json({ err: 2, msg: 'order is not exists' });
            Card.findOne({ id: order.paymentMethod, area: 'international' }).then(card => {
                if (!card) {
                    let msg = `<h3 class='text-danger text-center'>Không đúng thẻ!</h3>`
                    return res.render('paymentReturn', { msg });
                }
                Account.payOrderByCard({ order }).then(rs => {
                    if (rs.err == 0) {
                        if (rs.flag == 1) {//can otp
                            res.send(rs.html);
                        } else if (flag == 2) {// khong can otp
                            res.render('paymentResult', { msg: rs.result });
                        }
                    } else {
                        let msg = `<h3 class='text-danger text-center'>${rs.msg}</h3>`
                        return res.render('paymentReturn', { msg });
                    }
                })
            })
        }, err => {
            res.json(err)
        })
    },

    verifyOtpPay: (req, res) => {
        let { transId, otp } = req.body;
        if (!transId || !otp) return res.paramError();
        payment.verifyOtp(transId, otp).then(rs => {
            PayplusTransaction.findOne({ id: transId }).then(trans => {
                Order.findOne({ id: trans.order }).then(order => {
                    order.paymentStatus = 'done';
                    order.save().then(() => {
                        Account.finishOrderOnlinePayment({ order, createdBy: req.info.user.id }).then(rs => {
                            res.ok();
                        });
                    })
                });
            });
        }, err => {
            res.json(err);
        })
    },

    customerRateOrder: (req, res) => {
        let { orderId, rate, improval, rateString } = req.body;
        if (!orderId || !rate) return res.paramError();
        //find order
        Order.findOne({ id: orderId, rated: false }).then(order => {
            if (!order) return res.json({ err: 2, desc: 'order is not exists' });
            if (order.customer != req.info.user.id) return res.json({ err: 3, desc: 'customer is not owner' });
            order.rated = true;
            order.rate = rate;
            if (rateString)
                order.rateString = rateString;
            if (rate >= 3)
                order.improval = improval || '[]'
            order.status = Order.ORDER_STATUS.FINISH_WITH_RATE;
            order.save().then(rs => {
                //find partner info
                Partner.findOne({ id: order.partner }).then(partner => {
                    // partner.addRate(order, rate).then(rs => {
                    //     res.ok();
                    // });
                    partner.addRate(order, rate, rateString).then(rs => {
                        res.ok();
                    });
                })
            })
        })
    },

    customerReportOrder: (req, res) => {
        let { orderId, content } = req.body;
        if (!orderId || !content) return res.paramError();
        Order.findOne({ id: orderId }).then(order => {
            if (order.customer != req.info.user.id) return res.json({ err: 2, desc: 'customer is not owner' });
            order.customerReport(content).then(() => {
                res.ok();
            })
            order.report = content;
            Partner.increasePartner(order.partner, { nReport: 1 }).then(rs => {
                res.ok();
            })
        })
    },
    pricing: (req, res) => {
        let { jobId, duration, startTime, voucher, paymentMethod } = req.body;
        Job.pricingJobs({ jobId, duration, startTime, voucher, paymentMethod }).then(price => {
            res.json(price);
        }, err => {
            res.json(err);
        })
    },
    customerCancelOrder: (req, res) => {
        let { orderId, reason } = req.body;
        log.log2File('orderctrl', `customerCancelOrder - orderid = ${orderId} & reason = ${reason}`);
        if (!orderId) return res.paramError();
        Order.findOne({ id: orderId, status: Order.ORDER_STATUS.PARTNER_ACCEPT, customer: req.info.user.id }).then(order => {
            if (!order) return res.json({ err: 2, desc: 'order is not exist' }); //order not exists
            let time = moment(order.startTime).add(-10, 'minutes').toDate();
            let now = new Date();
            if (now > time) {
                log.log2File('orderctrl', `customerCancelOrder - orderid = ${orderId} & reason = ${reason} & cancel fail`);
                return res.json({ err: 4, desc: 'invalid time' }); //cannot cancel before 30 minutes
            }

            log.log2File('orderctrl', `customerCancelOrder - orderid = ${orderId} & reason = ${reason} & cancel accept`);
            order.customerCancel().then(rs => {
                res.ok();
            })
        })
    },

    customerCreateOrder: (req, res) => {
        req.body.customer = req.info.user;
        req.body.createdBy = req.info.user.id;
        Order.createOrder(req.body).then(order => {
            let { paymentMethod } = req.body;
            switch (paymentMethod) {
                case 'cash':
                    res.ok();
                    pubsub.publish('ORDER.NEW_ORDER', { order });
                    let input = {
                        order,
                        controller: order.controller,
                        server: order.server
                    }

                    log.log2File('orderctrl', `customerCreateOrder - orderid = ${order.id} & customer/createdBy = ${req.body.customer.id} (${req.body.customer.name}) & checkInviteCode = ${order.checkInviteCode}`);
                    Order.findPartners(order.id, order);
                    break;
                case 'online':
                    //CREATE PAYMENT URL
                    let { language } = req.body;
                    let info = { order, ip: req.clientIp, language, bankCode: '', orderType: 'job' };
                    Vnp.createPayOrderUrl(info).then(rs => {
                        res.json({ err: 0, vnpUrl: rs.vnpUrl, trans: rs.trans.id });
                    });
                    break;
            }

        }, err => { res.json(err) })
    },

    partnerUploadReport: (req, res) => {
        let { orderId } = req.body;
        if (!orderId) return res.paramError(); //parameter error
        Order.findOne({ id: orderId, partner: req.info.user.id }).then(order => {
            if (!order) return res.json({ err: 2, desc: 'user is not owner' });
            if (!req.files) return res.paramError();

            let promises = [];
            for (var f in req.files) {
                const token = auth.createTokenString();
                let fname = token + path.extname(req.files[f].name);
                promises.push(new Promise((resolve, reject) => {
                    let file = req.files[f];
                    file.mv(path.join(common.getImageFolder(), 'report', fname), err => {
                        if (err) {
                            return res.paramError();
                        }
                        sharp(file.data)
                            .resize(200, 200, {
                                withoutEnlargement: false,
                                kernel: sharp.kernel.lanczos2,
                                interpolator: sharp.interpolator.nohalo
                            })
                            .png()
                            .toFile(path.join(sails.services.common.getImageFolder(), 'report', `${token}_thumb.png`))
                            .then(() => {
                                resolve(`report/${fname}`);
                            });
                    })
                }));
            }
            Promise.all(promises).then(rs => {
                if (!order.reportImages) order.reportImages = [];
                for (var i = 0; i < rs.length; i++) {
                    order.reportImages.push(rs[i]);
                }
                order.save().then(rs => res.ok());
            });
        })
    },

    partnerFinishOrder: (req, res) => {
        let { orderId, partnerNote, rate } = req.body;
        log.log2File('orderctrl', `partnerFinishOrder - orderid = ${orderId} & partnerNote = ${partnerNote} & rate = ${rate}`);
        if (!orderId) return res.paramError();
        Order.findOne({ id: orderId, status: Order.ORDER_STATUS.STARTED }).then(order => {
            if (!order) {
                log.log2File('orderctrl', `partnerFinishOrder - orderid = ${orderId} & order not exists`);
                return res.json({ err: 2, desc: 'order is not exists' }); //order not exists
            }
            if (order.partner != req.info.user.id) {
                log.log2File('orderctrl', `partnerFinishOrder - orderid = ${orderId} & partner is not owner (order.partner = ${order.partner} & info.user.id = ${req.info.user.id})`);
                return res.json({ err: 3, desc: 'partner is not owner' }); //partner is not owner
            }

            log.log2File('orderctrl', `partnerFinishOrder - orderid = ${orderId}`);
            order.partnerFinish(partnerNote, rate).then(() => {
                res.ok();
            })
        })
    },
    partnerStartOrder: (req, res) => {
        let { orderId } = req.body;
        log.log2File('orderctrl', `partnerStartOrder - orderid = ${orderId}`);
        if (!orderId) return res.paramError();
        Order.findOne({ id: orderId, status: Order.ORDER_STATUS.PARTNER_ACCEPT, partner: req.info.user.id }).then(order => {
            if (!order) return res.json({ err: 2, desc: 'order is not exists' }); //order not exists
            let delta = moment().diff(moment(order.startTime), 'hours');
            if (Math.abs(delta) > Conf.data.ORDER_START_DELTA) {
                log.log2File('orderctrl', `partnerStartOrder - orderid = ${orderId} & start fail (startTime = ${order.startTime} & delta = ${delta})`);
                return res.json({ err: 3, msg: sails.__('START_ORDER_INVALID_TIME', { time: Conf.data.ORDER_START_DELTA }) });
            }
            log.log2File('orderctrl', `partnerStartOrder - orderid = ${orderId} & start accepted`);
            order.partnerStart().then(() => {
                res.ok();
            })
        });
    },
    partnerCancelOrder: (req, res) => {
        let { orderId, reason } = req.body;
        log.log2File('orderctrl', `partnerCancelOrder - orderid = ${orderId} & reason = ${reason}`);
        if (!orderId) return res.paramError();
        Order.findOne({ id: orderId, status: Order.ORDER_STATUS.PARTNER_ACCEPT, partner: req.info.user.id }).then(order => {
            if (!order) return res.json({ err: 2, desc: 'order is not exists' }); //order not exists
            let time = moment(order.startTime).add(-10, 'minutes').toDate();
            let now = new Date();

            if (now > time) {
                log.log2File('orderctrl', `partnerCancelOrder - orderid = ${orderId} & reason = ${reason} & cancel fail`);
                return res.json({ err: 4, desc: 'invalid time' }); //cannot cancel before 30 minutes
            }
            log.log2File('orderctrl', `partnerCancelOrder - orderid = ${orderId} & reason = ${reason} & cancel accept`);
            order.partnerCancel().then(rs => {
                res.ok();
            });
        })
    },
    partnerDenyOrder: (req, res) => {
        let { orderId } = req.body;
        log.log2File('orderctrl', `partnerDenyOrder - orderid = ${orderId}`);
        if (!orderId) return res.paramError();
        Order.findOne({ id: orderId, partner: req.info.user.id }).then(order => {
            if (!order) return res.json({ err: 2, desc: 'order is not exists' }); //order not exists
            order.partnerDeny().then(rs => {
                res.ok();
            });
        })
    },
    partnerAcceptOrder: (req, res) => {
        let { orderId } = req.body;
        log.log2File('orderctrl', `partnerAcceptOrder - orderid = ${orderId}`);
        if (!orderId) return res.paramError();
        Order.findOne({ id: orderId, partner: req.info.user.id, status: Order.ORDER_STATUS.FINDING_PARTNER }).then(order => {
            if (!order) return res.json({ err: 2, desc: 'order is not exists' }); //order not exists
            order.partnerAccept({ partner: req.info.user }).then(rs => {
                res.ok();
            }, err => {
                res.json(err);
            });
        })
    },
    partnerFindOrders: (req, res) => {
        let { skip, limit, startDate, endDate, status } = req.body;
        if ((!skip && skip !== 0) || !limit) return res.paramError();
        let arr = [];
        let query = {
            skip, limit,
            partner: req.info.user.id,
            sort: 'createdAt DESC'
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
            let listCustomers = [], listDependecies = [];
            orders.forEach(order => {
                listCustomers.push(order.customer);
                if (order.dependency != 'owner') {
                    listDependecies.push(order.dependency);
                }
            })
            Customer.find({
                id: listCustomers
            }, {
                    select: ['id', 'name', 'avatar', 'birth', 'phone', 'jobs', 'experience', 'category']
                }).then(users => {
                    Dependency.find({ id: listDependecies }).then(dependencies => {
                        for (var o in orders) {
                            for (var d = 0; d < dependencies.length; d++) {
                                if (orders[o].dependency == dependencies[d].id) {
                                    orders[0].dependency = dependencies[d];
                                }
                            }
                            for (var u in users) {
                                if (orders[o].customer == users[u].id) {
                                    orders[o].customer = users[u];
                                }
                            }
                        }
                        res.json({
                            err: 0,
                            orders
                        });
                    });
                });
        })
    },
    customerFindOrders: (req, res) => {
        let { skip, limit, startDate, endDate, status } = req.body;
        if ((!skip && skip !== 0) || !limit) return res.paramError();
        let arr = [];
        let query = {
            skip, limit,
            customer: req.info.user.id,
            sort: 'createdAt DESC'
        };
        if (status) {
            try {
                arr = JSON.parse(status);
                //for dev
                if (_.includes(arr, Order.ORDER_STATUS.FINISHED)) arr.push(Order.ORDER_STATUS.FINISH_WITH_RATE);
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
            let listUsers = [], listDependecies = [];
            orders.forEach(order => {
                listUsers.push(order.partner);
                if (order.dependency != 'owner') {
                    listDependecies.push(order.dependency);
                }
            })
            Partner.find({
                id: listUsers
            }, {
                    select: ['id', 'name', 'avatar', 'birth', 'phone', 'jobs', 'experience', 'category']
                }).then(users => {
                    Dependency.find({ id: listDependecies }).then(dependencies => {
                        for (var o in orders) {
                            for (var d = 0; d < dependencies.length; d++) {
                                if (orders[o].dependency == dependencies[d].id) {
                                    orders[0].dependency = dependencies[d];
                                    continue;
                                }
                            }
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
                });
        })
    },
    adminFindOrders: (req, res) => {
        let { skip, limit, startDate, endDate, search, status } = req.body;
        if ((!skip && skip !== 0) || !limit) return res.paramError();
        let arr = [];
        let query = {
            skip, limit,
            sort: 'createdAt DESC'
        };
        if (status) {
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
                    job: search
                }]
        }
        Order.find(query).then(orders => {
            Order.count(query).then(count => {
                let listCustomers = [], listPartners = [];
                orders.forEach(order => {
                    if (!_.includes(listCustomers, order.customer)) {
                        listCustomers.push(order.customer);
                    }
                    if (!_.includes(listPartners, order.partner)) {
                        listPartners.push(order.partner);
                    }
                });
                Customer.find({ id: listCustomers }).then(customers => {
                    Partner.find({ id: listPartners }).then(partners => {
                        orders.forEach(order => {
                            for (var i = 0; i < customers.length; i++) {
                                if (order.customer == customers[i].id) {
                                    order.customer = customers[i];
                                }
                            }
                            for (var i = 0; i < partners.length; i++) {
                                if (order.partner == partners[i].id) {
                                    order.partner = partners[i];
                                }
                            }
                        })
                        res.json({ err: 0, orders, count })
                    })
                })
            })
        });
    },

    reportOrders: (req, res) => {
        let { startTime, endTime, groupBy } = req.body;
        //groupBy hour, dayOfMonth
        if (!startTime || !endTime || !groupBy) return res.paramError();
        startTime = new Date(startTime);
        endTime = new Date(endTime);
        Order.native((err, collection) => {
            let query = {}
            switch (groupBy) {
                case 'hour':
                    query.$group = {
                        _id: { '$hour': '$createdAt' },
                        count: { $sum: 1 }
                    }
                    break;
                case 'dayOfMonth':
                    query.$group = {
                        _id: { '$dayOfMonth ': '$createdAt' },
                        count: { $sum: 1 }
                    }
                    break;
            }
            var cursor = collection.aggregate([
                {
                    $match: {
                        startTime: {
                            $gt: startTime,
                            $lt: endTime
                        }
                    }
                }, query], { cursor: { batchSize: 1 } });
            rs = [];
            cursor.each(function (err, docs) {
                if (docs == null) {
                    res.json({ err: 0, rs });
                } else {
                    rs.push(docs);
                }
            });
        })
    }
};

