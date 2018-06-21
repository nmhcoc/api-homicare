/**
 * LabController
 *
 * @description :: Server-side logic for managing labs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const sharp = require('sharp');
const path = require('path');
module.exports = {

    adminCreateCompany: (req, res) => {
        let { name, phone, user, email, jobs, address } = req.body;
        if (!name || !phone || !user || !email || !jobs || !address) return res.paramError();
        let promises = [];
        promises.push(new Promise((resolve, reject) => {
            if (!common.checkChildExist(req.files, 'file')) return res.paramError();
            let fname = auth.createTokenString();
            sharp(req.files.file.data)
                .resize(128, 128, {
                    withoutEnlargement: false,
                    kernel: sharp.kernel.lanczos2,
                    interpolator: sharp.interpolator.nohalo
                })
                .png()
                .toFile(path.join(common.getImageFolder(), 'profile', `${fname}.png`))
                .then(function () {
                    resolve(`profile/${fname}.png`);
                });
        }))
        Promise.all(promises)
            .then(rs => {
                let avatar = rs[0];
                Company.create({ name, phone, user, email, jobs, address, avatar }).then(rs => {
                    res.ok();
                }, err => {
                    res.paramError();
                })
            });
    },
    adminEditCompany: (req, res) => {
        let { companyId, name, phone, user, email, jobs, address } = req.body;
        if (!companyId || !name || !phone || !user || !email || !jobs || !address) return res.paramError();
        let promises = [];
        promises.push(new Promise((resolve, reject) => {
            if (!common.checkChildExist(req.files, 'file')) return resolve();
            let fname = auth.createTokenString();
            sharp(req.files.file.data)
                .resize(128, 128, {
                    withoutEnlargement: false,
                    kernel: sharp.kernel.lanczos2,
                    interpolator: sharp.interpolator.nohalo
                })
                .png()
                .toFile(path.join(common.getImageFolder(), 'profile', `${fname}.png`))
                .then(function () {
                    resolve(`profile/${fname}.png`);
                });
        }))
        Promise.all(promises)
            .then(rs => {
                let avatar = rs[0];
                let update = { name, phone, user, email, jobs, address };
                if (avatar) {
                    update.avatar = avatar;
                }
                Company.update({ id: companyId }, update).then(rs => {
                    res.ok();
                }, err => {
                    res.paramError();
                })
            });
    },
    adminDeleteCompany: (req, res) => {
        let { companyId } = req.body;
        if (!companyId) return res.paramError();
        Company.findOne({ id: companyId }).then(company => {
            if (!company) return res.json({ err: 2, desc: 'company is not exists' });
            company.isActive = false;
            company.save().then(rs => {
                res.ok();
            })
        })
    },

    adminFindCompanies: (req, res) => {
        let { name, phone, email, user, limit, skip } = req.body;
        if (!limit || skip == null) return res.paramsError();
        let query = { limit, skip };
        if (name) query.name = { contains: name };
        if (phone) query.phone = { contains: phone };
        if (email) query.email = { contains: email };
        Company.find(query).then(companies => {
            Company.count(query).then(count => {
                res.json({ err: 0, count, companies });
            })
        }, err => {
            res.paramsError();
        });
    },
    adminEditLab: (req, res) => {

    }
};

