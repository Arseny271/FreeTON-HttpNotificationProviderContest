const config = require("./configs/config-mongo.json");

const MongoClient = require("mongodb").MongoClient;

(async () => {
    const client = new MongoClient(config.url, config.config);
    await client.connect();

    const database = client.db("notificationdb");
    await database.createCollection("logs");
    await database.createCollection("users");
    await database.createCollection("notifications");

    await database.collection("notifications").createIndex({ key: 1 }, { unique: 1 })
    await database.collection("notifications").createIndex({ success: 1, hash: 1, next_dispatch_time: 1 });
    await database.collection("notifications").createIndex({ received_by_consumer_time: 1 });
    await database.collection("notifications").createIndex({ received_by_provider_time: 1 });
    await database.collection("users").createIndex({ hash: 1 }, { unique: 1 });

    console.log("Success")
    process.exit();
})();