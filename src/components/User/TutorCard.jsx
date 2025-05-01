import { useState } from "react"; // Bỏ useEffect nếu không dùng nữa
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom"; // <-- Import useNavigate
import {
  FaStar,
  FaGraduationCap,
  FaBook,
  FaCheckCircle,
  FaCoins,
  FaHeart,
  FaRegHeart,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaLayerGroup,
  FaClock,
} from "react-icons/fa";
import { PiMedalThin } from "react-icons/pi";
import { toast } from "react-toastify";
import Api from "../../network/Api"; // *** Điều chỉnh đường dẫn ***
import { METHOD_TYPE } from "../../network/methodType"; // *** Điều chỉnh đường dẫn ***
import defaultAvatar from "../../assets/images/df-female.png"; // *** Điều chỉnh đường dẫn ***

// --- Cấu hình hạng gia sư ---
const tutorRanks = {
  bronze: { name: "Đồng", color: "var(--rank-bronze)", icon: <PiMedalThin /> },
  silver: { name: "Bạc", color: "var(--rank-silver)", icon: <PiMedalThin /> },
  gold: { name: "Vàng", color: "var(--rank-gold)", icon: <PiMedalThin /> },
  platinum: {
    name: "Bạch Kim",
    color: "var(--rank-platinum)",
    icon: <PiMedalThin />,
  },
  diamond: {
    name: "Kim Cương",
    color: "var(--rank-diamond)",
    icon: <PiMedalThin />,
  },
};

// --- Helper định dạng thời gian ---
const formatTeachingTime = (hours) => {
  if (hours === null || isNaN(hours) || hours <= 0) return null;
  const h = Math.floor(hours);
  const minutes = Math.round((hours - h) * 60);
  let result = `${h} giờ`;
  if (minutes > 0) {
    result += ` ${minutes} phút`;
  }
  return result;
};

const TutorCard = ({ tutor, onOpenBookingModal, onCancelSuccess }) => {
  const [isFavorite, setIsFavorite] = useState(
    tutor.isInitiallyFavorite || false
  );
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const navigate = useNavigate(); // <-- Khởi tạo hook navigate

  // Logic nút Thuê/Hủy dựa trực tiếp vào prop
  const canHire = tutor.bookingRequest === null;
  const canCancel =
    tutor.bookingRequest && tutor.bookingRequest.status === "REQUEST";

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    if (isTogglingFavorite) return;
    setIsTogglingFavorite(true);
    const currentFavoriteStatus = isFavorite;
    try {
      if (currentFavoriteStatus) {
        await Api({
          endpoint: `/my-tutor/remove/${tutor.id}`,
          method: METHOD_TYPE.DELETE,
        });
        setIsFavorite(false);
        toast.success(`Đã xóa gia sư ${tutor.name} khỏi danh sách yêu thích`);
      } else {
        await Api({
          endpoint: `/my-tutor/add`,
          method: METHOD_TYPE.POST,
          body: { tutorId: tutor.id },
        });
        setIsFavorite(true);
        toast.success(`Đã thêm gia sư ${tutor.name} vào danh sách yêu thích`);
      }
    } catch (error) {
      console.error("Lỗi cập nhật yêu thích:", error);
      toast.error(
        `Lỗi: Không thể ${
          currentFavoriteStatus ? "bỏ" : "thêm"
        } yêu thích gia sư ${tutor.name}`
      );
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleCancelBooking = async (e) => {
    e.stopPropagation();
    const bookingId = tutor.bookingRequest?.bookingRequestId;
    if (!bookingId) {
      toast.error("Không tìm thấy mã yêu cầu để hủy!");
      console.error("Không tìm thấy bookingRequestId để hủy!");
      return;
    }
    console.log(`TODO: API DELETE /booking-request/cancel/${bookingId}`);
    try {
      // await Api({ endpoint: `/booking-request/cancel/${bookingId}`, method: METHOD_TYPE.DELETE });
      toast.info(`Đã hủy yêu cầu thuê gia sư ${tutor.name}`);
      if (onCancelSuccess) {
        onCancelSuccess(tutor.id);
      }
    } catch (error) {
      console.error("Lỗi khi hủy booking:", error);
      toast.error(`Lỗi: Không thể hủy yêu cầu thuê gia sư ${tutor.name}`);
    }
  };

  // --- CẬP NHẬT handleViewProfile để sử dụng navigate ---
  const handleViewProfile = (e) => {
    e.stopPropagation();
    navigate(`/gia-su/${tutor.id}`); // Điều hướng đến trang chi tiết
  };
  // --- ---

  const handleHireClick = (e) => {
    e.stopPropagation();
    onOpenBookingModal(tutor);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const emptyStarsCount = 5 - fullStars;
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="star-icon filled" />);
    }
    for (let i = 0; i < emptyStarsCount; i++) {
      stars.push(
        <FaStar key={`empty-${i + fullStars}`} className="star-icon empty" />
      );
    }
    return stars;
  };
  const renderRankBadge = (rankData) => {
    if (!rankData) return null;
    return (
      <span
        className="tutor-rank-badge"
        style={{ color: rankData.color }}
        title={`Hạng: ${rankData.name}`}
      >
        {rankData.icon || <PiMedalThin />}
      </span>
    );
  };
  const renderTeachingMethod = (method) => {
    switch (method) {
      case "ONLINE":
        return "Trực tuyến";
      case "OFFLINE":
        return "Trực tiếp";
      case "BOTH":
        return "Cả hai hình thức";
      default:
        return "Chưa xác định";
    }
  };

  const avatar = tutor.imageUrl || defaultAvatar;
  const rankInfo = tutorRanks[tutor.rank] || null;
  const formattedTeachingTime = formatTeachingTime(tutor.teachingTime);

  return (
    <div className="tutor-card redesigned">
      <div className="tutor-card-left">
        <div className="avatar-container">
          {" "}
          <img
            src={avatar}
            alt={`Ảnh đại diện ${tutor.name}`}
            className="tutor-avatar"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultAvatar;
            }}
          />{" "}
          {tutor.isVerified && (
            <div
              className="verified-badge-avatar"
              title="Gia sư đã được xác thực"
            >
              <FaCheckCircle />
            </div>
          )}{" "}
        </div>
      </div>
      <div className="tutor-card-right">
        <div className="tutor-card-main-info">
          <div className="tutor-card-header-info">
            <h4 className="tutor-name">
              {tutor.name}
              {renderRankBadge(rankInfo)}
            </h4>
            <div className="header-right-actions">
              <div className="tutor-rating header-rating">
                {" "}
                {renderStars(tutor.rating)}{" "}
                {tutor.rating > 0 && (
                  <span className="rating-value">
                    {tutor.rating.toFixed(1)}
                  </span>
                )}{" "}
                <span className="review-count">({tutor.reviewCount})</span>{" "}
              </div>
              <button
                className={`favorite-btn ${
                  isFavorite ? "favorite-active" : ""
                }`}
                onClick={handleToggleFavorite}
                aria-label={isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
                title={isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
                disabled={isTogglingFavorite}
              >
                {" "}
                {isFavorite ? <FaHeart /> : <FaRegHeart />}{" "}
              </button>
            </div>
          </div>
          <div className="tutor-info-row">
            <FaGraduationCap className="info-icon" />
            <span>{tutor.university || "Chưa cập nhật trường"}</span>
          </div>
          {tutor.level && (
            <div className="tutor-info-row">
              <FaLayerGroup className="info-icon" />
              <span>Trình độ: {tutor.level}</span>
            </div>
          )}
          <div className="tutor-info-row">
            <FaBook className="info-icon" />
            <span className="tutor-subjects" title={tutor.subjects?.join(", ")}>
              {tutor.subjects?.join(", ") || "Chưa cập nhật môn dạy"}
            </span>
          </div>
          {tutor.GPA && (
            <div className="tutor-info-row">
              <FaUserGraduate className="info-icon" />
              <span>GPA: {tutor.GPA}</span>
            </div>
          )}
          {tutor.teachingMethod && (
            <div className="tutor-info-row">
              <FaChalkboardTeacher className="info-icon" />
              <span>
                Phương thức: {renderTeachingMethod(tutor.teachingMethod)}
              </span>
            </div>
          )}
          {formattedTeachingTime && (
            <div className="tutor-info-row">
              <FaClock className="info-icon" />
              <span>Thời lượng tối đa: {formattedTeachingTime} / buổi</span>
            </div>
          )}
          <p className="tutor-description">{tutor.description}</p>
        </div>
        <div className="tutor-card-footer-info">
          <div className="tutor-price">
            <FaCoins className="info-icon price-icon" />
            <span>
              {tutor.hourlyRate > 0
                ? `${tutor.hourlyRate.toLocaleString("vi-VN")} Coin/giờ`
                : "Thỏa thuận"}
            </span>
          </div>
          <div className="footer-buttons">
            {canHire && (
              <button
                className="action-btn hire-btn"
                onClick={handleHireClick}
                title="Thuê gia sư này"
              >
                <span>Thuê</span>
              </button>
            )}
            {canCancel && (
              <button
                className="action-btn cancel-btn"
                onClick={handleCancelBooking}
                title="Hủy yêu cầu thuê"
              >
                <span>Hủy Yêu Cầu</span>
              </button>
            )}
            {tutor.bookingRequest && !canCancel && (
              <span className="booking-status-indicator">
                Trạng thái: {tutor.bookingRequest.status}
              </span>
            )}
            <button
              className="action-btn view-profile-btn"
              onClick={handleViewProfile}
            >
              Xem Hồ Sơ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

TutorCard.propTypes = {
  tutor: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    gender: PropTypes.string,
    university: PropTypes.string,
    major: PropTypes.string,
    level: PropTypes.string,
    subjects: PropTypes.arrayOf(PropTypes.string),
    GPA: PropTypes.string,
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
    description: PropTypes.string,
    teachingMethod: PropTypes.string,
    hourlyRate: PropTypes.number,
    teachingTime: PropTypes.number,
    isVerified: PropTypes.bool,
    rank: PropTypes.oneOf(["bronze", "silver", "gold", "platinum", "diamond"]),
    isInitiallyFavorite: PropTypes.bool,
    teachingPlace: PropTypes.string,
    bookingRequest: PropTypes.shape({
      bookingRequestId: PropTypes.string,
      status: PropTypes.string,
    }),
  }).isRequired,
  onOpenBookingModal: PropTypes.func.isRequired,
  onCancelSuccess: PropTypes.func,
};

export default TutorCard;
