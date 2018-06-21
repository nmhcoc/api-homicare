const PubSub = require('pubsub-js/src/pubsub');
let methods = {};
//event
///ORDER.FINISHED, ORDER.NEW_ORDER, ORDER.CUSTOMER_CANCEL, ORDER.FINISHED, ORDER.PARTNER_CANCEL, ORDER.PARTNER_ACCEPT
methods.publish = (topic, data) => {
    PubSub.publish(topic, data);
}

methods.subscribe = (topic, cb) => {
    PubSub.subscribe(topic, cb);
}

module.exports = methods;