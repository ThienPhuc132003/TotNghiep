import { useEffect, useState } from "react"; // Bỏ import React nếu không dùng
import { useNavigate } from "react-router-dom";
import Api from "../network/Api"; // Đảm bảo đường dẫn đúng
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { setUserProfile } from "../redux/userSlice"; // <-- Thêm import
import { setAdminProfile } from "../redux/adminSlice"; // Đảm bảo đường dẫn đúng
import { METHOD_TYPE } from "../network/methodType"; // Đảm bảo đường dẫn đúng

// Component Loading Spinner (ví dụ)
const LoadingSpinner = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
    }}
  >
    {/* Đảm bảo bạn đã cài đặt Font Awesome hoặc thay thế bằng spinner khác */}
    <i
      className="fas fa-spinner fa-spin fa-3x"
      style={{ marginBottom: "20px" }}
    ></i>
    <p style={{ fontSize: "1.2em", color: "#333" }}>
      Đang xử lý đăng nhập Microsoft...
    </p>
  </div>
);

const MicrosoftCallbackPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processMicrosoftCallback = async () => {
      setIsLoading(true); // Đảm bảo bắt đầu loading
      setError(null); // Reset lỗi cũ

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const state = urlParams.get("state"); // <-- Lấy state từ URL

        // ✅ CLEAN URL IMMEDIATELY after getting params to prevent 414 errors
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);

        // === XÁC MINH CSRF STATE ===
        const storedState = Cookies.get("microsoft_auth_state"); // <-- Lấy state từ cookie
        Cookies.remove("microsoft_auth_state"); // <-- Xóa cookie ngay

        if (!state || !storedState || state !== storedState) {
          console.error("CSRF State mismatch or missing", {
            urlState: state,
            cookieState: storedState,
          });
          setError(
            "Lỗi xác thực bảo mật (state không khớp hoặc bị thiếu). Yêu cầu có thể đã hết hạn. Vui lòng thử đăng nhập lại. Đang chuyển hướng..."
          );
          setIsLoading(false);
          // ✅ Fix: Determine correct login page based on current path
          const loginPath = window.location.pathname.includes("/admin/")
            ? "/admin/login"
            : "/login";
          setTimeout(() => navigate(loginPath, { replace: true }), 4000);
          return;
        }

        console.log("CSRF State verified successfully.");
        // ============================

        if (!code) {
          setError(
            "Xác thực thất bại: Thiếu mã xác thực (code) trong URL. Đang chuyển hướng..."
          );
          setIsLoading(false);
          // ✅ Fix: Determine correct login page based on current path
          const loginPath = window.location.pathname.includes("/admin/")
            ? "/admin/login"
            : "/login";
          setTimeout(() => navigate(loginPath, { replace: true }), 3000);
          return;
        }

        // Xác định role và endpoints dựa trên URL callback
        const path = window.location.pathname;
        let roleFromPath = "user";
        let callbackEndpoint = "user/auth/callback";
        let profileEndpoint = "user/get-profile";
        let dashboardPath = "/trang-chu"; // ✅ Fix: User redirect to correct route

        if (path.startsWith("/admin/auth/callback")) {
          roleFromPath = "admin";
          callbackEndpoint = "admin/auth/callback";
          profileEndpoint = "admin/get-profile";
          dashboardPath = "/admin/dashboard";
        }

        console.log(`Processing callback for role: ${roleFromPath}`);

        // Gọi API backend để đổi code lấy token
        console.log(`Exchanging code via endpoint: ${callbackEndpoint}`);
        const authResponse = await Api({
          endpoint: callbackEndpoint,
          method: METHOD_TYPE.POST,
          data: { code }, // Chỉ gửi code
        });

        console.log("Auth callback response:", authResponse);

        if (!authResponse.success || !authResponse.data?.token) {
          const apiError =
            authResponse.message || "Không nhận được token từ máy chủ.";
          setError(`Xác thực thất bại: ${apiError}. Đang chuyển hướng...`);
          setIsLoading(false);
          // Quyết định chuyển về đâu nếu lỗi: trang login user hay admin?
          const loginRedirectPath =
            roleFromPath === "admin" ? "/admin/login" : "/signin";
          setTimeout(
            () => navigate(loginRedirectPath, { replace: true }),
            3000
          );
          return;
        }

        const { token } = authResponse.data; // Lấy token (userId không dùng nên bỏ qua)
        console.log("Received Token:", token);

        // Lưu token và role vào Cookies
        Cookies.set("token", token, { expires: 7 }); // Thời hạn 7 ngày
        Cookies.set("role", roleFromPath, { expires: 7 });

        // Gọi API lấy thông tin profile
        console.log(`Fetching profile via endpoint: ${profileEndpoint}`);
        const profileResponse = await Api({
          endpoint: profileEndpoint,
          method: METHOD_TYPE.GET,
          // Token được hàm Api tự thêm vào
        });

        console.log("Profile response:", profileResponse);

        if (profileResponse.success && profileResponse.data) {
          // Cập nhật Redux store
          if (roleFromPath === "admin") {
            dispatch(setAdminProfile(profileResponse.data));
            console.log("Admin profile dispatched to Redux");
          } else {
            dispatch(setUserProfile(profileResponse.data)); // Dispatch cho user
            console.log("User profile dispatched to Redux");
          }

          // Chuyển hướng đến dashboard tương ứng
          console.log(
            `Authentication successful. Navigating to ${dashboardPath}`
          );
          navigate(dashboardPath, { replace: true });
          // Không cần set isLoading = false vì đã chuyển trang
        } else {
          // Lỗi khi lấy profile dù đã có token
          const profileError =
            profileResponse.message || "Không thể tải dữ liệu người dùng.";
          console.error(
            "Error fetching profile data after login:",
            profileError
          );
          setError(
            `Đăng nhập thành công nhưng có lỗi khi tải thông tin: ${profileError}. Bạn có thể cần tải lại trang sau khi được chuyển hướng.`
          );
          // Vẫn chuyển hướng đến dashboard
          navigate(dashboardPath, { replace: true });
          // Hoặc nếu muốn dừng lại báo lỗi:
          // setIsLoading(false);
          // const loginRedirectPath = roleFromPath === 'admin' ? '/admin/login' : '/signin';
          // setTimeout(() => navigate(loginRedirectPath, { replace: true }), 5000);
        }
      } catch (error) {
        console.error(
          "Critical error during Microsoft callback processing:",
          error
        );
        let errorMessageText =
          "Đã xảy ra lỗi không mong muốn trong quá trình đăng nhập.";
        if (error.response?.data?.message) {
          errorMessageText = error.response.data.message;
        } else if (error.message) {
          errorMessageText = error.message;
        }

        setError(`${errorMessageText} Đang chuyển hướng...`);
        setIsLoading(false);
        // ✅ Fix: Determine correct login page based on current path
        const loginPath = window.location.pathname.includes("/admin/")
          ? "/admin/login"
          : "/login";
        setTimeout(() => navigate(loginPath, { replace: true }), 3000);
      }
      // Không cần finally để set isLoading = false nếu thành công vì đã navigate
    };

    // Kiểm tra nếu đã đăng nhập từ trước
    const existingToken = Cookies.get("token");
    const existingRole = Cookies.get("role");

    if (existingToken && existingRole) {
      console.log("User already logged in, redirecting...");
      const redirectPath =
        existingRole === "admin" ? "/admin/dashboard" : "/trang-chu"; // ✅ Fix: Correct user route
      navigate(redirectPath, { replace: true });
    } else {
      // Nếu chưa đăng nhập, xử lý callback
      processMicrosoftCallback();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, dispatch]); // Chỉ chạy 1 lần

  // Render UI
  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    // ✅ Fix: Determine correct login page based on current path
    const loginPath = window.location.pathname.includes("/admin/")
      ? "/admin/login"
      : "/login";
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
        <h1>Đăng nhập thất bại</h1>
        <p>{error}</p>
        <button
          onClick={() => navigate(loginPath, { replace: true })}
          style={{ padding: "10px 20px", marginTop: "15px", cursor: "pointer" }}
        >
          Quay lại trang đăng nhập
        </button>
      </div>
    );
  }

  // Nếu thành công, đã navigate, không cần render gì
  return null;
};

export default MicrosoftCallbackPage;
