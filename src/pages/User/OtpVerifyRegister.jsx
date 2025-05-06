import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LoginLayout from "../../components/User/layout/LoginLayout";
import Button from "../../components/Button"; // Component Button submit chính
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import "../../assets/css/ForgotPasswordFlow.style.css"; // Đảm bảo import đúng CSS
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OtpVerifyRegisterPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errorMessages, setErrorMessages] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};
  const otpInputRefs = useRef([]);

  // useEffect cho timer (giữ nguyên)
  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // validateFields (giữ nguyên)
  const validateFields = useCallback(() => {
    const errors = {};
    if (otp.some((digit) => digit === "")) {
      errors.otp = "Vui lòng nhập đầy đủ mã OTP.";
    } else if (otp.join("").length !== 6) {
      errors.otp = "Mã OTP phải có 6 chữ số.";
    }
    return errors;
  }, [otp]);

  // handleOtpVerification (giữ nguyên logic)
  const handleOtpVerification = useCallback(async () => {
    const errors = validateFields();
    setErrorMessages(errors);
    if (Object.keys(errors).length > 0) return;
    setIsSubmitting(true);
    setErrorMessages({});
    try {
      const combinedOtp = otp.join("");
      const response = await Api({
        endpoint: "user/register",
        method: METHOD_TYPE.POST,
        data: { email, otp: combinedOtp },
      });
      if (response.success === true) {
        toast.success("Xác thực thành công!");
        setTimeout(() => {
          navigate("/login", { state: { registrationSuccess: true } });
        }, 1500);
      } else {
        setErrorMessages({
          otp: response.message || "Mã OTP không hợp lệ hoặc đã hết hạn.",
        });
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Đã có lỗi xảy ra trong quá trình xác thực.";
      setErrorMessages({ otp: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  }, [otp, email, validateFields, navigate]);

  // handleOtpChange (giữ nguyên)
  const handleOtpChange = (index) => (e) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
    if (errorMessages.otp) setErrorMessages({});
  };

  // handleKeyDown (giữ nguyên)
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

  // handleResendOtp (giữ nguyên logic)
  const handleResendOtp = useCallback(async () => {
    if (resendTimer > 0 || isResending) return; // Thêm kiểm tra isResending
    setIsResending(true);
    setErrorMessages({});
    try {
      const response = await Api({
        endpoint: "user/resend-otp",
        method: METHOD_TYPE.POST,
        data: { email },
      });
      if (response.success === true) {
        setResendTimer(60);
        toast.info("Mã OTP mới đã được gửi lại.");
      } else {
        setErrorMessages({
          otp: response.message || "Lỗi khi gửi lại mã OTP.",
        });
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Lỗi kết nối khi gửi lại mã OTP.";
      setErrorMessages({ otp: errorMessage });
    } finally {
      setIsResending(false);
    }
  }, [email, resendTimer, isResending]); // Thêm isResending dependency

  // handleBackPage (giữ nguyên)
  const handleBackPage = useCallback(() => {
    navigate("/register");
  }, [navigate]);

  // useEffect focus (giữ nguyên)
  useEffect(() => {
    if (otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }
  }, []);

  // --- PHẦN JSX ---
  return (
    <LoginLayout>
      <div className="form-container otp-verify-container">
        <h1 className="FormName">Xác thực OTP</h1>
        {email ? (
          <p className="description">
            Mã xác thực gồm 6 chữ số đã được gửi đến email{" "}
            <strong>{email}</strong>.
            <br /> Vui lòng kiểm tra hộp thư đến (và cả thư mục spam).
          </p>
        ) : (
          <p className="description error-message">
            Không tìm thấy địa chỉ email. Vui lòng quay lại trang đăng ký.
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleOtpVerification();
          }}
          className="form-box"
        >
          {/* <label htmlFor="otp">Mã OTP</label> */}
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="tel"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength="1"
                value={digit}
                onChange={handleOtpChange(index)}
                onKeyDown={handleKeyDown(index)}
                ref={(el) => (otpInputRefs.current[index] = el)}
                className={`input-field otp-input ${
                  errorMessages.otp ? "error-border" : ""
                }`}
                aria-label={`OTP digit ${index + 1}`}
                disabled={!email}
              />
            ))}
          </div>

          {errorMessages.otp && (
            <p className="error-message otp-error">{errorMessages.otp}</p>
          )}

          <div className="submit-cancel">
            <div className="submite-field">
              <Button
                type="submit"
                className="submit" // Giả sử class này đã có style nút submit
                onClick={handleOtpVerification} // Có thể cần hoặc không tùy component Button
                disabled={isSubmitting || !email || otp.some((d) => d === "")}
              >
                {isSubmitting ? "Đang xác thực..." : "Xác nhận"}
              </Button>
            </div>

            <div className="resend-box">
              <span>Không nhận được mã? </span>
              {/* *** HOÀN NGUYÊN THẺ <p> VÀ CLASS 'resend' *** */}
              <p
                className={`resend ${
                  // Sử dụng lại class 'resend'
                  resendTimer > 0 || isResending ? "disabled" : "" // Giữ logic class 'disabled'
                }`}
                onClick={
                  !(resendTimer > 0 || isResending || !email)
                    ? handleResendOtp
                    : undefined
                } // Chỉ thêm onClick khi không disabled
                // Không dùng prop 'disabled' cho thẻ <p>
                style={{
                  display: "inline",
                  cursor:
                    resendTimer > 0 || isResending || !email
                      ? "not-allowed"
                      : "pointer",
                }} // Thêm style inline để đảm bảo cursor
                aria-disabled={resendTimer > 0 || isResending || !email} // Thuộc tính ARIA cho accessibility
              >
                {isResending
                  ? "Đang gửi..."
                  : resendTimer > 0
                  ? `Gửi lại sau (${resendTimer}s)`
                  : "Gửi lại mã"}
              </p>
            </div>

            {/* *** HOÀN NGUYÊN THẺ <p> VÀ CLASS 'cancel' *** */}
            <p className="cancel" onClick={handleBackPage}>
              {" "}
              {/* Sử dụng lại class 'cancel' */}
              <i className="fa-solid fa-arrow-left"></i>
              <span>Quay lại trang đăng ký</span>
            </p>
          </div>
        </form>
      </div>
      {/* <ToastContainer /> */}
    </LoginLayout>
  );
};

export default React.memo(OtpVerifyRegisterPage);
