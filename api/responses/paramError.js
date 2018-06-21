module.exports = function (data, options) {
  let req = this.req;
  let res = this.res;
  res.json({
    err: 1,
    desc: req.__('params_error')
  })
}