const mqqt = require("async-mqtt");

const topicsToSubscribe = ['task_op'];

const init = () => {
    const client = mqqt.connect("tcp://broker:1883", {
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

    client.on('message', (topic, payload, _) => {
        console.log(payload.toString());
    });

    const publish = async (topic, message) => {
        try {
            await client.publish(topic, message);
        } catch (err) {
            console.log(err.stack)
        }
    }

    return { publish };
}

module.exports = init;