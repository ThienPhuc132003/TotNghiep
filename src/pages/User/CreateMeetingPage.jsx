// src/pages/User/CreateMeetingPage.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { useNavigate } from "react-router-dom";
import ZoomMeetingEmbed from "../../components/User/Zoom/ZoomMeetingEmbed"; // Điều chỉnh đường dẫn nếu cần
import "../../assets/css/CreateMeetingPage.style.css";

const CreateMeetingPage = () => {
  const navigate = useNavigate();
  const userProfileData = useSelector(
    (state) => state.user.userProfile?.userProfile
  ); // Điều chỉnh cho đúng selector
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  const [topic, setTopic] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSignature, setIsFetchingSignature] = useState(false);
  const [error, setError] = useState(null);
  const [meetingDetails, setMeetingDetails] = useState(null);
  const [signatureData, setSignatureData] = useState(null);
  const [isStartingMeeting, setIsStartingMeeting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: "/tai-khoan/ho-so/tao-phong-hop-moi" },
      });
    }
  }, [isAuthenticated, navigate]);

  const resetFormAndState = () => {
    setTopic("");
    setPassword("");
    setMeetingDetails(null);
    setSignatureData(null);
    setIsStartingMeeting(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!topic.trim()) {
      setError("Vui lòng nhập chủ đề cuộc họp.");
      return;
    }
    setIsLoading(true);

    const meetingPayload = { topic: topic.trim() };
    if (password.trim()) {
      meetingPayload.password = password.trim();
    }

    const currentZoomToken = localStorage.getItem("zoomAccessToken");
    if (!currentZoomToken) {
      setError(
        "Kết nối Zoom đã hết hạn hoặc không tồn tại. Vui lòng kết nối lại tài khoản Zoom."
      );
      setIsLoading(false);
      return;
    }

    try {
      const backendResponse = await Api({
        endpoint: "meeting/create",
        method: METHOD_TYPE.POST,
        data: meetingPayload,
      });

      if (backendResponse && backendResponse.success && backendResponse.data) {
        const createdMeetingData = backendResponse.data;
        if (
          createdMeetingData.zoomMeetingId &&
          createdMeetingData.joinUrl &&
          createdMeetingData.topic
        ) {
          setMeetingDetails(createdMeetingData);
        } else {
          throw new Error(
            backendResponse.message ||
              "Dữ liệu phòng họp nhận được không đúng định dạng."
          );
        }
      } else {
        throw new Error(
          backendResponse?.message ||
            "Không thể tạo phòng họp, phản hồi không thành công."
        );
      }
    } catch (err) {
      let detailedErrorMessage = "Lỗi không xác định khi tạo phòng họp.";
      if (err.response?.data?.message)
        detailedErrorMessage = err.response.data.message;
      else if (err.message) detailedErrorMessage = err.message;
      setError(detailedErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartMeeting = async () => {
    if (!meetingDetails || !meetingDetails.zoomMeetingId) {
      setError("Thông tin phòng họp không đầy đủ để bắt đầu.");
      return;
    }
    setIsFetchingSignature(true);
    setError(null);

    try {
      const signaturePayload = {
        zoomMeetingId: String(meetingDetails.zoomMeetingId),
        role: "0",
      };
      const sigResponse = await Api({
        endpoint: "meeting/signature",
        method: METHOD_TYPE.POST,
        data: signaturePayload,
      });

      if (sigResponse && sigResponse.success && sigResponse.data) {
        const actualSigData = sigResponse.data;
        if (actualSigData.signature && actualSigData.sdkKey) {
          setSignatureData(actualSigData);
          setIsStartingMeeting(true);
        } else {
          throw new Error(
            sigResponse.message ||
              "Không nhận được chữ ký hoặc khóa SDK hợp lệ."
          );
        }
      } else {
        throw new Error(
          sigResponse?.message || "Không thể lấy chữ ký cho cuộc họp."
        );
      }
    } catch (err) {
      let detailedErrorMessage = "Lỗi khi chuẩn bị bắt đầu cuộc họp.";
      if (err.response?.data?.message)
        detailedErrorMessage = err.response.data.message;
      else if (err.message) detailedErrorMessage = err.message;
      setError(detailedErrorMessage);
    } finally {
      setIsFetchingSignature(false);
    }
  };

  const handleMeetingSessionEnd = (reason) => {
    console.log(`Zoom meeting session ended. Reason: ${reason}`);
    setIsStartingMeeting(false);
    setSignatureData(null);
  };

  const handleSdkErrorFromEmbed = (errorMessage) => {
    setError(`Lỗi từ Zoom SDK: ${errorMessage}`);
    setIsStartingMeeting(false);
    setSignatureData(null);
  };

  if (isStartingMeeting && signatureData && meetingDetails) {
    const userNameForSDK = userProfileData?.fullname || "Gia Sư";
    const userEmailForSDK = userProfileData?.email || "";

    return (
      <div className="create-meeting-page zoom-active">
        <ZoomMeetingEmbed
          sdkKey={signatureData.sdkKey}
          signature={signatureData.signature}
          meetingNumber={meetingDetails.zoomMeetingId}
          userName={userNameForSDK}
          userEmail={userEmailForSDK}
          passWord={meetingDetails.password || ""}
          customLeaveUrl={`${window.location.origin}/tai-khoan/ho-so/phong-hop-zoom`}
          onMeetingEnd={handleMeetingSessionEnd}
          onError={handleSdkErrorFromEmbed}
          onMeetingJoined={() => {
            console.log("Meeting joined via SDK!");
            setError(null);
          }}
        />
        <button
          onClick={() => handleMeetingSessionEnd("manual_close")}
          className="btn btn-danger btn-leave-meeting-manually"
          style={{ marginTop: "10px" }}
        >
          Đóng Giao Diện Họp
        </button>
      </div>
    );
  }

  return (
    <div className="create-meeting-page">
      <h2 className="page-title">Tạo Phòng Họp Zoom Mới</h2>
      {error && (
        <p className="error-message" style={{ whiteSpace: "pre-wrap" }}>
          {error}
        </p>
      )}
      {!meetingDetails ? (
        <form onSubmit={handleSubmit} className="create-meeting-form">
          <div className="form-group">
            <label htmlFor="topic">
              Chủ đề cuộc họp <span className="required">*</span>
            </label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ví dụ: Lớp học Toán lớp 10"
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu (nếu cần)</label>
            <input
              type="text"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Để trống nếu không đặt mật khẩu"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Đang tạo..." : "Tạo phòng họp"}
          </button>
        </form>
      ) : (
        <div className="meeting-created-details">
          <h3>Phòng họp đã được tạo!</h3>
          <p>
            <strong>Chủ đề:</strong> {meetingDetails.topic}
          </p>
          <p>
            <strong>ID Phòng Zoom:</strong> {meetingDetails.zoomMeetingId}
          </p>
          <p>
            <strong>Thời gian bắt đầu (dự kiến):</strong>{" "}
            {new Date(meetingDetails.startTime).toLocaleString("vi-VN")}
          </p>
          <p>
            <strong>Link tham gia (mở bằng ứng dụng Zoom):</strong>{" "}
            <a
              href={meetingDetails.joinUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {meetingDetails.joinUrl}
            </a>
          </p>
          {meetingDetails.password && (
            <p>
              <strong>Mật khẩu phòng:</strong> {meetingDetails.password}
            </p>
          )}
          <div className="actions-after-create">
            <button
              onClick={handleStartMeeting}
              className="btn btn-success btn-start-meeting"
              disabled={isFetchingSignature}
            >
              {isFetchingSignature
                ? "Đang chuẩn bị..."
                : "Bắt đầu (Nhúng vào trang)"}
            </button>
            <button onClick={resetFormAndState} className="btn btn-secondary">
              Tạo phòng họp khác
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => navigate("/tai-khoan/ho-so/phong-hop-zoom")}
        className="btn btn-link-back"
        style={{ marginTop: "20px" }}
      >
        Quay lại Quản lý phòng họp
      </button>
    </div>
  );
};
export default CreateMeetingPage;
