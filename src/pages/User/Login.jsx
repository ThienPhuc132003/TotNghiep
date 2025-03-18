import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Api from "../../network/Api";
import LoginLayout from "../../components/User/layout/LoginLayout";
import { METHOD_TYPE } from "../../network/methodType";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { setAdminProfile } from "../../redux/adminSlice";
import "../../assets/css/LoginLayout.style.css";
import MicrosoftLogo from "../../assets/images/microsoft_logo.jpg";
const SigninPageComponent = () => {
  const [emailOrPhoneNumber, setEmailOrPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const savedEmailOrPhoneNumber = localStorage.getItem("emailOrPhoneNumber");
    const savedPassword = localStorage.getItem("password");
    if (savedEmailOrPhoneNumber && savedPassword) {
      setEmailOrPhoneNumber(savedEmailOrPhoneNumber);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const validateFields = () => {
    const errors = {};
    if (!emailOrPhoneNumber) {
      errors.emailOrPhoneNumber = "Email hoặc số điện thoại chưa được nhập";
    }
    if (!password) {
      errors.password = "Mật khẩu chưa được nhập";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateFields();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await Api({
        endpoint: "user/login",
        method: METHOD_TYPE.POST,
        data: {
          emailOrPhoneNumber,
          password,
        },
      });
      const token = response.data.token;
      console.log("Token:", token);
      if (token) {
        Cookies.set("token", token, { expires: rememberMe ? 7 : undefined });
        Cookies.set("role", "user");

        if (rememberMe) {
          localStorage.setItem("emailOrPhoneNumber", emailOrPhoneNumber);
          localStorage.setItem("password", password);
        } else {
          localStorage.removeItem("emailOrPhoneNumber");
          localStorage.removeItem("password");
        }

        try {
          const adminInfoResponse = await Api({
            endpoint: "user/get-profile",
            method: METHOD_TYPE.GET,
            token,
          });
          if (adminInfoResponse.success === true) {
            dispatch(setAdminProfile(adminInfoResponse.data));
            navigate("/dashboard");
          }
        } catch (error) {
          setErrorMessage("Tài khoản hoặc mật khẩu không đúng");
        }
      } else {
        setErrorMessage("Tài khoản hoặc mật khẩu không đúng");
      }
    } catch (error) {
      setErrorMessage("Tài khoản hoặc mật khẩu không đúng");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      const response = await Api({
        endpoint: "user/auth/get-uri-microsoft",
        method: METHOD_TYPE.GET,
      });
      const authUrl = response.data.authUrl;

      if (authUrl) {
        window.location.href = authUrl;
      }
    } finally {
      // No error handling needed
    }
  };

  return (
    <LoginLayout>
      <div className="login-form">
        <h1 className="login-title">Đăng nhập GiaSuVLU</h1>
        <form className="form-above-container" onSubmit={handleSubmit}>
          <div className="login-form-container">
            <label htmlFor="emailOrPhoneNumber">Email hoặc số điện thoại</label>
            <div
              className={`login-form-group ${
                fieldErrors.emailOrPhoneNumber ? "error" : ""
              }`}
            >
              <input
                type="text"
                id="emailOrPhoneNumber"
                name="emailOrPhoneNumber"
                value={emailOrPhoneNumber}
                placeholder="nhập email hoặc số điện thoại"
                onChange={(e) => setEmailOrPhoneNumber(e.target.value)}
                className={fieldErrors.emailOrPhoneNumber ? "error-border" : ""}
              />
              <i className="fa-regular fa-user"></i>
            </div>
            {fieldErrors.emailOrPhoneNumber && (
              <p className="error-message">{fieldErrors.emailOrPhoneNumber}</p>
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
                name="password"
                value={password}
                placeholder="nhập mật khẩu"
                onChange={(e) => setPassword(e.target.value)}
                className={fieldErrors.password ? "error-border" : ""}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <i className="fa-regular fa-eye-slash"></i>
                ) : (
                  <i className="fa-regular fa-eye"></i>
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="error-message">{fieldErrors.password}</p>
            )}
          </div>
          <div className="remember-me">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="checkbox-remember-me"
              />
              Nhớ mật khẩu
            </label>
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button
            type="submit"
            className="login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang xử lý" : "Đăng nhập"}
          </button>
          <div className="divider">
            <span>hoặc</span>
          </div>
          <div className="social-login">
            <button
              onClick={handleMicrosoftLogin}
              className="microsoft-login-button"
            >
              <img src={MicrosoftLogo} alt="" />
              Đăng nhập với Microsoft
            </button>
          </div>
        </form>
        <div className="forgot-password-link">
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </div>
        <div className="register-link">
          <p>
            Không có tài khoản? <Link to="/register">Đăng ký</Link>
          </p>
        </div>
      </div>
    </LoginLayout>
  );
};

const SigninPage = React.memo(SigninPageComponent);
export default SigninPage;
