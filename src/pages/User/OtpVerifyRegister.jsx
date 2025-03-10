import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoginLayout from "../../components/User/layout/LoginLayout";
import Button from "../../components/Button";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import "../../assets/css/ForgotPasswordFlow.style.css";

const OtpVerifyRegisterPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errorMessages, setErrorMessages] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};
  const { t } = useTranslation();
  const otpInputRefs = useRef([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const validateFields = useCallback(() => {
    const errors = {};
    if (otp.some((digit) => digit === "")) {
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
      const combinedOtp = otp.join(""); // Combine the OTP digits
      const response = await Api({
        endpoint: "user/register",
        method: METHOD_TYPE.POST,
        data: { email, otp: combinedOtp },
      });
      if (response.success === true) {
        setSuccessMessage(t("login.otpVerified"));
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setErrorMessages({ otp: t("login.invalidOtp") });
      }
    } catch (error) {
      setErrorMessages({ otp: t("login.error") });
    } finally {
      setIsSubmitting(false);
    }
  }, [otp, email, validateFields, navigate, t]);

  const handleOtpChange = (index) => (e) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(0, 1);
    setOtp(newOtp);

    if (value && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index) => (e) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0 &&
      otpInputRefs.current[index - 1]
    ) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handleResendOtp = useCallback(async () => {
    setIsResending(true);
    try {
      const response = await Api({
        endpoint: "user/resend-otp",
        method: METHOD_TYPE.POST,
        data: { email },
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
  }, [email, t]);

  const handleBackPage = useCallback(() => {
    navigate("/register");
  }, [navigate]);

  return (
    <LoginLayout>
      <div className="form-container">
        <h1 className="FormName">{t("login.otpVerifyTitle")}</h1>
        <p className="description">{t("login.otpVerifySubtitle")}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleOtpVerification();
          }}
          className="form-box"
        >
          <label htmlFor="otp">{t("login.otpPlaceholder")}</label>
          <div className="otp-inputs">
            {Array(6)
              .fill()
              .map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={otp[index]}
                  onChange={handleOtpChange(index)}
                  onKeyDown={handleKeyDown(index)}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  className="input-field"
                  style={{
                    width: "3rem",
                    height: "3rem",
                    textAlign: "center",
                    fontSize: "1.5rem",
                  }}
                />
              ))}
          </div>
          {errorMessages.otp && (
            <p className="error-message">{errorMessages.otp}</p>
          )}
          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}
          <div className="submit-cancel">
            <div className="submite-field">
              <Button
                className="submit"
                onClick={handleOtpVerification}
                disabled={isSubmitting}
              >
                {isSubmitting ? t("common.sending") : t("common.confirm")}
              </Button>
            </div>
            <div className="resend-box">
              <span>Không nhận được otp? </span>
              <p
                className={`resend ${
                  resendTimer > 0 || isResending ? "disabled" : ""
                }`}
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || isResending}
              >
                {resendTimer > 0 ? `gửi lại (${resendTimer}s)` : "gửi lại"}
              </p>
            </div>
            <p className="cancel" onClick={handleBackPage}>
              <i className="fa-solid fa-arrow-left"></i>
              Quay về trang đăng ký
            </p>
          </div>
        </form>
      </div>
    </LoginLayout>
  );
};

export default React.memo(OtpVerifyRegisterPage);
