// src/utils/Api.js
import { METHOD_TYPE } from "./methodType";
import axiosClient from "./axiosClient"; // Import axiosClient đã cập nhật
import qs from "qs";

const Api = async ({
  domain = "https://giasuvlu.click/api/", // Sẽ ít dùng nếu axiosClient đã có baseURL
  endpoint,
  method = METHOD_TYPE.GET,
  data,
  query,
  // requireToken = false, // Cờ này không còn quá cần thiết, axiosClient tự quản lý
  sendCredentials = false,
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
  // Nếu domain được truyền, nó sẽ là URL đầy đủ. Nếu không, axiosClient sẽ dùng baseURL + endpoint.
  const url = domain ? `${domain}${endpoint}` : endpoint;
  const fullUrlForLog = domain
    ? url
    : `${axiosClient.defaults.baseURL || ""}${url}`;

  console.log(
    `API Request (via Api.js): ${method} ${fullUrlForLog}${
      queryString ? `?${queryString}` : ""
    }`
  );
  if (data && !(data instanceof FormData))
    console.log("API Request Data:", JSON.stringify(data));
  else if (data instanceof FormData)
    console.log("API Request Data: FormData object");

  const config = {
    headers: {}, // axiosClient sẽ tự thêm Authorization
    ...(sendCredentials && { withCredentials: true }),
    // Truyền query string qua params cho GET request để axios xử lý encoding
    ...(method.toUpperCase() === METHOD_TYPE.GET &&
      Object.keys(processedQuery).length > 0 && { params: processedQuery }),
  };

  // Phần requireToken đã được chuyển vào logic của axiosClient
  // if (requireToken) { ... }

  try {
    let responseData; // Sẽ nhận data trực tiếp từ axiosClient
    const upperCaseMethod = method.toUpperCase();
    // Nếu là GET và có query string, không cần nối vào URL nữa vì đã đưa vào config.params
    const requestUrl =
      upperCaseMethod === METHOD_TYPE.GET && queryString
        ? url
        : `${url}${queryString ? `?${queryString}` : ""}`;

    switch (upperCaseMethod) {
      case METHOD_TYPE.POST:
        responseData = await axiosClient.post(requestUrl, data, config);
        break;
      case METHOD_TYPE.PUT:
        responseData = await axiosClient.put(requestUrl, data, config);
        break;
      case METHOD_TYPE.PATCH:
        responseData = await axiosClient.patch(requestUrl, data, config);
        break;
      case METHOD_TYPE.DELETE:
        // data cho DELETE request thường nằm trong config.data
        responseData = await axiosClient.delete(requestUrl, {
          ...config,
          data: data,
        });
        break;
      case METHOD_TYPE.GET:
      default:
        // config đã chứa params nếu có
        responseData = await axiosClient.get(requestUrl, config);
        break;
    }
    // axiosClient trả về response.data, nên responseData ở đây chính là dữ liệu bạn cần
    console.log("API Response Data (from Api.js):", responseData);
    return responseData; // Trả về dữ liệu đã được trích xuất
  } catch (error) {
    // Lỗi đã được axiosClient xử lý (ví dụ: log).
    // Hàm này chỉ cần ném lại lỗi để component gọi có thể bắt và xử lý UI.
    console.error(
      `Error caught in Api.js function (${method} ${fullUrlForLog}):`,
      error
    );
    throw error;
  }
};

export default Api;
