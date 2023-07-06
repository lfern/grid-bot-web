const Queue = require("bull");

exports.init = function() {
    const OrderSenderEventService = require('grid-bot/src/services/OrderSenderEventService');
    const myOrderSenderQueue = new Queue('myOrderSender', {
        redis: {
            host: process.env.REDIS_SERVER || "127.0.0.1",
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD,
        }
    });

    OrderSenderEventService.init(myOrderSenderQueue);
}