// src/utils/Api.js (Hoặc bất kỳ đường dẫn nào bạn đặt file này)

import { METHOD_TYPE } from "./methodType"; // Đảm bảo đường dẫn này đúng
import axiosClient from "./axiosClient"; // Đảm bảo đường dẫn này đúng
import qs from "qs"; // Cần cài đặt: npm install qs

/**
 * Hàm tiện ích chung để gọi API
 * @param {object} config - Đối tượng cấu hình cho yêu cầu API
 * @param {string} [config.domain=""] - (Tùy chọn) Domain cụ thể nếu khác với baseURL của axiosClient
 * @param {string} config.endpoint - Đường dẫn endpoint của API (ví dụ: '/user/get-list-tutor-public')
 * @param {string} [config.method=METHOD_TYPE.GET] - Phương thức HTTP (GET, POST, PUT, DELETE)
 * @param {object | FormData} [config.data] - Dữ liệu gửi đi trong body (cho POST, PUT)
 * @param {object} [config.query] - Đối tượng chứa các tham số query string
 * @returns {Promise<import('axios').AxiosResponse<any>>} - Promise chứa response đầy đủ từ Axios
 * @throws {Error} - Ném lỗi nếu yêu cầu API thất bại
 */
const Api = async ({
  domain = "https://giasuvlu.click/api/", // Thường không cần nếu axiosClient đã có baseURL
  endpoint,
  method = METHOD_TYPE.GET, // Mặc định là GET
  data, // Dữ liệu cho body (POST/PUT)
  query, // Object cho query params
}) => {
  // Xử lý Query Params
  let processedQuery = { ...query }; // Tạo bản sao để không thay đổi object gốc

  // Tự động stringify 'filter' và 'sort' nếu chúng là mảng
  if (processedQuery.filter && Array.isArray(processedQuery.filter)) {
    processedQuery.filter = JSON.stringify(processedQuery.filter);
  }
  if (processedQuery.sort && Array.isArray(processedQuery.sort)) {
    processedQuery.sort = JSON.stringify(processedQuery.sort);
  }

  // Sử dụng qs để tạo query string đúng chuẩn RFC3986, không encode dấu ngoặc vuông nếu cần
  // encode: false giữ lại các ký tự đặc biệt trong value nếu API cần (ví dụ: dấu cách)
  let queryString = qs.stringify(processedQuery, {
    encode: false, // Giữ lại các ký tự như dấu cách, dấu ngoặc nếu cần
    // arrayFormat: 'brackets' // Không cần thiết nếu đã stringify filter/sort
  });

  // Tạo URL đầy đủ
  const url = `${domain}${endpoint}${queryString ? `?${queryString}` : ""}`;

  console.log("API URL (Requesting):", url);
  if (data && !(data instanceof FormData)) {
    // Chỉ log data nếu không phải FormData (vì FormData log ra không hữu ích)
    console.log("API Data (Requesting):", data);
  } else if (data instanceof FormData) {
    console.log("API Data (Requesting): FormData object");
  }

  // Cấu hình Axios (chủ yếu là headers nếu cần)
  // Axios sẽ tự động xử lý Content-Type cho JSON và FormData
  const config = { headers: {} };
  // Ví dụ: Nếu cần thêm token Authorization
  // const token = localStorage.getItem('accessToken');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }

  try {
    let response;

    // Gọi phương thức Axios tương ứng
    switch (
      method.toUpperCase() // Chuyển sang uppercase để đảm bảo khớp
    ) {
      case METHOD_TYPE.POST:
        response = await axiosClient.post(url, data, config);
        break;
      case METHOD_TYPE.PUT:
        response = await axiosClient.put(url, data, config);
        break;
      case METHOD_TYPE.DELETE:
        // Gửi data trong config cho DELETE nếu API yêu cầu
        response = await axiosClient.delete(url, { data: data, ...config });
        break;
      case METHOD_TYPE.GET: // Trường hợp mặc định
      default:
        // GET request không có body (data)
        response = await axiosClient.get(url, config);
        break;
    }

    console.log("API Response Status:", response.status);
    // console.log("API Response Data:", response.data); // Log data nhận được

    // Trả về response đầy đủ từ Axios
    return response;
  } catch (error) {
    console.error(
      `API Error (${method} ${endpoint}):`,
      error.response?.data || error.message || error
    );
    // Bạn có thể xử lý lỗi tập trung ở đây nếu muốn (ví dụ: redirect về trang login nếu là 401)
    // if (error.response && error.response.status === 401) {
    //   // Ví dụ: Xử lý lỗi Unauthorized
    //   console.log("Unauthorized access - Redirecting to login...");
    //   // window.location.href = '/login';
    // }

    // Ném lỗi lại để hàm gọi (trong service hoặc component) có thể bắt và xử lý tiếp
    throw error;
  }
};

export default Api;
