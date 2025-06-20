import { useState, memo } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import "../../assets/css/ClassroomEvaluationModal.style.css";
import ReactStars from "react-rating-stars-component";

const ClassroomEvaluationModal = ({
  isOpen,
  onClose,
  classroomId,
  classroomName,
  tutorName,
  onEvaluationSubmitted,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error("Vui lòng nhập nhận xét về lớp học.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await Api({
        endpoint: "classroom/evaluate",
        method: METHOD_TYPE.POST,
        data: {
          classroomId,
          rating,
          comment: comment.trim(),
        },
        requireToken: true,
      });

      if (response.success) {
        toast.success("Đánh giá lớp học thành công!");
        onEvaluationSubmitted();
        onClose();
        // Reset form
        setRating(5);
        setComment("");
      } else {
        throw new Error(response.message || "Không thể gửi đánh giá");
      }
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Đã xảy ra lỗi khi gửi đánh giá"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(5);
      setComment("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="evaluation-modal-overlay" onClick={handleClose}>
      <div
        className="evaluation-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="evaluation-modal-header">
          <h3>Đánh giá lớp học</h3>
          <button
            className="evaluation-modal-close"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <div className="evaluation-modal-body">
          <div className="evaluation-class-info">
            <p>
              <strong>Lớp học:</strong> {classroomName}
            </p>
            <p>
              <strong>Gia sư:</strong> {tutorName}
            </p>
          </div>{" "}
          <form onSubmit={handleSubmit}>
            {" "}
            <div className="evaluation-rating-section">
              <label>Đánh giá chung:</label>
              <div className="rating-stars">
                <ReactStars
                  count={5}
                  onChange={setRating}
                  size={32}
                  value={rating}
                  isHalf={true}
                  activeColor="#ffc107"
                  color="#e0e0e0"
                  edit={!isSubmitting}
                  classNames="rating-stars-component"
                  emptyIcon={<span>☆</span>}
                  halfIcon={<span>☆</span>}
                  filledIcon={<span>★</span>}
                />
                <span className="rating-value">{rating.toFixed(1)} / 5</span>
              </div>
            </div>
            <div className="evaluation-comment-section">
              <label htmlFor="evaluationComment">
                Nhận xét chi tiết:
                <span className="required">*</span>
              </label>
              <textarea
                id="evaluationComment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Hãy chia sẻ trải nghiệm của bạn về lớp học này..."
                required
                disabled={isSubmitting}
                rows={4}
              />
            </div>
            <div className="evaluation-modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={isSubmitting || !comment.trim()}
              >
                {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

ClassroomEvaluationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  classroomId: PropTypes.string.isRequired,
  classroomName: PropTypes.string.isRequired,
  tutorName: PropTypes.string.isRequired,
  onEvaluationSubmitted: PropTypes.func.isRequired,
};

export default memo(ClassroomEvaluationModal);
