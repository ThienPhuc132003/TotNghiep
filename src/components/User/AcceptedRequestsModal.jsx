import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { toast } from "react-toastify";
import {
  FaSpinner,
  FaCheckCircle,
  FaCalendarAlt,
  FaClock,
  FaCoins,
  FaExclamationTriangle,
} from "react-icons/fa";
import "../../assets/css/AcceptedRequestsModal.style.css"; // Nhớ tạo file CSS này

const formatDate = (dateString, includeTime = true) => {
  if (!dateString) return "N/A";
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(includeTime && { hour: "2-digit", minute: "2-digit" }),
  };
  try {
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  } catch (error) {
    return "Ngày không hợp lệ";
  }
};

const formatDateTimeLearnForModal = (dateTimeArray) => {
  if (!Array.isArray(dateTimeArray) || dateTimeArray.length === 0)
    return "Chưa có lịch chi tiết";
  return dateTimeArray
    .map((itemStr) => {
      try {
        const item = JSON.parse(itemStr);
        const daysOfWeek = {
          Monday: "T2",
          Tuesday: "T3",
          Wednesday: "T4",
          Thursday: "T5",
          Friday: "T6",
          Saturday: "T7",
          Sunday: "CN",
        };
        return `${daysOfWeek[item.day] || item.day}: ${item.times.join(", ")}`;
      } catch (e) {
        return "Lỗi lịch";
      }
    })
    .join("; ");
};

const AcceptedRequestsModal = ({
  isOpen,
  onClose,
  tutorId,
  tutorName,
  onActionSuccess,
}) => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchAcceptedRequests = useCallback(async () => {
    if (!isOpen || !tutorId) {
      setRequests([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await Api({
        endpoint: `booking-request/get-my-booking-request-accept/${tutorId}`,
        method: METHOD_TYPE.GET,
        requireToken: true,
      });
      if (
        response.success &&
        response.data &&
        Array.isArray(response.data.items)
      ) {
        setRequests(
          response.data.items.filter(
            (req) => req.status && req.status.toUpperCase() === "ACCEPT"
          )
        );
      } else {
        setRequests([]);
        console.warn(
          "AcceptedRequestsModal: API không trả về items hoặc response không thành công",
          response
        );
      }
    } catch (err) {
      console.error("Lỗi tải danh sách yêu cầu đã duyệt:", err);
      setError("Lỗi tải danh sách yêu cầu. Vui lòng thử lại.");
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, tutorId]);

  useEffect(() => {
    fetchAcceptedRequests();
  }, [fetchAcceptedRequests]);
  const handleHireTutor = async (bookingRequestId) => {
    if (processingId) return;
    if (
      !window.confirm(
        `Bạn có chắc muốn xác nhận thuê gia sư ${
          tutorName || ""
        } cho yêu cầu này?`
      )
    )
      return;
    setProcessingId(bookingRequestId);
    try {
      await Api({
        endpoint: `booking-request/hire-tutor/${bookingRequestId}`,
        method: METHOD_TYPE.PUT,
        requireToken: true,
      });

      toast.success("Đã xác nhận thuê gia sư thành công!");

      // Pass the updated status back for local state update
      const updatedStatus = {
        status: "HIRED", // or get from response if available
        bookingId: bookingRequestId,
      };

      onActionSuccess(tutorId, updatedStatus); // Pass tutorId and new status
      onClose(); // Đóng modal
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Không thể xác nhận thuê. Vui lòng thử lại."
      );
    } finally {
      setProcessingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="arm-modal-overlay" onClick={onClose}>
      <div className="arm-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="arm-modal-header">
          <h3>Yêu cầu đã được {tutorName || "gia sư"} chấp nhận</h3>
          <button onClick={onClose} className="arm-modal-close-btn">
            ×
          </button>
        </div>
        <div className="arm-modal-body">
          {isLoading && (
            <div className="arm-loading-state">
              <FaSpinner spin /> Đang tải...
            </div>
          )}
          {error && (
            <div className="arm-error-state">
              <FaExclamationTriangle /> {error}
            </div>
          )}
          {!isLoading && !error && requests.length === 0 && (
            <p className="arm-no-requests">
              Không có yêu cầu nào được gia sư này chấp nhận để bạn xác nhận.
            </p>
          )}
          {!isLoading && !error && requests.length > 0 && (
            <ul className="arm-requests-list">
              {requests.map((req) => (
                <li key={req.bookingRequestId} className="arm-request-item">
                  <div className="arm-request-info">
                    <p>
                      <FaCalendarAlt /> <strong>Gửi lúc:</strong>{" "}
                      {formatDate(req.createdAt)}
                    </p>
                    <p>
                      <FaCalendarAlt /> <strong>Bắt đầu dự kiến:</strong>{" "}
                      {formatDate(req.startDay, false)}
                    </p>
                    <p>
                      <FaClock /> <strong>Lịch học chi tiết:</strong>{" "}
                      {formatDateTimeLearnForModal(req.dateTimeLearn)}
                    </p>
                    <p>
                      <strong>Số buổi/tuần:</strong> {req.lessonsPerWeek},{" "}
                      <strong>Tổng số buổi:</strong> {req.totalLessons},{" "}
                      <strong>Thời lượng/buổi:</strong> {req.hoursPerLesson} giờ
                    </p>
                    <p>
                      <FaCoins /> <strong>Tổng chi phí dự kiến:</strong>{" "}
                      {req.totalcoins
                        ? req.totalcoins.toLocaleString("vi-VN")
                        : "N/A"}{" "}
                      Xu
                    </p>
                  </div>
                  <div className="arm-request-actions">
                    <button
                      onClick={() => handleHireTutor(req.bookingRequestId)}
                      disabled={!!processingId}
                      className="arm-action-btn arm-confirm-btn"
                    >
                      {processingId === req.bookingRequestId ? (
                        <FaSpinner spin />
                      ) : (
                        <FaCheckCircle />
                      )}{" "}
                      Xác Nhận Thuê
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

AcceptedRequestsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tutorId: PropTypes.string, // tutorId của gia sư để fetch đúng yêu cầu
  tutorName: PropTypes.string,
  onActionSuccess: PropTypes.func.isRequired, // Callback with (tutorId, updatedStatus) parameters
};

export default AcceptedRequestsModal;
