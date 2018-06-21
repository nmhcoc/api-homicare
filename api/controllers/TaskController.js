/**
 * TaskController
 *
 * @description :: Server-side logic for managing tasks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    find: (req, res) => {
        let { name, skip, limit, model, action, cronType, state, taskType, meta } = req.body;
        if (skip == null || !limit) return res.paramError();
        let query = {
            skip, limit,
            sort: 'createdAt DESC'
        }
        if (name) Object.assign(query, { name });
        if (model) Object.assign(query, { model });
        if (action) Object.assign(query, { action });
        if (cronType) Object.assign(query, { cronType });
        if (state) Object.assign(query, { state });
        if (taskType) Object.assign(query, { taskType });
        if (meta) Object.assign(query, { meta });
        Task.find(query).then(tasks => {
            Task.count(query).then(count => {
                res.json({ err: 0, tasks, count });
            })
        })
    },
    update: (req, res) => {
        let { id, name, model, action, status, cronType, state, taskType, startTime, endTime, rule, date, meta } = req.body;
        Task.update({ id }, { name, model, action, status, cronType, state, taskType, startTime, endTime, rule, date, meta }).then(rs => {
            res.ok();
        });
    },
    start: (req, res) => {
        let { id } = req.body;
        if (!id) return res.paramError();
        Task.findOne({ id }).then(task => {
            if (!task) return res.paramError();
            task.startJob().then(rs => { res.ok() }, err => {
                res.paramError()
            });
        }, err => {
            res.paramError()
        })
    },
    stop: (req, res) => {
        let { id } = req.body;
        if (!id) return res.paramError();
        Task.findOne({ id }).then(task => {
            if (!task) return res.paramError();
            task.stopJob().then(rs => { res.ok() }, err => {
                res.paramError()
            });
        })

    },
    create: (req, res) => {
        Task.newTask(req.body).then(task => {
            res.ok()
        }, err => {
            res.paramError();
        });
    },
    delete: (req, res) => {
        let { id } = req.body;
        if (!id) return res.paramError();
        Task.findOne({ id }).then(task => {
            task.stopJob().then(rs => {
                task.destroy().then(rs => { res.ok() });
            })
        })
    }
};

