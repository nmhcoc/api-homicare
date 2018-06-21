/**
 * CustomerController
 *
 * @description :: Server-side logic for managing customers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    deleteAllInfo: (req, res) => {
        let { id } = req.body;
        if (!id) return res.paramError();
        Customer.findOne({ id }).then(customer => {
            customer.deleteAllInfo().then(() => {
                res.ok();
            })
        })
    },
    adminCreateCustomer: (req, res) => {
        let { name, phone, password } = req.body;
        if (!name || !phone || !password) return res.paramError();
        Customer.createCustomer({ name, phone, password }).then(rs => {
            log.log2File('customerctrl', `adminCreateCustomer - customerid = ${rs.id} & name = ${name}`)
            res.ok();
        }, err => {
            res.json({ err: 2, msg: 'user exists' });
        })
    },
    adminFindCustomers: (req, res) => {
        if (req.method == 'POST') {
            var { skip, limit, name, phone, email, gender, isBlock, registerFromDate, registerToDate } = req.body;
        } else {
            var { skip, limit, name, phone, email, gender, isBlock, registerFromDate, registerToDate } = req.query;
        }

        if ((!skip && skip !== 0) || !limit) return res.paramError();
        let query = {};
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
            Customer.find(query).then(users => {
                Customer.count(query).then(count => {
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
    findNearbyPartners: (req, res) => {
        let { latitude, longitude } = req.body;
        Partner.find({
            approved: true,
            isOnline: true
        }, { select: ['latitude', 'longitude'] }).then(partners => {
            partners.forEach(p => {
                p.distance = sails.services.common.GPSdistance(latitude, longitude, p.latitude, p.longitude)
            })
            partners.sort(function (a, b) {
                return (a.distance < b.distance) ? -1 : 1;
            });
            let r = [];
            for (var i = 0; i < 10; i++) {
                if (!partners[i]) break;
                r.push({
                    latitude: partners[i].latitude,
                    longitude: partners[i].longitude
                });
            }
            res.json({ err: 0, partners: r });
        })
    },
    suggestAll: (req, res) => {
        Job.find().limit(1).then(job => {
            res.json({ err: 0, job: job[0], address: req.info.user.address })
        })
    },
    becomePartner: (req, res) => {
        //name, phone, password, birth, address, email, avatar, inviteCode, code
        let data = {
            name: req.info.user.name,
            phone: req.info.user.phone,
            birth: req.info.user.birth,
            address: req.info.user.address,
            email: req.info.user.email,
            avatar: req.info.user.avatar,
            password: 'password'
        };
        Partner.createPartner(data).then(rs => {
            //use customer password
            Auth.findOne({ type: 'customer', customer: req.info.user.id }).then(auth => {
                rs.auth.password = auth.password;
                rs.auth.save().then(rs => {
                    res.ok();
                })
            })
        }, err => {
            res.json({ err: 2, msg: 'user exists' });
        });
    },
    logout: (req, res) => {
        //clear all user token
        Token.destroy({ client: 'customer', customer: req.info.user.id }).then(rs => {
            //clear all refresh token
            RefreshToken.destroy({ client: 'customer', customer: req.info.user.id }).then(rs => {
                req.info.user.isOnline = false;
                req.info.user.lastOnlineAt = new Date();
                req.info.user.save().then(rs => {
                    res.ok();
                })
            });

            log.log2File('customerctrl', `logout - customerid = ${req.info.user.id} (${req.info.user.name})`);
        })
    }
};

