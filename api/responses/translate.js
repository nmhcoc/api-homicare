module.exports = function (data, options) {
    let req = this.req;
    let res = this.res;
    data.msg = req.__(data.msg);
    res.json(data);
}