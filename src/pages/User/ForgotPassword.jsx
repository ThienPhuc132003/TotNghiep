import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import LoginLayout from "../../components/User/layout/LoginLayout";
import "../../assets/css/ForgotPasswordFlow.style.css";

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [errorMessages, setErrorMessages] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateFields = useCallback(() => {
    const errors = {};
    if (!emailOrPhone) {
      errors.email = t("login.emptyEmail");
    }
    return errors;
  }, [emailOrPhone, t]);

  const handleForgotPassword = useCallback(async () => {
    const errors = validateFields();
    setErrorMessages(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await Api({
        endpoint: "user/forgot-password",
        method: METHOD_TYPE.POST,
        data: { emailOrPhoneNumber: emailOrPhone },
      });
      if (response.success === true) {
        setSuccessMessage(t("login.resetLinkSent"));
        navigate("/otp-verify", { state: { emailOrPhone } });
      } else {
        setErrorMessages({ email: t("login.emailNotFound") });
      }
    } catch (error) {
      setErrorMessages({ email: t("login.error") });
    } finally {
      setIsSubmitting(false);
    }
  }, [emailOrPhone, validateFields, t, navigate]);

  const handleEmailChange = useCallback(
    (e) => {
      const value = e.target.value;
      setEmailOrPhone(value);
      if (errorMessages.email) {
        setErrorMessages((prevErrors) => ({
          ...prevErrors,
          email: "",
        }));
      }
    },
    [errorMessages.email]
  );

  const handleBackPage = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  return (
    <LoginLayout>
      <div className="form-container">
        <h1 className="FormName">{t("login.forgotPasswordTitle")}</h1>
        <p className="description">{t("login.forgotPasswordSubtitle")}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleForgotPassword();
          }}
          className="form-box"
        >
          <div className="form-container">
            <label htmlFor="emailOrPhone">
              {t("login.emailOrPhoneNumber")}
            </label>
            <InputField
              type="email"
              id="email"
              value={emailOrPhone}
              placeholder={t("login.emailOrPhonePlaceholder")}
              errorMessage={errorMessages.email}
              onChange={handleEmailChange}
              className={`input-field ${
                errorMessages.email ? "error-message" : ""
              }`}
            />
            {errorMessages.email && (
              <p className="error-message">{errorMessages.email}</p>
            )}
          </div>
          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}
          <div className="submit-cancel">
            <div className="submite-field">
              <Button className="submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang xác nhận" : t("common.confirm")}
              </Button>
            </div>
            <p className="cancel" onClick={handleBackPage}>
              <i className="fa-solid fa-arrow-left"></i>
              Quay về trang đăng nhập
            </p>
          </div>
        </form>
      </div>
    </LoginLayout>
  );
};

export default React.memo(ForgotPasswordPage);
