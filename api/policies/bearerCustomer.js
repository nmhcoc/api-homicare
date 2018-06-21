module.exports = (req, res, next) => {
    let auth = req.headers.authorization || `Bearer ${req.query.token}`;
    if (!auth || auth.search('Bearer ') !== 0) return res.json({ err: 401, desc: 'not found bearer auth in header!' });
    let token = auth.split(' ')[1];
    Token.findOne({ token, client: 'customer' }).then(token => {
        if (!token) return res.json({ err: 401, desc: 'invalid bearer token!' });
        Customer.findOne({ id: token.customer }).then(user => {
            if (!user) return res.json({ err: 401, desc: 'cannot find user' })
            if (!req.info) req.info = {};
            req.info.client = 'customer';
            req.info.user = user;
            req.info.client = {
                name: token.client
            }
            next();
        })
    })
}