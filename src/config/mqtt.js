import mqtt from "mqtt";

export const yourId = "mqttjs_" + Math.random().toString(16).substr(2, 8);

const client = mqtt.connect(`wss://localhost/mqtt`, {
  port: 8000,
  clientId: "mqttjs_" + Math.random().toString(16).substr(2, 8),
  username: "changeit",
  password: "changeit",
});

export default client;
