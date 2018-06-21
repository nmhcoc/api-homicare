let _ = require('lodash');
let fs = require('fs');
module.exports = (sails) => {
    return {
        initialize: (cb) => {
            cb()
        },
        configure: () => {

        },
        routes: {
            before: {
                '*': (req, res, next) => {
                    //set locale by req
                    if (req.headers['accept-language']) {
                        req.setLocale(req.headers['accept-language']);
                    }
                    return next()

                    res.appParamsError = () => {
                        res.send(`1`)
                    }
                    return next()
                }
            }
        }
    }
}