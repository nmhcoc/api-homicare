/**
 * Journal.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    account: { type: 'string', required: true },
    accountName: { type: 'string' },
    refAccount: { type: 'string' },
    debit: { type: 'float' },
    credit: { type: 'float' },
    object: { type: 'string' },
    desc: { type: 'string' },
    balance: { type: 'float', required: true },
    createdBy: { type: 'string' }
  },
  debit: (opts) => {
    return new Promise((resolve, reject) => {
      let { account, refAccount, debit, object, desc, createdBy } = opts;
      Account.findOne({ id: account }).then(accountInfo => {
        log.log2File('journal', `debit - account = ${account} & accounting = ${accountInfo.accounting} & balance = ${accountInfo.balance} & refAccount = ${refAccount} & debit = ${debit} & object = ${object} & desc = ${desc} & createdBy = ${createdBy}`);
        if (accountInfo.accounting == 'assets') {
          accountInfo.balance += debit;
        } else {
          accountInfo.balance -= debit;
        }
        accountInfo.save().then(() => {
          log.log2File('journal', `debit - account = ${account} & accounting = ${accountInfo.accounting} & balance = ${accountInfo.balance} & refAccount = ${refAccount} & object = ${object} & createdBy = ${createdBy}`);
          accountInfo.updateUserBalance().then(() => {
            Journal.create({ account, refAccount, debit, desc, object, balance: accountInfo.balance, accountName: accountInfo.name, createdBy }).then(rs => {
              resolve(rs)
            }, err => {
              reject(err);
            })
          })
        }, err => {
          reject(err);
        })
      })
    })
  },
  credit: (opts) => {
    return new Promise((resolve, reject) => {
      let { account, refAccount, credit, object, desc, createdBy } = opts;
      Account.findOne({ id: account }).then(accountInfo => {
        log.log2File('journal', `credit - account = ${account} & accounting = ${accountInfo.accounting} & balance = ${accountInfo.balance} & refAccount = ${refAccount} & credit = ${credit} & object = ${object} & desc = ${desc} & createdBy = ${createdBy}`);
        if (accountInfo.accounting == 'assets') {
          accountInfo.balance -= credit;
        } else {
          accountInfo.balance += credit;
        }
        accountInfo.save().then(() => {
          log.log2File('journal', `credit - account = ${account} & accounting = ${accountInfo.accounting} & balance = ${accountInfo.balance} & refAccount = ${refAccount} & object = ${object} & createdBy = ${createdBy}`);
          accountInfo.updateUserBalance().then(() => {
            Journal.create({ account, refAccount, credit, desc, object, balance: accountInfo.balance, accountName: accountInfo.name, createdBy }).then(rs => {
              resolve(rs)
            }, err => {
              reject(err);
            })
          })
        }, err => {
          reject(err);
        })
      })
    })
  },

  findJournalEntries: (opts) => {
    return new Promise((resolve, reject) => {
      let { skip, limit, account, refAccount, startTime, endTime } = opts;
      let query = { sort: 'createdAt DESC' };
      if (skip) query.skip = skip;
      if (limit) query.limit = limit;
      if (account) query.account = account;
      if (refAccount) query.refAccount = refAccount;
      if (startTime) query.createdAt = { '>=': new Date(startTime) };
      if (endTime) query.createdAt = { '<': new Date(endTime) };
      Journal.find(query).then(entries => {
        if (entries.length == 0) return resolve({ entries, close: 0, open: 0, count: 0 });
        Journal.count(query).then(count => {
          query.skip = 0;
          query.limit = 1;
          Journal.find(query).then(close => {
            query.sort = 'createdAt ASC';
            Journal.find(query).then(open => {
              resolve({ entries, close: close[0].balance, open: open[0].balance, count });
            })
          })
        })
      })
    })
  }
};


