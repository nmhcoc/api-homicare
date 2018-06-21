const _ = require('lodash');
let internationals = ['VISA', 'MASTER'];


module.exports = {
    listen: (req, res, next) => {
        let input = JSON.stringify(req.body);
        let { data } = req.body;
        if (!data) return res.paramError();;
        Ipn.create({ response: input }).then(rs => {
            try {
                let input = JSON.parse(payment.decodeIPN(data));
                if (input.paymentResult) {
                    Order.findOne({ id: input.merchantOrder, paymentStatus: 'pending' }).then(order => {
                        if (!order) return res.paramError();
                        if (input.paymentResult.result == 'SUCCESS') {
                            Order.update({ id: order.id }, { paymentStatus: 'done' }).then(() => {
                                Account.finishOrderOnlinePayment({ order, createdBy: 'ipn' }).then(() => {
                                    res.ok();
                                })
                            })
                        }
                    })
                } else if (input.tokenResult) {
                    let user = input.tokenResult.deviceId.split('_')[1];
                    if (input.tokenResult.card.expiry) {

                        let cardInfo = {
                            user,
                            brand: input.tokenResult.card.brand,
                            name: 'NO NAME',
                            expiryMonth: input.tokenResult.card.expiry.month,
                            expiryYear: input.tokenResult.card.expiry.year,
                            number: input.tokenResult.card.number,
                            cardScheme: input.tokenResult.card.scheme,
                            token: input.tokenResult.token,
                            isActive: true,
                            status3ds: input.tokenResult.card.status3ds,
                            area: 'international'
                        }
                        Card.create(cardInfo).then(rs => {
                        })
                    } else {
                        let cardInfo = {
                            user,
                            brand: input.tokenResult.card.brand,
                            name: input.tokenResult.card.nameOnCard,
                            expireDate: input.tokenResult.card.issueDate,
                            number: input.tokenResult.card.number,
                            cardScheme: input.tokenResult.card.scheme,
                            token: input.tokenResult.token,
                            isActive: true,
                            area: 'domestic'
                        }
                        Card.create(cardInfo).then(rs => {
                            log.file('ipn', `[CREATE CARD SUCCESS] [${JSON.stringify(cardInfo)}]`)
                        })
                    }
                }
            } catch (err) {
                log.file('ipn', `[ERROR PARSE JSON] [${data}]`)
            }

        });
    }
}