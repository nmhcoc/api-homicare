let cache = {};
const moment = require('moment');
let data = {};

cache.set = (key, val, duration) => {
    if (!duration) duration = 7200;
    data[key] = {
        expiredAt: moment().add(duration, 'seconds'),
        val
    };
}
cache.get = (key) => {
    if (data[key]) return data[key].val;
    return null;
}

cache.clear = () => {
    data = {};
}

//clear cache every 10 seconds
setInterval(() => {
    for (var key in data) {
        if (!data[key]) continue;
        if (data[key].expiredAt.diff(moment()) < 0) {
            data[key] = null;
        }
    }
}, 10000);
module.exports = cache;