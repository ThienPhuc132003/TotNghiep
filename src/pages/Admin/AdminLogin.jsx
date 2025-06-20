import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { setAdminProfile } from "../../redux/adminSlice";
import { getMicrosoftAuthUrl } from "../../../admin-oauth-alternative-handlers";
import "../../assets/css/Admin/AdminLogin.style.css";
import MicrosoftLogo from "../../assets/images/microsoft_logo.jpg";
import LoginLayout from "../../components/User/layout/LoginLayout";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [emailOrPhoneNumber, setEmailOrPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingMicrosoftLogin, setIsLoadingMicrosoftLogin] = useState(false);

  useEffect(() => {
    const savedEmailOrPhoneNumber = localStorage.getItem(
      "admin_emailOrPhoneNumber"
    );
    const savedPassword = localStorage.getItem("admin_password");
    if (savedEmailOrPhoneNumber && savedPassword) {
      setEmailOrPhoneNumber(savedEmailOrPhoneNumber);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const validateFields = () => {
    const errors = {};
    if (!emailOrPhoneNumber) {
      errors.emailOrPhoneNumber = "Email hoặc số điện thoại chưa được nhập";
    }
    if (!password) {
      errors.password = "Mật khẩu chưa được nhập";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateFields();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const response = await Api({
        endpoint: "admin/login", // Endpoint admin login
        method: METHOD_TYPE.POST,
        data: {
          emailOrPhoneNumber,
          password,
        },
      });

      if (response.success && response.data?.token) {
        const token = response.data.token;
        Cookies.set("token", token, { expires: rememberMe ? 7 : undefined });
        Cookies.set("role", "admin", { expires: rememberMe ? 7 : undefined });

        if (rememberMe) {
          localStorage.setItem("admin_emailOrPhoneNumber", emailOrPhoneNumber);
          localStorage.setItem("admin_password", password);
        } else {
          localStorage.removeItem("admin_emailOrPhoneNumber");
          localStorage.removeItem("admin_password");
        }

        try {
          const adminInfoResponse = await Api({
            endpoint: "admin/get-profile", // Endpoint admin profile
            method: METHOD_TYPE.GET,
          });

          if (adminInfoResponse.success && adminInfoResponse.data) {
            dispatch(setAdminProfile(adminInfoResponse.data));
            navigate("/admin/dashboard"); // Chuyển hướng admin dashboard
          } else {
            console.error(
              "Login successful but failed to fetch admin profile:",
              adminInfoResponse.message
            );
            setErrorMessage(
              "Đăng nhập thành công nhưng không thể tải dữ liệu quản trị viên."
            );
            navigate("/admin/dashboard"); // Tạm thời vẫn chuyển hướng
          }
        } catch (profileError) {
          console.error(
            "Error fetching admin profile after login:",
            profileError
          );
          setErrorMessage(
            profileError.response?.data?.message ||
              "Lỗi khi tải thông tin quản trị viên."
          );
          navigate("/admin/dashboard"); // Tạm thời vẫn chuyển hướng
        }
      } else {
        setErrorMessage(
          response.message || "Tài khoản hoặc mật khẩu không đúng."
        );
      }
    } catch (error) {
      console.error("Admin login error:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Đã xảy ra lỗi trong quá trình đăng nhập."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleMicrosoftLogin = async () => {
    setIsLoadingMicrosoftLogin(true);
    setErrorMessage("");

    try {
      console.log("🔄 Getting Microsoft OAuth URL from backend...");

      // Lấy OAuth URL từ backend API
      const result = await getMicrosoftAuthUrl();

      if (result.success && result.authUrl) {
        console.log("✅ Got OAuth URL, redirecting to Microsoft...");
        // Redirect đến Microsoft OAuth
        window.location.href = result.authUrl;
      } else {
        throw new Error(
          result.error || "Không thể lấy URL đăng nhập Microsoft"
        );
      }
    } catch (error) {
      console.error("❌ Error initiating Microsoft login:", error);
      setErrorMessage(
        "Không thể khởi tạo đăng nhập Microsoft. Vui lòng thử lại."
      );
      setIsLoadingMicrosoftLogin(false);
    }
  };

  return (
    <LoginLayout>
      {" "}
      {/* Cân nhắc Layout riêng cho Admin */}
      <div className="admin-form">
        <h1 className="login-title">Quản lý GiaSuVLU</h1>
        <form className="form-above-container" onSubmit={handleSubmit}>
          {/* Input Email/Số điện thoại */}
          <div className="login-form-container">
            <label htmlFor="emailOrPhoneNumber">Email hoặc Số điện thoại</label>
            <div
              className={`login-form-group ${
                fieldErrors.emailOrPhoneNumber ? "error" : ""
              }`}
            >
              <input
                type="text"
                id="emailOrPhoneNumber"
                name="emailOrPhoneNumber"
                value={emailOrPhoneNumber}
                placeholder="nhập email hoặc số điện thoại"
                onChange={(e) => setEmailOrPhoneNumber(e.target.value)}
                className={fieldErrors.emailOrPhoneNumber ? "error-border" : ""}
              />
              <i className="fa-regular fa-user"></i>
            </div>
            {fieldErrors.emailOrPhoneNumber && (
              <p className="error-message">{fieldErrors.emailOrPhoneNumber}</p>
            )}
          </div>

          {/* Input Mật khẩu */}
          <div className="login-form-container">
            <label htmlFor="password">Mật khẩu</label>
            <div
              className={`login-form-group ${
                fieldErrors.password ? "error" : ""
              }`}
            >
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                placeholder="nhập mật khẩu"
                onChange={(e) => setPassword(e.target.value)}
                className={fieldErrors.password ? "error-border" : ""}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <i className="fa-regular fa-eye-slash"></i>
                ) : (
                  <i className="fa-regular fa-eye"></i>
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="error-message">{fieldErrors.password}</p>
            )}
          </div>

          {/* Checkbox Nhớ mật khẩu */}
          <div className="remember-me">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="checkbox-remember-me"
              />
              Nhớ mật khẩu
            </label>
          </div>

          {/* Hiển thị lỗi chung */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {/* Nút Đăng nhập thường */}
          <button
            type="submit"
            className="admin-login-button" // Class riêng nếu cần
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
          </button>

          <div className="divider">
            <span>hoặc</span>
          </div>

          {/* Nút Đăng nhập Microsoft */}
          <div className="social-login">
            <button
              type="button" // Quan trọng
              onClick={handleMicrosoftLogin}
              className="microsoft-login-button"
              disabled={isLoadingMicrosoftLogin}
            >
              {isLoadingMicrosoftLogin ? (
                "Đang xử lý..."
              ) : (
                <>
                  <img src={MicrosoftLogo} alt="Microsoft logo" />{" "}
                  {/* Thêm alt text */}
                  Đăng nhập với Microsoft
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </LoginLayout>
  );
};

export default memo(AdminLoginPage);
