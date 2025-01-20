import axios from "axios";
import Cookies from "js-cookie";

const axiosClient = axios.create({
  baseURL: "https://giasuvlu.click/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  function (config) {
    const token = Cookies.get("token");
    const zoomAccessToken = Cookies.get("zoomAccessToken");

    if (config.url.includes("zoom")) {
      if (zoomAccessToken) {
        config.headers.Authorization = `Bearer ${zoomAccessToken}`;
      }
    } else {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  function (response) {
    return response.data;
  },
  async function (error) {
    if (error.response && error.response.status === 401) {
      const originalRequest = error.config;
      const refreshToken = Cookies.get("zoomRefreshToken");

      if (refreshToken && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const response = await axiosClient.post("meeting/zoom/refresh", {
            refreshToken: refreshToken,
          });
          const newAccessToken = response.data.result.accessToken;
          const newRefreshToken = response.data.result.refreshToken;
          Cookies.set("zoomAccessToken", newAccessToken);
          Cookies.set("zoomRefreshToken", newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosClient(originalRequest);
        } catch (refreshError) {
          Cookies.remove("zoomAccessToken");
          Cookies.remove("zoomRefreshToken");
          window.location.href = "/login";
        }
      } else {
        Cookies.remove("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;