import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../network/Api";
import { METHOD_TYPE } from "../network/methodType";
import Button from "./Button";

const ZoomMeetingButton = () => {
  const navigate = useNavigate();

  const createZoomMeeting = async () => {
    try {
      // Bước 1: Lấy zoomAuthUrl
      const authResponse = await Api({
        endpoint: "meeting/auth",
        method: METHOD_TYPE.GET,
        data: {
          topic: "Test Zoom Meeting 2",
          password: "123456",
        },
      });

      if (authResponse.success) {
        const zoomAuthUrl = authResponse.data.zoomAuthUrl;
        window.location.href = zoomAuthUrl;
      }
    } catch (error) {
      console.error("Failed to get zoomAuthUrl:", error);
    }
  };

  const handleZoomCallback = async (authorizationCode) => {
    try {
      // Bước 2: Lấy accessToken từ authorizationCode
      const tokenResponse = await Api({
        endpoint: "meeting/handle",
        method: METHOD_TYPE.POST,
        data: {
          authorizationCode,
        },
      });

      if (tokenResponse.success) {
        const accessToken = tokenResponse.data.accessToken;

        // Bước 3: Tạo cuộc họp Zoom
        const meetingResponse = await Api({
          endpoint: "meeting/create",
          method: METHOD_TYPE.POST,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          data: {
            topic: "Team Sync Meeting",
            password: "12345",
          },
        });

        if (meetingResponse.success) {
          const { meetingId, topic, startTime, joinUrl } = meetingResponse.data;
          console.log("Meeting created:", { meetingId, topic, startTime, joinUrl });
        }
      }
    } catch (error) {
      console.error("Failed to handle Zoom callback:", error);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authorizationCode = urlParams.get("code");

    if (authorizationCode) {
      handleZoomCallback(authorizationCode);
    }
  }, [navigate]);

  return (
    <Button onClick={createZoomMeeting}>
      Tạo cuộc họp Zoom
    </Button>
  );
};

export default ZoomMeetingButton;