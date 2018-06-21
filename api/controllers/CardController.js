/**
 * CardController
 *
 * @description :: Server-side logic for managing cards
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const _ = require('lodash');
let internationals = ['VISA', 'MASTER'];
module.exports = {
    decodeIPN: (req, res) => {
        let { data } = req.body;
        res.json(JSON.parse(payment.decodeIPN(data)));
    },
    findCards: (req, res) => {
        Card.find({ user: req.info.user.id, isActive: true }).then(cards => {
            res.json({ err: 0, cards })
        })
    },

    getCardForm: (req, res) => {
        let { type } = req.query;
        if (!type) return res.send('Vui lòng thử lại');
        payment.getCardForm(req.info.user.id, type).then(html => {
            res.send(html);
        }, err => {
            res.send('Lỗi ')
        })
    },
    paymentReturn: (req, res) => {
        let input = JSON.parse(req.body.napasResult);
        let data = payment.decodeNapas(input);
        let rs = true;
        let text = ''
        if (data.paymentResult) {
            switch (data.paymentResult.result) {
                case 'SUCCESS':
                    text = 'Giao dịch thành công';
                    rs = true;
                    break;
                default:
                    text = 'Giao dịch thất bại';
                    rs = false;
                    break;
            }
        } else if (data.tokenResult) {
            if (data.tokenResult.result == 'SUCCESS') {
                text = 'Thêm thẻ thành công';
                rs = true;
            } else {
                text = 'Thêm thẻ thất bại';
                rs = false;
            }
        } else {
            rs = false;
        }
        let msg = '';
        if (rs) {
            msg = `<h3 class='text-success text-center'>${text}</h3>`
        } else {
            msg = `<h3 class='text-danger text-center'>${text}</h3>`
        }
        res.render('paymentReturn', { msg });
    }
};

