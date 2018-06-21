/**
 * DependencyController
 *
 * @description :: Server-side logic for managing dependencies
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const sharp = require('sharp');
const path = require('path');
module.exports = {
    createDependency: (req, res) => {
        let { name, birth, relation, gender } = req.body;
        if (!name || !birth || !relation || !gender)
            return res.paramError();
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
                Dependency.create({ name, birth, relation, user: req.info.user.id, avatar, gender }).then(dependency => {
                    res.ok();
                })
            });
    },
    editDependency: (req, res) => {
        let { dependencyId, name, birth, relation, gender } = req.body;
        if (!dependencyId || !name || !birth || !relation || !gender) return res.paramError();
        Dependency.findOne({ user: req.info.user.id, id: dependencyId }).then(dependency => {
            if (!dependency) return res.json({ err: 2, desc: 'not found dependency' });
            if (dependency.user != req.info.user.id) return res.json({ err: 3, desc: 'user is not dependecy s owner' });
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
            }));
            Promise.all(promises)
                .then(rs => {
                    let avatar = rs[0];
                    Object.assign(dependency, { name, birth, relation });
                    if (avatar) dependency.avatar = avatar;
                    dependency.save().then(() => { res.ok() })
                });

        })
    },
    deleteDependency: (req, res) => {
        let { dependencyId } = req.body;
        if (!dependencyId) return res.paramError();
        Dependency.destroy({ id: dependencyId, user: req.info.user.id }).then(rs => {
            res.ok();
        })
    },
    customerFindDependency: (req, res) => {
        Dependency.find({ user: req.info.user.id }).then(dependencies => {
            res.json({ err: 0, dependencies });
        })
    },
    adminFindDependency: (req, res) => {
        let { user, name, relation, gender, limit, skip } = req.body;
        if (skip == null || !limit) return res.paramError();
        let query = {};
        if (gender) query.gender = gender;
        if (user) query.user = user;
        if (name) query.name = { contains: user };
        if (relation) query.relation = { contains: relation }
        Dependency.find(Object.assign({}, query, limit, skip)).then(dependencies => {
            Dependency.count(query).then(count => {
                res.json({ err: 0, count, dependencies });
            })
        })
    }
};

