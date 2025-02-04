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

  // Xác định role dựa vào URL
  const getRoleFromPath = () => {
    if (window.location.pathname.includes("/admin/login")) return "admin";
    if (window.location.pathname.includes("/login")) return "user";
    return null;
  };

  const handleMicrosoftCallback = useCallback(async () => {
    try {
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      const code = params.get("code");
      const role = getRoleFromPath();
  
      if (!code || !role) {
        setErrorMessage("Thiếu mã xác thực hoặc không xác định được vai trò.");
        return navigate("/login");
      }
  
      const apiUrl =
        role === "admin"
          ? "https://giasuvlu.click/api/admin/auth/callback"
          : "https://giasuvlu.click/api/user/auth/callback";
  
      const response = await Api({
        endpoint: apiUrl,
        method: METHOD_TYPE.POST,
        data: { code },
      });
  
      const { token } = response.data; // Xóa userId & adminId nếu không dùng
  
      if (!token) {
        setErrorMessage("Không nhận được token từ máy chủ.");
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
        setErrorMessage("Lỗi khi lấy thông tin tài khoản.");
      }
    } catch (error) {
      setErrorMessage("Đã xảy ra lỗi khi xác thực.");
      console.error("Lỗi xác thực Microsoft:", error);
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
