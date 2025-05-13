// src/utils/Api.js

import Cookies from "js-cookie";
import { METHOD_TYPE } from "./methodType";
import axiosClient from "./axiosClient"; // Giả định axiosClient đã có baseURL
import qs from "qs";

const Api = async ({
  domain = "https://giasuvlu.click/api/",
  endpoint,
  method = METHOD_TYPE.GET,
  data,
  query,
  requireToken = false, // Cờ này bây giờ sẽ kiểm soát cả việc gửi token qua header
  sendCredentials = false, // Cờ mới để kiểm soát việc bật withCredentials
}) => {
  let processedQuery = { ...query };
  // ... (xử lý filter, sort như cũ) ...
  if (
    processedQuery.filter &&
    (Array.isArray(processedQuery.filter) ||
      typeof processedQuery.filter === "object")
  ) {
    try {
      processedQuery.filter = JSON.stringify(processedQuery.filter);
    } catch (e) {
      console.error("Lỗi stringify filter:", e);
    }
  }
  if (
    processedQuery.sort &&
    (Array.isArray(processedQuery.sort) ||
      typeof processedQuery.sort === "object")
  ) {
    try {
      processedQuery.sort = JSON.stringify(processedQuery.sort);
    } catch (e) {
      console.error("Lỗi stringify sort:", e);
    }
  }

  let queryString = qs.stringify(processedQuery, { encode: false });
  const url = `${domain}${endpoint}${queryString ? `?${queryString}` : ""}`;

  console.log(`API Request: ${method} ${url}`);
  if (data && !(data instanceof FormData))
    console.log("API Request Data:", JSON.stringify(data));
  else if (data instanceof FormData)
    console.log("API Request Data: FormData object");

  const config = {
    headers: {},
    // Chỉ bật withCredentials khi cờ sendCredentials là true
    ...(sendCredentials && { withCredentials: true }),
  };

  // Nếu yêu cầu token (requireToken = true), lấy token và thêm vào header Authorization
  // Điều này sẽ hoạt động nếu backend hỗ trợ xác thực qua Bearer token.
  if (requireToken) {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("API Request: Added Authorization header (Bearer token).");
      if (sendCredentials) {
        console.log(
          "API Request: withCredentials is TRUE (Cookies should be sent by browser)."
        );
      } else {
        console.log(
          "API Request: withCredentials is FALSE (Cookies might not be sent by browser for cross-origin)."
        );
      }
    } else {
      console.error(
        "API Error: Token required (for header/cookie) but not found in Cookies."
      );
      throw new Error("Authentication token not found. Please login again.");
    }
  }

  try {
    let response;
    const upperCaseMethod = method.toUpperCase();
    switch (upperCaseMethod) {
      case METHOD_TYPE.POST:
        response = await axiosClient.post(url, data, config);
        break;
      case METHOD_TYPE.PUT:
        response = await axiosClient.put(url, data, config);
        break;
      case METHOD_TYPE.PATCH:
        response = await axiosClient.patch(url, data, config);
        break;
      case METHOD_TYPE.DELETE:
        response = await axiosClient.delete(url, { ...config, data: data });
        break;
      case METHOD_TYPE.GET:
      default:
        response = await axiosClient.get(url, config);
        break;
    }
    console.log("API Response Status:", response.status);
    return response;
  } catch (error) {
    console.error(`API Error (${method} ${url}):`, error);
    if (error.response) {
      console.error("API Error Response Data:", error.response.data);
      console.error("API Error Response Status:", error.response.status);
    } else if (error.request) {
      console.error("API Error: No response received.", error.request);
    } else {
      console.error("API Error: Request setup failed.", error.message);
    }
    throw error;
  }
};

export default Api;
