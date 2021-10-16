class EventLogger {
    constructor(mongo) {
        this.mongo = mongo;
    }

    async event(time, type, fields) {
        const obj = { time, type, ...fields }
        console.log("LOG", obj)
        return this.mongo.collections.logs.insertOne(obj);
    }
}

module.exports =  { EventLogger }