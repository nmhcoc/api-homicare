/**
 * DevController
 *
 * @description :: Server-side logic for managing devs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    createBaseAccount: (req, res) => {
        let accounts = [{
            balance: 0, name: 'cash'
        }, {
            balance: 0, name: 'payables'
        }, {
            balance: 0, name: 'income'
        }]
        Account.native((err, collection) => {
            collection.insert(accounts).then(rs => {
                res.ok();
            })
        })
    },
};

