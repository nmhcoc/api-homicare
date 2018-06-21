/**
 * VoucherController
 *
 * @description :: Server-side logic for managing vouchers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
let _ = require('lodash');
let moment = require('moment');
module.exports = {
    useVoucher: (req, res) => {
        let { code } = req.body;
        if (!code) return res.paramError();
        let query = {
            code,
            type: 'gift',
            nRemain: { '>': 0 },
            endTime: { '>=': new Date() },
            startTime: { '<=': new Date() }
        }
        Voucher.findOne(query).then(voucher => {
            if (!voucher) return res.json({ err: 2, desc: 'voucher is not exist or expired' });
            if (voucher.phone && voucher.phone != req.info.user.phone) {
                return res.json({ err: 6, msg: 'Mã voucher không hợp lệ!' })
            }
            Voucher.useVoucher(voucher, req.info.user.id).then(rs => {
                //find user credit account
                Account.findOne({
                    user: req.info.user.id,
                    type: req.info.client.name
                }).then(userAccount => {
                    if (!userAccount) {
                        return Voucher.increaseNumberOfUsed(voucher.id, -1).then(rs => {
                            res.json({ err: 5, desc: 'account not exists' })
                        })
                    }
                    let desc = `Tặng tiền voucher: ${voucher.name}`;
                    let amount = Number(voucher.value);
                    Journal.debit({ account: Account.ACCOUNTS.PAYABLE, refAccount: userAccount.id, debit: amount, desc, object: 'no object', createdBy: req.info.user.id }).then(rs => {
                        Journal.credit({ account: userAccount.id, refAccount: Account.ACCOUNTS.PAYABLE, credit: amount, desc, object: 'transaction', createdBy: req.info.user.id }).then(rs => {
                            Transaction.create({ source: userAccount.id, value: amount, desc, state: 'done' }).then(rs => {
                                res.ok();
                                Push.pushUpdateBalance({ user: req.info.user.id, type: userAccount.type });
                            }, err => {
                            });
                        })
                    })
                })
            });
        });
    },
    findVouchers: (req, res) => {
        let { prefix, limit, skip, type, value, startTime, endTime } = req.body;
        if (skip == null || !limit) return res.paramError();
        skip = Number(skip);
        limit = Number(limit);
        let query = { skip, limit, sort: 'createdAt DESC' };
        if (type) query.type = type;
        if (prefix) query.code = {
            startsWith: prefix
        };
        if (startTime) {
            query.endTime = {
                $gt: new Date(startTime)
            }
        }
        if (endTime) {
            query.startTime = {
                $lt: new Date(endTime)
            }
        }
        if (value) query.value = Number(value);
        if (req.method == 'GET') {
            let { account, refAccount, startTime, endTime } = req.query;
            query.skip = 0;
            query.limit = null;
            Voucher.find(query).then(vouchers => {
                report.genExcelData('vouchers.xlsx', { vouchers }).then(binary => {
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                    res.setHeader("Content-Disposition", "attachment; filename=" + `JournalEntries${moment().format()}.xlsx`);
                    res.end(binary, 'binary');
                });
            });
        } else if (req.method == 'POST') {
            Voucher.find(query).then(vouchers => {
                Voucher.count(query).then(count => {
                    res.json({ err: 0, vouchers, count });
                })

            });
        }
    },
    deleteVouchers: (req, res) => {
        let { prefix, type, value } = req.body;
        if (!prefix || !type || !value) return res.paramError();
        let query = {};
        if (type) query.type = type;
        if (prefix) query.code = {
            startsWith: prefix
        };
        if (value) query.value = Number(value);
        Voucher.destroy(query).then(rs => {
            res.ok();
        })
    },
    createVouchers: (req, res) => {
        let { name, desc, quantity, prefix, nUse, startTime, endTime, limitADay, length, type, value, maxCash } = req.body;
        if (!name || !quantity || !prefix || !nUse || !startTime || !endTime || !length || !maxCash) return res.paramError();
        length = Number(length);
        quantity = Number(quantity);
        value = Number(value);
        nUse = Number(nUse)
        startTime = new Date(startTime);
        endTime = new Date(endTime);
        maxCash = Number(maxCash);

        if(limitADay) limitADay = Number(limitADay);//gioi han tong so lan dung voucher theo ngay (all customer)

        Voucher.find({ code: { startsWith: prefix } }).then(existedVouchers => {
            let oldVouchers = [];
            existedVouchers.forEach(ev => {
                oldVouchers.push(ev.code);
            })
            let newVouchers = [];
            if (quantity >= Math.pow(30, length) - oldVouchers.length) return res.json({ err: 2 });//not enough code
            while (newVouchers.length < quantity) {
                let code = `${prefix}${sails.services.auth.randomCode(length)}`;
                if (!_.includes(oldVouchers, code)) {
                    oldVouchers.push(code);
                    newVouchers.push({
                        name, desc,
                        code,
                        nUse, limitADay,
                        nUsed: 0,
                        nRemain: nUse,
                        startTime, endTime,
                        type, value,
                        maxCash,
                        createdAt: new Date()
                    });
                }
            }
            Voucher.native((err, collection) => {
                collection.insert(newVouchers).then(rs => {
                    res.ok();
                })
            });
        })
    },
};

