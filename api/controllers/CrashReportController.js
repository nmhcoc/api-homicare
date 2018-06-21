/**
 * CrashReportController
 *
 * @description :: Server-side logic for managing crashreports
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    addCrashReport: (req, res) => {
        let { platform, uuid, name, desc } = req.body;
        if (!platform || !uuid || !name || !desc) return res.paramError();
        CrashReport.create({ platform, uuid, name, desc }).then(rs => {
            res.ok();
        })
    }
};

