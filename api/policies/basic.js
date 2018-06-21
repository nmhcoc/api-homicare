module.exports = (req, res, next) => {
    let auth = req.headers.authorization;
    if (!auth || auth.search('Basic ') !== 0) return res.json({ err: 401, desc: 'basic auth failed!' });
    let key = auth.split(' ')[1];
    Client.findOne({ key }).then(client => {
        if (!client) return res.json({ err: 401, desc: 'basic auth failed!' });
        if (!req.info) req.info = {};
        req.info.client = client;
        next();
    })
}