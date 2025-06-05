import { useState, useEffect, memo } from "react";
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
  FaCalendarPlus,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa"; // Đảm bảo FaUserCheck không còn báo unused nếu AcceptedRequestsModal không dùng
import { PiMedalThin } from "react-icons/pi";
import { toast } from "react-toastify";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import defaultAvatar from "../../assets/images/df-female.png";
import "../../assets/css/TutorCard.style.css";

// --- HELPER CONSTANTS & FUNCTIONS ---
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
const renderTeachingMethodShort = (m) => {
  switch (m) {
    case "ONLINE":
      return "Online";
    case "OFFLINE":
      return "Offline";
    case "BOTH":
      return "Cả hai";
    default:
      return "N/A";
  }
};
// --- END HELPER ---

const TutorCard = ({
  tutor,
  onOpenBookingModal,
  onOpenAcceptedRequestsModal,
  onCancelSuccess,
  onFavoriteStatusChange,
  isLoggedIn,
  isFavoriteOverride,
  onRemoveFavorite,
  isRemoving,
  className = "",
}) => {
  const [isFavoriteState, setIsFavoriteState] = useState(
    tutor.isInitiallyFavorite || false
  );
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isProcessingBookingAction, setIsProcessingBookingAction] =
    useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof isFavoriteOverride === "boolean")
      setIsFavoriteState(isFavoriteOverride);
  }, [isFavoriteOverride]);
  const currentIsFavorite =
    typeof isFavoriteOverride === "boolean"
      ? isFavoriteOverride
      : isFavoriteState;
  const isLoadingFavoriteAction =
    (isRemoving && currentIsFavorite) || isTogglingFavorite;
  const apiIsTutorAcceptingFlagOnCard = tutor.isTutorAcceptingRequestAPIFlag;
  const detailedStatusOnCard = tutor.bookingInfoCard?.status;
  const bookingIdOnCard = tutor.bookingInfoCard?.bookingId;

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      toast.info("Vui lòng đăng nhập!");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }
    if (isProcessingBookingAction || isLoadingFavoriteAction) return;
    if (onRemoveFavorite && currentIsFavorite) {
      onRemoveFavorite(tutor.id);
      return;
    }
    setIsTogglingFavorite(true);
    const nFS = !currentIsFavorite;
    try {
      const m = nFS ? METHOD_TYPE.POST : METHOD_TYPE.DELETE;
      const eP = nFS ? `my-tutor/add` : `my-tutor/remove/${tutor.id}`;
      await Api({
        endpoint: eP,
        method: m,
        ...(m === METHOD_TYPE.POST && { data: { tutorId: tutor.id } }),
        requireToken: true,
      });
      setIsFavoriteState(nFS);
      if (onFavoriteStatusChange) onFavoriteStatusChange(tutor.id, nFS);
      toast.success(
        `Đã ${nFS ? "thêm" : "bỏ"} ${tutor.name} ${
          nFS ? "vào" : "khỏi"
        } Y.Thích!`
      );
    } catch (err) {
      toast.error(`Lỗi ${nFS ? "thêm" : "bỏ"} Y.Thích.`);
    } finally {
      setIsTogglingFavorite(false);
    }
  };
  const handleRequestHireClick = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      toast.info("Vui lòng đăng nhập!");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }
    if (
      onOpenBookingModal &&
      !isProcessingBookingAction &&
      !isLoadingFavoriteAction
    )
      onOpenBookingModal(tutor);
  };
  const handleOpenAcceptedModalClick = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      toast.info("Vui lòng đăng nhập!");
      return;
    }
    if (
      onOpenAcceptedRequestsModal &&
      !isProcessingBookingAction &&
      !isLoadingFavoriteAction
    )
      onOpenAcceptedRequestsModal(tutor);
  };
  const handleCancelRequestOnCard = async (e) => {
    e.stopPropagation();
    if (
      !isLoggedIn ||
      !bookingIdOnCard ||
      detailedStatusOnCard !== "REQUEST" ||
      isProcessingBookingAction ||
      isLoadingFavoriteAction
    )
      return;
    setIsProcessingBookingAction(true);
    try {
      await Api({
        endpoint: `booking-request/cancel-booking/${bookingIdOnCard}`,
        method: METHOD_TYPE.PATCH,
        data: { click: "CANCEL" },
        requireToken: true,
      });
      toast.success(`Đã hủy YC cho ${tutor.name}.`);
      if (onCancelSuccess) onCancelSuccess(tutor.id);
    } catch (err) {
      toast.error(err.response?.data?.message || `Lỗi hủy YC.`);
    } finally {
      setIsProcessingBookingAction(false);
    }
  };
  const handleViewProfile = (e) => {
    e.stopPropagation();
    if (isProcessingBookingAction || isLoadingFavoriteAction) return;
    navigate(`/gia-su/${tutor.id}`);
  };
  const renderStars = (rV) => {
    const s = [];
    const fS = Math.floor(rV);
    for (let i = 0; i < 5; i++) {
      if (i < fS)
        s.push(<FaStar key={`sf-${i}`} className="star-icon filled" />);
      else s.push(<FaStar key={`se-${i}`} className="star-icon empty" />);
    }
    return s;
  };
  const renderRankBadge = (d) =>
    d ? (
      <span
        className="tutor-rank-badge"
        style={{ color: d.color }}
        title={`Hạng: ${d.name}`}
      >
        {" "}
        {d.icon || <PiMedalThin />}{" "}
      </span>
    ) : null;

  const avatar = tutor.imageUrl || defaultAvatar;
  const rankInfo = tutorRanks[tutor.rank] || null;
  const fTeachTime = formatTeachingTime(tutor.teachingTime);
  const validRating = Math.max(
    0,
    Math.min(5, tutor.rating ? parseFloat(tutor.rating) : 0)
  );
  const reviewCount = tutor.reviewCount || 0;

  const showViewAcceptedBtnCard =
    isLoggedIn && apiIsTutorAcceptingFlagOnCard === true;
  const showNoAcceptedMsgCard =
    isLoggedIn && apiIsTutorAcceptingFlagOnCard === false;
  // Nút Gửi Yêu Cầu Mới hiển thị độc lập
  const canSendNewReqCard =
    isLoggedIn &&
    (!detailedStatusOnCard ||
      ["REFUSE", "CANCEL", "COMPLETED"].includes(detailedStatusOnCard));
  const showPendingApprovalCard =
    isLoggedIn && detailedStatusOnCard === "REQUEST" && bookingIdOnCard;
  const showHiredMsgCard = isLoggedIn && detailedStatusOnCard === "HIRED";

  return (
    <div
      className={`tutor-card redesigned ${className} ${
        isLoadingFavoriteAction || isProcessingBookingAction
          ? "card-action-processing"
          : ""
      }`}
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
              title="Xem hồ sơ"
            >
              {tutor.name}
              {renderRankBadge(rankInfo)}
            </h4>
            <div className="header-right-actions">
              {/* Wrap rating and favorite button in a new div */}
              <div className="rating-and-favorite-container">
                <div
                  className="tutor-rating-display card-rating-section"
                  title={`${validRating.toFixed(1)} sao (${reviewCount} lượt)`}
                >
                  <span className="rating-value-text">
                    {validRating.toFixed(1)}
                  </span>
                  <div className="stars-wrapper">
                    {renderStars(validRating)}
                  </div>
                  <span className="review-count-text">({reviewCount})</span>
                </div>
                {isLoggedIn && (
                  <button
                    className={`favorite-btn ${
                      currentIsFavorite ? "favorite-active" : ""
                    } ${isLoadingFavoriteAction ? "loading" : ""}`}
                    onClick={handleFavoriteClick}
                    disabled={
                      isLoadingFavoriteAction || isProcessingBookingAction
                    }
                    aria-pressed={currentIsFavorite}
                  >
                    {isLoadingFavoriteAction ? (
                      <FaSpinner spin />
                    ) : currentIsFavorite ? (
                      <FaHeart />
                    ) : (
                      <FaRegHeart />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="tutor-info-row">
            <FaGraduationCap className="info-icon" />{" "}
            <span>{tutor.university || "N/A"}</span>
          </div>
          {tutor.level && (
            <div className="tutor-info-row">
              <FaLayerGroup className="info-icon" />{" "}
              <span>Trình độ: {tutor.level}</span>
            </div>
          )}
          <div className="tutor-info-row">
            <FaBook className="info-icon" />{" "}
            <span className="tutor-subjects" title={tutor.subjects?.join(", ")}>
              {tutor.subjects?.join(", ") || "N/A"}
            </span>
          </div>
          {tutor.GPA && (
            <div className="tutor-info-row">
              <FaUserGraduate className="info-icon" />{" "}
              <span>GPA: {tutor.GPA}</span>
            </div>
          )}
          {tutor.teachingMethod && (
            <div className="tutor-info-row">
              <FaChalkboardTeacher className="info-icon" />{" "}
              <span>PP: {renderTeachingMethodShort(tutor.teachingMethod)}</span>
            </div>
          )}
          {fTeachTime && (
            <div className="tutor-info-row">
              <FaClock className="info-icon" /> <span>Buổi: {fTeachTime}</span>
            </div>
          )}
          <p
            className="tutor-description"
            onClick={handleViewProfile}
            title="Xem thêm"
          >
            {tutor.description}
          </p>
        </div>
        <div className="tutor-card-footer-info">
          <div className="tutor-price">
            <FaCoins className="info-icon price-icon" />
            <span>
              {" "}
              {tutor.hourlyRate > 0
                ? `${tutor.hourlyRate.toLocaleString("vi-VN")} Coin/giờ`
                : "Thỏa thuận"}
            </span>
          </div>
          <div className="footer-buttons">
            {showViewAcceptedBtnCard && onOpenAcceptedRequestsModal && (
              <button
                className="action-btn btn-view-accepted"
                onClick={handleOpenAcceptedModalClick}
                disabled={isProcessingBookingAction || isLoadingFavoriteAction}
              >
                <FaCalendarCheck /> Xem YC Duyệt
              </button>
            )}
            {showNoAcceptedMsgCard && !showViewAcceptedBtnCard && (
              <span className="booking-status-indicator card-info disabled-look">
                <FaInfoCircle /> Chưa có yêu cầu được chấp nhận
              </span>
            )}
            {canSendNewReqCard && onOpenBookingModal && (
              <button
                className="action-btn btn-request-new"
                onClick={handleRequestHireClick}
                disabled={isProcessingBookingAction || isLoadingFavoriteAction}
              >
                <FaCalendarPlus /> Yêu Cầu Mới
              </button>
            )}
            {showPendingApprovalCard && (
              <div className="status-with-action-card">
                <span className="booking-status-indicator card-pending">
                  <FaClock /> Chờ duyệt
                </span>
                <button
                  className="action-btn btn-cancel-small"
                  onClick={handleCancelRequestOnCard}
                  disabled={
                    isProcessingBookingAction || isLoadingFavoriteAction
                  }
                >
                  {isProcessingBookingAction ? <FaSpinner spin /> : <FaTimes />}{" "}
                  Hủy
                </button>
              </div>
            )}
            {showHiredMsgCard && (
              <span className="booking-status-indicator card-hired">
                <FaCheckCircle /> Đang học
              </span>
            )}
            <button
              className="action-btn view-profile-btn"
              onClick={handleViewProfile}
              disabled={isProcessingBookingAction || isLoadingFavoriteAction}
            >
              Hồ Sơ
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
    GPA: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    reviewCount: PropTypes.number,
    description: PropTypes.string,
    teachingMethod: PropTypes.string,
    hourlyRate: PropTypes.number,
    teachingTime: PropTypes.number,
    isVerified: PropTypes.bool,
    rank: PropTypes.oneOf(["bronze", "silver", "gold", "platinum", "diamond"]),
    isInitiallyFavorite: PropTypes.bool,
    isTutorAcceptingRequestAPIFlag: PropTypes.oneOf([true, false, null]),
    bookingInfoCard: PropTypes.shape({
      status: PropTypes.string,
      bookingId: PropTypes.string,
    }),
    dateTimeLearn: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.object])
    ),
  }).isRequired,
  onOpenBookingModal: PropTypes.func,
  onOpenAcceptedRequestsModal: PropTypes.func,
  onCancelSuccess: PropTypes.func,
  onFavoriteStatusChange: PropTypes.func,
  isLoggedIn: PropTypes.bool.isRequired,
  isFavoriteOverride: PropTypes.bool,
  onRemoveFavorite: PropTypes.func,
  isRemoving: PropTypes.bool,
  className: PropTypes.string,
};

export default memo(TutorCard, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.tutor.id === nextProps.tutor.id &&
    prevProps.isLoggedIn === nextProps.isLoggedIn &&
    prevProps.isFavoriteOverride === nextProps.isFavoriteOverride &&
    prevProps.isRemoving === nextProps.isRemoving
  );
});
