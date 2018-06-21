/**
 * PostController
 *
 * @description :: Server-side logic for managing posts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const sharp = require('sharp');
const path = require('path');
module.exports = {
    adminDeletePost: (req, res) => {
        let { postId } = req.body;
        if (!postId) return res.paramError();
        Post.destroy({ id: postId }).then(rs => {
            res.ok();
        })
    },
    adminCreatePost: (req, res) => {
        let { title, status, content, author, category, tag } = req.body;
        if (!title || status == null || !content || !author || !category) return res.paramError();
        let fname = auth.createTokenString();
        let promises = [];
        promises.push(new Promise((resolve, reject) => {
            if (!common.checkChildExist(req.files, 'file')) return reject();
            const fname = auth.createTokenString();
            // convert image
            sharp(req.files.file.data)
                .resize(900, 600, {
                    withoutEnlargement: false,
                    kernel: sharp.kernel.lanczos2,
                    interpolator: sharp.interpolator.nohalo
                })
                .png()
                .toFile(path.join(common.getImageFolder(), 'post', fname + '.png'))
                .then(function () {
                    // convert thumbnail
                    sharp(req.files.file.data)
                        .resize(120, 80, {
                            withoutEnlargement: false,
                            kernel: sharp.kernel.lanczos2,
                            interpolator: sharp.interpolator.nohalo
                        })
                        .png()
                        .toFile(path.join(common.getImageFolder(), 'post', fname + '_thumb.png'))
                        .then(function () {
                            resolve({
                                image: `post/${fname}.png`,
                                thumbnail: `post/${fname}_thumb.png`
                            })
                        });
                });
        }));
        Promise.all(promises).then(rs => {
            Post.create({
                title, status, content, author, category, tag,
                image: rs[0].image,
                thumbnail: rs[0].thumbnail,
                createdAt: new Date(),
                nView: 0
            }).then(rs => {
                res.ok();
            }, err => {
                res.json(err);
            })
        }, err => {
            res.paramError();
        });
    },
    adminEditPost: (req, res) => {
        let { postId, title, status, content, author, category, tag } = req.body;
        if (!postId || !title || !status || !content || !author || !category) return res.paramError();

        promises.push(new Promise((resolve, reject) => {
            if (!common.checkChildExist(req.files, 'file')) return resolve();
            const fname = auth.createTokenString();
            // convert image
            sharp(req.files.file.data)
                .resize(900, 600, {
                    withoutEnlargement: false,
                    kernel: sharp.kernel.lanczos2,
                    interpolator: sharp.interpolator.nohalo
                })
                .png()
                .toFile(path.join(common.getImageFolder(), 'post', fname + '.png'))
                .then(function () {
                    // convert thumbnail
                    sharp(req.files.file.data)
                        .resize(120, 80, {
                            withoutEnlargement: false,
                            kernel: sharp.kernel.lanczos2,
                            interpolator: sharp.interpolator.nohalo
                        })
                        .png()
                        .toFile(path.join(common.getImageFolder(), 'post', fname + '_thumb.png'))
                        .then(function () {
                            resolve({
                                image: `post/${fname}.png`,
                                thumbnail: `post/${fname}_thumb.png`
                            })
                        });
                });
        }));
        Promise.all(promises).then(rs => {
            let query = {
                title, status, content, author, category, tag,
                createdAt: new Date(),
                nView: 0
            }
            if (res[0]) {
                query.image = rs[0].image;
                query.thumbnail = rs[0].thumbnail;
            }
            Post.update({ id: postId }, query).then(rs => {
                res.ok();
            })
        });
    },
    findPosts: (req, res) => {
        let { skip, limit, category, search, status } = req.body;
        if ((!skip && skip !== 0) || !limit) return res.paramError();
        let query = { limit, skip };
        if (category) {
            query.category = category;
        }
        if (status) {
            query.status = status;
        }
        if (search) {
            query.or = [
                { title: { contains: search } },
                { content: { contains: search } },
                { author: { contains: search } },
                { tag: { contains: search } }
            ]
        }
        Post.find(query).then(posts => {
            Post.count(query).then(count => {
                res.json({ err: 0, posts, count })
            })
        })
    }
};

