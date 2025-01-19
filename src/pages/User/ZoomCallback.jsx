import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../network/Api";
import Cookies from "js-cookie";
import { METHOD_TYPE } from "../../network/methodType";

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
    console.log("Zoom Meeting Created:", meetingData);
  } catch (error) {
    console.error("Error creating Zoom Meeting:", error);
  }
};

const ZoomCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleZoomCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        const code = params.get("code");

        if (!code) {
          navigate("/login");
          return;
        }

        const response = await Api({
          endpoint: "meeting/handle",
          method: METHOD_TYPE.POST,
          data: { authorizationCode: code },
        });

        const result = response.data.result;
        if (result) {
          const accessToken = result.accessToken;
          const refreshToken = result.refreshToken;
          if (accessToken) {
            Cookies.set("zoomAccessToken", accessToken);
            Cookies.set("zoomRefreshToken", refreshToken);
            await createZoomMeeting(accessToken);
          }
          navigate("/dashboard"); 
        } else {
          console.error("Zoom Auth Result not found.");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error handling Zoom Auth Code:", error);
        navigate("/login");
      }
    };

    handleZoomCallback();
  }, [navigate]);

  return <div>Processing your Zoom login...</div>;
};

const ZoomCallback = React.memo(ZoomCallbackPage);

export default ZoomCallback;