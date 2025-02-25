import React, { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoginLayout from "../../components/User/layout/LoginLayout";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import "../../assets/css/ForgotPasswordFlow.style.css";

const ChangePasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessages, setErrorMessages] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { emailOrPhone, otp } = location.state || {};
  const { t } = useTranslation();

  const validateFields = useCallback(() => {
    const errors = {};
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (password === "") {
      errors.password = t("login.emptyNewPassword");
    } else if (!passwordRegex.test(password)) {
      errors.password = t("login.invalidPassword");
    }
    if (confirmPassword === "") {
      errors.confirmPassword = t("login.emptyConfirmPassword");
    } else if (password !== confirmPassword) {
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
    setIsSubmitting(true);
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
        localStorage.removeItem("otpVerified");
        setSuccessMessage(t("login.passwordChanged"));
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setErrorMessages({ password: t("login.error") });
      }
    } catch (error) {
      setErrorMessages({ password: t("login.error") });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    password,
    confirmPassword,
    emailOrPhone,
    otp,
    validateFields,
    navigate,
    t,
  ]);

  const handlePasswordChange = useCallback(
    (e) => {
      setPassword(e.target.value);
      if (errorMessages.password) {
        setErrorMessages((prevErrors) => ({
          ...prevErrors,
          password: "",
        }));
      }
    },
    [errorMessages.password]
  );

  const handleConfirmPasswordChange = useCallback(
    (e) => {
      setConfirmPassword(e.target.value);
      if (errorMessages.confirmPassword) {
        setErrorMessages((prevErrors) => ({
          ...prevErrors,
          confirmPassword: "",
        }));
      }
    },
    [errorMessages.confirmPassword]
  );

  const handleBackPage = () => {
    navigate("/otp-verify");
  };

  return (
    <LoginLayout>
      <div className="form-container">
        <h1 className="FormName">{t("login.changePasswordTitle")}</h1>
        <p className="description">{t("login.changePasswordSubtitle")}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleChangePassword();
          }}
          className="form-box"
        >
          <InputField
            type="password"
            id="password"
            value={password}
            placeholder={t("login.newPasswordPlaceholder")}
            errorMessage={errorMessages.password}
            onChange={handlePasswordChange}
            className={`input-field ${
              errorMessages.password ? "error-message" : ""
            }`}
          />
          <InputField
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            placeholder={t("login.confirmPasswordPlaceholder")}
            errorMessage={errorMessages.confirmPassword}
            onChange={handleConfirmPasswordChange}
            className={`input-field ${
              errorMessages.confirmPassword ? "error-message" : ""
            }`}
          />
          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}
          <div className="submit-cancel">
            <Button className="submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("common.sending") : t("common.confirm")}
            </Button>
            <Button className="cancel" onClick={handleBackPage}>
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </div>
    </LoginLayout>
  );
};

export default React.memo(ChangePasswordPage);
