/**
 * CommentController
 *
 * @description :: Server-side logic for managing comments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    userCreateComment: (req, res) => {
        let { content, replyFor } = req.body;
        if (!content) return res.paramError();
        Comment.create({ content, replyFor, client: req.info.client.name, user: req.info.user.id }).then(rs => {
            if (replyFor) {
                //increate count
                Comment.changeReplyCount({ commentId: replyFor, count: 1 })
            }
            res.ok();
        });
    },
    userGetComments: (req, res) => {
        let { limit, skip, replyFor } = req.body;
        if (!limit || skip == null) return res.paramError();
        let query = { limit, skip, status: true };
        if (replyFor) query.replyFor = replyFor;
        Comment.find(query).then(comments => {
            let ids = {
                customer: [],
                partner: [],
                officer: []
            }
            comments.forEach(c => {
                ids[c.client].push(c.user);
            })
            Customer.find({ id: ids.customer }, { select: ['name', 'avatar'] }).then(customers => {
                Partner.find({ id: ids.partner }, { select: ['name', 'avatar'] }).then(partners => {
                    Officer.find({ id: ids.officer }, { select: ['name', 'avatar'] }).then(officers => {
                        comments.forEach(c => {
                            switch (c.client) {
                                case 'customer':
                                    for (var i = 0; i < customers.length; i++) {
                                        if (customers[i].id == c.user) {
                                            c.user = customers[i];
                                        }
                                    }
                                    break;
                                case 'partner':
                                    for (var i = 0; i < partners.length; i++) {
                                        if (partners[i].id == c.user) {
                                            c.user = partners[i];
                                        }
                                    }
                                    break;
                                case 'officer':
                                    for (var i = 0; i < officers.length; i++) {
                                        if (officers[i].id == c.user) {
                                            c.user = officers[i];
                                        }
                                    }
                                    break;
                            }
                        });
                        res.json({ err: 0, comments });
                    })
                })
            })

        });
    },

    officerGetComments: (req, res) => {
        let { limit, skip, replyFor } = req.body;
        if (!limit || skip == null) return res.paramError();
        let query = { limit, skip };
        if (replyFor) query.replyFor = replyFor;
        Comment.find(query).then(comments => {
            let ids = {
                customer: [],
                partner: [],
                officer: []
            }
            comments.forEach(c => {
                ids[c.client].push(c.user);
            })
            Customer.find({ id: ids.customer }, { select: ['name', 'avatar'] }).then(customers => {
                Partner.find({ id: ids.partner }, { select: ['name', 'avatar'] }).then(partners => {
                    Officer.find({ id: ids.officer }, { select: ['name', 'avatar'] }).then(officers => {
                        comments.forEach(c => {
                            switch (c.client) {
                                case 'customer':
                                    for (var i = 0; i < customers.length; i++) {
                                        if (customers[i].id == c.user) {
                                            c.user = customers[i];
                                        }
                                    }
                                    break;
                                case 'partner':
                                    for (var i = 0; i < partners.length; i++) {
                                        if (partners[i].id == c.user) {
                                            c.user = partners[i];
                                        }
                                    }
                                    break;
                                case 'officer':
                                    for (var i = 0; i < officers.length; i++) {
                                        if (officers[i].id == c.user) {
                                            c.user = officers[i];
                                        }
                                    }
                                    break;
                            }
                        });
                        res.json({ err: 0, comments });
                    })
                })
            })
        });
    },

    officerDeleteComment: (req, res) => {
        let { commentId } = req.body;
        Comment.findOne({ id: commentId }).then(comment => {
            if (!comment) return res.paramError();
            comment.status = false;
            comment.save().then(rs => {
                Comment.changeReplyCount({ commentId: comment.replyFor, count: -1 }).then(rs => {
                    res.ok();
                });
            });

        });
    }

};
