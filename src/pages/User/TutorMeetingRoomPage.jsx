// src/pages/User/TutorMeetingRoomPage.jsx
import { useState, useEffect } from "react";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { useNavigate, useLocation } from "react-router-dom"; // Thêm useLocation
import "../../assets/css/TutorMeetingRoomPage.style.css";

const TutorMeetingRoomPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Để nhận state từ ZoomCallback
  const [isZoomConnected, setIsZoomConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // Lỗi hiển thị trên trang này

  useEffect(() => {
    // Kiểm tra lỗi được truyền từ ZoomCallback
    if (location.state && location.state.zoomAuthError) {
      setError(location.state.zoomAuthError);
      // Xóa state để không hiển thị lại khi refresh hoặc điều hướng nội bộ
      navigate(location.pathname, { replace: true, state: {} });
    }

    const checkZoomConnection = async () => {
      setIsLoading(true);
      const zoomAccessToken = localStorage.getItem("zoomAccessToken");
      if (zoomAccessToken) {
        // Tùy chọn: Gọi API backend để xác thực token này còn hiệu lực không
        // Ví dụ:
        // try {
        //   const verifyResponse = await Api({ endpoint: "meeting/verify-token", method: METHOD_TYPE.GET });
        //   if (verifyResponse && verifyResponse.success) {
        //     setIsZoomConnected(true);
        //   } else {
        //     throw new Error(verifyResponse?.message || "Token Zoom không hợp lệ");
        //   }
        // } catch (e) {
        //   localStorage.removeItem("zoomAccessToken");
        //   localStorage.removeItem("zoomRefreshToken");
        //   setIsZoomConnected(false);
        //   setError("Phiên làm việc với Zoom đã hết hạn hoặc token không hợp lệ. Vui lòng kết nối lại.");
        // }
        setIsZoomConnected(true); // Tạm thời giả định có token là connected
      } else {
        setIsZoomConnected(false);
      }
      setIsLoading(false);
    };
    checkZoomConnection();
  }, [location, navigate]); // Thêm location, navigate vào dependency

  const handleConnectZoom = async () => {
    setIsLoading(true);
    setError(null); // Xóa lỗi cũ trước khi thử kết nối mới
    try {
      const backendResponse = await Api({
        // backendResponse là data từ axiosClient
        endpoint: "meeting/auth", // Endpoint không có / ở đầu
        method: METHOD_TYPE.GET,
      });
      if (
        backendResponse &&
        backendResponse.success &&
        backendResponse.data &&
        backendResponse.data.zoomAuthUrl
      ) {
        window.location.href = backendResponse.data.zoomAuthUrl;
      } else {
        const errMsg =
          backendResponse?.message || "Không thể lấy URL xác thực Zoom.";
        setError(errMsg);
        setIsLoading(false);
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Lỗi kết nối đến máy chủ.";
      setError(errMsg);
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
      {error && <p className="error-message">{error}</p>} {/* Hiển thị lỗi */}
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
        </div>
      )}
    </div>
  );
};
export default TutorMeetingRoomPage;
