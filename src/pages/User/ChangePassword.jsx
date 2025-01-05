import React, { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoginLayout from "../../components/User/layout/LoginLayout";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import LanguageSelector from "../../components/LanguageSelector";
import "../../assets/css/ChangePassword.style.css";

const ChangePasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessages, setErrorMessages] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { emailOrPhone, otp } = location.state || {};
  const { t } = useTranslation();

  const validateFields = useCallback(() => {
    const errors = {};
    if (password === "") {
      errors.password = t("login.emptyNewPassword");
    }
    if (confirmPassword === "") {
      errors.confirmPassword = t("login.emptyConfirmPassword");
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = t("login.passwordNotMatch");
    }
    return errors;
  }, [password, confirmPassword, t]);

  const handleChangePassword = useCallback(async () => {
    const errors = validateFields();
    setErrorMessages(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    try {
      const response = await Api({
        endpoint: "user/reset-password",
        method: METHOD_TYPE.POST,
        data: {
          email: emailOrPhone,
          otp: otp,
          newPassword: password,
          confirmPassword: confirmPassword,
        },
      });
      if (response.success === true) {
        localStorage.removeItem("otpVerified", "true");
        navigate("/login");
      } else {
        setErrorMessages({ password: t("login.error") });
      }
    } catch (error) {
      setErrorMessages({ password: t("login.error") });
    }
  }, [password, confirmPassword, emailOrPhone, otp, validateFields, navigate, t]);

  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value);
  }, []);

  const handleConfirmPasswordChange = useCallback((e) => {
    setConfirmPassword(e.target.value);
  }, []);

  const handleBackPage = () => {
    navigate("/otp-verify");
  };

  return (
    <LoginLayout>
      <div className="change-password-form">
        <div className="language-box">
          <LanguageSelector />
        </div>
        <h1 className="FormName">{t("login.changePasswordTitle")}</h1>
        <p className="description">{t("login.changePasswordSubtitle")}</p>
        <InputField
          type="password"
          id="password"
          value={password}
          placeholder={t("login.newPasswordPlaceholder")}
          errorMessage={errorMessages.password}
          onChange={handlePasswordChange}
          className={errorMessages.password ? "error-border" : "correct-border"}
        />
        <InputField
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          placeholder={t("login.confirmPasswordPlaceholder")}
          errorMessage={errorMessages.confirmPassword}
          onChange={handleConfirmPasswordChange}
          className={errorMessages.confirmPassword ? "error-border" : "correct-border"}
        />
        <p className="error">{errorMessages.password}</p>
        <p className="error">{errorMessages.confirmPassword}</p>
        <div className="submit-cancel">
          <Button className="submit" onClick={handleChangePassword}>
            {t("common.confirm")}
          </Button>
          <Button className="cancel" onClick={handleBackPage}>
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    </LoginLayout>
  );
};

export default React.memo(ChangePasswordPage);