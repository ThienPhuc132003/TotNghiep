// src/pages/User/ZoomCallback.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Api from "../../network/Api"; // Import hàm Api của bạn
import { METHOD_TYPE } from "../../network/methodType"; // Import METHOD_TYPE

const ZoomCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Đang xử lý xác thực Zoom...");
  const [error, setError] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const authorizationCode = queryParams.get("code");
    const zoomError = queryParams.get("error"); // Kiểm tra nếu Zoom trả về lỗi

    if (zoomError) {
      // Các mã lỗi từ Zoom: access_denied, unsupported_response_type, invalid_scope, server_error, temporarily_unavailable
      console.error(
        "Lỗi từ Zoom OAuth:",
        zoomError,
        queryParams.get("error_description")
      );
      setError(
        `Lỗi từ Zoom: ${
          queryParams.get("error_description") || zoomError
        }. Vui lòng thử lại.`
      );
      setMessage("Kết nối Zoom không thành công.");
      // Có thể thêm nút để quay lại trang trước hoặc thử lại
      // setTimeout(() => navigate('/tai-khoan/ho-so/phong-hop-zoom'), 5000);
      return;
    }

    if (authorizationCode) {
      Api({
        endpoint: "/meeting/handle", // Endpoint backend của bạn để xử lý code
        method: METHOD_TYPE.POST,
        data: { authorizationCode }, // Gửi authorizationCode lên backend
      })
        .then((responseData) => {
          // responseData là dữ liệu trả về từ Api.js (do axiosClient trả về response.data)
          const { accessToken, refreshToken, userId } = responseData.result; // Giả sử backend trả về cấu trúc này
          if (accessToken && refreshToken) {
            localStorage.setItem("zoomAccessToken", accessToken);
            localStorage.setItem("zoomRefreshToken", refreshToken);
            if (userId) {
              // Lưu userId của Zoom nếu backend trả về
              localStorage.setItem("zoomUserId", userId);
            }
            setMessage("Kết nối Zoom thành công! Đang chuyển hướng...");
            // Chuyển hướng về trang quản lý phòng họp hoặc dashboard
            setTimeout(
              () =>
                navigate("/tai-khoan/ho-so/phong-hop-zoom", { replace: true }),
              2000
            );
          } else {
            throw new Error("Dữ liệu token không hợp lệ từ máy chủ.");
          }
        })
        .catch((err) => {
          console.error("Lỗi khi xử lý Zoom token với backend:", err);
          const errorMessage =
            typeof err === "string"
              ? err
              : err.message ||
                err.error ||
                "Có lỗi xảy ra trong quá trình kết nối Zoom với hệ thống.";
          setError(errorMessage);
          setMessage("Kết nối Zoom không thành công.");
        });
    } else if (!zoomError) {
      // Chỉ hiển thị lỗi này nếu không có code VÀ không có lỗi từ Zoom
      setError("Không tìm thấy mã xác thực từ Zoom.");
      setMessage("Kết nối Zoom không thành công.");
    }
  }, [location, navigate]);

  return (
    <div
      style={{
        padding: "40px",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>{message}</h2>
      {error && <p style={{ color: "red", marginTop: "10px" }}>Lỗi: {error}</p>}
      <p>Vui lòng đợi hoặc kiểm tra lại sau giây lát.</p>
      {/* Bạn có thể thêm nút để người dùng quay lại nếu quá trình bị kẹt */}
      {error && (
        <button
          onClick={() =>
            navigate("/tai-khoan/ho-so/phong-hop-zoom", { replace: true })
          }
          style={{ padding: "10px 20px", marginTop: "20px", cursor: "pointer" }}
        >
          Quay lại trang Phòng Họp
        </button>
      )}
    </div>
  );
};

export default ZoomCallback;
