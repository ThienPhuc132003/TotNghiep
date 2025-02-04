import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import LoginLayout from "../../components/User/layout/LoginLayout";
import "../../assets/css/FormFields.style.css";

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
      } else {
        setErrorMessages({ email: t("login.emailNotFound") });
      }
    } catch (error) {
      setErrorMessages({ email: t("login.error") });
    } finally {
      setIsSubmitting(false);
    }
  }, [emailOrPhone, validateFields, t]);

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
        <InputField
          type="email"
          id="email"
          value={emailOrPhone}
          placeholder={t("login.emailOrPhonePlaceholder")}
          errorMessage={errorMessages.email}
          onChange={handleEmailChange}
          className={errorMessages.email ? "error-border" : "correct-border"}
        />
        {errorMessages.email && (
          <p className="error-message">{errorMessages.email}</p>
        )}
        {successMessage && (
          <p className="success-message">{successMessage}</p>
        )}
        <div className="submit-cancel">
          <Button className="submit" onClick={handleForgotPassword} disabled={isSubmitting}>
            {isSubmitting ? t("common.sending") : t("common.confirm")}
          </Button>
          <Button className="cancel" onClick={handleBackPage}>
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    </LoginLayout>
  );
};

export default React.memo(ForgotPasswordPage);