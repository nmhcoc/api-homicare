/**
 * CityController
 *
 * @description :: Server-side logic for managing cities
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const _ = require('lodash');
module.exports = {
    adminCreateCity: (req, res) => {
        let { name, code } = req.body;
        if (!name || !code) return res.paramError();
        City.create({ name, code }).then(rs => {
            res.ok();
        })
    },
    adminEditCity: (req, res) => {
        let { cityId, name, code } = req.body;
        if (!cityId || !name || !code) return res.paramError();
        City.update({ id: cityId }, { name, code }).then(rs => {
            res.ok();
        })
    },
    adminDeleteCity: (req, res) => {
        let { cityId } = req.body;
        if (!cityId) return res.paramError();
        City.destroy({ id: cityId }).then(rs => {
            res.ok();
        })
    },
    findCities: (req, res) => {
        City.find({}, { select: ['name', 'code'] }).then(cities => {
            res.json({ err: 0, cities });
        })
    },
    addCityToJob: (req, res) => {
        let { cityId, jobId } = req.body;
        if (!cityId || !jobId) return res.paramError();
        City.findOne({ id: cityId }).then(city => {
            Job.findOne({ id: jobId }).then(job => {
                if (!city || !job) return res.paramError();
                if (!job.cities) job.cities = [];
                if (!_.includes(job.cities, city.id)) {
                    job.cities.push(city.id);
                    job.save().then(() => {
                        res.ok();
                    })
                } else {
                    res.ok();
                }
            })
        })
    }
};

