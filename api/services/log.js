
var path = require('path')
var winston = require('winston');
var _engine = {

};
function file(type, msg) {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[DEBUG] ${type} - ${msg}`)
    }
    if (_engine[type] == null) {
        _engine[type] = new (winston.Logger)({
            transports: [
                new (winston.transports.File)({
                    name: 'info-file',
                    filename: path.join(__dirname, '../../log/' + type + '.log'),
                    level: 'info',
                    maxsize: 10000000,
                    showLevel: false,
                    raw: true
                })
            ]
        });
    }
    _engine[type].info(msg);
}

/**
 * luu all log tren 1 file
 * */
function log2File(tag, msg) {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[DEBUG] ${tag} - ${msg}`)
    }

    let logFile = 'system_log';
    if (_engine[logFile] == null) {
        _engine[logFile] = new (winston.Logger)({
            transports: [
                new (winston.transports.File)({
                    name: 'info-file',
                    filename: path.join(__dirname, '../../log/' + logFile + '.log'),
                    level: 'info',
                    maxsize: 10000000,
                    showLevel: false,
                    raw: true
                })
            ]
        });
    }
    _engine[logFile].info(tag + ': ' + msg);
}

function getLogger(type) {
    if (_engine[type] == null) {
        _engine[type] = new (winston.Logger)({
            transports: [
                new (winston.transports.File)({
                    name: 'info-file',
                    filename: path.join(__dirname, '../../log/' + type + '.log'),
                    level: 'info',
                    maxsize: 10000000,
                    showLevel: false,
                    raw: true
                })
            ]
        });
    }
    return _engine[type]
}
var logger = {
    file,
    log2File
};
module.exports = logger;