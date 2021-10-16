'use strict'

const cluster = require("cluster");
const os = require("os");

const ApiWebServer = require("./server/api-web-server");
const KafkaConsumer = require("./server/kafka-consumer");
const ConsumerController = require("./server/consumer-controller");

const providerKeys = require("./secrets/provider.keys.json");
const configServer = require("./configs/config-server.json");
const configKafka = require("./configs/config-kafka.json");
const configMongo = require("./configs/config-mongo.json");
const providerInfo = require("./configs/provider-info.json");

const providerInfoWithPk = Object.assign(providerInfo, { public_key: providerKeys.public });

if (cluster.isMaster) {
    const cpus = os.cpus().length;
    console.log(`CPU: ${os.cpus()[0].model}, Core count: ${cpus}`)

    for (let i = 0; i < cpus; i++) 
        cluster.fork();

    const controller = new ConsumerController({ 
        providerInfo: providerInfoWithPk, 
        configNotify: configServer.notifications,
        configKafka, providerKeys, configMongo
    })
    controller.start(cluster.workers);

    const webServer = (new ApiWebServer({ 
        configServer: configServer.api_server,
        providerInfo: providerInfoWithPk, 
        configMongo, providerKeys
    }));
    webServer.start();

} else {
    const consumer = new KafkaConsumer({ 
        configNotify: configServer.notifications,
        providerInfo, configMongo, providerKeys  
    })
    consumer.start();
}