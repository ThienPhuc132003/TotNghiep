import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Api from "../network/Api";
import { METHOD_TYPE } from "../network/methodType";
import Cookies from "js-cookie";

const ZoomMeetingButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [meetingData, setMeetingData] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");

    if (code) {
      handleZoomCode(code);
    }

    async function handleZoomCode(code) {
      try {
        const response = await Api({
          endpoint: "meeting/handle",
          method: METHOD_TYPE.POST,
          data: {
            authorizationCode: code,
          },
        });
        const result = response.data.result;

        if (result) {
          console.log("Zoom Auth Result:", result);
          const accessToken = result.accessToken;
          const refreshToken = result.refreshToken;
          if (accessToken) {
            Cookies.set("zoomAccessToken", accessToken);
            Cookies.set("zoomRefreshToken", refreshToken);
            console.log("Access Token and Refresh Token set in cookies");
            await createZoomMeeting(accessToken);
          }
          navigate("/dashboard");
        } else {
          console.error("Zoom Auth Result not found.");
        }
      } catch (error) {
        console.error("Error handling Zoom Auth Code:", error);
      }
    }
  }, [location, navigate]);

  const createZoomMeeting = async (accessToken) => {
    try {
      const response = await Api({
        endpoint: "meeting/create",
        method: METHOD_TYPE.POST,
        data: {
          topic: "Team Sync Meeting",
          password: "12345",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const meetingData = response.data;
      setMeetingData(meetingData);
      console.log("Zoom Meeting Created:", meetingData);
    } catch (error) {
      console.error("Error creating Zoom Meeting:", error);
    }
  };

  const handleZoomAuth = async () => {
    try {
      const response = await Api({
        endpoint: "meeting/auth",
        method: METHOD_TYPE.GET,
      });
      const zoomAuthUrl = response.data.zoomAuthUrl;

      if (zoomAuthUrl) {
        window.location.href = zoomAuthUrl;
      } else {
        console.error("Zoom Auth URL not found.");
      }
    } catch (error) {
      console.error("Error fetching Zoom Auth URL:", error);
    }
  };

  return (
    <div>
      <button onClick={handleZoomAuth} className="zoom-meeting-button">
        Connect to Zoom
      </button>
      {meetingData && (
        <div>
          <h3>Meeting Created</h3>
          <p>Meeting ID: {meetingData.meetingId}</p>
          <p>Topic: {meetingData.topic}</p>
          <p>Start Time: {meetingData.startTime}</p>
          <p>
            Join URL: <a href={meetingData.joinUrl}>{meetingData.joinUrl}</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default ZoomMeetingButton;