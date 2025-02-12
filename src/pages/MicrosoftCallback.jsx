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

      const path = url.pathname;
      const role = path.includes("/admin/auth/callback") ? "admin" : "user";
      const apiUrl = `${role}/auth/callback`;

      console.log("Path:", path);
      console.log("Role:", role);
      console.log("API URL:", apiUrl);

      const response = await Api({
        endpoint: apiUrl,
        method: METHOD_TYPE.POST,
        data: { code },
      });

      console.log("Response:", response);

      if (!response || !response.data?.token) {
        setErrorMessage("Authentication failed: No token received.");
        return;
      }

      Cookies.set("token", response.data.token);

      Cookies.set("role", role);

      const profileResponse = await Api({
        endpoint: `${role}/get-profile`,
        method: METHOD_TYPE.GET,
      });

      console.log("Profile Response:", profileResponse);

      if (profileResponse.success) {
        role === "admin"
          ? dispatch(setAdminProfile(profileResponse.data))
          : dispatch(setUserProfile(profileResponse.data));

        setSuccessMessage("Authentication successful.");
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
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
    </div>
  );
};

const MicrosoftCallback = React.memo(MicrosoftCallbackPage);

export default MicrosoftCallback;
