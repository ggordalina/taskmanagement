const mqqt = require("async-mqtt");
const topicsToSubscribe = ['task_op'];

let client;
client = mqqt.connect("tcp://broker:1883", {
    username: process.env.MQ_BROKER_USERNAME,
    password: process.env.MQ_BROKER_PASSWORD
});

client.on('connect', (_) => {
    console.log('broker connected');
});

client.on('error', (err) => {
    console.log('broker error', err);
});

client.subscribe(topicsToSubscribe, (error) => {
    if (error) {
        console.log('error on subscription', err);
    }
});

client.on('message', (_, payload, __) => {
    console.log(payload.toString());
});

const publishMessage = async (topic, message) => {
    if (!client) {
        throw new Error('client has not been initialized');
    }

    try {
        await client.publish(topic, message);
    } catch (err) {
        console.log(err.stack)
    }
}

module.exports = { publishMessage };