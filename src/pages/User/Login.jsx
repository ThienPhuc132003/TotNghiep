import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Api from "../../network/Api";
import LoginLayout from "../../components/User/layout/LoginLayout";
import { METHOD_TYPE } from "../../network/methodType";
import Cookies from "js-cookie";
import { setUserProfile } from "../../redux/userSlice";
import { useDispatch } from "react-redux";

const LoginPage = () => {
  const [emailOrPhoneNumber, setEmailOrPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validateFields = () => {
    const errors = {};
    if (!emailOrPhoneNumber) {
      errors.emailOrPhoneNumber = "Email or Phone Number is required";
    }
    if (!password) {
      errors.password = "Password is required";
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
    try {
      const responseLogin = await Api({
        endpoint: "user/login",
        method: METHOD_TYPE.POST,
        data: {
          emailOrPhoneNumber,
          password,
        },
      });
      const token = responseLogin.data.token;

      if (token) {
        Cookies.set("token", token);
        Cookies.set("role", "user");
        try {
          const responseGetProfile = await Api({
            endpoint: "user/get-profile",
            method: METHOD_TYPE.GET,
          });
          if (responseGetProfile.success === true) {
            dispatch(setUserProfile(responseGetProfile.data));
            console.log("dispath thanh cong tét", responseGetProfile.data);
          }
        } catch (error) {
          console.error("Login failed:", error);
        }
        navigate("/dashboard");
      } else {
        setErrorMessage("Login failed: Invalid credentials");
      }
    } catch (error) {
      setErrorMessage("Login failed: Invalid credentials");
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      // Gọi API để lấy URL xác thực Microsoft
      const response = await Api({
        endpoint: "user/auth/get-uri-microsoft",
        method: METHOD_TYPE.GET,
      });
      const authUrl = response.data.authUrl;

      if (authUrl) {
        // Chuyển hướng người dùng tới Microsoft login
        window.location.href = authUrl;
      } else {
        console.error("Microsoft Auth URL not found.");
      }
    } catch (error) {
      console.error("Error fetching Microsoft Auth URL:", error);
    }
  };

  return (
    <LoginLayout>
      <div className="login-form">
        <h1>Login</h1>
        <div className="social-login">
          <button
            onClick={handleMicrosoftLogin}
            className="microsoft-login-button"
          >
            Login with Microsoft
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="emailOrPhoneNumber">Email or Phone Number</label>
            <input
              type="text"
              id="emailOrPhoneNumber"
              name="emailOrPhoneNumber"
              value={emailOrPhoneNumber}
              onChange={(e) => setEmailOrPhoneNumber(e.target.value)}
              className={fieldErrors.emailOrPhoneNumber ? "error-border" : ""}
            />
            {fieldErrors.emailOrPhoneNumber && (
              <p className="error-message">{fieldErrors.emailOrPhoneNumber}</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldErrors.password ? "error-border" : ""}
            />
            {fieldErrors.password && (
              <p className="error-message">{fieldErrors.password}</p>
            )}
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        <div className="register-link">
          <p>
            Dont have an account? <Link to="/register">Register</Link>
          </p>
          <p>
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>
        </div>
       
      </div>
    </LoginLayout>
  );
};

const Login = React.memo(LoginPage);
export default Login;
