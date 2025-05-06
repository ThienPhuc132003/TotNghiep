import { useState, useEffect } from "react"; // Thêm React nếu chưa có
import { useNavigate, Link, useLocation } from "react-router-dom"; // *** THÊM useLocation ***
import Api from "../../network/Api";
import LoginLayout from "../../components/User/layout/LoginLayout";
import { METHOD_TYPE } from "../../network/methodType";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
// *** Đảm bảo đường dẫn userSlice đúng ***
import { setUserProfile } from "../../redux/userSlice";
import "../../assets/css/LoginLayout.style.css";
import MicrosoftLogo from "../../assets/images/microsoft_logo.jpg";
// *** THÊM import cho react-toastify ***
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Đảm bảo CSS được import (thường ở App.js)

const SigninPageComponent = () => {
  const [emailOrPhoneNumber, setEmailOrPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMicrosoftLogin, setIsLoadingMicrosoftLogin] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation(); // *** Lấy location object ***

  // --- XỬ LÝ HIỂN THỊ TOAST KHI ĐĂNG KÝ THÀNH CÔNG ---
  useEffect(() => {
    // Kiểm tra state từ trang OTP
    if (location.state?.registrationSuccess === true) {
      toast.success("Đăng ký tài khoản thành công!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      // Xóa state để tránh hiển thị lại toast khi điều hướng nội bộ
      navigate(location.pathname, { state: null, replace: true });
    }
  }, [location.state, navigate, location.pathname]); // Dependencies

  // useEffect để load thông tin "Nhớ mật khẩu" (giữ nguyên)
  useEffect(() => {
    const savedEmailOrPhoneNumber = localStorage.getItem(
      "user_emailOrPhoneNumber"
    );
    const savedPassword = localStorage.getItem("user_password");
    if (savedEmailOrPhoneNumber && savedPassword) {
      setEmailOrPhoneNumber(savedEmailOrPhoneNumber);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  // validateFields (giữ nguyên)
  const validateFields = () => {
    const errors = {};
    if (!emailOrPhoneNumber) {
      errors.emailOrPhoneNumber = "Vui lòng nhập Email hoặc số điện thoại.";
    }
    if (!password) {
      errors.password = "Vui lòng nhập mật khẩu.";
    }
    return errors;
  };

  // handleSubmit (giữ nguyên logic xử lý đăng nhập)
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
        endpoint: "user/login",
        method: METHOD_TYPE.POST,
        data: { emailOrPhoneNumber, password },
      });

      if (response.success && response.data?.token) {
        const token = response.data.token;
        Cookies.set("token", token, { expires: rememberMe ? 7 : undefined });
        Cookies.set("role", "user", { expires: rememberMe ? 7 : undefined });

        if (rememberMe) {
          localStorage.setItem("user_emailOrPhoneNumber", emailOrPhoneNumber);
          localStorage.setItem("user_password", password);
        } else {
          localStorage.removeItem("user_emailOrPhoneNumber");
          localStorage.removeItem("user_password");
        }

        try {
          const userInfoResponse = await Api({
            endpoint: "user/get-profile",
            method: METHOD_TYPE.GET,
          });

          if (userInfoResponse.success && userInfoResponse.data) {
            dispatch(setUserProfile(userInfoResponse.data));
            navigate("/trang-chu"); // Chuyển hướng đến trang chủ sau khi lấy profile
          } else {
            setErrorMessage("Đăng nhập thành công nhưng không thể tải hồ sơ.");
            // Ở lại trang login để hiển thị lỗi
          }
        } catch (profileError) {
          console.error("Error fetching profile after login:", profileError);
          setErrorMessage("Lỗi khi tải hồ sơ người dùng.");
          // Ở lại trang login để hiển thị lỗi
        }
      } else {
        setErrorMessage(
          response.message || "Email/SĐT hoặc mật khẩu không đúng."
        );
      }
    } catch (error) {
      console.error("User login error:", error);
      setErrorMessage(
        error.response?.data?.message || "Email/SĐT hoặc mật khẩu không đúng."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // generateRandomString (giữ nguyên)
  const generateRandomString = (length) => {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  // handleMicrosoftLogin (giữ nguyên)
  const handleMicrosoftLogin = async () => {
    setIsLoadingMicrosoftLogin(true);
    setErrorMessage("");
    try {
      const state = generateRandomString(20);
      Cookies.set("microsoft_auth_state", state, { expires: 1 / 24 / 6 }); // 10 phút

      const response = await Api({
        endpoint: "user/auth/get-uri-microsoft",
        method: METHOD_TYPE.GET,
      });

      if (response.success && response.data?.authUrl) {
        const authUrl = `${response.data.authUrl}&state=${state}`;
        window.location.href = authUrl;
      } else {
        setErrorMessage("Không thể lấy địa chỉ đăng nhập Microsoft.");
        setIsLoadingMicrosoftLogin(false);
      }
    } catch (error) {
      console.error("Error initiating Microsoft login:", error);
      setErrorMessage("Lỗi khi bắt đầu đăng nhập Microsoft.");
      setIsLoadingMicrosoftLogin(false);
    }
  };

  // --- PHẦN JSX (giữ nguyên cấu trúc) ---
  return (
    <LoginLayout>
      {/* Đảm bảo ToastContainer được render ở cấp cao hơn (vd: App.js) */}
      {/* <ToastContainer /> */}
      <div className="login-form">
        <h1 className="login-title">Đăng nhập</h1>
        <form className="form-above-container" onSubmit={handleSubmit}>
          {/* Input Email/Số điện thoại */}
          <div className="login-form-container">
            <label htmlFor="emailOrPhoneNumber">Email hoặc số điện thoại</label>
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
                onChange={(e) => {
                  setEmailOrPhoneNumber(e.target.value);
                  // Xóa lỗi khi người dùng nhập
                  if (fieldErrors.emailOrPhoneNumber)
                    setFieldErrors((prev) => ({
                      ...prev,
                      emailOrPhoneNumber: "",
                    }));
                  if (errorMessage) setErrorMessage(""); // Xóa lỗi chung
                }}
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  // Xóa lỗi khi người dùng nhập
                  if (fieldErrors.password)
                    setFieldErrors((prev) => ({ ...prev, password: "" }));
                  if (errorMessage) setErrorMessage(""); // Xóa lỗi chung
                }}
                className={fieldErrors.password ? "error-border" : ""}
              />
              <button
                type="button"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} // Thêm aria-label
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
          {errorMessage && (
            <p className="error-message general-error">{errorMessage}</p>
          )}

          {/* Nút Đăng nhập thường */}
          <button
            type="submit"
            className="login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <div className="divider">
            <span>hoặc</span>
          </div>

          {/* Nút Đăng nhập Microsoft */}
          <div className="social-login">
            <button
              type="button"
              onClick={handleMicrosoftLogin}
              className="microsoft-login-button"
              disabled={isLoadingMicrosoftLogin || isSubmitting} // Disable khi đang login thường hoặc MS
            >
              {isLoadingMicrosoftLogin ? (
                "Đang chuyển hướng..."
              ) : (
                <>
                  <img src={MicrosoftLogo} alt="Microsoft logo" />
                  Đăng nhập với Microsoft
                </>
              )}
            </button>
          </div>
        </form>

        {/* Liên kết khác */}
        <div className="forgot-password-link">
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </div>
        <div className="register-link">
          <p>
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </LoginLayout>
  );
};

// Không cần React.memo cho trang login thường trừ khi có lý do tối ưu đặc biệt
export default SigninPageComponent;
