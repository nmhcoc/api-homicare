module.exports = (req, res, next) => {
    let { phone, password } = req.body;
    if (!phone || !password) return res.paramError();
    BruteForce.protectLogin({ client: req.info.client.name, user: phone, ip: req.clientIp })
        .then(brute => {
            switch (req.info.client.name) {
                case 'customer':
                    Auth.findOne({ phone, type: req.info.client.name }).then(auth => {
                        if (!auth) return res.json({ err: 401, desc: 'cannot find auth' });
                        if (sails.services.auth.comparePassword(password, auth.password)) {
                            Customer.findOne({ id: auth.customer }).then(user => {
                                if (!user) {
                                    Auth.destroy({ id: auth.id }).then(rs => {
                                        res.json({ err: 401, desc: 'cannot find user from bearer token' })
                                    })
                                }
                                if (!req.info) req.info = {};
                                req.info.user = user;
                                brute.count = 0;
                                brute.save();
                                next();
                            })
                        } else {
                            return res.json({ err: 401, desc: 'invalid password' });
                        }
                    })
                    break;
                case 'partner':
                    Auth.findOne({ phone, type: req.info.client.name }).then(auth => {
                        if (!auth) return res.json({ err: 401, desc: 'cannot find auth' });
                        if (sails.services.auth.comparePassword(password, auth.password)) {
                            Partner.findOne({ id: auth.partner }).then(user => {
                                if (!user) {
                                    Auth.destroy({ id: auth.id }).then(rs => {
                                        res.json({ err: 401, desc: 'cannot find user from bearer token' })
                                    })
                                }
                                if (!req.info) req.info = {};
                                req.info.user = user;
                                brute.count = 0;
                                brute.save();
                                next();
                            })
                        } else {
                            return res.json({ err: 401, desc: 'invalid password' });
                        }
                    })
                    break;
                case 'officer':
                    Auth.findOne({ username: phone, type: req.info.client.name }).then(auth => {
                        if (!auth) return res.json({ err: 401, desc: 'cannot find auth' });
                        if (sails.services.auth.comparePassword(password, auth.password)) {
                            Officer.findOne({ id: auth.officer }).then(user => {
                                if (!user) {
                                    Auth.destroy({ id: auth.id }).then(rs => {
                                        res.json({ err: 401, desc: 'cannot find user from bearer token' })
                                    })
                                }
                                if (!req.info) req.info = {};
                                req.info.user = user;
                                brute.count = 0;
                                brute.save();
                                next();
                            })
                        } else {
                            return res.json({ err: 401, desc: 'invalid password' });
                        }
                    })
                    break;
            }
        }, err => {
            res.json({ err: 401, msg: 'brute force protected!' });
        });
}