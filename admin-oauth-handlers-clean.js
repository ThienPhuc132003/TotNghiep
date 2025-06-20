// ADMIN MICROSOFT OAUTH - BACKEND CALLBACK FLOW
// File: admin-oauth-alternative-handlers.js

// Import dependencies
import Api from "../src/network/Api";
import { METHOD_TYPE } from "../src/network/methodType";
import { setAdminProfile } from "../src/redux/adminSlice";
import Cookies from "js-cookie";

// ==================================================
// LUỒNG MỚI: Backend xử lý callback và redirect về frontend
// ==================================================

/**
 * Luồng hoạt động:
 * 1. Frontend: User click "Đăng nhập Microsoft" → redirect Microsoft OAuth
 * 2. Microsoft: Authenticate → redirect về backend /api/admin/auth/callback
 * 3. Backend: Xử lý callback, exchange code → token, tạo session
 * 4. Backend: Redirect về frontend với token/data
 * 5. Frontend: Nhận và xử lý data từ backend
 */

// ==================================================
// KỊCH BẢN CHÍNH: Backend redirect với token và admin data
// ==================================================

export const handleBackendCallback = (
  searchParams,
  dispatch,
  setIsAuthenticated,
  navigate
) => {
  const token = searchParams.get("token");
  const adminData = searchParams.get("admin");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  if (error) {
    console.error("❌ Backend OAuth error:", error);
    return { success: false, error };
  }

  if (token && state) {
    // Validate state
    const storedState = Cookies.get("admin_microsoft_auth_state");
    if (!storedState || state !== storedState) {
      console.error("❌ OAuth state mismatch");
      return { success: false, error: "State mismatch" };
    }

    // Clear used state
    Cookies.remove("admin_microsoft_auth_state");

    // Save token
    Cookies.set("token", token, {
      secure: true,
      sameSite: "Lax",
      expires: 7,
    });
    Cookies.set("role", "admin", {
      secure: true,
      sameSite: "Lax",
      expires: 7,
    });

    // Handle admin data
    if (adminData) {
      try {
        const decodedAdminData = JSON.parse(atob(adminData));
        dispatch(setAdminProfile(decodedAdminData));
        setIsAuthenticated(true);
        console.log("✅ Backend callback successful");
        return { success: true };
      } catch (decodeError) {
        console.warn("⚠️ Could not decode admin data:", decodeError);
        return { success: true, needsFetch: true };
      }
    }

    setIsAuthenticated(true);
    return { success: true, needsFetch: true };
  }

  return { success: false, error: "Missing required parameters" };
};

// ==================================================
// KỊCH BẢN FALLBACK: Direct API callback (legacy support)
// ==================================================

const handleDirectApiCallback = async (
  authCode,
  dispatch,
  setIsAuthenticated
) => {
  try {
    const response = await Api({
      endpoint: "admin/auth/callback",
      method: METHOD_TYPE.POST,
      data: { code: authCode },
    });

    if (response.success && response.data?.token) {
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

      if (response.data.adminProfile) {
        dispatch(setAdminProfile(response.data.adminProfile));
        setIsAuthenticated(true);
        console.log("✅ Direct API callback successful");
        return true;
      }
    }

    throw new Error("Invalid response structure");
  } catch (err) {
    console.error("❌ Direct API callback error:", err);
    return false;
  }
};

// ==================================================
// UNIVERSAL HANDLER - Xử lý tất cả các trường hợp
// ==================================================

export const handleAdminMicrosoftAuth = async (
  codeOrSearchParams,
  dispatch,
  setIsAuthenticated,
  navigate
) => {
  // Nếu là URLSearchParams từ backend callback
  if (
    codeOrSearchParams instanceof URLSearchParams ||
    (typeof codeOrSearchParams === "object" &&
      codeOrSearchParams !== null &&
      codeOrSearchParams.get)
  ) {
    console.log("🔄 Processing backend callback...");
    return handleBackendCallback(
      codeOrSearchParams,
      dispatch,
      setIsAuthenticated,
      navigate
    );
  }

  // Nếu là auth code từ legacy flow
  if (typeof codeOrSearchParams === "string") {
    console.log("🔄 Processing legacy auth code...");
    const success = await handleDirectApiCallback(
      codeOrSearchParams,
      dispatch,
      setIsAuthenticated
    );
    if (success) {
      navigate("/admin/dashboard", { replace: true });
      return { success: true };
    }
    return { success: false, error: "Auth failed" };
  }

  return { success: false, error: "Invalid parameters" };
};

// ==================================================
// HELPER FUNCTIONS
// ==================================================

export const generateRandomString = (length = 32) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const createMicrosoftAuthUrl = (clientId, tenantId = "common") => {
  const state = generateRandomString(32);

  // Lưu state để validate sau
  Cookies.set("admin_microsoft_auth_state", state, {
    secure: true,
    sameSite: "Lax",
    expires: 1 / 24, // 1 giờ
  });

  const redirectUri = "https://giasuvlu.click/api/admin/auth/callback";

  return (
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
    `client_id=${clientId}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent("openid profile email")}&` +
    `state=${state}&` +
    `response_mode=query`
  );
};

// ==================================================
// BACKEND IMPLEMENTATION GUIDE
// ==================================================

/**
 * BACKEND CẦN IMPLEMENT:
 *
 * 1. Endpoint: POST /api/admin/auth/callback
 *    - Nhận: { code, state } từ Microsoft OAuth
 *    - Xử lý: Exchange code → access token → user info
 *    - Trả về: Redirect với token và admin data
 *
 * 2. Redirect format khi thành công:
 *    https://giasuvlu.click/admin/dashboard?token={jwt_token}&admin={base64_admin_data}&state={state}
 *
 * 3. Redirect format khi lỗi:
 *    https://giasuvlu.click/admin/dashboard?error={error_message}&state={state}
 *
 * 4. Admin data structure (trước khi base64 encode):
 *    {
 *      "adminId": "admin_unique_id",
 *      "name": "Admin Full Name",
 *      "email": "admin@example.com",
 *      "role": "admin",
 *      "avatar": "avatar_url_optional",
 *      "permissions": ["manage_users", "view_analytics"]
 *    }
 *
 * 5. JWT Token payload nên chứa:
 *    {
 *      "sub": "admin_unique_id",
 *      "role": "admin",
 *      "iat": timestamp,
 *      "exp": timestamp,
 *      "iss": "giasuvlu.click"
 *    }
 */

// ==================================================
// USAGE EXAMPLES
// ==================================================

/**
 * 1. AdminLogin.jsx - Khởi tạo đăng nhập:
 *
 * import { createMicrosoftAuthUrl } from './admin-oauth-alternative-handlers';
 *
 * const handleMicrosoftLogin = () => {
 *   const clientId = process.env.REACT_APP_MICROSOFT_CLIENT_ID;
 *   const authUrl = createMicrosoftAuthUrl(clientId);
 *   window.location.href = authUrl;
 * };
 *
 *
 * 2. AdminDashboard.jsx - Xử lý callback:
 *
 * import { handleAdminMicrosoftAuth } from './admin-oauth-alternative-handlers';
 *
 * useEffect(() => {
 *   const searchParams = new URLSearchParams(location.search);
 *
 *   if (searchParams.has('token') || searchParams.has('error')) {
 *     const result = handleAdminMicrosoftAuth(
 *       searchParams,
 *       dispatch,
 *       setIsAuthenticated,
 *       navigate
 *     );
 *
 *     if (result.needsFetch) {
 *       fetchAdminProfile(); // Fallback để lấy profile từ API
 *     }
 *   }
 * }, [location.search]);
 *
 *
 * 3. Environment Variables cần thiết:
 *
 * REACT_APP_MICROSOFT_CLIENT_ID=your-azure-app-client-id
 * REACT_APP_MICROSOFT_TENANT_ID=your-tenant-id-or-common
 */

// ==================================================
// FLOW DIAGRAM
// ==================================================

/**
 * LUỒNG ĐĂNG NHẬP MICROSOFT CHO ADMIN:
 *
 * 1. [Frontend] User click "Đăng nhập Microsoft"
 *    ↓
 * 2. [Frontend] Tạo state, redirect đến Microsoft OAuth
 *    ↓
 * 3. [Microsoft] User đăng nhập, consent permissions
 *    ↓
 * 4. [Microsoft] Redirect về backend: /api/admin/auth/callback?code=xxx&state=xxx
 *    ↓
 * 5. [Backend] Exchange code → access token
 *    ↓
 * 6. [Backend] Get user info từ Microsoft Graph API
 *    ↓
 * 7. [Backend] Tạo JWT token, encode admin data
 *    ↓
 * 8. [Backend] Redirect về frontend: /admin/dashboard?token=xxx&admin=xxx&state=xxx
 *    ↓
 * 9. [Frontend] Validate state, lưu token, decode admin data
 *    ↓
 * 10. [Frontend] setIsAuthenticated(true), clean URL
 *     ↓
 * 11. ✅ Admin đã đăng nhập thành công!
 *
 * ERROR HANDLING:
 * - Nếu bất kỳ bước nào fail → Backend redirect với ?error=xxx&state=xxx
 * - Frontend hiển thị lỗi và quay về login page
 */
