import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
      errors.otp = "Vui lòng nhập mã OTP";
    }
    return errors;
  }, [otp]);

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
        setSuccessMessage("Đăng ký thành công");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setErrorMessages({ otp: "Mã OTP không hợp lệ" });
      }
    } catch (error) {
      setErrorMessages({ otp: "Đã có lỗi xảy ra" });
    } finally {
      setIsSubmitting(false);
    }
  }, [otp, email, validateFields, navigate]);

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
        setSuccessMessage("Mã OTP đã được gửi lại");
      } else {
        setErrorMessages({ otp: "Lỗi khi gửi lại mã OTP" });
      }
    } catch (error) {
      setErrorMessages({ otp: "Lỗi khi gửi lại mã OTP" });
    } finally {
      setIsResending(false);
    }
  }, [email]);

  const handleBackPage = useCallback(() => {
    navigate("/register");
  }, [navigate]);

  return (
    <LoginLayout>
      <div className="form-container">
        <h1 className="FormName">Xác thực OTP</h1>
        <p className="description">
          Vui lòng nhập mã OTP đã được gửi đến email của bạn
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleOtpVerification();
          }}
          className="form-box"
        >
          <label htmlFor="otp">Mã OTP</label>
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
                {isSubmitting ? "Đang gửi" : "Xác nhận"}
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
