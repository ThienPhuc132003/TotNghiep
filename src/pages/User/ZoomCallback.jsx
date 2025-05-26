// src/pages/User/ZoomCallback.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Api from "../../network/Api"; // Đảm bảo đường dẫn này chính xác
import { METHOD_TYPE } from "../../network/methodType"; // Đảm bảo đường dẫn này chính xác
// import './ZoomCallback.style.css'; // Tạo file CSS nếu bạn có

const ZoomCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Đang xử lý xác thực Zoom...");
  const [error, setError] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const authorizationCode = queryParams.get("code");
    const zoomError = queryParams.get("error");

    if (zoomError) {
      const errorDescription =
        queryParams.get("error_description") || zoomError;
      console.error("Lỗi từ Zoom OAuth Callback:", zoomError, errorDescription);
      setError(`Lỗi từ Zoom: ${errorDescription}. Vui lòng thử lại.`);
      setMessage("Kết nối Zoom không thành công.");
      return;
    }

    if (authorizationCode) {
      console.log("Authorization Code lấy từ URL:", authorizationCode);
      setMessage("Đã nhận được mã xác thực. Đang gửi đến máy chủ...");

      Api({
        endpoint: "/meeting/handle", // Endpoint backend để xử lý code
        method: METHOD_TYPE.POST,
        data: { authorizationCode: authorizationCode },
      })
        .then((response) => {
          // response là response object đầy đủ
          console.log("Phản hồi từ API /meeting/handle:", response);
          const responseData = response.data; // Lấy phần data từ response object

          if (
            responseData &&
            responseData.result &&
            responseData.result.accessToken &&
            responseData.result.refreshToken
          ) {
            const { accessToken, refreshToken, userId } = responseData.result;
            localStorage.setItem("zoomAccessToken", accessToken);
            localStorage.setItem("zoomRefreshToken", refreshToken);
            if (userId) {
              localStorage.setItem("zoomUserId", userId);
            }
            setMessage("Kết nối Zoom thành công! Đang chuyển hướng...");
            setTimeout(
              () =>
                navigate("/tai-khoan/ho-so/phong-hop-zoom", { replace: true }),
              2000
            );
          } else {
            console.error(
              "Cấu trúc dữ liệu token không hợp lệ từ API /meeting/handle:",
              responseData
            );
            throw new Error(
              `Phản hồi từ máy chủ không chứa thông tin token hợp lệ. Dữ liệu nhận được: ${JSON.stringify(
                responseData
              )}`
            );
          }
        })
        .catch((err) => {
          console.error(
            "Lỗi khi gọi API /meeting/handle để xử lý Zoom token:",
            err.response || err
          );
          let errorMessage =
            "Có lỗi xảy ra trong quá trình hoàn tất kết nối Zoom.";
          if (err.response && err.response.data) {
            errorMessage =
              err.response.data.message ||
              err.response.data.error ||
              JSON.stringify(err.response.data);
          } else if (err.message) {
            errorMessage = err.message;
          }
          setError(errorMessage);
          setMessage("Kết nối Zoom không thành công.");
        });
    } else if (!zoomError) {
      setError("Không tìm thấy mã xác thực (code) từ Zoom trên URL callback.");
      setMessage("Kết nối Zoom không thành công. Mã xác thực bị thiếu.");
      console.log("URL search không chứa 'code':", location.search);
    }
  }, [location.search, navigate]); // Thêm navigate vào dependency array

  // Phần JSX giữ nguyên như bạn đã cung cấp
  return (
    <div
      style={
        {
          /* ... styles của bạn ... */
        }
      }
    >
      <h2
        style={
          {
            /* ... styles của bạn ... */
          }
        }
      >
        {message}
      </h2>
      {error && (
        <p
          style={
            {
              /* ... styles của bạn ... */
            }
          }
        >
          <strong>Lỗi:</strong> {error}
        </p>
      )}
      {/* ... phần còn lại của JSX ... */}
      {(error || (message && message.includes("không thành công"))) && (
        <button
          onClick={() =>
            navigate("/tai-khoan/ho-so/phong-hop-zoom", { replace: true })
          }
          style={
            {
              /* ... styles của bạn ... */
            }
          }
        >
          Quay lại trang Phòng Họp
        </button>
      )}
    </div>
  );
};
export default ZoomCallback;
