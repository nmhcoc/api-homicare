/**
 * BackendUserController
 *
 * @description :: Server-side logic for managing backendusers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    adminCreateBackendUser: (req, res) => {
        let { username, password, name, email, roles } = req.body;
        if (!username || !password || !name || !email) return res.paramError();
        BackendUser.createBackendUser(username, password, name, email, roles).then(rs => {
            res.ok();
        })
    }
};

