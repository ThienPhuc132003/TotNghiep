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
  const [successMessage, setSuccessMessage] = useState("");

  const handleMicrosoftCallback = useCallback(async () => {
    try {
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      const code = params.get("code");

      console.log("URL:", url);
      console.log("Params:", params);
      console.log("Code:", code);

      if (!code) {
        setErrorMessage("Authentication failed: Missing code.");
        return navigate("/login");
      }

      const isUser = url.pathname.includes("/user/auth/callback");
      const isAdmin = url.pathname.includes("/admin/auth/callback");

      console.log("isUser:", isUser);
      console.log("isAdmin:", isAdmin);

      if (!isUser && !isAdmin) {
        setErrorMessage("Authentication failed: Invalid callback URL.");
        return navigate("/login");
      }

      const role = isAdmin ? "admin" : "user";
      const apiUrl = isAdmin ? "admin/auth/callback" : "user/auth/callback";

      console.log("API URL:", apiUrl);

      const response = await Api({
        endpoint: apiUrl,
        method: METHOD_TYPE.POST,
        data: { code },
      });

      console.log("Response:", response);

      const { token } = response.data;
      if (!token) {
        setErrorMessage("Authentication failed: No token received.");
        return;
      }

      Cookies.set("token", token);
      Cookies.set("role", role);

      const profileEndpoint = isAdmin ? "admin/get-profile" : "user/get-profile";
      const profileResponse = await Api({
        endpoint: profileEndpoint,
        method: METHOD_TYPE.GET,
      });

      console.log("Profile Response:", profileResponse);

      if (profileResponse.success) {
        isAdmin
          ? dispatch(setAdminProfile(profileResponse.data))
          : dispatch(setUserProfile(profileResponse.data));

        setSuccessMessage("Authentication successful. Token received and profile fetched.");
        // Comment out the navigate calls to stay on the current page
        navigate(isAdmin ? "/admin/dashboard" : "/dashboard");
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
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
    </div>
  );
};

const MicrosoftCallback = React.memo(MicrosoftCallbackPage);

export default MicrosoftCallback;