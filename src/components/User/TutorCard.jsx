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
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import defaultAvatar from "../../assets/images/df-female.png";

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
  onRemoveFavorite,
  isRemoving,
  onFavoriteStatusChange,
  isLoggedIn,
}) => {
  const [isFavorite, setIsFavorite] = useState(
    typeof isFavoriteOverride === "boolean"
      ? isFavoriteOverride
      : tutor.isInitiallyFavorite || false
  );
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const navigate = useNavigate();
  const isLoadingFavoriteAction = isRemoving || isTogglingFavorite;

  // Sử dụng thông tin đã được chuẩn hóa từ props.tutor
  const currentBookingStatus = tutor.bookingRequest?.status;
  const currentBookingId = tutor.bookingRequestId; // bookingRequestId đã được map

  const canHire = isLoggedIn && !currentBookingStatus && onOpenBookingModal;
  const canCancel =
    isLoggedIn && currentBookingStatus === "REQUEST" && onCancelSuccess;
  const isApproved = isLoggedIn && currentBookingStatus === "APPROVED";
  const isRejected = isLoggedIn && currentBookingStatus === "REJECTED";

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      toast.info("Vui lòng đăng nhập!");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }
    if (isLoadingFavoriteAction || isCancelling) return;
    if (onRemoveFavorite) {
      onRemoveFavorite();
      return;
    }
    setIsTogglingFavorite(true);
    const nFS = !isFavorite;
    try {
      const m = nFS ? METHOD_TYPE.POST : METHOD_TYPE.DELETE;
      const eP = nFS ? `/my-tutor/add` : `/my-tutor/remove/${tutor.id}`;
      await Api({
        endpoint: eP,
        method: m,
        ...(m === METHOD_TYPE.POST && { body: { tutorId: tutor.id } }),
        requireToken: true,
      });
      setIsFavorite(nFS);
      if (onFavoriteStatusChange) onFavoriteStatusChange(tutor.id, nFS);
      toast.success(`Đã ${nFS ? "thêm" : "bỏ"} yêu thích ${tutor.name}`);
    } catch (err) {
      console.error("Lỗi Y.thích:", err);
      toast.error(`Lỗi: K.thể ${nFS ? "thêm" : "bỏ"} thích.`);
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
      if (!currentBookingId || !onCancelSuccess) toast.error("Không thể hủy yêu cầu thuê");
      return;
    }
    if (!window.confirm(`Hủy yêu cầu thuê ${tutor.name}?`)) return;
    setIsCancelling(true);
    try {
      await Api({
        endpoint: `/booking-request/cancel-booking/${currentBookingId}`,
        method: METHOD_TYPE.PATCH,
        body: { click: "CANCEL" },
        requireToken: true,
      });
      toast.success(`Đã hủy yêu cầu thuê ${tutor.name}`);
      if (onCancelSuccess) onCancelSuccess(tutor.id);
    } catch (err) {
      console.error("Lỗi hủy booking:", err);
      toast.error(err.response?.data?.message || `Không thể hủy yêu cầu thuê`);
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
      className={`tutor-card redesigned ${isRemoving ? "card-removing" : ""}`}
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
              title="Xem hồ sơ"
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
              <button
                className={`favorite-btn ${
                  isFavorite ? "favorite-active" : ""
                } ${isLoadingFavoriteAction ? "loading" : ""}`}
                onClick={handleFavoriteClick}
                title={isFavorite ? "Bỏ thích" : "Yêu thích"}
                disabled={isLoadingFavoriteAction || isCancelling}
              >
                {isLoadingFavoriteAction ? (
                  <FaSpinner spin={String(true)} />
                ) : isFavorite ? (
                  <FaHeart />
                ) : (
                  <FaRegHeart />
                )}
              </button>
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
              <span>P.thức: {renderTeachingMethod(tutor.teachingMethod)}</span>
            </div>
          )}
          {fTeachTime && (
            <div className="tutor-info-row">
              <FaClock className="info-icon" />
              <span>T.lượng: {fTeachTime}/buổi</span>
            </div>
          )}
          <p
            className="tutor-description"
            onClick={handleViewProfile}
            style={{ cursor: "pointer" }}
            title="Xem hồ sơ"
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
                title="Thuê"
                disabled={isCancelling || isLoadingFavoriteAction}
              >
                <span>Thuê</span>
              </button>
            )}
            {canCancel && (
              <button
                className="action-btn cancel-btn"
                onClick={handleCancelBooking}
                title="Hủy yêu cầu thuê"
                disabled={isCancelling || isLoadingFavoriteAction}
              >
                {isCancelling ? (
                  <FaSpinner spin className="spinner-inline" />
                ) : (
                  <span>Hủy yêu cầu thuê</span>
                )}
              </button>
            )}
            {isApproved && (
              <span className="booking-status-indicator card-approved">
                <FaCalendarCheck /> Đã nhận lịch
              </span>
            )}
            {isRejected && (
              <span className="booking-status-indicator card-rejected">
                <FaExclamationTriangle /> Bị từ chối
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
    university: PropTypes.string,
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
    bookingRequest: PropTypes.shape({
      bookingRequestId: PropTypes.string,
      status: PropTypes.string,
    }),
    dateTimeLearn: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.object])
    ),
    bookingRequestId: PropTypes.string,
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
