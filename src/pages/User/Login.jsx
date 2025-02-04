import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Api from "../../network/Api";
import LoginLayout from "../../components/User/layout/LoginLayout";
import { METHOD_TYPE } from "../../network/methodType";
import Cookies from "js-cookie";
import { setUserProfile } from "../../redux/userSlice";
import { useDispatch } from "react-redux";
// import LanguageSelector from "../../components/LanguageSelector";

const LoginPage = () => {
  const { t } = useTranslation();
  const [emailOrPhoneNumber, setEmailOrPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validateFields = () => {
    const errors = {};
    if (!emailOrPhoneNumber) {
      errors.emailOrPhoneNumber = t("login.emptyEmail");
    }
    if (!password) {
      errors.password = t("login.emptyPassword");
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
          }
        } catch (error) {
          console.error("Login failed:", error);
        }
        navigate("/dashboard");
      } else {
        setErrorMessage(t("login.invalidCredentials"));
      }
    } catch (error) {
      setErrorMessage(t("login.invalidCredentials"));
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

        <h1>{t("login.title")}</h1>

        <div className="social-login">
          <button
            onClick={handleMicrosoftLogin}
            className="microsoft-login-button"
          >

            <i className="fab fa-microsoft"></i>
            {t("login.loginWithMicrosoft")}

          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="emailOrPhoneNumber">{t("login.emailOrPhoneNumber")}</label>
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
            <label htmlFor="password">{t("login.password")}</label>
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
            {t("login.loginButton")}
          </button>
        </form>
        <div className="register-link">
          <p>
            {t("login.dontHaveAccount")} <Link to="/register">{t("common.register")}</Link>
          </p>
          <p>
            <Link to="/forgot-password">{t("login.forgotPasswordLink")}</Link>
          </p>
        </div>


      </div>
    </LoginLayout>
  );
};

const Login = React.memo(LoginPage);
export default Login;
