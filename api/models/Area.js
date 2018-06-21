/**
 * Area.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    latitude: { type: 'float', required: true },
    longitude: { type: 'float', required: true },
    radius: { type: 'float', required: true },
    name: { type: 'string', required: true },
    isContain: function (lat, lng) {
      let d = common.GPSdistance(lat, lng, this.latitude, this.longitude);
      if (d <= this.radius) return true;
      return false;
    }
  },
  detectAreas: (lat, lng) => {
    return new Promise((resolve, reject) => {
      let rs = [];
      Area.getListAreasCache().then(areas => {
        areas.forEach(a => {
          if (a.isContain(lat, lng)) {
            rs.push(a);
          }
        });
        resolve(rs);
      })
    })
  },
  getListAreasCache: () => {
    return new Promise((resolve, reject) => {
      let areas = cache.get('listAreas');
      if (areas) return resolve(areas);
      Area.find().then(areas => {
        cache.set('listAreas', areas);
        resolve(areas);
      })
    })
  }
};

