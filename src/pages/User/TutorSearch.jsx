// src/pages/User/TutorSearchPage.jsx
import { useState, useEffect } from "react";

// --- Import các thành phần UI và dữ liệu tĩnh ---
// *** Đảm bảo các đường dẫn import này là chính xác trong dự án của bạn ***
import HomePageLayout from "../../components/User/layout/HomePageLayout";
import majorList from "../../assets/data/mayjorList.json";
import tutorLevel from "../../assets/data/tutorLevel.json";
import "../../assets/css/TutorSearch.style.css"; // CSS chung
import { FaSearch, FaTimes } from "react-icons/fa";

// --- Import Component TutorList mới ---
// *** Đảm bảo đường dẫn này đúng với vị trí bạn đặt TutorList.jsx ***
import TutorList from "../../components/Static_Data/TutorList";


// ========== MAIN COMPONENT: TutorSearchPage ==========
const TutorSearchPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [selectedLevelId, setSelectedLevelId] = useState("");
    const [selectedMajorId, setSelectedMajorId] = useState("");
    const [sortBy, setSortBy] = useState("rating_desc"); // Mặc định

    // --- Debounce Search Term ---
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedSearchTerm(searchTerm); }, 500);
        return () => { clearTimeout(handler); };
    }, [searchTerm]);

    // --- Handlers ---
    const handleResetFilters = () => { setSearchTerm(""); setDebouncedSearchTerm(""); setSelectedLevelId(""); setSelectedMajorId(""); setSortBy("rating_desc"); };
    const handleRemoveFilter = (filterType) => { if (filterType === 'level') setSelectedLevelId(''); if (filterType === 'major') setSelectedMajorId(''); if (filterType === 'search') { setSearchTerm(''); setDebouncedSearchTerm('');} };

    // Component trả về MỘT thẻ HomePageLayout
    return (
        <HomePageLayout>
            {/* Bên trong là MỘT thẻ div */}
            <div className="tutor-search-page layout-2-columns">
                {/* Sidebar trả về MỘT thẻ aside */}
                <aside className="search-sidebar">
                    <h3>Bộ lọc chi tiết</h3>
                    <div className="filter-group sidebar-filter"> <label htmlFor="level-filter-sidebar">Trình độ Gia sư</label> <select id="level-filter-sidebar" value={selectedLevelId} onChange={(e)=>{setSelectedLevelId(e.target.value);}} aria-label="Lọc theo trình độ gia sư"> <option value="">Tất cả</option> {tutorLevel.map((level) => ( <option key={level.tutorLevelId} value={level.tutorLevelId}>{level.level_name}</option> ))} </select> </div>
                    <div className="filter-group sidebar-filter"> <label htmlFor="major-filter-sidebar">Ngành học</label> <select id="major-filter-sidebar" value={selectedMajorId} onChange={(e)=>{setSelectedMajorId(e.target.value);}} aria-label="Lọc theo ngành học gia sư"> <option value="">Tất cả</option> {majorList.map((major) => ( <option key={major.major_id} value={major.major_id}>{major.major_name}</option> ))} </select> </div>
                    <button type="button" onClick={handleResetFilters} className="reset-button sidebar-reset-btn" aria-label="Đặt lại bộ lọc">Đặt lại tất cả bộ lọc</button>
                </aside>

                 {/* Main Content trả về MỘT thẻ main */}
                <main className="search-main-content">
                    {/* Search/Sort Bar trả về MỘT thẻ div */}
                    <div className="top-search-sort-bar"> <div className="search-input-container"> <FaSearch className="search-input-icon" /> <input type="text" placeholder="Tìm theo tên gia sư..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="main-search-input" aria-label="Tìm kiếm gia sư" /> </div> <div className="sort-by-container"> <label htmlFor="sort-by-select">Sắp xếp theo:</label> <select id="sort-by-select" value={sortBy} onChange={(e)=>{ setSortBy(e.target.value); }} aria-label="Sắp xếp kết quả tìm kiếm"> <option value="rating_desc">Liên quan nhất</option> <option value="price_asc">Coin thấp đến cao</option> <option value="price_desc">Coin cao đến thấp</option> <option value="createdAt_desc">Mới nhất</option> </select> </div> </div>

                    {/* Active Filters trả về MỘT thẻ div hoặc null */}
                    {(selectedLevelId || selectedMajorId || debouncedSearchTerm) && (
                        <div className="active-filters-bar">
                            <span>Đang lọc theo:</span>
                            <div className="active-filters-list">
                                {debouncedSearchTerm && (<span className="filter-tag">Tên: {'"'}{debouncedSearchTerm}{'"'}<button onClick={()=>handleRemoveFilter('search')} aria-label="Xóa bộ lọc từ khóa"><FaTimes /></button></span>)}
                                {selectedLevelId && (<span className="filter-tag">Trình độ: {tutorLevel.find(l => l.tutorLevelId === selectedLevelId)?.level_name || selectedLevelId}<button onClick={()=>handleRemoveFilter('level')} aria-label="Xóa bộ lọc trình độ"><FaTimes /></button></span>)}
                                {selectedMajorId && (<span className="filter-tag">Ngành: {majorList.find(m => m.major_id === selectedMajorId)?.major_name || selectedMajorId}<button onClick={()=>handleRemoveFilter('major')} aria-label="Xóa bộ lọc ngành học"><FaTimes /></button></span>)}
                            </div>
                            <button className="clear-all-filters-btn" onClick={handleResetFilters}>Xóa tất cả bộ lọc</button>
                        </div>
                    )}

                    {/* Render TutorList */}
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