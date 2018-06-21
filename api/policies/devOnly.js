module.exports = (req, res, next) => {
    let auth = req.headers.authorization || `Bearer ${req.query.token}`;
    if (!auth || auth.search('Bearer ') !== 0) return res.json({ err: 401, desc: 'not found bearer auth in header!' });
    let token = auth.split(' ')[1];
    console.log(token);
    Token.findOne({ token, type: 'dev' }).then(token => {
        if (!token) return res.json({ err: 401 })
        next();
    })
}