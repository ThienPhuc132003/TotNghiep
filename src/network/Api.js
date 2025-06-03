// src/network/Api.js
import { METHOD_TYPE } from "./methodType";
import axiosClient from "./axiosClient"; // Giả định axiosClient có baseURL và trả về response.data
import qs from "qs";

/**
 * Hàm gọi API chung.
 * @param {object} params - Tham số cho request.
 * @param {string} params.endpoint - Endpoint của API (ví dụ: 'users/search', 'auth/login').
 * @param {string} [params.method=METHOD_TYPE.GET] - Phương thức HTTP (GET, POST, PUT, DELETE, PATCH).
 * @param {object} [params.data] - Body data cho các request POST, PUT, PATCH.
 * @param {object} [params.query] - Query parameters. Sẽ được nối vào URL.
 *                                  Đối với GET, axios tự xử lý params.
 *                                  Đối với các method khác, qs.stringify sẽ được dùng.
 *                                  Lưu ý: `filter` và `sort` trong `query` nên được JSON.stringify từ component gọi nếu backend yêu cầu dạng chuỗi JSON.
 * @param {boolean} [params.sendCredentials=false] - Có gửi kèm credentials (cookies) hay không.
 * @param {boolean} [params.requireToken=false] - Có yêu cầu token authentication hay không.
 * @returns {Promise<any>} - Trả về data từ response của API (đã qua interceptor của axiosClient).
 * @throws {Error} - Ném lỗi nếu API call thất bại (đã qua interceptor của axiosClient).
 */
const Api = async ({
  endpoint,
  method = METHOD_TYPE.GET,
  data, // Body data cho POST, PUT, PATCH
  query, // Query params cho GET hoặc các method khác nếu backend hỗ trợ
  sendCredentials = false,
  requireToken = false, // Thêm tham số requireToken
}) => {
  // processedQuery sẽ chứa các tham số đã được chuẩn bị sẵn từ component gọi
  // ví dụ: filter và sort đã được JSON.stringify nếu cần
  let processedQuery = { ...query };

  let requestUrl = endpoint; // axiosClient sẽ tự nối baseURL
  const config = {
    headers: {}, // axiosClient sẽ thêm Authorization header nếu có từ interceptor
    ...(sendCredentials && { withCredentials: true }),
  };

  // Thêm header để báo cho axiosClient biết request này cần token
  if (requireToken) {
    config.headers["X-Require-Token"] = "true";
  }

  const upperCaseMethod = method.toUpperCase();

  // Xử lý query parameters
  if (Object.keys(processedQuery).length > 0) {
    if (upperCaseMethod === METHOD_TYPE.GET) {
      // Đối với GET, axios sẽ tự động xử lý params và encoding
      config.params = processedQuery;
      // Không cần qs.stringify cho GET khi dùng config.params của Axios
    } else {
      // Đối với các method khác (POST, PUT, DELETE, PATCH), nếu có query params,
      // chúng ta sẽ nối chúng vào URL.
      // qs.stringify sẽ convert object thành query string.
      // encodeValuesOnly: true đảm bảo chỉ giá trị được encode.
      // arrayFormat: 'brackets' là một lựa chọn phổ biến (ví dụ: key[]=value1&key[]=value2)
      // bạn có thể thay đổi arrayFormat tùy theo yêu cầu của backend ('repeat', 'indices', 'comma')
      const queryString = qs.stringify(processedQuery, {
        encodeValuesOnly: true,
        arrayFormat: "brackets", // Hoặc 'repeat', 'indices', 'comma'
      });
      if (queryString) {
        requestUrl = `${endpoint}?${queryString}`;
      }
    }
  }
  console.log(
    `[API Call] URL: ${axiosClient.defaults.baseURL}${requestUrl}, Method: ${upperCaseMethod}, Query:`,
    processedQuery
  );
  // Sẽ nhận trực tiếp `data` từ `axiosClient` (do axiosClient đã trả về response.data)
  switch (upperCaseMethod) {
    case METHOD_TYPE.POST:
      return await axiosClient.post(requestUrl, data, config);
    case METHOD_TYPE.PUT:
      return await axiosClient.put(requestUrl, data, config);
    case METHOD_TYPE.DELETE:
      // DELETE request thường không có body (data), nhưng axios cho phép truyền config.data
      // Nếu API của bạn không cần body cho DELETE, có thể chỉ truyền requestUrl và config (bỏ {data} trong ...config)
      // Tuy nhiên, để nhất quán, việc truyền { ...config, data } là an toàn, axios sẽ xử lý.
      // Một số server có thể đọc body của DELETE request.
      return await axiosClient.delete(requestUrl, {
        ...config,
        data,
      });
    case METHOD_TYPE.PATCH:
      return await axiosClient.patch(requestUrl, data, config);
    case METHOD_TYPE.GET:
    default:
      // config đã chứa params cho GET nếu có
      return await axiosClient.get(requestUrl, config);
  }
};

export default Api;
