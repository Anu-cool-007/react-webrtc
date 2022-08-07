import { useEffect, useRef, useState } from "react";
import { Col, Container, Row, Alert } from "react-bootstrap";
import Peer from "simple-peer";

import "./assets/css/bootstrap.min.css";
import mqttClient, { yourId } from "./config/mqtt";

function App() {
  const [isConnected, setIsConnected] = useState(false);

  const [stream, setStream] = useState("");
  const [recievingCall, setRecievingCall] = useState("");
  const [callerId, setCallerId] = useState("");
  const [callerSignal, setCallerSignal] = useState("");
  const [callAccepted, setCallAccepted] = useState("");
  const [peer, setPeer] = useState();

  const userVideo = useRef();
  const partnerVideo = useRef();

  useEffect(() => {
    const topics = ["rtc/#"];

    mqttClient.on("connect", function () {
      setIsConnected(true);
      console.log("connected");
    });

    mqttClient.subscribe(topics, function () {
      console.log("subscribed to ", topics);
    });

    mqttClient.on("message", (topic, message) => {
      switch (true) {
        case /rtc\/.*\/ans/.test(topic): {
          console.log("Offer sent", message.toString());
          break;
        }
        case /rtc\/.*\/offer/.test(topic): {
          console.log(message.toString());
          const data = JSON.parse(message.toString());
          if (data.senderId && data.senderId !== yourId) {
            console.log("Offer recieved from", data.senderId);
            setRecievingCall(true);
            setCallerId(data.senderId);
            setCallerSignal(data.signalData);
          }

          break;
        }
        default: {
          console.log("Received '" + message + "' on '" + topic + "'");
          break;
        }
      }
    });

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (userVideo.current) {
          const videoTracks = stream?.getVideoTracks() || [];
          const selectedVideoTrack = videoTracks[0];
          const audiolessStream = new MediaStream();
          audiolessStream.addTrack(selectedVideoTrack);
          userVideo.current.srcObject = audiolessStream;
        }
      });
  }, []);

  const offerCall = () => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      const offer_payload = { signalData: data, senderId: yourId };
      console.log(offer_payload);
      mqttClient.publish(`rtc/${yourId}/offer`, JSON.stringify(offer_payload), {
        retain: true,
      });
    });

    peer.on("stream", (stream) => {
      console.log("recieved stream");
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = stream;
      }
    });

    mqttClient.on("message", (topic, message) => {
      if (topic === `rtc/${yourId}/answer`) {
        setCallAccepted(true);
        peer.signal(JSON.parse(message.toString()).signalData);
      }
    });

    setPeer(peer);
  };

  const acceptCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      // stream: stream,
    });

    peer.on("signal", (data) => {
      mqttClient.publish(
        `rtc/${callerId}/answer`,
        JSON.stringify({ signalData: data, senderId: yourId }),
        { retain: true }
      );
    });

    peer.on("stream", (stream) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = stream;
      }
    });

    peer.signal(callerSignal);
    setPeer(peer);
  };

  const onStartServer = () => {
    mqttClient.publish("python/mqtt/start-rtc", "start", { retain: true });
  };

  let UserVideo;
  if (stream) {
    UserVideo = <video playsInline ref={userVideo} autoPlay />;
  }

  let PartnerVideo;
  if (callAccepted) {
    PartnerVideo = <video playsInline ref={partnerVideo} autoPlay />;
  }

  let incomingCall;
  if (recievingCall) {
    incomingCall = (
      <div>
        <h1>{callerId} is calling you</h1>
        <button onClick={acceptCall}>Accept</button>
      </div>
    );
  }
  const handleConnClose = () => {
    peer.destroy();
  };

  return (
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
          <button onClick={onStartServer}>Start Server</button>
        </Row>
        <Row className="justify-content-center">
          <Col lg={12} className="text-center">
            <h2>Start a call Call as {yourId}</h2>
          </Col>
        </Row>
        <Row>
          <button onClick={offerCall}>Offer a call</button>
        </Row>
        <Row>{incomingCall}</Row>
        <Row>{UserVideo}</Row>
        <Row>{PartnerVideo}</Row>
        <button onClick={handleConnClose}>Close Connection</button>
      </Container>
    </main>
  );
}

export default App;
