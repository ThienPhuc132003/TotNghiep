// src/utils/axiosClient.js
import axios from "axios";
import Cookies from "js-cookie"; // Vẫn dùng cho user token

// Đặt REACT_APP_API_BASE_URL trong file .env ở thư mục gốc của dự án
// Ví dụ: REACT_APP_API_BASE_URL=http://localhost:YOUR_BACKEND_PORT/api/v1
// Nếu bạn dùng cổng 3000 cho BE như redirect_uri thì ví dụ: REACT_APP_API_BASE_URL=http://localhost:3000/api
// Nếu dùng Vite:
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://giasuvlu.click/api/"; // THAY BẰNG BASE URL CỦA BẠN

// Nếu dùng Create React App, hãy dùng process.env như cũ, nhưng đảm bảo code chạy trong môi trường hỗ trợ (CRA).
// Nếu không chắc, hãy dùng giá trị mặc định hoặc cấu hình qua biến toàn cục.

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Request Interceptor ---
axiosClient.interceptors.request.use(
  function (config) {
    const url = config.url || "";
    const userToken = Cookies.get("token");

    // Các endpoint Zoom không cần token Authorization trong header
    const zoomPublicEndpoints = [
      "/meeting/auth", // Lấy URL xác thực Zoom
      "/meeting/handle", // Xử lý callback từ Zoom (nhận authorizationCode)
      "/meeting/zoom/refresh", // API refresh token (gửi refreshToken trong body)
    ];

    if (zoomPublicEndpoints.some((endpoint) => url.endsWith(endpoint))) {
      delete config.headers.Authorization; // Xóa header Authorization nếu có
      console.log(
        `axiosClient: No Authorization header for public Zoom endpoint: ${url}`
      );
    }
    // API liên quan đến Zoom (cần access token của Zoom từ localStorage)
    // Ví dụ: /meeting/create, /meeting/signature
    else if (url.startsWith("/meeting/")) {
      const zoomAccessToken = localStorage.getItem("zoomAccessToken"); // ĐỌC TỪ LOCALSTORAGE
      if (zoomAccessToken) {
        config.headers.Authorization = `Bearer ${zoomAccessToken}`;
        console.log(
          `axiosClient: Added Zoom Access Token (localStorage) for: ${url}`
        );
      } else {
        console.warn(
          `axiosClient: Zoom Access Token (localStorage) not found for: ${url}. BE might return 401.`
        );
      }
    }
    // API hệ thống khác (sử dụng userToken từ Cookies)
    else {
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
        console.log(`axiosClient: Added User Token (Cookies) for: ${url}`);
      } else {
        console.warn(
          `axiosClient: User Token (Cookies) not found for: ${url}. BE might return 401.`
        );
      }
    }

    if (config.data instanceof FormData) {
      // axios tự động xử lý Content-Type cho FormData thành multipart/form-data
      // không cần delete config.headers["Content-Type"];
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
axiosClient.interceptors.response.use(
  function (response) {
    return response.data; // Giữ nguyên: trả về response.data cho các phần khác của ứng dụng
  },
  async function (error) {
    const originalRequest = error.config;
    const url = originalRequest.url || "";

    // Chỉ xử lý lỗi 401 và cho API Zoom (không phải request refresh)
    if (
      error.response &&
      error.response.status === 401 &&
      url.startsWith("/meeting/") && // Là API của Zoom
      !url.endsWith("/meeting/zoom/refresh") && // Không phải là chính request refresh
      !originalRequest._retryZoom
    ) {
      // Đảm bảo chỉ thử lại 1 lần cho Zoom

      originalRequest._retryZoom = true; // Đánh dấu đã thử refresh
      const zoomRefreshToken = localStorage.getItem("zoomRefreshToken"); // ĐỌC TỪ LOCALSTORAGE

      if (zoomRefreshToken) {
        try {
          console.log(
            "axiosClient: Attempting to refresh Zoom token (localStorage)..."
          );
          // Gọi API refresh bằng axios gốc (hoặc instance mới) để tránh vòng lặp interceptor
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/meeting/zoom/refresh`,
            {
              refreshToken: zoomRefreshToken,
            }
          );
          // refreshResponse.data chứa kết quả từ API (vì axios gốc trả về response object)
          const newAccessToken = refreshResponse.data.result.accessToken;
          const newRefreshToken = refreshResponse.data.result.refreshToken;

          localStorage.setItem("zoomAccessToken", newAccessToken); // LƯU VÀO LOCALSTORAGE
          if (newRefreshToken) {
            // Zoom có thể trả về refresh token mới
            localStorage.setItem("zoomRefreshToken", newRefreshToken); // LƯU VÀO LOCALSTORAGE
          }
          console.log(
            "axiosClient: Zoom token refreshed successfully (localStorage). Retrying original request."
          );
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosClient(originalRequest); // Gọi lại request gốc với token mới
        } catch (refreshError) {
          console.error(
            "axiosClient: Failed to refresh Zoom token:",
            refreshError.response?.data || refreshError.message
          );
          localStorage.removeItem("zoomAccessToken");
          localStorage.removeItem("zoomRefreshToken");
          // Không tự động redirect, để component gọi Api.js xử lý lỗi này
          // Ví dụ: hiển thị thông báo "Vui lòng kết nối lại Zoom"
          return Promise.reject(
            refreshError.response?.data
              ? refreshError.response.data
              : refreshError.message || "Zoom token refresh failed"
          );
        }
      } else {
        console.warn(
          "axiosClient: No Zoom refresh token (localStorage) found for 401 error on Zoom API. Original error will be propagated."
        );
        // Không có refresh token, lỗi 401 gốc sẽ được trả về
      }
    }
    // Xử lý lỗi 401 cho user token (giữ nguyên logic cũ của bạn nếu đang hoạt động tốt)
    else if (
      error.response &&
      error.response.status === 401 &&
      !url.startsWith("/meeting/")
    ) {
      console.log(
        "axiosClient: User token (Cookies) expired or invalid for non-Zoom API. Redirecting to /login as per original logic."
      );
      Cookies.remove("token");
      // Cookies.remove("userRefreshToken"); // Nếu bạn có user refresh token
      window.location.href = "/login"; // Hành vi cũ của bạn
    }

    // Trả về lỗi để hàm gọi Api.js hoặc component có thể bắt
    // Nếu error.response tồn tại, trả về error.response.data (nếu có) hoặc error.response
    // Nếu không, trả về error object
    return Promise.reject(error.response?.data || error.response || error);
  }
);

export default axiosClient;
