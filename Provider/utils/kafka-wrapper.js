const { Kafka } = require('kafkajs');

class KafkaWrapper {
    constructor(config) {
        this.kafka = new Kafka(config);
    }

    async consume({ groupId, topic }, eachMessage ) {
        const consumer = this.kafka.consumer({ groupId });
        
        await consumer.connect();
        await consumer.subscribe({ topic });
        await consumer.run({ eachMessage });

        return consumer;
    }
}

module.exports = { KafkaWrapper };