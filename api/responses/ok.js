module.exports = function (data, options) {
  let req = this.req;
  let res = this.res;
  if (!data) {
    return res.json({ err: 0, desc: req.__('response_ok') })
  }
  res.status(200);
  return res.json(data);
}