module.exports = (req, res, next) => {
    if (req.info && req.info.user && req.info.user.roles) {
        sails.services.auth.checkRole(req.info.user.roles, req.options.controller, req.options.action).then(() => {
            next();
        }, err => {
            return res.json({ err: 401, desc: 'invalid permission!' });
        })
    } else {
        return res.json({ err: 401, desc: 'need to push bearer officer before' });
    }
}