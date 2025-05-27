// src/pages/User/CreateMeetingPage.jsx
import { useState } from "react"; // Thêm useEffect nếu bạn lấy thông tin user từ Redux
import { useSelector } from "react-redux"; // Để lấy thông tin user nếu cần
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { useNavigate } from "react-router-dom";
import ZoomMeetingEmbed from "../../components/User/Zoom/ZoomMeetingEmbed"; // Giả sử bạn đã tạo component này
import "../../assets/css/CreateMeetingPage.style.css";

const CreateMeetingPage = () => {
  const navigate = useNavigate();
  // Lấy thông tin người dùng từ Redux (ví dụ)
  // Điều chỉnh selector này cho phù hợp với cấu trúc store của bạn
  const currentUserFromStore = useSelector((state) => state.user.userProfile); // Giả sử userProfile có fullname và email

  const [topic, setTopic] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading chung cho form submit
  const [isFetchingSignature, setIsFetchingSignature] = useState(false); // Loading cho việc lấy signature
  const [error, setError] = useState(null);
  const [meetingDetails, setMeetingDetails] = useState(null);
  const [signatureData, setSignatureData] = useState(null);
  const [isStartingMeeting, setIsStartingMeeting] = useState(false);

  const resetFormAndState = () => {
    setTopic("");
    setPassword("");
    setMeetingDetails(null);
    setSignatureData(null);
    setIsStartingMeeting(false);
    setError(null); // Xóa lỗi khi reset
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMeetingDetails(null);
    if (!topic.trim()) {
      setError("Vui lòng nhập chủ đề cuộc họp.");
      return;
    }
    setIsLoading(true);

    const meetingPayload = { topic: topic.trim() };
    if (password.trim()) {
      meetingPayload.password = password.trim();
    }
    console.log("[CreateMeetingPage] Submitting meeting data:", meetingPayload);
    const tokenForAPI = localStorage.getItem("zoomAccessToken");
    console.log(
      "[CreateMeetingPage] Zoom Access Token before API call:",
      tokenForAPI
    );

    if (!tokenForAPI) {
      setError(
        "Không tìm thấy token xác thực Zoom. Vui lòng kết nối lại tài khoản Zoom và thử lại."
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
      console.log(
        "[CreateMeetingPage] API meeting/create FULL backendResponse:",
        backendResponse
      );

      if (backendResponse && backendResponse.success && backendResponse.data) {
        const createdMeetingData = backendResponse.data;
        if (
          createdMeetingData.zoomMeetingId &&
          createdMeetingData.joinUrl &&
          createdMeetingData.topic
        ) {
          setMeetingDetails(createdMeetingData); // Chỉ set, không reset form ở đây
          console.log(
            "[CreateMeetingPage] Tạo phòng họp thành công:",
            createdMeetingData
          );
        } else {
          console.error(
            "[CreateMeetingPage] Dữ liệu phòng họp trả về không đầy đủ:",
            createdMeetingData
          );
          throw new Error(
            backendResponse.message ||
              "Dữ liệu phòng họp nhận được không đúng định dạng."
          );
        }
      } else {
        const errorMessage =
          backendResponse?.message ||
          backendResponse?.errors?.join(", ") ||
          "Không thể tạo phòng họp, máy chủ trả về lỗi.";
        throw new Error(errorMessage);
      }
    } catch (err) {
      // ... (Xử lý lỗi chi tiết như trước) ...
      let detailedErrorMessage =
        "Không thể tạo phòng họp. Vui lòng thử lại sau.";
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
      setError("Không có thông tin phòng họp để bắt đầu.");
      return;
    }
    setIsFetchingSignature(true); // Dùng cờ loading riêng
    setError(null);

    try {
      const signaturePayload = {
        zoomMeetingId: String(meetingDetails.zoomMeetingId),
        role: "0", // Gia sư là host
      };
      const sigResponse = await Api({
        endpoint: "meeting/signature",
        method: METHOD_TYPE.POST,
        data: signaturePayload,
      });
      console.log(
        "[CreateMeetingPage] API meeting/signature response data:",
        sigResponse
      );

      if (sigResponse && sigResponse.success && sigResponse.data) {
        const actualSigData = sigResponse.data; // Giả sử đây là { signature, sdkKey, ... }
        if (actualSigData.signature && actualSigData.sdkKey) {
          setSignatureData(actualSigData);
          setIsStartingMeeting(true);
        } else {
          throw new Error(
            sigResponse.message ||
              "Không nhận được signature hoặc sdkKey hợp lệ."
          );
        }
      } else {
        throw new Error(
          sigResponse?.message || "Không thể lấy chữ ký cho cuộc họp."
        );
      }
    } catch (err) {
      // ... (Xử lý lỗi chi tiết như trước) ...
      let detailedErrorMessage = "Không thể bắt đầu cuộc họp. Lỗi lấy chữ ký.";
      if (err.response?.data?.message)
        detailedErrorMessage = err.response.data.message;
      else if (err.message) detailedErrorMessage = err.message;
      setError(detailedErrorMessage);
    } finally {
      setIsFetchingSignature(false);
    }
  };

  const handleMeetingSessionEnd = () => {
    console.log("Zoom meeting session ended or user left.");
    setIsStartingMeeting(false);
    setSignatureData(null);
    // Không tự động reset meetingDetails, để người dùng có thể xem lại thông tin phòng
    // Hoặc có thể cho phép tạo phòng mới từ đây.
    // setError("Phiên họp đã kết thúc."); // Tùy chọn: thông báo cho người dùng
  };

  const handleSdkError = (errorMessage) => {
    setError(`Lỗi từ Zoom SDK: ${errorMessage}`);
    setIsStartingMeeting(false); // Thoát khỏi chế độ nhúng nếu SDK lỗi
    setSignatureData(null);
  };

  if (isStartingMeeting && signatureData && meetingDetails) {
    const userNameForSDK =
      currentUserFromStore?.userProfile?.fullname ||
      currentUserFromStore?.fullname ||
      "Gia Sư";
    const userEmailForSDK = currentUserFromStore?.email || ""; // Email có thể optional

    return (
      <div className="create-meeting-page zoom-active">
        <ZoomMeetingEmbed
          sdkKey={signatureData.sdkKey}
          signature={signatureData.signature}
          meetingNumber={meetingDetails.zoomMeetingId}
          userName={userNameForSDK}
          userEmail={userEmailForSDK}
          passWord={meetingDetails.password || ""}
          role={signatureData.role || "0"} // Role từ signature là tốt nhất
          leaveUrl={`${window.location.origin}/tai-khoan/ho-so/phong-hop-zoom`}
          onMeetingEnd={handleMeetingSessionEnd}
          onError={handleSdkError}
        />
        <button
          onClick={handleMeetingSessionEnd}
          className="btn btn-danger btn-leave-meeting-manually"
          style={{ marginTop: "10px" }}
        >
          Đóng giao diện họp
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
              placeholder="Ví dụ: Buổi học React cơ bản"
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
