let _ = require('lodash');
module.exports = (req, res, next) => {
    if (!req.passRole) req.passRole = false;
    req.passRole = true;
    // if (_.includes(req.info.user.roles, 'customer')) {
    //     req.passRole = true;
    // }
    next();
}