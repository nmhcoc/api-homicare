/**
 * DistrictController
 *
 * @description :: Server-side logic for managing districts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

let _ = require('lodash');
module.exports = {
    removeDistrictFromPartner: (req, res) => {
        let { district, partnerId } = req.body;
        if (!district || !partnerId) return res.paramError();
        district = district.toString();
        //find order
        Partner.findOne({ id: partnerId }).then(partner => {
            if (!partner) return res.json({ err: 2, desc: 'partner not exist' });
            if (partner.isPartner) return res.json({ err: 3, desc: 'user is not a partner' });
            if (!partner.districtsOfWorking) partner.districtsOfWorking = [];
            if (!_.includes(partner.districtsOfWorking, district)) return res.json({ err: 4, desc: 'partner does not include district' });
            _.pull(partner.districtsOfWorking, district);
            partner.save().then(rs => {
                res.ok();
            })
        });
    },
    addDistrictToPartner: (req, res) => {
        let { district, partnerId } = req.body;
        if (!district || !partnerId) return res.paramError();
        district = district.toString();
        //find order
        Partner.findOne({ id: partnerId }).then(partner => {
            if (!partner) return res.json({ err: 2, desc: 'partner not exist' });
            if (partner.isPartner) return res.json({ err: 3, desc: 'user is not a partner' });
            if (_.includes(partner.districtsOfWorking, district)) return res.json({ err: 4, desc: 'partner already include district' });
            if (!partner.districtsOfWorking) partner.districtsOfWorking = [];
            partner.districtsOfWorking.push(district);
            partner.save().then(rs => {
                res.ok();
            })
        });
    },
};

