import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux"; // *** THÊM: Để lấy trạng thái đăng nhập ***
import { toast } from "react-toastify"; // *** THÊM: Để hiển thị thông báo ***
import "react-toastify/dist/ReactToastify.css"; // *** THÊM: CSS cho react-toastify ***

import TutorCardSkeleton from "../../components/User/TutorCardSkeleton";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import BookingModal from "../../components/User/BookingModal";
import TutorCard from "../../components/User/TutorCard";
import Pagination from "../../components/Pagination";
import "../../assets/css/TutorCardSkeleton.style.css";
import "../../assets/css/TutorSearch.style.css";
import "../../assets/css/BookingModal.style.css";

// --- Cấu hình hạng gia sư ---
const tutorsPerPage = 8;

// --- Helper Function: mapApiTutorToCardProps (Giữ nguyên) ---
const mapApiTutorToCardProps = (apiTutor) => {
  // ... (Giữ nguyên code của bạn) ...
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
  const bookingRequest = profile.bookingRequest ?? null;
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
  const isInitiallyFavorite = false;
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
    bookingRequest: bookingRequest, // bookingRequest vẫn được lấy, nhưng chỉ dùng khi đăng nhập
  };
};

// ========== COMPONENT CHÍNH: TutorList ==========
const TutorList = ({
  searchTerm,
  selectedLevelId,
  selectedMajorId,
  sortBy,
}) => {
  // *** Lấy trạng thái đăng nhập từ Redux Store ***
  // Giả sử `userId` tồn tại trong profile khi đăng nhập thành công
  const isLoggedIn = useSelector((state) => !!state.user.userProfile?.userId);
  const tesst = useSelector((state) => state.user.userProfile);
  console.log("Test thuw coi", tesst); // Kiểm tra trạng thái đăng nhập
  // Hoặc nếu bạn có state `isLoggedIn` riêng:
  // const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

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
      console.log(
        `Đang tải trang: ${pageToFetch} với filters/sort. Logged in: ${isLoggedIn}`
      );
      setIsLoading(true);
      setError(null);

      // --- **CHỌN ENDPOINT DỰA TRÊN TRẠNG THÁI ĐĂNG NHẬP** ---
      const endpoint = isLoggedIn
        ? "user/get-list-tutor-public" // API cho người dùng đã đăng nhập
        : "user/get-list-tutor-public-without-login"; // API cho khách

      // --- Các tham số filter/sort giữ nguyên ---
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
        case "rating_desc": /* Thêm logic sort theo rating nếu có */
        default:
          sortParams.push({ key: "createdAt", type: "DESC" });
          break;
      }

      try {
        const response = await Api({
          endpoint: endpoint, // *** SỬ DỤNG ENDPOINT ĐỘNG ***
          method: METHOD_TYPE.GET,
          query: {
            filter: filterParams,
            sort: sortParams,
            page: pageToFetch,
            rpp: tutorsPerPage,
          },
          // Quan trọng: KHÔNG gửi token nếu gọi API cho khách
          // Thư viện Api của bạn cần có logic không gửi header Authorization nếu không có token
          // Hoặc bạn có thể thêm tùy chọn để không gửi token:
          // requireToken: isLoggedIn // Ví dụ, nếu thư viện Api hỗ trợ
        });

        console.log(`Phản hồi từ ${endpoint}:`, response.data?.items);

        if (response?.data?.items && Array.isArray(response.data.items)) {
          const apiData = response.data;
          // Map dữ liệu như cũ, mapApiTutorToCardProps sẽ trả về null nếu thiếu tutorProfile
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
        console.error(`Lỗi tải danh sách gia sư từ ${endpoint}:`, err);
        // Xử lý lỗi 401/403 nếu cần (ví dụ: token hết hạn -> logout)
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403) &&
          isLoggedIn
        ) {
          setError(
            "Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại."
          );
          // Có thể thêm logic logout tự động ở đây
        } else {
          setError("Không thể tải danh sách gia sư. Vui lòng thử lại sau.");
        }
        setTutors([]);
        setTotalTutors(0);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoggedIn, searchTerm, selectedLevelId, selectedMajorId, sortBy] // *** THÊM isLoggedIn vào dependencies ***
  );

  // --- useEffect gọi API ---
  useEffect(() => {
    console.log(
      "Filter/Sort/Login Status thay đổi hoặc component mount. Đang tải trang 1."
    );
    setCurrentPage(1); // Reset về trang 1 khi filter thay đổi
    fetchTutorsData(1); // Gọi fetch với trang 1
  }, [fetchTutorsData]); // fetchTutorsData đã bao gồm các dependency khác

  // --- Handler phân trang (Giữ nguyên) ---
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

  // --- Hàm Mở Modal (Đã cập nhật) ---
  const handleOpenBookingModal = useCallback(
    (tutor) => {
      if (isLoggedIn) {
        // Nếu đã đăng nhập, mở modal như cũ
        setSelectedTutorForBooking(tutor);
        setIsBookingModalOpen(true);
      } else {
        // Nếu chưa đăng nhập, hiển thị thông báo
        toast.info("Vui lòng đăng nhập để thực hiện chức năng này!");
        // Tùy chọn: Chuyển hướng đến trang đăng nhập sau một khoảng thời gian ngắn hoặc ngay lập tức
        // setTimeout(() => navigate('/login'), 2000);
        // navigate('/login', { state: { from: location } }); // Cần import useLocation
      }
    },
    [isLoggedIn]
  ); // *** THÊM isLoggedIn, navigate vào dependencies ***

  // --- Hàm Đóng Modal (Giữ nguyên) ---
  const handleCloseBookingModal = useCallback(() => {
    setIsBookingModalOpen(false);
    setSelectedTutorForBooking(null);
  }, []);

  // --- Hàm Xử lý sau khi booking thành công (Chỉ xảy ra khi đã đăng nhập) ---
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

  // --- Hàm Xử lý sau khi hủy thành công (Chỉ xảy ra khi đã đăng nhập) ---
  const handleCancelSuccessInList = useCallback(
    (cancelledTutorId) => {
      console.log(
        `Booking cancel successful for ${cancelledTutorId}. Refetching current page (${currentPage}).`
      );
      // Chú ý: API cho khách không trả về bookingRequest, nên nút hủy sẽ không hiển thị
      // Nếu TutorCard hiển thị nút hủy dựa trên bookingRequest, nó sẽ tự ẩn đi khi chưa đăng nhập.
      fetchTutorsData(currentPage); // Load lại dữ liệu trang hiện tại
    },
    [currentPage, fetchTutorsData]
  );

  // --- Tính toán phân trang (Giữ nguyên) ---
  const totalPages = Math.ceil(totalTutors / tutorsPerPage);
  const indexOfFirstTutor = (currentPage - 1) * tutorsPerPage;
  const indexOfLastTutorOnPage = indexOfFirstTutor + tutors.length;

  return (
    // Phần JSX render giữ nguyên cấu trúc, chỉ cần đảm bảo
    // các hàm callback được truyền đúng và `TutorCard` xử lý việc
    // hiển thị/ẩn nút "Thuê" hoặc "Hủy" dựa trên dữ liệu `tutor.bookingRequest`
    // (API cho khách sẽ không có trường này).
    <section className="search-results-section">
      <div className="results-header">
        {error && <p className="error-message">{error}</p>}
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
              <TutorCard
                key={tutor.id}
                tutor={tutor}
                // Truyền hàm xử lý mở modal đã được cập nhật
                onOpenBookingModal={handleOpenBookingModal}
                // Hàm hủy chỉ hoạt động khi có bookingRequest (tức là đã đăng nhập)
                onCancelSuccess={handleCancelSuccessInList}
                // Có thể thêm prop isLoggedIn nếu TutorCard cần thay đổi giao diện
                // isLoggedIn={isLoggedIn}
              />
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

      {/* BookingModal chỉ render khi isBookingModalOpen là true (chỉ xảy ra khi isLoggedIn) */}
      {isLoggedIn && selectedTutorForBooking && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={handleCloseBookingModal}
          tutorId={selectedTutorForBooking.id}
          tutorName={selectedTutorForBooking.name}
          onBookingSuccess={handleBookingSuccessInList}
          maxHoursPerLesson={selectedTutorForBooking.teachingTime}
        />
      )}
      {/* Đảm bảo ToastContainer được render ở đâu đó trong App.js hoặc layout chính */}
      {/* <ToastContainer position="top-right" autoClose={3000} /> */}
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
