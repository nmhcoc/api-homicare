/**
 * AccountController
 *
 * @description :: Server-side logic for managing accounts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    cashOut: (req, res) => {
        req.body.officer = req.info.user;
        Account.cashOut(req.body).then(rs => {
            res.ok();
        }, err => res.json(err));
    },
    cashIn: (req, res) => {
        req.body.officer = req.info.user;
        Account.cashIn(req.body).then(rs => {
            res.ok();
        }, err => res.json(err));
    },
};

