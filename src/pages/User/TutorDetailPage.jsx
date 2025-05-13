import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import HomePageLayout from "../../components/User/layout/HomePageLayout";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import defaultAvatar from "../../assets/images/df-female.png";
import { PiMedalThin } from "react-icons/pi";
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
  FaClock,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaVenusMars,
  FaLink,
  FaSpinner,
  FaExclamationTriangle,
  FaCalendarCheck,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "../../assets/css/TutorDetailPage.style.css";
import BookingModal from "../../components/User/BookingModal";
import YoutubeEmbed from "../../components/User/YoutubeEmbed";

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

const formatTeachingTime = (hours) => {
  if (hours === null || isNaN(hours) || hours <= 0) return null;
  const h = Math.floor(hours);
  const minutes = Math.round((hours - h) * 60);
  let result = `${h} giờ`;
  if (minutes > 0) result += ` ${minutes} phút`;
  return result;
};

const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const emptyStarsCount = 5 - fullStars;
  for (let i = 0; i < fullStars; i++)
    stars.push(<FaStar key={`full-${i}`} className="star-icon filled" />);
  for (let i = 0; i < emptyStarsCount; i++)
    stars.push(
      <FaStar key={`empty-${i + fullStars}`} className="star-icon empty" />
    );
  return stars;
};

const renderRankBadge = (rankData) => {
  if (!rankData) return null;
  return (
    <span
      className="tutor-rank-badge detail-rank-badge"
      style={{ color: rankData.color }}
      title={`Hạng: ${rankData.name}`}
    >
      {" "}
      {rankData.icon || <PiMedalThin />}{" "}
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

const formatBirthday = (dateString) => {
  if (!dateString) return "Chưa cập nhật";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Ngày không hợp lệ";
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    console.error("Lỗi định dạng ngày sinh:", e);
    return "Ngày không hợp lệ";
  }
};

const renderSchedule = (dateTimeLearn) => {
  if (
    !dateTimeLearn ||
    !Array.isArray(dateTimeLearn) ||
    dateTimeLearn.length === 0
  )
    return <p>Chưa cập nhật lịch dạy.</p>;
  const dayLabels = {
    Monday: "Thứ 2",
    Tuesday: "Thứ 3",
    Wednesday: "Thứ 4",
    Thursday: "Thứ 5",
    Friday: "Thứ 6",
    Saturday: "Thứ 7",
    Sunday: "className",
  };
  try {
    const parsedSchedule = dateTimeLearn
      .map((itemString) => {
        try {
          let item;
          if (typeof itemString === "string") item = JSON.parse(itemString);
          else if (
            typeof itemString === "object" &&
            itemString !== null &&
            itemString.day &&
            Array.isArray(itemString.times)
          )
            item = itemString;
          else return null;
          return item &&
            item.day &&
            dayLabels[item.day] &&
            Array.isArray(item.times)
            ? item
            : null;
        } catch (parseError) {
          console.error("Lỗi parse mục lịch học:", itemString, parseError);
          return null;
        }
      })
      .filter((item) => item !== null);
    if (parsedSchedule.length === 0)
      return <p>Lịch dạy không hợp lệ hoặc chưa cập nhật.</p>;
    const dayOrder = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 7,
    };
    parsedSchedule.sort((a, b) => dayOrder[a.day] - dayOrder[b.day]);
    return (
      <ul className="schedule-list">
        {" "}
        {parsedSchedule.map((item) => (
          <li key={item.day}>
            {" "}
            <strong>{dayLabels[item.day]}:</strong>{" "}
            {item.times.length > 0
              ? item.times.sort().join(", ")
              : "Không có giờ cụ thể"}{" "}
          </li>
        ))}{" "}
      </ul>
    );
  } catch (error) {
    console.error("Lỗi xử lý lịch học:", error);
    return <p>Lỗi hiển thị lịch học.</p>;
  }
};

const TutorDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useSelector((state) => !!state.user.userProfile?.userId);

  const [tutorData, setTutorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const requireLogin = useCallback(
    (actionName = "thực hiện chức năng này") => {
      toast.info(`Vui lòng đăng nhập để ${actionName}!`);
      navigate("/login", { state: { from: location } });
    },
    [navigate, location]
  );

  const fetchTutorDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsFavorite(false);
    setBookingStatus(null);
    setBookingId(null);
    const endpoint = isLoggedIn
      ? "/user/get-list-tutor-public"
      : "/user/get-list-tutor-public-without-login";
    const filterParams = [{ key: "userId", operator: "equal", value: userId }];
    try {
      const response = await Api({
        endpoint: endpoint,
        method: METHOD_TYPE.GET,
        query: { filter: filterParams, page: 1, rpp: 1 },
        requireToken: isLoggedIn,
      });
      if (response?.data?.items && response.data.items.length > 0) {
        const fetchedTutor = response.data.items[0];
        if (!fetchedTutor.userId || !fetchedTutor.tutorProfile)
          throw new Error("Dữ liệu gia sư trả về không hợp lệ.");
        setTutorData(fetchedTutor);
        const profile = fetchedTutor.tutorProfile;
        if (isLoggedIn && profile) {
          setIsFavorite(profile.isMyFavouriteTutor || false);
          // Ưu tiên isBookingRequest để xác định trạng thái REQUEST
          if (profile.isBookingRequest === true) {
            setBookingStatus("REQUEST");
            setBookingId(profile.bookingRequestId); // API phải đảm bảo bookingRequestId có giá trị ở đây
            if (!profile.bookingRequestId)
              console.warn(
                "TutorDetail: isBookingRequest=true nhưng bookingRequestId là null!"
              );
          } else if (
            profile.bookingRequest &&
            typeof profile.bookingRequest === "object"
          ) {
            // isBookingRequest = false, nhưng có object bookingRequest (vd: APPROVED, REJECTED)
            setBookingStatus(profile.bookingRequest.status);
            setBookingId(profile.bookingRequest.bookingRequestId);
          } else {
            // isBookingRequest = false VÀ không có object bookingRequest
            setBookingStatus(null);
            setBookingId(null);
          }
        } else {
          setBookingStatus(null);
          setBookingId(null);
        }
      } else {
        setError(`Không tìm thấy thông tin gia sư với ID: ${userId}`);
        setTutorData(null);
      }
    } catch (err) {
      console.error(`Lỗi tải chi tiết gia sư:`, err);
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403) &&
        isLoggedIn
      )
        setError("Phiên đăng nhập hết hạn.");
      else if (err.message === "Dữ liệu gia sư trả về không hợp lệ.")
        setError("Lỗi xử lý dữ liệu gia sư.");
      else setError("Không thể tải thông tin gia sư.");
      setTutorData(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId, isLoggedIn]); // fetchTutorDetail sẽ được gọi lại khi userId hoặc isLoggedIn thay đổi thông qua useEffect

  useEffect(() => {
    if (userId) fetchTutorDetail();
    else {
      setIsLoading(false);
      setError("Không có ID gia sư.");
    }
  }, [userId, fetchTutorDetail]); // fetchTutorDetail là dependency

  const handleToggleFavorite = async () => {
    /* ... (Giữ nguyên) ... */ if (!isLoggedIn) {
      requireLogin("yêu thích");
      return;
    }
    if (!tutorData?.userId || isActionLoading) return;
    const cFS = isFavorite;
    setIsActionLoading(true);
    setIsFavorite(!cFS);
    try {
      const m = cFS ? METHOD_TYPE.DELETE : METHOD_TYPE.POST;
      const eP = cFS ? `/my-tutor/remove/${tutorData.userId}` : `/my-tutor/add`;
      await Api({
        endpoint: eP,
        method: m,
        ...(m === METHOD_TYPE.POST && { data: { tutorId: tutorData.userId } }),
        requireToken: true,
      });
      toast.success(`Đã ${!cFS ? "thêm" : "xóa"} yêu thích!`);
    } catch (err) {
      console.error("Lỗi yêu thích:", err);
      toast.error("Lỗi cập nhật yêu thích.");
      setIsFavorite(cFS);
    } finally {
      setIsActionLoading(false);
    }
  };
  const handleOpenBookingModal = () => {
    /* ... (Giữ nguyên) ... */ if (!isLoggedIn) {
      requireLogin("thuê");
      return;
    }
    if (tutorData && tutorData.tutorProfile) setIsBookingModalOpen(true);
    else toast.error("Thiếu thông tin để đặt lịch.");
  };
  const handleCloseBookingModal = useCallback(
    () => setIsBookingModalOpen(false),
    []
  );
  const handleBookingSuccess = useCallback(() => {
    handleCloseBookingModal();
    toast.success("Yêu cầu thuê đã gửi!");
    fetchTutorDetail();
  }, [fetchTutorDetail, handleCloseBookingModal]);
  const handleCancelBooking = async () => {
    /* ... (Giữ nguyên với body: { click: "CANCEL" }) ... */ if (
      !isLoggedIn ||
      !bookingId ||
      isActionLoading
    )
      return;
    if (!window.confirm("Hủy yêu cầu thuê?")) return;
    setIsActionLoading(true);
    try {
      await Api({
        endpoint: `booking-request/cancel-booking/${bookingId}`,
        method: METHOD_TYPE.PATCH,
        data: { click: "CANCEL" },
        requireToken: true,
      });
      toast.success("Đã hủy yêu cầu.");
      fetchTutorDetail();
    } catch (err) {
      console.error("Lỗi hủy yêu cầu:", err);
      toast.error(err.response?.data?.message || "Lỗi hủy yêu cầu.");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading && !tutorData)
    return (
      <HomePageLayout>
        <div className="tutor-detail-page loading-state">
          <FaSpinner className="spinner" />
          <p>Đang tải...</p>
        </div>
      </HomePageLayout>
    );
  if (error && !tutorData)
    return (
      <HomePageLayout>
        <div className="tutor-detail-page error-state">
          <FaExclamationTriangle className="error-icon" />
          <p>{error}</p>
          <Link to="/tim-gia-su" className="back-link">
            Quay lại
          </Link>
        </div>
      </HomePageLayout>
    );
  if (!tutorData || !tutorData.tutorProfile)
    return (
      <HomePageLayout>
        <div className="tutor-detail-page error-state">
          <p>Không có dữ liệu.</p>
          <Link to="/tim-gia-su" className="back-link">
            Quay lại
          </Link>
        </div>
      </HomePageLayout>
    );

  const profile = tutorData.tutorProfile;
  const avatar = profile.avatar || defaultAvatar;
  const rankKey =
    (profile.tutorLevel?.levelName || "").toLowerCase() || "bronze";
  const rankInfo = tutorRanks[rankKey] || tutorRanks.bronze;
  const rating = profile.averageRating
    ? parseFloat(profile.averageRating.toFixed(1))
    : 0;
  const reviewCount = profile.totalReviews || 0;
  const isVerified =
    tutorData.checkActive === "ACTIVE" && profile.isPublicProfile === true;
  const canHire = isLoggedIn && bookingStatus === null;
  const canCancel = isLoggedIn && bookingStatus === "REQUEST";
  const isApproved = isLoggedIn && bookingStatus === "APPROVED";
  const isRejected = isLoggedIn && bookingStatus === "REJECTED";

  return (
    <HomePageLayout>
      <div className="tutor-detail-page">
        {error && (
          <div className="detail-fetch-error-toast">
            <FaExclamationTriangle /> {error}
          </div>
        )}
        <section className="detail-header">
          <div className="header-left">
            <img
              src={avatar}
              alt={profile.fullname || "gia sư"}
              className="detail-avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultAvatar;
              }}
            />
            {isVerified && (
              <FaCheckCircle
                className="detail-verified-badge"
                title="Đã xác thực"
              />
            )}
          </div>
          <div className="header-main">
            <h2 className="detail-name">
              {profile.fullname || "Gia sư"}
              {renderRankBadge(rankInfo)}
            </h2>
            <div className="detail-rating-fav">
              <div className="detail-rating">
                {renderStars(rating)}
                {rating > 0 && <span className="rating-value">{rating}</span>}
                <span className="review-count">({reviewCount} Đ.giá)</span>
              </div>
              <button
                className={`favorite-btn detail-favorite-btn ${
                  isFavorite ? "favorite-active" : ""
                }`}
                onClick={handleToggleFavorite}
                title={
                  isLoggedIn
                    ? isFavorite
                      ? "Bỏ thích"
                      : "Yêu thích"
                    : "Đ.nhập để thích"
                }
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  isFavorite ? (
                    <FaSpinner className="spinner-inline" />
                  ) : (
                    <FaSpinner className="spinner-inline" />
                  )
                ) : isFavorite ? (
                  <FaHeart />
                ) : (
                  <FaRegHeart />
                )}
              </button>
            </div>
            <p className="detail-basic-info">
              <FaGraduationCap /> {profile.tutorLevel?.levelName || "N/A"} -{" "}
              {profile.univercity || "N/A"}
            </p>
            <p className="detail-basic-info">
              <FaBook /> Chuyên ngành: {profile.major?.majorName || "N/A"}
            </p>
            <div className="header-actions">
              {canHire && (
                <button
                  className="action-btn hire-btn"
                  onClick={handleOpenBookingModal}
                  disabled={isActionLoading}
                >
                  Thuê Gia Sư
                </button>
              )}
              {canCancel && (
                <button
                  className="action-btn cancel-btn"
                  onClick={handleCancelBooking}
                  disabled={isActionLoading}
                >
                  {isActionLoading ? (
                    <FaSpinner className="spinner-inline" />
                  ) : null}{" "}
                  Hủy Yêu Cầu
                </button>
              )}
              {isApproved && (
                <span className="booking-status-indicator approved">
                  <FaCalendarCheck /> Đã nhận lịch
                </span>
              )}
              {isRejected && (
                <span className="booking-status-indicator rejected">
                  <FaExclamationTriangle /> Bị từ chối
                </span>
              )}
              {!isLoggedIn && (
                <button
                  className="action-btn hire-btn-login"
                  onClick={() => requireLogin("thuê gia sư")}
                >
                  Đ.nhập để Thuê
                </button>
              )}
            </div>
          </div>
        </section>
        <section className="detail-content">
          <div className="detail-section">
            <h3>Giới thiệu</h3>
            <p className="detail-description">
              {profile.description || "Chưa có."}
            </p>
          </div>
          <div className="detail-section">
            <h3>Thông tin cơ bản</h3>
            <ul className="info-list">
              <li>
                <FaBirthdayCake className="info-icon" />
                NS: {formatBirthday(profile.birthday)}
              </li>
              <li>
                <FaVenusMars className="info-icon" />
                GT:{" "}
                {profile.gender === "MALE"
                  ? "Nam"
                  : profile.gender === "FEMALE"
                  ? "Nữ"
                  : "Khác"}
              </li>
              <li>
                <FaUserGraduate className="info-icon" />
                GPA: {profile.GPA || "N/A"}
              </li>
              {profile.evidenceOfGPA && (
                <li>
                  <FaLink className="info-icon" />
                  <a
                    href={profile.evidenceOfGPA}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Xem MC GPA
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div className="detail-section">
            <h3>Kỹ năng & Môn dạy</h3>
            <ul className="info-list">
              <li>
                <FaBook className="info-icon" />
                Môn 1: <strong>{profile.subject?.subjectName || "N/A"}</strong>
                {profile.evidenceOfSubject && (
                  <a
                    href={profile.evidenceOfSubject}
                    target="_blank"
                    rel="noreferrer"
                    className="evidence-link"
                  >
                    (MC)
                  </a>
                )}
                {profile.descriptionOfSubject && (
                  <p className="subject-desc">
                    <em>Mô tả: {profile.descriptionOfSubject}</em>
                  </p>
                )}
              </li>
              {profile.subjectId2 && profile.subject2?.subjectName && (
                <li>
                  <FaBook className="info-icon" />
                  Môn 2: <strong>{profile.subject2.subjectName}</strong>
                  {profile.evidenceOfSubject2 && (
                    <a
                      href={profile.evidenceOfSubject2}
                      target="_blank"
                      rel="noreferrer"
                      className="evidence-link"
                    >
                      (MC)
                    </a>
                  )}
                  {profile.descriptionOfSubject2 && (
                    <p className="subject-desc">
                      <em>Mô tả: {profile.descriptionOfSubject2}</em>
                    </p>
                  )}
                </li>
              )}
              {profile.subjectId3 && profile.subject3?.subjectName && (
                <li>
                  <FaBook className="info-icon" />
                  Môn 3: <strong>{profile.subject3.subjectName}</strong>
                  {profile.evidenceOfSubject3 && (
                    <a
                      href={profile.evidenceOfSubject3}
                      target="_blank"
                      rel="noreferrer"
                      className="evidence-link"
                    >
                      (MC)
                    </a>
                  )}
                  {profile.descriptionOfSubject3 && (
                    <p className="subject-desc">
                      <em>Mô tả: {profile.descriptionOfSubject3}</em>
                    </p>
                  )}
                </li>
              )}
            </ul>
          </div>
          <div className="detail-section">
            <h3>Phương pháp & Địa điểm</h3>
            <ul className="info-list">
              <li>
                <FaChalkboardTeacher className="info-icon" />
                PP dạy: {renderTeachingMethod(profile.teachingMethod)}
              </li>
              <li>
                <FaMapMarkerAlt className="info-icon" />
                KV dạy: {profile.teachingPlace || "N/A"}
              </li>
              {formatTeachingTime(
                profile.teachingTime ? parseFloat(profile.teachingTime) : null
              ) && (
                <li>
                  <FaClock className="info-icon" />
                  T.lượng:{" "}
                  {formatTeachingTime(parseFloat(profile.teachingTime))}
                </li>
              )}
            </ul>
          </div>
          <div className="detail-section">
            <h3>Lịch dạy</h3>
            {renderSchedule(profile.dateTimeLearn)}
          </div>
          {profile.videoUrl && (
            <div className="detail-section">
              <h3>Video</h3>
              <YoutubeEmbed
                videoUrl={profile.videoUrl}
                title={`Video ${profile.fullname || "gia sư"}`}
              />
            </div>
          )}
          <div className="detail-section">
            <h3>Giá/giờ</h3>
            <p className="detail-price">
              <FaCoins />{" "}
              {profile.coinPerHours
                ? `${profile.coinPerHours.toLocaleString("vi-VN")} Coin/giờ`
                : "Thỏa thuận"}
            </p>
          </div>
        </section>
        {isLoggedIn && tutorData && profile && (
          <BookingModal
            isOpen={isBookingModalOpen}
            onClose={handleCloseBookingModal}
            tutorId={tutorData.userId}
            tutorName={profile.fullname || "Gia sư"}
            onBookingSuccess={handleBookingSuccess}
            maxHoursPerLesson={
              profile.teachingTime ? parseFloat(profile.teachingTime) : null
            }
            availableScheduleRaw={profile.dateTimeLearn || []}
          />
        )}
      </div>
    </HomePageLayout>
  );
};
export default TutorDetailPage;
