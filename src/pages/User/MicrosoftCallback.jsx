import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../network/Api";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { setUserProfile } from "../../redux/userSlice";
import { METHOD_TYPE } from "../../network/methodType";

const MicrosoftCallbackPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("MicrosoftCallbackPage mounted");
    const handleMicrosoftCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        let code = params.get("code");
        const sessionState = params.get("session_state");

        if (!code) {
          console.error("Code not found in URL.");
          navigate("/login");
          return;
        }
        if (!sessionState) {
          console.error("Session state not found in URL.");
          navigate("/login");
          return;
        }
        console.log("Code:", code);
        console.log("Session state:", sessionState);

        const response = await Api({
          endpoint: "user/auth/callback",
          method: METHOD_TYPE.POST,
          data: { code: code, sessionState: sessionState },
        });

        console.log("API Response:", response);

        if (!response || !response.data) {
          console.error("Error in API response:", response);
          navigate("/login");
          return;
        }

          const { userId, token } = response.data;

        if (!token || !userId) {
          console.error(
            "Token or user data missing in API response:",
            response.data
          );
          navigate("/login");
          return;
        }

        Cookies.set("token", token);
        Cookies.set("role", "user");
        dispatch(setUserProfile({ userId })); //dispatch userId
        console.log("Redux after dispatch:", userId);
        console.log("before navigate to dashboard");
        navigate("/dashboard");
      } catch (error) {
        console.error("Error during Microsoft Login flow:", error);
        navigate("/login");
      }
    };

    handleMicrosoftCallback();
  }, [navigate, dispatch]);

  return <div>Processing your login...</div>;
};

const MicrosoftCallback = React.memo(MicrosoftCallbackPage);
export default MicrosoftCallback;     