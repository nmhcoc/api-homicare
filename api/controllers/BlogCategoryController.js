/**
 * BlogCategoryController
 *
 * @description :: Server-side logic for managing blogcategories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const sharp = require('sharp');
const path = require('path');
module.exports = {
    findBlogCategories: (req, res) => {
        BlogCategory.find().then(categories => {
            res.json({ err: 0, categories })
        })
    },
    adminCreateBlogCategory: (req, res) => {
        let { name } = req.body;
        if (!name || !common.checkChildExist(req.files, 'file')) return res.paramError();
        let promises = [];
        promises.push(new Promise((resolve, reject) => {
            const fname = auth.createTokenString();
            sharp(req.files.file.data)
                .resize(300, 300, {
                    withoutEnlargement: false,
                    kernel: sharp.kernel.lanczos2,
                    interpolator: sharp.interpolator.nohalo
                })
                .png()
                .toFile(path.join(sails.services.common.getImageFolder(), 'post', `${fname}.png`))
                .then(() => {
                    resolve(`post/${fname}.png`);
                });
        }));
        Promise.all(promises).then(rs => {
            const image = rs[0];
            BlogCategory.create({ name, image }).then(rs => {
                res.ok();
            })
        }, err => {
            res.paramError();
        });
    },
    adminEditBlogCategory: (req, res) => {
        let { categoryId, name } = req.body;
        if (!name) return res.paramsError();
        let promises = [];

        promises.push(new Promise((resolve, reject) => {
            if (!common.checkChildExist(req.files, 'file')) return resolve();
            const fname = auth.createTokenString();
            sharp(req.files.file.data)
                .resize(300, 300, {
                    withoutEnlargement: false,
                    kernel: sharp.kernel.lanczos2,
                    interpolator: sharp.interpolator.nohalo
                })
                .png()
                .toFile(path.join(sails.services.common.getImageFolder(), 'post', `${fname}.png`))
                .then(() => {
                    resolve(`post/${fname}.png`);
                });
        }));
        Promise.all(promises).then(rs => {
            const image = rs[0];
            let update = { name };
            if (image) {
                update.image = image;
            }
            BlogCategory.update({ id: categoryId }, update).then(rs => {
                res.ok();
            })
        }, err => {
            res.paramError();
        });
    },
    adminDeleteBlogCategory: (req, res) => {
        let { categoryId } = req.body;
        if (!categoryId) return res.paramsError();
        BlogCategory.destroy({ id: categoryId }).then(rs => {
            res.ok();
        })
    }
};

