/**
 * FaqController
 *
 * @description :: Server-side logic for managing faqs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    find: (req, res) => {
        let { skip, limit } = req.body;
        if (skip == null || !limit) return res.paramError();
        Faq.find({ skip, limit }).then(faqs => {
            res.json({ err: 0, faqs });
        })
    },
    create: (req, res) => {
        let { answer, question, combo, job } = req.body;
        if (!answer || !question) return res.paramError();
        Faq.create({ answer, question, combo, job }).then(() => {
            res.ok();
        })
    },
    delete: (req, res) => {
        let { id } = req.body;
        if (!id) return res.paramError();
        Faq.destroy({ id }).then(() => {
            res.ok();
        })
    },
    update: (req, res) => {
        let { id, answer, question, combo, job } = req.body;
        if (!id || !answer || !question) return res.paramError();
        Faq.update({ id }, { answer, question, combo, job }).then(() => {
            res.ok();
        })
    }
};

