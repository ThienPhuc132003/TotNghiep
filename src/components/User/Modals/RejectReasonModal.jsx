// src/components/User/Modals/RejectReasonModal.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import "../../../assets/css/RejectReasonModal.style.css"; // Tạo file CSS cho modal này

const RejectReasonModal = ({
  isOpen,
  onClose,
  onSubmitReason,
  isSubmitting = () => false,
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do từ chối.");
      return;
    }
    onSubmitReason(reason);
    // Không cần đóng modal ở đây, component cha sẽ đóng sau khi submit thành công
  };

  const handleClose = () => {
    setReason(""); // Reset reason khi đóng
    setError("");
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="rrm-modal-overlay">
      <div className="rrm-modal-content">
        <h3 className="rrm-modal-title">Lý Do Từ Chối Yêu Cầu</h3>
        <form onSubmit={handleSubmit}>
          <div className="rrm-form-group">
            <label htmlFor="rejectReason" className="rrm-label">
              Lý do (bắt buộc):
            </label>
            <textarea
              id="rejectReason"
              className={`rrm-textarea ${error ? "rrm-textarea--error" : ""}`}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              placeholder="Ví dụ: Lịch dạy của tôi đã kín vào thời điểm này."
              rows="4"
              disabled={isSubmitting}
            />
            {error && <p className="rrm-error-message">{error}</p>}
          </div>
          <div className="rrm-modal-actions">
            <button
              type="button"
              onClick={handleClose}
              className="rrm-button rrm-button--cancel"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rrm-button rrm-button--submit"
              disabled={isSubmitting || !reason.trim()}
            >
              {isSubmitting ? "Đang gửi..." : "Xác Nhận Từ Chối"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

RejectReasonModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmitReason: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export default RejectReasonModal;
