let bcrypt = require('bcrypt');
let uuid = require('uuid');
let auth = {}
var crypto = require('crypto');
const rndStr = require("randomstring");
var Accountkit = require('node-accountkit');
const _ = require('lodash');
auth.checkPasswordStrength = (txt) => {
    if (!txt) return false;
    if (txt.length >= 6) return true;
    return false;
    // let mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
    // return mediumRegex.test(txt);
}
auth.getControllers = () => {
    let raw = sails.controllers;
    let rs = [];
    for (var ctrl in raw) {
        let controller = raw[ctrl];
        let item = {
            model: ctrl, actions: []
        }
        for (var action in raw[ctrl]) {
            if (typeof (raw[ctrl][action]) == 'function') {
                item.actions.push(action)
            }
        }
        if (item.actions.length > 0) rs.push(item);
    }
    return rs;
}
auth.checkRole = (userRoles, ctrl, action) => {
    return new Promise((resolve, reject) => {
        new Promise((resolve, reject) => {
            let listRoles = cache.get('listRoles');
            if (listRoles) return resolve(listRoles);
            UserRole.find().then(listRoles => {
                return resolve(listRoles);
            })
        }).then(listRoles => {
            let name = `${ctrl}.${action}`;
            for (var u = 0; u < userRoles.length; u++) {
                for (var l = 0; l < listRoles.length; l++) {
                    let uRole = userRoles[u];
                    let roleData = listRoles[l];
                    if (uRole != roleData.id) continue;
                    if (_.includes(roleData.permissions, name)) return resolve();
                }
            }
            reject();
        })
    })
}

auth.generateOtp = () => {
    return '123456';
    //return 100000 + parseInt(Math.random() * 900000) + '';
}
auth.comparePassword = (password, hash) => {
    return bcrypt.compareSync(password, hash);
}
auth.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
}
auth.randomString = (length) => {
    return rndStr.generate(length);
}
auth.createTokenString = () => {
    return uuid.v4();
}
auth.createController = () => {
    return uuid.v4();
}
auth.getAccountKitPhoneNumber = (code) => {
    return new Promise((resolve, reject) => {
        Accountkit.set('477372835965944', 'fb0362bdeb0660349086a529f070b3e5', 'v1.1'); //API_VERSION is optional, default = v1.1 
        Accountkit.requireAppSecret(true); // if you have enabled this option, default = true 
        //authorization_code are the authorizaition code that we get from account kit login operation. look for sample app for more usage information. 
        Accountkit.getAccountInfo(code, function (err, resp) {
            if (err) return reject();
            let phone = resp.phone.number.replace('+84', '0');
            return resolve(phone);
        });
    });
}

auth.randomCode = (howMany) => {
    let chars = "ABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
    var rnd = crypto.randomBytes(howMany)
        , value = new Array(howMany)
        , len = chars.length;

    for (var i = 0; i < howMany; i++) {
        value[i] = chars[rnd[i] % len]
    };

    return value.join('');
}
auth.createOTP = () => {
    return '123456';
    //return 100000 + parseInt(Math.random() * 900000) + '';
}
module.exports = auth;