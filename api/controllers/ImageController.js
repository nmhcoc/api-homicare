/**
 * ImageController
 *
 * @description :: Server-side logic for managing images
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const sharp = require('sharp');
const path = require('path');
module.exports = {
    upload: (req, res) => {
        try {
            let { type, w, h } = req.query;
            if (!type) throw 'invalid_type';
            if (req.files && req.files.file) {
                let fname = `${auth.createTokenString()}.png`;
                new Promise((resolve, reject) => {
                    if (w && h) {
                        if (!w || !h) throw 'with_height_not_found';
                        w = Number(w);
                        h = Number(h);
                        sharp(req.files.file.data)
                            .resize(w, h, {
                                withoutEnlargement: false,
                                kernel: sharp.kernel.lanczos2,
                                interpolator: sharp.interpolator.nohalo
                            })
                            .png()
                            .toFile(path.join(common.getImageFolder(), type, fname))
                            .then(() => { resolve() })

                    } else {
                        fname = `${auth.createTokenString()}${path.extname(req.files.file.name)}`;
                        req.files.file.mv(path.join(common.getImageFolder(), type, fname), function (err) {
                            resolve();
                        });
                    }
                }).then(() => {
                    Image.create({ url: `${type}/${fname}`, user: req.info.user.id }).then(img => {
                        res.ok(img);
                    })
                });
            } else {
                throw 'file_not_found';
            }
        } catch (err) {
            res.json(err);
        }
    }
};

