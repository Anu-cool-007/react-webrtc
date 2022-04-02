import mqtt from "mqtt";

const client = mqtt.connect(`ws://localhost/mqtt`, {
  port: 8000,
  clientId: "mqttjs_" + Math.random().toString(16).substr(2, 8),
});

export default client;
