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
  FaSpinner,
  FaCalendarCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import { PiMedalThin } from "react-icons/pi";
import { toast } from "react-toastify";
import Api from "../../network/Api"; // Giả sử đường dẫn này đúng
import { METHOD_TYPE } from "../../network/methodType"; // Giả sử đường dẫn này đúng
import defaultAvatar from "../../assets/images/df-female.png"; // Giả sử đường dẫn này đúng

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

const formatTeachingTime = (h) => {
  if (h == null || isNaN(h) || h <= 0) return null;
  const H = Math.floor(h);
  const m = Math.round((h - H) * 60);
  let r = `${H} giờ`;
  if (m > 0) r += ` ${m} phút`;
  return r;
};

const TutorCard = ({
  tutor,
  onOpenBookingModal,
  onCancelSuccess,
  isFavoriteOverride,
  onRemoveFavorite, // Callback này được dùng khi card nằm trong trang "Danh sách yêu thích"
  isRemoving, // State cho biết đang trong quá trình xóa khỏi danh sách yêu thích (UI)
  onFavoriteStatusChange,
  isLoggedIn,
}) => {
  // Khởi tạo trạng thái isFavorite:
  // 1. Ưu tiên isFavoriteOverride (nếu được truyền)
  // 2. Nếu không, dùng tutor.isInitiallyFavorite (giá trị từ API)
  // 3. Mặc định là false.
  const [isFavorite, setIsFavorite] = useState(
    typeof isFavoriteOverride === "boolean"
      ? isFavoriteOverride
      : tutor.isInitiallyFavorite || false
  );
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false); // State cho việc hủy booking
  const navigate = useNavigate();

  // isLoadingFavoriteAction kết hợp cả isRemoving (từ trang yêu thích) và isTogglingFavorite (từ click thông thường)
  const isLoadingFavoriteAction =
    (isRemoving && isFavorite) || isTogglingFavorite;

  const currentBookingStatus = tutor.bookingRequest?.status;
  const currentBookingId = tutor.bookingRequestId;

  const canHire = isLoggedIn && !currentBookingStatus && onOpenBookingModal;
  const canCancel =
    isLoggedIn && currentBookingStatus === "REQUEST" && onCancelSuccess;
  const isApproved = isLoggedIn && currentBookingStatus === "APPROVED";
  const isRejected = isLoggedIn && currentBookingStatus === "REJECTED";

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      toast.info("Vui lòng đăng nhập để thực hiện chức năng này!");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    // Ngăn chặn hành động nếu đang hủy booking hoặc đang xử lý yêu thích
    if (isCancelling || isLoadingFavoriteAction) return;

    // Nếu `onRemoveFavorite` được cung cấp (thường từ trang danh sách yêu thích)
    // và gia sư hiện tại đang được yêu thích, thì gọi `onRemoveFavorite`.
    // Hàm này sẽ chịu trách nhiệm gọi API xóa và cập nhật UI ở trang đó.
    if (onRemoveFavorite && isFavorite) {
      onRemoveFavorite(); // onRemoveFavorite nên tự xử lý trạng thái loading của nó
      return;
    }

    setIsTogglingFavorite(true);
    const newFavoriteStatus = !isFavorite;

    try {
      const method = newFavoriteStatus ? METHOD_TYPE.POST : METHOD_TYPE.DELETE;
      const endpoint = newFavoriteStatus
        ? `my-tutor/add`
        : `my-tutor/remove/${tutor.id}`; // tutor.id là userId của gia sư

      await Api({
        endpoint: endpoint,
        method: method,
        ...(method === METHOD_TYPE.POST && { data: { tutorId: tutor.id } }), // Chỉ gửi body khi POST
        requireToken: true,
      });

      setIsFavorite(newFavoriteStatus);
      if (onFavoriteStatusChange) {
        onFavoriteStatusChange(tutor.id, newFavoriteStatus);
      }
      toast.success(
        `Đã ${newFavoriteStatus ? "thêm" : "bỏ"} gia sư ${tutor.name} ${
          newFavoriteStatus ? "vào" : "khỏi"
        } danh sách yêu thích!`
      );
    } catch (err) {
      console.error("Lỗi khi cập nhật danh sách yêu thích:", err);
      toast.error(
        `Không thể ${newFavoriteStatus ? "thêm" : "bỏ"} gia sư ${
          newFavoriteStatus ? "vào" : "khỏi"
        } danh sách yêu thích. Vui lòng thử lại.`
      );
      // Không tự động revert isFavorite ở đây để người dùng biết có lỗi và có thể thử lại.
      // Nếu API lỗi, UI nên phản ánh lỗi đó thay vì im lặng revert.
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleCancelBooking = async (e) => {
    e.stopPropagation();
    if (
      !currentBookingId ||
      !onCancelSuccess ||
      isLoadingFavoriteAction ||
      isCancelling
    ) {
      if (!currentBookingId || !onCancelSuccess)
        toast.error("Không thể hủy yêu cầu thuê này.");
      return;
    }
    if (
      !window.confirm(`Bạn có chắc muốn hủy yêu cầu thuê gia sư ${tutor.name}?`)
    )
      return;

    setIsCancelling(true);
    try {
      await Api({
        endpoint: `booking-request/cancel-booking/${currentBookingId}`,
        method: METHOD_TYPE.PATCH,
        data: { click: "CANCEL" }, // Đảm bảo API của bạn mong đợi `body` cho PATCH
        requireToken: true,
      });
      toast.success(`Đã hủy yêu cầu thuê gia sư ${tutor.name}.`);
      if (onCancelSuccess) onCancelSuccess(tutor.id); // Truyền tutor.id để component cha cập nhật
    } catch (err) {
      console.error("Lỗi khi hủy yêu cầu thuê:", err);
      toast.error(err.response?.data?.message || `Không thể hủy yêu cầu thuê.`);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleViewProfile = (e) => {
    e.stopPropagation();
    if (isCancelling || isLoadingFavoriteAction) return;
    navigate(`/gia-su/${tutor.id}`);
  };

  const handleHireClick = (e) => {
    e.stopPropagation();
    if (onOpenBookingModal && !isCancelling && !isLoadingFavoriteAction)
      onOpenBookingModal(tutor);
  };

  const renderStars = (r) => {
    let s = [],
      fS = Math.floor(r),
      eS = 5 - fS;
    for (let i = 0; i < fS; i++)
      s.push(<FaStar key={`fS${i}`} className="star-icon filled" />);
    for (let i = 0; i < eS; i++)
      s.push(<FaStar key={`eS${i + fS}`} className="star-icon empty" />);
    return s;
  };

  const renderRankBadge = (d) =>
    d ? (
      <span
        className="tutor-rank-badge"
        style={{ color: d.color }}
        title={`Hạng: ${d.name}`}
      >
        {d.icon || <PiMedalThin />}
      </span>
    ) : null;

  const renderTeachingMethod = (m) => {
    switch (m) {
      case "ONLINE":
        return "Trực tuyến";
      case "OFFLINE":
        return "Trực tiếp";
      case "BOTH":
        return "Cả hai";
      default:
        return "N/A";
    }
  };

  const avatar = tutor.imageUrl || defaultAvatar;
  const rankInfo = tutorRanks[tutor.rank] || null;
  const fTeachTime = formatTeachingTime(tutor.teachingTime);

  return (
    <div
      className={`tutor-card redesigned ${
        isLoadingFavoriteAction && isFavorite ? "card-removing-favorite" : ""
      } ${isCancelling ? "card-cancelling-booking" : ""}`}
      // Thêm class khi đang removing (để style nếu cần)
      // `isRemoving` là prop cho biết card này đang trong quá trình bị xóa khỏi danh sách (ví dụ từ trang yêu thích)
      // `isLoadingFavoriteAction && isFavorite` dùng để chỉ trạng thái "đang bỏ thích"
    >
      <div className="tutor-card-left">
        <div className="avatar-container">
          <img
            src={avatar}
            alt={tutor.name}
            className="tutor-avatar"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultAvatar;
            }}
          />
          {tutor.isVerified && (
            <div className="verified-badge-avatar" title="Đã xác thực">
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
              {isLoggedIn && ( // Chỉ hiển thị nút yêu thích nếu đã đăng nhập
                <button
                  className={`favorite-btn ${
                    isFavorite ? "favorite-active" : ""
                  } ${isLoadingFavoriteAction ? "loading" : ""}`}
                  onClick={handleFavoriteClick}
                  title={
                    isFavorite ? "Bỏ yêu thích" : "Thêm vào danh sách yêu thích"
                  }
                  disabled={isLoadingFavoriteAction || isCancelling}
                  aria-pressed={isFavorite} // Thuộc tính ARIA cho trạng thái nút
                >
                  {isLoadingFavoriteAction ? (
                    <FaSpinner spin />
                  ) : isFavorite ? (
                    <FaHeart />
                  ) : (
                    <FaRegHeart />
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="tutor-info-row">
            <FaGraduationCap className="info-icon" />
            <span>{tutor.university || "N/A"}</span>
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
              {tutor.subjects?.join(", ") || "N/A"}
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
          {fTeachTime && (
            <div className="tutor-info-row">
              <FaClock className="info-icon" />
              <span>Thời lượng buổi dạy: {fTeachTime}</span>
            </div>
          )}
          <p
            className="tutor-description"
            onClick={handleViewProfile}
            style={{ cursor: "pointer" }}
            title="Xem hồ sơ chi tiết để đọc thêm"
          >
            {tutor.description}
          </p>
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
                title={`Thuê gia sư ${tutor.name}`}
                disabled={isCancelling || isLoadingFavoriteAction}
              >
                <span>Thuê</span>
              </button>
            )}
            {canCancel && (
              <button
                className="action-btn cancel-btn"
                onClick={handleCancelBooking}
                title="Hủy yêu cầu thuê đã gửi"
                disabled={isCancelling || isLoadingFavoriteAction}
              >
                {isCancelling ? (
                  <FaSpinner spin className="spinner-inline" />
                ) : (
                  <span>Hủy Yêu Cầu</span>
                )}
              </button>
            )}
            {isApproved && (
              <span className="booking-status-indicator card-approved">
                <FaCalendarCheck /> Đã Nhận Lịch
              </span>
            )}
            {isRejected && (
              <span className="booking-status-indicator card-rejected">
                <FaExclamationTriangle /> Bị Từ Chối
              </span>
            )}
            <button
              className="action-btn view-profile-btn"
              onClick={handleViewProfile}
              title={`Xem hồ sơ chi tiết của gia sư ${tutor.name}`}
              disabled={isCancelling || isLoadingFavoriteAction} // Vô hiệu hóa khi đang có action khác
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
    university: PropTypes.string,
    level: PropTypes.string,
    subjects: PropTypes.arrayOf(PropTypes.string),
    GPA: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // GPA có thể là string hoặc number
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
    description: PropTypes.string,
    teachingMethod: PropTypes.string,
    hourlyRate: PropTypes.number,
    teachingTime: PropTypes.number,
    isVerified: PropTypes.bool,
    rank: PropTypes.oneOf(["bronze", "silver", "gold", "platinum", "diamond"]),
    isInitiallyFavorite: PropTypes.bool,
    bookingRequest: PropTypes.shape({
      bookingRequestId: PropTypes.string,
      status: PropTypes.string,
    }),
    dateTimeLearn: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.object])
    ),
    bookingRequestId: PropTypes.string, // ID này đã được chuẩn hóa ở mapApiTutorToCardProps
  }).isRequired,
  onOpenBookingModal: PropTypes.func,
  onCancelSuccess: PropTypes.func,
  isFavoriteOverride: PropTypes.bool,
  onRemoveFavorite: PropTypes.func,
  isRemoving: PropTypes.bool,
  onFavoriteStatusChange: PropTypes.func,
  isLoggedIn: PropTypes.bool.isRequired,
};

export default TutorCard;
