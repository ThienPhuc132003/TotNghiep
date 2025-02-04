import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoginLayout from "../../components/User/layout/LoginLayout";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import "../../assets/css/FormFields.style.css";

const OtpVerifyPage = () => {
  const [otp, setOtp] = useState("");
  const [errorMessages, setErrorMessages] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { emailOrPhone } = location.state || {};
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const validateFields = useCallback(() => {
    const errors = {};
    if (otp === "") {
      errors.otp = t("login.emptyOtp");
    }
    return errors;
  }, [otp, t]);

  const handleOtpVerification = useCallback(async () => {
    const errors = validateFields();
    setErrorMessages(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await Api({
        endpoint: "user/verify-otp",
        method: METHOD_TYPE.POST,
        data: { otp: otp, email: emailOrPhone },
      });
      if (response.success === true) {
        localStorage.setItem("otpVerified", "true");
        setSuccessMessage(t("login.otpVerified"));
        setTimeout(() => navigate("/change-password", { state: { emailOrPhone, otp } }), 2000);
      } else {
        setErrorMessages({ otp: t("login.invalidOtp") });
      }
    } catch (error) {
      setErrorMessages({ otp: t("login.error") });
    } finally {
      setIsSubmitting(false);
    }
  }, [otp, emailOrPhone, validateFields, navigate, t]);

  const handleOtpChange = useCallback(
    (e) => {
      const value = e.target.value;
      setOtp(value);
      if (errorMessages.otp) {
        setErrorMessages((prevErrors) => ({
          ...prevErrors,
          otp: "",
        }));
      }
    },
    [errorMessages.otp]
  );

  const handleResendOtp = useCallback(async () => {
    setIsResending(true);
    try {
      const response = await Api({
        endpoint: "user/resend-otp",
        method: METHOD_TYPE.POST,
        data: { email: emailOrPhone },
      });
      if (response.success === true) {
        setResendTimer(60);
        setSuccessMessage(t("login.otpResent"));
      } else {
        setErrorMessages({ otp: t("login.errorResendingOtp") });
      }
    } catch (error) {
      setErrorMessages({ otp: t("login.errorResendingOtp") });
    } finally {
      setIsResending(false);
    }
  }, [emailOrPhone, t]);

  const handleBackPage = useCallback(() => {
    navigate("/forgot-password");
  }, [navigate]);

  return (
    <LoginLayout>
      <div className="form-container">
        <h1 className="FormName">{t("login.otpVerifyTitle")}</h1>
        <p className="description">{t("login.otpVerifySubtitle")}</p>
        <InputField
          type="text"
          id="otp"
          value={otp}
          placeholder={t("login.otpPlaceholder")}
          errorMessage={errorMessages.otp}
          onChange={handleOtpChange}
          className={errorMessages.otp ? "error-border" : "correct-border"}
        />
        {errorMessages.otp && (
          <p className="error-message">{errorMessages.otp}</p>
        )}
        {successMessage && (
          <p className="success-message">{successMessage}</p>
        )}
        <div className="submit-cancel">
          <Button className="submit" onClick={handleOtpVerification} disabled={isSubmitting}>
            {isSubmitting ? t("common.sending") : t("common.confirm")}
          </Button>
          <Button className="cancel" onClick={handleBackPage}>
            {t("common.cancel")}
          </Button>
        </div>
        <div className="resend-otp">
          <Button className="resend" onClick={handleResendOtp} disabled={resendTimer > 0 || isResending}>
            {resendTimer > 0 ? `${t("login.resendOtp")} (${resendTimer}s)` : t("login.resendOtp")}
          </Button>
        </div>
      </div>
    </LoginLayout>
  );
};

export default React.memo(OtpVerifyPage);