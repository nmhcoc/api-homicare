/**
 * OfficerController
 *
 * @description :: Server-side logic for managing officers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const _ = require('lodash');
module.exports = {

    updateUserProfile: (req, res) => {
        let { id, name, phone, email, agency, roles } = req.body;
        if (!id) return res.paramError();
        try {
            roles = JSON.parse(roles);
        } catch (err) {
            return res.paramError();
        }
        Officer.update({ id }, { name, phone, email, agency, roles }).then(() => {
            res.ok();
        }, err => {
            res.paramError();
        })
    },
    resetCache: (req, res) => {
        cache.clear();
        res.ok();
    },
    officerAddUserRole: (req, res) => {
        let { officerId, userRoleId } = req.body;
        if (!officerId || !userRoleId) return res.paramError();
        Officer.addUserRole(officerId, userRoleId).then(rs => res.ok(), err => res.paramError());
    },
    officerRemoveUserRole: (req, res) => {
        let { officerId, userRoleId } = req.body;
        if (!officerId || !userRoleId) return res.paramError();
        Officer.removeUserRole(officerId, userRoleId).then(rs => res.ok(), err => res.paramError());
    },
    createOfficer: (req, res) => {
        let { name, username, password, email, address, roles, phone } = req.body;
        password = auth.randomCode(10);
        if (!username || !password || !email || !roles) return res.paramError();
        try {
            roles = JSON.parse(roles);
            let input = { username, password, email, roles, name, phone };
            Officer.createOfficer(input).then(rs => {
                res.ok();
                Mail.sendCreateOfficer({ user: rs.user.id, username, password });
            }, err => {
                res.json(err);
            });
        } catch (err) {
            res.paramError();
        }
    },
    adminFindOfficers: (req, res) => {
        let { name, username, address, email, role, skip, limit } = req.body;
        if (skip == null || !limit) return res.paramError();
        let query = { skip, limit };
        if (name) query.name = { contains: name };
        if (username) query.username = { contains: username };
        if (address) query.address = { contains: address };
        if (email) query.email = { contains: email };
        if (role) query.roles = { contains: role };
        Officer.find(query).then(users => {
            Officer.count(query).then(count => {
                res.json({ err: 0, count, users });
            })
        })
    },
    addUserRoleToUser: (req, res) => {
        let { roleId, userId } = req.body;
        if (!roleId || !userId) return res.paramError();
        Officer.findOne({ id: userId }).then(user => {
            UserRole.findOne({ id: roleId }).then(role => {
                if (!user || !role) return res.paramError();
                if (!user.roles) job.roles = [];
                if (!_.includes(user.roles, role.name)) {
                    user.roles.push(role.name);
                    user.save().then(() => {
                        res.ok();
                    })
                } else {
                    res.ok();
                }
            })
        })
    },
    removeUserRoleFromUser: (req, res) => {
        let { roleId, userId } = req.body;
        if (!roleId || !userId) return res.paramError();
        Officer.findOne({ id: userId }).then(user => {
            UserRole.findOne({ id: roleId }).then(role => {
                if (!user || !role) return res.paramError();
                if (!user.roles) job.roles = [];
                if (_.includes(user.roles, role.name)) {
                    _.pull(user.roles, role.name);
                    user.save().then(() => {
                        res.ok();
                    })
                } else {
                    res.ok();
                }
            })
        })
    },
    logout: (req, res) => {
        //clear all user token
        Token.destroy({ client: 'officer', officer: req.info.user.id }).then(rs => {
            //clear all refresh token
            RefreshToken.destroy({ client: 'officer', officer: req.info.user.id }).then(rs => {
                res.ok();
            });
        })
    }
};

