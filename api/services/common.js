let common = {};
let path = require('path');
let pug = require('pug');
let FCM = require('fcm-node');
let moment = require('moment');
let request = require('request');
const _ = require('lodash');

let removeAlias = (str) => {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    // str = str.replace(/\W+/g, ' ');
    // str = str.replace(/\s/g, '-');
    return str;
}
common.checkChildExist = (object, child) => {
    if (!object) return false;
    if (!object[child]) return false;
    return true;
}
common.genCodeFromName = (name) => {
    if (!name) return name;
    name = removeAlias(name);
    let arr = name.split(' ');
    if (arr.length == 1) {
        return name;
    }
    return `${_.last(arr)}${name[0]}`
}

common.GPSdistance = (lat1, lon1, lat2, lon2) => {
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var radlon1 = Math.PI * lon1 / 180;
    var radlon2 = Math.PI * lon2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    dist = dist * 1.609344;
    return dist; //kilometer
}

common.sendSMS = (phone, content) => {
    console.log('system does not support send sms');
}
common.getImageFolder = () => {
    return path.join(__dirname, `../../assets/images`);
}
common.getTemplateFolder = () => {
    return path.join(__dirname, `../../reportTemplates`);
}
common.sendMail = (sendTo, subject, template, sub) => {
    return new Promise((resolve, reject) => {
        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: Conf.data.MAIL.USERNAME,
                pass: Conf.data.MAIL.PASSWORD
            }
        });
        let html = pug.renderFile(path.join(__dirname, '..', template), sub);
        // setup e-mail data
        var mailOptions = {
            from: Conf.data.MAIL.MAIL_FROM, // sender address (who sends)
            to: sendTo, // list of receivers (who receives)
            subject: subject, // Subject line
            html: html// html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return console.log(error);
            }
            resolve();
        });
    })
}

common.sendMailAlchemy = (mailTo, substitutions, subject, templateId, userReceiver, status) => {
    var form = {
        'mailTo': mailTo,
        'subject': subject,
        'mailFrom': 'contact.viecnhanhanh@gmail.com',
        // 'templateId': 'jf9wb9w',
        'secretKey': '638cf185-f5c6-4a59-bcd7-3dc10a6a1104',
        'substitutions': substitutions,
        'userSender': "viec nha nhanh",
        'userReceiver': userReceiver
    }
    // if(status==1){
    //     form.templateId='jf9wb9w'
    // }else if(status==2){
    //     form.templateId=''
    // }
    var url = 'https://mailalchemy.com/cms'
    var headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    var options = {
        url: url + '/api/sendMail',
        method: 'POST',
        headers: headers,
        form: form
    }
    return new Promise((resolve, reject) => request(options, function (error, response, body) {
        // Print out the response body or result
        body = JSON.parse(body)
        if (body.err == 0) {
            resolve({
                err: body.err,
                msg: 'Ok',
                data: response.body
            })

        }
        else {
            resolve({
                err: body.err,
                msg: body.msg,
                data: response.body
            })
        }

    })


    )
}
common.calculateDayShift = (time) => {
    let hour = time.getHours();
    if (hour < 7) return 'unknown';
    if (hour <= 12) return 'morning';
    if (hour <= 17) return 'afternoon';
    if (hour <= 22) 'evening';
    return 'unknown';
}

/**
 * dem so ngay trong tuan trong 1 khoang thoi gian tinh tu s_of_d den ngay e_of_d (VD dem so thu 2 tinh tu ngay 01/10/2017 toi ngay 29/11/2017)
 * @param {*} wd ngay trong tuan can tinh
 * @param {*} s_of_d moc thoi gian bat dau tinh
 * @param {*} e_of_d moc thoi gian tinh ket thuc
 */
common.countWeekdayInRange = (wd, s_of_d, e_of_d) => {
    var ndays = 1 + Math.round((e_of_d - s_of_d)/(24*3600*1000));
    var sum = function(a,b) {
        return a + Math.floor( ( ndays + (s_of_d.getDay()+6-b) % 7 ) / 7 ); 
    };
    return [wd].reduce(sum,0);
}
module.exports = common;