import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import HomePageLayout from "../../components/User/layout/HomePageLayout";
import majorList from "../../assets/data/mayjorList.json";
import tutorLevel from "../../assets/data/tutorLevel.json";
import "../../assets/css/TutorSearch.style.css";
import {
  FaStar,
  FaGraduationCap,
  FaBook,
  FaDollarSign,
  FaCheckCircle,
  FaSearch,
  FaChevronLeft, // Icon cho pagination
  FaChevronRight, // Icon cho pagination
} from "react-icons/fa";
import defaultAvatar from "../../assets/images/df-female.png"; // Đảm bảo đường dẫn đúng

// --- Dữ liệu mẫu (Thêm nhiều gia sư hơn) ---
const mockTutors = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    major: "Công nghệ Thông tin",
    level: "Sinh viên năm 3",
    subjects: ["Lập trình C++", "Cấu trúc dữ liệu"],
    rating: 4.8,
    reviewCount: 25,
    hourlyRate: 150000,
    imageUrl: null,
    description:
      "Nhiệt tình, có kinh nghiệm dạy kèm C++, Giải thuật. Giúp các bạn nắm vững kiến thức cơ bản và nâng cao.",
    isVerified: true,
  },
  {
    id: 2,
    name: "Trần Thị B",
    major: "Ngôn ngữ Anh",
    level: "Đã tốt nghiệp",
    subjects: ["Tiếng Anh giao tiếp", "TOEIC", "IELTS Writing"],
    rating: 4.9,
    reviewCount: 110,
    hourlyRate: 250000,
    imageUrl: "/path/to/real/avatar2.png",
    description:
      "Phát âm chuẩn, phương pháp dạy dễ hiểu, cam kết đầu ra. Có chứng chỉ sư phạm.",
    isVerified: true,
  },
  {
    id: 3,
    name: "Lê Minh C",
    major: "Quản trị Kinh doanh",
    level: "Sinh viên năm 4",
    subjects: ["Kinh tế vi mô", "Marketing căn bản"],
    rating: 4.5,
    reviewCount: 15,
    hourlyRate: 180000,
    imageUrl: "/path/to/real/avatar3.png",
    description:
      "Kiến thức vững, giúp ôn thi hiệu quả. Đã có kinh nghiệm gia sư 1 năm.",
    isVerified: false,
  },
  {
    id: 4,
    name: "Phạm Thị D",
    major: "Marketing",
    level: "Sinh viên năm 2",
    subjects: ["Content Marketing"],
    rating: 4.7,
    reviewCount: 12,
    hourlyRate: 120000,
    imageUrl: null,
    description: "Năng động, sáng tạo, cập nhật xu hướng.",
    isVerified: true,
  },
  {
    id: 5,
    name: "Hoàng Văn E",
    major: "Công nghệ Thông tin",
    level: "Sinh viên năm 4",
    subjects: ["Java Core", "SQL"],
    rating: 4.9,
    reviewCount: 35,
    hourlyRate: 180000,
    imageUrl: "/path/to/real/avatar5.png",
    description: "Code chắc tay, giải thích cặn kẽ.",
    isVerified: true,
  },
  {
    id: 6,
    name: "Lý Thị F",
    major: "Kế toán",
    level: "Đã tốt nghiệp",
    subjects: ["Nguyên lý kế toán", "Thuế"],
    rating: 4.6,
    reviewCount: 8,
    hourlyRate: 200000,
    imageUrl: null,
    description: "Cẩn thận, tỉ mỉ, nhiều kinh nghiệm thực tế.",
    isVerified: false,
  },
  {
    id: 7,
    name: "Trần Văn G",
    major: "Thiết kế đồ họa",
    level: "Sinh viên năm 3",
    subjects: ["Photoshop", "Illustrator"],
    rating: 4.8,
    reviewCount: 19,
    hourlyRate: 160000,
    imageUrl: "/path/to/real/avatar7.png",
    description: "Mắt thẩm mỹ tốt, hướng dẫn sử dụng công cụ thành thạo.",
    isVerified: true,
  },
  {
    id: 8,
    name: "Nguyễn Thị H",
    major: "Ngôn ngữ Anh",
    level: "Sinh viên năm 4",
    subjects: ["IELTS Reading", "Grammar"],
    rating: 4.7,
    reviewCount: 42,
    hourlyRate: 190000,
    imageUrl: null,
    description: "Giàu kinh nghiệm luyện thi, tài liệu phong phú.",
    isVerified: true,
  },
  {
    id: 9,
    name: "Vũ Văn I",
    major: "Công nghệ Thông tin",
    level: "Sinh viên năm 2",
    subjects: ["Python cơ bản"],
    rating: 4.4,
    reviewCount: 5,
    hourlyRate: 100000,
    imageUrl: "/path/to/real/avatar9.png",
    description: "Thân thiện, dễ gần, phù hợp cho người mới bắt đầu.",
    isVerified: false,
  },
  {
    id: 10,
    name: "Đặng Thị K",
    major: "Quản trị Khách sạn",
    level: "Đã tốt nghiệp",
    subjects: ["Nghiệp vụ lễ tân"],
    rating: 4.9,
    reviewCount: 28,
    hourlyRate: 220000,
    imageUrl: null,
    description: "Chuyên nghiệp, tận tâm, nhiều kinh nghiệm làm việc.",
    isVerified: true,
  },
  {
    id: 11,
    name: "Bùi Văn L",
    major: "Logistics",
    level: "Sinh viên năm 3",
    subjects: ["Quản trị chuỗi cung ứng"],
    rating: 4.6,
    reviewCount: 11,
    hourlyRate: 150000,
    imageUrl: "/path/to/real/avatar11.png",
    description: "Nắm vững lý thuyết, liên hệ thực tế tốt.",
    isVerified: true,
  },
  {
    id: 12,
    name: "Hồ Thị M",
    major: "Tài chính Ngân hàng",
    level: "Sinh viên năm 4",
    subjects: ["Phân tích tài chính"],
    rating: 4.8,
    reviewCount: 21,
    hourlyRate: 170000,
    imageUrl: null,
    description: "Tư duy logic, khả năng phân tích số liệu tốt.",
    isVerified: true,
  },
];
// --- Kết thúc dữ liệu mẫu ---

// ========== COMPONENT TUTOR CARD ==========
const TutorCard = ({ tutor }) => {
  const avatar = tutor.imageUrl || defaultAvatar;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="star-icon filled" />);
    }
    for (let i = fullStars; i < 5; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="star-icon empty" />);
    }
    return stars;
  };

  return (
    <div className="tutor-card redesigned">
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
            <h4 className="tutor-name">{tutor.name}</h4>
          </div>
          <div className="tutor-info-row">
            <FaGraduationCap className="info-icon" />
            <span>
              {tutor.level} - {tutor.major}
            </span>
          </div>
          <div className="tutor-info-row">
            <FaBook className="info-icon" />
            <span className="tutor-subjects">
              {tutor.subjects?.join(", ") || "Chưa cập nhật môn dạy"}
            </span>
          </div>
          <div className="tutor-rating">
            {renderStars(tutor.rating)}
            <span className="rating-value">{tutor.rating.toFixed(1)}</span>
            <span className="review-count">({tutor.reviewCount} đánh giá)</span>
          </div>
          <p className="tutor-description">{tutor.description}</p>
        </div>
        <div className="tutor-card-footer-info">
          <div className="tutor-price">
            <FaDollarSign className="info-icon price-icon" />
            <span>{tutor.hourlyRate.toLocaleString("vi-VN")} đ/giờ</span>
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
    id: PropTypes.number.isRequired,
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
  },
};
// ========== KẾT THÚC COMPONENT TUTOR CARD ==========

// ========== COMPONENT PAGINATION ==========
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  const delta = 2; // Số trang hiển thị mỗi bên của trang hiện tại
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
            <FaChevronLeft />
            <span>Trước</span>
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
            <span>Sau</span>
            <FaChevronRight />
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
// ========== KẾT THÚC COMPONENT PAGINATION ==========

// ========== COMPONENT TUTOR SEARCH PAGE ==========
const TutorSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [sortBy, setSortBy] = useState("rating_desc");
  const [allFilteredTutors, setAllFilteredTutors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const tutorsPerPage = 8; // Số lượng gia sư mỗi trang

  const applyFiltersAndSort = () => {
    setIsLoading(true);
    // --- BẮT ĐẦU XỬ LÝ DỮ LIỆU MẪU (THAY BẰNG API SAU) ---
    setTimeout(() => {
      let processedTutors = [...mockTutors];
      // --- Lọc ---
      if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        processedTutors = processedTutors.filter(
          (tutor) =>
            tutor.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            tutor.subjects.some((sub) =>
              sub.toLowerCase().includes(lowerCaseSearchTerm)
            ) ||
            tutor.major.toLowerCase().includes(lowerCaseSearchTerm) ||
            (tutor.description &&
              tutor.description.toLowerCase().includes(lowerCaseSearchTerm))
        );
      }
      if (selectedLevel) {
        processedTutors = processedTutors.filter(
          (tutor) => tutor.level === selectedLevel
        );
      }
      if (selectedMajor) {
        processedTutors = processedTutors.filter(
          (tutor) => tutor.major === selectedMajor
        );
      }
      // --- Sắp xếp ---
      processedTutors.sort((a, b) => {
        if (a.isVerified !== b.isVerified) {
          return a.isVerified ? -1 : 1;
        }
        switch (sortBy) {
          case "price_asc":
            return a.hourlyRate - b.hourlyRate;
          case "price_desc":
            return b.hourlyRate - a.hourlyRate;
          case "rating_desc":
          default:
            return b.rating - a.rating;
        }
      });
      // --- KẾT THÚC XỬ LÝ DỮ LIỆU MẪU ---

      setAllFilteredTutors(processedTutors); // Lưu tất cả kết quả đã lọc/sắp xếp
      setCurrentPage(1); // Reset về trang 1 mỗi khi lọc/sắp xếp lại
      setIsLoading(false);
    }, 500); // Giả lập độ trễ mạng
  };

  useEffect(() => {
    applyFiltersAndSort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedLevel, selectedMajor, sortBy]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedLevel("");
    setSelectedMajor("");
    // Giữ nguyên sortBy
  };

  // Tính toán dữ liệu cho trang hiện tại
  const indexOfLastTutor = currentPage * tutorsPerPage;
  const indexOfFirstTutor = indexOfLastTutor - tutorsPerPage;
  const currentTutors = allFilteredTutors.slice(
    indexOfFirstTutor,
    indexOfLastTutor
  );
  const totalPages = Math.ceil(allFilteredTutors.length / tutorsPerPage);

  return (
    <HomePageLayout>
      <div className="tutor-search-page layout-2-columns">
        {/* ========== Sidebar Bộ lọc ========== */}
        <aside className="search-sidebar">
          <h3>Bộ lọc chi tiết</h3>
          <div className="filter-group sidebar-filter">
            <label htmlFor="level-filter-sidebar">Trình độ Gia sư</label>
            <select
              id="level-filter-sidebar"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              aria-label="Lọc theo trình độ gia sư"
            >
              <option value="">Tất cả</option>
              {tutorLevel.map((level) => (
                <option key={level.level_name} value={level.level_name}>
                  {level.level_name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group sidebar-filter">
            <label htmlFor="major-filter-sidebar">Ngành học</label>
            <select
              id="major-filter-sidebar"
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              aria-label="Lọc theo ngành học gia sư"
            >
              <option value="">Tất cả</option>
              {majorList.map((major) => (
                <option key={major.major_id} value={major.major_name}>
                  {major.major_name}
                </option>
              ))}
            </select>
          </div>
          {/* (Thêm các bộ lọc khác ở đây nếu cần) */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="reset-button sidebar-reset-btn"
            aria-label="Đặt lại bộ lọc"
          >
            Đặt lại tất cả bộ lọc
          </button>
        </aside>

        {/* ========== Nội dung chính ========== */}
        <main className="search-main-content">
          <div className="top-search-sort-bar">
            <div className="search-input-container">
              <FaSearch className="search-input-icon" />
              <input
                type="text"
                placeholder="Tìm gia sư theo tên, môn học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="main-search-input"
                aria-label="Tìm kiếm gia sư"
              />
            </div>
            <div className="sort-by-container">
              <label htmlFor="sort-by-select">Sắp xếp theo:</label>
              <select
                id="sort-by-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sắp xếp kết quả tìm kiếm"
              >
                <option value="rating_desc">Đánh giá cao nhất</option>
                <option value="price_asc">Giá thấp đến cao</option>
                <option value="price_desc">Giá cao đến thấp</option>
              </select>
            </div>
          </div>

          <section className="search-results-section">
            <div className="results-header">
              <p className="results-count">
                {isLoading
                  ? "Đang tìm..."
                  : allFilteredTutors.length > 0 // Kiểm tra có kết quả không
                  ? `Hiển thị ${indexOfFirstTutor + 1} - ${Math.min(
                      indexOfLastTutor,
                      allFilteredTutors.length
                    )} trên tổng ${allFilteredTutors.length} gia sư`
                  : "Không tìm thấy gia sư nào"}
              </p>
            </div>

            {isLoading ? (
              <div className="loading-indicator">
                {/* Sử dụng skeleton loading ở đây sẽ tốt hơn */}
                <p>Đang tải danh sách gia sư...</p>
              </div>
            ) : (
              <>
                <div className="tutor-list redesigned-list">
                  {currentTutors.length > 0 ? (
                    currentTutors.map((tutor) => (
                      <TutorCard key={tutor.id} tutor={tutor} />
                    ))
                  ) : (
                    <p className="no-results">
                      Không tìm thấy gia sư nào phù hợp với tiêu chí của bạn.
                      Vui lòng thử lại hoặc đặt lại bộ lọc.
                    </p>
                  )}
                </div>

                {/* Chỉ hiển thị pagination nếu có nhiều hơn 1 trang */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </section>
        </main>
      </div>
    </HomePageLayout>
  );
};

export default TutorSearchPage;
