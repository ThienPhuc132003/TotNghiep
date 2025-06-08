// src/pages/User/TutorMeetingRoomPage.jsx
import { useState, useEffect, memo } from "react";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { useNavigate, useLocation } from "react-router-dom";
import ZoomMeetingEmbed from "../../components/User/Zoom/ZoomMeetingEmbed"; // Re-enabled after fixing critical import issue
import ZoomDebugComponent from "../../components/User/Zoom/ZoomDebugComponent"; // Keep for debugging
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
  const [userRole, setUserRole] = useState("host"); // Default to host for tutor
  const [useDebugComponent, setUseDebugComponent] = useState(true); // Toggle between debug and production component
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
  }, [location, navigate]); // Fetch Zoom signature when we have meeting data
  useEffect(() => {
    const fetchZoomSignature = async () => {
      if (!meetingData || !isZoomConnected) {
        console.log("🔍 Skipping signature fetch:", {
          hasMeetingData: !!meetingData,
          isZoomConnected,
          userRole,
        });
        return;
      }

      try {
        console.log("🔑 Fetching Zoom signature with params:", {
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
          requireToken: false, // axiosClient handles Zoom Bearer token
        });

        console.log("📡 Signature API response:", response);

        if (response.success && response.data) {
          setZoomSignature(response.data.signature);
          setZoomSdkKey(response.data.sdkKey);
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

    fetchZoomSignature();
  }, [meetingData, isZoomConnected, userRole]);

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
          </h2>{" "}
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
          </button>{" "}
        </div>{" "}
        {/* Component Toggle */}
        <div
          style={{
            marginBottom: "15px",
            padding: "10px",
            backgroundColor: "#f8f9fa",
            borderRadius: "5px",
            border: "1px solid #dee2e6",
          }}
        >
          <label style={{ marginRight: "10px", fontWeight: "bold" }}>
            Chọn component Zoom:
          </label>
          <button
            onClick={() => setUseDebugComponent(true)}
            style={{
              marginRight: "10px",
              padding: "5px 15px",
              backgroundColor: useDebugComponent ? "#007bff" : "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
            }}
          >
            Debug Component {useDebugComponent ? "✓" : ""}
          </button>
          <button
            onClick={() => setUseDebugComponent(false)}
            style={{
              padding: "5px 15px",
              backgroundColor: !useDebugComponent ? "#28a745" : "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
            }}
          >
            Production Component {!useDebugComponent ? "✓" : ""}
          </button>
          <small
            style={{ display: "block", marginTop: "5px", color: "#6c757d" }}
          >
            Debug: Thông tin chi tiết về SDK loading | Production: Component
            chính đã được sửa
          </small>
        </div>
        {/* Conditional Zoom Component Rendering */}
        {useDebugComponent ? (
          <ZoomDebugComponent
            sdkKey={zoomSdkKey}
            signature={zoomSignature}
            meetingNumber={meetingData.zoomMeetingId}
            userName={
              userRole === "host"
                ? `Gia sư - ${classroomInfo?.name || "Phòng học"}`
                : `Học viên - ${classroomInfo?.name || "Phòng học"}`
            }
            passWord={meetingData.password}
            onError={(error) => {
              console.error("Zoom debug error:", error);
              setError(`Debug error: ${error}`);
            }}
          />
        ) : (
          <ZoomMeetingEmbed
            sdkKey={zoomSdkKey}
            signature={zoomSignature}
            meetingNumber={meetingData.zoomMeetingId}
            userName={
              userRole === "host"
                ? `Gia sư - ${classroomInfo?.name || "Phòng học"}`
                : `Học viên - ${classroomInfo?.name || "Phòng học"}`
            }
            userEmail="test@example.com"
            passWord={meetingData.password}
            customLeaveUrl="/"
            onMeetingEnd={() => {
              console.log("Meeting ended");
              navigate("/tutor/classroom");
            }}
            onError={(error) => {
              console.error("Zoom production error:", error);
              setError(`Production error: ${error}`);
            }}
            onMeetingJoined={() => {
              console.log("Meeting joined successfully");
            }}
          />
        )}
        {/* 
        Note: Both components now available with toggle
        - ZoomDebugComponent: Comprehensive debugging and error reporting
        - ZoomMeetingEmbed: Fixed production component with dynamic SDK loading
        */}
      </div>
    );
  }
  // Show loading state if we have meeting data but no signature yet
  if (meetingData && isZoomConnected && (!zoomSignature || !zoomSdkKey)) {
    return (
      <div className="tutor-meeting-room-page">
        <div className="loading-container">
          <p>Đang chuẩn bị phòng học Zoom...</p>
          <div style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
            <p>Meeting ID: {meetingData.zoomMeetingId}</p>
            <p>
              Role:{" "}
              {userRole === "host" ? "Gia sư (Host)" : "Học viên (Participant)"}
            </p>
            <p>Signature: {zoomSignature ? "✅" : "⏳ Đang lấy..."}</p>
            <p>SDK Key: {zoomSdkKey ? "✅" : "⏳ Đang lấy..."}</p>
          </div>
          {error && (
            <div
              style={{
                color: "red",
                marginTop: "15px",
                padding: "10px",
                border: "1px solid red",
                borderRadius: "5px",
              }}
            >
              <strong>Lỗi:</strong> {error}
              <br />
              <button
                onClick={() => window.location.reload()}
                style={{ marginTop: "10px", padding: "5px 10px" }}
              >
                Thử lại
              </button>
            </div>
          )}
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
