/**
 * Comment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const objectid = require('mongodb').ObjectId;
module.exports = {

  attributes: {
    client: { type: 'string', required: true },
    user: { type: 'string', required: true },
    content: { type: 'string', required: true },
    replyCount: { type: 'integer', required: true, defaultsTo: 0 },
    replyFor: { type: 'string', required: true, defaultsTo: '0' },
    status: { type: 'boolean', required: true, defaultsTo: true },
  },
  changeReplyCount: (opts) => {
    return new Promise((resolve, reject) => {
      let { count, commentId } = opts;
      Comment.native((err, collection) => {
        try {
          collection.update({ _id: objectid(commentId) }, {
            $inc: {
              replyCount: count
            }
          }).then(rs => {
            resolve();
          }, err => {
            resolve();
          })
        } catch (err) {
          resolve();
        }

      })
    })
  }
};

