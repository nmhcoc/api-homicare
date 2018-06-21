/**
 * JobController
 *
 * @description :: Server-side logic for managing jobs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const sharp = require('sharp');
const path = require('path');
module.exports = {
  findJobs: (req, res) => {
    let { type, parent, category } = req.body;
    let query = {};
    if (type) query.type = type;
    if (parent) query.parent = parent;
    if (category) query.category = category;
    Job.find(query).then(jobs => {
      res.json({ err: 0, jobs });
    });
  },
  removeJobFromPartner: (req, res) => {
    let { jobId, partnerId } = req.body;
    if (!jobId || !partnerId) return res.paramError();
    Partner.findOne({ id: partnerId }).then(partner => {
      if (!partner) return res.json({ err: 1, desc: 'partner doesn"t exist' });
      if (!partner.jobs) partner.jobs = [];
      if (!_.includes(partner.jobs, jobId))
        return res.json({ err: 2, desc: 'partner doesnot have this job' });
      _.pull(partner.jobs, jobId);
      partner.save().then(rs => {
        res.ok();
      });
    });
  },

  customerFindAvailableJobs: (req, res) => {},
  addJobToPartner: (req, res) => {
    let { jobId, partnerId } = req.body;
    if (!jobId || !partnerId) return res.paramError();
    Partner.findOne({ id: partnerId }).then(partner => {
      if (!partner) return res.json({ err: 1, desc: 'partner doesn"t exist' });
      if (!partner.jobs) partner.jobs = [];
      if (_.includes(partner.jobs, jobId)) return res.json({ err: 2, desc: 'job already added!' });
      Job.findOne({ id: jobId }).then(job => {
        if (!job) return res.json({ err: 3, desc: 'job is not exists' });
        partner.jobs.push(jobId);
        partner.save().then(rs => {
          res.ok();
        });
      });
    });
  },
  createJob: (req, res) => {
    let {
      name,
      price,
      status,
      category,
      parent,
      schedule,
      type,
      cities,
      title,
      description,
    } = req.body;
    if (
      !name ||
      !price ||
      status == null ||
      !schedule ||
      !type ||
      !parent ||
      !category ||
      !title ||
      !description
    )
      return res.paramError();
    try {
      cities = JSON.parse(cities);
    } catch (err) {
      return res.paramError();
    }
    let promises = [];
    promises.push(
      new Promise((resolve, reject) => {
        if (!common.checkChildExist(req.files, 'file')) return reject();
        let fname = auth.createTokenString();
        sharp(req.files.file.data)
          .resize(200, 200, {
            withoutEnlargement: false,
            kernel: sharp.kernel.lanczos2,
            interpolator: sharp.interpolator.nohalo,
          })
          .png()
          .toFile(path.join(sails.services.common.getImageFolder(), 'job', `${fname}.png`))
          .then(() => {
            resolve(`job/${fname}.png`);
          });
      })
    );
    Promise.all(promises)
      .then(
        rs => {
          let icon = rs[0];
          Job.create({
            name,
            price,
            status,
            icon,
            schedule,
            type,
            parent,
            category,
            cities,
            title,
            description,
          }).then(
            rs => {
              res.ok();
            },
            err => {
              res.attrsError();
            }
          );
        },
        err => {
          res.attrsError();
        }
      )
      .catch(err => {
        res.attrsError();
      });
  },
  deleteJob: (req, res) => {
    let { jobId } = req.body;
    if (!jobId) return res.paramError();
    Job.destroy({ id: jobId }).then(() => {
      res.ok();
    });
  },

  editJob: (req, res) => {
    let {
      jobId,
      name,
      price,
      status,
      schedule,
      type,
      parent,
      category,
      cities,
      title,
      description,
    } = req.body;
    if (
      !jobId ||
      !name ||
      !price ||
      status == null ||
      !schedule ||
      !type ||
      !parent ||
      !category ||
      !title ||
      !description
    )
      return res.paramError();
    let promises = [];
    promises.push(
      new Promise((resolve, reject) => {
        if (!common.checkChildExist(req.files, 'file')) return resolve(); //do not update icon
        let fname = auth.createTokenString();
        sharp(req.files.file.data)
          .resize(200, 200, {
            withoutEnlargement: false,
            kernel: sharp.kernel.lanczos2,
            interpolator: sharp.interpolator.nohalo,
          })
          .png()
          .toFile(path.join(sails.services.common.getImageFolder(), 'job', `${fname}.png`))
          .then(() => {
            resolve(`job/${fname}.png`);
          });
      })
    );
    Promise.all(promises).then(
      rs => {
        let icon = rs[0];
        let set = {
          name,
          price,
          status,
          schedule,
          type,
          parent,
          category,
          title,
          description,
        };
        if (icon) {
          set.icon = icon;
        }

        Job.update({ id: jobId }, set).then(
          rs => {
            res.ok();
          },
          err => {
            res.attrsError();
          }
        );
      },
      err => {
        res.paramError();
      }
    );
  },
};
