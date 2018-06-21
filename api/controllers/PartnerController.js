/**
 * PartnerController
 *
 * @description :: Server-side logic for managing partners
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const sharp = require('sharp');
const path = require('path');
const moment = require('moment');
module.exports = {
    countOrder: (req, res) => {
        let { startDate, endDate } = req.body;
        if (!startDate || !endDate) return res.paramError();
        Order.count({
            partner: req.info.user.id,
            startTime: {
                '>=': new Date(startDate),
                '<=': new Date(endDate)
            }
        }).then(total => {
            Order.count({
                partner: req.info.user.id, status: [8, 11],
                startTime: {
                    '>=': new Date(startDate),
                    '<=': new Date(endDate)
                }
            }).then(finished => {
                res.json({ err: 0, total, finished });
            })
        })
    },
    deleteAllInfo: (req, res) => {
        let { id } = req.body;
        if (!id) return res.paramError();
        Partner.findOne({ id }).then(partner => {
            partner.deleteAllInfo().then(() => {
                res.ok();
            })
        })
    },
    adminCreatePartner: (req, res) => {
        let { phone, name, password, gender, birth, email } = req.body;
        if (!Phone || !name || !password || gender == null || !birth || !email) return res.paramError();
    },
    adminUpdatePartnerInfo: (req, res) => {
        let { partnerId, gender, email, name, birth, address, jobs, areas, agency } = req.body;
        if (!partnerId || gender == null || !email || !name || !birth || !address || !jobs || !areas) return res.paramError();
        try {
            jobs = JSON.parse(jobs);
            areas = JSON.parse(areas);
        } catch (err) {
            return res.paramError();
        }
        let promises = [];
        promises.push(new Promise((resolve, reject) => {
            if (!common.checkChildExist(req.files, 'file')) return resolve();
            let fname = `${sails.services.auth.createTokenString()}`;
            sharp(req.files.file.data)
                .resize(Conf.data.AVATAR_SIZE, Conf.data.AVATAR_SIZE, {
                    withoutEnlargement: false,
                    kernel: sharp.kernel.lanczos2,
                    interpolator: sharp.interpolator.nohalo
                })
                .png()
                .toFile(path.join(sails.services.common.getImageFolder(), 'profile', `${fname}.png`))
                .then(function () {
                    resolve(`profile/${fname}.png`);
                });
        }));
        Promise.all(promises).then(rs => {
            avatar = rs[0];
            Partner.findOne({ id: partnerId }).then(partner => {
                if (!partner) return res.json({ err: 2, msg: 'cannot find partner' });
                if (avatar) {
                    Object.assign(partner, { gender, email, name, birth, address, avatar, jobs, areas, agency });
                } else {
                    Object.assign(partner, { gender, email, name, birth, address, jobs, areas, agency });
                }
                partner.save().then(rs => {
                    res.ok();
                })
            })
        }, err => {
            res.paramError();
        });

    },
    adminGetPartnerJobReport: (req, res) => {
        let { partnerId } = req.body;
        Order.native((err, collection) => {
            var cursor = collection.aggregate([
                {
                    $match: {
                        partner: partnerId,
                        startTime: {
                            $gte: moment().add(-30, 'days').toDate()
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            day: { $dayOfMonth: "$startTime" },
                            month: { $month: "$startTime" },
                        },

                        count: { $sum: 1 }
                    }
                }, {
                    $project: {
                        _id: 1,
                        // date: {
                        //     $concat: ['$_id.day', '/', '$_id.month']
                        // },
                        count: 1
                    }
                }], { cursor: { batchSize: 1 } });
            rs = [];
            cursor.each(function (err, docs) {
                if (docs == null) {
                    res.json({ err: 0, rs });
                } else {
                    docs.date = `${docs._id.day}/${docs._id.month}`
                    rs.push(docs);
                }
            });
        })
    },
    adminApprovePartnerSimple: (req, res) => {
        let { partnerId, name, phone, email, noId, address } = req.body;
        if (!partnerId || !name || !phone || !email || !noId || !address) return res.json(req.body);// res.paramError();
        // if (!req.files && !)
        //move uploaded files
        let promises = [];

        promises.push(new Promise((resolve, reject) => {
            let fname = `${auth.createTokenString()}`;
            if (!common.checkChildExist(req.files, 'avatar')) return resolve();
            sharp(req.files.avatar.data)
                .resize(Conf.data.AVATAR_SIZE, Conf.data.AVATAR_SIZE, {
                    withoutEnlargement: false,
                    kernel: sharp.kernel.lanczos2,
                    interpolator: sharp.interpolator.nohalo
                })
                .png()
                .toFile(path.join(common.getImageFolder(), 'profile', `${fname}.png`))
                .then(function () {
                    resolve(`profile/${fname}.png`);
                });
        }))
        promises.push(new Promise((resolve, reject) => {
            let fname = auth.createTokenString() + path.extname(req.files.identityCard.name);
            let filename = path.join(common.getImageFolder(), 'profile', fname);
            req.files.identityCard.mv(filename, err => {
                if (err) {
                    return reject();
                }
                resolve(`profile/${fname}`);
            });
        }));
        Promise.all(promises).then(rs => {
            let avatar = rs[0];
            let identityCard = rs[1];
            //process avatar file
            let fname = auth.createTokenString();
            // let identityCard = rs[1];
            Partner.findOne({ id: partnerId, approved: false }).then(partner => {
                Partner.update({ id: partnerId }, {
                    approved: true,
                    name, phone, email, noId, address, identityCard,
                    approvedAt: new Date(),
                    approvedBy: req.info.user.id,
                    avatar
                }).then(rs => {
                    res.ok();
                }, er => {
                    res.json({ err: 4, desc: 'invalid data type' })
                })

                log.log2File('partnerctrl', `approve partner - partnerid = ${partnerId} (${name}) & approvedBy = ${req.info.user.id} (${req.info.user.name})`)
            })
        }, err => {
            res.paramError();
        })
    },
    adminApprovePartner: (req, res) => {
        let { partnerId, name, phone, email, category, noId, experience, address, price } = req.body;
        if (!partnerId || !name || !phone || !email || !category || !noId || !experience || !price || !address) return res.json(req.body);// res.paramError();
        experience = Number(experience);
        price = Number(price);
        let promises = [];
        let images = {};
        if (!req.files) return res.paramError();
        if (!req.files.avatar && !req.files.identityCard) return res.paramError();
        promises.push(new Promise((resolve, reject) => {
            let fname = `${auth.createTokenString()}`;
            sharp(req.files.avatar.data)
                .resize(Conf.data.AVATAR_SIZE, Conf.data.AVATAR_SIZE, {
                    withoutEnlargement: false,
                    kernel: sharp.kernel.lanczos2,
                    interpolator: sharp.interpolator.nohalo
                })
                .png()
                .toFile(path.join(common.getImageFolder(), 'profile', `${fname}.png`))
                .then(function () {
                    resolve(`profile/${fname}.png`);
                });
        }))
        promises.push(new Promise((resolve, reject) => {
            let fname = auth.createTokenString() + path.extname(req.files.identityCard.name);
            let filename = path.join(common.getImageFolder(), 'profile', fname);
            req.files.identityCard.mv(filename, err => {
                if (err) {
                    return reject();
                }
                resolve(`profile/${fname}`);
            });
        }));

        Promise.all(promises).then(rs => {
            let avatar = rs[0];
            let identityCard = rs[1];
            Partner.update({ id: partnerId }, {
                approved: true,
                name, phone, email, category, noId, experience, address, avatar, identityCard, price,
                approvedAt: new Date(),
                approvedBy: req.info.user.id
            }).then(rs => {
                res.ok();
            }, er => {
                res.json({ err: 4, desc: 'invalid data type' });
            })
        }, err => {
            res.paramError();
        })
    },
    adminFindPartners: (req, res) => {
        if (req.method == 'POST') {
            var { skip, limit, isOnline, district, approved, name, phone, email, gender, isBlock, registerFromDate, registerToDate } = req.body;
        } else {
            var { skip, limit, isOnline, district, approved, name, phone, email, gender, isBlock, registerFromDate, registerToDate } = req.query;
        }

        if (skip == null || !limit) return res.paramError();
        let query = {};
        if ((isOnline != null) && (isOnline != '')) {
            query.isOnline = isOnline;
        }
        if (approved != null) {
            query.approved = approved;
        }
        if (district) {
            query.districtsOfWorking = district;
        }
        if (name) {
            query.name = { contains: name };
        }
        if (phone) {
            query.phone = { contains: phone };
        }
        if (email) {
            query.email = { contains: email };
        }
        if (gender) {
            query.gender = gender;
        }
        if (isBlock) {
            query.isBlock = isBlock;
        }
        if (registerFromDate) {
            query.createdAt = { '>=': new Date(registerFromDate) }
        }
        if (registerToDate) {
            query.createdAt = { '<=': new Date(registerToDate) }
        }
        if (req.method == 'POST') {
            query.limit = limit;
            query.skip = skip;
            Partner.find(query).then(users => {
                Partner.count(query).then(count => {
                    return res.json({ err: 0, users, count });
                })
            });
        } else {
            Partner.find(query).then(users => {
                Partner.count(query).then(count => {
                    report.genExcelData('reportUser.xlsx', { users, count, startTime: registerFromDate, endTime: registerToDate }).then(binary => {
                        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                        res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
                        res.end(binary, 'binary');
                    });

                })
            });
        }

    },
    findPartnersByDistrict: (req, res) => {
        let { district, skip, limit } = req.body;
        if (!district || (!skip && skip !== 0) || !limit) return res.paramError();
        district = district.toString();
        //find order
        Partner.find({
            where: {
                approved: true,
                districtsOfWorking: district
            }, skip, limit
        }).then(partners => {
            res.json({ err: 0, partners })
        })
    },
    adminUnblockPartner: (req, res) => {
        let { partnerId } = req.body;
        if (!partnerId) return res.paramError();
        Partner.update({ id: partnerId }, { isBlock: false, unblockedAt: new Date(), unblockedBy: req.info.user.id }).then(() => {
            res.ok()
        });
    },
    adminBlockPartner: (req, res) => {
        let { partnerId } = req.body;
        if (!partnerId) return res.paramError();
        Partner.update({ id: partnerId }, { isBlock: true, blockedAt: new Date(), blockedBy: req.info.user.id }).then(() => {
            res.ok()
        });
    },
    partnerGoOffline: (req, res) => {
        req.info.user.isOnline = false;
        req.info.user.lastOnlineAt = new Date();
        req.info.user.save().then(rs => {
            res.ok();
        });

        log.log2File('partnerctrl', `partner go offline - partnerid = ${req.info.user.id}`);
    },
    keepAlived: (req, res) => {
        res.ok()
        let { latitude, longitude } = req.body;
        req.info.user.isOnline = true;
        req.info.user.lastOnlineAt = new Date();
        req.info.user.latitude = latitude;
        req.info.user.longitude = longitude;
        req.info.user.save().then(rs => { });
    },
    countPartnersByDistrict: (req, res) => {
        let { districts } = req.body;
        Partner.native((err, collection) => {
            var cursor = collection.aggregate([{
                $match: {
                    districtsOfWorking: districts
                }
            }, {
                $unwind: {
                    path: "$districtsOfWorking",
                }
            }, {
                $group: {
                    _id: "$districtsOfWorking",
                    count: { $sum: 1 }
                }
            }], { cursor: { batchSize: 1 } });
            cursor.each(function (err, docs) {
                if (docs == null) {
                    res.json({ err: 0, rs });
                } else {
                    rs.push(docs);
                }
            });
        })
    },
    logout: (req, res) => {
        //clear all user token
        Token.destroy({ client: 'partner', partner: req.info.user.id }).then(rs => {
            //clear all refresh token
            RefreshToken.destroy({ client: 'partner', partner: req.info.user.id }).then(rs => {
                req.info.user.isOnline = false;
                req.info.user.lastOnlineAt = new Date();
                req.info.user.save().then(rs => {
                    res.ok();
                })
            });

            log.log2File('partnerctrl', `partner logout - partnerid = ${req.info.user.id} (${req.info.user.name})`);
        })
    }
};

