const config = require("./configs/config-mongo.json");

const MongoClient = require("mongodb").MongoClient;

(async () => {
    const client = new MongoClient(config.url, config.config);
    await client.connect();

    const database = client.db("receiverdb");
    await database.createCollection("configs");
    await database.createCollection("consumers");
    await database.createCollection("messages");
    await database.createCollection("providers");
    await database.createCollection("rules");

    await database.collection("configs").createIndex({ config: 1 }, { unique: 1 });
    await database.collection("consumers").createIndex({ hash: 1 }, { unique: 1 });
    await database.collection("messages").createIndex({ date: 1 });
    await database.collection("providers").createIndex({ provider: 1 }, { unique: 1 });
    await database.collection("rules").createIndex({ provider_id: 1, hash: 1 }, { unique: 1 });

    await database.collection("configs").insertOne( { login: "admin", password: "admin", config: "AUTH" })

    console.log("Success")
    process.exit();
})();