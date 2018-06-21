var rndStr = require("randomstring");
let uuid = require('uuid');
let request = require('request');
let FCM = require('fcm-node');
let bcrypt = require('bcrypt');
let moment = require('moment');
let path = require('path');
const nodemailer = require('nodemailer');
let pug = require('pug');
var CryptoJS = require("crypto-js");
let payment = {};
let objectid = require('mongodb').ObjectID;
const crypto = require('crypto');
payment.decodeIPN = (raw) => {
    try {
        var bytes = CryptoJS.AES.decrypt(raw.toString(), Conf.data.PAYPLUS_SECRET);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (err) {
        return "";
    }
}
payment.decodeNapas = (repsonseData) => {
    let hash = crypto.createHash('sha256');
    let source = repsonseData.data + 'E9AF69307EBF8FD1DA96FB90639498C5';
    hash.update(source);
    let checksum = hash.digest().toString('hex').toUpperCase();
    let data = null;
    if (checksum === repsonseData.checksum) {
        let plainText = new Buffer(repsonseData.data, 'base64').toString('ascii');
        data = JSON.parse(plainText);
    }
    // logger.log("napas", `ipn data: ` + JSON.stringify(data));
    return data;
}
payment.getCardForm = (user, type) => {
    return new Promise((resolve, reject) => {
        payment.getToken().then(token => {
            let option = { uuid: user };
            callPayplusApi(`/housing/cardForm?type=${type}`, option, `Bearer ${token.token}`).then(data => {
                resolve(data.html);
            }, err => {
                reject({ err: 2 });
            })
        })
    })
}
payment.getToken = () => {
    return new Promise((resolve, reject) => {
        callPayplusApi(`/token/createTokenMerchant`, {}, Conf.data.PAYPLUS_BASIC_TOKEN).then(data => {
            resolve(data.token);
        }, err => {
            reject();
        })
    })
}
payment.verifyOtp = (transId, otp) => {
    return new Promise((resolve, reject) => {
        PayplusTransaction.findOne({ id: transId }).then(transaction => {
            payment.getToken().then(token => {
                let option = {
                    transId: transaction.payplusTransaction,
                    otp
                }
                callPayplusApi(`/housing/verifyOtp`, option, `Bearer ${token.token}`).then(data => {
                    if (data.err == 0) {
                        transaction.result = data.status;
                        transaction.save().then(rs => {
                            resolve(data);
                        }, err => {
                            reject({ err: 3, desc: 'invalid attribute payplus transaction' });
                        })
                    } else {
                        reject({ err: 4, msg: 'Sai mã OTP' });
                    }
                })
            })
        })
    })
}
payment.pay = (card, amount, user, order) => {
    return new Promise((resolve, reject) => {
        payment.getToken().then(token => {
            let option = {
                cardToken: card.token,
                uuid: user,
                orderAmount: amount
            }
            PayplusTransaction.create({
                card: card.id,
                user: user.id,
                amount,
                request: JSON.stringify(option),
                order: order.id
            }).then(trans => {
                callPayplusApi('/housing/payment', option, `Bearer ${token.token}`).then(res => {
                    if (res.err === 0) {
                        trans.payplusTransaction = res.transId;
                        trans.save().then(rs => {
                            resolve(trans);
                        }, err => {
                            reject({ err: 4, desc: 'invalid attributes transactions payplus' });
                        });
                    } else {
                        trans.save().then(rs => {
                            reject({ err: 3, content: res });
                        }, err => {
                            reject({ err: 4, desc: 'invalid attributes transactions payplus' });
                        });
                    }
                })
            })
        })
    }, err => {
        reject({ err: 1 });
    })
}
payment.interPay = (card, amount, user, order) => {
    return new Promise((resolve, reject) => {
        payment.getToken().then(token => {
            let option = {
                cardToken: card.token,
                expireMonth: card.expiryMonth,
                expireYear: card.expiryYear,
                uuid: user,
                orderAmount: order.price,
                orderId: order.id
            }
            PayplusTransaction.create({
                card: card.id,
                user: user.id,
                amount,
                request: JSON.stringify(option),
                order: order.id
            }).then(trans => {
                callPayplusApi('/housing/interPay', option, `Bearer ${token.token}`).then(res => {
                    resolve(res);
                })
            })
        })
    }, err => {
        reject({ err: 1 });
    })
}
callPayplusApi = (url, input, token) => {
    return new Promise((resolve, reject) => {
        let option = {
            method: 'POST',
            uri: `${Conf.data.PAYPLUS_HOST}${url}`,
            headers: {
                'Authorization': token
            },
            form: input
        }
        log.file('payment', `[REQUEST]: ${JSON.stringify(option)}]`)
        request(option, (err, response, body) => {
            log.file('payment', `[RESPONSE] [BODY: ${JSON.stringify(body)}] [ERR: ${err}]`)
            try {
                let data = JSON.parse(body.trim());
                resolve(data);
            } catch (err) {
                reject();
            }
        })
    })
}

module.exports = payment;