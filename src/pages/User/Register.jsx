import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoginLayout from "../../components/User/layout/LoginLayout";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import HoverForInfo from "../../components/HoverForInfo";
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

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        <h1>{t("register.title")}</h1>
        <div className="social-login">
          <button
            onClick={handleMicrosoftRegister}
            className="microsoft-login-button"
          >
            <i className="fab fa-microsoft"></i>
            {t("register.registerWithMicrosoft")}
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName">
                {t("register.fullName")}{" "}
                <HoverForInfo Text="Không có kí tự đặc biệt, không vợt 50 kí tự" />
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Trịnh Văn Thiên Phúc"
              />
            </div>
            <div className="form-group">
              <label htmlFor="birthday">
                {t("register.birthday")}{" "}
                <HoverForInfo Text="Ngày tháng năm phù hợp" />
              </label>
              <input
                type="date"
                id="birthday"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">
                {t("register.email")}{" "}
                <HoverForInfo Text="Đúng định dạng têngmail@gmail.com" />
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">{t("register.phoneNumber")}</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="0123456789"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="homeAddress">{t("register.homeAddress")}</label>
              <input
                type="text"
                id="homeAddress"
                name="homeAddress"
                value={formData.homeAddress}
                onChange={handleChange}
                placeholder="58a huỳnh văn bánh"
              />
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
                    placeholder="Strong@123"
                  />
                  {t("register.female")}
                </label>
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">
                {t("register.password")}{" "}
                <HoverForInfo
                  Text="Mật khẩu gồm tối thiểu 1 chữ in hoa, 
                1 chữ cái thường, 1 ký tự đặc biệt và không được quá 12 ký tự"
                />
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Example@123"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">
                {t("register.confirmPassword")}
                <HoverForInfo />
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Example@123"
              />
            </div>
          </div>
          <button type="submit" className="register-button">
            {t("register.registerButton")}
          </button>
        </form>
        <div className="login-link">
          <p>
            {t("register.alreadyHaveAccount")}{" "}
            <Link to="/login">{t("register.login")}</Link>
          </p>
        </div>
      </div>
    </LoginLayout>
  );
};

const Register = React.memo(RegisterPage);
export default Register;
