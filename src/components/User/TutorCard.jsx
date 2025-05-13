import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
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
  FaSpinner, // Sử dụng để hiển thị loading
  FaCalendarCheck, // Icon cho trạng thái Approved
  FaExclamationTriangle, // Icon cho trạng thái Rejected
} from "react-icons/fa";
import { PiMedalThin } from "react-icons/pi";
import { toast } from "react-toastify";
import Api from "../../network/Api"; // Điều chỉnh đường dẫn nếu cần
import { METHOD_TYPE } from "../../network/methodType"; // Đảm bảo đã thêm PATCH vào file này
import defaultAvatar from "../../assets/images/df-female.png"; // Điều chỉnh đường dẫn nếu cần

// --- Cấu hình hạng gia sư ---
const tutorRanks = {
  bronze: {
    name: "Đồng",
    color: "var(--rank-bronze, #cd7f32)",
    icon: <PiMedalThin />,
  },
  silver: {
    name: "Bạc",
    color: "var(--rank-silver, #c0c0c0)",
    icon: <PiMedalThin />,
  },
  gold: {
    name: "Vàng",
    color: "var(--rank-gold, #ffd700)",
    icon: <PiMedalThin />,
  },
  platinum: {
    name: "Bạch Kim",
    color: "var(--rank-platinum, #67e8f9)",
    icon: <PiMedalThin />,
  },
  diamond: {
    name: "Kim Cương",
    color: "var(--rank-diamond, #0e7490)",
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

// ========== COMPONENT TutorCard ==========
const TutorCard = ({
  tutor,
  onOpenBookingModal,
  onCancelSuccess,
  isFavoriteOverride,
  onRemoveFavorite,
  isRemoving,
  onFavoriteStatusChange,
  isLoggedIn,
}) => {
  // State nội bộ quản lý trạng thái yêu thích
  const [isFavorite, setIsFavorite] = useState(
    typeof isFavoriteOverride === "boolean"
      ? isFavoriteOverride
      : tutor.isInitiallyFavorite || false
  );
  // State loading riêng cho từng action để tránh xung đột disable nút
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const navigate = useNavigate();

  // Xác định loading chung cho nút Tim (ưu tiên loading từ trang yêu thích)
  const isLoadingFavoriteAction = isRemoving || isTogglingFavorite;

  // Xác định các hành động có thể thực hiện
  const canHire = isLoggedIn && !tutor.bookingRequest && onOpenBookingModal;
  const canCancel =
    isLoggedIn &&
    tutor.bookingRequest &&
    tutor.bookingRequest.status === "REQUEST" &&
    onCancelSuccess;
  const isApproved = isLoggedIn && tutor.bookingRequest?.status === "APPROVED";
  const isRejected = isLoggedIn && tutor.bookingRequest?.status === "REJECTED";

  // --- Xử lý Click Nút Yêu Thích ---
  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      toast.info("Vui lòng đăng nhập để thêm gia sư vào danh sách yêu thích!");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }
    // Không cho click nếu đang thực hiện action khác
    if (isLoadingFavoriteAction || isCancelling) return;

    if (onRemoveFavorite) {
      // Ưu tiên cho trang Favorite
      onRemoveFavorite(); // Hàm này sẽ tự quản lý state loading riêng (isRemoving)
      return;
    }

    // Logic toggle cho trang tìm kiếm/list
    setIsTogglingFavorite(true);
    const newFavoriteStatus = !isFavorite;

    try {
      const method = newFavoriteStatus ? METHOD_TYPE.POST : METHOD_TYPE.DELETE;
      const endpoint = newFavoriteStatus
        ? `my-tutor/add`
        : `my-tutor/remove/${tutor.id}`;

      await Api({
        endpoint: endpoint,
        method: method,
        ...(method === METHOD_TYPE.POST && { body: { tutorId: tutor.id } }),
        requireToken: true,
      });

      setIsFavorite(newFavoriteStatus); // Cập nhật state nội bộ
      if (onFavoriteStatusChange) {
        onFavoriteStatusChange(tutor.id, newFavoriteStatus); // Thông báo cho List
      }
      toast.success(
        `Đã ${newFavoriteStatus ? "thêm" : "bỏ"} yêu thích gia sư ${tutor.name}`
      );
    } catch (error) {
      console.error("Lỗi cập nhật yêu thích:", error);
      toast.error(
        `Lỗi: Không thể ${newFavoriteStatus ? "thêm" : "bỏ"} yêu thích gia sư.`
      );
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  // --- Xử lý Click Nút Hủy Yêu Cầu ---
  const handleCancelBooking = async (e) => {
    e.stopPropagation();
    const bookingIdToCancel = tutor.bookingRequestId;

    // Không cho click nếu đang thực hiện action khác
    if (
      !bookingIdToCancel ||
      !onCancelSuccess ||
      isLoadingFavoriteAction ||
      isCancelling
    ) {
      if (!bookingIdToCancel || !onCancelSuccess)
        toast.error("Không thể hủy yêu cầu!");
      return;
    }

    const confirmCancel = window.confirm(
      `Bạn có chắc chắn muốn hủy yêu cầu thuê gia sư ${tutor.name}?`
    );
    if (!confirmCancel) return;

    setIsCancelling(true); // Bắt đầu loading Hủy

    try {
      await Api({
        endpoint: `booking-request/cancel-booking/${bookingIdToCancel}`,
        method: METHOD_TYPE.PATCH, // Sử dụng PATCH
        requireToken: true,
      });
      toast.success(`Đã hủy yêu cầu thuê gia sư ${tutor.name}`);
      if (onCancelSuccess) {
        onCancelSuccess(tutor.id); // Gọi callback để TutorList fetch lại
      }
    } catch (error) {
      console.error("Lỗi khi hủy booking:", error);
      const errorMsg =
        error.response?.data?.message || `Không thể hủy yêu cầu thuê gia sư.`;
      toast.error(`Lỗi: ${errorMsg}`);
    } finally {
      setIsCancelling(false); // Kết thúc loading Hủy
    }
  };

  // --- Xử lý Click Xem Hồ Sơ ---
  const handleViewProfile = (e) => {
    e.stopPropagation();
    // Không cho navigate nếu đang loading
    if (isCancelling || isLoadingFavoriteAction) return;
    navigate(`/gia-su/${tutor.id}`);
  };

  // --- Xử lý Click Thuê ---
  const handleHireClick = (e) => {
    e.stopPropagation();
    // Không cho mở modal nếu đang loading
    if (onOpenBookingModal && !isCancelling && !isLoadingFavoriteAction) {
      onOpenBookingModal(tutor);
    }
  };

  // --- Helpers render ---
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
    <div
      className={`tutor-card redesigned ${isRemoving ? "card-removing" : ""}`}
    >
      <div className="tutor-card-left">
        <div className="avatar-container">
          <img
            src={avatar}
            alt={`Ảnh đại diện ${tutor.name}`}
            className="tutor-avatar"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultAvatar;
            }}
          />
          {tutor.isVerified && (
            <div
              className="verified-badge-avatar"
              title="Gia sư đã được xác thực"
            >
              <FaCheckCircle />
            </div>
          )}
        </div>
      </div>
      <div className="tutor-card-right">
        <div className="tutor-card-main-info">
          <div className="tutor-card-header-info">
            <h4
              className="tutor-name"
              onClick={handleViewProfile}
              style={{ cursor: "pointer" }}
              title="Xem hồ sơ chi tiết"
            >
              {tutor.name}
              {renderRankBadge(rankInfo)}
            </h4>
            <div className="header-right-actions">
              {tutor.rating > 0 && (
                <div className="tutor-rating header-rating">
                  {renderStars(tutor.rating)}
                  <span className="rating-value">
                    {tutor.rating.toFixed(1)}
                  </span>
                  <span className="review-count">({tutor.reviewCount})</span>
                </div>
              )}
              {/* Nút Yêu thích */}
              <button
                className={`favorite-btn ${
                  isFavorite ? "favorite-active" : ""
                } ${isLoadingFavoriteAction ? "loading" : ""}`}
                onClick={handleFavoriteClick}
                aria-label={isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
                title={isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
                disabled={isLoadingFavoriteAction || isCancelling} // Disable nếu đang hủy
              >
                {/* Giữ nguyên <FaSpinner spin /> dù có cảnh báo */}
                {isLoadingFavoriteAction ? (
                  <FaSpinner spin />
                ) : isFavorite ? (
                  <FaHeart />
                ) : (
                  <FaRegHeart />
                )}
              </button>
            </div>
          </div>
          {/* Các dòng thông tin */}
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
          <p
            className="tutor-description"
            onClick={handleViewProfile}
            style={{ cursor: "pointer" }}
            title="Xem hồ sơ chi tiết"
          >
            {tutor.description}
          </p>
        </div>
        {/* Footer Card */}
        <div className="tutor-card-footer-info">
          <div className="tutor-price">
            <FaCoins className="info-icon price-icon" />
            <span>
              {tutor.hourlyRate > 0
                ? `${tutor.hourlyRate.toLocaleString("vi-VN")} Coin/giờ`
                : "Thỏa thuận"}
            </span>
          </div>
          {/* Các nút hành động ở footer */}
          <div className="footer-buttons">
            {/* Nút Thuê */}
            {canHire && (
              <button
                className="action-btn hire-btn"
                onClick={handleHireClick}
                title="Thuê gia sư này"
                disabled={isCancelling || isLoadingFavoriteAction}
              >
                <span>Thuê</span>
              </button>
            )}
            {/* Nút Hủy Yêu Cầu */}
            {canCancel && (
              <button
                className="action-btn cancel-btn"
                onClick={handleCancelBooking}
                title="Hủy yêu cầu thuê"
                disabled={isCancelling || isLoadingFavoriteAction}
              >
                {/* Giữ nguyên <FaSpinner spin /> dù có cảnh báo */}
                {isCancelling ? (
                  <FaSpinner spin className="spinner-inline" />
                ) : (
                  <span>Hủy Yêu Cầu</span>
                )}
              </button>
            )}
            {/* Trạng thái Đã Nhận Lịch */}
            {isApproved && (
              <span className="booking-status-indicator card-approved">
                <FaCalendarCheck /> Đã nhận lịch
              </span>
            )}
            {/* Trạng thái Bị Từ Chối */}
            {isRejected && (
              <span className="booking-status-indicator card-rejected">
                <FaExclamationTriangle /> Bị từ chối
              </span>
            )}
            {/* Nút Xem Hồ Sơ */}
            <button
              className="action-btn view-profile-btn"
              onClick={handleViewProfile}
              // Không nhất thiết phải disable nút này khi action khác chạy
              // disabled={isCancelling || isLoadingFavoriteAction}
            >
              Xem Hồ Sơ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// PropTypes giữ nguyên như phiên bản trước
TutorCard.propTypes = {
  tutor: PropTypes.shape({
    id: PropTypes.string.isRequired,
    myTutorRelationshipId: PropTypes.string,
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
      // Object chứa thông tin booking
      bookingRequestId: PropTypes.string,
      status: PropTypes.string, // Ví dụ: "REQUEST", "APPROVED", "REJECTED"
    }),
    dateTimeLearn: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.object])
    ),
    bookingRequestId: PropTypes.string, // Key riêng để dễ truy cập ID
  }).isRequired,
  onOpenBookingModal: PropTypes.func, // Callback mở modal
  onCancelSuccess: PropTypes.func, // Callback khi hủy thành công
  isFavoriteOverride: PropTypes.bool, // Ép trạng thái tim từ cha (trang Yêu thích)
  onRemoveFavorite: PropTypes.func, // Callback xóa từ cha (trang Yêu thích)
  isRemoving: PropTypes.bool, // State loading xóa từ cha
  onFavoriteStatusChange: PropTypes.func, // Callback báo thay đổi tim cho cha (TutorList)
  isLoggedIn: PropTypes.bool.isRequired, // Trạng thái đăng nhập
};

export default TutorCard;
