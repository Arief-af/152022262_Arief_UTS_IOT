const mqtt = require('mqtt');
const db = require('../config/db'); 

const executeQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.execute(query, params, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

const mqttClient = mqtt.connect('mqtt://broker.hivemq.com');

mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    mqttClient.subscribe('uts/152022262', (err) => {
        if (err) {
            console.log('Error subscribing to topic', err);
        } else {
            console.log('Subscribed to topic uts/152022262');
        }
    });
});

mqttClient.on('message', async (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        
        const { temperature, humidity } = data;
        if (!temperature || !humidity) {
            console.log('Invalid MQTT message format');
            return;
        }

        let kecerahan =  Math.floor(Math.random() * 100) + 1;

        const query = 'INSERT INTO dht_readings (suhun, humid, kecerahan) VALUES (?, ?, ?)';
        await executeQuery(query, [temperature, humidity, kecerahan]);

        console.log(`Data saved: ${temperature}, ${humidity}`);
    } catch (err) {
        console.error('Error processing MQTT message:', err);
    }
});

module.exports = mqttClient;
