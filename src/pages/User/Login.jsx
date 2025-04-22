import { useState, useEffect } from "react"; // Bỏ import React nếu không dùng
import { useNavigate, Link } from "react-router-dom";
import Api from "../../network/Api"; // Đảm bảo đường dẫn đúng
import LoginLayout from "../../components/User/layout/LoginLayout"; // Đảm bảo đường dẫn đúng
import { METHOD_TYPE } from "../../network/methodType"; // Đảm bảo đường dẫn đúng
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { setUserProfile } from "../../redux/userSlice"; // <-- Import setUserProfile
import "../../assets/css/LoginLayout.style.css"; // Đảm bảo đường dẫn đúng
import MicrosoftLogo from "../../assets/images/microsoft_logo.jpg"; // Đảm bảo đường dẫn đúng

const SigninPageComponent = () => {
  const [emailOrPhoneNumber, setEmailOrPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMicrosoftLogin, setIsLoadingMicrosoftLogin] = useState(false); // <-- Thêm state loading MS
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Dùng key riêng cho user nếu cần phân biệt với admin trong localStorage
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
    setErrorMessage(""); // Reset lỗi cũ
    try {
      const response = await Api({
        endpoint: "user/login", // Endpoint user login
        method: METHOD_TYPE.POST,
        data: {
          emailOrPhoneNumber,
          password,
        },
      });

      if (response.success && response.data?.token) {
        const token = response.data.token;
        console.log("User Login Token:", token);

        // Lưu token và role user
        Cookies.set("token", token, { expires: rememberMe ? 7 : undefined });
        Cookies.set("role", "user", { expires: rememberMe ? 7 : undefined });

        // Lưu thông tin đăng nhập nếu chọn "Nhớ mật khẩu"
        if (rememberMe) {
          localStorage.setItem("user_emailOrPhoneNumber", emailOrPhoneNumber);
          localStorage.setItem("user_password", password);
        } else {
          localStorage.removeItem("user_emailOrPhoneNumber");
          localStorage.removeItem("user_password");
        }

        // Lấy thông tin profile user
        try {
          const userInfoResponse = await Api({
            endpoint: "user/get-profile", // Endpoint user profile
            method: METHOD_TYPE.GET,
          });

          if (userInfoResponse.success && userInfoResponse.data) {
            console.log("User Profile Data:", userInfoResponse);
            dispatch(setUserProfile(userInfoResponse.data.userProfile));
            navigate("/trang-chu");
          } else {
            console.error(
              "Login successful but failed to fetch user profile:",
              userInfoResponse.message
            );
            setErrorMessage(
              "Đăng nhập thành công nhưng không thể tải dữ liệu người dùng."
            );
            // Quyết định: vẫn chuyển hướng hoặc ở lại trang login với lỗi
            navigate("/login");
          }
        } catch (profileError) {
          console.error(
            "Error fetching user profile after login:",
            profileError
          );
          setErrorMessage(
            profileError.response?.data?.message ||
              "Lỗi khi tải thông tin người dùng."
          );
          navigate("/login"); // Tạm thời vẫn chuyển hướng
        }
      } else {
        // Login API không thành công hoặc không trả về token
        setErrorMessage(
          response.message || "Tài khoản hoặc mật khẩu không đúng."
        );
      }
    } catch (error) {
      console.error("User login error:", error);
      setErrorMessage(
        error.response?.data?.message || "Tài khoản hoặc mật khẩu không đúng."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm tạo chuỗi ngẫu nhiên cho state (có thể tạo thành helper dùng chung)
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

  const handleMicrosoftLogin = async () => {
    setIsLoadingMicrosoftLogin(true);
    setErrorMessage(""); // Reset lỗi
    try {
      // 1. Tạo state
      const state = generateRandomString(20);
      // 2. Lưu state vào cookie
      Cookies.set("microsoft_auth_state", state, {
        secure: true,
        sameSite: "Lax",
        expires: 1 / 24 / 6,
      }); // 10 phút

      // 3. Lấy URI
      const response = await Api({
        endpoint: "user/auth/get-uri-microsoft", // Endpoint lấy URI cho user
        method: METHOD_TYPE.GET,
      });

      if (response.success && response.data?.authUrl) {
        // 4. Thêm state vào URL và chuyển hướng
        const authUrl = `${response.data.authUrl}&state=${state}`;
        console.log("Redirecting to Microsoft for user login:", authUrl);
        window.location.href = authUrl;
      } else {
        setErrorMessage(
          "Không thể lấy được địa chỉ đăng nhập Microsoft. Vui lòng thử lại."
        );
        setIsLoadingMicrosoftLogin(false);
      }
    } catch (error) {
      console.error("Error initiating Microsoft user login:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Đã xảy ra lỗi khi bắt đầu đăng nhập Microsoft."
      );
      setIsLoadingMicrosoftLogin(false);
    }
    // Không cần finally vì nếu thành công đã chuyển trang
  };

  return (
    <LoginLayout>
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
            className="login-button"
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
              disabled={isLoadingMicrosoftLogin} // <-- Disable nút khi loading
            >
              {isLoadingMicrosoftLogin ? (
                "Đang xử lý..."
              ) : (
                <>
                  <img src={MicrosoftLogo} alt="Microsoft logo" />{" "}
                  {/* <-- Thêm alt text */}
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
            Không có tài khoản? <Link to="/register">Đăng ký</Link>
          </p>
        </div>
      </div>
    </LoginLayout>
  );
};

export default SigninPageComponent;
