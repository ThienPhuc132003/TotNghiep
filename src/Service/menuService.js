// src/services/menuService.js
import Cookies from 'js-cookie';
// Giả sử bạn có một instance Axios hoặc một hàm gọi API chung
// import YourApiInstance from '../network/YourApiInstance'; // Ví dụ
// Hoặc nếu bạn dùng file Api.js và METHOD_TYPE như trước:
import Api from '../network/Api'; // Đường dẫn tới file Api.js của bạn
import { METHOD_TYPE } from '../network/methodType'; // Nếu bạn dùng

export const fetchUserMenu = async () => {
    const token = Cookies.get('token'); // Lấy token từ cookie

    // Nếu không có token, không thể lấy menu người dùng.
    // App.jsx sẽ xử lý việc này (ví dụ: hiển thị menu khách).
    if (!token) {
        console.warn("menuService: Không có token, không thể gọi API menu người dùng.");
        // Trả về một promise giải quyết với giá trị mà App.jsx có thể hiểu là "không có menu người dùng"
        // ví dụ: mảng rỗng, hoặc để App.jsx tự quyết định không gọi nếu không có token.
        // Tốt nhất là App.jsx kiểm tra token trước khi gọi.
        // Tuy nhiên, nếu gọi, API có thể trả 401, và hàm Api của bạn sẽ throw error.
        // Giả sử App.jsx chỉ gọi khi có token.
    }

    try {
        // Gọi API endpoint 'menu/me'
        // Backend sẽ dựa vào token (thường gửi trong Authorization header) để trả về menu phù hợp.
        const response = await Api({ // Sử dụng hàm Api bạn đã có
            endpoint: 'menu/me',     // Endpoint của bạn
            method: METHOD_TYPE.GET, // Giả sử là GET
            // Hàm Api của bạn nên tự động thêm Authorization header nếu token tồn tại
            // hoặc bạn có thể cần truyền token vào đây để hàm Api xử lý.
        });

        console.log("menuService: Dữ liệu menu người dùng:", response);
        if (Array.isArray(response)) {
            return response;
        } else {
            // Nếu API trả về cấu trúc không mong muốn (ví dụ: object khi có lỗi do API xử lý)
            console.error("menuService: Dữ liệu API menu/me không phải là mảng:", response);
            // Có thể ném lỗi ở đây hoặc trả về mảng rỗng để App.jsx xử lý.
            // Tùy thuộc vào cách hàm Api của bạn xử lý lỗi HTTP.
            // Nếu hàm Api đã ném lỗi cho các status code > 2xx, thì dòng này có thể không cần.
            throw new Error("Dữ liệu menu không hợp lệ từ máy chủ.");
        }
    } catch (error) {
        console.error("menuService: Lỗi khi gọi API menu/me:", error);
        // Ném lại lỗi để component gọi (App.jsx) có thể bắt và xử lý UI (ví dụ: hiển thị thông báo lỗi)
        throw error;
    }
};