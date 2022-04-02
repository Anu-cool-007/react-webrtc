import { useEffect, useState } from "react";
import { Col, Container, Row, Alert } from "react-bootstrap";

import "./assets/css/bootstrap.min.css";
import Header from "./components/Header";
import mqttClient from "./config/mqtt";

function App() {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const topics = ["rtc/offer", "rtc/answer", "rtc"];

    mqttClient.on("connect", function () {
      setIsConnected(true);
      console.log("connected");
    });

    mqttClient.subscribe(topics, function () {
      console.log("subscribed to ", topics);
    });

    mqttClient.on("message", function (topic, message) {
      switch (topic) {
        case topics[0]: {
          break;
        }
        case topics[1]: {
          break;
        }
        case topics[2]: {
          break;
        }
        default: {
          console.log("Received '" + message + "' on '" + topic + "'");
          break;
        }
      }
    });
  }, []);

  return (
    <>
      <Header />
      <main className="mt-3">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <Alert variant={isConnected ? "success" : "danger"}>
                <Alert.Heading>
                  MQTT is {isConnected ? "connected" : "not connected"}
                </Alert.Heading>
              </Alert>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col lg={12} className="text-center">
              <h2>MQTT Messages</h2>
            </Col>
            <Col lg={10}>
              <div
                className="pre-scrollable overflow-auto p-3"
                style={{ backgroundColor: "#d3d3d3" }}>
                {messages.length > 0 &&
                  messages.map((msg) => (
                    <>
                      <p>{msg}</p>
                      <hr />
                    </>
                  ))}
              </div>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  );
}

export default App;
