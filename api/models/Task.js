/**
 * Task.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
let data = {};
let functions = [];
const schedule = require('node-schedule');
const objectid = require('mongodb').ObjectID;
const moment = require('moment');
module.exports = {
  CRON_TYPE: {
    RULE: 1,
    DATE: 2
  },
  STATE: {
    IDLE: 1,
    RUNNING: 2
  },
  TASK_TYPE: {
    SYSTEM: 1,
    ORDER: 2,
    REPORT: 3
  },
  attributes: {
    name: { type: 'string', required: true },
    model: { type: 'string', required: true },
    action: { type: 'string', required: true },
    status: { type: 'boolean', defaultsTo: true, required: true },
    cronType: { type: 'integer', defaultsTo: 1 },
    state: { type: 'integer', defaultsTo: 1 },
    taskType: { type: 'integer', defaultsTo: 1 },
    //setup cron time
    startTime: { type: 'datetime' },
    endTime: { type: 'datetime' },
    rule: { type: 'string' },
    date: { type: 'datetime' },
    invocation: { type: 'integer', defaultsTo: 0 },
    nextInvocation: { type: 'datetime' },
    meta: { type: 'string' },
    startJob: function () {
      return new Promise((resolve, reject) => {
        Task.schedule(this);
        this.state = Task.STATE.RUNNING;
        this.save().then(rs => {
          resolve();
        });
      });
    },
    stopJob: function () {
      return new Promise((resolve, reject) => {
        if (data[this.id]) {
          data[this.id].cancel();
          data[this.id] = null;
        }
        this.state = Task.STATE.IDLE;
        this.save().then(rs => {
          resolve();
        });
      });
    },
    getSchedule: function () {
      return data[this.id];
    }
  },
  newTask: (opts) => {
    return new Promise((resolve, reject) => {
      let { name, status, cronType, taskType, startTime, endTime, rule, date, meta, model, action } = opts;
      if (!name || status == null || !cronType || !taskType || !model || !action) return reject();
      cronType = Number(cronType);
      taskType = Number(taskType);
      let option = {};
      switch (cronType) {
        case Task.CRON_TYPE.RULE:
          if (!rule) return reject();
          Object.assign(option, { name, status, cronType, taskType, rule, meta, model, action });
          if (startTime) option.start = startTime;
          if (endTime) option.end = endTime;
          break;
        case Task.CRON_TYPE.DATE:
          if (!date) return reject();
          Object.assign(option, { name, status, cronType, taskType, rule, meta, model, action });
          break;
      }
      Task.create(option).then(task => {
        resolve(task);
      }, err => {
        reject({ err: 1, info: err });
      });
    })

  },
  schedule: (task) => {
    if (data[task.id]) data[task.id].cancel();
    switch (task.cronType) {
      case Task.CRON_TYPE.RULE:
        let option = {
          rule: task.rule
        }
        if (task.startTime) option.start = startTime;
        if (task.endTime) option.end = endTime;
        data[task.id] = schedule.scheduleJob(option, () => {
          Task.executeTask(task);
          task.invocation++;
          let update = {
            invocation: task.invocation
          }
          let next = data[task.id].nextInvocation();
          if (next) {
            update.nextInvocation = next;
          }
          Task.update({ id: task.id }, update).then(() => {
          }, err => {
          });
        });
        break;
      case Task.CRON_TYPE.DATE:
        data[task.id] = schedule.scheduleJob(task.date, () => {
          Task.executeTask(task);
          //destroy schedule
          data[task.id].cancel();
          data[task.id] = null;
          task.state = Task.STATE.IDLE;
          task.invocation++;
          Task.update({ id: task.id }, { invocation: task.invocation }).then(() => { }, err => { });

        });
        break;
    }
    if (data[task.id]) return true;
    return false;
  },
  bootstrap: () => {
    return new Promise((resolve, reject) => {
      Task.find({ status: true, state: Task.STATE.RUNNING }).then(tasks => {
        tasks.forEach(task => {
          if (task.cronType == Task.CRON_TYPE.DATE && task.invocation > 0) return;
          let model = task.model.toLowerCase();
          if (task.cronType == Task.CRON_TYPE.DATE && moment().diff(moment(task.date)) >= 0) {
            task.invocation++;
            Task.update({ id: task.id }, { invocation: task.invocation }).then(() => { }, err => { console.log('save task bootstrap failure') });
            Task.executeTask(task);
          } else {
            Task.schedule(task);
          }
        })
        resolve();
      });
    });
  },
  executeTask: (task) => {
    if (sails.models[task.model.toLowerCase()] && sails.models[task.model.toLowerCase()][task.action] && typeof (sails.models[task.model.toLowerCase()][task.action]) == 'function') {
      return sails.models[task.model.toLowerCase()][task.action](task.meta);
    } else {
      console.error(`Cannot execute task ${task.name}. Function not found ${task.model}.${task.action}`);
    }

  },
  destroyOrderTasks: (id) => {
    return new Promise((resolve, reject) => {
      Task.find({ meta: id, invocation: 0, taskType: Task.TASK_TYPE.ORDER }).then(tasks => {
        let ids = [];
        tasks.forEach(task => {
          if (data[task.id]) data[task.id].cancel();
          data[task.id] = null;
          ids.push(task.id);
        });
        Task.destroy({ id: ids }).then(rs => {
          resolve();
        })
      })
    })
  }
};

