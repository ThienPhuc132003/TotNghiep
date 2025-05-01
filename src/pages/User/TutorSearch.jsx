import { useState, useEffect } from "react";
import HomePageLayout from "../../components/User/layout/HomePageLayout"; // *** Điều chỉnh đường dẫn ***
import majorList from "../../components/Static_Data/MajorList"; // *** Đảm bảo file và đường dẫn đúng ***
import tutorLevel from "../../components/Static_Data/TutorLevelList"; // *** Đảm bảo file và đường dẫn đúng ***
import "../../assets/css/TutorSearch.style.css"; // *** Điều chỉnh đường dẫn ***
import { FaSearch, FaTimes } from "react-icons/fa";
import TutorList from "../../components/Static_Data/TutorList"; 

const TutorSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [selectedMajorId, setSelectedMajorId] = useState("");
  const [sortBy, setSortBy] = useState("rating_desc"); // Mặc định

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSelectedLevelId("");
    setSelectedMajorId("");
    setSortBy("rating_desc");
  };
  const handleRemoveFilter = (filterType) => {
    if (filterType === "level") setSelectedLevelId("");
    if (filterType === "major") setSelectedMajorId("");
    if (filterType === "search") {
      setSearchTerm("");
      setDebouncedSearchTerm("");
    }
  };

  const getLevelName = (id) =>
    tutorLevel.find((l) => l.tutorLevelId === id)?.level_name || id;
  const getMajorName = (id) =>
    majorList.find((m) => m.major_id === id)?.major_name || id;

  return (
    <HomePageLayout>
      <div className="tutor-search-page layout-2-columns">
        <aside className="search-sidebar">
          <h3>Bộ lọc chi tiết</h3>
          <div className="filter-group sidebar-filter">
            <label htmlFor="level-filter-sidebar">Trình độ Gia sư</label>
            <select
              id="level-filter-sidebar"
              value={selectedLevelId}
              onChange={(e) => {
                setSelectedLevelId(e.target.value);
              }}
              aria-label="Lọc theo trình độ gia sư"
            >
              <option value="">Tất cả</option>
              {Array.isArray(tutorLevel) &&
                tutorLevel.map((level) => (
                  <option key={level.tutorLevelId} value={level.tutorLevelId}>
                    {level.level_name}
                  </option>
                ))}
            </select>
          </div>
          <div className="filter-group sidebar-filter">
            <label htmlFor="major-filter-sidebar">Ngành học</label>
            <select
              id="major-filter-sidebar"
              value={selectedMajorId}
              onChange={(e) => {
                setSelectedMajorId(e.target.value);
              }}
              aria-label="Lọc theo ngành học gia sư"
            >
              <option value="">Tất cả</option>
              {Array.isArray(majorList) &&
                majorList.map((major) => (
                  <option key={major.major_id} value={major.major_id}>
                    {major.major_name}
                  </option>
                ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="reset-button sidebar-reset-btn"
            aria-label="Đặt lại bộ lọc"
          >
            Đặt lại tất cả bộ lọc
          </button>
        </aside>

        <main className="search-main-content">
          <div className="top-search-sort-bar">
            <div className="search-input-container">
              {" "}
              <FaSearch className="search-input-icon" />{" "}
              <input
                type="text"
                placeholder="Tìm theo tên gia sư..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="main-search-input"
                aria-label="Tìm kiếm gia sư"
              />{" "}
            </div>
            <div className="sort-by-container">
              {" "}
              <label htmlFor="sort-by-select">Sắp xếp theo:</label>{" "}
              <select
                id="sort-by-select"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                }}
                aria-label="Sắp xếp kết quả tìm kiếm"
              >
                {" "}
                <option value="rating_desc">Liên quan nhất</option>{" "}
                <option value="price_asc">Coin thấp đến cao</option>{" "}
                <option value="price_desc">Coin cao đến thấp</option>{" "}
                <option value="createdAt_desc">Mới nhất</option>{" "}
              </select>{" "}
            </div>
          </div>

          {(selectedLevelId || selectedMajorId || debouncedSearchTerm) && (
            <div className="active-filters-bar">
              <span>Đang lọc theo:</span>
              <div className="active-filters-list">
                {debouncedSearchTerm && (
                  <span key="filter-search" className="filter-tag">
                    Tên: {'"'}
                    {debouncedSearchTerm}
                    {'"'}
                    <button
                      onClick={() => handleRemoveFilter("search")}
                      aria-label="Xóa bộ lọc từ khóa"
                    >
                      <FaTimes />
                    </button>
                  </span>
                )}
                {selectedLevelId && (
                  <span
                    key={`filter-level-${selectedLevelId}`}
                    className="filter-tag"
                  >
                    Trình độ: {getLevelName(selectedLevelId)}
                    <button
                      onClick={() => handleRemoveFilter("level")}
                      aria-label="Xóa bộ lọc trình độ"
                    >
                      <FaTimes />
                    </button>
                  </span>
                )}
                {selectedMajorId && (
                  <span
                    key={`filter-major-${selectedMajorId}`}
                    className="filter-tag"
                  >
                    Ngành: {getMajorName(selectedMajorId)}
                    <button
                      onClick={() => handleRemoveFilter("major")}
                      aria-label="Xóa bộ lọc ngành học"
                    >
                      <FaTimes />
                    </button>
                  </span>
                )}
              </div>
              <button
                className="clear-all-filters-btn"
                onClick={handleResetFilters}
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}

          <TutorList
            searchTerm={debouncedSearchTerm}
            selectedLevelId={selectedLevelId}
            selectedMajorId={selectedMajorId}
            sortBy={sortBy}
          />
        </main>
      </div>
    </HomePageLayout>
  );
};

export default TutorSearchPage;
