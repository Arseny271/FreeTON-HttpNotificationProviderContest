const configServer = require("./configs/config-server.json");
const configMongo = require('./configs/config-mongo.json');

const { NotificationsReceiver } = require("./server/notifications-receiver");

new NotificationsReceiver({configServer, configMongo}).start();
