/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
let sharp = require('sharp');
let path = require('path');
let _ = require('lodash');
const fs = require('fs');

module.exports = {
    isUserExist: (req, res) => {
        let { phone } = req.body;
        if (!phone) return res.paramError();
        User.findOne({ phone }).then(user => {
            if (user) return res.ok();
            return res.json({ err: 2, desc: 'user is not exists' });
        })
    },
    setDefaultMethod: (req, res) => {
        let { cardId } = req.body;
        //check if card owner
        if (cardId == null) return res.paramError();
        cardId = cardId.toString();
        new Promise((resolve, reject) => {
            if (cardId != '0' && cardId != '1') {
                Card.findOne({ id: cardId }).then(card => {
                    if (card.user != req.info.user.id) return reject();
                    return resolve();
                })
            } else {
                resolve();
            }
        }).then(() => {
            req.info.user.defaultMethod = cardId;
            req.info.user.save().then(rs => {
                res.ok();
            });
        }, () => {
            return res.json({ err: 2, desc: 'user not card owner' });//user not card owner
        });
    },

    countPartnerByDistrict: (req, res) => {
        let { district } = req.body;
        if (!district) return res.paramError();
        //find order
        User.count({
            isPartner: true,
            districtsOfWorking: districtCode
        }).then(count => {
            res.json({ err: 0, count });
        });
    },

    adminResetPassword: (req, res) => {
        let { user, password, type } = req.body;
        if (!user || !password || !type) return res.paramError();
        if (!auth.checkPasswordStrength(password)) return res.json({ err: 2, msg: 'password is not enough strong' });

        let hashpass = sails.services.auth.hashPassword(password);
        Mail.sendMailResetPass({ userId: user, password: password, type: type });

        switch (type) {
            case 'customer':
                Auth.update({ 'customer': user, type }, { password: hashpass }).then(() => { res.ok() });
                break;
            case 'partner':
                Auth.update({ 'partner': user, type }, { password: hashpass }).then(() => { res.ok() });
                break;
            case 'officer':
                Auth.update({ 'officer': user, type }, { password: hashpass }).then(() => { res.ok() });
                break;
            default:
                break;
        }
        //Auth.update({ user, type }, { password }).then(() => { res.ok() });
    },

    forgotPassword: (req, res) => {
        let { accountKitCode, password, firebaseToken } = req.body;
        if (!accountKitCode || !password || !firebaseToken) return res.paramError();
        if (!auth.checkPasswordStrength(password)) return res.json({ err: 3, msg: 'password is not enough strong' });
        auth.getAccountKitPhoneNumber(accountKitCode).then(phone => {
            new Promise((resolve, reject) => {
                switch (req.info.client.name) {
                    case 'customer':
                        Customer.findOne({ phone }).then(user => {
                            resolve(user);
                        })
                        break;
                    case 'partner':
                        Partner.findOne({ phone }).then(user => {
                            resolve(user);
                        })
                        break;
                    default:
                        reject();
                        break;
                }
            }).then(user => {
                if (!user) return res.json({ err: 2, msg: 'invalid phone' });
                password = sails.services.auth.hashPassword(password);
                switch (req.info.client.name) {
                    case 'customer':
                        Auth.update({ customer: user.id, type: 'customer' }, { password }).then(() => {
                            // res.ok();
                        });
                        break;
                    case 'partner':
                        Auth.update({ partner: user.id, type: 'partner' }, { password }).then(() => {
                            // res.ok();
                        });
                        break;
                }

                //create token
                Token.createNewToken(user.id, 'login', req.info.client.name).then(token => {
                    RefreshToken.createNewToken(user.id, 'login', req.info.client.name).then(refreshToken => {
                        let update = {};
                        user.firebaseToken = firebaseToken;
                        user.lastOnlineAt = new Date();
                        user.save().then(user => {
                            res.json({
                                err: 0,
                                token: {
                                    expiredAt: token.expiredAt,
                                    token: token.token
                                },
                                tokenRefresh: {
                                    expiredAt: refreshToken.expiredAt,
                                    token: refreshToken.token
                                }
                            });


                            log.log2File('usercontroller', `user login (online) - userid = ${req.info.user.id} (${req.info.user.name}) & client = ${req.info.client.name}`);
                        });
                    })
                }).catch(err => {
                    res.json(err);
                })
            }, err => {
                res.json({ err: 2, desc: 'cannot find user' });
            })
        }, err => {
            return res.json({ err: 4, desc: 'invalid otp' });
        });
    },

    changePassword: (req, res) => {
        let { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) return res.paramError();
        if (oldPassword == newPassword) return res.json({ err: 3, msg: 'duplicate password' });
        if (!auth.checkPasswordStrength(newPassword)) return res.json({ err: 5, msg: 'password is not enough strong' });
        //find auth
        new Promise((resolve, reject) => {
            switch (req.info.client.name) {
                case 'customer':
                    Auth.findOne({ customer: req.info.user.id, type: 'customer' }).then(auth => resolve(auth));
                    break;
                case 'partner':
                    Auth.findOne({ partner: req.info.user.id, type: 'partner' }).then(auth => resolve(auth));
                    break;
                case 'officer':
                    Auth.findOne({ officer: req.info.user.id, type: 'officer' }).then(auth => resolve(auth));
                    break;
            }
        }).then(authInfo => {
            if (!sails.services.auth.comparePassword(oldPassword, authInfo.password)) return res.json({ err: 2, msg: 'invalid old password' });
            authInfo.password = sails.services.auth.hashPassword(newPassword);
            authInfo.save().then(rs => {
                if (authInfo.type == 'officer') {

                }
                res.ok() 
            });
        });
    },
    uploadAvatar: (req, res) => {
        //restrict partner upload avatar
        if (req.info.client == 'partner') {
            return res.paramError();
        }
        let processImages = [];
        let promises = [];
        promises.push(new Promise((resolve, reject) => {
            if (!common.checkChildExist(req.files, 'file')) return reject();
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
            const avatar = rs[0];
            req.info.user.avatar = avatar;
            req.info.user.save().then(rs => {
                res.ok();
            });
        }, err => {
            res.paramError();
        });
    },
    updateProfile: (req, res) => {
        let { birth, gender, address } = req.body;
        switch (req.info.client.name) {
            case 'customer':
                let { bloodType, height, weight, allergic, chronicDiseases } = req.body;
                Customer.update({ id: req.info.user.id }, { birth, gender, address, bloodType, height, weight, allergic, chronicDiseases }).then(rs => {
                    res.ok();
                }, err => {
                    res.paramError();
                })
                break;
            case 'partner':
                Partner.update({ id: req.info.user.id }, { birth, gender, address }).then(rs => {
                    res.ok();
                }, err => {
                    res.paramError();
                })
                break;
            case 'officer':
                Officer.update({ id: req.info.user.id }, { birth, gender, address }).then(rs => {
                    res.ok();
                }, err => {
                    res.paramError();
                })
                break;
        }
    },
    profile: (req, res) => {
        Dependency.find({ user: req.info.user.id }).then(dependencies => {
            res.json({ err: 0, user: req.info.user, dependencies });
        })
    },
    refreshToken: (req, res) => {
        let { firebaseToken, tokenRefresh } = req.body;
        if (!firebaseToken || !tokenRefresh) return res.paramError();
        RefreshToken.findOne({ token: tokenRefresh }).then(refresh => {
            if (!refresh) return res.json({ err: 1, desc: 'invalid refresh token' });
            //find user
            new Promise((resolve, reject) => {
                switch (req.info.client.name) {
                    case 'customer':
                        Customer.findOne({ id: refresh.customer }).then(user => {
                            if (user) return resolve(user);
                            reject();
                        })
                        break;
                    case 'partner':
                        Partner.findOne({ id: refresh.partner }).then(user => {
                            if (user) return resolve(user);
                            reject();
                        })
                        break;
                    case 'officer':
                        Officer.findOne({ id: refresh.officer }).then(user => {
                            if (user) return resolve(user);
                            reject();
                        })
                        break;
                }
            }).then(user => {
                refresh.renewToken();
                Token.createNewToken(refresh[req.info.client.name], 'login', req.info.client.name).then(token => {
                    let update = {};
                    user.firebaseToken = firebaseToken;
                    user.lastOnlineAt = new Date();
                    user.save().then(user => {
                        res.json({
                            err: 0,
                            token
                        })
                    });
                })
            }, err => {
                return res.json({ err: 2, desc: 'cannot find user' })
            })

        })
    },
    logout: (req, res) => {
        Token.destroy({ user: req.info.user.id }).then(rs => {
            RefreshToken.destroy({ user: req.info.user.id }).then(rs => {
                res.ok();
            })

            log.log2File('userctrl', `user logout - userid = ${req.info.user.id} (${req.info.user.name})`);
        })
    },
    login: (req, res) => {
        let { firebaseToken } = req.body;
        if (req.info.client.name == 'partner') {
            if (!req.info.user.approved) return res.json({ err: 1, desc: 'user is not a partner' })
        }
        //logout all other user
        new Promise((resolve, reject) => {
            switch (req.info.client.name) {
                case 'customer':
                    Token.destroy({ customer: req.info.user.id }).then(rs => {
                        RefreshToken.destroy({ customer: req.info.user.id }).then(rs => {
                            resolve();
                        });
                    });
                    break;
                case 'partner':
                    Token.destroy({ partner: req.info.user.id }).then(rs => {
                        RefreshToken.destroy({ partner: req.info.user.id }).then(rs => {
                            resolve();
                        });
                    });
                    break;
                case 'officer':
                    Token.destroy({ officer: req.info.user.id }).then(rs => {
                        RefreshToken.destroy({ officer: req.info.user.id }).then(rs => {
                            resolve();
                        });
                    });
                    break;
            }
        }).then(rs => {
            Token.createNewToken(req.info.user.id, 'login', req.info.client.name).then(token => {
                RefreshToken.createNewToken(req.info.user.id, 'login', req.info.client.name).then(refreshToken => {
                    let update = {};
                    req.info.user.firebaseToken = firebaseToken;
                    req.info.user.lastOnlineAt = new Date();
                    req.info.user.save().then(user => {
                        res.json({
                            err: 0,
                            token: {
                                expiredAt: token.expiredAt,
                                token: token.token
                            },
                            tokenRefresh: {
                                expiredAt: refreshToken.expiredAt,
                                token: refreshToken.token
                            }
                        });

                        log.log2File('usercontroller', `user login (online) - userid = ${req.info.user.id} (${req.info.user.name}) & client = ${req.info.client.name}`);
                    });
                })
            }).catch(err => {
                res.json(err);
            })
        });
    },
    register: (req, res) => {
        let { accountKitCode, password, name, birth, gender, email, avatar, address, inviteCode, jobs } = req.body;
        if (jobs) {
            try {
                jobs = JSON.parse(jobs);
            } catch (err) {
                return res.paramError();
            }
        }

        if (!accountKitCode || !name || !password) return res.paramError();
        auth.getAccountKitPhoneNumber(accountKitCode).then(phone => {
            new Promise((resolve, reject) => {
                if (!inviteCode) return resolve();
                InviteCode.findOne({ code: inviteCode }).then(code => {
                    if (!code) return reject();
                    resolve(code);
                });
            }).then(code => {
                //check user exists
                Auth.findOne({ phone, type: req.info.client.name }).then(auth => {
                    if (auth) return res.json({ err: 2, desc: 'user existed!' });
                    let query = {
                        phone, name, birth, gender, email,
                        avatar, address, password, code, jobs, inviteCode
                    }
                    switch (req.info.client.name) {
                        case 'customer':
                            Customer.createCustomer(query).then(rs => {
                                let user = rs.user;

                                Token.createNewToken(user.id, 'login', req.info.client.name).then(token => {
                                    RefreshToken.createNewToken(user.id, 'login', req.info.client.name).then(refreshToken => {
                                        let update = {};
                                        user.firebaseToken = firebaseToken;
                                        user.lastOnlineAt = new Date()
                                        user.save().then(user => {
                                            res.json({
                                                err: 0,
                                                token: {
                                                    expiredAt: token.expiredAt,
                                                    token: token.token
                                                },
                                                tokenRefresh: {
                                                    expiredAt: refreshToken.expiredAt,
                                                    token: refreshToken.token
                                                }
                                            });
                                        })
                                    }).catch(err => {
                                        res.json(err);
                                    });
                                });
                                pubsub.publish('USER.REGISTER', rs);
                            }, err => {
                                res.json(err)
                            })
                            break;
                        default:
                            Partner.createPartner(query).then(rs => {
                                res.ok();
                                Object.assign(rs, { type: 'partner' });
                                pubsub.publish('USER.REGISTER', rs);
                            }, err => {
                                res.json(err)
                            });
                            break;
                    }
                });
            }, err => {
                return res.json({ err: 7, desc: 'invalid invite code' });
            })
        }, err => {
            return res.json({ err: 4, desc: 'invalid otp' });
        })
    }
};