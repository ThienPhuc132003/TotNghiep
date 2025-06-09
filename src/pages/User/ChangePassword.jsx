import React, { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const validateFields = useCallback(() => {
    const errors = {};
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (password === "") {
      errors.password = "Vui lòng nhập mật khẩu mới";
    } else if (!passwordRegex.test(password)) {
      errors.password =
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt";
    }
    if (confirmPassword === "") {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    return errors;
  }, [password, confirmPassword]);

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
        setSuccessMessage("Mật khẩu đã được thay đổi thành công");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setErrorMessages({ password: "Có lỗi xảy ra, vui lòng thử lại" });
      }
    } catch (error) {
      setErrorMessages({ password: "Có lỗi xảy ra, vui lòng thử lại" });
    } finally {
      setIsSubmitting(false);
    }
  }, [password, confirmPassword, emailOrPhone, otp, validateFields, navigate]);

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
    navigate("/login");
  };

  return (
    <LoginLayout>
      <div className="form-container">
        {" "}
        <h1 className="FormName">Đổi mật khẩu</h1>
        <p className="description">Nhập mật khẩu mới cho tài khoản của bạn</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleChangePassword();
          }}
          className="form-box"
        >
          {" "}
          <InputField
            type="password"
            id="password"
            value={password}
            placeholder="Nhập mật khẩu mới"
            error={errorMessages.password}
            onChange={handlePasswordChange}
            className={`input-field ${errorMessages.password ? "error" : ""}`}
          />{" "}
          <InputField
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            placeholder="Xác nhận mật khẩu mới"
            error={errorMessages.confirmPassword}
            onChange={handleConfirmPasswordChange}
            className={`input-field ${
              errorMessages.confirmPassword ? "error" : ""
            }`}
          />
          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}
          <div className="submit-cancel">
            {" "}
            <Button className="submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi" : "Xác nhận"}
            </Button>
            <Button className="cancel" onClick={handleBackPage}>
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </LoginLayout>
  );
};

export default React.memo(ChangePasswordPage);
