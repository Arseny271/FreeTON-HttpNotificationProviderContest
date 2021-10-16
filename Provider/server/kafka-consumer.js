const nacl_factory = require("js-nacl");
const heapdump = require("heapdump");

const { MongoWrapper } = require("../utils/mongo-wrapper.js");
const { HttpNotificationSender } = require("./senders/http-notification-sender.js");

class KafkaConsumer {
    constructor({ providerInfo, providerKeys, configMongo, configNotify }) {
        this.providerKeys = providerKeys;
        this.configMongo = configMongo;
        this.configNotify = configNotify;
        this.providerInfo = providerInfo;

        this.count = 0;
    }

    async start() {
        this.startNacl()
        .then(this.startMongo.bind(this))
        .then(this.startSenders.bind(this))
        .then(() => {
            process.send({ event: "READY", data: {} });
            process.on("message", this.onProcessMessage.bind(this));
        })
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

    async onProcessMessage(message) {
        try {
            if (message.event !== "NEW_MESSAGE") return;
            await this.onKafkaMessage(message.data);
        } catch (e) {
            console.log("ERROR", e)
        } finally {
            process.send({ event: "FINISHED", data: { key: message.data.message.key }});
        }
    }

    async onKafkaMessage({ topic, partition, message }) {
        this.count++;

        const messageKey = message.key;        
        const userHash = message.hash;
        const messageNonce = message.nonce;
        const encodedMessage = message.encoded_message;

        /*if (this.count % 10000 === 0) {
            console.log("DUMP");
            heapdump.writeSnapshot(`heapDump-${this.count / 1000}-${Date.now()}.heapsnapshot`, (err, filename) => {
                console.log("Heap dump of a bloated server written to", filename);
            });
        }*/

        console.log("NEW MESSAGE", messageKey, userHash, messageNonce);

        const user = await this.mongo.collections.users.findOne({ hash: userHash });
        if (!user) { console.log("USER NOT FOUND", userHash); return; }
        if (!user.confirmed) { console.log("USER NOT CONFIRMED", userHash); return; }

        const [ deduplicatedMessage, isNewMessage ] = await this.deduplicateMessage({
            messageKey, userHash, hashId: user._id, messageNonce, encodedMessage});
    
        if (!isNewMessage) { console.log("DUPLICATE", messageKey); return; }

        if (user.callback_type in this.senders) {
            await this.sendNotification(user, deduplicatedMessage);
        } else {
            return;
        }
    }

    async deduplicateMessage({ messageKey, userHash, hashId, messageNonce, encodedMessage }) {
        const currentTime = Math.floor(Date.now() / 1000);
        const oldNotification = await this.mongo.collections.notifications.findOneAndUpdate({
            key: messageKey,
        }, {
            $setOnInsert: {
                key: messageKey,
                hash: userHash,
                nonce: messageNonce,
                encoded: encodedMessage,
                next_dispatch_time: currentTime,            // время следующей попытки отправки 
                received_by_provider_time: currentTime,     // время получения провайдером
                received_by_consumer_time: 0,               // время получения потребителем
                attempts: 0,                                // число неудачных попыток доставки
                success: false
            }
        }, {
            upsert: true
        });

        const oldValue = oldNotification.value;
        return [oldValue?oldValue:{
            key: messageKey,
            hash: userHash,
            hash_id: hashId,
            nonce: messageNonce,
            encoded: encodedMessage,
            next_dispatch_time: currentTime,           
            received_by_provider_time: currentTime,
            received_by_consumer_time: 0,
            success: false,
            attempts: 0
        }, oldValue === null];
    }

    async sendNotification(user, message) {
        const { callback_type, callback, hash } = user;
        const { key } = message;
        
        return this.senders[callback_type].send(message, callback, this.providerInfo.id, this.configNotify.first_attempt_timeout).then(() => {
            const currentTime = Math.floor(Date.now() / 1000);
            return this.mongo.collections.notifications.updateOne({ key }, {
                $set: { received_by_consumer_time: currentTime, success: true },
                $unset: { encoded: "", nonce: "" }
            });
        }, () => {
            process.send({ event: "NOTIFY_FAIL", data: { key, user, message }});
        })
    }
}

module.exports = KafkaConsumer