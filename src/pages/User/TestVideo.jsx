import React, { useEffect, useRef, useState } from "react";
import { CallClient, VideoStreamRenderer, LocalVideoStream } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";

const TestVideoPage = () => {
  const videoRef = useRef(null);
  const [callAgent, setCallAgent] = useState(null);
  const [deviceManager, setDeviceManager] = useState(null);
  const [call, setCall] = useState(null);
  const [localVideoStream, setLocalVideoStream] = useState(null);
  const [localVideoStreamRenderer, setLocalVideoStreamRenderer] = useState(null);

  useEffect(() => {
    const initializeCallAgent = async () => {
      try {
        const tokenCredential = new AzureCommunicationTokenCredential("YOUR_ACCESS_TOKEN");
        const callClient = new CallClient();
        const agent = await callClient.createCallAgent(tokenCredential);
        setCallAgent(agent);

        const manager = await callClient.getDeviceManager();
        await manager.askDevicePermission({ video: true });
        await manager.askDevicePermission({ audio: true });
        setDeviceManager(manager);
      } catch (error) {
        console.error("Failed to initialize call agent:", error);
      }
    };

    initializeCallAgent();

    return () => {
      if (localVideoStreamRenderer) {
        localVideoStreamRenderer.dispose();
      }
    };
  }, [localVideoStream, localVideoStreamRenderer]);

  const startCall = async () => {
    try {
      const camera = (await deviceManager.getCameras())[0];
      const localStream = new LocalVideoStream(camera);
      setLocalVideoStream(localStream);

      const callInstance = callAgent.startCall([{ communicationUserId: "CALLEE_USER_ID" }], { localVideoStreams: [localStream] });
      setCall(callInstance);

      const renderer = new VideoStreamRenderer(localStream);
      const view = await renderer.createView();
      videoRef.current.appendChild(view.target);
      setLocalVideoStreamRenderer(renderer);
    } catch (error) {
      console.error("Failed to start call:", error);
    }
  };

  const endCall = async () => {
    if (call) {
      await call.hangUp();
      setCall(null);
      if (localVideoStreamRenderer) {
        localVideoStreamRenderer.dispose();
        setLocalVideoStreamRenderer(null);
      }
    }
  };

  return (
    <div id="live-share-container" style={{ width: "100%", height: "100vh" }}>
      <div ref={videoRef} style={{ width: "100%", height: "100%" }}></div>
      <button onClick={startCall}>Start Call</button>
      <button onClick={endCall}>End Call</button>
    </div>
  );
};

const TestVideo = React.memo(TestVideoPage);
export default TestVideo;