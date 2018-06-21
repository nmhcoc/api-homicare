/**
 * VnpController
 *
 * @description :: Server-side logic for managing vnps
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    vnpGetCardForm: (req, res) => {

    },
    payOrder: (req, res) => {
        let { orderId, language, bankCode } = req.body;
        bankCode = '';
        if (!orderId || !language) return res.paramError();
        Order.findOne({ id: orderId }).then(order => {
            if (!order) return res.paramError();
            let input = { order, ip: req.clientIp, language, bankCode, orderType: 'job' };
            Vnp.createPayOrderUrl(input).then(rs => {
                res.json({ err: 0, vnpUrl: rs.vnpUrl, trans: rs.trans.id });
            });
        })
    },
    orderReturn: (req, res) => {
        var vnp_Params = req.query;
        var secureHash = vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];
        vnp_Params = Vnp.sortObject(vnp_Params);

        var tmnCode = sails.config.VNPAY['vnp_TmnCode'];
        var secretKey = sails.config.VNPAY['vnp_HashSecret'];

        var querystring = require('qs');
        var signData = secretKey + querystring.stringify(vnp_Params, { encode: false });

        var md5 = require('md5');

        var checkSum = md5(signData);

        if (secureHash === checkSum) {
            //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
            let transId = vnp_Params.vnp_TxnRef;
            VnpTransaction.findOne({ id: transId }).then(trans => {
                if (!trans) return;
                trans.response = JSON.stringify(vnp_Params);
                if (vnp_Params.vnp_ResponseCode == '00') {
                    res.render('payment/success');
                } else {
                    res.render('payment/fail');
                }
            });
        } else {
        }
    }
};

