/**
 * PartnerQueueController
 *
 * @description :: Server-side logic for managing partnerqueues
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    partnerRegisterQueue: (req, res) => {
        PartnerQueue.create({
            partner: req.info.user.id,
            jobs: req.info.user.jobs,
            districtsOfWorking: req.info.user.districtsOfWorking
        }).then(rs => {
            res.ok();
        }, err => {
            res.attrsError(err)
        })
    },
    set: (req, res) => {
        PartnerQueue.addPartner('partner', ['job1', 'job2'], 'district');
        res.ok();
    },
    get: (req, res) => {
        res.json(PartnerQueue.getQueue());
    }
};

