import { useState, useEffect, useCallback, memo } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
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
  FaCalendarPlus,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "../../assets/css/TutorDetailPage.style.css";
import BookingModal from "../../components/User/BookingModal";
import YoutubeEmbed from "../../components/User/YoutubeEmbed";
import AcceptedRequestsModal from "../../components/User/AcceptedRequestsModal";

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
const formatTeachingTime = (hours) => {
  if (hours === null || isNaN(hours) || hours <= 0) return null;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  let r = `${h} giờ`;
  if (m > 0) r += ` ${m} phút`;
  return r;
};
const renderStars = (rating) => {
  const s = [];
  const fS = Math.floor(rating);
  for (let i = 0; i < 5; i++) {
    if (i < fS) s.push(<FaStar key={`f-${i}`} className="star-icon filled" />);
    else s.push(<FaStar key={`e-${i}`} className="star-icon empty" />);
  }
  return s;
};
const renderRankBadge = (d) => {
  if (!d) return null;
  return (
    <span
      className="tutor-rank-badge detail-rank-badge"
      style={{ color: d.color }}
      title={`Hạng: ${d.name}`}
    >
      {d.icon || <PiMedalThin />}
    </span>
  );
};
const renderTeachingMethod = (m) => {
  switch (m) {
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
const formatBirthday = (dS) => {
  if (!dS) return "Chưa cập nhật";
  try {
    const d = new Date(dS);
    if (isNaN(d.getTime())) return "Ngày không hợp lệ";
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    return "Ngày không hợp lệ";
  }
};
const renderSchedule = (dL) => {
  if (!dL || !Array.isArray(dL) || dL.length === 0)
    return <p>Gia sư chưa cập nhật lịch dạy.</p>;
  const labels = {
    Monday: "Thứ Hai",
    Tuesday: "Thứ Ba",
    Wednesday: "Thứ Tư",
    Thursday: "Thứ Năm",
    Friday: "Thứ Sáu",
    Saturday: "Thứ Bảy",
    Sunday: "Chủ Nhật",
  };
  try {
    const pS = dL
      .map((iS) => {
        try {
          let i = typeof iS === "string" ? JSON.parse(iS) : iS;
          return i && i.day && labels[i.day] && Array.isArray(i.times)
            ? i
            : null;
        } catch (pE) {
          return null;
        }
      })
      .filter((i) => i !== null);
    if (pS.length === 0) return <p>Lịch dạy không hợp lệ.</p>;
    const dO = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 7,
    };
    pS.sort((a, b) => dO[a.day] - dO[b.day]);
    return (
      <ul className="schedule-list">
        {pS.map((i) => (
          <li key={i.day}>
            <strong>{labels[i.day]}:</strong>{" "}
            {i.times.length > 0
              ? i.times.sort().join(", ")
              : "Không có khung giờ"}
          </li>
        ))}
      </ul>
    );
  } catch (e) {
    return <p>Lỗi hiển thị lịch.</p>;
  }
};
// --- END HELPER ---

const TutorDetailPage = () => {
  const { userId: tutorIdFromParams } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useSelector((state) => !!state.user.userProfile?.userId);

  const [tutorData, setTutorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAcceptedRequestsModalOpen, setIsAcceptedRequestsModalOpen] =
    useState(false);

  const [bookingOverallInfo, setBookingOverallInfo] = useState({
    apiIsTutorAcceptingRequest: null,
    detailedStatus: null,
    bookingId: null,
  });

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
    setBookingOverallInfo({
      apiIsTutorAcceptingRequest: null,
      detailedStatus: null,
      bookingId: null,
    });
    const baseEndpoint = isLoggedIn
      ? "/user/get-list-tutor-public"
      : "/user/get-list-tutor-public-without-login";
    const filterParam = JSON.stringify([
      {
        key: "tutorProfile.userId",
        operator: "equal",
        value: tutorIdFromParams,
      },
    ]);
    const queryParams = { filter: filterParam, page: 1, rpp: 1 };
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
          let resApiIsTutorAccepting = null;
          let resDetailedStatus = null;
          let resBookingId = null;
          if (isLoggedIn) {
            if (typeof profile.isBookingRequestAccepted === "boolean")
              resApiIsTutorAccepting = profile.isBookingRequestAccepted;

            // Xác định detailedStatus và bookingId dựa trên thông tin API chính
            // Kể cả khi apiIsTutorAcceptingRequest là true, chúng ta vẫn có thể có detailedStatus là REQUEST hoặc HIRED, v.v.
            // từ một booking khác với gia sư này.
            if (profile.bookingRequest && profile.bookingRequest.status) {
              resDetailedStatus = profile.bookingRequest.status.toUpperCase();
              resBookingId =
                profile.bookingRequest.bookingRequestId ||
                profile.bookingRequestId;
            } else if (
              profile.isBookingRequest === true &&
              (profile.bookingRequestId ||
                profile.bookingRequest?.bookingRequestId)
            ) {
              resDetailedStatus = "REQUEST";
              resBookingId =
                profile.bookingRequestId ||
                profile.bookingRequest?.bookingRequestId;
            }
            // bookingId chính có thể được lấy từ đây nếu không có trong bookingRequest
            if (!resBookingId) resBookingId = profile.bookingRequestId || null;
          }
          setBookingOverallInfo({
            apiIsTutorAcceptingRequest: resApiIsTutorAccepting,
            detailedStatus: resDetailedStatus,
            bookingId: resBookingId,
          });
          if (isLoggedIn && profile)
            setIsFavorite(profile.isMyFavouriteTutor || false);
        } else {
          setError(`KTD TT GS ID: ${tutorIdFromParams}.`);
          setTutorData(null);
        }
      } else {
        setError(`KTD GS ID: ${tutorIdFromParams}.`);
        setTutorData(null);
      }
    } catch (err) {
      console.error(`Lỗi tải CTGS (ID: ${tutorIdFromParams}):`, err);
      setError("Lỗi tải TT CT. Thử lại.");
      setTutorData(null);
    } finally {
      setIsLoading(false);
    }
  }, [tutorIdFromParams, isLoggedIn]);

  useEffect(() => {
    if (tutorIdFromParams) fetchTutorDetail();
    else {
      setIsLoading(false);
      setError("Không có ID gia sư.");
    }
    window.scrollTo(0, 0);
  }, [tutorIdFromParams, fetchTutorDetail]);

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      requireLogin("thêm vào yêu thích");
      return;
    }
    if (!tutorData?.userId || isActionLoading) return;
    setIsActionLoading(true);
    const nFS = !isFavorite;
    try {
      const m = nFS ? METHOD_TYPE.POST : METHOD_TYPE.DELETE;
      const eP = nFS ? `/my-tutor/add` : `/my-tutor/remove/${tutorData.userId}`;
      await Api({
        endpoint: eP,
        method: m,
        ...(m === METHOD_TYPE.POST && { data: { tutorId: tutorData.userId } }),
        requireToken: true,
      });
      setIsFavorite(nFS);
      toast.success(
        `Đã ${nFS ? "thêm" : "bỏ"} ${tutorData.tutorProfile.fullname || "GS"} ${
          nFS ? "vào" : "khỏi"
        } Y.Thích!`
      );
    } catch (err) {
      toast.error(`Lỗi ${nFS ? "thêm" : "bỏ"} Y.Thích.`);
    } finally {
      setIsActionLoading(false);
    }
  };
  const handleOpenBookingModal = () => {
    if (!isLoggedIn) {
      requireLogin("gửi yêu cầu thuê");
      return;
    }
    if (tutorData && tutorData.tutorProfile) setIsBookingModalOpen(true);
    else toast.error("Lỗi TT GS.");
  };
  const handleCloseBookingModal = useCallback(
    () => setIsBookingModalOpen(false),
    []
  );
  const handleBookingSuccess = useCallback(() => {
    handleCloseBookingModal();
    toast.success("Đã gửi YC thuê!");
    fetchTutorDetail();
  }, [fetchTutorDetail, handleCloseBookingModal]);

  const handleOpenAcceptedRequestsModal = () => {
    if (!isLoggedIn) {
      requireLogin("xem YC đã duyệt");
      return;
    }
    setIsAcceptedRequestsModalOpen(true);
  };
  const handleCloseAcceptedRequestsModal = () =>
    setIsAcceptedRequestsModalOpen(false);
  const handleActionSuccessFromAcceptedModal = () => {
    fetchTutorDetail();
    setIsAcceptedRequestsModalOpen(false);
  };

  const handleCancelRequest = async () => {
    if (
      !isLoggedIn ||
      !bookingOverallInfo.bookingId ||
      isActionLoading ||
      bookingOverallInfo.detailedStatus !== "REQUEST"
    )
      return;
    if (
      !window.confirm(
        `Hủy yêu cầu thuê gia sư ${tutorData?.tutorProfile?.fullname || "này"}?`
      )
    )
      return;
    setIsActionLoading(true);
    try {
      await Api({
        endpoint: `booking-request/cancel-booking/${bookingOverallInfo.bookingId}`,
        method: METHOD_TYPE.PATCH,
        data: { click: "CANCEL" },
        requireToken: true,
      });
      toast.success("Đã hủy yêu cầu.");
      fetchTutorDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi hủy YC.");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading && !tutorData)
    return (
      <div className="tutor-detail-page loading-state">
        <FaSpinner className="spinner" spin />
        <p>Đang tải...</p>
      </div>
    );
  if (error && !tutorData)
    return (
      <div className="tutor-detail-page error-state">
        <FaExclamationTriangle className="error-icon" />
        <p>{error}</p>
        <Link to="/tim-gia-su" className="back-link">
          Quay lại
        </Link>
      </div>
    );
  if (!tutorData || !tutorData.tutorProfile)
    return (
      <div className="tutor-detail-page error-state">
        <p>Không có dữ liệu.</p>
        <Link to="/tim-gia-su" className="back-link">
          Quay lại
        </Link>
      </div>
    );

  const profile = tutorData.tutorProfile;
  const avatar = profile.avatar || defaultAvatar;
  const rating = profile.rating ? parseFloat(profile.rating) : 0;
  const reviewCount = profile.numberOfRating || 0;
  const isVerified =
    tutorData.checkActive === "ACTIVE" && profile.isPublicProfile === true;
  let rK = "bronze";
  if (profile.tutorLevel?.levelName) {
    const lNL = profile.tutorLevel.levelName.toLowerCase().replace(/\s+/g, "");
    if (tutorRanks[lNL]) rK = lNL;
  }
  const rI = tutorRanks[rK];

  const showViewAcceptedBtn =
    isLoggedIn && bookingOverallInfo.apiIsTutorAcceptingRequest === true;
  const showNoAcceptedMsg =
    isLoggedIn && bookingOverallInfo.apiIsTutorAcceptingRequest === false;
  // Nút Gửi Yêu Cầu Mới hiển thị độc lập với showViewAcceptedBtn
  const canSendNewReq =
    isLoggedIn &&
    (!bookingOverallInfo.detailedStatus ||
      ["REFUSE", "CANCEL", "COMPLETED"].includes(
        bookingOverallInfo.detailedStatus
      ));
  const showPendingApproval =
    isLoggedIn &&
    bookingOverallInfo.detailedStatus === "REQUEST" &&
    bookingOverallInfo.bookingId;
  const showHiredMsg =
    isLoggedIn && bookingOverallInfo.detailedStatus === "HIRED";
  const showRefusedMsg =
    isLoggedIn && bookingOverallInfo.detailedStatus === "REFUSE";
  const showCancelledMsg =
    isLoggedIn && bookingOverallInfo.detailedStatus === "CANCEL";
  const isProcessingAnyAction = isActionLoading; // Sử dụng chung cho các nút chính

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
              alt={`Ảnh ${profile.fullname}`}
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
            <h1 className="detail-name">
              {profile.fullname || "Gia Sư"}
              {renderRankBadge(rI)}
            </h1>
            <div className="detail-rating-fav">
              <div
                className="detail-rating"
                title={`ĐG: ${rating.toFixed(1)}/5 (${reviewCount} lượt)`}
              >
                {renderStars(rating)}
                {rating > 0 && (
                  <span className="rating-value">{rating.toFixed(1)}</span>
                )}
                <span className="review-count">({reviewCount} ĐG)</span>
              </div>
              {isLoggedIn && (
                <button
                  className={`favorite-btn dfb ${isFavorite ? "active" : ""} ${
                    isProcessingAnyAction ? "loading" : ""
                  }`}
                  onClick={handleToggleFavorite}
                  disabled={isProcessingAnyAction}
                  aria-pressed={isFavorite}
                >
                  {isProcessingAnyAction ? (
                    <FaSpinner spin />
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
              {profile.tutorLevel?.levelName || "N/A"} -{" "}
              {profile.univercity || "N/A"}
            </p>
            <p className="detail-basic-info">
              <FaBook className="info-icon" /> CN:{" "}
              {profile.major?.majorName || "N/A"}
            </p>
            <div className="header-actions">
              {showViewAcceptedBtn && (
                <button
                  className="action-btn primary-action view-accepted-btn"
                  onClick={handleOpenAcceptedRequestsModal}
                  disabled={isProcessingAnyAction}
                >
                  <FaCalendarCheck /> Xem Yêu Cầu Đã Duyệt
                </button>
              )}

              {/* Thông báo "Chưa có yêu cầu được chấp nhận" chỉ hiển thị nếu không có nút "Xem YC Duyệt" */}
              {showNoAcceptedMsg && !showViewAcceptedBtn && (
                <span className="booking-status-indicator info disabled-look">
                  <FaInfoCircle /> Chưa có yêu cầu được chấp nhận
                </span>
              )}

              {canSendNewReq && (
                <button
                  className="action-btn primary-action request-new-btn"
                  onClick={handleOpenBookingModal}
                  disabled={isProcessingAnyAction}
                >
                  <FaCalendarPlus /> Gửi Yêu Cầu Mới
                </button>
              )}

              {showPendingApproval && (
                <div className="status-with-action">
                  <span className="booking-status-indicator pending">
                    <FaClock /> Đang chờ gia sư duyệt...
                  </span>
                  <button
                    className="action-btn cancel-action"
                    onClick={handleCancelRequest}
                    disabled={isProcessingAnyAction}
                  >
                    {isProcessingAnyAction ? <FaSpinner spin /> : <FaTimes />}{" "}
                    Hủy Yêu Cầu
                  </button>
                </div>
              )}

              {showHiredMsg && (
                <span className="booking-status-indicator hired">
                  <FaCheckCircle /> Đang học
                </span>
              )}
              {showRefusedMsg && (
                <span className="booking-status-indicator rejected">
                  <FaExclamationTriangle /> Yêu cầu bị từ chối
                </span>
              )}
              {showCancelledMsg && (
                <span className="booking-status-indicator cancelled">
                  <FaExclamationTriangle /> Bạn đã hủy yêu cầu
                </span>
              )}

              {!isLoggedIn && (
                <button
                  className="action-btn primary-action login-btn"
                  onClick={() => requireLogin("tương tác với gia sư")}
                >
                  <FaCalendarPlus /> Đăng Nhập
                </button>
              )}
            </div>
          </div>
        </section>
        <section className="detail-content">
          <div className="detail-section">
            <h3>Giới thiệu bản thân</h3>
            <p className="detail-description">
              {profile.description || "Chưa có thông tin."}
            </p>
          </div>
          <div className="detail-section two-columns">
            <div className="column">
              <h3>Thông tin Cơ Bản</h3>
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
                    : "N/A"}
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
                      className="evidence-link"
                    >
                      Xem MC GPA
                    </a>
                  </li>
                )}
              </ul>
            </div>
            <div className="column">
              <h3>Phương pháp & Địa Điểm</h3>
              <ul className="info-list">
                <li>
                  <FaChalkboardTeacher className="info-icon" />
                  PP: {renderTeachingMethod(profile.teachingMethod)}
                </li>
                <li>
                  <FaMapMarkerAlt className="info-icon" />
                  KV: {profile.teachingPlace || "N/A"}
                </li>
                {formatTeachingTime(
                  profile.teachingTime ? parseFloat(profile.teachingTime) : null
                ) && (
                  <li>
                    <FaClock className="info-icon" />
                    TL: {formatTeachingTime(parseFloat(profile.teachingTime))}
                  </li>
                )}
                <li>
                  <FaCoins className="info-icon" />
                  Giá:{" "}
                  <strong className="detail-price-inline">
                    {profile.coinPerHours
                      ? `${profile.coinPerHours.toLocaleString("vi-VN")} Xu/giờ`
                      : "Thỏa thuận"}
                  </strong>
                </li>
              </ul>
            </div>
          </div>
          <div className="detail-section">
            <h3>Kỹ Năng & Môn Dạy</h3>
            <ul className="info-list subjects-list">
              <li>
                <FaBook className="info-icon" />
                Môn chính:{" "}
                <strong>{profile.subject?.subjectName || "N/A"}</strong>{" "}
                {profile.evidenceOfSubject && (
                  <a
                    href={profile.evidenceOfSubject}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="evidence-link"
                  >
                    (MC)
                  </a>
                )}{" "}
                {profile.descriptionOfSubject && (
                  <p className="subject-desc">
                    <em>{profile.descriptionOfSubject}</em>
                  </p>
                )}
              </li>
              {profile.subjectId2 && profile.subject2?.subjectName && (
                <li>
                  <FaBook className="info-icon" />
                  Môn 2: <strong>{profile.subject2.subjectName}</strong>{" "}
                  {profile.evidenceOfSubject2 && (
                    <a
                      href={profile.evidenceOfSubject2}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="evidence-link"
                    >
                      (MC)
                    </a>
                  )}{" "}
                  {profile.descriptionOfSubject2 && (
                    <p className="subject-desc">
                      <em>{profile.descriptionOfSubject2}</em>
                    </p>
                  )}
                </li>
              )}
              {profile.subjectId3 && profile.subject3?.subjectName && (
                <li>
                  <FaBook className="info-icon" />
                  Môn 3: <strong>{profile.subject3.subjectName}</strong>{" "}
                  {profile.evidenceOfSubject3 && (
                    <a
                      href={profile.evidenceOfSubject3}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="evidence-link"
                    >
                      (MC)
                    </a>
                  )}{" "}
                  {profile.descriptionOfSubject3 && (
                    <p className="subject-desc">
                      <em>{profile.descriptionOfSubject3}</em>
                    </p>
                  )}
                </li>
              )}
            </ul>
          </div>
          <div className="detail-section">
            <h3>Lịch Dạy Có Thể Đáp Ứng</h3>
            {renderSchedule(profile.dateTimeLearn)}
          </div>
          {profile.videoUrl && (
            <div className="detail-section">
              <h3>Video Giới Thiệu</h3>
              <YoutubeEmbed
                videoUrl={profile.videoUrl}
                title={`Video của ${profile.fullname || "Gia Sư"}`}
              />
            </div>
          )}
        </section>
        {isLoggedIn && tutorData && profile && (
          <BookingModal
            isOpen={isBookingModalOpen}
            onClose={handleCloseBookingModal}
            tutorId={tutorData.userId}
            tutorName={profile.fullname || "Gia Sư"}
            onBookingSuccess={handleBookingSuccess}
            maxHoursPerLesson={
              profile.teachingTime ? parseFloat(profile.teachingTime) : null
            }
            availableScheduleRaw={profile.dateTimeLearn || []}
          />
        )}
        {isLoggedIn && tutorData && profile && (
          <AcceptedRequestsModal
            isOpen={isAcceptedRequestsModalOpen}
            onClose={handleCloseAcceptedRequestsModal}
            tutorId={profile.userId}
            tutorName={profile.fullname || "Gia Sư"}
            onActionSuccess={handleActionSuccessFromAcceptedModal}
          />
        )}
      </div>
    </>
  );
};
export default memo(TutorDetailPage);
