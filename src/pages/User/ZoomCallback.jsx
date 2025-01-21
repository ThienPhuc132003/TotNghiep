import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../network/Api";
import Cookies from "js-cookie";
import { METHOD_TYPE } from "../../network/methodType";
import { useDispatch } from "react-redux";

const ZoomCallbackPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
        const { accessToken } = response.data.result;
        const { refreshToken } = response.data.result;
        console.log(accessToken);
        console.log(refreshToken);
        if (response.success === true) {
          Cookies.set("zoomAccessToken", accessToken);
          Cookies.set("zoomRefreshToken", refreshToken);
        } else {
          navigate("/login");
        }
      } catch (error) {
        navigate("/login");
      }
    };

    handleZoomCallback();
  }, [navigate, dispatch]);

  return <div>Processing your login...</div>;
};

const ZoomCallback = React.memo(ZoomCallbackPage);

export default ZoomCallback;
