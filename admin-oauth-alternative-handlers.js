// ADMIN MICROSOFT OAUTH - BACKEND REDIRECT FLOW
// File: admin-oauth-alternative-handlers.js

// Import dependencies
import Api from "../src/network/Api";
import { METHOD_TYPE } from "../src/network/methodType";
import { setAdminProfile } from "../src/redux/adminSlice";
import Cookies from "js-cookie";

// ==================================================
// LUỒNG THỰC TẾ: Backend xử lý toàn bộ OAuth và redirect về frontend
// ==================================================

/**
 * Luồng hoạt động thực tế (theo backend implementation):
 * 1. Frontend: Call API /api/admin/auth/get-uri-microsoft → lấy OAuth URL
 * 2. Frontend: Redirect user đến OAuth URL
 * 3. Microsoft: User đăng nhập → redirect về /api/admin/auth/callback?code=xxx
 * 4. Backend: Xử lý callback tự động:
 *    - Exchange code với Microsoft để lấy access token
 *    - Lấy user info từ Microsoft Graph API
 *    - Tạo JWT token cho app
 *    - Redirect về frontend: /admin/dashboard?token=xxx&admin=xxx
 * 5. Frontend: Lấy token từ URL params và lưu authentication
 */

// ==================================================
// BƯỚC 1: Lấy Microsoft OAuth URL từ backend
// ==================================================

export const getMicrosoftAuthUrl = async () => {
  try {
    const response = await Api({
      endpoint: "/api/admin/auth/get-uri-microsoft",
      method: METHOD_TYPE.GET,
    });

    if (response.success && response.data?.authUrl) {
      console.log("✅ Got Microsoft OAuth URL from backend");
      return { success: true, authUrl: response.data.authUrl };
    }

    throw new Error("Invalid response from get-uri-microsoft API");
  } catch (err) {
    console.error("❌ Error getting Microsoft OAuth URL:", err);
    return { success: false, error: err.message };
  }
};

// ==================================================
// BƯỚC 2: Xử lý redirect từ backend sau khi OAuth thành công
// ==================================================

export const extractTokenFromRedirect = () => {
  // Backend redirect về frontend với token trong URL:
  // /admin/dashboard?token=xxx&admin=xxx&state=xxx
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const adminData = urlParams.get("admin");
  const state = urlParams.get("state");
  const error = urlParams.get("error");

  if (error) {
    console.error("❌ Microsoft OAuth error from backend:", error);
    return { success: false, error };
  }

  if (token) {
    console.log("✅ Got token from backend redirect");
    let adminProfile = null;

    // Decode admin data nếu có
    if (adminData) {
      try {
        adminProfile = JSON.parse(decodeURIComponent(adminData));
        console.log("✅ Decoded admin profile from redirect");
      } catch (err) {
        console.warn("⚠️ Could not decode admin data:", err);
      }
    }

    return { success: true, token, adminProfile, state };
  }

  return { success: false, error: "No token found in redirect URL" };
};

// ==================================================
// BƯỚC 3: Lưu authentication data từ backend redirect
// ==================================================

export const saveAuthenticationFromRedirect = (
  token,
  adminProfile,
  dispatch,
  setIsAuthenticated
) => {
  try {
    // Lưu token vào cookies
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

    // Lưu admin profile nếu có
    if (adminProfile) {
      dispatch(setAdminProfile(adminProfile));
      setIsAuthenticated(true);
      console.log("✅ Microsoft authentication complete with profile");
      return { success: true, hasProfile: true };
    } else {
      setIsAuthenticated(true);
      console.log(
        "✅ Microsoft authentication complete, need to fetch profile"
      );
      return { success: true, hasProfile: false };
    }
  } catch (err) {
    console.error("❌ Error saving authentication:", err);
    return { success: false, error: err.message };
  }
};

// ==================================================
// UNIVERSAL HANDLER - Xử lý toàn bộ luồng Microsoft OAuth
// ==================================================

export const handleAdminMicrosoftAuth = async (
  dispatch,
  setIsAuthenticated,
  navigate
) => {
  try {
    // Kiểm tra xem có token trong URL không (từ backend redirect)
    const redirectResult = extractTokenFromRedirect();

    if (redirectResult.success && redirectResult.token) {
      // Có token từ backend redirect, lưu authentication
      console.log(
        "🔄 Processing Microsoft authentication from backend redirect..."
      );

      const authResult = saveAuthenticationFromRedirect(
        redirectResult.token,
        redirectResult.adminProfile,
        dispatch,
        setIsAuthenticated
      );

      if (authResult.success) {
        // Clean URL sau khi lưu authentication thành công
        navigate("/admin/dashboard", { replace: true });
        return {
          success: true,
          needsFetch: !authResult.hasProfile,
        };
      } else {
        return { success: false, error: authResult.error };
      }
    } else if (redirectResult.error) {
      // Có error từ backend redirect
      return { success: false, error: redirectResult.error };
    } else {
      // Không có token, bắt đầu luồng OAuth mới
      console.log("🔄 Starting new Microsoft OAuth flow...");
      const urlResult = await getMicrosoftAuthUrl();

      if (urlResult.success) {
        // Redirect đến Microsoft OAuth URL
        window.location.href = urlResult.authUrl;
        return { success: true, redirecting: true };
      } else {
        return { success: false, error: urlResult.error };
      }
    }
  } catch (error) {
    console.error("❌ Microsoft OAuth handler error:", error);
    return { success: false, error: error.message };
  }
};

// ==================================================
// HELPER FUNCTIONS (Deprecated - không cần nữa)
// ==================================================

// Các helper functions này không còn cần thiết vì backend đã handle OAuth URL generation
export const generateRandomString = (length = 32) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Deprecated: Sử dụng getMicrosoftAuthUrl() thay thế
export const createMicrosoftAuthUrl = (clientId, tenantId = "common") => {
  console.warn(
    "⚠️ createMicrosoftAuthUrl is deprecated. Use getMicrosoftAuthUrl() instead."
  );
  console.warn("⚠️ Parameters ignored:", { clientId, tenantId });
  return null;
};

// ==================================================
// BACKEND IMPLEMENTATION GUIDE
// ==================================================

/**
 * BACKEND API ENDPOINTS THỰC TẾ:
 *
 * 1. GET /api/admin/auth/get-uri-microsoft
 *    - Mục đích: Lấy Microsoft OAuth URL đã config sẵn
 *    - Response: { success: true, data: { authUrl: "https://login.microsoftonline.com/..." } }
 *
 * 2. GET /api/admin/auth/callback?code=xxx&state=xxx (Backend xử lý tự động)
 *    - Microsoft redirect đến URL này với authorization code
 *    - Backend tự động:
 *      + Exchange code với Microsoft để lấy access token
 *      + Lấy user info từ Microsoft Graph API
 *      + Tạo JWT token cho app
 *      + Redirect về frontend: /admin/dashboard?token=xxx&admin=xxx
 *
 * 3. FRONTEND chỉ cần:
 *    - Lấy OAuth URL từ API 1 và redirect
 *    - Nhận token từ URL params sau khi backend redirect về
 *    - Lưu token và authentication state
 */

// ==================================================
// USAGE EXAMPLES
// ==================================================

/**
 * 1. AdminLogin.jsx - Khởi tạo đăng nhập:
 *
 * import { getMicrosoftAuthUrl } from './admin-oauth-alternative-handlers';
 *
 * const handleMicrosoftLogin = async () => {
 *   const result = await getMicrosoftAuthUrl();
 *   if (result.success) {
 *     window.location.href = result.authUrl;
 *   } else {
 *     console.error('Failed to get OAuth URL:', result.error);
 *   }
 * };
 *
 *
 * 2. AdminDashboard.jsx - Xử lý redirect từ backend:
 *
 * import { handleAdminMicrosoftAuth } from './admin-oauth-alternative-handlers';
 *
 * useEffect(() => {
 *   const searchParams = new URLSearchParams(location.search);
 *
 *   // Kiểm tra nếu có token hoặc error từ backend redirect
 *   if (searchParams.has('token') || searchParams.has('error')) {
 *     handleAdminMicrosoftAuth(dispatch, setIsAuthenticated, navigate)
 *       .then(result => {
 *         if (result.success && result.needsFetch) {
 *           fetchAdminProfile(); // Fallback để lấy profile từ API
 *         } else if (!result.success) {
 *           console.error('OAuth error:', result.error);
 *           // Hiển thị lỗi cho user
 *         }
 *       });
 *   }
 * }, [location.search]);
 *
 *
 * 3. Environment Variables (nếu cần, nhưng backend đã handle):
 *
 * REACT_APP_API_BASE_URL=https://giasuvlu.click
 */

// ==================================================
// FLOW DIAGRAM
// ==================================================

/**
 * LUỒNG ĐĂNG NHẬP MICROSOFT CHO ADMIN (THỰC TẾ):
 *
 * 1. [Frontend] User click "Đăng nhập Microsoft"
 *    ↓
 * 2. [Frontend] Call API GET /api/admin/auth/get-uri-microsoft
 *    ↓
 * 3. [Backend] Trả về OAuth URL: https://login.microsoftonline.com/.../authorize?redirect_uri=https://giasuvlu.click/api/admin/auth/callback
 *    ↓
 * 4. [Frontend] Redirect user đến OAuth URL
 *    ↓
 * 5. [Microsoft] User đăng nhập, consent permissions
 *    ↓
 * 6. [Microsoft] Redirect về BACKEND CALLBACK URL:
 *    GET https://giasuvlu.click/api/admin/auth/callback?code=xxx&state=xxx
 *    ↓
 * 7. [Backend] Xử lý callback TỰ ĐỘNG:
 *    - Validate state parameter
 *    - Exchange code với Microsoft để lấy access token
 *    - Get user info từ Microsoft Graph API
 *    - Tạo JWT token cho app
 *    - Encode admin profile data
 *    ↓
 * 8. [Backend] Redirect về FRONTEND với authentication data:
 *    GET https://giasuvlu.click/admin/dashboard?token=xxx&admin=encoded_profile&state=xxx
 *    ↓
 * 9. [Frontend AdminDashboard] Nhận URL params và xử lý:
 *    - Validate state parameter
 *    - Lưu token vào cookies/localStorage
 *    - Decode và lưu admin profile
 *    - setIsAuthenticated(true)
 *    - Clean URL parameters
 *    ↓
 * 10. ✅ Admin đã đăng nhập thành công!
 *
 * ERROR HANDLING:
 * - Nếu bất kỳ bước nào fail → Backend redirect với:
 *   https://giasuvlu.click/admin/dashboard?error=error_description&state=xxx
 * - Frontend detect error parameter và hiển thị thông báo lỗi
 *
 * IMPORTANT NOTES:
 * - /api/admin/auth/callback: Backend callback URL (Microsoft redirects here, backend xử lý tự động)
 * - /admin/dashboard: Frontend route (Backend redirects here sau khi xử lý xong OAuth)
 * - Backend XỬ LÝ TẤT CẢ OAuth flow, Frontend chỉ cần lấy URL và nhận kết quả
 * - Frontend KHÔNG cần gọi thêm API nào khác để đăng nhập
 */
