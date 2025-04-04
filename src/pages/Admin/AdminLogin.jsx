import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import Api from "../../network/Api"; // Đảm bảo đường dẫn đúng
import { METHOD_TYPE } from "../../network/methodType"; // Đảm bảo đường dẫn đúng
import { setAdminProfile } from "../../redux/adminSlice"; // Đảm bảo đường dẫn đúng
import "../../assets/css/Admin/AdminLogin.style.css"; // Đảm bảo đường dẫn CSS đúng
import MicrosoftLogo from "../../assets/images/microsoft_logo.jpg"; // Đảm bảo đường dẫn đúng
import LoginLayout from "../../components/User/layout/LoginLayout"; // Layout dùng chung hoặc tạo layout riêng cho Admin

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

  // Load thông tin đăng nhập đã lưu (nếu có)
  useEffect(() => {
    const savedEmailOrPhoneNumber = localStorage.getItem(
      "admin_emailOrPhoneNumber" // Sử dụng key riêng cho admin
    );
    const savedPassword = localStorage.getItem("admin_password"); // Sử dụng key riêng cho admin
    if (savedEmailOrPhoneNumber && savedPassword) {
      setEmailOrPhoneNumber(savedEmailOrPhoneNumber);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  // Validate input fields
  const validateFields = () => {
    const errors = {};
    if (!emailOrPhoneNumber) {
      errors.emailOrPhoneNumber = "Email hoặc số điện thoại chưa được nhập";
    }
    // Có thể thêm validate định dạng email/sđt ở đây nếu muốn
    if (!password) {
      errors.password = "Mật khẩu chưa được nhập";
    }
    return errors;
  };

  // Xử lý đăng nhập bằng tài khoản thường
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateFields();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return; // Dừng nếu có lỗi validation
    }
    setIsSubmitting(true);
    setErrorMessage(""); // Reset lỗi cũ

    try {
      // 1. Gọi API Login Admin
      const response = await Api({
        endpoint: "admin/login",
        method: METHOD_TYPE.POST,
        data: {
          emailOrPhoneNumber,
          password,
        },
      });

      // 2. Xử lý kết quả Login
      if (response.success && response.data?.token) {
        const token = response.data.token;

        // 3. Lưu Token và Role vào Cookie
        // Thời hạn cookie tùy thuộc vào rememberMe
        const cookieOptions = {
          expires: rememberMe ? 7 : undefined,
          secure: true,
          sameSite: "Lax",
        };
        Cookies.set("token", token, cookieOptions);
        Cookies.set("role", "admin", cookieOptions); // <-- Lưu đúng role admin

        // 4. Lưu thông tin vào localStorage nếu người dùng chọn "Nhớ mật khẩu"
        if (rememberMe) {
          localStorage.setItem("admin_emailOrPhoneNumber", emailOrPhoneNumber);
          localStorage.setItem("admin_password", password);
        } else {
          localStorage.removeItem("admin_emailOrPhoneNumber");
          localStorage.removeItem("admin_password");
        }

        // 5. Fetch thông tin Profile Admin
        // Quan trọng: Fetch profile NGAY SAU KHI có token và TRƯỚC KHI navigate
        try {
          const adminInfoResponse = await Api({
            endpoint: "admin/get-profile",
            method: METHOD_TYPE.GET,
            // Token sẽ được tự động đọc từ cookie bởi Api helper
          });

          // 6. Xử lý kết quả Profile
          if (adminInfoResponse.success && adminInfoResponse.data) {
            // 7. Dispatch thông tin profile vào Redux store
            dispatch(setAdminProfile(adminInfoResponse.data));
            console.log("Admin Login: Profile dispatched successfully.");

            // 8. Navigate đến trang Dashboard *SAU KHI* đã dispatch profile
            navigate("/admin/dashboard");
          } else {
            // Lỗi khi fetch profile dù login thành công
            console.error(
              "Admin Login: Success, but failed to fetch profile:",
              adminInfoResponse.message
            );
            setErrorMessage(
              "Đăng nhập thành công nhưng không thể tải dữ liệu quản trị viên. Vui lòng thử tải lại trang hoặc liên hệ hỗ trợ."
            );
            // Không nên navigate trong trường hợp này để người dùng biết có lỗi
          }
        } catch (profileError) {
          // Lỗi mạng hoặc lỗi khác khi fetch profile
          console.error("Admin Login: Error fetching profile:", profileError);
          setErrorMessage(
            profileError.response?.data?.message ||
              "Lỗi mạng khi tải thông tin quản trị viên."
          );
          // Không nên navigate
        }
      } else {
        // Lỗi từ API Login (sai tk/mk,...)
        setErrorMessage(
          response.message ||
            "Tài khoản hoặc mật khẩu quản trị viên không đúng."
        );
      }
    } catch (error) {
      // Lỗi mạng chung hoặc lỗi không xác định
      console.error("Admin login error:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Đã xảy ra lỗi trong quá trình đăng nhập."
      );
    } finally {
      setIsSubmitting(false); // Luôn tắt trạng thái submitting
    }
  };

  // Hàm tạo chuỗi ngẫu nhiên cho state OAuth
  const generateRandomString = (length = 20) => {
    // Thêm độ dài mặc định
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  // Xử lý khi nhấn nút Đăng nhập Microsoft
  const handleMicrosoftLogin = async () => {
    setIsLoadingMicrosoftLogin(true);
    setErrorMessage("");
    try {
      // 1. Tạo và lưu state vào cookie
      const state = generateRandomString();
      Cookies.set("microsoft_auth_state", state, {
        secure: true, // Nên dùng true cho HTTPS
        sameSite: "Lax",
        expires: 1 / 24 / 6, // 10 phút
      });

      // 2. Gọi API backend để lấy URI đăng nhập Microsoft cho Admin
      const response = await Api({
        endpoint: "admin/auth/get-uri-microsoft", // Endpoint riêng cho Admin
        method: METHOD_TYPE.GET,
      });

      // 3. Xử lý kết quả và chuyển hướng
      if (response.success && response.data?.authUrl) {
        // Thêm state vào URL được trả về từ backend
        const authUrl = `${response.data.authUrl}&state=${state}`;
        console.log("Redirecting to Microsoft for admin login:", authUrl);
        window.location.href = authUrl; // Thực hiện chuyển hướng
        // Không set isLoadingMicrosoftLogin(false) ở đây vì đã chuyển trang
      } else {
        // Lỗi khi lấy URI
        setErrorMessage(
          response.message ||
            "Không thể lấy được địa chỉ đăng nhập Microsoft. Vui lòng thử lại."
        );
        setIsLoadingMicrosoftLogin(false); // Set lại false nếu lỗi
      }
    } catch (error) {
      // Lỗi mạng hoặc lỗi khác
      console.error("Error initiating Microsoft admin login:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Đã xảy ra lỗi khi bắt đầu đăng nhập Microsoft."
      );
      setIsLoadingMicrosoftLogin(false); // Set lại false nếu lỗi
    }
  };

  // Phần Render JSX
  return (
    <LoginLayout>
      <div className="admin-form">
        {" "}
        {/* Sử dụng class riêng cho form admin nếu cần style khác */}
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
                aria-invalid={!!fieldErrors.emailOrPhoneNumber} // Accessibility
                aria-describedby={
                  fieldErrors.emailOrPhoneNumber ? "email-error" : undefined
                }
              />
              <i className="fa-regular fa-user"></i> {/* Font Awesome icon */}
            </div>
            {fieldErrors.emailOrPhoneNumber && (
              <p id="email-error" className="error-message">
                {fieldErrors.emailOrPhoneNumber}
              </p>
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
                aria-invalid={!!fieldErrors.password} // Accessibility
                aria-describedby={
                  fieldErrors.password ? "password-error" : undefined
                }
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {/* Sử dụng icon Font Awesome */}
                <i
                  className={`fa-regular ${
                    showPassword ? "fa-eye-slash" : "fa-eye"
                  }`}
                ></i>
              </button>
            </div>
            {fieldErrors.password && (
              <p id="password-error" className="error-message">
                {fieldErrors.password}
              </p>
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
            className="admin-login-button" // Class riêng nếu cần style khác nút user
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
              type="button"
              onClick={handleMicrosoftLogin}
              className="microsoft-login-button" // Có thể dùng chung class với user login
              disabled={isLoadingMicrosoftLogin}
            >
              {isLoadingMicrosoftLogin ? (
                "Đang xử lý..."
              ) : (
                <>
                  <img src={MicrosoftLogo} alt="Microsoft logo" />
                  Đăng nhập với Microsoft
                </>
              )}
            </button>
          </div>
        </form>
        {/* Có thể thêm link Quên mật khẩu cho Admin nếu có */}
        {/* <div className="forgot-password-link">
          <Link to="/admin/forgot-password">Quên mật khẩu?</Link>
        </div> */}
      </div>
    </LoginLayout>
  );
};

export default AdminLoginPage;
