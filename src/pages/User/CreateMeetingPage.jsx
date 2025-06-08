// src/pages/User/CreateMeetingPage.jsx
import { useState, useEffect, memo } from "react";
import { useSelector } from "react-redux";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { useNavigate } from "react-router-dom";
import ZoomMeetingEmbed from "../../components/User/Zoom/ZoomMeetingEmbed"; // Điều chỉnh đường dẫn nếu cần
// import CreateMeetingTest from "../../components/CreateMeetingTest";
import "../../assets/css/CreateMeetingPage.style.css";

const CreateMeetingPage = () => {
  const navigate = useNavigate();

  // Lấy thông tin người dùng từ Redux store.
  // Hãy đảm bảo selector này trỏ đúng đến object chứa `fullname` và `email` của người dùng.
  const userProfileFromStore = useSelector(
    (state) => state.user.userProfile?.userProfile
  );
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  const [topic, setTopic] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading cho việc tạo meeting
  const [isFetchingSignature, setIsFetchingSignature] = useState(false); // Loading cho việc lấy signature
  const [error, setError] = useState(null);
  const [meetingDetails, setMeetingDetails] = useState(null); // Lưu thông tin meeting đã tạo
  const [signatureData, setSignatureData] = useState(null); // Lưu signature và sdkKey
  const [isStartingMeeting, setIsStartingMeeting] = useState(false); // Cờ để biết khi nào đang nhúng meeting

  // Chuyển hướng nếu chưa đăng nhập
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
    setError(null); // Xóa lỗi cũ
    // Không reset meetingDetails ở đây để người dùng có thể xem thông tin và quyết định bắt đầu
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
    const currentZoomToken = localStorage.getItem("zoomAccessToken");
    console.log(
      "[CreateMeetingPage] Current zoomAccessToken:",
      currentZoomToken
    );

    if (!currentZoomToken) {
      setError(
        "Kết nối Zoom đã hết hạn hoặc không tồn tại. Vui lòng kết nối lại tài khoản Zoom và thử lại."
      );
      setIsLoading(false);
      return;
    }
    try {
      // Gọi API tạo meeting. axiosClient (trong Api.js) sẽ tự đính kèm token.
      // backendResponse ở đây là data đã được trích xuất bởi axiosClient (nếu bạn cấu hình nó trả về response.data)
      const backendResponse = await Api({
        endpoint: "meeting/create", // Endpoint không có / ở đầu
        method: METHOD_TYPE.POST,
        data: meetingPayload,
        requireToken: true,
      });

      console.log(
        "[CreateMeetingPage] API meeting/create response:",
        backendResponse
      );

      // Giả sử backendResponse có dạng: { success: true, message: "...", data: { meetingId, zoomMeetingId, ... } }
      if (backendResponse && backendResponse.success && backendResponse.data) {
        const createdMeetingData = backendResponse.data; // Dữ liệu meeting thực sự

        // Kiểm tra các trường quan trọng
        if (
          createdMeetingData.zoomMeetingId &&
          createdMeetingData.joinUrl &&
          createdMeetingData.topic
        ) {
          setMeetingDetails(createdMeetingData);
          // Không reset topic, password ngay để người dùng có thể xem lại và quyết định bắt đầu
        } else {
          console.error(
            "[CreateMeetingPage] Dữ liệu phòng họp trả về không đầy đủ:",
            createdMeetingData
          );
          throw new Error(
            backendResponse.message ||
              "Dữ liệu phòng họp nhận được không đúng định dạng như mong đợi."
          );
        }
      } else {
        console.error(
          "[CreateMeetingPage] Lỗi từ API meeting/create hoặc dữ liệu không hợp lệ:",
          backendResponse
        );
        const errorMessage =
          backendResponse?.message ||
          (Array.isArray(backendResponse?.errors)
            ? backendResponse.errors.join(", ")
            : "Không thể tạo phòng họp, máy chủ trả về lỗi hoặc phản hồi không thành công.");
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error(
        "[CreateMeetingPage] CATCH block - Lỗi khi tạo phòng họp:",
        err.response?.data || err.message || err
      );
      let detailedErrorMessage =
        "Không thể tạo phòng họp. Vui lòng thử lại sau.";
      if (err.response && err.response.data) {
        detailedErrorMessage =
          err.response.data.message ||
          err.response.data.error ||
          (Array.isArray(err.response.data.errors)
            ? err.response.data.errors.join(", ")
            : JSON.stringify(err.response.data));
      } else if (err.message) {
        detailedErrorMessage = err.message;
      }
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
        role: "0", // Gia sư là host
      };

      const sigResponse = await Api({
        // sigResponse là data từ axiosClient
        endpoint: "meeting/signature", // Endpoint không có / ở đầu
        method: METHOD_TYPE.POST,
        data: signaturePayload,
        requireToken: true,
      });
      console.log(
        "[CreateMeetingPage] API meeting/signature response:",
        sigResponse
      );

      // Giả sử sigResponse có dạng: { success: true, message: "...", data: { signature, sdkKey, ... } }
      if (sigResponse && sigResponse.success && sigResponse.data) {
        const actualSigData = sigResponse.data;
        if (actualSigData.signature && actualSigData.sdkKey) {
          setSignatureData(actualSigData);
          setIsStartingMeeting(true); // Sẵn sàng hiển thị ZoomMeetingEmbed
        } else {
          throw new Error(
            sigResponse.message ||
              "Không nhận được chữ ký hoặc khóa SDK hợp lệ từ phản hồi."
          );
        }
      } else {
        throw new Error(
          sigResponse?.message ||
            "Không thể lấy chữ ký cho cuộc họp, phản hồi không thành công."
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
    console.log(
      `[CreateMeetingPage] Zoom meeting session ended. Reason: ${reason}`
    );
    setIsStartingMeeting(false); // Thoát khỏi chế độ nhúng
    setSignatureData(null); // Xóa signature data
    // Không reset meetingDetails ở đây, để người dùng có thể xem lại thông tin phòng hoặc tạo phòng mới
    // Có thể hiển thị một thông báo ngắn
    // setError("Phiên họp đã kết thúc."); // Hoặc một state message riêng
  };

  const handleSdkErrorFromEmbed = (errorMessage) => {
    setError(`Lỗi từ Zoom SDK: ${errorMessage}`);
    setIsStartingMeeting(false);
    setSignatureData(null);
  };

  // Nếu đang nhúng meeting, chỉ hiển thị ZoomMeetingEmbed
  if (isStartingMeeting && signatureData && meetingDetails) {
    // Lấy thông tin người dùng cho SDK. Cung cấp giá trị mặc định nếu không có.
    const userNameForSDK = userProfileFromStore?.fullname || "Gia Sư";
    const userEmailForSDK = userProfileFromStore?.email || ""; // Email có thể rỗng nếu SDK cho phép

    return (
      <div className="create-meeting-page zoom-active">
        {" "}
        {/* Class để style riêng khi Zoom active */}
        <ZoomMeetingEmbed
          sdkKey={signatureData.sdkKey}
          signature={signatureData.signature}
          meetingNumber={meetingDetails.zoomMeetingId}
          userName={userNameForSDK}
          userEmail={userEmailForSDK}
          passWord={meetingDetails.password || ""}
          customLeaveUrl={`${window.location.origin}/tai-khoan/ho-so/phong-hoc`} // Quay về trang quản lý phòng họp
          onMeetingEnd={handleMeetingSessionEnd}
          onError={handleSdkErrorFromEmbed}
          onMeetingJoined={() => {
            console.log(
              "[CreateMeetingPage] Meeting successfully joined via SDK!"
            );
            setError(null); // Xóa lỗi nếu có từ trước
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

  // Giao diện mặc định: form tạo meeting hoặc chi tiết meeting đã tạo
  return (
    <div className="create-meeting-page">
      <h2 className="page-title">Tạo Phòng Họp Mới</h2>
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
              placeholder="Ví dụ: Lớp học Toán nâng cao"
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
          <div className="actions-after-create" style={{ marginTop: "15px" }}>
            {" "}
            <button
              onClick={handleStartMeeting}
              className="btn btn-success btn-start-meeting"
              disabled={isFetchingSignature}
            >
              {isFetchingSignature ? "Đang chuẩn bị..." : "Bắt đầu họp"}
            </button>
            <button
              onClick={resetFormAndState}
              className="btn btn-secondary"
              style={{ marginLeft: "10px" }}
            >
              Tạo phòng họp khác
            </button>
          </div>
        </div>
      )}{" "}
      <button
        onClick={() => navigate("/tai-khoan/ho-so/phong-hoc")}
        className="btn btn-link-back"
      >
        Quay lại Quản lý phòng họp
      </button>
      {/* <CreateMeetingTest /> */}
    </div>
  );
};

export default memo(CreateMeetingPage);
