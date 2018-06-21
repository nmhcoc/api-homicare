//import { resolve } from 'dns';

/**
 * Report.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const moment = require('moment');
const s_of_date = new Date(2017, 10, 1, 0, 0, 0, 0);//01/10/2017
module.exports = {
  REPORT_KEYS: {
    LANDING_PAGE: 'LANDING PAGE',
    ADMIN_PAGE: 'ADMIN_PAGE',

    ADMIN_TRANS_AMOUNT_TODAY: 'ADMIN_TRANS_AMOUNT_TODAY',
    ADMIN_CUSTOMER_LOGIN_TODAY: 'ADMIN_CUSTOMER_LOGIN_TODAY',
    ADMIN_PARTNER_ONLINE: 'ADMIN_PARTNER_ONLINE',
    ADMIN_JOBS_DONE_TODAY: 'ADMIN_JOBS_DONE_TODAY',

    ADMIN_JOBS_DONE_BY_WEEKDAYS: 'ADMIN_JOBS_DONE_BY_WEEKDAYS',
    ADMIN_JOBS_DURATION_BY_WEEKDAYS: 'ADMIN_JOBS_DURATION_BY_WEEKDAYS',
    ADMIN_JOBS_BOOKING_TIME: 'ADMIN_JOBS_BOOKING_TIME',
    ADMIN_JOBS_BOOKING_POINT: 'ADMIN_JOBS_BOOKING_POINT',
    ADMIN_TOTAL_TRANS_AMOUNT: 'ADMIN_TOTAL_TRANS_AMOUNT',
    ADMIN_JOBS_DONE_IN_7DAYS: 'ADMIN_JOBS_DONE_IN_7DAYS',
    ADMIN_CUSTOMER_HEATMAP: 'ADMIN_CUSTOMER_HEATMAP',
    ADMIN_PARTER_HEATMAP: 'ADMIN_PARTNER_HEATMAP',

  },
  attributes: {
    key: { type: 'string', required: true },
    val: { type: 'json', required: true }
  },
  calculateWebsiteReport: () => {
    let promises = [];
    //0: registered partners
    promises.push(new Promise((resolve, reject) => {
      Partner.count().then(registeredPartners => {
        resolve(registeredPartners);
      })
    }));
    //1: partner registed this month
    promises.push(new Promise((resolve, reject) => {
      const query = {
        createdAt: {
          '>=': moment().startOf('month').toDate(),
          '<=': moment().endOf('month').toDate()
        }
      }
      Partner.count(query).then(thismonth => {
        resolve(thismonth);
      })
    }))
    //2: partner registed today
    promises.push(new Promise((resolve, reject) => {
      const query = {
        createdAt: {
          '>=': moment().startOf('day').toDate(),
          '<=': moment().endOf('day').toDate()
        }

      }
      Partner.count(query).then(today => {
        resolve(today);
      })
    }))

    //3: partner is online
    promises.push(new Promise((resolve, reject) => {
      Partner.count({ isOnline: true }).then(online => {
        resolve(online);
      })
    }));

    //4: finished order
    promises.push(new Promise((resolve, reject) => {
      Order.count({ status: [Order.ORDER_STATUS.FINISH_WITH_RATE, Order.ORDER_STATUS.FINISHED] }).then(orders => {
        resolve(orders);
      })
    }));
    //5: finished order today
    promises.push(new Promise((resolve, reject) => {
      Order.count({
        status: [Order.ORDER_STATUS.FINISH_WITH_RATE, Order.ORDER_STATUS.FINISHED],
        createdAt: {
          '>=': moment().startOf('day').toDate(),
          '<=': moment().endOf('day').toDate()
        }
      }).then(finishToDay => {
        resolve(finishToDay);
      })
    }));
    //6: finished order this month
    promises.push(new Promise((resolve, reject) => {
      Order.count({
        status: [Order.ORDER_STATUS.FINISH_WITH_RATE, Order.ORDER_STATUS.FINISHED],
        createdAt: {
          '>=': moment().startOf('month').toDate(),
          '<=': moment().endOf('month').toDate()
        }

      }).then(finishThisMonth => {
        resolve(finishThisMonth);
      })
    }));
    Promise.all(promises).then(rs => {
      let keys = ['allPartners', 'partnerRegisteredThisMonth', 'partnerRegisteredToday', 'partnerIsOnline', 'orderFinished', 'orderFinishedToday', 'orderFinishedThisMonth'];
      Report.destroy({ key: keys }).then(() => {
        let bulk = [];
        for (var i = 0; i < keys.length; i++) {
          bulk.push({ key: keys[i], value: rs[i] });
        }
        Report.destroy({ key: Report.REPORT_KEYS.LANDING_PAGE }).then(rs => {

        });
        Report.native((err, collection) => {
          collection.insert(bulk).then(rs => {
          }, err => {
          })
        })
      })
    }, err => {
    }).catch(err => {
    });
  },
  calculateHeatmap: () => {
    Partner.find({}, { select: ['latitude', 'longitude'] }).then(partners => {
    })
  },


  //region report for administrator's page

  bootstrap: () => {
    Report.countTransAmountToday();
    Report.countCustomerLoginToday();
    Report.countPartnerOnline();
    Report.countJobsDoneToday();

    Report.countJobsDoneByWeekdays();
    Report.countJobDurationInWeekdays();
    Report.countBookedJobInTime('createdAt');
    Report.countBookedJobInTime('startTime');
    Report.countTotalTransAmount();
    Report.countJobDoneInNDays('7');
    Report.getHeatmap('customer');
    Report.getHeatmap('partner');
  },
  /**
   * dem luong trans phat sinh trong 1 ngay
   * neu date = null: dem tat ca so trans phat sinh trong he thong
   * */
  countTransAmountToday: () => {
    return new Promise((resolve, reject) => {
      var query = {}
      var s_of_d = moment().startOf('date').toDate()
      var e_of_d = moment().endOf('date').toDate();

      query.createdAt = {'$gte': s_of_d, '$lte': e_of_d};

      Journal.count(query).exec((err, result) =>{  
        if(err)
          return reject(err);

        Report.destroy({key: Report.REPORT_KEYS.ADMIN_TRANS_AMOUNT_TODAY}).then(()=>{
          Report.create({key: Report.REPORT_KEYS.ADMIN_TRANS_AMOUNT_TODAY, val: {count: result}}).then((rs)=>{
          });
        })
        resolve(result);
      })
    })
  },

  /**
  * dem so Customer dang nhap trong 1 ngay
  * neu date == null, dem so Customer login trong ngay hien tai
  */
  countCustomerLoginToday: () => {
    return new Promise((resolve, reject) => {

      var s_of_d = moment().startOf('date').toDate()
      var e_of_d = moment().endOf('date').toDate();

      let query = {client: 'customer', createdAt: {'$gte': s_of_d, '$lte': e_of_d}};

      //tim tat ca cac token cua customer
      Token.find(query, {select: ['customer']}).sort('customer').exec((err, result)=>{
        if(err)
          return reject(err);

        //filter cac token cua 1 customer, 1 customer co the co nhieu token, chi tinh 1 lan
        var running = null;
        var count = 0;
        result.forEach(element => {
          count += (!running || (running && running.customer != element.customer))?1:0;
          running = element;
        });

        Report.destroy({key: Report.REPORT_KEYS.ADMIN_CUSTOMER_LOGIN_TODAY}).then(()=>{
          Report.create({key: Report.REPORT_KEYS.ADMIN_CUSTOMER_LOGIN_TODAY, val: {count}}).then((rs)=>{
          });
        })

        resolve(count);
      }) 
    })
  }, 

  /**
   * lay so partner online hien tai
   * */
  countPartnerOnline: () => {
    return new Promise((resolve, reject) => {
      Partner.count({isOnline: true}).exec((err, result) => {

        Report.destroy({key: Report.REPORT_KEYS.ADMIN_PARTNER_ONLINE}).then(()=>{
          Report.create({key: Report.REPORT_KEYS.ADMIN_PARTNER_ONLINE, val: {count: result}}).then((rs)=>{
          });
        })
        resolve(result);
      })
    })
  },

  /**
   * lay so job duoc hoan thanh trong 1 ngay
   * neu date == null, lay tong so job hoan thanh trong he thong
   * */
  countJobsDoneToday: () => {
    return new Promise((resolve, reject) => {
      var query = {status: [Order.ORDER_STATUS.FINISHED, Order.ORDER_STATUS.FINISH_WITH_RATE]}
        
      let s_of_d = moment().startOf('date').toDate()
      let e_of_d = moment().endOf('date').toDate();

      query.endTime = {'$gte': s_of_d, '$lte': e_of_d};

      // Order.count({status: [Order.ORDER_STATUS.FINISHED, Order.ORDER_STATUS.FINISH_WITH_RATE], endTime: {'$gte': startOfDate, '$lte': endOfDate}}).exec((err, result)=>{
      Order.count(query).exec((err, result) =>{  
        if(err)
          return reject(err);

        Report.destroy({key: Report.REPORT_KEYS.ADMIN_JOBS_DONE_TODAY}).then(()=>{
          Report.create({key: Report.REPORT_KEYS.ADMIN_JOBS_DONE_TODAY, val: {count: result}}).then((rs)=>{
          });
        })

        resolve(result);
      })
    })
  },

  countJobsDoneByWeekdays: () => {
    return new Promise((resolve, reject) => {
      var query = {status: [Order.ORDER_STATUS.FINISHED, Order.ORDER_STATUS.FINISH_WITH_RATE]}
      Order.find(query, {select: ['endTime']}).exec((err, result) => {
        var weekdays = [0,0,0,0,0,0,0];
        var labels = ['monday','tuesday','wednesday','thurday','friday','saturday','sunday'];
        var series = ['Job'];
        
        //tinh tong so job cua cac ngay trong tuan
        result.forEach((el) => {
          let wd = (el.endTime.getDay() + 6) % 7;//monday = 0
          weekdays[wd] = ++weekdays[wd];
        })

        //dem so ngay trong tuan va tinh trung binh
        let now = new Date();
        for(let i = 0;i < weekdays.length ;i++){
          let day = common.countWeekdayInRange((i + 1) % 7, s_of_date, now);
          weekdays[i] = Math.round(weekdays[i]/day);
        }

        Report.destroy({key: Report.REPORT_KEYS.ADMIN_JOBS_DONE_BY_WEEKDAYS}).then(()=>{
          Report.create({key: Report.REPORT_KEYS.ADMIN_JOBS_DONE_BY_WEEKDAYS, val: {series, labels, data: weekdays}}).then((rs)=>{
          });
        })
        resolve(weekdays)
      })
    })
  },

  /**
   * tinh thoi luong trung binh cua cac job cua cac ngay trong tuan
   * moc tinh ngay la startTime
   */
  countJobDurationInWeekdays: () => {
    return new Promise((resolve, reject) => {
      var query = {}
      Order.find(query, {select: ['startTime', 'duration']}).exec((err, result) => {
        var averages = [0,0,0,0,0,0,0];// luu gia tri average cua duration, don vi hour
        var counts = [0,0,0,0,0,0,0];//luu so order trong 1 ngay/tuan de tinh average

        var labels = ['monday','tuesday','wednesday','thurday','friday','saturday','sunday'];
        var series = ['Job'];

        result.forEach((el) => {
          let wd = el.startTime.getDay() - 1;
          wd = wd < 0? (averages.length - 1): wd;
          counts[wd] += 1;
          averages[wd] = averages[wd] + (el.duration - averages[wd])/counts[wd];
        })
        
        Report.destroy({key: Report.REPORT_KEYS.ADMIN_JOBS_DURATION_BY_WEEKDAYS}).then(()=>{
          Report.create({key: Report.REPORT_KEYS.ADMIN_JOBS_DURATION_BY_WEEKDAYS, val: {series, labels, data: averages}}).then((rs)=>{
          });
        })

        resolve(averages)
      })
    })
  },

  /**
   * tinh tong so job done trong 7 ngay gan nha
   */
  countJobDoneInNDays: (num) => {
    return new Promise((resolve, reject) => {
      num = Number(num) - 1;
      if (num < 1)
        reject({ err: 401, msg: 'num must be greater than 0' });
      let query = { status: [Order.ORDER_STATUS.FINISHED, Order.ORDER_STATUS.FINISH_WITH_RATE] };
      let s_of_t = moment().subtract(num, num == 1 ? 'day' : 'days').startOf('date').toDate();
      let e_of_t = moment().endOf('date').toDate();
      query.endTime = { '$gte': s_of_t, '$lte': e_of_t };

      Order.find(query, { select: ['endTime'] }).sort('endTime').then((result) => {
        let series = ['Job'];
        let labels = [];
        let dataMap = {};
        result.forEach((o) => {
          let l = o.endTime.getDate() + '/' + o.endTime.getMonth();
          
          if (labels.indexOf(l) == -1) {
            labels.push(l);
            dataMap[l] = 1;
          } else {
            dataMap[l] += 1;
          }
        })
        let data = [];
        while(num >= 0){
          let date = moment().subtract(num, 'day').toDate();
          let l = date.getDate() + '/' + date.getMonth();
          labels.push(l);
          data.push(dataMap[l] || 0);
          num -= 1;
        }
        
        Report.destroy({ key: Report.REPORT_KEYS.ADMIN_JOBS_DONE_IN_7DAYS }).then(() => {
          Report.create({ key: Report.REPORT_KEYS.ADMIN_JOBS_DONE_IN_7DAYS, val: { series, labels, data } }).then((rs) => {
          });
        })

        resolve(data);
      })
    })
  },

  /**
   * tinh so job duoc book tai moi thoi diem trong ngay cua 1 thang
   * */
  countBookedJobInTime: (countBy) => {
    return new Promise((resolve, reject) => {
      if(!countBy)
        countBy = 'createdAt';//startTime/createdAt
      //console.log('countBy: ' + countBy + ", " + ['createdAt', 'startTime'].indexOf(countBy));
      if(['createdAt', 'startTime'].indexOf(countBy) == -1){
        resolve({});
      }
      
      var series = ['Job']
      
      let fragment = 3; //hours - 
      let length = (24 % fragment == 0)? (24/fragment): (Math.floor(24/fragment) + 1);
      var labels = [];
      for(let i = 0; i < length; i++){
        labels.push(Math.min(24, (i + 1) *fragment));
      }
      var data = [];//7 day in week
      for(let i = 0; i < 7; i++){
        data.push(Array.from({length: length }, i => 0));
      }

      var select = [{val: 0, name: 'monday'}, {val: 1, name: 'tuesday'}, {val: 2, name: 'wednesday'}, {val: 3, name: 'thursday'}, 
                    {val: 4, name: 'friday'}, {val: 5, name: 'saturday'},{val: 6, name: 'sunday'}]

      var query = {};
      Order.find(query, {select: ['startTime', 'createdAt']}).exec((err, orders) => {
        if(err)
          return reject(err);
        orders.forEach((o) => {
          let pointTime = o[countBy];
          let wd = (pointTime.getDay() + 6) % 7;
          data[wd][Math.floor(pointTime.getHours()/fragment)] += 1
        })

        //dem so ngay trong tuan va tinh trung binh
        let now = new Date();
        for(let i = 0;i < data.length ;i++){
          let day = common.countWeekdayInRange((i + 1) % 7, s_of_date, now);
          for(let j = 0; j< data[i].length; j++){
            data[i][j] = data[i][j]/day
          }
        }

        let queryKey = countBy == 'startTime'? Report.REPORT_KEYS.ADMIN_JOBS_BOOKING_TIME: Report.REPORT_KEYS.ADMIN_JOBS_BOOKING_POINT;
        Report.destroy({key: queryKey}).then(()=>{
          Report.create({key: queryKey, val: {series, labels, data, select}}).then((rs)=>{
          });
        })

        resolve(data);
      })
    })
  },

  getHeatmap: (client) => {
    return new Promise((resolve, reject) => {
      if(!client || ['customer', 'partner'].indexOf(client) === -1)
        return reject({err: 401, msg: `Tham so 'client' truyen vao sai gia tri: ${client}`})
      Area.find({}, { select: ['name', 'latitude', 'longitude', 'radius'] }).exec((err, areas) => {
        if (err)
          return reject(err);

        let heatmap = JSON.parse(JSON.stringify(areas));//clone
        
        //heatmap cua customer = do luong order khong bi cancel trong khu vuc
        //heatmap cua partner = do luong order duoc accept/start/finish trong khu vuc

        let query = {};
        if(client == 'customer')
          query.status = {'$ne': Order.ORDER_STATUS.CUSTOMER_CANCEL};
        else if(client == 'partner'){
          query.status = {'$in': [Order.ORDER_STATUS.PARTNER_ACCEPT,
                                Order.ORDER_STATUS.STARTED,
                                Order.ORDER_STATUS.FINISHED,
                                Order.ORDER_STATUS.FINISH_WITH_RATE]};
        }
        // var Collection = client == 'customer'?Order: Partner;
        Order.find(query, { select: ['latitude', 'longitude'] }).exec((err, partners) => {
          if (err)
            return reject(err);

          heatmap.forEach((hm) => {
            let filter = partners.filter((p) => {
              return common.GPSdistance(p.latitude, p.longitude, hm.latitude, hm.longitude) <= hm.radius;
            })


            // hm.radius = hm.radius/200;
            hm.count = filter.length;
          })

          
          let queryKey = client == 'customer'? Report.REPORT_KEYS.ADMIN_CUSTOMER_HEATMAP: Report.REPORT_KEYS.ADMIN_PARTER_HEATMAP;
          Report.destroy({key: queryKey}).then(()=>{
            Report.create({key: queryKey, val: {data: heatmap}}).then((rs)=>{
            });
          })

          resolve(heatmap);
        })
      })
    })
  },
  
  countTotalTransAmount: () => {
    return new Promise((resolve, reject) => {
      let query = {};
      Account.find(query, {select: ['name', 'balance']}).exec((err, rs) => {
        if(err)
          return reject({err: -1, msg: err});
        var series = ['Trans'], labels = [];
        let dataMap = {};
        rs.forEach((acc) => {
          let index = labels.indexOf(acc.name);
          if(index == -1){
            labels.push(acc.name);
            dataMap[acc.name] = acc.balance;
          }else{
            dataMap[acc.name] += acc.balance;
          }
        })

        var data = [];
        for(let i = 0; i< labels.length; i++){
          data[i] = dataMap[labels[i]];
        }

        Report.destroy({key: Report.REPORT_KEYS.ADMIN_TOTAL_TRANS_AMOUNT}).then(()=>{
          Report.create({key: Report.REPORT_KEYS.ADMIN_TOTAL_TRANS_AMOUNT, val: {series, labels, data}}).then((rs)=>{
          });
        })

        resolve({labels, data});
      })
    })
  }
};
