// src/pages/User/TutorDetailPage.jsx

import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom"; // Bỏ useNavigate nếu không dùng
import HomePageLayout from "../../components/User/layout/HomePageLayout"; // *** Điều chỉnh đường dẫn ***
import Api from "../../network/Api"; // *** Điều chỉnh đường dẫn ***
import { METHOD_TYPE } from "../../network/methodType"; // *** Điều chỉnh đường dẫn ***
import defaultAvatar from "../../assets/images/df-female.png"; // *** Điều chỉnh đường dẫn ***
import { PiMedalThin } from "react-icons/pi";
import {
  FaStar, // Cần cho renderStars
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
} from "react-icons/fa";
import { toast } from "react-toastify";
import "../../assets/css/TutorDetailPage.style.css"; // *** Tạo và import file CSS này ***

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

// --- Helpers ---
const formatTeachingTime = (hours) => {
  // Tham số 'hours' được sử dụng
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
  // Tham số 'rating' được sử dụng
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
  // Tham số 'method' được sử dụng
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
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (e) {
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
    const parsedSchedule = dateTimeLearn.map((itemString) =>
      JSON.parse(itemString)
    );
    return (
      <ul className="schedule-list">
        {parsedSchedule.map((item) => (
          <li key={item.day}>
            <strong>{dayLabels[item.day] || item.day}:</strong>{" "}
            {item.times.join(", ")}
          </li>
        ))}
      </ul>
    );
  } catch (error) {
    console.error("Lỗi parse lịch học:", error);
    return <p>Lỗi hiển thị lịch học.</p>;
  }
};

const TutorDetailPage = () => {
  const { userId } = useParams();
  const [tutorData, setTutorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false); // Giữ lại state và hàm setter

  const fetchTutorDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log(`Fetching detail for tutor ID: ${userId}`);
    const filterParams = [{ key: "userId", operator: "like", value: userId }];
    const sortParams = [{ key: "createdAt", type: "DESC" }];
    console.log("Test thoi", filterParams);
    try {
      const response = await Api({
        endpoint: "/user/get-list-tutor-public",
        method: METHOD_TYPE.GET,
        query: { filter: filterParams, sort: sortParams, page: 1, rpp: 1 },
      });
      console.log("API Response Detail:", response);
      if (response?.data?.items && response.data.items.length > 0) {
        setTutorData(response.data.items[0]);
        // TODO: Gọi API khác để lấy trạng thái isFavorite và bookingStatus thực tế
        // Ví dụ tạm: setIsFavorite(response.data.items[0].isUserFavorite || false);
      } else {
        setError(`Không tìm thấy thông tin gia sư với ID: ${userId}`);
        setTutorData(null);
      }
    } catch (err) {
      console.error("Lỗi tải chi tiết gia sư:", err);
      setError("Không thể tải thông tin gia sư. Vui lòng thử lại.");
      setTutorData(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchTutorDetail();
    } else {
      setError("Không có ID gia sư được cung cấp.");
      setIsLoading(false);
    }
  }, [fetchTutorDetail, userId]);

  // --- Handlers ---
  const handleToggleFavorite = async () => {
    // Hoàn thiện logic gọi setIsFavorite
    console.log(
      `TODO: API ${isFavorite ? "DELETE" : "POST"} favorite for ${userId}`
    );
    try {
      // Giả lập thành công - Thay bằng API call thật
      // await Api(...);
      setIsFavorite((prev) => !prev); // <-- Gọi setIsFavorite
      toast.success(
        `Đã ${!isFavorite ? "thêm vào" : "xóa khỏi"} yêu thích (Tạm thời)`
      );
    } catch (err) {
      toast.error("Lỗi cập nhật yêu thích");
    }
  };

  const handleOpenBookingModal = () => {
    toast.info(
      "Chức năng đặt lịch từ trang chi tiết đang được cập nhật"
    ); /* TODO: Implement modal opening */
  };
  const handleCancelBooking = () => {
    toast.info(
      "Chức năng hủy từ trang chi tiết đang được cập nhật"
    ); /* TODO: Implement cancel API call */
  };

  // --- Rendering ---
  if (isLoading) {
    return (
      <HomePageLayout>
        <div className="tutor-detail-page loading-state">
          <FaSpinner className="spinner" />
          <p>Đang tải thông tin gia sư...</p>
        </div>
      </HomePageLayout>
    );
  }
  if (error) {
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
  if (!tutorData || !tutorData.tutorProfile) {
    return (
      <HomePageLayout>
        <div className="tutor-detail-page error-state">
          <p>Không tìm thấy dữ liệu gia sư.</p>
          <Link to="/tim-gia-su" className="back-link">
            Quay lại trang tìm kiếm
          </Link>
        </div>
      </HomePageLayout>
    );
  }

  const profile = tutorData.tutorProfile;
  const avatar = profile.avatar || defaultAvatar;
  const rankInfo =
    tutorRanks[profile.tutorLevel?.levelName?.toLowerCase()] || null;
  const rating =
    profile.averageRating !== null && profile.averageRating !== undefined
      ? parseFloat(profile.averageRating.toFixed(1))
      : 0;
  const reviewCount =
    profile.totalReviews !== null && profile.totalReviews !== undefined
      ? profile.totalReviews
      : 0;
  const isVerified =
    tutorData.checkActive === "ACTIVE" && profile.isPublicProfile === true;

  // Xác định trạng thái nút Thuê/Hủy dựa trực tiếp vào tutorData
  const bookingRequest = profile.bookingRequest;
  const canHire = bookingRequest === null;
  const canCancel =
    bookingRequest &&
    typeof bookingRequest === "object" &&
    bookingRequest.status === "REQUEST";

  return (
    <HomePageLayout>
      <div className="tutor-detail-page">
        {/* Phần Header */}
        <section className="detail-header">
          <div className="header-left">
            {" "}
            <img
              src={avatar}
              alt={`Ảnh ${profile.fullname}`}
              className="detail-avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultAvatar;
              }}
            />{" "}
            {isVerified && (
              <FaCheckCircle
                className="detail-verified-badge"
                title="Đã xác thực"
              />
            )}{" "}
          </div>
          <div className="header-main">
            <h2 className="detail-name">
              {" "}
              {profile.fullname} {renderRankBadge(rankInfo)}{" "}
            </h2>
            <div className="detail-rating-fav">
              <div className="detail-rating">
                {" "}
                {renderStars(rating)}{" "}
                {rating > 0 && <span className="rating-value">{rating}</span>}{" "}
                <span className="review-count">({reviewCount} đánh giá)</span>{" "}
              </div>
              <button
                className={`favorite-btn detail-favorite-btn ${
                  isFavorite ? "favorite-active" : ""
                }`}
                onClick={handleToggleFavorite}
                title="Yêu thích"
              >
                {" "}
                {isFavorite ? <FaHeart /> : <FaRegHeart />}{" "}
              </button>
            </div>
            <p className="detail-basic-info">
              {" "}
              <FaGraduationCap />{" "}
              {profile.tutorLevel?.levelName || "Chưa cập nhật"} -{" "}
              {profile.univercity || "Chưa cập nhật trường"}{" "}
            </p>
            <p className="detail-basic-info">
              <FaBook /> Chuyên ngành:{" "}
              {profile.major?.majorName || "Chưa cập nhật"}
            </p>
            <div className="header-actions">
              {canHire && (
                <button
                  className="action-btn hire-btn"
                  onClick={handleOpenBookingModal}
                >
                  Thuê Gia Sư
                </button>
              )}
              {canCancel && (
                <button
                  className="action-btn cancel-btn"
                  onClick={handleCancelBooking}
                >
                  Hủy Yêu Cầu
                </button>
              )}
              {bookingRequest && !canCancel && (
                <span className="booking-status-indicator">
                  Trạng thái: {bookingRequest.status}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Phần Thông tin chi tiết */}
        <section className="detail-content">
          <div className="detail-section">
            {" "}
            <h3>Giới thiệu bản thân</h3>{" "}
            <p className="detail-description">
              {profile.description || "Gia sư chưa cập nhật giới thiệu."}
            </p>{" "}
          </div>
          <div className="detail-section">
            {" "}
            <h3>Thông tin cơ bản</h3>{" "}
            <ul className="info-list">
              {" "}
              <li>
                <FaBirthdayCake className="info-icon" /> Ngày sinh:{" "}
                {formatBirthday(profile.birthday)}
              </li>{" "}
              <li>
                <FaVenusMars className="info-icon" /> Giới tính:{" "}
                {profile.gender === "MALE"
                  ? "Nam"
                  : profile.gender === "FEMALE"
                  ? "Nữ"
                  : "Khác"}
              </li>{" "}
              <li>
                <FaUserGraduate className="info-icon" /> GPA:{" "}
                {profile.GPA || "Chưa cập nhật"}
              </li>{" "}
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
              )}{" "}
            </ul>{" "}
          </div>
          <div className="detail-section">
            {" "}
            <h3>Kỹ năng & Môn dạy</h3>{" "}
            <ul className="info-list">
              {" "}
              <li>
                {" "}
                <FaBook className="info-icon" /> Môn dạy chính:{" "}
                <strong>
                  {" "}
                  {profile.subject?.subjectName || "Chưa cập nhật"}
                </strong>{" "}
                {profile.evidenceOfSubject && (
                  <a
                    href={profile.evidenceOfSubject}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="evidence-link"
                  >
                    (Minh chứng)
                  </a>
                )}{" "}
                {profile.descriptionOfSubject && (
                  <p className="subject-desc">
                    <em>Mô tả: {profile.descriptionOfSubject}</em>
                  </p>
                )}{" "}
              </li>{" "}
              {profile.subjectId2 && (
                <li>
                  {" "}
                  <FaBook className="info-icon" /> Môn dạy 2:{" "}
                  <strong> {profile.subject2?.subjectName || "N/A"}</strong>{" "}
                  {profile.evidenceOfSubject2 && (
                    <a
                      href={profile.evidenceOfSubject2}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="evidence-link"
                    >
                      (Minh chứng)
                    </a>
                  )}{" "}
                  {profile.descriptionOfSubject2 && (
                    <p className="subject-desc">
                      <em>Mô tả: {profile.descriptionOfSubject2}</em>
                    </p>
                  )}{" "}
                </li>
              )}{" "}
              {profile.subjectId3 && (
                <li>
                  {" "}
                  <FaBook className="info-icon" /> Môn dạy 3:{" "}
                  <strong> {profile.subject3?.subjectName || "N/A"}</strong>{" "}
                  {profile.evidenceOfSubject3 && (
                    <a
                      href={profile.evidenceOfSubject3}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="evidence-link"
                    >
                      (Minh chứng)
                    </a>
                  )}{" "}
                  {profile.descriptionOfSubject3 && (
                    <p className="subject-desc">
                      <em>Mô tả: {profile.descriptionOfSubject3}</em>
                    </p>
                  )}{" "}
                </li>
              )}{" "}
            </ul>{" "}
          </div>
          <div className="detail-section">
            {" "}
            <h3>Phương pháp & Địa điểm</h3>{" "}
            <ul className="info-list">
              {" "}
              <li>
                <FaChalkboardTeacher className="info-icon" /> Phương pháp dạy:{" "}
                {renderTeachingMethod(profile.teachingMethod)}
              </li>{" "}
              <li>
                <FaMapMarkerAlt className="info-icon" /> Khu vực dạy:{" "}
                {profile.teachingPlace || "Chưa cập nhật"}
              </li>{" "}
              {formatTeachingTime(profile.teachingTime) && (
                <li>
                  <FaClock className="info-icon" /> Thời lượng tối đa / buổi:{" "}
                  {formatTeachingTime(profile.teachingTime)}
                </li>
              )}{" "}
            </ul>{" "}
          </div>
          <div className="detail-section">
            {" "}
            <h3>Lịch dạy có thể nhận</h3>{" "}
            {renderSchedule(profile.dateTimeLearn)}{" "}
          </div>
          {profile.videoUrl && (
            <div className="detail-section">
              {" "}
              <h3>Video giới thiệu</h3>{" "}
              <a
                href={profile.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {profile.videoUrl}
              </a>{" "}
            </div>
          )}
          <div className="detail-section">
            {" "}
            <h3>Giá / buổi học</h3>{" "}
            <p className="detail-price">
              {" "}
              <FaCoins />{" "}
              {profile.coinPerHours
                ? `${profile.coinPerHours.toLocaleString("vi-VN")} Coin / giờ`
                : "Thỏa thuận"}{" "}
            </p>{" "}
          </div>
        </section>
      </div>
    </HomePageLayout>
  );
};

export default TutorDetailPage;
