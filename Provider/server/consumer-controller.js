const { performance } = require("perf_hooks");
const { KafkaWrapper } = require("../utils/kafka-wrapper.js");
const FailedNotificationsSender = require("./failed-notifications-sender.js");

function makeid(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < len; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
}

class ConsumerController {
    constructor({ configKafka, providerKeys, configMongo, configNotify, providerInfo }) {
        this.configKafka = configKafka
        this.processedMessages = {}

        this.maxLoad = configNotify.max_concurrency;

        this.failedNotificationsSender = new FailedNotificationsSender({
            providerKeys, configMongo, configNotify, providerInfo
        })
    }

    async start(workers) {
        this.workersCount = Object.keys(workers).length;
        this.workers = workers;
        this.readyWorkers = 0;
        this.workersLoad = {}

        this.currentLoad = 0;
        this.nextMessagePromise = new Promise(resolve => resolve());
        this.onMessageConsume = () => {}

        for (let workerId in this.workers) {
            const worker = this.workers[workerId];
            this.workersLoad[workerId] = 0;
            worker.on("message", this.workerOnMessage.bind(this, workerId))
        }

        await this.failedNotificationsSender.start();
    }

    workerOnMessage(workerId, message) {
        const { event } = message;
        if (event === "READY") {
            console.log("WORKER", workerId, "READY")
            if (++this.readyWorkers === this.workersCount) {
                console.log("ALL WORKERS READY");
                this.startKafka().then(() => console.log("KAFKA READY"));
            }
        } else if (event === "FINISHED") {
            this.workersLoad[workerId] -= 1;
            this.currentLoad -= 1;
            this.onMessageConsume();
        } else if (event === "NOTIFY_FAIL") {
            this.failedNotificationsSender.onNotifyFail(message.data);
        } else {
            console.log("message", workerId, message)
        }
    }

    getNextWorkerId() {
        const workers = Object.keys(this.workers).map((id) => { 
            return { id, load: this.workersLoad[id] }
        }).sort((a, b) => a.load - b.load)

        return workers[0].id
    }

    async wait() {
        return this.nextMessagePromise;
    }

    async startKafka() {
        //return;
        //return this.startLoadingTest();

        this.kafka = new KafkaWrapper(this.configKafka.client);
        return this.kafka.consume(this.configKafka.consumer, this.onKafkaMessage.bind(this))
    }

    async startLoadingTest() {
        let count = 0;
        let time = performance.now();

        while (true) {
            await this.onKafkaMessage({topic: "", partition: "", message: {
                key: Buffer.from(makeid(24), "utf8"),
                value: Buffer.from("839632c4a882f8f3a977fed8c0b3f7987c1cea19ddf6a473eec39d0b827a7f7a" 
                    + " " + makeid(24) + " " + makeid(384), "utf8")
            }});
            count += 1;
            
            if (count % 1000 === 0) {
                console.log("MPS:", count / ((performance.now() - time) / 1000) );
                count = 0;
                time = performance.now();
            }
        }
    }

    async onKafkaMessage({ topic, partition, message }) {
        await this.wait();

        const [ hash, nonce, encoded_message ] = message.value.toString().split(" ");
        const key = message.key.toString();

        if (key in this.processedMessages) return;

        const workerId = this.getNextWorkerId();
        this.processedMessages[key] = workerId;
        
        this.workersLoad[workerId] += 1;
        this.currentLoad += 1;

        if (this.currentLoad >= this.maxLoad) {
            this.nextMessagePromise = new Promise(resolve => {this.onMessageConsume = resolve});
        }

        this.workers[workerId].send({ event: "NEW_MESSAGE", data: { topic, partition, message: {
            key, hash, nonce, encoded_message
        }}});
    }
}

module.exports = ConsumerController;