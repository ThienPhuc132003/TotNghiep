// src/utils/axiosClient.js
import axios from "axios";
import Cookies from "js-cookie";
import {
  API_CONFIG,
  logApiCall,
  logApiResponse,
  logApiError,
} from "../utils/envConfig";

// Use environment-specific API base URL
const API_BASE_URL = API_CONFIG.BASE_URL;

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  // Do NOT set default Content-Type here. It will be set per-request as needed.
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
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

axiosClient.interceptors.request.use(
  function (config) {
    const startTime = Date.now();
    config.metadata = { startTime };

    const url = config.url || ""; // Endpoint (phần sau baseURL)
    const method = config.method?.toUpperCase() || "GET";

    // Log API call if in development
    logApiCall(method, url, config.data);

    const userSystemToken = Cookies.get("token");
    const zoomAccessToken = localStorage.getItem("zoomAccessToken");

    const noAuthEndpoints = [
      "auth/login",
      "auth/register",
      "meeting/auth",
      "meeting/handle",
      "meeting/zoom/refresh",
    ];
    const isNoAuthEndpoint = noAuthEndpoints.includes(url);

    // API endpoints that need Zoom token specifically (when they require auth)
    const zoomTokenEndpoints = ["meeting/create", "meeting/signature"];
    const needsZoomToken = zoomTokenEndpoints.some((endpoint) =>
      url.startsWith(endpoint)
    );

    if (isNoAuthEndpoint) {
      delete config.headers.Authorization;
    } else if (needsZoomToken) {
      // API cho Zoom
      if (zoomAccessToken) {
        config.headers.Authorization = `Bearer ${zoomAccessToken}`;
      }
    } else if (userSystemToken) {
      // API hệ thống khác (bao gồm meeting/get-meeting)
      config.headers.Authorization = `Bearer ${userSystemToken}`;
    } else {
      console.warn("⚠️ No authentication token available for", url);
    }

    if (config.data instanceof FormData) {
      // Remove Content-Type if present, let Axios set it for FormData
      if (config.headers && config.headers["Content-Type"]) {
        delete config.headers["Content-Type"];
      }
    } else {
      // For non-FormData requests, ensure Content-Type is application/json
      config.headers = config.headers || {};
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  function (error) {
    console.log("❌ Request Error:", error.message);
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  function (response) {
    const config = response.config;
    const duration = Date.now() - (config.metadata?.startTime || 0);

    // Log API response if in development
    logApiResponse(
      config.method?.toUpperCase() || "GET",
      config.url || "",
      response.status,
      duration,
      response.data
    );

    return response.data; // Trả về response.data trực tiếp
  },
  async function (error) {
    const originalRequest = error.config || {}; // Đảm bảo originalRequest luôn là object
    const url = originalRequest.url || "unknown_url";
    const duration = Date.now() - (originalRequest.metadata?.startTime || 0);

    // Log API error if in development
    logApiError(
      originalRequest.method?.toUpperCase() || "GET",
      url,
      error.response?.status || 0,
      duration,
      error.response?.data || error.message
    );

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
