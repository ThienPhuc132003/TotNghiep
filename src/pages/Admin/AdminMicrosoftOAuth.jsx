import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { setAdminProfile } from "../../redux/adminSlice";
import "../../assets/css/Admin/AdminMicrosoftOAuth.style.css"; // CSS cho animation

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="admin-oauth-loading">
    <div className="admin-oauth-spinner" />
    <p className="admin-oauth-message">Đang xử lý đăng nhập Microsoft...</p>
  </div>
);

const AdminMicrosoftOAuthPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processMicrosoftCallback = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("🔄 Processing Microsoft OAuth callback for admin...");
        // Lấy code từ URL params
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        // Clean URL ngay lập tức để tránh lỗi 414
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);

        // Kiểm tra lỗi từ Microsoft
        if (error) {
          throw new Error(`Microsoft OAuth error: ${error}`);
        }

        // Kiểm tra có code không
        if (!code) {
          throw new Error("Không nhận được authorization code từ Microsoft");
        }

        console.log("✅ Got authorization code, exchanging for token...");

        // Gọi API backend để exchange code → token
        const response = await Api({
          endpoint: "/api/admin/auth/login", // API endpoint bạn đã nói
          method: METHOD_TYPE.POST,
          data: { code: code },
        });

        if (response.success && response.data?.token) {
          console.log("✅ Successfully exchanged code for token");

          // Lưu token vào cookies
          Cookies.set("token", response.data.token, {
            secure: true,
            sameSite: "Lax",
            expires: 7,
          });
          Cookies.set("role", "admin", {
            secure: true,
            sameSite: "Lax",
            expires: 7,
          });

          // Lưu admin profile nếu backend trả về
          if (response.data.adminProfile) {
            dispatch(setAdminProfile(response.data.adminProfile));
            console.log("✅ Admin profile saved from login response");
          }

          console.log("🚀 Redirecting to admin dashboard...");

          // Redirect về admin dashboard
          navigate("/admin/dashboard", { replace: true });
        } else {
          throw new Error(response.message || "Không thể đổi code thành token");
        }
      } catch (err) {
        console.error("❌ Microsoft OAuth callback error:", err);
        setError(
          err.message || "Đã xảy ra lỗi trong quá trình đăng nhập Microsoft"
        );
        setIsLoading(false);
      }
    };

    // Kiểm tra nếu đã đăng nhập admin từ trước
    const existingToken = Cookies.get("token");
    const existingRole = Cookies.get("role");

    if (existingToken && existingRole === "admin") {
      console.log("Admin already logged in, redirecting to dashboard...");
      navigate("/admin/dashboard", { replace: true });
    } else {
      // Xử lý callback OAuth mới
      processMicrosoftCallback();
    }
  }, [navigate, dispatch, searchParams]);

  // Render UI
  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return (
      <div className="admin-oauth-error">
        <h1>Đăng nhập thất bại</h1>
        <p>{error}</p>
        <button onClick={() => navigate("/admin/login", { replace: true })}>
          Quay lại trang đăng nhập
        </button>
      </div>
    );
  }

  // Nếu thành công, đã navigate, không cần render gì
  return null;
};

export default AdminMicrosoftOAuthPage;
