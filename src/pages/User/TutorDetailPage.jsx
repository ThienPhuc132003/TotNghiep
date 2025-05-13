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
  if (minutes > 0) {
    result += ` ${minutes} phút`;
  }
  return result;
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
    if (isNaN(date.getTime())) {
      return "Ngày không hợp lệ";
    }
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
  ) {
    return <p>Chưa cập nhật lịch dạy.</p>;
  }
  const dayLabels = {
    Monday: "Thứ 2",
    Tuesday: "Thứ 3",
    Wednesday: "Thứ 4",
    Thursday: "Thứ 5",
    Friday: "Thứ 6",
    Saturday: "Thứ 7",
    Sunday: "CN",
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
          // Trả về item chỉ khi hợp lệ
          return item &&
            item.day &&
            dayLabels[item.day] &&
            Array.isArray(item.times)
            ? item
            : null;
        } catch (parseError) {
          console.error("Lỗi parse một mục lịch học:", itemString, parseError);
          return null;
        }
      })
      .filter((item) => item !== null); // Lọc các item null

    if (parsedSchedule.length === 0) {
      return <p>Lịch dạy có định dạng không hợp lệ hoặc chưa cập nhật.</p>;
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
              : "Không có giờ cụ thể"}
          </li>
        ))}
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
  const [bookingId, setBookingId] = useState(null); // Sẽ lưu bookingRequestId
  const [isActionLoading, setIsActionLoading] = useState(false); // Loading chung cho Yêu thích, Hủy
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
    // Không reset tutorData để tránh màn hình trắng khi đang action
    // setTutorData(null);
    setIsFavorite(false);
    setBookingStatus(null);
    setBookingId(null);

    const endpoint = isLoggedIn
      ? "user/get-list-tutor-public"
      : "user/get-list-tutor-public-without-login";

    const filterParams = [{ key: "userId", operator: "equal", value: userId }];

    try {
      const response = await Api({
        endpoint: endpoint,
        method: METHOD_TYPE.GET,
        query: {
          filter: filterParams,
          page: 1,
          rpp: 1,
        },
        requireToken: isLoggedIn,
      });

      if (response?.data?.items && response.data.items.length > 0) {
        const fetchedTutor = response.data.items[0];

        if (!fetchedTutor.userId || !fetchedTutor.tutorProfile) {
          throw new Error("Dữ liệu gia sư trả về không hợp lệ.");
        }

        setTutorData(fetchedTutor); // Cập nhật data mới

        if (isLoggedIn && fetchedTutor.tutorProfile) {
          setIsFavorite(fetchedTutor.tutorProfile.isMyFavouriteTutor || false);

          const bookingInfo = fetchedTutor.tutorProfile.bookingRequest;
          if (bookingInfo && typeof bookingInfo === "object") {
            setBookingStatus(bookingInfo.status);
            // Lấy bookingRequestId từ API mẫu
            setBookingId(bookingInfo.bookingRequestId);
          } else {
            // Nếu bookingRequest là null hoặc không phải object, reset state
            setBookingStatus(null);
            setBookingId(null);
          }
        } else {
          // Nếu không đăng nhập, cũng reset state booking
          setBookingStatus(null);
          setBookingId(null);
        }
      } else {
        setError(`Không tìm thấy thông tin gia sư với ID: ${userId}`);
        setTutorData(null); // Nếu không tìm thấy thì mới reset data
      }
    } catch (err) {
      console.error(`Lỗi tải chi tiết gia sư từ ${endpoint}:`, err);
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403) &&
        isLoggedIn
      ) {
        setError(
          "Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại."
        );
      } else if (err.message === "Dữ liệu gia sư trả về không hợp lệ.") {
        setError("Không thể xử lý dữ liệu gia sư nhận được.");
      } else {
        setError("Không thể tải thông tin gia sư. Vui lòng thử lại.");
      }
      setTutorData(null); // Reset data khi có lỗi nghiêm trọng
    } finally {
      setIsLoading(false);
    }
  }, [userId, isLoggedIn]);

  useEffect(() => {
    if (userId) {
      fetchTutorDetail();
    } else {
      setError("Không có ID gia sư được cung cấp trong URL.");
      setIsLoading(false);
    }
  }, [userId, isLoggedIn, fetchTutorDetail]); // Thêm fetchTutorDetail vào dependencies

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      requireLogin("thêm gia sư vào danh sách yêu thích");
      return;
    }
    if (!tutorData?.userId || isActionLoading) return;

    const currentFavoriteStatus = isFavorite;
    setIsActionLoading(true); // Bắt đầu loading
    setIsFavorite(!currentFavoriteStatus); // Optimistic update

    try {
      const method = currentFavoriteStatus
        ? METHOD_TYPE.DELETE
        : METHOD_TYPE.POST;
      const endpoint = currentFavoriteStatus
        ? `my-tutor/remove/${tutorData.userId}`
        : `my-tutor/add`;

      await Api({
        endpoint: endpoint,
        method: method,
        ...(method === METHOD_TYPE.POST && {
          body: { tutorId: tutorData.userId },
        }),
        requireToken: true,
      });

      toast.success(
        `Đã ${
          !currentFavoriteStatus ? "thêm vào" : "xóa khỏi"
        } danh sách yêu thích!`
      );
      // Không cần fetch lại detail, chỉ cập nhật state isFavorite
    } catch (err) {
      console.error("Lỗi cập nhật yêu thích:", err);
      toast.error("Có lỗi xảy ra, không thể cập nhật trạng thái yêu thích.");
      setIsFavorite(currentFavoriteStatus); // Rollback UI
    } finally {
      setIsActionLoading(false); // Kết thúc loading
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
      toast.error("Không đủ thông tin gia sư để đặt lịch.");
    }
  };

  const handleCloseBookingModal = useCallback(() => {
    setIsBookingModalOpen(false);
  }, []);

  const handleBookingSuccess = useCallback(
    () => {
      handleCloseBookingModal();
      toast.success("Yêu cầu thuê gia sư đã được gửi thành công!");
      fetchTutorDetail(); // Fetch lại để cập nhật trạng thái booking
    },
    [fetchTutorDetail, handleCloseBookingModal]
  );

  // --- Hủy Yêu cầu Thuê - ĐÃ CẬP NHẬT ENDPOINT VÀ METHOD ---
  const handleCancelBooking = async () => {
    if (!isLoggedIn || !bookingId || isActionLoading) return;

    const confirmCancel = window.confirm(
      "Bạn có chắc chắn muốn hủy yêu cầu thuê gia sư này?"
    );
    if (!confirmCancel) return;

    setIsActionLoading(true); // Bắt đầu loading

    try {
      const endpoint = `booking-request/cancel-booking/${bookingId}`; // bookingId là bookingRequestId
      await Api({
        endpoint: endpoint,
        method: METHOD_TYPE.PATCH, // Sử dụng PATCH
        requireToken: true,
        // body: {} // Có thể cần body rỗng hoặc không tùy backend
      });
      toast.success("Đã hủy yêu cầu thuê gia sư thành công.");
      // Fetch lại dữ liệu chi tiết để cập nhật trạng thái (bookingStatus sẽ về null)
      fetchTutorDetail();
    } catch (err) {
      console.error("Lỗi hủy yêu cầu thuê:", err);
      const errorMsg =
        err.response?.data?.message ||
        "Có lỗi xảy ra, không thể hủy yêu cầu thuê.";
      toast.error(errorMsg);
    } finally {
      setIsActionLoading(false); // Kết thúc loading
    }
  };

  // --- Rendering ---

  if (isLoading && !tutorData) {
    // Chỉ hiện loading toàn trang khi chưa có data cũ
    return (
      <HomePageLayout>
        <div className="tutor-detail-page loading-state">
          <FaSpinner className="spinner" />
          <p>Đang tải thông tin gia sư...</p>
        </div>
      </HomePageLayout>
    );
  }

  if (error && !tutorData) {
    // Chỉ hiện lỗi toàn trang khi chưa có data cũ
    return (
      <HomePageLayout>
        <div className="tutor-detail-page error-state">
          <FaExclamationTriangle className="error-icon" />
          <p>{error}</p>
          <Link to="/tim-gia-su" className="back-link">
            Quay lại trang tìm kiếm
          </Link>
        </div>
      </HomePageLayout>
    );
  }

  // Nếu có lỗi nhưng vẫn còn data cũ thì hiển thị data cũ và thông báo lỗi nhỏ? (Tùy UX mong muốn)
  // Hoặc nếu không tìm thấy data
  if (!tutorData) {
    return (
      <HomePageLayout>
        <div className="tutor-detail-page error-state">
          <p>Không tìm thấy dữ liệu hoặc dữ liệu gia sư không hợp lệ.</p>
          <Link to="/tim-gia-su" className="back-link">
            Quay lại trang tìm kiếm
          </Link>
        </div>
      </HomePageLayout>
    );
  }

  // Đã có tutorData, tiến hành render
  const profile = tutorData.tutorProfile;
  const avatar = profile.avatar || defaultAvatar;
  // Xử lý rank key an toàn hơn
  const rankKey =
    (profile.tutorLevel?.levelName || "").toLowerCase() || "bronze";
  const rankInfo = tutorRanks[rankKey] || tutorRanks.bronze;
  const rating = profile.averageRating
    ? parseFloat(profile.averageRating.toFixed(1))
    : 0;
  const reviewCount = profile.totalReviews || 0;
  const isVerified =
    tutorData.checkActive === "ACTIVE" && profile.isPublicProfile === true;

  // Xác định trạng thái nút dựa trên state đã được cập nhật sau fetch
  const canHire = isLoggedIn && bookingStatus === null;
  const canCancel = isLoggedIn && bookingStatus === "REQUEST";
  const isApproved = isLoggedIn && bookingStatus === "APPROVED";
  const isRejected = isLoggedIn && bookingStatus === "REJECTED"; // Thêm trạng thái bị từ chối nếu API có

  return (
    <HomePageLayout>
      <div className="tutor-detail-page">
        {/* Hiển thị lỗi nhỏ nếu fetch lại bị lỗi nhưng vẫn có data cũ */}
        {error && (
          <div className="detail-fetch-error-toast">
            <FaExclamationTriangle /> {error}
          </div>
        )}
        <section className="detail-header">
          <div className="header-left">
            <img
              src={avatar}
              alt={`Ảnh ${profile.fullname || "gia sư"}`}
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
              {profile.fullname || "Gia sư"} {renderRankBadge(rankInfo)}
            </h2>
            <div className="detail-rating-fav">
              <div className="detail-rating">
                {renderStars(rating)}
                {rating > 0 && <span className="rating-value">{rating}</span>}
                <span className="review-count">({reviewCount} đánh giá)</span>
              </div>
              <button
                className={`favorite-btn detail-favorite-btn ${
                  isFavorite ? "favorite-active" : ""
                }`}
                onClick={handleToggleFavorite}
                title={
                  isLoggedIn
                    ? isFavorite
                      ? "Bỏ yêu thích"
                      : "Yêu thích"
                    : "Đăng nhập để yêu thích"
                }
                // Disable nút yêu thích khi đang hủy booking và ngược lại
                disabled={isActionLoading}
              >
                {/* Hiển thị spinner nếu đang action (chung cho yêu thích/hủy) */}
                {isActionLoading && isFavorite ? (
                  <FaSpinner className="spinner-inline" />
                ) : isActionLoading && !isFavorite ? (
                  <FaSpinner className="spinner-inline" />
                ) : isFavorite ? (
                  <FaHeart />
                ) : (
                  <FaRegHeart />
                )}
              </button>
            </div>
            <p className="detail-basic-info">
              <FaGraduationCap />{" "}
              {profile.tutorLevel?.levelName || "Chưa cập nhật"} -{" "}
              {profile.univercity || "Chưa cập nhật trường"}
            </p>
            <p className="detail-basic-info">
              <FaBook /> Chuyên ngành:{" "}
              {profile.major?.majorName || "Chưa cập nhật"}
            </p>

            <div className="header-actions">
              {/* Nút Thuê */}
              {canHire && (
                <button
                  className="action-btn hire-btn"
                  onClick={handleOpenBookingModal}
                  disabled={isActionLoading} // Disable khi action khác đang chạy
                >
                  Thuê Gia Sư
                </button>
              )}
              {/* Nút Hủy Yêu Cầu */}
              {canCancel && (
                <button
                  className="action-btn cancel-btn"
                  onClick={handleCancelBooking}
                  disabled={isActionLoading} // Disable khi action khác đang chạy
                >
                  {/* Hiển thị spinner nếu đang action (chung) */}
                  {isActionLoading ? (
                    <FaSpinner className="spinner-inline" />
                  ) : null}{" "}
                  Hủy Yêu Cầu
                </button>
              )}
              {/* Trạng thái Đã Nhận Lịch */}
              {isApproved && (
                <span className="booking-status-indicator approved">
                  <FaCalendarCheck /> Đã nhận lịch
                  {/* Có thể thêm nút xem chi tiết lịch học đã book */}
                </span>
              )}
              {/* Trạng thái Bị Từ Chối */}
              {isRejected && (
                <span className="booking-status-indicator rejected">
                  <FaExclamationTriangle /> Yêu cầu bị từ chối
                  {/* Có thể cho phép gửi lại yêu cầu? Hoặc chỉ thông báo */}
                </span>
              )}
              {/* Nút Đăng nhập để Thuê */}
              {!isLoggedIn && (
                <button
                  className="action-btn hire-btn-login"
                  onClick={() => requireLogin("thuê gia sư")}
                >
                  Đăng nhập để Thuê
                </button>
              )}
            </div>
          </div>
        </section>

        {/* --- Phần nội dung chi tiết (giữ nguyên) --- */}
        <section className="detail-content">
          {/* ... Giới thiệu, Thông tin cơ bản, Kỹ năng, Phương pháp, Lịch dạy, Video, Giá ... */}
          <div className="detail-section">
            <h3>Giới thiệu bản thân</h3>
            <p className="detail-description">
              {profile.description || "Gia sư chưa cập nhật giới thiệu."}
            </p>
          </div>
          <div className="detail-section">
            <h3>Thông tin cơ bản</h3>
            <ul className="info-list">
              <li>
                <FaBirthdayCake className="info-icon" /> Ngày sinh:{" "}
                {formatBirthday(profile.birthday)}
              </li>
              <li>
                <FaVenusMars className="info-icon" /> Giới tính:{" "}
                {profile.gender === "MALE"
                  ? "Nam"
                  : profile.gender === "FEMALE"
                  ? "Nữ"
                  : "Khác"}
              </li>
              <li>
                <FaUserGraduate className="info-icon" /> GPA:{" "}
                {profile.GPA || "Chưa cập nhật"}
              </li>
              {profile.evidenceOfGPA && (
                <li>
                  <FaLink className="info-icon" />{" "}
                  <a
                    href={profile.evidenceOfGPA}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Xem minh chứng GPA
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div className="detail-section">
            <h3>Kỹ năng & Môn dạy</h3>
            <ul className="info-list">
              <li>
                <FaBook className="info-icon" /> Môn dạy chính:{" "}
                <strong>
                  {profile.subject?.subjectName || "Chưa cập nhật"}
                </strong>
                {profile.evidenceOfSubject && (
                  <a
                    href={profile.evidenceOfSubject}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="evidence-link"
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
                  <FaBook className="info-icon" /> Môn dạy 2:{" "}
                  <strong> {profile.subject2.subjectName}</strong>
                  {profile.evidenceOfSubject2 && (
                    <a
                      href={profile.evidenceOfSubject2}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="evidence-link"
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
                  <FaBook className="info-icon" /> Môn dạy 3:{" "}
                  <strong> {profile.subject3.subjectName}</strong>
                  {profile.evidenceOfSubject3 && (
                    <a
                      href={profile.evidenceOfSubject3}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="evidence-link"
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
            <h3>Phương pháp & Địa điểm</h3>
            <ul className="info-list">
              <li>
                <FaChalkboardTeacher className="info-icon" /> Phương pháp dạy:{" "}
                {renderTeachingMethod(profile.teachingMethod)}
              </li>
              <li>
                <FaMapMarkerAlt className="info-icon" /> Khu vực dạy:{" "}
                {profile.teachingPlace || "Chưa cập nhật"}
              </li>
              {/* Parse teachingTime từ chuỗi sang số trước khi dùng formatTeachingTime */}
              {formatTeachingTime(
                profile.teachingTime ? parseFloat(profile.teachingTime) : null
              ) && (
                <li>
                  <FaClock className="info-icon" /> Thời lượng tối đa / buổi:{" "}
                  {formatTeachingTime(parseFloat(profile.teachingTime))}
                </li>
              )}
            </ul>
          </div>
          <div className="detail-section">
            <h3>Lịch dạy có thể nhận</h3>
            {renderSchedule(profile.dateTimeLearn)}
          </div>
          {profile.videoUrl && (
            <div className="detail-section">
              <h3>Video giới thiệu</h3>
              <YoutubeEmbed
                videoUrl={profile.videoUrl}
                title={`Video giới thiệu của ${profile.fullname || "gia sư"}`}
              />
            </div>
          )}
          <div className="detail-section">
            <h3>Giá / giờ học</h3>
            <p className="detail-price">
              <FaCoins />{" "}
              {profile.coinPerHours
                ? `${profile.coinPerHours.toLocaleString("vi-VN")} Coin / giờ`
                : "Thỏa thuận"}
            </p>
          </div>
        </section>

        {/* Booking Modal */}
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
