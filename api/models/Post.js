/**
 * Post.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const objectid = require('mongodb').ObjectID;
module.exports = {

  attributes: {
    title: {
      type: 'string', required: true
    },
    status: {
      type: 'boolean', required: true
    },
    content: {
      type: 'string', required: true
    },
    author: {
      type: 'string', required: true
    },
    category: {
      type: 'string', required: true
    },
    tag: {
      type: 'string', required: true
    },
    image: {
      type: 'string', required: true
    },
    thumbnail: {
      type: 'string', required: true
    },
    nView: {
      type: 'integer'
    }
  },
  afterCreate: (value, next) => {
    BlogCategory.native((err, collection) => {
      collection.update({
        id: objectid(value.category)
      }, {
          $inc: {
            nPost: 1
          }
        }).then(rs => {
          next();
        })
    })
  }
};

