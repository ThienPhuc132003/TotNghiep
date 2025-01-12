import React, { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoginLayout from "../../components/User/layout/LoginLayout";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import "../../assets/css/OtpVerify.style.css";
// import LanguageSelector from "../../components/LanguageSelector";
const OtpVerifyPage = () => {
  const [otp, setOtp] = useState("");
  const [errorMessages, setErrorMessages] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { emailOrPhone } = location.state || {};
  const { t } = useTranslation();

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
    try {
      const response = await Api({
        endpoint: "user/verify-otp",
        method: METHOD_TYPE.POST,
        data: { otp: otp, email: emailOrPhone },
      });
      if (response.success === true) {
        localStorage.setItem("otpVerified", "true");
        navigate("/change-password", { state: { emailOrPhone, otp } });
      } else {
        setErrorMessages({ otp: t("login.invalidOtp") });
      }
    } catch (error) {
      setErrorMessages({ otp: t("login.error") });
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

  const handleBackPage = useCallback(() => {
    navigate("/forgot-password");
  }, [navigate]);

  return (
    <LoginLayout>
      <div className="otp-verify-form">
        {/* <div className="language-box">
          <LanguageSelector />
        </div> */}
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
        <p className="error">{errorMessages.otp}</p>
        <div className="submit-cancel">
          <Button className="submit" onClick={handleOtpVerification}>
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

export default React.memo(OtpVerifyPage);