import { useState, useEffect, memo } from "react";
import MajorList from "../../components/Static_Data/MajorList"; // Component để fetch major data
import TutorLevelList from "../../components/Static_Data/TutorLevelList"; // Component để fetch tutor level data
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import "../../assets/css/TutorSearch.style.css"; // *** Điều chỉnh đường dẫn ***
import { FaSearch, FaTimes } from "react-icons/fa";
import TutorList from "../../components/Static_Data/TutorList"; // *** Điều chỉnh đường dẫn ***

const TutorSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [selectedMajorId, setSelectedMajorId] = useState("");
  const [sortBy, setSortBy] = useState("rating_desc");
  const [searchType, setSearchType] = useState("all"); // Thêm loại tìm kiếm
  // State để lưu data cho việc hiển thị tên trong active filters
  const [majorOptions, setMajorOptions] = useState([]);
  const [tutorLevelOptions, setTutorLevelOptions] = useState([]);
  const [isFilterDataLoading, setIsFilterDataLoading] = useState(true);

  // Fetch data cho active filters display
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setIsFilterDataLoading(true);

        // Fetch majors
        const majorResponse = await Api({
          endpoint: "major/search",
          method: METHOD_TYPE.GET,
        });
        if (majorResponse?.data?.items) {
          setMajorOptions(majorResponse.data.items);
          console.log("Major data loaded:", majorResponse.data.items);
        } else {
          console.warn("Major data not found in response:", majorResponse);
        }

        // Fetch tutor levels
        const levelResponse = await Api({
          endpoint: "tutor-level/search",
          method: METHOD_TYPE.GET,
        });
        if (levelResponse?.data?.items) {
          setTutorLevelOptions(levelResponse.data.items);
          console.log("Tutor level data loaded:", levelResponse.data.items);
        } else {
          console.warn(
            "Tutor level data not found in response:",
            levelResponse
          );
        }
      } catch (error) {
        console.error("Error fetching filter data:", error);
      } finally {
        setIsFilterDataLoading(false);
      }
    };

    fetchFilterData();
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Delay 500ms
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]); // Handler cho các component filters
  const handleMajorChange = (name, value) => {
    setSelectedMajorId(value);
  };

  const handleLevelChange = (name, value) => {
    setSelectedLevelId(value);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSelectedLevelId("");
    setSelectedMajorId("");
    setSortBy("rating_desc");
    setSearchType("all");
  };

  const handleRemoveFilter = (filterType) => {
    if (filterType === "level") setSelectedLevelId("");
    if (filterType === "major") setSelectedMajorId("");
    if (filterType === "search") {
      setSearchTerm("");
      setDebouncedSearchTerm("");
    }
  }; // Helper functions để hiển thị tên trong active filters
  const getLevelName = (id) => {
    console.log("getLevelName called with:", id);
    console.log("tutorLevelOptions:", tutorLevelOptions);
    const level = tutorLevelOptions.find((l) => l.tutorLevelId === id);
    console.log("Found level:", level);
    if (level) {
      return level.levelName;
    }
    // Fallback: nếu chưa load data hoặc không tìm thấy
    return isFilterDataLoading ? "Đang tải..." : id;
  };

  const getMajorName = (id) => {
    console.log("getMajorName called with:", id);
    console.log("majorOptions:", majorOptions);
    const major = majorOptions.find((m) => m.majorId === id);
    console.log("Found major:", major);
    if (major) {
      return major.majorName;
    }
    // Fallback: nếu chưa load data hoặc không tìm thấy
    return isFilterDataLoading ? "Đang tải..." : id;
  };

  return (
    <>
      <div className="tutor-search-page layout-2-columns">
        {/* Sidebar Filters */}
        <aside className="search-sidebar">
          <h3>Bộ lọc chi tiết</h3> {/* Level Filter */}
          <div className="filter-group sidebar-filter">
            <label htmlFor="level-filter-sidebar">Trình độ Gia sư</label>
            <TutorLevelList
              name="tutorLevelId"
              value={selectedLevelId}
              onChange={handleLevelChange}
              placeholder="-- Chọn trình độ --"
              required={false}
            />
          </div>
          {/* Major Filter */}
          <div className="filter-group sidebar-filter">
            <label htmlFor="major-filter-sidebar">Ngành học</label>
            <MajorList
              name="majorId"
              value={selectedMajorId}
              onChange={handleMajorChange}
              placeholder="-- Chọn ngành học --"
              required={false}
            />
          </div>
          {/* Reset Button */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="reset-button sidebar-reset-btn"
            aria-label="Đặt lại bộ lọc"
          >
            Đặt lại tất cả bộ lọc
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="search-main-content">
          {" "}
          {/* Top Search and Sort Bar */}
          <div className="top-search-sort-bar">
            <div className="search-input-container">
              <FaSearch className="search-input-icon" />
              <input
                type="text"
                placeholder={
                  searchType === "all"
                    ? "Tìm theo tên gia sư, trường đại học, môn học..."
                    : searchType === "name"
                    ? "Tìm theo tên gia sư..."
                    : searchType === "university"
                    ? "Tìm theo trường đại học..."
                    : "Tìm theo môn học..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="main-search-input"
                aria-label="Tìm kiếm gia sư"
              />
              <div className="search-type-selector">
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="search-type-select"
                  aria-label="Chọn loại tìm kiếm"
                >
                  <option value="all">Tất cả</option>
                  <option value="name">Tên gia sư</option>
                  <option value="university">Trường ĐH</option>
                  <option value="subject">Môn học</option>
                </select>
              </div>
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
                <option value="rating_asc">Đánh giá thấp nhất</option>
                <option value="price_asc">Xu thấp đến cao</option>
                <option value="price_desc">Xu cao đến thấp</option>
                <option value="experience_desc">Kinh nghiệm nhiều nhất</option>
                <option value="createdAt_desc">Mới tham gia</option>
                <option value="createdAt_asc">Cũ nhất</option>
              </select>
            </div>
          </div>
          {/* Active Filters Bar */}
          {(selectedLevelId || selectedMajorId || debouncedSearchTerm) && (
            <div className="active-filters-bar">
              <span>Đang lọc theo:</span>
              <div className="active-filters-list">
                {debouncedSearchTerm && (
                  <span key="filter-search" className="filter-tag">
                    Tên: {debouncedSearchTerm}
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
          )}{" "}
          {/* Tutor List Component */}
          <TutorList
            searchTerm={debouncedSearchTerm}
            searchType={searchType}
            selectedLevelId={selectedLevelId}
            selectedMajorId={selectedMajorId}
            sortBy={sortBy}
          />
        </main>
      </div>
    </>
  );
};

export default memo(TutorSearchPage);
