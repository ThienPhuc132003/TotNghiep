// src/network/Api.js
import { METHOD_TYPE } from "./methodType";
import axiosClient from "./axiosClient"; // axiosClient trả về response.data
import qs from "qs";

const joinURLParts = (base, ...parts) => {
  let result = base;
  for (const part of parts) {
    if (!part) continue;
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

// DOMAIN MẶC ĐỊNH NẾU `domain` TRONG `Api()` KHÔNG ĐƯỢC TRUYỀN
// Lấy từ biến môi trường, ví dụ: VITE_API_DOMAIN=https://giasuvlu.click
// HOẶC bạn có thể muốn nó là VITE_API_BASE_URL nếu nó đã bao gồm /api/
const DEFAULT_DOMAIN_OR_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://giasuvlu.click/api/";

const Api = async ({
  domain = "",
  endpoint,
  method = METHOD_TYPE.GET,
  data,
  query,
  sendCredentials = false,
}) => {
  let processedQuery = { ...query };
  // ... (xử lý filter, sort) ...

  const baseToUse =
    domain && domain.trim() !== "" ? domain.trim() : DEFAULT_DOMAIN_OR_BASE;
  // Nếu baseToUse đã là baseURL từ axiosClient (có /api/), và endpoint là 'meeting/auth'
  // thì URL sẽ đúng.
  // Nếu baseToUse là domain (không có /api/), và endpoint là 'api/meeting/auth', URL cũng sẽ đúng.
  let finalAbsoluteUrl = joinURLParts(baseToUse, endpoint);

  const config = {
    headers: {},
    ...(sendCredentials && { withCredentials: true }),
    ...(method.toUpperCase() === METHOD_TYPE.GET &&
      Object.keys(processedQuery).length > 0 && { params: processedQuery }),
  };

  if (
    method.toUpperCase() !== METHOD_TYPE.GET &&
    Object.keys(processedQuery).length > 0
  ) {
    const queryString = qs.stringify(processedQuery, { encode: false });
    finalAbsoluteUrl = `${finalAbsoluteUrl}${
      queryString ? `?${queryString}` : ""
    }`;
  }
  if (method.toUpperCase() === METHOD_TYPE.GET) {
    finalAbsoluteUrl = joinURLParts(baseToUse, endpoint); // Cho GET, Axios sẽ dùng config.params
  }

  // axiosClient sẽ tự động dùng finalAbsoluteUrl vì nó là URL đầy đủ,
  // bỏ qua baseURL nội bộ của nó (nếu finalAbsoluteUrl khác với những gì nó tự tính)
  // Hoặc, nếu finalAbsoluteUrl chỉ là endpoint, axiosClient sẽ nối baseURL của nó.
  // Vì chúng ta đã loại bỏ baseURL khỏi axiosClient, nên nó sẽ luôn dùng finalAbsoluteUrl.
  // À không, axiosClient VẪN CÓ baseURL. Logic của hàm Api là tạo URL tuyệt đối để gọi.

  let responseData; // Sẽ nhận data từ axiosClient
  const upperCaseMethod = method.toUpperCase();
  switch (upperCaseMethod) {
    case METHOD_TYPE.POST:
      responseData = await axiosClient.post(finalAbsoluteUrl, data, config);
      break;
    case METHOD_TYPE.PUT:
      responseData = await axiosClient.put(finalAbsoluteUrl, data, config);
      break;
    case METHOD_TYPE.PATCH:
      responseData = await axiosClient.patch(finalAbsoluteUrl, data, config);
      break;
    case METHOD_TYPE.DELETE:
      responseData = await axiosClient.delete(finalAbsoluteUrl, {
        ...config,
        data: data,
      });
      break;
    case METHOD_TYPE.GET:
    default:
      responseData = await axiosClient.get(finalAbsoluteUrl, config); // finalAbsoluteUrl cho GET không có query, Axios dùng config.params
      break;
  }
  return responseData; // axiosClient trả về data, nên đây là data
};
export default Api;
