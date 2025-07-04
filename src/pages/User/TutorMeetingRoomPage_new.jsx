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
  const [userRole, setUserRole] = useState("host"); // Default to host for tutor
  const [isStartingMeeting, setIsStartingMeeting] = useState(false);
  const [signatureData, setSignatureData] = useState(null);

  useEffect(() => {
    console.log("📍 TutorMeetingRoomPage - Navigation state received:", {
      hasLocationState: !!location.state,
      hasMeetingData: !!(location.state && location.state.meetingData),
      hasZoomConnection: !!(
        location.state && location.state.needZoomConnection
      ),
      hasZoomAuthError: !!(location.state && location.state.zoomAuthError),
      userRole: location.state?.userRole,
      classroomName: location.state?.classroomName,
    });

    // Check if meeting data was passed from TutorClassroomPage
    if (location.state && location.state.meetingData) {
      console.log("✅ Meeting data found:", location.state.meetingData);
      setMeetingData(location.state.meetingData);
      setClassroomInfo({
        name: location.state.classroomName,
        id: location.state.classroomId,
        isNewMeeting: location.state.isNewMeeting || false,
      });

      // Set user role based on navigation source
      if (location.state.userRole === "student") {
        console.log("👨‍🎓 Setting role to participant (student)");
        setUserRole("participant");
      } else {
        console.log("👨‍🏫 Setting role to host (tutor)");
        setUserRole("host"); // Default for tutor
      }
    }

    // Check if redirected from classroom page for Zoom connection
    if (location.state && location.state.needZoomConnection) {
      console.log(
        "🔗 Need Zoom connection for classroom:",
        location.state.classroomName
      );
      setClassroomInfo({
        name: location.state.classroomName,
        id: location.state.classroomId,
        needConnection: true,
      });
    }

    // Kiểm tra lỗi được truyền từ ZoomCallback
    if (location.state && location.state.zoomAuthError) {
      console.log("❌ Zoom auth error received:", location.state.zoomAuthError);
      setError(location.state.zoomAuthError);
      // Xóa state để không hiển thị lại khi refresh hoặc điều hướng nội bộ
      navigate(location.pathname, { replace: true, state: {} });
    }

    const checkZoomConnection = async () => {
      setIsLoading(true);
      const zoomAccessToken = localStorage.getItem("zoomAccessToken");
      console.log("🔍 Checking Zoom connection:", {
        hasToken: !!zoomAccessToken,
        tokenLength: zoomAccessToken?.length,
      });

      if (zoomAccessToken) {
        setIsZoomConnected(true);
        console.log("✅ Zoom is connected");
      } else {
        setIsZoomConnected(false);
        console.log("❌ Zoom not connected");
      }
      setIsLoading(false);
    };
    checkZoomConnection();
  }, [location, navigate]);

  // Meeting session end handler (like CreateMeetingPage)
  const handleMeetingSessionEnd = (reason) => {
    console.log(
      `[TutorMeetingRoomPage] Zoom meeting session ended. Reason: ${reason}`
    );
    setIsStartingMeeting(false); // Exit embedded mode
    setSignatureData(null); // Clear signature data
    // User can see meeting info again or navigate away
  };

  const handleSdkErrorFromEmbed = (errorMessage) => {
    setError(`Lỗi từ Zoom SDK: ${errorMessage}`);
    setIsStartingMeeting(false);
    setSignatureData(null);
  };

  // Manual meeting start function (like CreateMeetingPage pattern)
  const handleStartMeeting = async () => {
    if (!meetingData || !isZoomConnected) {
      setError("Meeting data or Zoom connection not available");
      return;
    }

    try {
      setError(null);
      console.log("🔑 Starting meeting with params:", {
        meetingId: meetingData.zoomMeetingId,
        userRole,
        roleValue: userRole === "host" ? 1 : 0,
        zoomToken: !!localStorage.getItem("zoomAccessToken"),
      });

      // Determine role: 1 for host (tutor), 0 for participant (student)
      const roleValue = userRole === "host" ? 1 : 0;
      const response = await Api({
        endpoint: "meeting/signature",
        method: METHOD_TYPE.POST,
        data: {
          zoomMeetingId: meetingData.zoomMeetingId,
          role: roleValue,
        },
        requireToken: true, // Same as working CreateMeetingPage
      });

      console.log("📡 Signature API response:", response);

      if (response.success && response.data) {
        setSignatureData({
          signature: response.data.signature,
          sdkKey: response.data.sdkKey,
        });
        setIsStartingMeeting(true); // Direct control like old flow
        console.log("✅ Zoom signature fetched successfully:", {
          hasSignature: !!response.data.signature,
          hasSdkKey: !!response.data.sdkKey,
        });
      } else {
        console.error("❌ Signature API failed:", response);
        throw new Error(response.message || "Failed to get Zoom signature");
      }
    } catch (error) {
      console.error("🚨 Error fetching Zoom signature:", error);
      setError(
        `Không thể lấy thông tin để tham gia phòng học: ${
          error.message || error
        }. Vui lòng thử lại.`
      );
    }
  };

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

  // If starting meeting with signature, show Zoom embed (like CreateMeetingPage pattern)
  if (isStartingMeeting && signatureData && meetingData) {
    // Get user info for SDK with defaults like CreateMeetingPage
    const userNameForSDK =
      userRole === "host"
        ? `Gia sư - ${classroomInfo?.name || "Phòng học"}`
        : `Học viên - ${classroomInfo?.name || "Phòng học"}`;
    const userEmailForSDK = ""; // Can be empty if SDK allows

    return (
      <div className="tutor-meeting-room-page zoom-active">
        <ZoomMeetingEmbed
          sdkKey={signatureData.sdkKey}
          signature={signatureData.signature}
          meetingNumber={meetingData.zoomMeetingId}
          userName={userNameForSDK}
          userEmail={userEmailForSDK}
          passWord={meetingData.password || ""} // Zoom SDK handles password natively
          customLeaveUrl={`${window.location.origin}/tai-khoan/ho-so/phong-hoc`}
          onMeetingEnd={handleMeetingSessionEnd}
          onError={handleSdkErrorFromEmbed}
          onMeetingJoined={() => {
            console.log(
              "[TutorMeetingRoomPage] Meeting successfully joined via SDK!"
            );
            setError(null); // Clear any errors
          }}
        />
        <button
          onClick={() => handleMeetingSessionEnd("manual_close")}
          className="btn btn-danger btn-leave-meeting-manually"
          style={{ marginTop: "15px" }}
        >
          Đóng Giao Diện Họp
        </button>
      </div>
    );
  }

  // Show meeting info and start button if we have meeting data (like CreateMeetingPage)
  if (meetingData && isZoomConnected) {
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
            onClick={() => {
              const redirectUrl =
                userRole === "host"
                  ? "/tai-khoan/ho-so/quan-ly-lop-hoc"
                  : "/tai-khoan/ho-so/lop-hoc-cua-toi";
              navigate(redirectUrl);
            }}
            className="btn btn-secondary btn-back"
          >
            <i className="fas fa-arrow-left" style={{ marginRight: "8px" }}></i>
            {userRole === "host"
              ? "Quay lại quản lý lớp học"
              : "Quay lại lớp học của tôi"}
          </button>
        </div>

        {/* Meeting details like CreateMeetingPage */}
        <div className="meeting-details">
          <h3>Thông tin phòng học</h3>
          <p>
            <strong>Chủ đề:</strong> {meetingData.topic}
          </p>
          <p>
            <strong>ID Phòng Zoom:</strong> {meetingData.zoomMeetingId}
          </p>
          {meetingData.startTime && (
            <p>
              <strong>Thời gian bắt đầu:</strong>{" "}
              {new Date(meetingData.startTime).toLocaleString("vi-VN")}
            </p>
          )}
          {meetingData.password && (
            <p>
              <strong>Mật khẩu:</strong> {meetingData.password}
            </p>
          )}
          <p>
            <strong>Role:</strong>{" "}
            {userRole === "host" ? "Gia sư (Host)" : "Học viên (Participant)"}
          </p>

          {/* Start button - available for both Host and Student */}
          <div className="meeting-actions" style={{ marginTop: "20px" }}>
            <button
              onClick={handleStartMeeting}
              className="btn btn-success btn-start-meeting"
              disabled={!meetingData || !isZoomConnected}
            >
              {signatureData
                ? "Đang chuẩn bị..."
                : "Bắt đầu phòng học (nhúng vào trang)"}
            </button>

            <p
              style={{
                fontSize: "14px",
                color: "#666",
                marginTop: "10px",
                fontStyle: "italic",
              }}
            >
              <i
                className="fas fa-info-circle"
                style={{ marginRight: "5px" }}
              ></i>
              Zoom sẽ tự động yêu cầu mật khẩu nếu cần thiết
            </p>
          </div>
        </div>

        {error && (
          <div className="error-section" style={{ marginTop: "20px" }}>
            <div
              className="error-message"
              style={{
                color: "red",
                padding: "10px",
                border: "1px solid red",
                borderRadius: "5px",
              }}
            >
              <strong>Lỗi:</strong> {error}
              <br />
              <button
                onClick={() => setError(null)}
                style={{ marginTop: "10px", padding: "5px 10px" }}
              >
                Đóng
              </button>
            </div>
          </div>
        )}
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
