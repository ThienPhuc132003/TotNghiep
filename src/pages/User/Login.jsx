import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../network/Api";
import LoginLayout from "../../components/User/layout/LoginLayout";
import { METHOD_TYPE } from "../../network/methodType";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { setUserProfile } from "../../redux/userSlice";
import "../../assets/css/LoginLayout.style.css";

const LoginPage = () => {
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
      errors.emailOrPhoneNumber =
        "Email hoặc số điện thoại không được để trống.";
    }
    if (!password) {
      errors.password = "Mật khẩu không được để trống.";
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
          const userInfoResponse = await Api({
            endpoint: "user/get-profile",
            method: METHOD_TYPE.GET,
            token,
          });
          if (userInfoResponse.success === true) {
            dispatch(setUserProfile(userInfoResponse.data));
            navigate("/dashboard");
          }
        } catch (error) {
          setErrorMessage("Đăng nhập thất bại: Thông tin không hợp lệ.");
        }
      } else {
        setErrorMessage("Đăng nhập thất bại: Thông tin không hợp lệ.");
      }
    } catch (error) {
      setErrorMessage("Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.");
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
        window.location.href = `${authUrl}&state=user`;
      } else {
        setErrorMessage("Microsoft Auth URL not found.");
      }
    } catch (error) {
      setErrorMessage("Error fetching Microsoft Auth URL.");
      console.error("Error:", error);
    }
  };

  return (
    <LoginLayout>
      <div className="login-form">
        <h1 className="login-title">Đăng nhập </h1>
        <div className="social-login">
          <button
            onClick={handleMicrosoftLogin}
            className="microsoft-login-button"
          >
            <i className="fab fa-microsoft fa-xl"></i>Login with Microsoft
          </button>
        </div>
        <div className="divider">
          <span>hoặc</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="login-form-container">
            <label htmlFor="emailOrPhoneNumber">Email hoặc số điện thoại</label>
            <div className="login-form-group">
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
              {fieldErrors.emailOrPhoneNumber && (
                <p className="error-message">
                  {fieldErrors.emailOrPhoneNumber}
                </p>
              )}
            </div>
          </div>
          <div className="login-form-container">
            <label htmlFor="password">Password</label>
            <div className="login-form-group">
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
              Remember Me
            </label>
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button
            type="submit"
            className="login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </LoginLayout>
  );
};

const Login = React.memo(LoginPage);
export default Login;
