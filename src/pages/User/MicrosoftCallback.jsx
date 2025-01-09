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

        if (!response || !response.data) {
          console.error("Error in API response:", response);
          navigate("/login");
          return;
        }

        const { token } = response.data;

        if (!token) {
          console.error("Token missing in API response:", response.data);
          navigate("/login");
          return;
        }
        
        Cookies.set("token", token);
        Cookies.set("role", "user");
        
        try {
          const responseGetProfile = await Api({
            endpoint: "user/get-profile",
            method: METHOD_TYPE.GET,
          });
          if (responseGetProfile.success === true) {
            console.log("Dispatching profile data:", responseGetProfile.data); 
            dispatch(setUserProfile(responseGetProfile.data));
            console.log("Profile fetched successfully:", responseGetProfile.data);
          } else {
            console.error("Failed to fetch profile:", responseGetProfile.message);
          }
        } catch (error) {
          console.error("Failed to fetch profile:", error);
        }
        
        navigate("/login");
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