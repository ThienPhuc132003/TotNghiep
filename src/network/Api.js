// src/network/Api.js
import { METHOD_TYPE } from "./methodType";
import axiosClient from "./axiosClient"; // Đảm bảo đường dẫn đúng
import qs from "qs";

// Hàm tiện ích để nối URL một cách an toàn, đảm bảo có đúng một dấu /
const joinURLParts = (base, ...parts) => {
  let result = base;
  for (const part of parts) {
    if (result.endsWith("/") && part.startsWith("/")) {
      result += part.substring(1);
    } else if (!result.endsWith("/") && !part.startsWith("/")) {
      result += "/" + part;
    } else {
      result += part;
    }
  }
  return result;
};

const Api = async ({
  domain = "https://giasuvlu.click/api/", // Giữ lại tham số domain
  endpoint, // Sẽ không có / ở đầu, ví dụ: 'meeting/auth'
  method = METHOD_TYPE.GET,
  data,
  query,
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

  // Xác định URL cơ sở: ưu tiên `domain` nếu có, nếu không thì dùng `baseURL` từ axiosClient
  const base =
    domain && domain.trim() !== ""
      ? domain.trim()
      : axiosClient.defaults.baseURL || "";

  // Tạo URL đầy đủ bằng cách nối base và endpoint
  // Endpoint không có / ở đầu, hàm joinURLParts sẽ xử lý việc thêm / nếu cần
  let requestUrl = joinURLParts(base, endpoint);
  const fullUrlForLog = requestUrl; // Để log cho dễ nhìn

  console.log(`API Request (via Api.js): ${method} ${fullUrlForLog}`);
  if (data && !(data instanceof FormData))
    console.log("API Request Data:", JSON.stringify(data));
  else if (data instanceof FormData)
    console.log("API Request Data: FormData object");

  const config = {
    headers: {},
    ...(sendCredentials && { withCredentials: true }),
    ...(method.toUpperCase() === METHOD_TYPE.GET &&
      Object.keys(processedQuery).length > 0 && { params: processedQuery }),
  };

  // Đối với các method không phải GET, nếu có query, chúng ta vẫn có thể cần nối vào URL
  // Mặc dù thường thì query params dùng cho GET.
  if (
    method.toUpperCase() !== METHOD_TYPE.GET &&
    Object.keys(processedQuery).length > 0
  ) {
    const queryString = qs.stringify(processedQuery, { encode: false });
    requestUrl = `${requestUrl}${queryString ? `?${queryString}` : ""}`;
  }

  try {
    let response;
    const upperCaseMethod = method.toUpperCase();

    // requestUrl đã là URL đầy đủ (nếu domain được cung cấp) hoặc chỉ là endpoint (nếu không có domain, Axios sẽ tự dùng baseURL)
    // Tuy nhiên, vì chúng ta đã tự xây dựng requestUrl hoàn chỉnh ở trên, chúng ta sẽ truyền nó vào các hàm của Axios
    // và không để Axios tự nối baseURL nữa bằng cách truyền URL đầy đủ.

    // Nếu domain được cung cấp, `requestUrl` là URL tuyệt đối.
    // Nếu domain KHÔNG được cung cấp, `requestUrl` (đã được join từ baseURL của axiosClient và endpoint) cũng là URL tuyệt đối.
    // Axios sẽ sử dụng URL này trực tiếp.
    switch (upperCaseMethod) {
      case METHOD_TYPE.POST:
        response = await axiosClient.post(requestUrl, data, config);
        break;
      case METHOD_TYPE.PUT:
        response = await axiosClient.put(requestUrl, data, config);
        break;
      case METHOD_TYPE.PATCH:
        response = await axiosClient.patch(requestUrl, data, config);
        break;
      case METHOD_TYPE.DELETE:
        response = await axiosClient.delete(requestUrl, {
          ...config,
          data: data,
        });
        break;
      case METHOD_TYPE.GET:
      default:
        // Cho GET, query params đã được đặt trong config.params, nên requestUrl không cần nối query string nữa
        // Hàm joinURLParts đã tạo ra requestUrl chưa có query string.
        response = await axiosClient.get(joinURLParts(base, endpoint), config); // Chỉ endpoint cho GET, params trong config
        break;
    }
    console.log("API Response Status (from Api.js):", response.status);
    return response;
  } catch (error) {
    const errorMsg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Unknown API error";
    console.error(
      `Error in Api.js function (${method} ${fullUrlForLog}):`,
      errorMsg,
      error.response || error
    );
    throw error;
  }
};

export default Api;
