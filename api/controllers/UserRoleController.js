/**
 * UserRoleController
 *
 * @description :: Server-side logic for managing userroles
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    findRoles: (req, res) => {
        UserRole.find({}).then(roles => {
            res.json({ err: 0, roles });
        })
    },
    createRole: (req, res) => {
        let { name } = req.body;
        UserRole.create({ name }).then(() => {
            res.ok();
        })
    },
    deleteRole: (req, res) => {
        let { roleId } = req.body;
        UserRole.destroy({ id: roleId }).then(rs => {
            res.ok();
        })
    },
    updateRolePermissions: (req, res) => {
        let { userRoleId, permissions } = req.body;
        if (!userRoleId || !permissions) return res.paramError();
        UserRole.updateRolePermissions(userRoleId, permissions).then(() => res.ok(), err => res.paramError());
    },
    updateRoleMenus: (req, res) => {
        let { userRoleId, menus } = req.body;
        if (!userRoleId || !menus) return res.paramError();
        UserRole.updateRoleMenus(userRoleId, menus).then(() => res.ok(), err => res.paramError());
    },
    findPermissions: (req, res) => {
        res.json({ err: 0, permissions: auth.getControllers() })
    }
};

