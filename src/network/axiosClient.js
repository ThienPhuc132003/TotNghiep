// src/utils/axiosClient.js
import axios from "axios";
import Cookies from "js-cookie";

// Lấy VITE_API_BASE_URL từ file .env, đảm bảo kết thúc bằng /
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://giasuvlu.click/api/";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshingZoomToken = false;
let zoomFailedQueue = [];

const processZoomQueue = (error, token = null) => {
  zoomFailedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  zoomFailedQueue = [];
};

// --- Request Interceptor ---
axiosClient.interceptors.request.use(
  function (config) {
    const url = config.url || ""; // Endpoint (phần sau baseURL)
    const userSystemToken = Cookies.get("token");
    const zoomAccessToken = localStorage.getItem("zoomAccessToken");

    // console.log(`[axiosClient Request] START ${config.method?.toUpperCase()} ${config.baseURL}${url}`); // Optional: log chi tiết request

    const noAuthEndpoints = [
      "auth/login",
      "auth/register",
      "meeting/auth",
      "meeting/handle",
      "meeting/zoom/refresh",
    ];
    const isNoAuthEndpoint = noAuthEndpoints.includes(url);

    if (isNoAuthEndpoint) {
      delete config.headers.Authorization;
    } else if (url.startsWith("meeting/")) {
      // API cho Zoom
      if (zoomAccessToken) {
        config.headers.Authorization = `Bearer ${zoomAccessToken}`;
      } else {
        // console.warn(`[axiosClient] Zoom Access Token missing for ${url}`);
      }
    } else if (userSystemToken) {
      // API hệ thống khác
      config.headers.Authorization = `Bearer ${userSystemToken}`;
    }

    if (config.data instanceof FormData) {
      // Axios tự xử lý Content-Type cho FormData
    }
    return config;
  },
  function (error) {
    console.error(
      `[axiosClient Request Error] for ${error.config?.url}:`,
      error.message,
      error
    );
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
axiosClient.interceptors.response.use(
  function (response) {
    // Log message từ response thành công
    if (response.data && typeof response.data.message !== "undefined") {
      // Kiểm tra sự tồn tại của message
      console.log(
        `[axiosClient Response Success] Message for ${response.config.method?.toUpperCase()} ${
          response.config.url
        }:`,
        response.data.message
      );
    } else {
      console.log(
        `[axiosClient Response Success] for ${response.config.method?.toUpperCase()} ${
          response.config.url
        } (No 'message' field). Data:`,
        response.data
      );
    }
    return response.data; // Trả về response.data trực tiếp
  },
  async function (error) {
    const originalRequest = error.config || {}; // Đảm bảo originalRequest luôn là object
    const url = originalRequest.url || "unknown_url";

    // Log message từ response lỗi
    if (
      error.response &&
      error.response.data &&
      typeof error.response.data.message !== "undefined"
    ) {
      console.error(
        `[axiosClient Response Error] Message for ${originalRequest.method?.toUpperCase()} ${url}:`,
        error.response.data.message,
        `(Status: ${error.response.status}) Full error data:`,
        error.response.data
      );
    } else if (error.response && error.response.data) {
      console.error(
        `[axiosClient Response Error] for ${originalRequest.method?.toUpperCase()} ${url} (No 'message' field). Error data:`,
        error.response.data,
        `(Status: ${error.response.status})`
      );
    } else if (error.message) {
      console.error(
        `[axiosClient Network/Setup Error] for ${originalRequest.method?.toUpperCase()} ${url}:`,
        error.message
      );
    } else {
      console.error(
        `[axiosClient Unknown Error] for ${originalRequest.method?.toUpperCase()} ${url}:`,
        error
      );
    }

    // Logic refresh token cho Zoom
    if (error.response && error.response.status === 401) {
      if (
        url.startsWith("meeting/") &&
        url !== "meeting/zoom/refresh" &&
        !originalRequest._retryZoom
      ) {
        if (isRefreshingZoomToken) {
          return new Promise(function (resolve, reject) {
            zoomFailedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers["Authorization"] = "Bearer " + token;
              return axiosClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }
        originalRequest._retryZoom = true;
        isRefreshingZoomToken = true;
        const zoomRefreshToken = localStorage.getItem("zoomRefreshToken");

        if (zoomRefreshToken) {
          try {
            const refreshResponse = await axios.post(
              `${axiosClient.defaults.baseURL}meeting/zoom/refresh`,
              { refreshToken: zoomRefreshToken }
            );
            const backendRefreshResponse = refreshResponse.data; // Đây là {status, code, success, message, data: {result: {...}}}

            if (
              backendRefreshResponse &&
              backendRefreshResponse.success &&
              backendRefreshResponse.data?.result?.accessToken
            ) {
              const { accessToken, refreshToken: newRefreshToken } =
                backendRefreshResponse.data.result;
              localStorage.setItem("zoomAccessToken", accessToken);
              if (newRefreshToken)
                localStorage.setItem("zoomRefreshToken", newRefreshToken);
              console.log(
                "[axiosClient Refresh] Zoom token REFRESHED successfully via API."
              );
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              processZoomQueue(null, accessToken);
              isRefreshingZoomToken = false;
              return axiosClient(originalRequest);
            } else {
              const errMsg =
                backendRefreshResponse?.message ||
                "Refresh Zoom token response invalid.";
              console.error(
                "[axiosClient Refresh] Error (invalid structure/success:false):",
                errMsg,
                backendRefreshResponse
              );
              throw new Error(errMsg); // Ném lỗi để catch bên dưới bắt
            }
          } catch (refreshErrorCatch) {
            processZoomQueue(refreshErrorCatch, null);
            localStorage.removeItem("zoomAccessToken");
            localStorage.removeItem("zoomRefreshToken");
            isRefreshingZoomToken = false;
            console.error(
              "[axiosClient Refresh] CATCH - Failed to refresh Zoom token:",
              refreshErrorCatch.response?.data || refreshErrorCatch.message
            );
            return Promise.reject(
              refreshErrorCatch.response?.data ? refreshErrorCatch : error
            );
          }
        } else {
          isRefreshingZoomToken = false;
          console.warn(
            "[axiosClient Refresh] No Zoom refresh token in localStorage for 401 on meeting API."
          );
          // Để lỗi 401 gốc được trả về, component sẽ xử lý
        }
      } else if (!url.startsWith("meeting/")) {
        // Lỗi 401 từ API hệ thống
        console.warn(
          `[axiosClient Auth] User system token (cookie) might be expired (401) for ${url}. Removing token.`
        );
        Cookies.remove("token");
        // window.location.href = "/login"; // Cân nhắc việc tự động redirect
      }
    }
    return Promise.reject(error);
  }
);
export default axiosClient;
