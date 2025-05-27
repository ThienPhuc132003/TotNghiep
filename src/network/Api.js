// src/network/Api.js (Phiên bản đơn giản, dựa vào baseURL của axiosClient)
import { METHOD_TYPE } from "./methodType";
import axiosClient from "./axiosClient"; // axiosClient có baseURL và trả về response.data
import qs from "qs";

const Api = async ({
  endpoint, // ví dụ: 'meeting/auth', 'users/1' (không có / ở đầu)
  method = METHOD_TYPE.GET,
  data,
  query,
  sendCredentials = false, // Giữ lại nếu bạn dùng
}) => {
  let processedQuery = { ...query };
  // ... (xử lý filter, sort) ...

  // URL sẽ là endpoint. axiosClient sẽ tự nối baseURL.
  let requestUrl = endpoint;

  const config = {
    headers: {}, // axiosClient sẽ thêm Authorization nếu cần
    ...(sendCredentials && { withCredentials: true }),
    ...(method.toUpperCase() === METHOD_TYPE.GET &&
      Object.keys(processedQuery).length > 0 && { params: processedQuery }),
  };

  // Nếu không phải GET và có query, nối vào URL (ít phổ biến)
  if (
    method.toUpperCase() !== METHOD_TYPE.GET &&
    Object.keys(processedQuery).length > 0
  ) {
    const queryString = qs.stringify(processedQuery, { encode: false });
    requestUrl = `${endpoint}${queryString ? `?${queryString}` : ""}`;
  }

  let responseData; // Sẽ nhận trực tiếp data từ axiosClient
  const upperCaseMethod = method.toUpperCase();
  switch (upperCaseMethod) {
    case METHOD_TYPE.POST:
      responseData = await axiosClient.post(requestUrl, data, config);
      break;
    // ... (các method khác tương tự) ...
    case METHOD_TYPE.GET:
    default:
      responseData = await axiosClient.get(requestUrl, config); // Axios dùng requestUrl (endpoint) và config.params
      break;
  }
  return responseData;
};
export default Api;
