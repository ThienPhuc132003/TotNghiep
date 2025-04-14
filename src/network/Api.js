import { METHOD_TYPE } from "./methodType";
import axiosClient from "./axiosClient";
import qs from "qs";

const Api = async ({
  domain = "",
  endpoint,
  method = METHOD_TYPE.GET,
  data,
  query,
}) => {
  let processedQuery = { ...query };
  if (processedQuery.filter && Array.isArray(processedQuery.filter)) {
    processedQuery.filter = JSON.stringify(processedQuery.filter);
  }
  if (processedQuery.sort && Array.isArray(processedQuery.sort)) {
    processedQuery.sort = JSON.stringify(processedQuery.sort);
  }
  let queryString = qs.stringify(processedQuery, {
    encode: false,
    format: "RFC3986",
  });
  const url = `${domain}${endpoint}${queryString ? `?${queryString}` : ""}`;

  console.log("API URL (before request):", url);
  console.log("API Data (before request):", data); // Sẽ hiển thị FormData object nếu là upload

  // --- Bỏ phần kiểm tra isFormData để set Content-Type ---
  const config = { headers: {} };
  // Axios sẽ tự động set Content-Type phù hợp nếu data là FormData

  try {
    let response;
    switch (method) {
      case METHOD_TYPE.POST:
        // Axios tự xử lý data là object thường hay FormData
        response = await axiosClient.post(url, data, config);
        break;
      case METHOD_TYPE.PUT:
        response = await axiosClient.put(url, data, config);
        break;
      case METHOD_TYPE.DELETE:
        // Lưu ý: Axios delete thường không có body, nếu API của bạn yêu cầu
        // body trong DELETE thì cách gửi có thể khác nhau giữa các phiên bản axios
        // Cách gửi data trong config là phổ biến
        response = await axiosClient.delete(url, { data: data, ...config });
        break;
      default: // METHOD_TYPE.GET
        // GET request không có body (data), config chỉ chứa headers
        response = await axiosClient.get(url, config);
        break;
    }

    console.log("API Response:", response);
    return response;
  } catch (error) {
    console.error("API Error:", error);
    throw error; // Re-throw để component gọi có thể bắt lỗi
  }
};

export default Api;
