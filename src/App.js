import { useEffect, useState } from 'react';
import { Col, Container, Navbar, Row, Alert } from 'react-bootstrap';

import './assets/css/bootstrap.min.css';
import Header from './components/Header';
import mqttClient from './config/mqtt';

function App() {
  const routingKey = 'psu/drone';
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => {
    mqttClient.on('connect', function () {
      setIsConnected(true);
      console.log('connected');
    });

    mqttClient.subscribe(routingKey, function () {
      console.log('subscribed to ', routingKey);
    });

    mqttClient.on('message', function (topic, message) {
      if (topic == routingKey) {
        console.log("Received '" + message + "' on '" + topic + "'");
        const json = JSON.parse(message.toString());
        setMessages((prevMessages) => {
          return [json['message'], ...prevMessages];
        });
        console.log(json);
      }
    });
  }, []);

  return (
    <>
      <Header />
      <main className='mt-3'>
        <Container>
          <Row className='justify-content-center'>
            <Col lg={8}>
              <Alert variant={isConnected ? 'success' : 'danger'}>
                <Alert.Heading>
                  MQTT is {isConnected ? 'connected' : 'not connected'}
                </Alert.Heading>
              </Alert>
            </Col>
          </Row>
          <Row className='justify-content-center'>
            <Col lg={12} className='text-center'>
              <h2>MQTT Messages</h2>
            </Col>
            <Col lg={10}>
              <div
                className='pre-scrollable overflow-auto p-3'
                style={{ backgroundColor: '#d3d3d3' }}
              >
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
