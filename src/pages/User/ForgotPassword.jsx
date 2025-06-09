import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import LoginLayout from "../../components/User/layout/LoginLayout";
import "../../assets/css/ForgotPasswordFlow.style.css";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [errorMessages, setErrorMessages] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const validateFields = useCallback(() => {
    const errors = {};
    if (!emailOrPhone) {
      errors.email = "Vui lòng nhập email hoặc số điện thoại";
    }
    return errors;
  }, [emailOrPhone]);

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
        setSuccessMessage("Liên kết đặt lại mật khẩu đã được gửi");
        navigate("/otp-verify", { state: { emailOrPhone } });
      } else {
        setErrorMessages({ email: "Email hoặc số điện thoại không tồn tại" });
      }
    } catch (error) {
      setErrorMessages({ email: "Có lỗi xảy ra, vui lòng thử lại" });
    } finally {
      setIsSubmitting(false);
    }
  }, [emailOrPhone, validateFields, navigate]);

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
        {" "}
        <h1 className="FormName">Quên mật khẩu</h1>
        <p className="description">
          Nhập email hoặc số điện thoại để nhận mã xác thực
        </p>{" "}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleForgotPassword();
          }}
          className="form-box"
        >
          {" "}
          <label htmlFor="emailOrPhone">Email hoặc số điện thoại</label>
          <InputField
            type="email"
            id="email"
            value={emailOrPhone}
            placeholder="Nhập email hoặc số điện thoại"
            errorMessage={errorMessages.email}
            onChange={handleEmailChange}
            className={`input-field ${errorMessages.email ? "error" : ""}`}
          />
          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}
          <div className="submit-cancel">
            {" "}
            <Button className="submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang xác nhận" : "Xác nhận"}
            </Button>
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
