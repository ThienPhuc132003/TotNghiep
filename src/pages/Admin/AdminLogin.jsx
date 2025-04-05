// src/pages/Admin/AdminLoginPage.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import Api from "../../network/Api"; // <-- Đường dẫn đúng
import { METHOD_TYPE } from "../../network/methodType"; // <-- Đường dẫn đúng
import { setAdminProfile } from "../../redux/adminSlice"; // <-- Đường dẫn đúng
import "../../assets/css/Admin/AdminLogin.style.css"; // <-- Đường dẫn đúng
import MicrosoftLogo from "../../assets/images/microsoft_logo.jpg"; // <-- Đường dẫn đúng
import LoginLayout from "../../components/User/layout/LoginLayout"; // <-- Đường dẫn đúng

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [emailOrPhoneNumber, setEmailOrPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingMicrosoftLogin, setIsLoadingMicrosoftLogin] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("admin_emailOrPhoneNumber");
    const savedPass = localStorage.getItem("admin_password");
    if (savedEmail && savedPass) {
      setEmailOrPhoneNumber(savedEmail);
      setPassword(savedPass);
      setRememberMe(true);
    }
  }, []);

  const validateFields = () => {
    const errors = {};
    if (!emailOrPhoneNumber) errors.emailOrPhoneNumber = "Email/SĐT chưa nhập";
    if (!password) errors.password = "Mật khẩu chưa nhập";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateFields();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await Api({
        endpoint: "admin/login",
        method: METHOD_TYPE.POST,
        data: { emailOrPhoneNumber, password },
      });

      if (response.success && response.data?.token) {
        const token = response.data.token;
        const cookieOptions = {
          expires: rememberMe ? 7 : undefined,
          secure: true,
          sameSite: "Lax",
        };
        Cookies.set("token", token, cookieOptions);
        Cookies.set("role", "admin", cookieOptions);

        if (rememberMe) {
          localStorage.setItem("admin_emailOrPhoneNumber", emailOrPhoneNumber);
          localStorage.setItem("admin_password", password);
        } else {
          localStorage.removeItem("admin_emailOrPhoneNumber");
          localStorage.removeItem("admin_password");
        }

        try {
          console.log("Admin Login: Fetching profile...");
          const adminInfoResponse = await Api({
            endpoint: "admin/get-profile",
            method: METHOD_TYPE.GET,
          });

          if (adminInfoResponse.success && adminInfoResponse.data) {
            if (adminInfoResponse.data.adminId) {
              // <<< KIỂM TRA adminId >>>
              console.log(
                "Admin Login: Profile received:",
                adminInfoResponse.data
              );
              dispatch(setAdminProfile(adminInfoResponse.data));
              console.log("Admin Login: Profile dispatched. Navigating...");
              navigate("/admin/dashboard");
            } else {
              console.error(
                "Admin Login: Fetched profile missing adminId:",
                adminInfoResponse.data
              );
              setErrorMessage("Dữ liệu quản trị viên không hợp lệ.");
              Cookies.remove("token");
              Cookies.remove("role");
            }
          } else {
            console.error(
              "Admin Login: Failed fetch profile:",
              adminInfoResponse.message
            );
            setErrorMessage("Đăng nhập OK, lỗi tải profile Admin.");
            Cookies.remove("token");
            Cookies.remove("role");
          }
        } catch (profileError) {
          console.error("Admin Login: Error fetching profile:", profileError);
          setErrorMessage(
            profileError.response?.data?.message ||
              "Lỗi mạng khi tải profile Admin."
          );
          Cookies.remove("token");
          Cookies.remove("role");
        }
      } else {
        setErrorMessage(response.message || "Tài khoản/mật khẩu Admin sai.");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      setErrorMessage(error.response?.data?.message || "Lỗi đăng nhập Admin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateRandomString = (length = 20) => {
    let result = "";
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++)
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  const handleMicrosoftLogin = async () => {
    setIsLoadingMicrosoftLogin(true);
    setErrorMessage("");
    try {
      const state = generateRandomString();
      Cookies.set("microsoft_auth_state", state, {
        secure: true,
        sameSite: "Lax",
        expires: 1 / 24 / 6,
      });
      const response = await Api({
        endpoint: "admin/auth/get-uri-microsoft",
        method: METHOD_TYPE.GET,
      });
      if (response.success && response.data?.authUrl) {
        const authUrl = `${response.data.authUrl}&state=${state}`;
        window.location.href = authUrl;
      } else {
        setErrorMessage(response.message || "Không thể lấy URI MS.");
        setIsLoadingMicrosoftLogin(false);
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Lỗi bắt đầu đăng nhập MS."
      );
      setIsLoadingMicrosoftLogin(false);
    }
  };

  return (
    <LoginLayout>
      <div className="admin-form">
        <h1 className="login-title">Quản lý GiaSuVLU</h1>
        <form className="form-above-container" onSubmit={handleSubmit}>
          <div className="login-form-container">
            <label htmlFor="emailOrPhoneNumber">Email/SĐT</label>
            <div
              className={`login-form-group ${
                fieldErrors.emailOrPhoneNumber ? "error" : ""
              }`}
            >
              <input
                type="text"
                id="emailOrPhoneNumber"
                value={emailOrPhoneNumber}
                onChange={(e) => setEmailOrPhoneNumber(e.target.value)}
                className={fieldErrors.emailOrPhoneNumber ? "error-border" : ""}
                aria-invalid={!!fieldErrors.emailOrPhoneNumber}
                aria-describedby={
                  fieldErrors.emailOrPhoneNumber ? "email-error" : undefined
                }
              />
              <i className="fa-regular fa-user"></i>
            </div>
            {fieldErrors.emailOrPhoneNumber && (
              <p id="email-error" className="error-message">
                {fieldErrors.emailOrPhoneNumber}
              </p>
            )}
          </div>
          <div className="login-form-container">
            <label htmlFor="password">Mật khẩu</label>
            <div
              className={`login-form-group ${
                fieldErrors.password ? "error" : ""
              }`}
            >
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldErrors.password ? "error-border" : ""}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={
                  fieldErrors.password ? "password-error" : undefined
                }
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ẩn" : "Hiện"}
              >
                <i
                  className={`fa-regular ${
                    showPassword ? "fa-eye-slash" : "fa-eye"
                  }`}
                ></i>
              </button>
            </div>
            {fieldErrors.password && (
              <p id="password-error" className="error-message">
                {fieldErrors.password}
              </p>
            )}
          </div>
          <div className="remember-me">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="checkbox-remember-me"
              />{" "}
              Nhớ mật khẩu
            </label>
          </div>
          {errorMessage && (
            <p className="error-message general-error">{errorMessage}</p>
          )}
          <button
            type="submit"
            className="admin-login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
          </button>
          <div className="divider">
            <span>hoặc</span>
          </div>
          <div className="social-login">
            <button
              type="button"
              onClick={handleMicrosoftLogin}
              className="microsoft-login-button"
              disabled={isLoadingMicrosoftLogin}
            >
              {isLoadingMicrosoftLogin ? (
                "Đang xử lý..."
              ) : (
                <>
                  <img src={MicrosoftLogo} alt="MS logo" /> Đăng nhập với
                  Microsoft
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </LoginLayout>
  );
};

export default AdminLoginPage;
