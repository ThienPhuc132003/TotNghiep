// src/utils/Api.js

import Cookies from 'js-cookie';
import { METHOD_TYPE } from "./methodType";
import axiosClient from "./axiosClient";
import qs from "qs";

const Api = async ({
  domain = "https://giasuvlu.click/api/",
  endpoint,
  method = METHOD_TYPE.GET,
  data,
  query,
  requireToken = false,
}) => {
  // ... (code xử lý query, url, logging request giữ nguyên)
  let processedQuery = { ...query };

  if (processedQuery.filter && (Array.isArray(processedQuery.filter) || typeof processedQuery.filter === 'object')) {
    try {
      processedQuery.filter = JSON.stringify(processedQuery.filter);
    } catch (e) {
       console.error("Lỗi khi stringify filter param:", e);
    }
  }
  if (processedQuery.sort && (Array.isArray(processedQuery.sort) || typeof processedQuery.sort === 'object')) {
     try {
      processedQuery.sort = JSON.stringify(processedQuery.sort);
    } catch (e) {
       console.error("Lỗi khi stringify sort param:", e);
    }
  }

  let queryString = qs.stringify(processedQuery, {
    encode: false,
  });

  const url = `${domain}${endpoint}${queryString ? `?${queryString}` : ""}`;

  console.log(`API Request: ${method} ${url}`);
  if (data && !(data instanceof FormData)) {
    console.log("API Request Data:", JSON.stringify(data));
  } else if (data instanceof FormData) {
    console.log("API Request Data: FormData object");
  }

  // --- Cấu hình Axios ---
  const config = {
    headers: {},
    withCredentials: true, // <-- BỎ DÒNG NÀY ĐI HOẶC ĐẶT LÀ FALSE
  };

  // --- Kiểm tra Token trong Cookies nếu yêu cầu ---
  // Logic này vẫn có thể hữu ích để ném lỗi sớm nếu token không tồn tại
  // nhưng nó sẽ không tự động gửi token nếu withCredentials là false
  if (requireToken) {
    const token = Cookies.get('token');
    if (!token) {
      console.error("API Error: Authentication token is required (checked on client) but not found in Cookies.");
      // Nếu withCredentials là false, trình duyệt sẽ không gửi cookie.
      // Backend có thể vẫn trả về 401 nếu nó không nhận được token theo cách khác.
      throw new Error("Authentication token not found in Cookies. Please login again.");
    } else {
      console.log("API Request: Token found in Cookies (but won't be sent automatically without withCredentials:true or if not same-origin).");
      // Nếu bạn muốn thử gửi token qua header Authorization (nếu backend hỗ trợ)
      // thì bạn phải thêm lại dòng này VÀ đảm bảo backend đọc được từ header.
      // config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // --- Thực hiện yêu cầu API ---
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