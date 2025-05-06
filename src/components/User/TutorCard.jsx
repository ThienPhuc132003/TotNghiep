import { useState } from "react"; // Bỏ useEffect nếu không dùng nữa
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
  FaSpinner, // Thêm Spinner
} from "react-icons/fa";
import { PiMedalThin } from "react-icons/pi";
import { toast } from "react-toastify";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import defaultAvatar from "../../assets/images/df-female.png"; // Đường dẫn ảnh mặc định

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

const TutorCard = ({
  tutor,
  onOpenBookingModal,
  onCancelSuccess,
  // --- Props mới/điều chỉnh cho trang yêu thích ---
  isFavoriteOverride, // Prop để ép trạng thái yêu thích (luôn true từ FavoriteTutorsPage)
  onRemoveFavorite, // Hàm callback riêng để xóa từ FavoriteTutorsPage
  isRemoving, // Trạng thái đang xóa từ FavoriteTutorsPage
}) => {
  // Sử dụng isFavoriteOverride nếu có, nếu không thì dùng state nội bộ (cho trang tìm kiếm)
  const isCurrentlyFavorite =
    typeof isFavoriteOverride === "boolean"
      ? isFavoriteOverride
      : tutor.isInitiallyFavorite || false; // isInitiallyFavorite dùng ở trang tìm kiếm

  const [isTogglingFavoriteInternal, setIsTogglingFavoriteInternal] =
    useState(false); // State nội bộ cho trang tìm kiếm
  const navigate = useNavigate();

  // Xác định trạng thái loading cuối cùng cho nút tim
  // Ưu tiên isRemoving từ trang yêu thích, nếu không thì dùng state nội bộ
  const isLoadingFavoriteAction = isRemoving || isTogglingFavoriteInternal;

  // Logic nút Thuê/Hủy
  const canHire = !tutor.bookingRequest && onOpenBookingModal; // Phải có cả hàm mở modal
  const canCancel =
    tutor.bookingRequest &&
    tutor.bookingRequest.status === "REQUEST" &&
    onCancelSuccess; // Phải có cả hàm callback hủy

  // Hàm xử lý chung khi nhấn nút yêu thích
  const handleFavoriteClick = async (e) => {
    e.stopPropagation(); // Ngăn sự kiện lan tỏa lên thẻ cha
    if (isLoadingFavoriteAction) return; // Không làm gì nếu đang xử lý

    // **Ưu tiên gọi hàm xóa từ trang yêu thích (nếu có)**
    if (onRemoveFavorite) {
      onRemoveFavorite(); // Hàm này sẽ xử lý API và cập nhật state ở FavoriteTutorsPage
      return; // Dừng ở đây
    }

    // **Nếu không có onRemoveFavorite => Thực hiện logic toggle nội bộ (cho trang tìm kiếm)**
    setIsTogglingFavoriteInternal(true);
    const currentFavoriteStatus = isCurrentlyFavorite; // Dùng isCurrentlyFavorite thay vì state nội bộ
    try {
      // API endpoints này dành cho trang tìm kiếm tự quản lý
      if (currentFavoriteStatus) {
        // API để xóa yêu thích (dùng tutor.id - là userId)
        await Api({
          endpoint: `/my-tutor/remove/${tutor.id}`,
          method: METHOD_TYPE.DELETE,
        });
        toast.success(`Đã bỏ yêu thích gia sư ${tutor.name}`);
        // Ở trang tìm kiếm, có thể cần gọi callback để báo List biết cập nhật icon
        // Ví dụ: if (onFavoriteStatusChange) onFavoriteStatusChange(tutor.id, false);
      } else {
        // API để thêm yêu thích (dùng tutor.id - là userId)
        await Api({
          endpoint: `/my-tutor/add`,
          method: METHOD_TYPE.POST,
          body: { tutorId: tutor.id }, // Body cần tutorId
        });
        toast.success(`Đã thêm gia sư ${tutor.name} vào yêu thích`);
        // Ví dụ: if (onFavoriteStatusChange) onFavoriteStatusChange(tutor.id, true);
      }
    } catch (error) {
      console.error("Lỗi cập nhật yêu thích:", error);
      toast.error(
        `Lỗi: Không thể ${
          currentFavoriteStatus ? "bỏ" : "thêm"
        } yêu thích gia sư ${tutor.name}`
      );
    } finally {
      setIsTogglingFavoriteInternal(false);
    }
  };

  const handleCancelBooking = async (e) => {
    e.stopPropagation();
    const bookingId = tutor.bookingRequest?.bookingRequestId;
    if (!bookingId || !onCancelSuccess) {
      // Kiểm tra cả callback
      toast.error("Không thể hủy yêu cầu!");
      return;
    }

    // Có thể thêm state loading cho nút Hủy
    console.log(`Đang hủy yêu cầu: ${bookingId}`);
    try {
      // *** BỎ COMMENT KHI CÓ API ***
      // const response = await Api({ endpoint: `/booking-request/cancel/${bookingId}`, method: METHOD_TYPE.DELETE });
      // if (response.success) {
      //    toast.success(`Đã hủy yêu cầu thuê gia sư ${tutor.name}`);
      //    onCancelSuccess(tutor.id); // Gọi callback để List load lại
      // } else {
      //     throw new Error(response.message || 'Hủy yêu cầu thất bại.');
      // }
      // --- Giả lập thành công để test UI ---
      await new Promise((resolve) => setTimeout(resolve, 500)); // Giả lập delay API
      toast.success(`Đã hủy yêu cầu thuê gia sư ${tutor.name}`);
      onCancelSuccess(tutor.id);
      // ------------------------------------
    } catch (error) {
      console.error("Lỗi khi hủy booking:", error);
      toast.error(
        `Lỗi: ${
          error.message || `Không thể hủy yêu cầu thuê gia sư ${tutor.name}`
        }`
      );
      // Tắt loading/enable nút Hủy
    }
  };

  const handleViewProfile = (e) => {
    e.stopPropagation();
    navigate(`/gia-su/${tutor.id}`);
  };

  const handleHireClick = (e) => {
    e.stopPropagation();
    if (onOpenBookingModal) {
      onOpenBookingModal(tutor);
    }
  };

  // --- Hàm render sao ---
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const emptyStarsCount = 5 - fullStars;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="star-icon filled" />);
    }
    // Không hiển thị sao nửa vời
    for (let i = 0; i < emptyStarsCount; i++) {
      stars.push(
        <FaStar key={`empty-${i + fullStars}`} className="star-icon empty" />
      );
    }
    return stars;
  };

  // --- Hàm render rank badge ---
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

  // --- Hàm render phương thức dạy ---
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
    // Thêm class 'card-removing' nếu đang bị xóa từ trang yêu thích
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
            <h4 className="tutor-name">
              {tutor.name}
              {renderRankBadge(rankInfo)}
            </h4>
            <div className="header-right-actions">
              {/* Chỉ hiển thị rating nếu có > 0 */}
              {tutor.rating > 0 && (
                <div className="tutor-rating header-rating">
                  {renderStars(tutor.rating)}
                  <span className="rating-value">
                    {tutor.rating.toFixed(1)}
                  </span>
                  <span className="review-count">({tutor.reviewCount})</span>
                </div>
              )}
              {/* Nút yêu thích */}
              <button
                className={`favorite-btn ${
                  isCurrentlyFavorite ? "favorite-active" : ""
                } ${isLoadingFavoriteAction ? "loading" : ""}`}
                onClick={handleFavoriteClick}
                aria-label={
                  isCurrentlyFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"
                }
                title={isCurrentlyFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
                disabled={isLoadingFavoriteAction}
              >
                {isLoadingFavoriteAction ? (
                  <FaSpinner spin />
                ) : isCurrentlyFavorite ? (
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
          <p className="tutor-description">{tutor.description}</p>
        </div>
        <div className="tutor-card-footer-info">
          {/* Giá tiền */}
          <div className="tutor-price">
            <FaCoins className="info-icon price-icon" />
            <span>
              {tutor.hourlyRate > 0
                ? `${tutor.hourlyRate.toLocaleString("vi-VN")} Coin/giờ`
                : "Thỏa thuận"}
            </span>
          </div>
          <div className="footer-buttons">
            {/* Chỉ hiển thị nút Thuê/Hủy nếu có callback tương ứng và điều kiện phù hợp */}
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
            {/* Hiển thị trạng thái nếu có booking request nhưng không thể hủy */}
            {tutor.bookingRequest && !canCancel && !canHire && (
              <span className="booking-status-indicator">
                {/* Có thể tùy chỉnh hiển thị trạng thái */}
                Đã yêu cầu
              </span>
            )}
            {/* Nút Xem Hồ Sơ luôn hiển thị */}
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
    myTutorRelationshipId: PropTypes.string, // Thêm prop này nếu map từ FavoriteTutorsPage
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
    isInitiallyFavorite: PropTypes.bool, // Dùng cho state nội bộ ở trang tìm kiếm
    teachingPlace: PropTypes.string,
    bookingRequest: PropTypes.shape({
      bookingRequestId: PropTypes.string,
      status: PropTypes.string,
    }),
  }).isRequired,
  onOpenBookingModal: PropTypes.func, // Không bắt buộc
  onCancelSuccess: PropTypes.func, // Không bắt buộc
  // --- Props mới ---
  isFavoriteOverride: PropTypes.bool,
  onRemoveFavorite: PropTypes.func,
  isRemoving: PropTypes.bool,
};

export default TutorCard;
