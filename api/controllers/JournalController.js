/**
 * JournalController
 *
 * @description :: Server-side logic for managing journals
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const moment = require('moment');
module.exports = {
    findJournalEntries: (req, res) => {
        if (req.method == 'GET') {
            let { account, refAccount, startTime, endTime } = req.query;
            Journal.findJournalEntries(req.query).then(entries => {
                report.genExcelData('journalEntries.xlsx', entries).then(binary => {
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                    res.setHeader("Content-Disposition", "attachment; filename=" + `JournalEntries${moment().format()}.xlsx`);
                    res.end(binary, 'binary');
                });
            })
        } else if (req.method == 'POST') {
            let { skip, limit, account, refAccount, startTime, endTime } = req.body;
            if (skip == null || !limit) return res.paramError();
            Journal.findJournalEntries(req.body).then(entries => {
                entries.err = 0;
                res.json(entries);
            })
        }
    }
};