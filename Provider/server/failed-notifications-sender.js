const nacl_factory = require("js-nacl");

const { MongoWrapper } = require("../utils/mongo-wrapper.js");
const { HttpNotificationSender } = require("./senders/http-notification-sender.js");

class FailedNotificationsSender {
    constructor({ providerKeys, configMongo, configNotify, providerInfo }) {
        this.providerKeys = providerKeys;
        this.configMongo = configMongo;
        this.configNotify = configNotify;
        this.providerInfo = providerInfo;

        this.users = {}
    }

    async start() {
        return this.startNacl()
            .then(this.startMongo.bind(this))
            .then(this.startSenders.bind(this))
            .then(this.sendOnStart.bind(this))
    }

    async startNacl() {
        return new Promise((resolve, reject) => {
            nacl_factory.instantiate((nacl) => {
                this.nacl = nacl;
                resolve(this.nacl);
            });   
        });
    }

    async startMongo() {
        this.mongo = new MongoWrapper(this.configMongo);

        await this.mongo.connect();
        this.mongo.setDatabase("notificationdb");
        this.mongo.addCollection("users");
        this.mongo.addCollection("notifications");
    }

    async startSenders() {
        this.providerKeys = this.nacl.crypto_sign_keypair_from_seed(this.nacl.from_hex(this.providerKeys.secret));
        this.senders = { "URL": new HttpNotificationSender(this.nacl, this.providerKeys) }
    }

    async onNotifyFail({ key, user, message }, isRetry = false, subAttempts = 0, ignoreTimer = false) {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeout = this.getRetryTime( (++message.attempts) - subAttempts );

        await this.mongo.collections.notifications.updateOne({ key }, { 
            $inc: { attempts: 1 }, $set: { next_dispatch_time: currentTime + timeout } 
        });

        if ((user.hash in this.users) && !isRetry) return;
        this.users[user.hash] = true;
        
        //console.log("SEND FAILED", message.attempts, user.hash, timeout)

        setTimeout(() => {
            this.sendNotification(key, user, message).catch(() => { 
                this.onNotifyFail({ key, user, message }, true, subAttempts);
            });
        }, (ignoreTimer?0:timeout) * 1000);
    } 

    async sendNotification(key, user, message) {
        const { callback_type, callback } = user;

        return this.senders[callback_type].send(message, callback, this.providerInfo.id, this.configNotify.next_attempts_timeout)
            .then((result) => {
                const currentTime = Math.floor(Date.now() / 1000);
                this.mongo.collections.notifications.updateOne({ key }, {
                    $set: { received_by_consumer_time: currentTime, success: true },
                    $unset: { encoded: "", nonce: "" }
                }).then(() => this.onSuccessfulSend( user, message ));
            });
    }

    async onSuccessfulSend(user, message) {
        //console.log("SEND SUCCESS", message.attempts, user.hash)

        delete this.users[user.hash];
        
        const notifications = await this.mongo.collections.notifications.find({
            attempts: { $lt: this.configNotify.max_attempts },
            success: false, hash: user.hash
        }).sort({ next_dispatch_time: 1 }).limit(1).toArray();

        if (user.hash in this.users) return;
        const nextNotify = notifications[0];

        console.log(nextNotify)
        if (nextNotify) {
            this.onNotifyFail({ key: nextNotify.key, user, message: nextNotify }, false, nextNotify.attempts, true);
        }
    }


    async sendOnStart() {
        const result = await this.mongo.collections.notifications.aggregate([
            { $match: { success: false, attempts: { $lt: this.configNotify.max_attempts }}},
            { $sort: { hash: 1, next_dispatch_time: 1 }},
            { $group: {
                _id: { hash: "$hash" },
                first: { $first: "$$ROOT" }
            }},
            { $lookup: {
                from: "users",
                localField: "hash",
                foreignField: "first.hash",
                as: "user"
            }}
        ]).toArray();

        for (let info of result) {
            const { first } = info;
            const hash = info._id.hash;
            const user = info.user[0];
            
            console.log({hash, first})

            this.onNotifyFail({ key: first.key, user, message: first }, false, first.attempts, true);
        }
    }


    getRetryTime(attempt) {
        return Math.pow(this.configNotify.retry_time_base, attempt);
    }
}

module.exports = FailedNotificationsSender