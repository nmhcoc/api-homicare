/**
 * CategoryController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    findCategories: (req, res) => {
        Category.find().then(categories => {
            res.json({ err: 0, categories })
        })
    }
};

