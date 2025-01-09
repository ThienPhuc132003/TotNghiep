import React from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";

const TestVideoPage = () => {
  return (
    <div id="jitsi-container" style={{ width: "100%", height: "100vh" }}>
      <JitsiMeeting
        domain="giasuvlu.click"
        roomName="testroom"
        configOverwrite={{
          startWithAudioMuted: true,
          disableModeratorIndicator: true,
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        }}
        userInfo={{
          displayName: "User",
        }}
        onApiReady={(externalApi) => {
          // Here you can attach custom event listeners to the Jitsi Meet External API
          externalApi.addEventListener("videoConferenceJoined", () => {
            console.log("Local User Joined");
          });
          externalApi.addEventListener("videoConferenceLeft", () => {
            console.log("Local User Left");
          });
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = "100%";
        }}
      />
    </div>
  );
};

const TestVideo = React.memo(TestVideoPage);
export default TestVideo;
