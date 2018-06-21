/**
 * City.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: { type: 'string' },
    code: { type: 'integer' },
    area: { type: 'float' },
    population: { type: 'integer' },
    province: { type: 'string' },
    lat: { type: 'float', defaultsTo: 0 },
    lng: { type: 'float', defaultsTo: 0 },
    radius: { type: 'float', defaultsTo: 0 }
  },
  afterDestroy: (val, cb) => {
    Job.native((err, collection) => {
      collection.update({}, {
        $pull: {
          cities: val.id
        }
      }).then(rs => {
        cb()
      });
    })
  },
  detectCitiesByLocation: (lat, lng) => {
    return new Promise((resolve, reject) => {
      new Promise((resolve, reject) => {
        let cities = cache.get('listCities');
        if (cities) resolve(cities);
        City.find().then(cities => {
          cache.set('listCities', cities);
          resolve(cities);
        })
      }).then(cities => {
        let rs = [];
        for (var i = 0; i < cities.length; i++) {
          let city = cities[i];
          let distance = common.GPSdistance(lat, lng, city.lat, city.lng);
          if (distance < city.radius) {
            rs.push(city);
          }
        }
        resolve(rs);
      })
    })
  },
  initialize: () => {
    return new Promise((resolve, reject) => {
      City.create(data).then(rs => {
        resolve();
      })
    })
  }
};

let data = [
  {
    "name": "Bà Rịa",
    "province": "Bà Rịa–Vũng Tàu",
    "area": "91.46",
    "population": "122424"
  },
  {
    "name": "Bạc Liêu",
    "province": "Bạc Liêu",
    "area": "175.4",
    "population": "188863"
  },
  {
    "name": "Bảo Lộc",
    "province": "Lâm Đồng",
    "area": "232.56",
    "population": "153362"
  },
  {
    "name": "Bắc Giang",
    "province": "Bắc Giang",
    "area": "32.21",
    "population": "126810"
  },
  {
    "name": "Bắc Kạn[4]",
    "province": "Bắc Kạn",
    "area": "137",
    "population": "56800"
  },
  {
    "name": "Bắc Ninh",
    "province": "Bắc Ninh",
    "area": "80.28",
    "population": "272"
  },
  {
    "name": "Bến Tre",
    "province": "Bến Tre",
    "area": "67.48",
    "population": "143312"
  },
  {
    "name": "Biên Hòa",
    "province": "Đồng Nai",
    "area": "264.07",
    "population": "1104495"
  },
  {
    "name": "Buôn Ma Thuột",
    "province": "Đắk Lắk",
    "area": "370",
    "population": "340000"
  },
  {
    "name": "Cà Mau",
    "province": "Cà Mau",
    "area": "250.3",
    "population": "204895"
  },
  {
    "name": "Cam Ranh",
    "province": "Khánh Hòa",
    "area": "325",
    "population": "128"
  },
  {
    "name": "Cao Bằng",
    "province": "Cao Bằng",
    "area": "107.6",
    "population": "84421"
  },
  {
    "name": "Cao Lãnh",
    "province": "Đồng Tháp",
    "area": "107.19499999999999",
    "population": "149837"
  },
  {
    "name": "Cẩm Phả",
    "province": "Quảng Ninh",
    "area": "486.4",
    "population": "195800"
  },
  {
    "name": "Châu Đốc",
    "province": "An Giang",
    "area": "105.29",
    "population": "157298"
  },
  {
    "name": "Đà Lạt",
    "province": "Lâm Đồng",
    "area": "393.29",
    "population": "256393"
  },
  {
    "name": "Điện Biên Phủ",
    "province": "Điện Biên",
    "area": "60.09",
    "population": "70639"
  },
  {
    "name": "Đông Hà",
    "province": "Quảng Trị",
    "area": "73.06",
    "population": "93756"
  },
  {
    "name": "Đồng Hới",
    "province": "Quảng Bình",
    "area": "155.54",
    "population": "160325"
  },
  {
    "name": "Hà Giang",
    "province": "Hà Giang",
    "area": "135.32",
    "population": "71689"
  },
  {
    "name": "Hạ Long",
    "province": "Quảng Ninh",
    "area": "208.7",
    "population": "203731"
  },
  {
    "name": "Hà Tĩnh",
    "province": "Hà Tĩnh",
    "area": "56.19",
    "population": "117546"
  },
  {
    "name": "Hải Dương",
    "province": "Hải Dương",
    "area": "71.39",
    "population": "187405"
  },
  {
    "name": "Hòa Bình",
    "province": "Hòa Bình",
    "area": "148.19999999999999",
    "population": "93409"
  },
  {
    "name": "Hội An",
    "province": "Quảng Nam",
    "area": "61.47",
    "population": "121716"
  },
  {
    "name": "Huế",
    "province": "Thừa Thiên–Huế",
    "area": "83.3",
    "population": "333"
  },
  {
    "name": "Hưng Yên",
    "province": "Hưng Yên",
    "area": "46.8",
    "population": "121486"
  },
  {
    "name": "Kon Tum",
    "province": "Kon Tum",
    "area": "432.98",
    "population": "137662"
  },
  {
    "name": "Lai Châu",
    "province": "Lai Châu",
    "area": "70.400000000000006",
    "population": "55227"
  },
  {
    "name": "Lạng Sơn",
    "province": "Lạng Sơn",
    "area": "79",
    "population": "148000"
  },
  {
    "name": "Lào Cai",
    "province": "Lào Cai",
    "area": "221.5",
    "population": "94192"
  },
  {
    "name": "Long Xuyên",
    "province": "An Giang",
    "area": "106.87",
    "population": "280300"
  },
  {
    "name": "Móng Cái",
    "province": "Quảng Ninh",
    "area": "518.28",
    "population": "108016"
  },
  {
    "name": "Mỹ Tho",
    "province": "Tiền Giang",
    "area": "79.8",
    "population": "215000"
  },
  {
    "name": "Nam Định",
    "province": "Nam Định",
    "area": "46.4",
    "population": "191900"
  },
  {
    "name": "Nha Trang",
    "province": "Khánh Hòa",
    "area": "251",
    "population": "392279"
  },
  {
    "name": "Ninh Bình",
    "province": "Ninh Bình",
    "area": "48.3",
    "population": "130517"
  },
  {
    "name": "Phan Rang–Tháp Chàm",
    "province": "Ninh Thuận",
    "area": "79.37",
    "population": "102941"
  },
  {
    "name": "Phan Thiết",
    "province": "Bình Thuận",
    "area": "206",
    "population": "255000"
  },
  {
    "name": "Phủ Lý",
    "province": "Hà Nam",
    "area": "34.270000000000003",
    "population": "121350"
  },
  {
    "name": "Pleiku",
    "province": "Gia Lai",
    "area": "260.61",
    "population": "186763"
  },
  {
    "name": "Quảng Ngãi",
    "province": "Quảng Ngãi",
    "area": "37.119999999999997",
    "population": "134400"
  },
  {
    "name": "Quy Nhơn",
    "province": "Bình Định",
    "area": "284.27999999999997",
    "population": "311000"
  },
  {
    "name": "Rạch Giá",
    "province": "Kiên Giang",
    "area": "97.75",
    "population": "228360"
  },
  {
    "name": "Sa Đéc",
    "province": "Đồng Tháp",
    "area": "59.81",
    "population": "152237"
  },
  {
    "name": "Sầm Sơn",
    "province": "Thanh Hóa",
    "area": "44.94",
    "population": "150902"
  },
  {
    "name": "Sóc Trăng",
    "province": "Sóc Trăng",
    "area": "76.150000000000006",
    "population": "173922"
  },
  {
    "name": "Sông Công",
    "province": "Thái Nguyên",
    "area": "98.37",
    "population": "109409"
  },
  {
    "name": "Sơn La",
    "province": "Sơn La",
    "area": "324.93",
    "population": "107282"
  },
  {
    "name": "Tam Điệp",
    "province": "Ninh Bình",
    "area": "104.98",
    "population": "104175"
  },
  {
    "name": "Tam Kỳ",
    "province": "Quảng Nam",
    "area": "92.63",
    "population": "120256"
  },
  {
    "name": "Tân An",
    "province": "Long An",
    "area": "81.790000000000006",
    "population": "166419"
  },
  {
    "name": "Tây Ninh",
    "province": "Tây Ninh",
    "area": "140",
    "population": "153537"
  },
  {
    "name": "Thái Bình",
    "province": "Thái Bình",
    "area": "67.7",
    "population": "270000"
  },
  {
    "name": "Thái Nguyên",
    "province": "Thái Nguyên",
    "area": "189.7",
    "population": "330000"
  },
  {
    "name": "Thanh Hóa",
    "province": "Thanh Hóa",
    "area": "57.8",
    "population": "197551"
  },
  {
    "name": "Thủ Dầu Một",
    "province": "Bình Dương",
    "area": "118.67",
    "population": "271000"
  },
  {
    "name": "Trà Vinh",
    "province": "Trà Vinh",
    "area": "68.03",
    "population": "131360"
  },
  {
    "name": "Tuy Hòa",
    "province": "Phú Yên",
    "area": "212.62",
    "population": "167174"
  },
  {
    "name": "Tuyên Quang",
    "province": "Tuyên Quang",
    "area": "119.17",
    "population": "110119"
  },
  {
    "name": "Uông Bí",
    "province": "Quảng Ninh",
    "area": "256.3",
    "population": "170000"
  },
  {
    "name": "Vị Thanh",
    "province": "Hậu Giang",
    "area": "118.67",
    "population": "97222"
  },
  {
    "name": "Việt Trì",
    "province": "Phú Thọ",
    "area": "110.99",
    "population": "277"
  },
  {
    "name": "Vinh",
    "province": "Nghệ An",
    "area": "104.98",
    "population": "490000"
  },
  {
    "name": "Vĩnh Long",
    "province": "Vĩnh Long",
    "area": "48.01",
    "population": "147039"
  },
  {
    "name": "Vĩnh Yên",
    "province": "Vĩnh Phúc",
    "area": "50.8",
    "population": "122568"
  },
  {
    "name": "Vũng Tàu",
    "province": "Bà Rịa–Vũng Tàu",
    "area": "141.1",
    "population": "327"
  },
  {
    "name": "Yên Bái",
    "province": "Yên Bái",
    "area": "108.155",
    "population": "95892"
  }
]