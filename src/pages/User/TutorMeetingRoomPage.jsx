// src/pages/User/TutorMeetingRoomPage.jsx
import { useState, useEffect, memo } from "react";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { useNavigate, useLocation } from "react-router-dom";
import ZoomMeetingEmbed from "../../components/User/Zoom/ZoomMeetingEmbed";
import "../../assets/css/TutorMeetingRoomPage.style.css";

const TutorMeetingRoomPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isZoomConnected, setIsZoomConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meetingData, setMeetingData] = useState(null);
  const [classroomInfo, setClassroomInfo] = useState(null);
  const [zoomSignature, setZoomSignature] = useState(null);
  const [zoomSdkKey, setZoomSdkKey] = useState(null);

  useEffect(() => {
    // Check if meeting data was passed from TutorClassroomPage
    if (location.state && location.state.meetingData) {
      setMeetingData(location.state.meetingData);
      setClassroomInfo({
        name: location.state.classroomName,
        id: location.state.classroomId,
        isNewMeeting: location.state.isNewMeeting || false,
      });
    }

    // Check if redirected from classroom page for Zoom connection
    if (location.state && location.state.needZoomConnection) {
      setClassroomInfo({
        name: location.state.classroomName,
        id: location.state.classroomId,
        needConnection: true,
      });
    }

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
        setIsZoomConnected(true);
      } else {
        setIsZoomConnected(false);
      }
      setIsLoading(false);
    };
    checkZoomConnection();
  }, [location, navigate]);

  // Fetch Zoom signature when we have meeting data
  useEffect(() => {
    const fetchZoomSignature = async () => {
      if (!meetingData || !isZoomConnected) return;

      try {
        console.log(
          "Fetching Zoom signature for meeting:",
          meetingData.zoomMeetingId
        );
        const response = await Api({
          endpoint: "meeting/signature",
          method: METHOD_TYPE.POST,
          data: {
            zoomMeetingId: meetingData.zoomMeetingId,
            role: 1, // Host role for tutor
          },
          requireToken: false, // axiosClient handles Zoom Bearer token
        });

        if (response.success && response.data) {
          setZoomSignature(response.data.signature);
          setZoomSdkKey(response.data.sdkKey);
          console.log("Zoom signature fetched successfully");
        } else {
          throw new Error(response.message || "Failed to get Zoom signature");
        }
      } catch (error) {
        console.error("Error fetching Zoom signature:", error);
        setError(
          "Không thể lấy thông tin để tham gia phòng học. Vui lòng thử lại."
        );
      }
    };

    fetchZoomSignature();
  }, [meetingData, isZoomConnected]);

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
    // Redirect back to classroom management page since create meeting functionality is now integrated there
    navigate("/tai-khoan/ho-so/quan-ly-lop-hoc");
  };

  if (isLoading) {
    return (
      <div className="loading-container">Đang tải thông tin phòng họp...</div>
    );
  }
  // If we have meeting data and signature, show the Zoom meeting embed
  if (meetingData && isZoomConnected && zoomSignature && zoomSdkKey) {
    return (
      <div className="tutor-meeting-room-page">
        <div className="meeting-header">
          <h2 className="page-title">
            {classroomInfo?.name || "Phòng học Zoom"}
            {classroomInfo?.isNewMeeting && (
              <span className="new-meeting-badge">Phòng học mới</span>
            )}
          </h2>
          <button
            onClick={() => navigate("/tai-khoan/ho-so/quan-ly-lop-hoc")}
            className="btn btn-secondary btn-back"
          >
            <i className="fas fa-arrow-left" style={{ marginRight: "8px" }}></i>
            Quay lại quản lý lớp học
          </button>
        </div>

        <ZoomMeetingEmbed
          sdkKey={zoomSdkKey}
          signature={zoomSignature}
          meetingNumber={meetingData.zoomMeetingId}
          userName={`Gia sư - ${classroomInfo?.name || "Phòng học"}`}
          passWord={meetingData.password}
          customLeaveUrl={`${window.location.origin}/tai-khoan/ho-so/quan-ly-lop-hoc`}
          onMeetingEnd={() => {
            console.log("Meeting ended");
            navigate("/tai-khoan/ho-so/quan-ly-lop-hoc");
          }}
          onError={(error) => {
            console.error("Zoom meeting error:", error);
            setError(`Lỗi khi tham gia phòng học: ${error}`);
          }}
          onMeetingJoined={() => {
            console.log("Successfully joined meeting");
          }}
        />
      </div>
    );
  }

  // Show loading state if we have meeting data but no signature yet
  if (meetingData && isZoomConnected && (!zoomSignature || !zoomSdkKey)) {
    return (
      <div className="tutor-meeting-room-page">
        <div className="loading-container">
          <p>Đang chuẩn bị phòng học Zoom...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="tutor-meeting-room-page">
      <h2 className="page-title">
        {classroomInfo?.needConnection
          ? `Kết nối Zoom cho lớp: ${classroomInfo.name}`
          : "Quản Lý Phòng Họp"}
      </h2>
      {error && <p className="error-message">{error}</p>}
      {!isZoomConnected ? (
        <div className="zoom-connect-section">
          {classroomInfo?.needConnection ? (
            <div className="classroom-connection-info">
              <div className="connection-notice">
                <i
                  className="fas fa-info-circle"
                  style={{ marginRight: "8px", color: "#007bff" }}
                ></i>
                <span>
                  Bạn cần kết nối tài khoản Zoom để tạo phòng học cho lớp:{" "}
                  <strong>{classroomInfo.name}</strong>
                </span>
              </div>
              <p>
                Sau khi kết nối thành công, bạn sẽ được đưa về trang quản lý lớp
                học để tiếp tục tạo phòng học Zoom.
              </p>
            </div>
          ) : (
            <p>
              Để sử dụng tính năng phòng họp trực tuyến, bạn cần kết nối tài
              khoản Zoom của mình.
            </p>
          )}
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
          <p className="info-text">
            Chức năng tạo phòng học Zoom hiện đã được tích hợp vào trang quản lý
            lớp học. Bạn có thể tạo phòng học trực tiếp từ mỗi lớp học.
          </p>
          <button
            onClick={handleCreateMeeting}
            className="btn btn-primary btn-create-meeting"
          >
            <i
              className="fas fa-chalkboard-teacher"
              style={{ marginRight: "8px" }}
            ></i>
            Đi đến quản lý lớp học
          </button>
        </div>
      )}
    </div>
  );
};
export default memo(TutorMeetingRoomPage);
