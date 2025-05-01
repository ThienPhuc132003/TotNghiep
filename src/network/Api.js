// src/utils/Api.js

import { METHOD_TYPE } from "./methodType";
import axiosClient from "./axiosClient"; // Đảm bảo đây là axios instance đã cấu hình
import qs from "qs";

/**
 * Hàm tiện ích chung để gọi API, xử lý query string tập trung.
 * @param {object} config - Cấu hình request.
 * @param {string} [config.domain=""] - (Tùy chọn) Domain cụ thể nếu khác baseURL của axiosClient.
 * @param {string} config.endpoint - Endpoint API (ví dụ: '/admin/search').
 * @param {string} [config.method=METHOD_TYPE.GET] - Phương thức HTTP.
 * @param {object | FormData} [config.data] - Body data cho POST/PUT.
 * @param {object} [config.query] - Object chứa các tham số query.
 * @returns {Promise<import('axios').AxiosResponse<any>>} - Promise chứa response đầy đủ từ Axios.
 * @throws {Error} - Ném lỗi nếu yêu cầu thất bại.
 */
const Api = async ({
  domain = "https://giasuvlu.click/api/",
  endpoint,
  method = METHOD_TYPE.GET,
  data,
  query,
}) => {
  let queryString = qs.stringify(query || {}, {
    encodeValuesOnly: true,
  });

  // Tạo URL đầy đủ, sử dụng domain nếu được cung cấp
  // Nếu domain là chuỗi rỗng, nó sẽ không ảnh hưởng đến URL khi axiosClient đã có baseURL
  const url = `${domain}${endpoint}${queryString ? `?${queryString}` : ""}`;

  console.log(`API Request: ${method.toUpperCase()} ${url}`);
  if (data && !(data instanceof FormData)) {
    console.log("API Request Data:", data);
  } else if (data instanceof FormData) {
    console.log("API Request Data: FormData object");
  }

  const config = { headers: {} };
  // ... (thêm token nếu cần) ...

  try {
    let response;
    switch (method.toUpperCase()) {
      case METHOD_TYPE.POST:
        response = await axiosClient.post(url, data, config);
        break;
      case METHOD_TYPE.PUT:
        response = await axiosClient.put(url, data, config);
        break;
      case METHOD_TYPE.DELETE:
        response = await axiosClient.delete(url, { data: data, ...config });
        break;
      case METHOD_TYPE.GET:
      default:
        response = await axiosClient.get(url, config);
        break;
    }
    console.log("API Response Status:", response.status);
    return response;
  } catch (error) {
    console.error(
      `API Error: ${method.toUpperCase()} ${endpoint}`,
      "\nURL:",
      url,
      "\nError Response Data:",
      error.response?.data,
      "\nError Status:",
      error.response?.status,
      "\nError Message:",
      error.message,
      "\nError Object:",
      error
    );
    throw error;
  }
};

export default Api;
