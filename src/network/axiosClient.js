// src/utils/axiosClient.js (hoặc src/network/axiosClient.js)
import axios from "axios";
import Cookies from "js-cookie"; // Vẫn dùng cho user token (token đăng nhập hệ thống)

const axiosClient = axios.create({
  baseURL: "https://giasuvlu.click/api/", // Giữ nguyên baseURL của bạn
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshingZoomToken = false;
let zoomFailedQueue = [];

const processZoomQueue = (error, token = null) => {
  zoomFailedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  zoomFailedQueue = [];
};

// --- Request Interceptor ---
axiosClient.interceptors.request.use(
  function (config) {
    const userSystemToken = Cookies.get("token");
    const zoomAccessToken = localStorage.getItem("zoomAccessToken"); // ĐỔI SANG LOCALSTORAGE

    // config.url là phần sau baseURL, ví dụ: "meeting/auth", "users/profile"
    // Ưu tiên kiểm tra các API đặc thù cho Zoom trước
    // Giả sử các endpoint API của bạn cho Zoom đều bắt đầu bằng "meeting/"
    if (config.url.startsWith("meeting/")) { // << CÁCH PHÂN BIỆT API ZOOM MỚI
      const noZoomTokenEndpoints = [
        "meeting/auth",
        "meeting/handle",
        "meeting/zoom/refresh"
      ];
      if (!noZoomTokenEndpoints.includes(config.url)) {
        if (zoomAccessToken) {
          config.headers.Authorization = `Bearer ${zoomAccessToken}`;
        } else {
          // console.warn(`axiosClient: Zoom Access Token (localStorage) not found for ${config.url}`);
        }
      } else {
        delete config.headers.Authorization; // Xóa token nếu có cho các endpoint không cần
      }
    }
    // Các API khác của hệ thống (không phải Zoom)
    else if (userSystemToken) {
      config.headers.Authorization = `Bearer ${userSystemToken}`;
    }

    // Xử lý FormData giữ nguyên như cũ của bạn
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
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
    return response.data; // << GIỮ NGUYÊN TRẢ VỀ response.data
  },
  async function (error) {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401) {
      // Xử lý cho Zoom Token
      if (originalRequest.url.startsWith("meeting/") && originalRequest.url !== "meeting/zoom/refresh" && !originalRequest._retryZoom) {
        if (isRefreshingZoomToken) {
          return new Promise(function(resolve, reject) {
            zoomFailedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axiosClient(originalRequest); // Gọi lại bằng axiosClient
          }).catch(err => {
            return Promise.reject(err);
          });
        }
        originalRequest._retryZoom = true;
        isRefreshingZoomToken = true;
        const zoomRefreshToken = localStorage.getItem("zoomRefreshToken"); // ĐỔI SANG LOCALSTORAGE

        if (zoomRefreshToken) {
          try {
            console.log("[axiosClient] Attempting to refresh Zoom token...");
            // Dùng axios.post GỐC để tránh vòng lặp, và URL đầy đủ
            const refreshResponse = await axios.post(
              `${axiosClient.defaults.baseURL}meeting/zoom/refresh`, // Nối baseURL của instance
              { refreshToken: zoomRefreshToken }
            );
            // refreshResponse.data ở đây là object mà backend trả về (đã qua JSON.parse nếu là JSON)
            // Giả sử backend trả về { success: true, data: { result: { accessToken, refreshToken } } }
            if (refreshResponse.data && refreshResponse.data.success && refreshResponse.data.data && refreshResponse.data.data.result) {
              const newAccessToken = refreshResponse.data.data.result.accessToken;
              const newRefreshToken = refreshResponse.data.data.result.refreshToken;

              localStorage.setItem("zoomAccessToken", newAccessToken); // ĐỔI SANG LOCALSTORAGE
              if (newRefreshToken) {
                localStorage.setItem("zoomRefreshToken", newRefreshToken); // ĐỔI SANG LOCALSTORAGE
              }
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              processZoomQueue(null, newAccessToken);
              isRefreshingZoomToken = false;
              return axiosClient(originalRequest); // Thử lại request gốc bằng axiosClient
            } else {
              // Nếu cấu trúc không đúng, hoặc success là false
              console.error("Refresh Zoom token response invalid structure or success:false", refreshResponse.data);
              throw new Error(refreshResponse.data?.message || "Refresh Zoom token response invalid.");
            }
          } catch (refreshErrorCatch) {
            console.error("axiosClient: Failed to refresh Zoom token (catch block).", refreshErrorCatch.response?.data || refreshErrorCatch.message);
            processZoomQueue(refreshErrorCatch, null);
            localStorage.removeItem("zoomAccessToken");
            localStorage.removeItem("zoomRefreshToken");
            isRefreshingZoomToken = false;
            // Quan trọng: Ném lỗi để component xử lý, không tự động redirect
            return Promise.reject(refreshErrorCatch.response ? refreshErrorCatch : error);
          }
        } else {
          console.warn("axiosClient: No Zoom refresh token found in localStorage. Cannot refresh.");
          isRefreshingZoomToken = false;
          // Để lỗi 401 gốc được trả về nếu không có refresh token
        }
      }
      // Xử lý cho User System Token (lỗi 401 từ API không phải Zoom)
      else if (!originalRequest.url.startsWith("meeting/")) {
        console.warn("axiosClient: User system token expired or invalid (401).");
        Cookies.remove("token");
        window.location.href = "/login"; // Giữ lại hành vi redirect cũ của bạn nếu đây là mong muốn
      }
    }
    return Promise.reject(error); // Trả về lỗi để Api.js và component có thể bắt
  }
);

export default axiosClient;