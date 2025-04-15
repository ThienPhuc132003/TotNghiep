import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";

// Import các thành phần cần thiết
import {
  FaStar,
  FaGraduationCap,
  FaBook,
  FaCheckCircle,
  FaCoins,
  FaHeart,
  FaRegHeart,
  FaGem,
  FaMedal,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import defaultAvatar from "../../assets/images/df-female.png";
import TutorCardSkeleton from "../TutorCardSkeleton";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import "../../assets/css/TutorCardSkeleton.style.css";
import "../../assets/css/TutorSearch.style.css";

// Cấu hình hạng gia sư
const tutorRanks = {
  bronze: { name: "Đồng", color: "#cd7f32", icon: <FaMedal /> },
  silver: { name: "Bạc", color: "#c0c0c0", icon: <FaMedal /> },
  gold: { name: "Vàng", color: "#ffd700", icon: <FaMedal /> },
  platinum: { name: "Bạch Kim", color: "#67e8f9", icon: <FaMedal /> },
  diamond: { name: "Kim Cương", color: "#0e7490", icon: <FaGem /> },
};
const tutorsPerPage = 8;

// Helper Function: Map API data
const mapApiTutorToCardProps = (apiTutor) => {
  if (!apiTutor || !apiTutor.tutorProfile) {
    console.warn("Received incomplete tutor data from API:", apiTutor);
    return null;
  }
  const profile = apiTutor.tutorProfile;
  const subjects = [
    profile.subject?.subjectName,
    profile.subject2?.subjectName,
    profile.subject3?.subjectName,
  ].filter(Boolean);

  let rankKey = "bronze";
  const levelNameLower = profile.tutorLevel?.levelName?.toLowerCase();
  if (levelNameLower === "bạc") rankKey = "silver";
  else if (levelNameLower === "vàng") rankKey = "gold";
  else if (levelNameLower === "bạch kim") rankKey = "platinum";
  else if (levelNameLower === "kim cương") rankKey = "diamond";

  const isInitiallyFavorite = false;
  const rating = profile.averageRating || Math.random() * (5 - 3.5) + 3.5;
  const reviewCount = profile.totalReviews || Math.floor(Math.random() * 100);
  const isVerified =
    apiTutor.checkActive === "ACTIVE" && profile.isPublicProfile;

  return {
    id: apiTutor.userId,
    name: profile.fullname || "Chưa cập nhật tên",
    major: profile.major?.majorName || "Chưa cập nhật ngành",
    level: profile.tutorLevel?.levelName || "Chưa cập nhật trình độ",
    subjects: subjects.length > 0 ? subjects : ["Chưa cập nhật môn dạy"],
    rating: parseFloat(rating.toFixed(1)),
    reviewCount: reviewCount,
    hourlyRate: profile.coinPerHours ? profile.coinPerHours * 1000 : 0,
    imageUrl: profile.avatar || null,
    description: profile.description || "Chưa có mô tả.",
    isVerified: isVerified,
    rank: rankKey,
    isInitiallyFavorite: isInitiallyFavorite,
    university: profile.univercity,
    teachingMethod: profile.teachingMethod,
    teachingPlace: profile.teachingPlace,
  };
};

// CHILD COMPONENT: TutorCard
const TutorCard = ({ tutor }) => {
  const [isFavorite, setIsFavorite] = useState(
    tutor.isInitiallyFavorite || false
  );
  const avatar = tutor.imageUrl || defaultAvatar;
  const rankInfo = tutorRanks[tutor.rank] || null;

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    console.log(
      `TODO: API Call - Tutor ${tutor.id} is now ${
        !isFavorite ? "favorited" : "unfavorited"
      }`
    );
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="star-icon filled" />);
    }
    const emptyStarsCount = 5 - fullStars - (hasHalfStar ? 1 : 0);
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
        {rankData.icon || <FaMedal />}
      </span>
    );
  };

  return (
    <div className="tutor-card redesigned">
      <button
        className={`action-btn favorite-btn ${
          isFavorite ? "favorite-active" : ""
        }`}
        onClick={handleToggleFavorite}
        aria-label={
          isFavorite ? "Bỏ yêu thích gia sư" : "Thêm gia sư yêu thích"
        }
        title={isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
      >
        {isFavorite ? <FaHeart /> : <FaRegHeart />}
      </button>
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
          </div>
          <div className="tutor-info-row">
            <FaGraduationCap className="info-icon" />
            <span>
              {tutor.university
                ? `${tutor.level} - ${tutor.university}`
                : tutor.level}
            </span>
          </div>
          <div className="tutor-info-row">
            <FaBook className="info-icon" />
            <span className="tutor-subjects" title={tutor.subjects?.join(", ")}>
              {tutor.subjects?.join(", ") || "Chưa cập nhật môn dạy"}
            </span>
          </div>
          <div className="tutor-rating">
            {renderStars(tutor.rating)}
            <span className="rating-value">
              {tutor.rating > 0 ? tutor.rating.toFixed(1) : "Mới"}
            </span>
            <span className="review-count">({tutor.reviewCount} đánh giá)</span>
          </div>
          <p className="tutor-description">{tutor.description}</p>
        </div>
        <div className="tutor-card-footer-info">
          <div className="tutor-price">
            <FaCoins className="info-icon price-icon" />
            <span>
              {tutor.hourlyRate > 0
                ? `${Math.round(tutor.hourlyRate / 1000).toLocaleString(
                    "vi-VN"
                  )} Coin/giờ`
                : "Thỏa thuận"}
            </span>
          </div>
          <div className="footer-buttons">
            <button className="view-profile-btn">Xem Hồ Sơ</button>
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
    major: PropTypes.string,
    level: PropTypes.string,
    subjects: PropTypes.arrayOf(PropTypes.string),
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
    hourlyRate: PropTypes.number,
    imageUrl: PropTypes.string,
    description: PropTypes.string,
    isVerified: PropTypes.bool,
    rank: PropTypes.oneOf(["bronze", "silver", "gold", "platinum", "diamond"]),
    isInitiallyFavorite: PropTypes.bool,
    university: PropTypes.string,
    teachingMethod: PropTypes.string,
    teachingPlace: PropTypes.string,
  }).isRequired,
};

TutorCard.defaultProps = {
  tutor: {
    rating: 0,
    reviewCount: 0,
    subjects: [],
    description: "Chưa có mô tả.",
    isVerified: false,
    hourlyRate: 0,
    rank: null,
    isInitiallyFavorite: false,
    university: "Đại học Văn Lang",
  },
};

// CHILD COMPONENT: Pagination
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  const delta = 2;
  const left = currentPage - delta;
  const right = currentPage + delta + 1;
  const range = [];
  const rangeWithDots = [];

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i < right)) {
      range.push(i);
    }
  }

  let l;
  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }
  pageNumbers.push(...rangeWithDots);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="pagination-nav" aria-label="Điều hướng trang">
      <ul className="pagination">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className="page-link prev-next"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Trang trước"
          >
            <FaChevronLeft /> <span>Trước</span>
          </button>
        </li>
        {pageNumbers.map((number, index) =>
          number === "..." ? (
            <li key={`dots-${index}`} className="page-item disabled dots">
              <span className="page-link">...</span>
            </li>
          ) : (
            <li
              key={number}
              className={`page-item ${currentPage === number ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => onPageChange(number)}
              >
                {number}
              </button>
            </li>
          )
        )}
        <li
          className={`page-item ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <button
            className="page-link prev-next"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Trang sau"
          >
            <span>Sau</span> <FaChevronRight />
          </button>
        </li>
      </ul>
    </nav>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

// MAIN COMPONENT: TutorList
const TutorList = ({
  searchTerm,
  selectedLevelId,
  selectedMajorId,
  sortBy,
}) => {
  const [tutors, setTutors] = useState([]);
  const [totalTutors, setTotalTutors] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTutorsData = useCallback(
    async (pageToFetch = 1) => {
      setIsLoading(true);
      setError(null);
      if (pageToFetch === 1) {
        setTutors([]);
        setTotalTutors(0);
      }
      const filterParams = [];
      if (searchTerm) {
        filterParams.push({
          key: "fullname",
          operator: "like",
          value: searchTerm,
        });
      }
      if (selectedMajorId) {
        filterParams.push({
          key: "majorId",
          operator: "like",
          value: selectedMajorId,
        });
      }
      if (selectedLevelId) {
        filterParams.push({
          key: "tutorLevelId",
          operator: "=",
          value: selectedLevelId,
        });
      }
      filterParams.push({ key: "isPublicProfile", operator: "=", value: true });

      let sortParams = [];
      switch (sortBy) {
        case "price_asc":
          sortParams.push({ key: "coinPerHours", type: "ASC" });
          break;
        case "price_desc":
          sortParams.push({ key: "coinPerHours", type: "DESC" });
          break;
        case "createdAt_desc":
          sortParams.push({ key: "createdAt", type: "DESC" });
          break;
        case "rating_desc":
        default:
          sortParams.push({ key: "createdAt", type: "DESC" });
          break;
      }

      try {
        const response = await Api({
          endpoint: "/user/get-list-tutor-public",
          method: METHOD_TYPE.GET,
          query: {
            filter: filterParams,
            sort: sortParams,
            page: pageToFetch,
            rpp: tutorsPerPage,
          },
        });
        if (response.data && response.data.data) {
          const apiData = response.data.data;
          const mappedTutors = apiData.items
            .map(mapApiTutorToCardProps)
            .filter((tutor) => tutor !== null);
          setTutors(mappedTutors);
          setTotalTutors(apiData.total || 0);
        } else {
          console.warn("API response format unexpected:", response.data);
          setTutors([]);
          setTotalTutors(0);
        }
      } catch (err) {
        console.error("Failed to fetch tutors in TutorList:", err);
        setError("Không thể tải danh sách gia sư. Vui lòng thử lại sau.");
        setTutors([]);
        setTotalTutors(0);
      } finally {
        setIsLoading(false);
      }
    },
    [searchTerm, selectedLevelId, selectedMajorId, sortBy]
  );

  useEffect(() => {
    setCurrentPage(1);
    fetchTutorsData(1);
  }, [fetchTutorsData]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      fetchTutorsData(pageNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const totalPages = Math.ceil(totalTutors / tutorsPerPage);
  const indexOfFirstTutor = (currentPage - 1) * tutorsPerPage;
  const indexOfLastTutorOnPage = indexOfFirstTutor + tutors.length;

  return (
    <section className="search-results-section">
      <div className="results-header">
        {error && <p className="error-message">{error}</p>}
        {!error && (
          <p className="results-count">
            {isLoading && currentPage === 1
              ? "Đang tìm..."
              : !isLoading && totalTutors > 0
              ? `Hiển thị ${
                  indexOfFirstTutor + 1
                } - ${indexOfLastTutorOnPage} trên tổng ${totalTutors} gia sư`
              : !isLoading && totalTutors === 0
              ? "Không tìm thấy gia sư nào phù hợp"
              : ""}
          </p>
        )}
      </div>

      {isLoading && tutors.length === 0 ? (
        <div className="tutor-list redesigned-list loading">
          {Array.from({ length: tutorsPerPage }).map((_, index) => (
            <TutorCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      ) : !error && tutors.length > 0 ? (
        <>
          <div className="tutor-list redesigned-list">
            {tutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : !isLoading && !error && totalTutors === 0 ? (
        <p className="no-results">
          Không tìm thấy gia sư nào phù hợp với tiêu chí của bạn. Vui lòng thử
          lại hoặc đặt lại bộ lọc.
        </p>
      ) : null}
    </section>
  );
};

TutorList.propTypes = {
  searchTerm: PropTypes.string,
  selectedLevelId: PropTypes.string,
  selectedMajorId: PropTypes.string,
  sortBy: PropTypes.string,
};

export default TutorList;
