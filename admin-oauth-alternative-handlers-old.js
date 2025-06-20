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
// KỊCH BẢN 1: Backend redirect với token và admin data
// ==================================================

export const handleBackendCallback = (searchParams, dispatch, setIsAuthenticated, navigate) => {
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
      expires: 7
    });
    Cookies.set("role", "admin", {
      secure: true,
      sameSite: "Lax",
      expires: 7
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

const handleDirectApiCallback = async (authCode, dispatch, setIsAuthenticated) => {
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
        expires: 7
      });
      Cookies.set("role", "admin", { 
        secure: true, 
        sameSite: "Lax", 
        expires: 7 
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
  if (codeOrSearchParams instanceof URLSearchParams || 
      (typeof codeOrSearchParams === 'object' && codeOrSearchParams !== null)) {
    console.log("🔄 Processing backend callback...");
    return handleBackendCallback(codeOrSearchParams, dispatch, setIsAuthenticated, navigate);
  }

  // Nếu là auth code từ legacy flow
  if (typeof codeOrSearchParams === 'string') {
    console.log("🔄 Processing legacy auth code...");
    const success = await handleDirectApiCallback(codeOrSearchParams, dispatch, setIsAuthenticated);
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
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
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
    expires: 1/24 // 1 giờ
  });

  const redirectUri = "https://giasuvlu.click/api/admin/auth/callback";
  
  return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
    `client_id=${clientId}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent("openid profile email")}&` +
    `state=${state}&` +
    `response_mode=query`;
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
 *  * ERROR HANDLING:
 * - Nếu bất kỳ bước nào fail → Backend redirect với ?error=xxx&state=xxx
 * - Frontend hiển thị lỗi và quay về login page
 */

const handleCompleteResponse = async (
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
      // Lưu token
      Cookies.set("token", response.data.token, {
        secure: true,
        sameSite: "Lax",
      });
      Cookies.set("role", "admin", { secure: true, sameSite: "Lax" });

      // Backend trả về luôn admin profile
      if (response.data.adminProfile) {
        dispatch(setAdminProfile(response.data.adminProfile));
        setIsAuthenticated(true);
        console.log("✅ Direct admin profile from OAuth callback");
        return true;
      }
    }

    throw new Error("Invalid response structure");
  } catch (err) {
    console.error("OAuth Complete Response Error:", err);
    return false;
  }
};

// ==================================================
// KỊCH BẢN 2: Backend sử dụng polling mechanism
// ==================================================

const handlePollingAuth = async (authCode, dispatch, setIsAuthenticated) => {
  try {
    // Bước 1: Gửi auth code đến backend
    const initResponse = await Api({
      endpoint: "admin/auth/initiate",
      method: METHOD_TYPE.POST,
      data: { code: authCode },
    });

    if (!initResponse.success || !initResponse.data?.sessionId) {
      throw new Error("Failed to initiate auth session");
    }

    const sessionId = initResponse.data.sessionId;
    console.log(`🔄 Polling auth session: ${sessionId}`);

    // Bước 2: Poll cho đến khi có kết quả
    const pollAuth = async () => {
      for (let i = 0; i < 30; i++) {
        // Tối đa 30 lần (30 giây)
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Chờ 1 giây

        const pollResponse = await Api({
          endpoint: `admin/auth/status/${sessionId}`,
          method: METHOD_TYPE.GET,
        });

        if (pollResponse.success) {
          if (pollResponse.data.status === "completed") {
            // Auth thành công
            const { token, adminProfile } = pollResponse.data;

            Cookies.set("token", token, { secure: true, sameSite: "Lax" });
            Cookies.set("role", "admin", { secure: true, sameSite: "Lax" });
            dispatch(setAdminProfile(adminProfile));
            setIsAuthenticated(true);

            console.log("✅ Polling auth completed successfully");
            return true;
          } else if (pollResponse.data.status === "failed") {
            throw new Error(pollResponse.data.error || "Auth failed");
          }
          // Nếu status === "pending", tiếp tục poll
        }
      }

      throw new Error("Auth timeout after 30 seconds");
    };

    return await pollAuth();
  } catch (err) {
    console.error("Polling Auth Error:", err);
    return false;
  }
};

// ==================================================
// KỊCH BẢN 3: Backend sử dụng WebSocket real-time
// ==================================================

const handleWebSocketAuth = async (authCode, dispatch, setIsAuthenticated) => {
  return new Promise((resolve, reject) => {
    try {
      // Tạo WebSocket connection
      const ws = new WebSocket(`ws://localhost:8080/admin/auth/ws`);

      ws.onopen = () => {
        console.log("🔌 WebSocket connected for admin auth");

        // Gửi auth code qua WebSocket
        ws.send(
          JSON.stringify({
            type: "AUTH_REQUEST",
            code: authCode,
            timestamp: Date.now(),
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case "AUTH_SUCCESS": {
              const { token, adminProfile } = data.payload;

              Cookies.set("token", token, { secure: true, sameSite: "Lax" });
              Cookies.set("role", "admin", { secure: true, sameSite: "Lax" });
              dispatch(setAdminProfile(adminProfile));
              setIsAuthenticated(true);

              console.log("✅ WebSocket auth completed successfully");
              ws.close();
              resolve(true);
              break;
            }

            case "AUTH_ERROR":
              console.error("❌ WebSocket auth error:", data.error);
              ws.close();
              reject(new Error(data.error));
              break;

            case "AUTH_PROGRESS":
              console.log("🔄 Auth progress:", data.message);
              break;

            default:
              console.log("📨 Unknown WebSocket message:", data);
          }
        } catch (parseError) {
          console.error("WebSocket message parse error:", parseError);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(new Error("WebSocket connection failed"));
      };

      ws.onclose = () => {
        console.log("🔌 WebSocket closed");
      };

      // Timeout after 30 seconds
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
          reject(new Error("WebSocket auth timeout"));
        }
      }, 30000);
    } catch (err) {
      console.error("WebSocket Auth Setup Error:", err);
      reject(err);
    }
  });
};

// ==================================================
// KỊCH BẢN 4: Backend redirect tới success page với data
// ==================================================

const handleRedirectWithData = async (
  dispatch,
  setIsAuthenticated,
  navigate
) => {
  // Trong trường hợp này, Microsoft sẽ redirect đến một page khác
  // và page đó sẽ có admin data được embed

  // Ví dụ: Microsoft redirect tới /admin/auth/success?data=base64encodeddata
  const urlParams = new URLSearchParams(window.location.search);
  const encodedData = urlParams.get("data");

  if (encodedData) {
    try {
      const decodedData = JSON.parse(atob(encodedData));
      const { token, adminProfile } = decodedData;

      if (token && adminProfile) {
        Cookies.set("token", token, { secure: true, sameSite: "Lax" });
        Cookies.set("role", "admin", { secure: true, sameSite: "Lax" });
        dispatch(setAdminProfile(adminProfile));
        setIsAuthenticated(true);

        // Clean URL
        navigate("/admin/dashboard", { replace: true });

        console.log("✅ Redirect with data auth completed");
        return true;
      }
    } catch (err) {
      console.error("Error parsing redirect data:", err);
    }
  }

  return false;
};

// ==================================================
// KỊCH BẢN 5: Backend sử dụng session-based auth
// ==================================================

const handleSessionAuth = async (authCode, dispatch, setIsAuthenticated) => {
  try {
    // Backend tạo session và trả về session ID
    const sessionResponse = await Api({
      endpoint: "admin/auth/create-session",
      method: METHOD_TYPE.POST,
      data: { code: authCode },
    });

    if (sessionResponse.success && sessionResponse.data?.sessionId) {
      const sessionId = sessionResponse.data.sessionId;

      // Lưu session ID thay vì token
      Cookies.set("admin_session", sessionId, {
        secure: true,
        sameSite: "Lax",
        expires: 1, // 1 ngày
      });

      // Lấy admin profile bằng session
      const profileResponse = await Api({
        endpoint: "admin/profile/by-session",
        method: METHOD_TYPE.GET,
        headers: {
          "X-Session-ID": sessionId,
        },
      });

      if (profileResponse.success && profileResponse.data) {
        dispatch(setAdminProfile(profileResponse.data));
        setIsAuthenticated(true);
        console.log("✅ Session-based auth completed");
        return true;
      }
    }

    throw new Error("Session auth failed");
  } catch (err) {
    console.error("Session Auth Error:", err);
    return false;
  }
};

// ==================================================
// UNIVERSAL HANDLER - Tự động detect và sử dụng method phù hợp
// ==================================================

export const handleAdminMicrosoftAuth = async (
  authCode,
  dispatch,
  setIsAuthenticated,
  navigate
) => {
  console.log("🔄 Starting admin Microsoft auth with code:", authCode);
  // Thử các method theo thứ tự ưu tiên
  const methods = [
    {
      name: "Complete Response",
      handler: () =>
        handleCompleteResponse(authCode, dispatch, setIsAuthenticated),
    },
    {
      name: "Polling",
      handler: () => handlePollingAuth(authCode, dispatch, setIsAuthenticated),
    },
    {
      name: "WebSocket",
      handler: () =>
        handleWebSocketAuth(authCode, dispatch, setIsAuthenticated),
    },
    {
      name: "Redirect with Data",
      handler: () =>
        handleRedirectWithData(dispatch, setIsAuthenticated, navigate),
    },
    {
      name: "Session Auth",
      handler: () => handleSessionAuth(authCode, dispatch, setIsAuthenticated),
    },
  ];
  for (const method of methods) {
    try {
      console.log(`🧪 Trying method: ${method.name}`);
      const success = await method.handler();

      if (success) {
        console.log(`✅ Auth successful using method: ${method.name}`);

        // Clean URL sau khi auth thành công
        navigate("/admin/dashboard", { replace: true });
        return true;
      }
    } catch (err) {
      console.warn(`⚠️ Method ${method.name} failed:`, err.message);
      continue; // Thử method tiếp theo
    }
  }

  // Nếu tất cả methods đều fail
  console.error("❌ All auth methods failed");
  setIsAuthenticated(false);
  return false;
};

// ==================================================
// USAGE EXAMPLE trong AdminDashboard.jsx
// ==================================================

/*
import { handleAdminMicrosoftAuth } from './admin-oauth-alternative-handlers';

// Trong useEffect của AdminDashboard.jsx:
useEffect(() => {
  const searchParams = new URLSearchParams(location.search);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (code && state) {
    let isMounted = true;
    console.log("Processing Microsoft OAuth callback on AdminDashboard...");

    const storedState = Cookies.get("microsoft_auth_state");
    if (!storedState || state !== storedState) {
      console.error("OAuth state mismatch - security error");
      Cookies.remove("microsoft_auth_state");
      navigate("/admin/dashboard", { replace: true });
      if (isMounted) {
        setIsAuthenticated(false);
        setIsLoadingData(false);
      }
      return;
    }

    Cookies.remove("microsoft_auth_state");

    // Sử dụng universal handler
    handleAdminMicrosoftAuth(code, dispatch, setIsAuthenticated, navigate)
      .then(success => {
        if (isMounted && success) {
          setIsLoadingData(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error("Admin OAuth error:", err);
          setIsAuthenticated(false);
          setIsLoadingData(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }
}, [location.search, navigate, dispatch]);
*/
