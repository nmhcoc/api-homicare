module.exports = (req, res, next) => {
    let auth = req.headers.authorization || `Bearer ${req.query.token}`;
    if (!auth || auth.search('Bearer ') !== 0) return res.json({ err: 401, desc: 'not found bearer auth in header!' });
    let token = auth.split(' ')[1];
    Token.findOne({ token }).then(token => {
        if (!token) return res.json({ err: 401, desc: 'invalid bearer token!' });
        switch (token.client) {
            case 'customer':
                Customer.findOne({ id: token.customer }).then(user => {
                    if (!user) return res.json({ err: 401, desc: 'cannot find user' })
                    if (!req.info) req.info = {};
                    req.info.client = token.type;
                    req.info.user = user;
                    req.info.client = {
                        name: token.client
                    }
                    next();
                })
                break;
            case 'partner':
                Partner.findOne({ id: token.partner }).then(user => {
                    if (!user) return res.json({ err: 401, desc: 'cannot find user' })
                    if (!req.info) req.info = {};
                    req.info.client = token.type;
                    req.info.user = user;
                    req.info.client = {
                        name: token.client
                    }
                    next();
                })
                break;
            case 'officer':
                Officer.findOne({ id: token.officer }).then(user => {
                    if (!user) return res.json({ err: 401, desc: 'cannot find user' })
                    if (!req.info) req.info = {};
                    req.info.client = token.type;
                    req.info.user = user;
                    req.info.client = {
                        name: token.client
                    }
                    next();
                })
                break;
            default:
                return res.json({ err: 401, desc: 'cannot find user' })
                break;
        }

    })
}