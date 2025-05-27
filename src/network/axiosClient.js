// src/utils/axiosClient.js
import axios from "axios";
import Cookies from "js-cookie"; // Cho user token

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

axiosClient.interceptors.request.use(
  function (config) {
    const url = config.url || "";
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

    if (isNoAuthEndpoint) {
      delete config.headers.Authorization;
    } else if (url.startsWith("meeting/")) {
      if (zoomAccessToken) {
        config.headers.Authorization = `Bearer ${zoomAccessToken}`;
      } else {
        /* console.warn for missing zoom token */
      }
    } else if (userSystemToken) {
      config.headers.Authorization = `Bearer ${userSystemToken}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  function (response) {
    return response.data; // Trả về response.data trực tiếp
  },
  async function (error) {
    const originalRequest = error.config;
    const url = originalRequest.url || "";

    if (error.response && error.response.status === 401) {
      if (
        url.startsWith("meeting/") &&
        url !== "meeting/zoom/refresh" &&
        !originalRequest._retryZoom
      ) {
        if (isRefreshingZoomToken) {
          return new Promise(/* queue logic */);
        }
        originalRequest._retryZoom = true;
        isRefreshingZoomToken = true;
        const zoomRefreshToken = localStorage.getItem("zoomRefreshToken");

        if (zoomRefreshToken) {
          try {
            const refreshResponseData = await axios
              .post(
                // Dùng axios gốc
                `${axiosClient.defaults.baseURL}meeting/zoom/refresh`,
                { refreshToken: zoomRefreshToken }
              )
              .then((res) => res.data); // Lấy data từ response của axios.post

            if (
              refreshResponseData &&
              refreshResponseData.success &&
              refreshResponseData.data &&
              refreshResponseData.data.result
            ) {
              const { accessToken, refreshToken: newRefreshToken } =
                refreshResponseData.data.result;
              localStorage.setItem("zoomAccessToken", accessToken);
              if (newRefreshToken)
                localStorage.setItem("zoomRefreshToken", newRefreshToken);
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              processZoomQueue(null, accessToken);
              isRefreshingZoomToken = false;
              return axiosClient(originalRequest);
            } else {
              throw new Error(
                refreshResponseData?.message ||
                  "Refresh Zoom token response invalid."
              );
            }
          } catch (refreshError) {
            processZoomQueue(refreshError, null);
            localStorage.removeItem("zoomAccessToken");
            localStorage.removeItem("zoomRefreshToken");
            isRefreshingZoomToken = false;
            return Promise.reject(refreshError.response ? refreshError : error);
          }
        } else {
          isRefreshingZoomToken = false;
          // Không có refresh token, để lỗi 401 được trả về
        }
      } else if (!url.startsWith("meeting/")) {
        Cookies.remove("token");
        // Để component xử lý việc redirect hoặc thông báo lỗi
      }
    }
    return Promise.reject(error);
  }
);
export default axiosClient;
