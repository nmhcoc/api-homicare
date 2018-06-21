let _ = require('lodash');
module.exports = (req, res, next) => {
    if (!req.passRole) req.passRole = false;
    if (_.includes(req.info.user.roles, 'admin')) {
        req.passRole = true;
    }
    next();
}