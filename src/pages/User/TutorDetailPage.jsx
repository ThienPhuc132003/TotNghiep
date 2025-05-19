import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Api from "../../network/Api"; // Giả sử đường dẫn này đúng
import { METHOD_TYPE } from "../../network/methodType"; // Giả sử đường dẫn này đúng
import defaultAvatar from "../../assets/images/df-female.png"; // Giả sử đường dẫn này đúng
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
import "../../assets/css/TutorDetailPage.style.css"; // Giả sử đường dẫn này đúng
import BookingModal from "../../components/User/BookingModal"; // Giả sử đường dẫn này đúng
import YoutubeEmbed from "../../components/User/YoutubeEmbed"; // Giả sử đường dẫn này đúng

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
  // Tạm thời làm tròn đơn giản cho đủ 5 sao
  for (let i = 0; i < fullStars; i++)
    stars.push(<FaStar key={`full-${i}`} className="star-icon filled" />);
  for (let i = 0; i < 5 - fullStars; i++)
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
    return <p>Gia sư chưa cập nhật lịch dạy.</p>;

  const dayLabels = {
    Monday: "Thứ Hai",
    Tuesday: "Thứ Ba",
    Wednesday: "Thứ Tư",
    Thursday: "Thứ Năm",
    Friday: "Thứ Sáu",
    Saturday: "Thứ Bảy",
    Sunday: "Chủ Nhật",
  };

  try {
    const parsedSchedule = dateTimeLearn
      .map((itemString) => {
        try {
          let item;
          if (typeof itemString === "string") {
            item = JSON.parse(itemString);
          } else if (
            typeof itemString === "object" &&
            itemString !== null &&
            itemString.day &&
            Array.isArray(itemString.times)
          ) {
            item = itemString;
          } else {
            return null;
          }
          return item &&
            item.day &&
            dayLabels[item.day] &&
            Array.isArray(item.times)
            ? item
            : null;
        } catch (parseError) {
          console.error(
            "Lỗi khi phân tích một mục trong lịch học:",
            itemString,
            parseError
          );
          return null;
        }
      })
      .filter((item) => item !== null);

    if (parsedSchedule.length === 0) {
      return <p>Lịch dạy không hợp lệ hoặc gia sư chưa cập nhật.</p>;
    }

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
        {parsedSchedule.map((item) => (
          <li key={item.day}>
            <strong>{dayLabels[item.day]}:</strong>{" "}
            {item.times.length > 0
              ? item.times.sort().join(", ")
              : "Không có khung giờ cụ thể"}
          </li>
        ))}
      </ul>
    );
  } catch (error) {
    console.error("Lỗi khi xử lý và hiển thị lịch học:", error);
    return <p>Đã xảy ra lỗi khi hiển thị lịch học của gia sư.</p>;
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

    const baseEndpoint = isLoggedIn
      ? "/user/get-list-tutor-public"
      : "/user/get-list-tutor-public-without-login";

    const filterParam = JSON.stringify([
      { key: "tutorProfile.userId", operator: "equal", value: userId },
    ]);

    const queryParams = {
      filter: filterParam,
      page: 1,
      rpp: 1,
    };

    try {
      const response = await Api({
        endpoint: baseEndpoint,
        method: METHOD_TYPE.GET,
        query: queryParams,
        requireToken: isLoggedIn,
      });

      if (response?.data?.items && response.data.items.length > 0) {
        const fetchedTutor = response.data.items[0];

        if (fetchedTutor && fetchedTutor.userId && fetchedTutor.tutorProfile) {
          setTutorData(fetchedTutor);
          const profile = fetchedTutor.tutorProfile;

          if (isLoggedIn && profile) {
            setIsFavorite(profile.isMyFavouriteTutor || false);

            if (profile.isBookingRequest === true) {
              setBookingStatus("REQUEST");
              setBookingId(profile.bookingRequestId);
              if (!profile.bookingRequestId) {
                console.warn(
                  "TutorDetail: isBookingRequest=true nhưng bookingRequestId là null cho gia sư:",
                  fetchedTutor.userId
                );
              }
            } else if (
              profile.bookingRequest &&
              typeof profile.bookingRequest === "object"
            ) {
              setBookingStatus(profile.bookingRequest.status);
              setBookingId(profile.bookingRequest.bookingRequestId);
            } else {
              setBookingStatus(null);
              setBookingId(null);
            }
          }
        } else {
          console.error("Dữ liệu gia sư trả về không hợp lệ:", fetchedTutor);
          setError(
            `Không tìm thấy thông tin đầy đủ cho gia sư với ID: ${userId}.`
          );
          setTutorData(null);
        }
      } else {
        setError(`Không tìm thấy thông tin gia sư với ID: ${userId}.`);
        setTutorData(null);
      }
    } catch (err) {
      console.error(`Lỗi khi tải chi tiết gia sư (ID: ${userId}):`, err);
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403) &&
        isLoggedIn
      ) {
        setError("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (err.response && err.response.status === 404) {
        setError(`Không tìm thấy gia sư với ID: ${userId} (API 404).`);
      } else {
        setError(
          "Không thể tải thông tin chi tiết của gia sư. Vui lòng thử lại sau."
        );
      }
      setTutorData(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId, isLoggedIn]);

  useEffect(() => {
    if (userId) {
      fetchTutorDetail();
    } else {
      setIsLoading(false);
      setError("Không có ID gia sư được cung cấp.");
    }
    window.scrollTo(0, 0);
  }, [userId, fetchTutorDetail]);

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      requireLogin("thêm gia sư vào danh sách yêu thích");
      return;
    }
    if (!tutorData?.userId || isActionLoading) return;

    setIsActionLoading(true);
    const newFavoriteStatus = !isFavorite;

    try {
      const method = newFavoriteStatus ? METHOD_TYPE.POST : METHOD_TYPE.DELETE;
      const endpoint = newFavoriteStatus
        ? `/my-tutor/add`
        : `/my-tutor/remove/${tutorData.userId}`;

      await Api({
        endpoint: endpoint,
        method: method,
        ...(method === METHOD_TYPE.POST && {
          body: { tutorId: tutorData.userId },
        }),
        requireToken: true,
      });

      setIsFavorite(newFavoriteStatus);
      toast.success(
        `Đã ${newFavoriteStatus ? "thêm" : "bỏ"} gia sư ${
          tutorData.tutorProfile.fullname || "này"
        } ${newFavoriteStatus ? "vào" : "khỏi"} danh sách yêu thích!`
      );
    } catch (err) {
      console.error("Lỗi khi cập nhật danh sách yêu thích:", err);
      toast.error(
        `Không thể ${
          newFavoriteStatus ? "thêm" : "bỏ"
        } gia sư vào danh sách yêu thích. Vui lòng thử lại.`
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenBookingModal = () => {
    if (!isLoggedIn) {
      requireLogin("thuê gia sư");
      return;
    }
    if (tutorData && tutorData.tutorProfile) {
      setIsBookingModalOpen(true);
    } else {
      toast.error(
        "Không đủ thông tin gia sư để thực hiện đặt lịch. Vui lòng thử lại."
      );
    }
  };

  const handleCloseBookingModal = useCallback(() => {
    setIsBookingModalOpen(false);
  }, []);

  const handleBookingSuccess = useCallback(() => {
    handleCloseBookingModal();
    toast.success("Yêu cầu thuê gia sư đã được gửi thành công!");
    fetchTutorDetail();
  }, [fetchTutorDetail, handleCloseBookingModal]);

  const handleCancelBooking = async () => {
    if (!isLoggedIn || !bookingId || isActionLoading) return;

    if (
      !window.confirm(
        `Bạn có chắc muốn hủy yêu cầu thuê gia sư ${
          tutorData?.tutorProfile?.fullname || "này"
        }?`
      )
    )
      return;

    setIsActionLoading(true);
    try {
      await Api({
        endpoint: `booking-request/cancel-booking/${bookingId}`,
        method: METHOD_TYPE.PATCH,
        body: { click: "CANCEL" },
        requireToken: true,
      });
      toast.success("Đã hủy yêu cầu thuê gia sư thành công.");
      fetchTutorDetail();
    } catch (err) {
      console.error("Lỗi khi hủy yêu cầu thuê:", err);
      toast.error(
        err.response?.data?.message ||
          "Không thể hủy yêu cầu thuê. Vui lòng thử lại."
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading && !tutorData) {
    return (
      <>
        <div className="tutor-detail-page loading-state">
          <FaSpinner className="spinner" spin />
          <p>Đang tải thông tin chi tiết gia sư...</p>
        </div>
      </>
    );
  }

  if (error && !tutorData) {
    return (
      <>
        <div className="tutor-detail-page error-state">
          <FaExclamationTriangle className="error-icon" />
          <p>{error}</p>
          <Link to="/tim-gia-su" className="back-link">
            Quay lại trang tìm kiếm
          </Link>
        </div>
      </>
    );
  }

  if (!tutorData || !tutorData.tutorProfile) {
    // Thêm điều kiện này để phòng trường hợp tutorData có nhưng tutorProfile không có
    return (
      <>
        <div className="tutor-detail-page error-state">
          <p>
            Không có dữ liệu chi tiết hoặc dữ liệu không hợp lệ cho gia sư này.
          </p>
          <Link to="/tim-gia-su" className="back-link">
            Quay lại trang tìm kiếm
          </Link>
        </div>
      </>
    );
  }

  const profile = tutorData.tutorProfile;
  const avatar = profile.avatar || defaultAvatar;
  // Cải thiện việc lấy rankKey, xử lý trường hợp levelName có thể null hoặc không có trong tutorRanks
  let rankKey = "bronze"; // Mặc định
  if (profile.tutorLevel?.levelName) {
    const levelNameLower = profile.tutorLevel.levelName.toLowerCase();
    if (tutorRanks[levelNameLower.replace(/\s+/g, "")]) {
      // Xóa khoảng trắng nếu có (VD: "Bạch Kim" -> "bạchkim")
      rankKey = levelNameLower.replace(/\s+/g, "");
    } else if (tutorRanks[levelNameLower]) {
      rankKey = levelNameLower;
    }
  }
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

  // Logic xác định xem spinner của nút yêu thích có nên hiển thị không
  const isTogglingFavoriteInProgress =
    isActionLoading && // Chỉ khi isActionLoading là true
    (!bookingStatus || // Và không có booking nào đang được xử lý (PENDING, APPROVED, REJECTED)
      (bookingStatus !== "REQUEST" &&
        bookingStatus !== "APPROVED" &&
        bookingStatus !== "REJECTED"));

  return (
    <>
      <div className="tutor-detail-page">
        {error && tutorData && (
          <div className="detail-fetch-error-toast temporary-error">
            <FaExclamationTriangle /> {error}
          </div>
        )}
        <section className="detail-header">
          <div className="header-left">
            <img
              src={avatar}
              alt={`Ảnh đại diện của gia sư ${profile.fullname || "ẩn danh"}`}
              className="detail-avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultAvatar;
              }}
            />
            {isVerified && (
              <FaCheckCircle
                className="detail-verified-badge"
                title="Gia sư đã được xác thực"
              />
            )}
          </div>
          <div className="header-main">
            <h1 className="detail-name">
              {profile.fullname || "Gia sư"}
              {renderRankBadge(rankInfo)}
            </h1>
            <div className="detail-rating-fav">
              <div
                className="detail-rating"
                title={`Đánh giá: ${rating}/5 sao từ ${reviewCount} lượt`}
              >
                {renderStars(rating)}
                {rating > 0 && (
                  <span className="rating-value">{rating.toFixed(1)}</span>
                )}
                <span className="review-count">({reviewCount} đánh giá)</span>
              </div>
              {isLoggedIn && (
                <button
                  className={`favorite-btn detail-favorite-btn ${
                    isFavorite ? "favorite-active" : ""
                  } ${isTogglingFavoriteInProgress ? "loading" : ""}`}
                  onClick={handleToggleFavorite}
                  title={
                    isFavorite
                      ? "Bỏ yêu thích gia sư này"
                      : "Thêm gia sư này vào danh sách yêu thích"
                  }
                  disabled={isActionLoading}
                  aria-pressed={isFavorite}
                >
                  {isTogglingFavoriteInProgress ? (
                    <FaSpinner className="spinner-inline" spin />
                  ) : isFavorite ? (
                    <FaHeart />
                  ) : (
                    <FaRegHeart />
                  )}
                </button>
              )}
            </div>
            <p className="detail-basic-info">
              <FaGraduationCap className="info-icon" />{" "}
              {profile.tutorLevel?.levelName || "Chưa cập nhật trình độ"} -{" "}
              {profile.univercity || "Chưa cập nhật trường"}
            </p>
            <p className="detail-basic-info">
              <FaBook className="info-icon" /> Chuyên ngành:{" "}
              {profile.major?.majorName || "Chưa cập nhật"}
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
                  {isActionLoading && bookingStatus === "REQUEST" ? (
                    <FaSpinner className="spinner-inline" spin />
                  ) : null}{" "}
                  Hủy Yêu Cầu Thuê
                </button>
              )}
              {isApproved && (
                <span className="booking-status-indicator approved">
                  <FaCalendarCheck /> Đã Nhận Lịch Dạy
                </span>
              )}
              {isRejected && (
                <span className="booking-status-indicator rejected">
                  <FaExclamationTriangle /> Yêu Cầu Bị Từ Chối
                </span>
              )}
              {!isLoggedIn && (
                <button
                  className="action-btn hire-btn-login"
                  onClick={() => requireLogin("thuê gia sư")}
                >
                  Đăng Nhập để Thuê
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="detail-content">
          <div className="detail-section">
            <h3>Giới thiệu bản thân</h3>
            <p className="detail-description">
              {profile.description || "Gia sư chưa cập nhật giới thiệu."}
            </p>
          </div>

          <div className="detail-section two-columns">
            <div className="column">
              <h3>Thông tin cơ bản</h3>
              <ul className="info-list">
                <li>
                  <FaBirthdayCake className="info-icon" />
                  Ngày sinh: {formatBirthday(profile.birthday)}
                </li>
                <li>
                  <FaVenusMars className="info-icon" />
                  Giới tính:{" "}
                  {profile.gender === "MALE"
                    ? "Nam"
                    : profile.gender === "FEMALE"
                    ? "Nữ"
                    : "Chưa cập nhật"}
                </li>
                <li>
                  <FaUserGraduate className="info-icon" />
                  GPA: {profile.GPA || "Chưa cập nhật"}
                </li>
                {profile.evidenceOfGPA && (
                  <li>
                    <FaLink className="info-icon" />
                    <a
                      href={profile.evidenceOfGPA}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="evidence-link"
                      title="Xem minh chứng GPA (mở tab mới)"
                    >
                      Xem minh chứng GPA
                    </a>
                  </li>
                )}
              </ul>
            </div>
            <div className="column">
              <h3>Phương pháp & Địa điểm</h3>
              <ul className="info-list">
                <li>
                  <FaChalkboardTeacher className="info-icon" />
                  Phương pháp dạy:{" "}
                  {renderTeachingMethod(profile.teachingMethod)}
                </li>
                <li>
                  <FaMapMarkerAlt className="info-icon" />
                  Khu vực dạy: {profile.teachingPlace || "Chưa cập nhật"}
                </li>
                {formatTeachingTime(
                  profile.teachingTime ? parseFloat(profile.teachingTime) : null
                ) && (
                  <li>
                    <FaClock className="info-icon" />
                    Thời lượng mỗi buổi:{" "}
                    {formatTeachingTime(parseFloat(profile.teachingTime))}
                  </li>
                )}
                <li>
                  <FaCoins className="info-icon" />
                  Giá mỗi giờ:{" "}
                  <strong className="detail-price-inline">
                    {profile.coinPerHours
                      ? `${profile.coinPerHours.toLocaleString(
                          "vi-VN"
                        )} Coin/giờ`
                      : "Thỏa thuận"}
                  </strong>
                </li>
              </ul>
            </div>
          </div>

          <div className="detail-section">
            <h3>Kỹ năng & Môn dạy</h3>
            <ul className="info-list subjects-list">
              <li>
                <FaBook className="info-icon" />
                Môn chính:{" "}
                <strong>
                  {profile.subject?.subjectName || "Chưa cập nhật"}
                </strong>
                {profile.evidenceOfSubject && (
                  <a
                    href={profile.evidenceOfSubject}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="evidence-link"
                    title="Xem minh chứng môn học (mở tab mới)"
                  >
                    (Minh chứng)
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
                      rel="noopener noreferrer"
                      className="evidence-link"
                      title="Xem minh chứng môn học (mở tab mới)"
                    >
                      (Minh chứng)
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
                      rel="noopener noreferrer"
                      className="evidence-link"
                      title="Xem minh chứng môn học (mở tab mới)"
                    >
                      (Minh chứng)
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
            <h3>Lịch dạy có thể đáp ứng</h3>
            {renderSchedule(profile.dateTimeLearn)}
          </div>

          {profile.videoUrl && (
            <div className="detail-section">
              <h3>Video giới thiệu</h3>
              <YoutubeEmbed
                videoUrl={profile.videoUrl}
                title={`Video giới thiệu của gia sư ${
                  profile.fullname || "ẩn danh"
                }`}
              />
            </div>
          )}
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
    </>
  );
};

export default TutorDetailPage;
