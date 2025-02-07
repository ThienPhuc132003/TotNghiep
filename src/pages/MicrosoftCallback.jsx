import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../network/Api";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { setUserProfile } from "../redux/userSlice";
import { setAdminProfile } from "../redux/adminSlice";
import { METHOD_TYPE } from "../network/methodType";

const MicrosoftCallbackPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState("");

  const handleMicrosoftCallback = useCallback(async () => {
    try {
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      const code = params.get("code");
      const role = params.get("state"); 
  
      if (!code || !role) {
        setErrorMessage("Authentication failed: Missing code or role.");
        return navigate("/login");
      }
  
      const apiUrl = role === "admin" ? "admin/auth/callback" : "user/auth/callback";
  
      const response = await Api({
        endpoint: apiUrl,
        method: METHOD_TYPE.POST,
        data: { code },
      });
  
      const { token } = response.data;
      if (!token) {
        setErrorMessage("Authentication failed: No token received.");
        return;
      }
  
      Cookies.set("token", token);
      Cookies.set("role", role);
  
      const profileEndpoint = role === "admin" ? "admin/get-profile" : "user/get-profile";
      const profileResponse = await Api({
        endpoint: profileEndpoint,
        method: METHOD_TYPE.GET,
      });
  
      if (profileResponse.success) {
        role === "admin"
          ? dispatch(setAdminProfile(profileResponse.data))
          : dispatch(setUserProfile(profileResponse.data));
  
        navigate(role === "admin" ? "/admin/dashboard" : "/dashboard");
      } else {
        setErrorMessage("Error fetching profile data.");
      }
    } catch (error) {
      setErrorMessage("Authentication failed.");
      console.error("Microsoft Auth Error:", error);
    }
  }, [navigate, dispatch]);

  useEffect(() => {
    handleMicrosoftCallback();
  }, [handleMicrosoftCallback]);

  return (
    <div>
      <h2>Đang xử lý đăng nhập...</h2>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

const MicrosoftCallback = React.memo(MicrosoftCallbackPage);

export default MicrosoftCallback;