import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import TutorCardSkeleton from "../../components/User/TutorCardSkeleton"; // *** Điều chỉnh đường dẫn ***
import Api from "../../network/Api"; // *** Điều chỉnh đường dẫn ***
import { METHOD_TYPE } from "../../network/methodType"; // *** Điều chỉnh đường dẫn ***
import BookingModal from "../../components/User/BookingModal"; // *** Import Modal ***
import TutorCard from "../../components/User/TutorCard"; // *** Import TutorCard ***
import Pagination from "../../components/Pagination"; // *** Import Pagination ***
import "../../assets/css/TutorCardSkeleton.style.css"; // *** Điều chỉnh đường dẫn ***
import "../../assets/css/TutorSearch.style.css"; // *** Điều chỉnh đường dẫn ***
import "../../assets/css/BookingModal.style.css"; // *** Import CSS modal ***
// --- Cấu hình hạng gia sư ---
const tutorsPerPage = 8;

// --- Helper Function: mapApiTutorToCardProps (Trả về cả object bookingRequest) ---
const mapApiTutorToCardProps = (apiTutor) => {
  if (!apiTutor || !apiTutor.tutorProfile || !apiTutor.userId) {
    console.warn("Dữ liệu gia sư không hợp lệ:", apiTutor);
    return null;
  }
  const profile = apiTutor.tutorProfile;
  const avatar = profile.avatar || null;
  const fullname = profile.fullname || "Chưa cập nhật tên";
  const gender = profile.gender || null;
  const univercity = profile.univercity || "Chưa cập nhật trường";
  const gpa = profile.GPA || null;
  const description = profile.description || "Chưa có mô tả.";
  const teachingMethod = profile.teachingMethod || null;
  const coinPerHours =
    profile.coinPerHours !== null && profile.coinPerHours !== undefined
      ? profile.coinPerHours
      : 0;
  const teachingTime = profile.teachingTime
    ? parseFloat(profile.teachingTime)
    : null;
  const majorName = profile.major?.majorName || "Chưa cập nhật ngành";
  const levelName = profile.tutorLevel?.levelName || "Chưa cập nhật trình độ";
  const subjects = [
    profile.subject?.subjectName,
    profile.subject2?.subjectName,
    profile.subject3?.subjectName,
  ].filter(Boolean);
  const bookingRequest = profile.bookingRequest ?? null; // <-- Lấy cả object hoặc null
  let rankKey = "bronze";
  const levelNameLower = levelName?.toLowerCase();
  if (levelNameLower === "bạc") rankKey = "silver";
  else if (levelNameLower === "vàng") rankKey = "gold";
  else if (levelNameLower === "bạch kim") rankKey = "platinum";
  else if (levelNameLower === "kim cương") rankKey = "diamond";
  const rating =
    profile.averageRating !== null && profile.averageRating !== undefined
      ? profile.averageRating
      : 0;
  const reviewCount =
    profile.totalReviews !== null && profile.totalReviews !== undefined
      ? profile.totalReviews
      : 0;
  const isVerified =
    apiTutor.checkActive === "ACTIVE" && profile.isPublicProfile === true;
  const isInitiallyFavorite = false; // <<<<--- Cần logic lấy trạng thái yêu thích thực tế
  return {
    id: apiTutor.userId,
    imageUrl: avatar,
    name: fullname,
    gender: gender,
    university: univercity,
    GPA: gpa,
    description: description,
    teachingMethod: teachingMethod,
    hourlyRate: coinPerHours,
    teachingTime: teachingTime,
    major: majorName,
    level: levelName,
    subjects: subjects.length > 0 ? subjects : ["Chưa cập nhật môn dạy"],
    rating: parseFloat(rating.toFixed(1)),
    reviewCount: reviewCount,
    isVerified: isVerified,
    rank: rankKey,
    isInitiallyFavorite: isInitiallyFavorite,
    teachingPlace: profile.teachingPlace || null,
    bookingRequest: bookingRequest,
  };
};

// ========== COMPONENT CHÍNH: TutorList ==========
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
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState(null);

  // --- Hàm gọi API fetchTutorsData (Bao gồm Filter/Sort) ---
  const fetchTutorsData = useCallback(
    async (pageToFetch = 1) => {
      console.log(`Đang tải trang: ${pageToFetch} với filters/sort`);
      setIsLoading(true);
      setError(null);
      const filterParams = [];
      if (searchTerm)
        filterParams.push({
          key: "fullname",
          operator: "like",
          value: searchTerm,
        });
      if (selectedMajorId)
        filterParams.push({
          key: "majorId",
          operator: "=",
          value: selectedMajorId,
        });
      if (selectedLevelId)
        filterParams.push({
          key: "tutorLevelId",
          operator: "=",
          value: selectedLevelId,
        });
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
        console.log("Phản hồi API:", response.data.items);
        if (response?.data?.items && Array.isArray(response.data.items)) {
          const apiData = response.data;
          const mappedTutors = apiData.items
            .map(mapApiTutorToCardProps)
            .filter(Boolean);
          setTutors(mappedTutors);
          setTotalTutors(apiData.total || 0);
        } else {
          console.warn(
            "Định dạng phản hồi API không mong đợi:",
            response?.data
          );
          setTutors([]);
          setTotalTutors(0);
        }
      } catch (err) {
        console.error("Lỗi tải danh sách gia sư:", err);
        setError("Không thể tải danh sách gia sư. Vui lòng thử lại sau.");
        setTutors([]);
        setTotalTutors(0);
      } finally {
        setIsLoading(false);
      }
    },
    [searchTerm, selectedLevelId, selectedMajorId, sortBy]
  );

  // --- useEffect gọi API ---
  useEffect(() => {
    console.log("Filter/Sort thay đổi hoặc component mount. Đang tải trang 1.");
    setCurrentPage(1);
    fetchTutorsData(1);
  }, [fetchTutorsData]);

  // --- Handler phân trang ---
  const handlePageChange = (pageNumber) => {
    const totalPages = Math.ceil(totalTutors / tutorsPerPage);
    if (
      pageNumber >= 1 &&
      pageNumber <= totalPages &&
      pageNumber !== currentPage
    ) {
      setCurrentPage(pageNumber);
      fetchTutorsData(pageNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // --- Hàm Mở/Đóng Modal ---
  const handleOpenBookingModal = useCallback((tutor) => {
    setSelectedTutorForBooking(tutor);
    setIsBookingModalOpen(true);
  }, []);
  const handleCloseBookingModal = useCallback(() => {
    setIsBookingModalOpen(false);
    setSelectedTutorForBooking(null);
  }, []);

  // --- Hàm Xử lý sau khi booking thành công -> LOAD LẠI DATA ---
  const handleBookingSuccessInList = useCallback(
    (bookedTutorId) => {
      console.log(
        `Booking request successful for ${bookedTutorId}. Refetching current page (${currentPage}).`
      );
      handleCloseBookingModal();
      fetchTutorsData(currentPage); // Load lại dữ liệu trang hiện tại
    },
    [currentPage, fetchTutorsData, handleCloseBookingModal]
  );

  // --- Hàm Xử lý sau khi hủy thành công -> LOAD LẠI DATA ---
  const handleCancelSuccessInList = useCallback(
    (cancelledTutorId) => {
      console.log(
        `Booking cancel successful for ${cancelledTutorId}. Refetching current page (${currentPage}).`
      );
      fetchTutorsData(currentPage); // Load lại dữ liệu trang hiện tại
    },
    [currentPage, fetchTutorsData]
  );

  // --- Tính toán phân trang ---
  const totalPages = Math.ceil(totalTutors / tutorsPerPage);
  const indexOfFirstTutor = (currentPage - 1) * tutorsPerPage;
  const indexOfLastTutorOnPage = indexOfFirstTutor + tutors.length;

  return (
    <section className="search-results-section">
      <div className="results-header">
        {" "}
        {error && <p className="error-message">{error}</p>}{" "}
        {!error && (
          <p className="results-count">
            {isLoading && currentPage === 1
              ? "Đang tìm kiếm gia sư..."
              : !isLoading && totalTutors > 0
              ? `Hiển thị ${
                  indexOfFirstTutor + 1
                } - ${indexOfLastTutorOnPage} trên tổng ${totalTutors} gia sư`
              : !isLoading && totalTutors === 0
              ? "Không tìm thấy gia sư phù hợp"
              : ""}
          </p>
        )}{" "}
      </div>
      {isLoading && tutors.length === 0 ? (
        <div className="tutor-list redesigned-list loading">
          {Array.from({ length: tutorsPerPage }).map((_, index) => (
            <TutorCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      ) : !error && tutors.length > 0 ? (
        <>
          {" "}
          <div className="tutor-list redesigned-list">
            {tutors.map((tutor) => (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
                onOpenBookingModal={handleOpenBookingModal}
                onCancelSuccess={handleCancelSuccessInList}
              />
            ))}
          </div>{" "}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}{" "}
        </>
      ) : !isLoading && !error && totalTutors === 0 ? (
        <p className="no-results">
          Không tìm thấy gia sư nào phù hợp với tiêu chí của bạn. Vui lòng thử
          lại hoặc đặt lại bộ lọc.
        </p>
      ) : null}
      {selectedTutorForBooking && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={handleCloseBookingModal}
          tutorId={selectedTutorForBooking.id}
          tutorName={selectedTutorForBooking.name}
          onBookingSuccess={handleBookingSuccessInList}
          maxHoursPerLesson={selectedTutorForBooking.teachingTime}
        />
      )}
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
