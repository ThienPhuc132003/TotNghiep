// src/pages/User/TutorMeetingRoomPage.jsx
import { useState, useEffect } from "react";
import Api from "../../network/Api"; // Đảm bảo đường dẫn import Api đúng
import { METHOD_TYPE } from "../../network/methodType"; // Đảm bảo đường dẫn import METHOD_TYPE đúng
import { useNavigate } from "react-router-dom";
import "../../assets/css/TutorMeetingRoomPage.style.css"; // Đảm bảo đường dẫn CSS đúng

const TutorMeetingRoomPage = () => {
  const navigate = useNavigate();
  const [isZoomConnected, setIsZoomConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const zoomAccessToken = localStorage.getItem("zoomAccessToken");
    if (zoomAccessToken) {
      // TODO (Optional but recommended): Xác thực token này bằng cách gọi một API nhẹ của Zoom,
      // ví dụ: lấy thông tin người dùng Zoom. Nếu thành công -> setIsZoomConnected(true).
      // Nếu thất bại (token hết hạn/không hợp lệ) -> xóa token và setIsZoomConnected(false).
      // Hiện tại, chỉ kiểm tra sự tồn tại.
      setIsZoomConnected(true);
    } else {
      setIsZoomConnected(false);
    }
    setIsLoading(false);
  }, []);

  const handleConnectZoom = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Api.js sẽ trả về data trực tiếp do axiosClient trả về response.data
      const responseData = await Api({
        endpoint: "/meeting/auth",
        method: METHOD_TYPE.GET,
      });

      // Console log để kiểm tra cấu trúc dữ liệu nhận được
      console.log("Dữ liệu nhận được từ API /meeting/auth:", responseData);
      if (responseData && typeof responseData === "object") {
        console.log("Các key trong responseData:", Object.keys(responseData));
        if (responseData.data && typeof responseData.data === "object") {
          console.log(
            "Các key trong responseData.data:",
            Object.keys(responseData.data)
          );
        }
      }

      // Kiểm tra xem responseData có tồn tại, có thuộc tính 'data',
      // và responseData.data là object có thuộc tính 'zoomAuthUrl' không
      if (
        responseData &&
        responseData.data &&
        typeof responseData.data === "object" &&
        responseData.data.zoomAuthUrl
      ) {
        const zoomAuthUrl = responseData.data.zoomAuthUrl; // Lấy từ responseData.data
        window.location.href = zoomAuthUrl; // Chuyển hướng đến Zoom để xác thực
        // Không cần setIsLoading(false) ở đây vì trang sẽ chuyển hướng
      } else {
        console.error(
          "responseData.data không chứa zoomAuthUrl hoặc có cấu trúc không mong đợi:",
          responseData
        );
        setError(
          "Không thể lấy được URL xác thực Zoom từ phản hồi của máy chủ (cấu trúc dữ liệu không đúng). Vui lòng thử lại."
        );
        setIsLoading(false); // Quan trọng: set lại loading khi có lỗi
      }
    } catch (err) {
      console.error("Lỗi khi yêu cầu kết nối Zoom (trong catch):", err);
      // err có thể là message string hoặc object lỗi từ axiosClient
      // (axiosClient trả về error.response?.data || error.response || error)
      let errorMessage = "Đã có lỗi xảy ra khi cố gắng kết nối với Zoom.";
      if (typeof err === "string") {
        errorMessage = err;
      } else if (err && err.message) {
        errorMessage = err.message;
      } else if (err && err.error) {
        // Nếu backend trả về { error: "message" }
        errorMessage = err.error;
      }
      // Bạn có thể muốn kiểm tra sâu hơn trong err nếu nó là một object phức tạp
      // Ví dụ: if (err && err.data && err.data.message) errorMessage = err.data.message;

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleCreateMeeting = () => {
    navigate("/tai-khoan/ho-so/tao-phong-hop-moi");
  };

  if (isLoading) {
    return (
      <div className="loading-container">Đang tải thông tin phòng họp...</div>
    );
  }

  return (
    <div className="tutor-meeting-room-page">
      <h2 className="page-title">Quản Lý Phòng Họp Zoom</h2>

      {error && <p className="error-message">{error}</p>}

      {!isZoomConnected ? (
        <div className="zoom-connect-section">
          <p>
            Để sử dụng tính năng phòng họp trực tuyến, bạn cần kết nối tài khoản
            Zoom của mình.
          </p>
          <button
            onClick={handleConnectZoom}
            className="btn btn-primary btn-connect-zoom"
            disabled={isLoading}
          >
            <i className="fas fa-video" style={{ marginRight: "8px" }}></i>
            Kết nối tài khoản Zoom
          </button>
        </div>
      ) : (
        <div className="zoom-connected-section">
          <div className="connection-status success">
            <i className="fas fa-check-circle"></i>
            <span>Tài khoản Zoom của bạn đã được kết nối.</span>
          </div>
          <button
            onClick={handleCreateMeeting}
            className="btn btn-primary btn-create-meeting"
          >
            <i
              className="fas fa-plus-circle"
              style={{ marginRight: "8px" }}
            ></i>
            Tạo phòng họp mới
          </button>
          {/* Khu vực hiển thị danh sách các phòng họp (sẽ làm sau) */}
        </div>
      )}
    </div>
  );
};

export default TutorMeetingRoomPage;
