let _ = require('lodash');
module.exports = (req, res, next) => {
    if (!req.passRole) return res.json({ err: 401, desc: 'invalid role' });
    next();
}