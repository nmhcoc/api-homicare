/**
 * InviteCodeController
 *
 * @description :: Server-side logic for managing invitecodes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    createInviteCode: (req, res) => {
        if (!req.info.user.name) return res.json({ err: 1, desc: 'invalid name' });
        InviteCode.findOne({ owner: req.info.user.id, type: req.info.client.name }).then(rs => {
            if (rs) {
                return res.json({
                    err: 0,
                    code: rs.code,
                    url: `${Conf.data.INTRODUCTION_SITE}/register/?code=${rs.code}`,
                    title: Conf.data.SHARE_TITLE,
                    message: Conf.data.SHARE_MESSAGE
                })
            }
            let code = common.genCodeFromName(req.info.user.name);
            InviteCode.find({
                code: { startsWith: code },
                type: req.info.client.name
            }).then(codes => {
                if (codes.length > 0) {
                    code += codes.length;
                }
                //find user account
                InviteCode.create({
                    code,
                    type: req.info.client.name,
                    owner: req.info.user.id
                }).then(rs => {
                    res.json({
                        err: 0,
                        code,
                        url: `${Conf.data.INTRODUCTION_SITE}/register/?code=${code}`,
                        title: Conf.data.SHARE_TITLE,
                        message: Conf.data.SHARE_MESSAGE
                    });
                })
            })
        });
    }
};

