import React, { useState, useCallback } from "react"; // Bỏ useEffect vì không fetch major ở đây nữa
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoginLayout from "../../components/User/layout/LoginLayout";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import "../../assets/css/Register.style.css";
import "../../assets/css/MajorList.register.css"; // CSS riêng cho MajorList trong Register
import MicrosoftLogo from "../../assets/images/microsoft_logo.jpg";
import MajorList from "../../components/Static_Data/MajorList"; // <<<--- 1. IMPORT MajorList

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
    majorId: "", // Giữ majorId trong state
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [majors, setMajors] = useState([]); // <<<--- 2. BỎ state majors không cần thiết
  const navigate = useNavigate();

  // <<<--- 3. BỎ useEffect fetchMajors ở đây ---<<<
  // useEffect(() => {
  //   const fetchMajors = async () => { ... };
  //   fetchMajors();
  // }, []);

  // Hàm handleChange cho các input thông thường
  const handleChange = useCallback(
    (e) => {
      const { name, value, type } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: type === "radio" ? value : value, // Xử lý radio button
      }));
      // Xóa lỗi khi người dùng nhập liệu
      if (formErrors[name]) {
        setFormErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
      }
    },
    [formErrors]
  ); // Phụ thuộc formErrors để xóa lỗi

  // <<<--- 4. THÊM hàm xử lý riêng cho MajorList ---<<<
  // MajorList trả về (name, value) thay vì event object
  const handleMajorChange = useCallback(
    (name, value) => {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
      // Xóa lỗi khi người dùng chọn
      if (formErrors[name]) {
        setFormErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
      }
    },
    [formErrors]
  ); // Phụ thuộc formErrors

  // Hàm validate không đổi, vẫn kiểm tra formData.majorId
  const validateFields = useCallback(() => {
    const errors = {};

    if (!formData.fullname.trim()) errors.fullname = "Vui lòng nhập họ và tên.";
    if (!formData.birthday) errors.birthday = "Vui lòng chọn ngày sinh.";
    if (!formData.email.trim()) errors.email = "Vui lòng nhập địa chỉ email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Địa chỉ email không hợp lệ.";
    if (!formData.phoneNumber.trim())
      errors.phoneNumber = "Vui lòng nhập số điện thoại.";
    else if (!/^\d{10,11}$/.test(formData.phoneNumber))
      errors.phoneNumber = "Số điện thoại không hợp lệ (10-11 chữ số)."; // Cho phép 10 hoặc 11 số
    if (!formData.homeAddress.trim())
      errors.homeAddress = "Vui lòng nhập địa chỉ nhà.";
    if (!formData.gender) errors.gender = "Vui lòng chọn giới tính.";
    if (!formData.password) errors.password = "Vui lòng nhập mật khẩu.";
    else if (formData.password.length < 6)
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    if (!formData.confirmPassword)
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    else if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = "Mật khẩu không khớp.";
    if (!formData.majorId) errors.majorId = "Vui lòng chọn chuyên ngành."; // Kiểm tra majorId

    return errors;
  }, [formData]); // Phụ thuộc formData

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const errors = validateFields();
      setFormErrors(errors);

      if (Object.keys(errors).length > 0) {
        return;
      }
      setIsSubmitting(true);
      setFormErrors({}); // Xóa lỗi chung cũ

      // Dữ liệu gửi đi không đổi
      const data = {
        fullname: formData.fullname,
        birthday: formData.birthday,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        homeAddress: formData.homeAddress,
        gender: formData.gender,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        majorId: formData.majorId,
      };

      try {
        const response = await Api({
          endpoint: "user/send-otp", // Endpoint để gửi OTP đăng ký
          method: METHOD_TYPE.POST,
          data: data,
        });

        if (response.success === true) {
          // Chuyển hướng đến trang xác thực OTP, gửi email qua state
          navigate("/otp-verify-register", {
            state: { email: formData.email },
          });
        } else {
          // Hiển thị lỗi từ API nếu có, nếu không hiển thị lỗi chung
          setFormErrors({
            register: response.message || "Gửi OTP thất bại. Vui lòng thử lại.",
          });
        }
      } catch (error) {
        console.error("Send OTP error:", error);
        // Hiển thị lỗi từ response error nếu có
        const errorMessage =
          error.response?.data?.message ||
          "Đã có lỗi xảy ra khi gửi OTP. Vui lòng thử lại.";
        setFormErrors({ register: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateFields, navigate]
  ); // Dependencies

  const handleMicrosoftRegister = useCallback(async () => {
    setIsSubmitting(true); // Có thể thêm trạng thái loading riêng cho MS
    setFormErrors({});
    try {
      const response = await Api({
        endpoint: "user/auth/get-uri-microsoft",
        method: METHOD_TYPE.GET,
      });
      const authUrl = response?.data?.authUrl;

      if (authUrl) {
        window.location.href = authUrl;
        // Không cần setIsSubmitting(false) vì đã chuyển trang
      } else {
        console.error("Microsoft Auth URL not found.");
        setFormErrors({
          microsoft: "Không thể lấy đường dẫn xác thực Microsoft.",
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error fetching Microsoft Auth URL:", error);
      setFormErrors({
        microsoft:
          error.response?.data?.message || "Lỗi kết nối với Microsoft.",
      });
      setIsSubmitting(false);
    }
  }, []); // Dependencies

  return (
    <LoginLayout>
      <div className="register-form">
        <h1 className="login-title">Đăng ký tài khoản</h1>
        <form className="form-above-container" onSubmit={handleSubmit}>
          <div className="form-columns">
            {/* Cột trái */}
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="fullname">{t("register.fullName")}</label>
                <input
                  type="text"
                  id="fullname"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  placeholder="Ví dụ: Nguyễn Văn A"
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
                  placeholder="Ví dụ: nguyenvana@example.com"
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
                  placeholder="Ví dụ: 0912345678"
                  className={formErrors.phoneNumber ? "error-border" : ""}
                />
                {formErrors.phoneNumber && (
                  <p className="error-message">{formErrors.phoneNumber}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="birthday">{t("register.birthday")}</label>
                <input
                  type="date"
                  id="birthday"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  className={formErrors.birthday ? "error-border" : ""}
                  max={new Date().toISOString().split("T")[0]} // Ngăn chọn ngày tương lai
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
                  {/* Có thể thêm giới tính khác nếu cần */}
                </div>
                {formErrors.gender && (
                  <p className="error-message">{formErrors.gender}</p>
                )}
              </div>
            </div>

            {/* Cột phải */}
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="homeAddress">{t("register.homeAddress")}</label>
                <input
                  type="text"
                  id="homeAddress"
                  name="homeAddress"
                  value={formData.homeAddress}
                  onChange={handleChange}
                  placeholder="Ví dụ: 123 Đường ABC, Phường XYZ, Quận MNP, TP. HCM"
                  className={formErrors.homeAddress ? "error-border" : ""}
                />
                {formErrors.homeAddress && (
                  <p className="error-message">{formErrors.homeAddress}</p>
                )}
              </div>{" "}
              {/* <<<--- 5. SỬ DỤNG MajorList component ---<<< */}
              <div className="form-group">
                <label htmlFor="majorId">Ngành học</label>
                <div className="register-major-select-wrapper">
                  <MajorList
                    name="majorId" // Truyền name
                    value={formData.majorId} // Truyền value từ state
                    onChange={handleMajorChange} // Truyền hàm xử lý riêng
                    required // Đánh dấu là bắt buộc (cho validation và isClearable)
                    placeholder="Chọn ngành học của bạn"
                    classNamePrefix="register-major-select" // CSS riêng cho Register
                  />
                </div>
                {/* Hiển thị lỗi bên dưới component */}
                {formErrors.majorId && (
                  <p className="error-message">{formErrors.majorId}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="password">{t("register.password")}</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
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
                  placeholder="Xác nhận lại mật khẩu"
                  className={formErrors.confirmPassword ? "error-border" : ""}
                />
                {formErrors.confirmPassword && (
                  <p className="error-message">{formErrors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>

          {/* Hiển thị lỗi chung (từ API) */}
          {(formErrors.register || formErrors.microsoft) && (
            <p className="error-message general-error">
              {formErrors.register || formErrors.microsoft}
            </p>
          )}

          {/* Nút Đăng ký */}
          <button
            type="submit"
            className="register-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang xử lý..." : t("register.registerButton")}
          </button>

          {/* Ngăn cách hoặc */}
          <div className="divider">
            <span>hoặc</span>
          </div>

          {/* Đăng ký với Microsoft */}
          <div className="social-login">
            <button
              type="button" // Quan trọng: đổi type thành "button" để không submit form
              onClick={handleMicrosoftRegister}
              className="microsoft-login-button"
              disabled={isSubmitting} // Có thể disable khi đang xử lý đăng ký thường
            >
              <img src={MicrosoftLogo} alt="Microsoft logo" /> {/* Thêm alt */}
              {t("register.registerWithMicrosoft")}
            </button>
          </div>
        </form>

        {/* Link đến trang Đăng nhập */}
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
