/**
 * ContactController
 *
 * @description :: Server-side logic for managing contacts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    getListContacts: (req, res) => {
        Partner.find({}, { select: ['name', 'phone', 'birth', 'address', 'email', 'avatar', 'gender'] }).then(partners => {
            Customer.find({}, { select: ['name', 'phone', 'birth', 'address', 'email', 'avatar', 'gender'] }).then(customers => {
                res.json({ err: 0, partners, customers })
            })
        })
    }
};

