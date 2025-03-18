import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoginLayout from "../../components/User/layout/LoginLayout";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import "../../assets/css/Register.style.css";
import MicrosoftLogo from "../../assets/images/microsoft_logo.jpg";

const RegisterPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullname: "",
    birthday: "",
    email: "",
    phoneNumber: "",
    homeAddress: "",
    gender: "",
    password: "",
    confirmPassword: "",
    majorId: "", // Thêm majorId vào formData
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [majors, setMajors] = useState([]); // State để lưu danh sách chuyên ngành
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await Api({
          endpoint: "major",
          method: METHOD_TYPE.GET,
        });
        if (response.success) {
          setMajors(response.data.items);
        } else {
          console.error("Failed to fetch majors:", response.message);
        }
      } catch (error) {
        console.error("An error occurred while fetching majors:", error);
      }
    };

    fetchMajors();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const validateFields = () => {
    const errors = {};

    if (!formData.fullname) {
      errors.fullname = "Vui lòng nhập họ và tên.";
    }

    if (!formData.birthday) {
      errors.birthday = "Vui lòng chọn ngày sinh.";
    }

    if (!formData.email) {
      errors.email = "Vui lòng nhập địa chỉ email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Địa chỉ email không hợp lệ.";
    }

    if (!formData.phoneNumber) {
      errors.phoneNumber = "Vui lòng nhập số điện thoại.";
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Số điện thoại không hợp lệ (10 chữ số).";
    }

    if (!formData.homeAddress) {
      errors.homeAddress = "Vui lòng nhập địa chỉ nhà.";
    }

    if (!formData.gender) {
      errors.gender = "Vui lòng chọn giới tính.";
    }

    if (!formData.password) {
      errors.password = "Vui lòng nhập mật khẩu.";
    } else if (formData.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Mật khẩu không khớp.";
    }

    if (!formData.majorId) {
      errors.majorId = "Vui lòng chọn chuyên ngành.";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateFields();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    const data = {
      fullname: formData.fullname,
      birthday: formData.birthday,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      homeAddress: formData.homeAddress,
      gender: formData.gender,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      majorId: formData.majorId, // Thêm majorId vào data gửi lên server
    };

    try {
      const response = await Api({
        endpoint: "user/send-otp",
        method: METHOD_TYPE.POST,
        data: data,
      });

      if (response.success === true) {
        navigate("/otp-verify-register", { state: { email: formData.email } });
      } else {
        console.error("Failed to send OTP:", response.message);
        setFormErrors({ register: "Gửi OTP thất bại. Vui lòng thử lại." });
      }
    } catch (error) {
      console.error("Failed to send OTP:", error);
      setFormErrors({ register: "Đã có lỗi xảy ra. Vui lòng thử lại." });
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
        setFormErrors({
          microsoft: "Không thể kết nối với Microsoft. Vui lòng thử lại sau.",
        });
      }
    } catch (errors) {
      console.error("Error fetching Microsoft Auth URL:", errors);
      setFormErrors({
        microsoft: "Không thể kết nối với Microsoft. Vui lòng thử lại sau.",
      });
    }
  };

  return (
    <LoginLayout>
      <div className="register-form">
        <h1 className="login-title">Đăng ký GiaSuVLU</h1>
        <form className="form-above-container" onSubmit={handleSubmit}>
          <div className="form-columns">
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="fullname">{t("register.fullName")}</label>
                <input
                  type="text"
                  id="fullname"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  placeholder="Trịnh Văn Thiên Phúc"
                  className={formErrors.fullname ? "error-border" : ""}
                />
                {formErrors.fullname && (
                  <p className="error-message">{formErrors.fullname}</p>
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
                  placeholder="example@gmail.com"
                  className={formErrors.email ? "error-border" : ""}
                />
                {formErrors.email && (
                  <p className="error-message">{formErrors.email}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber">{t("register.phoneNumber")}</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="0912345678"
                  className={formErrors.phoneNumber ? "error-border" : ""}
                />
                {formErrors.phoneNumber && (
                  <p className="error-message">{formErrors.phoneNumber}</p>
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
                  placeholder="58a Huỳnh Văn Bánh"
                  className={formErrors.homeAddress ? "error-border" : ""}
                />
                {formErrors.homeAddress && (
                  <p className="error-message">{formErrors.homeAddress}</p>
                )}
              </div>
            </div>
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="majorId">Chuyên ngành</label>
                <select
                  id="majorId"
                  name="majorId"
                  value={formData.majorId}
                  onChange={handleChange}
                  className={formErrors.majorId ? "error-border" : ""}
                >
                  <option value="">Chọn chuyên ngành</option>
                  {majors.map((major) => (
                    <option key={major.majorId} value={major.majorId}>
                      {major.majorName}
                    </option>
                  ))}
                </select>
                {formErrors.majorId && (
                  <p className="error-message">{formErrors.majorId}</p>
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
                      />
                      {t("register.female")}
                    </label>
                  </div>
                  {formErrors.gender && (
                    <p className="error-message">{formErrors.gender}</p>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="password">{t("register.password")}</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  className={formErrors.password ? "error-border" : ""}
                />
                {formErrors.password && (
                  <p className="error-message">{formErrors.password}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">
                  {t("register.confirmPassword")}
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Xác nhận mật khẩu"
                  className={formErrors.confirmPassword ? "error-border" : ""}
                />
                {formErrors.confirmPassword && (
                  <p className="error-message">{formErrors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>
          {formErrors.register && (
            <p className="error-message">{formErrors.register}</p>
          )}
          {formErrors.microsoft && (
            <p className="error-message">{formErrors.microsoft}</p>
          )}
          <button
            type="submit"
            className="register-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang đăng ký..." : t("register.registerButton")}
          </button>
          <div className="divider">
            <span>hoặc</span>
          </div>
          <div className="social-login">
            <button
              onClick={handleMicrosoftRegister}
              className="microsoft-login-button"
            >
              <img src={MicrosoftLogo} alt="" />
              {t("register.registerWithMicrosoft")}
            </button>
          </div>
        </form>
        <div className="register-link">
          <p>
            Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </LoginLayout>
  );
};

const Register = React.memo(RegisterPage);
export default Register;
