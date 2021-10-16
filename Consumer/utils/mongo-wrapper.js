const MongoClient = require('mongodb').MongoClient;

class MongoWrapper {
    constructor(config) {
        this.config = config;
        this.mongo = new MongoClient(config.url);
        this.collections = {};
    }

    async connect(dbname) {
        this.client = await this.mongo.connect();
        return this.client;
    }

    setDatabase(dbname) {
        this.database = this.client.db(dbname);
    }

    addCollection(name) {
        this.collections[name] = this.database.collection(name);
    }
}

module.exports = { MongoWrapper };