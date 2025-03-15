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
      const token = Cookies.get("token");
      const role = Cookies.get("role");

      if (token && role) {
        const profileResponse = await Api({
          endpoint: `${role}/get-profile`,
          method: METHOD_TYPE.GET,
        });

        if (profileResponse.success) {
          role === "admin"
            ? dispatch(setAdminProfile(profileResponse.data))
            : dispatch(setUserProfile(profileResponse.data));

          setSuccessMessage("Authentication successful.");
          return navigate(role === "admin" ? "/admin/dashboard" : "/dashboard");
        }
      }

      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      const code = params.get("code");

      if (!code) {
        setErrorMessage("Authentication failed: Missing code.");
        return navigate("/login");
      }

      const path = url.pathname;
      const roleFromPath = path.includes("/admin/auth/callback")
        ? "admin"
        : "user";
      const apiUrl = `${roleFromPath}/auth/callback`;

      const response = await Api({
        endpoint: apiUrl,
        method: METHOD_TYPE.POST,
        data: { code },
      });

      if (!response || !response.data?.token) {
        setErrorMessage("Authentication failed: No token received.");
        return;
      }

      Cookies.set("token", response.data.token);
      Cookies.set("role", roleFromPath);

      const profileResponse = await Api({
        endpoint: `${roleFromPath}/get-profile`,
        method: METHOD_TYPE.GET,
      });

      if (profileResponse.success) {
        roleFromPath === "admin"
          ? dispatch(setAdminProfile(profileResponse.data))
          : dispatch(setUserProfile(profileResponse.data));

        setSuccessMessage("Authentication successful.");
        navigate(roleFromPath === "admin" ? "/admin/dashboard" : "/dashboard");
      } else {
        setErrorMessage("Error fetching profile data.");
      }
    } catch (error) {
      setErrorMessage("Authentication failed.");
    }
  }, [navigate, dispatch]);

  useEffect(() => {
    const token = Cookies.get("token");
    const role = Cookies.get("role");

    if (token && role) {
      navigate(role === "admin" ? "/admin/dashboard" : "/dashboard");
    } else {
      handleMicrosoftCallback();
    }
  }, [handleMicrosoftCallback, navigate]);

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