// src/utils/axiosClient.js
import axios from "axios";
import Cookies from "js-cookie";

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

    console.log(`[axiosClient Request] URL: ${config.baseURL}${url}`);
    console.log(
      "[axiosClient Request] Headers BEFORE modification:",
      JSON.parse(JSON.stringify(config.headers))
    ); // Deep copy for logging

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
      console.log(`[axiosClient Request] Endpoint (${url}) requires NO token.`);
    } else if (url.startsWith("meeting/")) {
      console.log(
        `[axiosClient Request] Endpoint (${url}) is a MEETING endpoint.`
      );
      if (zoomAccessToken) {
        config.headers.Authorization = `Bearer ${zoomAccessToken}`;
        console.log("[axiosClient Request] Zoom Access Token ATTACHED.");
      } else {
        console.warn(
          `[axiosClient Request] Zoom Access Token NOT FOUND in localStorage for ${url}.`
        );
      }
    } else if (userSystemToken) {
      config.headers.Authorization = `Bearer ${userSystemToken}`;
      console.log("[axiosClient Request] User System Token ATTACHED.");
    } else {
      console.warn(
        `[axiosClient Request] No User System Token found for ${url}.`
      );
    }
    console.log(
      "[axiosClient Request] Headers AFTER modification:",
      JSON.parse(JSON.stringify(config.headers))
    );
    return config;
  },
  function (error) {
    console.error("[axiosClient Request Error]", error);
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  function (response) {
    console.log(
      `[axiosClient Response] Success for ${response.config.url}:`,
      response.data
    );
    return response.data; // Trả về response.data trực tiếp
  },
  async function (error) {
    const originalRequest = error.config;
    const url = originalRequest.url || "";
    console.error(
      `[axiosClient Response Error] for ${url}:`,
      error.response || error
    );

    if (error.response && error.response.status === 401) {
      if (
        url.startsWith("meeting/") &&
        url !== "meeting/zoom/refresh" &&
        !originalRequest._retryZoom
      ) {
        if (isRefreshingZoomToken) {
          console.log(
            `[axiosClient Refresh] Queuing request for ${url} as token is already refreshing.`
          );
          return new Promise(/* ... queue logic ... */);
        }
        originalRequest._retryZoom = true;
        isRefreshingZoomToken = true;
        const zoomRefreshToken = localStorage.getItem("zoomRefreshToken");

        if (zoomRefreshToken) {
          try {
            console.log(
              "[axiosClient Refresh] Attempting to refresh Zoom token..."
            );
            const refreshResponse = await axios.post(
              `${axiosClient.defaults.baseURL}meeting/zoom/refresh`,
              { refreshToken: zoomRefreshToken }
            );
            const backendRefreshResponse = refreshResponse.data; // {status, code, success, message, data: {result: {...}}}
            console.log(
              "[axiosClient Refresh] API /meeting/zoom/refresh response:",
              backendRefreshResponse
            );

            if (
              backendRefreshResponse &&
              backendRefreshResponse.success &&
              backendRefreshResponse.data &&
              backendRefreshResponse.data.result
            ) {
              const { accessToken, refreshToken: newRefreshToken } =
                backendRefreshResponse.data.result;
              localStorage.setItem("zoomAccessToken", accessToken);
              if (newRefreshToken)
                localStorage.setItem("zoomRefreshToken", newRefreshToken);
              console.log(
                "[axiosClient Refresh] Zoom token REFRESHED successfully."
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
                "[axiosClient Refresh] Error: ",
                errMsg,
                backendRefreshResponse
              );
              throw new Error(errMsg);
            }
          } catch (refreshErrorCatch) {
            // ... (xử lý lỗi khi refresh thất bại) ...
            console.error(
              "[axiosClient Refresh] CATCH Failed to refresh Zoom token:",
              refreshErrorCatch.response?.data || refreshErrorCatch.message
            );
            processZoomQueue(refreshErrorCatch, null);
            localStorage.removeItem("zoomAccessToken");
            localStorage.removeItem("zoomRefreshToken");
            isRefreshingZoomToken = false;
            return Promise.reject(
              refreshErrorCatch.response ? refreshErrorCatch : error
            );
          }
        } else {
          console.warn(
            "[axiosClient Refresh] No Zoom refresh token found. Cannot refresh."
          );
          isRefreshingZoomToken = false;
        }
      } else if (!url.startsWith("meeting/")) {
        console.warn(
          "[axiosClient Auth] User system token likely expired (401) for non-Zoom API."
        );
        Cookies.remove("token");
      }
    }
    return Promise.reject(error);
  }
);
export default axiosClient;
