/**
 * Vnp.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const dateFormat = require('dateformat');
const querystring = require('qs');
const md5 = require('md5');

module.exports = {

  attributes: {

  },
  sortObject: sortObject,
  createPayOrderUrl: (opts) => {
    return new Promise((resolve, reject) => {
      VnpTransaction.create().then(trans => {
        let { order, ip, language, bankCode, orderType } = opts;
        var ipAddr = ip;
        if (!language) language = 'vi';
        var tmnCode = sails.config.VNPAY['vnp_TmnCode'];
        var secretKey = sails.config.VNPAY['vnp_HashSecret'];
        var vnpUrl = sails.config.VNPAY['vnp_Url'];
        var returnUrl = sails.config.VNPAY['vnp_ReturnUrl'];
        var date = new Date();
        var createDate = dateFormat(date, 'yyyymmddHHmmss');
        var orderId = order.id;//dateFormat(date, 'HHmmss');
        var amount = order.price;

        var orderInfo = `Thanh toán đơn hàng ${order.id}`;
        var orderPayType = 'billpayment';
        var locale = language;
        if (locale === null || locale === '') {
          locale = 'vn';
        }
        var currCode = 'VND';
        var vnp_Params = {};
        vnp_Params['vnp_Version'] = '2';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        // vnp_Params['vnp_Merchant'] = ''
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        let ref = trans.id;
        vnp_Params['vnp_TxnRef'] = ref;
        vnp_Params['vnp_OrderInfo'] = orderInfo;
        vnp_Params['vnp_OrderType'] = orderPayType;
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        if (bankCode !== null && bankCode !== '') {
          vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = sortObject(vnp_Params);
        var signData = secretKey + querystring.stringify(vnp_Params, { encode: false });
        var secureHash = md5(signData);

        vnp_Params['vnp_SecureHashType'] = 'MD5';
        vnp_Params['vnp_SecureHash'] = secureHash;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: true });
        trans.order = order.id;
        trans.params = JSON.stringify(vnp_Params);
        trans.save().then(() => {
          resolve({ err: 0, vnpUrl, trans })
        }, err => {
          reject();
        });
      }, err => {
        reject();
      });
    });
  }
};

function sortObject(o) {
  var sorted = {},
    key, a = [];

  for (key in o) {
    if (o.hasOwnProperty(key)) {
      a.push(key);
    }
  }

  a.sort();

  for (key = 0; key < a.length; key++) {
    sorted[a[key]] = o[a[key]];
  }
  return sorted;
}