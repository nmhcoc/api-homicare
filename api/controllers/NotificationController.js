/**
 * NotificationController
 *
 * @description :: Server-side logic for managing notifications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    find: (req, res) => {
        let { skip, limit } = req.body;
        if (skip == null || !limit) return res.paramError();
        Notification.find({ user: req.info.user.id, skip, limit, status: true }).then(notifications => {
            res.json({ err: 0, notifications });
        });
    },
    toggleRead: (req, res) => {
        let { id } = req.body;
        if (!id) return res.paramError();
        Notification.findOne({ id }).then(notification => {
            if (!notification) return res.paramError();
            if (notification.user != req.info.user.id) return res.json({ err: 1, msg: 'user_is_not_owner' });
            notification.read = !notification.read;
            notification.save().then(() => {
                res.json({ err: 0, read: notification.read });
            });
            Notification.updateUserCount({ user: req.info.user.id, type: notification.type });
        });
    },
    findOne: (req, res) => {
        let { id } = req.body;
        if (!id) return res.paramError();
        Notification.findOne({ id }).then(notification => {
            if (!notification) return res.paramError();
            if (notification.user != req.info.user.id) return res.json({ err: 1, msg: 'user_is_not_owner' });
            res.json({ err: 0, notification });
        });
    },
    delete: (req, res) => {
        let { id } = req.body;
        if (!id) return res.paramError();
        Notification.findOne({ id }).then(notification => {
            if (!notification) return res.paramError();
            if (notification.user != req.info.user.id) return res.json({ err: 1, msg: 'user_is_not_owner' });
            notification.status = false;
            notification.save().then(() => {
                res.ok();
            });
            Notification.updateUserCount({ user: req.info.user.id, type: notification.type });
        })
    }
};

