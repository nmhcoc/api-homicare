module.exports = (req, res, next) => {
    let { phone, password } = req.body;
    if (!phone || !password) return res.paramError();
    Auth.findOne({ phone, type: 'customer' }).then(auth => {
        if (!auth) return res.json({ err: 401, desc: 'cannot find auth' });
        if (sails.services.auth.comparePassword(password, auth.password)) {
            Customer.findOne({ id: auth.customer }).then(user => {
                if (!user) {
                    Auth.destroy({ id: auth.id }).then(rs => {
                        res.json({ err: 401, desc: 'cannot find user from bearer token' })
                    })
                }
                if (!req.info) req.info = {};
                req.info.user = user;
                next();
            })
        } else {
            return res.json({ err: 401, desc: 'invalid password' });
        }
    })
}