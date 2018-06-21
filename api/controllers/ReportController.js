/**
 * PostController
 *
 * @description :: Server-side logic for managing posts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const sharp = require('sharp');
const path = require('path');
const moment = require('moment');
module.exports = {
    adminGetDashboardReport: (req, res) => {
        //count unresolve services
        let promises = [];
        //1
        promises.push(new Promise((resolve, reject) => {
            Service.count({ status: 0 }).then(count => {
                resolve(count);
            })
        }))
        //2
        promises.push(new Promise((resolve, reject) => {
            Partner.count({ approved: false }).then(count => {
                resolve(count);
            })
        }))
        //3
        promises.push(new Promise((resolve, reject) => {
            ExpertOrder.count({ status: 0 }).then(count => {
                resolve(count);
            })
        }))
        //4
        promises.push(new Promise((resolve, reject) => {
            LongOrder.count({ status: 0 }).then(count => {
                resolve(count);
            })
        }));
        //charts
        promises.push(new Promise((resolve, reject) => {
            Order.native((err, collection) => {
                var cursor = collection.aggregate([
                    {
                        $match: {
                            startTime: {
                                $gt: moment().startOf('year').toDate()
                            }
                        }
                    }, {
                        $group: {
                            _id: {
                                year: { $year: '$startTime' },
                                month: { $month: '$startTime' },
                                status: '$status',
                            },

                            count: { $sum: 1 }
                        }
                    }, {
                        $project: {
                            _id: 0,
                            state: '$_id',
                            count: '$count'
                        }
                    }], { cursor: { batchSize: 1 } });
                rs = [];
                cursor.each(function (err, docs) {
                    if (docs == null) {
                        resolve(rs);
                        // res.json({ err: 0, rs });
                    } else {
                        rs.push(docs);
                    }
                });
            })
        }))
        Promise.all(promises).then(rs => {
            res.json({
                err: 0,
                services: rs[0],
                partners: rs[1],
                experts: rs[2],
                longOrders: rs[3],
                orders: rs[4]
            })
        })
    },
    getLandingPageReport: (req, res) => {
        Report.find().then(reports => {
            res.json({ err: 0, reports });
        })
    },
    reportOrderStatus: (req, res) => {
        let { status, startTime, endTime } = req.body;
        if (!status || !startTime || !endTime) return res.paramError();
        status = Number(status);
        let promises = [];
        promises.push(new Promise((resolve, reject) => {
            let query = [
                {
                    $match: {
                        status: status,
                        startTime: {
                            $gt: new Date(startTime)
                        },
                        endTime: {
                            $lt: new Date(endTime)
                        }
                    },
                }, {
                    $group: {
                        _id: {
                            year: { $year: '$startTime' },
                            month: { $month: '$startTime' },
                            // status:'$status'
                        },
                        count: { $sum: 1 }
                    }
                }, {
                    $project: {
                        _id: 0,
                        state: '$_id',
                        count: '$count'
                    }
                }]
            Order.native((err, collection) => {
                var cursor = collection.aggregate(query, { cursor: { batchSize: 1 } });
                rs = [];
                cursor.each(function (err, docs) {
                    if (docs == null) {
                        resolve(rs);
                    } else {
                        rs.push(docs);
                    }
                });
            })
        }))
        Promise.all(promises).then(rs => {
            res.json({
                err: 0,
                count: rs[0]
            })
        })
    },

    //region report for admin's page
    getAdminPageReport: (req, res) => {
        
        let {r_name} = req.body;

        Report.findOne({key: r_name}, { select: ['key', 'val']}).exec((err, result) => {
            if(err)
                return res.json({err: -1, msg: err})
            res.json({err: 0, data: result});
        })
    },

    getAdminPageReports: (req, res) => {
        
        let {r_name} = req.body;

        Report.find({key: r_name}, { select: ['key', 'val']}).exec((err, result) => {
            if(err)
                return res.json({err: -1, msg: err})
            res.json({err: 0, data: result});
        })
    }
}
