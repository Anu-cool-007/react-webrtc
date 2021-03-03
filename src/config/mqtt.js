import mqtt from 'mqtt';

const client = mqtt.connect(`ws://localhost:15675/ws`, {
  port: 15675,
  username: 'guest',
  password: 'guest',
  clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
});
client.on('connect', function () {
  console.log('connected');
});

export default client;
