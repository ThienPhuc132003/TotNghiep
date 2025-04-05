// src/routes/AdminPrivateRoutes.jsx

import { useEffect, useState, useCallback } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { setAdminProfile } from "../redux/adminSlice"; // <-- Đường dẫn đúng
import Api from "../network/Api"; // <-- Đường dẫn đúng
import { METHOD_TYPE } from "../network/methodType"; // <-- Đường dẫn đúng


function AdminPrivateRoutes() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate(); // Hook để làm sạch URL

  // Lấy state từ Redux và Cookies
  const adminProfile = useSelector((state) => state.admin.profile);
  const token = Cookies.get("token");
  const userRole = Cookies.get("role");

  // State quản lý
  const [isLoading, setIsLoading] = useState(true); // Loading chung
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Kết quả xác thực
  const [error, setError] = useState(null); // Lỗi (nếu có)
  // Cờ này rất quan trọng để tránh xử lý callback lặp lại sau khi URL đã sạch
  const [isCallbackProcessed, setIsCallbackProcessed] = useState(false);

  console.log(
    "AdminPrivateRoutes Render - Location:",
    location.pathname + location.search,
    "Token:",
    token,
    "Role:",
    userRole,
    "Profile:",
    adminProfile,
    "isLoading:",
    isLoading,
    "isAuth:",
    isAuthenticated,
    "CallbackProcessed:",
    isCallbackProcessed
  );

  // --- Hàm xử lý Callback OAuth ---
  const handleOAuthCallback = useCallback(
    async (code, state) => {
      let isCallbackSuccessful = false; // Cờ đánh dấu thành công cục bộ
      try {
        console.log("AdminPrivateRoutes: Handling OAuth Callback...");
        setIsLoading(true); // Bắt đầu loading cho callback
        setError(null);

        const storedState = Cookies.get("microsoft_auth_state");
        if (!storedState || state !== storedState) {
          throw new Error("Lỗi bảo mật (state không khớp).");
        }
        Cookies.remove("microsoft_auth_state");

        // 1. Đổi code lấy token
        console.log("AdminPrivateRoutes: Exchanging code...");
        const callbackResponse = await Api({
          endpoint: "admin/auth/callback", // API callback Admin
          method: METHOD_TYPE.POST,
          data: { code },
        });

        if (!callbackResponse.success || !callbackResponse.data?.token) {
          throw new Error(
            callbackResponse.message || "Lỗi đổi code lấy token Admin."
          );
        }

        const newToken = callbackResponse.data.token;
        const cookieOptions = { secure: true, sameSite: "Lax" };
        Cookies.set("token", newToken, cookieOptions);
        Cookies.set("role", "admin", cookieOptions);
        console.log("AdminPrivateRoutes: Token & Role set from callback.");

        // 2. Fetch profile ngay sau khi có token
        console.log("AdminPrivateRoutes: Fetching profile after callback...");
        const profileResponse = await Api({
          endpoint: "admin/get-profile", // API profile Admin
          method: METHOD_TYPE.GET,
        });

        if (!profileResponse.success || !profileResponse.data?.adminId) {
          // <<< KIỂM TRA adminId >>>
          Cookies.remove("token");
          Cookies.remove("role"); // Xóa token nếu profile lỗi
          throw new Error(
            profileResponse.message || "Lỗi tải profile Admin sau callback."
          );
        }

        // 3. Dispatch profile
        dispatch(setAdminProfile(profileResponse.data));
        console.log("AdminPrivateRoutes: Profile dispatched after callback.");
        setIsAuthenticated(true); // Xác thực thành công
        isCallbackSuccessful = true; // Đánh dấu callback thành công
      } catch (err) {
        console.error("AdminPrivateRoutes: Error during OAuth callback:", err);
        setError(err.message || "Lỗi xử lý đăng nhập Microsoft.");
        setIsAuthenticated(false);
        Cookies.remove("token");
        Cookies.remove("role");
      } finally {
        // Chỉ làm sạch URL nếu callback đã thành công trước đó
        if (isCallbackSuccessful) {
          console.log(
            "AdminPrivateRoutes: Callback successful. Cleaning URL..."
          );
          navigate(location.pathname, { replace: true }); // Xóa code và state khỏi URL
        }
        // Đánh dấu đã xử lý callback (dù thành công hay lỗi) để không chạy lại
        setIsCallbackProcessed(true);
        setIsLoading(false); // Kết thúc loading *sau khi* mọi thứ xong
        console.log(
          "AdminPrivateRoutes: Finished OAuth callback processing. isLoading:",
          false,
          "isAuthenticated:",
          isCallbackSuccessful
        );
      }
    },
    [dispatch, navigate, location.pathname]
  ); // Dependencies cho callback handler

  // --- Hàm kiểm tra xác thực thông thường ---
  const checkExistingAuth = useCallback(async () => {
    let isExistingAuthValid = false;
    try {
      console.log("AdminPrivateRoutes: Checking existing authentication...");
      // Không cần setIsLoading(true) ở đây vì useEffect chính sẽ quản lý

      // <<< KIỂM TRA adminId >>>
      if (adminProfile?.adminId && userRole === "admin") {
        console.log("AdminPrivateRoutes: Existing profile in Redux is valid.");
        isExistingAuthValid = true;
      } else if (token && userRole === "admin") {
        console.log(
          "AdminPrivateRoutes: Existing token/role found, fetching profile..."
        );
        const response = await Api({
          endpoint: "admin/get-profile",
          method: METHOD_TYPE.GET,
        });
        // <<< KIỂM TRA adminId >>>
        if (response.success && response.data?.adminId) {
          dispatch(setAdminProfile(response.data));
          isExistingAuthValid = true;
          console.log("AdminPrivateRoutes: Profile fetched for existing auth.");
        } else {
          console.error(
            "AdminPrivateRoutes: Failed fetch profile for existing token.",
            response?.message
          );
          Cookies.remove("token");
          Cookies.remove("role");
        }
      } else {
        console.log("AdminPrivateRoutes: No valid existing token/role.");
        if (!token || userRole !== "admin") {
          Cookies.remove("token");
          Cookies.remove("role");
        }
      }
    } catch (error) {
      console.error("AdminPrivateRoutes: Error checking existing auth:", error);
      Cookies.remove("token");
      Cookies.remove("role");
    } finally {
      // Cập nhật trạng thái xác thực và kết thúc loading (nếu check auth là hành động chính)
      setIsAuthenticated(isExistingAuthValid);
      setIsLoading(false);
      console.log(
        "AdminPrivateRoutes: Finished existing auth check. isLoading:",
        false,
        "isAuthenticated:",
        isExistingAuthValid
      );
    }
  }, [adminProfile, token, userRole, dispatch]);

  // --- Effect chính điều phối logic ---
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    console.log("AdminPrivateRoutes Effect - Checking logic path...", {
      code,
      state,
      isCallbackProcessed,
    });

    // Path 1: Xử lý callback OAuth (nếu có code, state và *chưa xử lý*)
    if (code && state && !isCallbackProcessed) {
      // Đặt isLoading true ngay lập tức để hiển thị loading cho callback
      setIsLoading(true);
      handleOAuthCallback(code, state);
    }
    // Path 2: Kiểm tra auth thông thường (nếu không phải callback và chưa loading)
    // Chạy kiểm tra nếu chưa bao giờ xử lý callback *hoặc* callback đã xử lý xong
    else if (isLoading) {
      // Chỉ kiểm tra nếu đang trong trạng thái loading ban đầu
      checkExistingAuth();
    }
    // Path 3: Đã xác thực và không cần làm gì
    else if (isAuthenticated) {
      setIsLoading(false); // Đảm bảo tắt loading nếu đã xác thực từ trước
    }
    // Path 4: Chưa xác thực và không phải callback -> sẽ bị redirect ở phần render

    // Chạy lại khi location.search thay đổi (để bắt callback) hoặc khi isCallbackProcessed thay đổi
  }, [
    location.search,
    handleOAuthCallback,
    checkExistingAuth,
    isCallbackProcessed,
    isAuthenticated,
    isLoading,
  ]);

  // --- Logic Render ---
  if (isLoading) {
    console.log("AdminPrivateRoutes: Rendering Loading State...");
    const searchParams = new URLSearchParams(location.search);
    const isLoadingCallback =
      searchParams.has("code") &&
      searchParams.has("state") &&
      !isCallbackProcessed;
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.2em",
          color: "#555",
        }}
      >
        {isLoadingCallback
          ? "Đang xử lý đăng nhập Microsoft..."
          : "Đang kiểm tra quyền truy cập Admin..."}
      </div>
    );
  }

  if (error) {
    console.log("AdminPrivateRoutes: Rendering Error State...");
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
        <h2>Lỗi Xác Thực</h2>
        <p>{error}</p>
        <p>
          Vui lòng <a href="/admin/login">đăng nhập lại</a>.
        </p>
      </div>
    );
  }

  if (isAuthenticated) {
    console.log("AdminPrivateRoutes: Rendering Outlet (Authenticated).");
    return <Outlet />;
  } else {
    console.log(
      "AdminPrivateRoutes: Rendering Navigate to /admin/login (Not Authenticated)."
    );
    // Đảm bảo xóa cookie lần cuối trước khi redirect
    Cookies.remove("token");
    Cookies.remove("role");
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
}

// AdminPrivateRoutes.propTypes = {}; // Thêm nếu cần

export default AdminPrivateRoutes;
