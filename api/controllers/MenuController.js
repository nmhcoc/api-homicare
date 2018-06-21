/**
 * MenuController
 *
 * @description :: Server-side logic for managing menus
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const _ = require('lodash');
module.exports = {
    findMenus: (req, res) => {
        Menu.find().then(menus => {
            res.json({ err: 0, menus });
        })
    },
    addMenu: (req, res) => {
        let { name, state, parent } = req.body;
        if (!name || !state) return res.paramError();
        Menu.create({ name, state, parent }).then(() => {
            res.ok();
        })
    },
    deleteMenu: (req, res) => {
        let { menuId } = req.body;
        Menu.destroy({ id: menuId }).then(() => {
            res.ok();
        })
    },
    editMenu: (req, res) => {
        let { menuId, name, state, parent } = req.body;
        if (!menuId || !name || !state || !parent) return res.paramError();
        Menu.update({ id: menuId }, { name, state, parent }).then(() => res.ok());
    },
    findOwnMenus: (req, res) => {
        let ids = [];
        req.info.user.roles.forEach(r => {
            ids.push(r);
        });
        UserRole.find({ id: ids }).then(roles => {
            let menus = [];

            roles.forEach(role => {
                if (!role.menus) role.menus = [];
                role.menus.forEach(menu => {
                    if (!_.includes(menus, menu)) {
                        menus.push(menu);
                    }
                })
            });
            res.json({ err: 0, menus });
        })
    }
};

