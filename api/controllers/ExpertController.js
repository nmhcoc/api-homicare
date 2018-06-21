/**
 * ExpertController
 *
 * @description :: Server-side logic for managing experts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const sharp = require('sharp');
const path = require('path');
const _ = require('lodash');
module.exports = {
    findExperts: (req, res) => {
        let { limit, skip, name, job } = req.body;
        if (!limit || skip == null) return res.paramError();
        let query = { limit, skip };
        if (name) query.name = { contains: name };
        if (job) query.jobs = job;
        Expert.find(query).then(experts => {
            Expert.count(query).then(count => {
                let ids = [];
                experts.forEach(expert => {
                    if (!expert.companies) expert.companies = []
                    expert.companies.forEach(com => {
                        if (!_.includes(ids, com)) {
                            ids.push(com)
                        }
                    })
                });
                Company.find({ id: ids }, { select: ['name', 'address', 'avatar', 'phone'] }).then(companies => {
                    companies.forEach(company => {
                        for (var i = 0; i < experts.length; i++) {
                            let expert = experts[i];
                            if (_.includes(expert.companies, company.id)) {
                                if (!expert.companyInfos) expert.companyInfos = [];
                                expert.companyInfos.push(company);
                            }
                        }
                    })
                    res.json({ err: 0, count, experts });
                })
            })
        })
    },
    adminDeleteExpert: (req, res) => {
        let { expertId } = req.body;
        if (!expertId) return res.paramError();
        Expert.destroy({ id: expertId }).then(rs => {
            res.ok();
        })
    },
    adminCreateExpert: (req, res) => {
        let { name, degree, academic, histories, companies, jobs, experience } = req.body;
        if (!name || !degree || !jobs || !experience || !academic || !histories || !companies) return res.paramError();
        experience = Number(experience);
        try {
            companies = JSON.parse(companies);
        } catch (err) {
            return res.paramError();
        }

        let promises = [];
        promises.push(new Promise((resolve, reject) => {
            if (!common.checkChildExist(req.files, 'file')) return reject();
            const fname = auth.createTokenString();
            // convert image
            sharp(req.files.file.data)
                .resize(300, 300, {
                    withoutEnlargement: false,
                    kernel: sharp.kernel.lanczos2,
                    interpolator: sharp.interpolator.nohalo
                })
                .png()
                .toFile(path.join(common.getImageFolder(), 'profile', fname + '.png'))
                .then(function () {
                    resolve(`profile/${fname}.png`);
                });
        }));
        Promise.all(promises).then(rs => {
            Expert.create({
                name, degree, jobs, experience, avatar: rs[0], academic, histories, companies
            }).then(rs => {
                res.ok();
            }, err => {
                res.json(err);
            })
        }, err => {
            res.paramError();
        });
    },
    adminEditExpert: (req, res) => {
        let { expertId, name, degree, academic, histories, companies, jobs, experience } = req.body;
        if (!expertId || !name || !degree || !jobs || !experience || !academic || !histories || !companies) return res.paramError();
        experience = Number(experience);
        try {
            companies = JSON.parse(companies);
        } catch (err) {
            return res.paramError();
        }
        let promises = [];
        promises.push(new Promise((resolve, reject) => {
            const fname = auth.createTokenString();
            if (!common.checkChildExist(req.files, 'file')) return resolve();
            // convert image
            sharp(req.files.file.data)
                .resize(300, 300, {
                    withoutEnlargement: false,
                    kernel: sharp.kernel.lanczos2,
                    interpolator: sharp.interpolator.nohalo
                })
                .png()
                .toFile(path.join(common.getImageFolder(), 'profile', fname + '.png'))
                .then(function () {
                    resolve(`profile/${fname}.png`);
                });
        }));
        Promise.all(promises).then(rs => {
            let query = { name, degree, jobs, experience, academic, histories, companies };
            if (rs[0]) query.avatar = rs[0];
            Expert.update({ id: expertId }, query).then(rs => {
                res.ok();
            }, err => {
                res.json(err);
            })
        });
    },
};

