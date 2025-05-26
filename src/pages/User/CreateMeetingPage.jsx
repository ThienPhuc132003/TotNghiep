// src/pages/User/CreateMeetingPage.jsx
import { useState } from "react";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { useNavigate } from "react-router-dom";
import "../../assets/css/CreateMeetingPage.style.css"; // Tạo file CSS này

const CreateMeetingPage = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meetingDetails, setMeetingDetails] = useState(null); // Để hiển thị thông tin phòng đã tạo

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError("Vui lòng nhập chủ đề cuộc họp.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setMeetingDetails(null);

    try {
      const meetingData = { topic: topic.trim() };
      if (password.trim()) {
        meetingData.password = password.trim();
      }

      // API /meeting/create cần zoomAccessToken, axiosClient sẽ tự đính kèm
      const responseData = await Api({
        endpoint: "/meeting/create",
        method: METHOD_TYPE.POST,
        data: meetingData,
      });

      // Giả sử responseData là: { meetingId, zoomMeetingId, topic, startTime, joinUrl }
      setMeetingDetails(responseData);
      console.log("Tạo phòng họp thành công:", responseData);
      // Có thể reset form hoặc hiển thị thông báo thành công rõ ràng hơn
      setTopic(""); // Reset topic sau khi tạo thành công
      setPassword(""); // Reset password
    } catch (err) {
      console.error("Lỗi khi tạo phòng họp:", err);
      const errorMessage =
        typeof err === "string"
          ? err
          : err.message ||
            err.error ||
            "Không thể tạo phòng họp. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-meeting-page">
      <h2 className="page-title">Tạo Phòng Họp Zoom Mới</h2>

      {error && <p className="error-message">{error}</p>}

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
            <label htmlFor="password">Mật khẩu (để trống nếu không cần)</label>
            <input
              type="text" // Để text cho dễ nhìn, có thể đổi thành password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ít nhất 1 ký tự nếu đặt"
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
          <h3>Phòng họp đã được tạo thành công!</h3>
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
            <strong>Link tham gia:</strong>
            <a
              href={meetingDetails.joinUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {meetingDetails.joinUrl}
            </a>
          </p>
          <p>
            <em>
              (Mật khẩu, nếu có, sẽ được yêu cầu khi tham gia qua link trên)
            </em>
          </p>
          <button
            onClick={() => setMeetingDetails(null)}
            className="btn btn-secondary"
          >
            Tạo phòng họp khác
          </button>
          {/* TODO: Thêm nút "Bắt đầu cuộc họp" sẽ nhúng Zoom SDK */}
        </div>
      )}
      <button
        onClick={() => navigate("/tai-khoan/ho-so/phong-hop-zoom")}
        className="btn btn-link-back"
      >
        Quay lại Quản lý phòng họp
      </button>
    </div>
  );
};

export default CreateMeetingPage;
