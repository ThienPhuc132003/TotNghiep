import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoginLayout from "../../components/User/layout/LoginLayout";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import "../../assets/css/Register.style.css";

const RegisterPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: "",
    birthday: "",
    email: "",
    phoneNumber: "",
    homeAddress: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const errors = { ...formErrors };

    if (!value) {
      errors[name] = `${
        name.charAt(0).toUpperCase() + name.slice(1)
      } is required`;
    } else {
      delete errors[name];
    }

    setFormErrors(errors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      fullName,
      birthday,
      email,
      phoneNumber,
      homeAddress,
      gender,
      password,
      confirmPassword,
    } = formData;

    const errors = {};
    if (!fullName) errors.fullName = "Full Name is required";
    if (!birthday) errors.birthday = "Birthday is required";
    if (!email) errors.email = "Email is required";
    if (!phoneNumber) errors.phoneNumber = "Phone Number is required";
    if (!homeAddress) errors.homeAddress = "Home Address is required";
    if (!gender) errors.gender = "Gender is required";
    if (!password) errors.password = "Password is required";
    if (password !== confirmPassword)
      errors.confirmPassword = "Passwords do not match";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    const data = {
      fullname: fullName,
      birthday: birthday,
      email: email,
      phoneNumber: phoneNumber,
      homeAddress: homeAddress,
      gender: gender.toUpperCase(),
      password: password,
      confirmPassword: confirmPassword,
    };

    try {
      const response = await Api({
        endpoint: "user/register",
        method: METHOD_TYPE.POST,
        data: data,
      });
      if (response.success === true) {
        navigate("/login");
      } else {
        console.error("Registration failed:", response.message);
      }
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMicrosoftRegister = async () => {
    try {
      const response = await Api({
        endpoint: "user/auth/get-uri-microsoft",
        method: METHOD_TYPE.GET,
      });
      const authUrl = response.data.authUrl;

      if (authUrl) {
        window.location.href = authUrl;
      } else {
        console.error("Microsoft Auth URL not found.");
      }
    } catch (errors) {
      console.error("Error fetching Microsoft Auth URL:", errors);
    }
  };

  return (
    <LoginLayout>
      <div className="register-form">
        <h1>Đăng ký GiaSuVLU</h1>
        <div className="social-login">
          <button
            onClick={handleMicrosoftRegister}
            className="microsoft-login-button"
          >
            <i className="fab fa-microsoft"></i>
            {t("register.registerWithMicrosoft")}
          </button>
        </div>
        <div className="divider">
          <span>hoặc</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">{t("register.fullName")}</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Trịnh Văn Thiên Phúc"
              className={formErrors.fullName ? "error-border" : ""}
            />
            {formErrors.fullName && (
              <p className="error-message">{formErrors.fullName}</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="email">{t("register.email")}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="example@gmail.com"
              className={formErrors.email ? "error-border" : ""}
            />
            {formErrors.email && (
              <p className="error-message">{formErrors.email}</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="homeAddress">{t("register.homeAddress")}</label>
            <input
              type="text"
              id="homeAddress"
              name="homeAddress"
              value={formData.homeAddress}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="58a huỳnh văn bánh"
              className={formErrors.homeAddress ? "error-border" : ""}
            />
            {formErrors.homeAddress && (
              <p className="error-message">{formErrors.homeAddress}</p>
            )}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="birthday">{t("register.birthday")}</label>
              <input
                type="date"
                id="birthday"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                onBlur={handleBlur}
                className={formErrors.birthday ? "error-border" : ""}
              />
              {formErrors.birthday && (
                <p className="error-message">{formErrors.birthday}</p>
              )}
            </div>
            <div className="form-group">
              <label>{t("register.gender")}</label>
              <div className="gender-group">
                <label className="gender-label">
                  <input
                    type="radio"
                    name="gender"
                    value="MALE"
                    checked={formData.gender === "MALE"}
                    onChange={handleChange}
                    onBlur={handleBlur}
    
                  />
                  {t("register.male")}
                </label>
                <label className="gender-label">
                  <input
                    type="radio"
                    name="gender"
                    value="FEMALE"
                    checked={formData.gender === "FEMALE"}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {t("register.female")}
                </label>
              </div>
              {formErrors.gender && (
                <p className="error-message">{formErrors.gender}</p>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">{t("register.password")}</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Example@123"
                className={formErrors.password ? "error-border" : ""}
              />
              {formErrors.password && (
                <p className="error-message">{formErrors.password}</p>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">{t("register.confirmPassword")}</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Example@123"
                className={formErrors.confirmPassword ? "error-border" : ""}
              />
              {formErrors.confirmPassword && (
                <p className="error-message">{formErrors.confirmPassword}</p>
              )}
            </div>
          </div>
          <button type="submit" className="register-button" disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : t("register.registerButton")}
          </button>
        </form>
      </div>
    </LoginLayout>
  );
};

const Register = React.memo(RegisterPage);
export default Register;