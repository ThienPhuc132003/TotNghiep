import { METHOD_TYPE } from "./methodType";
import axiosClient from "./axiosClient";
import qs from 'qs';
const Api = async ({ domain = "https://giasuvlu.click/api/", endpoint, method = METHOD_TYPE.GET, data, query, isFormData = false }) => {
  let processedQuery = { ...query };
  // ✅ Đảm bảo `filter` và `sort` luôn là JSON string
  if (processedQuery.filter && Array.isArray(processedQuery.filter)) {
    processedQuery.filter = JSON.stringify(processedQuery.filter);
  }
  if (processedQuery.sort && Array.isArray(processedQuery.sort)) {
    processedQuery.sort = JSON.stringify(processedQuery.sort);
  }
  // ✅ Dùng qs.stringify để giữ nguyên JSON, không bị encode sai
  let queryString = qs.stringify(processedQuery, { encode: false, format: "RFC3986" });
  // ✅ Đảm bảo không có dấu `?` thừa ở cuối
  const url = `${domain}${endpoint}${queryString ? `?${queryString}` : ""}`;
  
  console.log("API URL (before request):", url);

  const config = { headers: {} };

  if (isFormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  }

  try {
    let response;
    switch (method) {
      case METHOD_TYPE.POST:
        response = await axiosClient.post(url, data, config);
        break;
      case METHOD_TYPE.PUT:
        response = await axiosClient.put(url, data, config);
        break;
      case METHOD_TYPE.DELETE:
        response = await axiosClient.delete(url, { data, ...config });
        break;
      default:
        response = await axiosClient.get(url, config); // Không dùng `params`
        break;
    }

    console.log("API Response:", response);
    return response;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export default Api;
