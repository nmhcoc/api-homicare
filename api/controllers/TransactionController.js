/**
 * TransactionController
 *
 * @description :: Server-side logic for managing transactions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    userFindTransactions: (req, res) => {
        let { skip, limit, startTime, endTime } = req.body;
        if (skip == null || !limit) return res.paramsError();
        Account.findOne({ user: req.info.user.id }).then(account => {
            if (!account) return res.json({ err: 2, desc: 'account not found' })
            let query = {
                sort: 'createdAt DESC',
                skip, limit, or: [
                    {
                        source: account.id
                    },
                    {
                        destination: account.id
                    }
                ]
            };
            if (startTime) {
                if (!query.createdAt) query.createdAt = {};
                query.createdAt['>='] = new Date(startTime)
            }
            if (endTime) {
                if (!query.createdAt) query.createdAt = {};
                query.createdAt['<='] = new Date(endTime)
            }
            Transaction.find(query).then(transactions => {
                res.json({ err: 0, transactions });
            });
        });
    },
    adminFindTransactions: (req, res) => {
        let { skip, limit, startDate, endDate, source, destination } = req.body;
        if (skip == null || !limit) return res.paramsError();
        let query = {
            skip, limit
        };
        if (source) {
            query.source = source;
        }
        if (destination) {
            query.destination = destination;
        }
        if (startDate) {
            query.createdAt = {
                '>=': new Date(startDate)
            }
        }
        if (endDate) {
            query.createdAt = {
                '<=': new Date(endDate)
            }
        }
        Transaction.find(query).then(transactions => {
            res.json({ err: 0, transactions });
        })
    }
};

