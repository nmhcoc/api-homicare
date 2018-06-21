/**
 * VnpIpnController
 *
 * @description :: Server-side logic for managing vnpipns
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const querystring = require('qs');
module.exports = {
    listen: (req, res) => {
        var vnp_Params = req.query;
        VnpIpn.create({ content: JSON.stringify(vnp_Params) }).then(rs => {
            var secureHash = vnp_Params['vnp_SecureHash'];

            delete vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHashType'];

            vnp_Params = Vnp.sortObject(vnp_Params);
            var secretKey = sails.config.VNPAY['vnp_HashSecret'];

            var signData = secretKey + querystring.stringify(vnp_Params, { encode: false });

            var md5 = require('md5');

            var checkSum = md5(signData);

            if (secureHash === checkSum) {
                var transId = vnp_Params['vnp_TxnRef'];
                var rspCode = vnp_Params['vnp_ResponseCode'];
                VnpTransaction.findOne({ id: transId }).then(trans => {
                    if (!trans) return;
                    trans.response = JSON.stringify(vnp_Params);
                    if (vnp_Params.vnp_ResponseCode == '00') {
                        trans.status = 'success';
                        trans.save().then(() => {
                            Order.findOne({ id: trans.order }).then(order => {
                                order.paymentStatus = 'done';
                                order.save().then(rs => {
                                    let input = {
                                        order,
                                        controller: order.controller,
                                        server: order.server
                                    }

                                    log.log2File('orderctrl', `customerCreateOrder - orderid = ${order.id} & customer/createdBy = ${req.body.customer.id} (${req.body.customer.name}) & checkInviteCode = ${order.checkInviteCode}`);
                                    Order.findPartners(order.id, order);
                                });
                            })
                        });
                    } else {
                        trans.status = 'failure';
                        trans.save().then(() => {

                        });
                    }
                });

                //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
                res.status(200).json({ RspCode: '00', Message: 'success' })
            }
            else {
                res.status(200).json({ RspCode: '97', Message: 'Fail checksum' })
            }
        });
    }
};

