// src/utils/axiosClient.js
import axios from "axios";
import Cookies from "js-cookie"; // Cho user token

const axiosClient = axios.create({
  baseURL: "https://giasuvlu.click/api/", // Giữ nguyên baseURL của bạn
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Request Interceptor ---
axiosClient.interceptors.request.use(
  function (config) {
    const userSystemToken = Cookies.get("token"); // Token đăng nhập hệ thống của bạn
    const zoomAccessToken = localStorage.getItem("zoomAccessToken"); // << LẤY TỪ LOCALSTORAGE

    // config.url ở đây là phần sau baseURL, ví dụ: "meeting/auth", "users/profile"
    // Ưu tiên kiểm tra các API đặc thù cho Zoom trước
    // Giả sử các endpoint API của bạn cho Zoom đều bắt đầu bằng "meeting/"
    if (config.url.startsWith("meeting/")) {
      // Các endpoint không cần Zoom Access Token
      const noZoomTokenEndpoints = [
        "meeting/auth", // Lấy URL xác thực
        "meeting/handle", // Xử lý code từ Zoom callback
        "meeting/zoom/refresh", // API refresh token không gửi access token cũ
      ];
      if (!noZoomTokenEndpoints.includes(config.url)) {
        if (zoomAccessToken) {
          config.headers.Authorization = `Bearer ${zoomAccessToken}`;
          console.log(`axiosClient: Added Zoom Access Token for ${config.url}`);
        } else {
          console.warn(
            `axiosClient: Zoom Access Token (localStorage) not found for protected Zoom API: ${config.url}`
          );
        }
      } else {
        // Với các endpoint auth/handle/refresh của Zoom, không cần token Authorization
        // Có thể cần xóa nếu nó được đặt bởi logic userSystemToken ở dưới
        delete config.headers.Authorization;
        console.log(
          `axiosClient: No Authorization header for Zoom special endpoint: ${config.url}`
        );
      }
    }
    // Các API khác của hệ thống (không phải Zoom)
    else if (userSystemToken) {
      config.headers.Authorization = `Bearer ${userSystemToken}`;
      // console.log(`axiosClient: Added User System Token for ${config.url}`);
    }

    if (config.data instanceof FormData) {
      // Axios sẽ tự xử lý Content-Type cho FormData, không cần delete
      // delete config.headers["Content-Type"];
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
let isRefreshingZoomToken = false; // Biến cờ để tránh refresh nhiều lần đồng thời
let zoomFailedQueue = []; // Hàng đợi các request bị lỗi 401 trong khi đang refresh

const processZoomQueue = (error, token = null) => {
  zoomFailedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  zoomFailedQueue = [];
};

axiosClient.interceptors.response.use(
  function (response) {
    return response.data; // << GIỮ NGUYÊN TRẢ VỀ response.data NẾU CODE HIỆN TẠI CỦA BẠN MONG ĐỢI ĐIỀU NÀY
    // Nếu bạn muốn thay đổi, cần cập nhật tất cả các nơi gọi API
  },
  async function (error) {
    const originalRequest = error.config;

    // Chỉ xử lý lỗi 401
    if (error.response && error.response.status === 401) {
      // Xử lý cho Zoom Token
      // Giả sử API Zoom của bạn có đường dẫn bắt đầu bằng "meeting/"
      if (
        originalRequest.url.startsWith("meeting/") &&
        originalRequest.url !== "meeting/zoom/refresh" &&
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
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retryZoom = true; // Đánh dấu đã thử refresh
        isRefreshingZoomToken = true;

        const zoomRefreshToken = localStorage.getItem("zoomRefreshToken"); // << LẤY TỪ LOCALSTORAGE

        if (zoomRefreshToken) {
          try {
            console.log("axiosClient: Attempting to refresh Zoom token...");
            // Sử dụng axios.post (instance gốc) để tránh vòng lặp interceptor
            // và nối baseURL với endpoint
            const refreshResponse = await axios.post(
              `${axiosClient.defaults.baseURL}meeting/zoom/refresh`, // Nối baseURL
              { refreshToken: zoomRefreshToken }
            );

            // Giả sử refreshResponse.data đã là object { status, code, success, message, data, errors }
            // và token nằm trong refreshResponse.data.data.result
            if (
              refreshResponse.data &&
              refreshResponse.data.success &&
              refreshResponse.data.data &&
              refreshResponse.data.data.result
            ) {
              const newAccessToken =
                refreshResponse.data.data.result.accessToken;
              const newRefreshToken =
                refreshResponse.data.data.result.refreshToken;

              localStorage.setItem("zoomAccessToken", newAccessToken); // << LƯU VÀO LOCALSTORAGE
              if (newRefreshToken) {
                localStorage.setItem("zoomRefreshToken", newRefreshToken); // << LƯU VÀO LOCALSTORAGE
              }
              console.log("axiosClient: Zoom token refreshed.");
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              processZoomQueue(null, newAccessToken);
              isRefreshingZoomToken = false;
              return axiosClient(originalRequest); // Thử lại request gốc
            } else {
              throw new Error(
                refreshResponse.data?.message ||
                  "Refresh Zoom token response invalid."
              );
            }
          } catch (refreshError) {
            console.error(
              "axiosClient: Failed to refresh Zoom token.",
              refreshError.response?.data || refreshError.message
            );
            processZoomQueue(refreshError, null);
            localStorage.removeItem("zoomAccessToken");
            localStorage.removeItem("zoomRefreshToken");
            isRefreshingZoomToken = false;
            // Thay vì redirect, hãy throw lỗi để component có thể xử lý
            // ví dụ: thông báo người dùng kết nối lại Zoom
            // window.location.href = "/login"; // Hoặc trang yêu cầu kết nối lại Zoom
            return Promise.reject(refreshError.response ? refreshError : error); // Ném lỗi refresh hoặc lỗi gốc
          }
        } else {
          console.warn(
            "axiosClient: No Zoom refresh token found. Cannot refresh."
          );
          isRefreshingZoomToken = false;
          // Không có refresh token, không làm gì cả, để lỗi 401 được trả về
        }
      }
      // Xử lý cho User System Token (nếu có)
      else if (!originalRequest.url.startsWith("meeting/")) {
        // Không phải API Zoom
        console.warn(
          "axiosClient: User system token expired or invalid (401)."
        );
        Cookies.remove("token"); // Xóa token user
        // Cookies.remove("userRefreshToken"); // Xóa refresh token của user nếu có cơ chế tương tự
        // window.location.href = "/login"; // Cân nhắc không tự động redirect
        // Để lỗi 401 được trả về cho component xử lý
      }
    }
    return Promise.reject(error); // Trả về lỗi để Api.js và component có thể bắt
  }
);

export default axiosClient;
