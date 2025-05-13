import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TutorCardSkeleton from "../../components/User/TutorCardSkeleton";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import BookingModal from "../User/BookingModal"; // Điều chỉnh đường dẫn nếu cần
import TutorCard from "../../components/User/TutorCard"; // Điều chỉnh đường dẫn nếu cần
import Pagination from "../Pagination"; // Điều chỉnh đường dẫn nếu cần
import "../../assets/css/TutorCardSkeleton.style.css";
import "../../assets/css/TutorSearch.style.css";
import "../../assets/css/BookingModal.style.css";

const TUTORS_PER_PAGE = 8;

// --- mapApiTutorToCardProps ĐÃ CẬP NHẬT ---
const mapApiTutorToCardProps = (apiTutor) => {
  if (!apiTutor || !apiTutor.tutorProfile || !apiTutor.userId) {
    console.warn("Dữ liệu gia sư không hợp lệ trong mapApiTutor:", apiTutor);
    return null;
  }
  const profile = apiTutor.tutorProfile;
  const avatar = profile.avatar || null;
  const fullname = profile.fullname || "Gia sư ẩn danh";
  const coinPerHours =
    profile.coinPerHours !== null && profile.coinPerHours !== undefined
      ? profile.coinPerHours
      : 0;
  const levelName = profile.tutorLevel?.levelName || "Chưa cập nhật";

  let rankKey = "bronze";
  const levelNameLower =
    typeof levelName === "string" ? levelName.toLowerCase() : "";

  if (levelNameLower === "bạc") rankKey = "silver";
  else if (levelNameLower === "vàng") rankKey = "gold";
  else if (levelNameLower === "bạch kim") rankKey = "platinum";
  else if (levelNameLower === "kim cương") rankKey = "diamond";

  return {
    id: apiTutor.userId,
    imageUrl: avatar,
    name: fullname,
    major: profile.major?.majorName || "Chưa cập nhật",
    level: levelName,
    subjects: [
      profile.subject?.subjectName,
      profile.subject2?.subjectName,
      profile.subject3?.subjectName,
    ].filter(Boolean).length
      ? [
          profile.subject?.subjectName,
          profile.subject2?.subjectName,
          profile.subject3?.subjectName,
        ].filter(Boolean)
      : ["Chưa cập nhật môn dạy"],
    rating: profile.averageRating
      ? parseFloat(profile.averageRating.toFixed(1))
      : 0,
    reviewCount: profile.totalReviews || 0,
    isVerified:
      apiTutor.checkActive === "ACTIVE" && profile.isPublicProfile === true,
    rank: rankKey,
    hourlyRate: coinPerHours,
    teachingTime: profile.teachingTime
      ? parseFloat(profile.teachingTime)
      : null,
    // Giữ lại object bookingRequest đầy đủ để TutorCard có thể đọc status
    bookingRequest: profile.bookingRequest ?? null,
    // Trích xuất bookingRequestId riêng để dễ dùng cho việc hủy
    bookingRequestId: profile.bookingRequest?.bookingRequestId || null, // LẤY TỪ ĐÂY
    isInitiallyFavorite: profile.isMyFavouriteTutor ?? false,
    teachingPlace: profile.teachingPlace || "Chưa cập nhật",
    description: profile.description || "Chưa có mô tả.",
    gender: profile.gender,
    university: profile.univercity || "Chưa cập nhật",
    GPA: profile.GPA,
    teachingMethod: profile.teachingMethod,
    dateTimeLearn: profile.dateTimeLearn || [],
  };
};

const TutorList = ({
  searchTerm,
  selectedLevelId,
  selectedMajorId,
  sortBy,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useSelector((state) => !!state.user.userProfile?.userId);

  const [tutors, setTutors] = useState([]);
  const [totalTutors, setTotalTutors] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState(null);

  const requireLogin = useCallback(
    (actionName = "thực hiện chức năng này") => {
      toast.info(`Vui lòng đăng nhập để ${actionName}!`);
      navigate("/login", { state: { from: location } });
    },
    [navigate, location]
  );

  // --- fetchTutorsData (phiên bản không có filter/sort để test) ---
  const fetchTutorsData = useCallback(
    async (pageToFetch = 1) => {
      console.log(
        `Đang tải trang: ${pageToFetch}. Logged in: ${isLoggedIn}. (Bỏ qua filter/sort)`
      );
      setIsLoading(true);
      setError(null); // Reset lỗi trước khi fetch

      const endpoint = isLoggedIn
        ? "user/get-list-tutor-public"
        : "user/get-list-tutor-public-without-login";

      try {
        const response = await Api({
          endpoint: endpoint,
          method: METHOD_TYPE.GET,
          query: {
            page: pageToFetch,
            rpp: TUTORS_PER_PAGE,
          },
          requireToken: isLoggedIn,
        });

        console.log(`Phản hồi từ ${endpoint} (No Filter/Sort):`, response.data);

        if (response?.data?.items && Array.isArray(response.data.items)) {
          const apiData = response.data;
          const mappedTutors = apiData.items
            .map(mapApiTutorToCardProps) // Đảm bảo hàm map này đúng
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
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403) &&
          isLoggedIn
        ) {
          setError(
            "Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại."
          );
        } else {
          setError("Không thể tải danh sách gia sư. Vui lòng thử lại sau.");
        }
        // Không reset tutors ở đây để giữ data cũ nếu fetch trang mới lỗi
        // setTutors([]);
        // setTotalTutors(0);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoggedIn] // Chỉ fetch lại khi login status thay đổi (trong phiên bản test này)
  );

  useEffect(() => {
    console.log(
      "Trạng thái đăng nhập thay đổi hoặc component mount. Đang tải trang 1 (không filter/sort)."
    );
    setCurrentPage(1);
    fetchTutorsData(1);
  }, [fetchTutorsData]);

  const handlePageChange = (pageNumber) => {
    const totalPagesCalculated = Math.ceil(totalTutors / TUTORS_PER_PAGE);
    if (
      pageNumber >= 1 &&
      pageNumber <= totalPagesCalculated &&
      pageNumber !== currentPage
    ) {
      setCurrentPage(pageNumber);
      fetchTutorsData(pageNumber); // Fetch trang mới
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleOpenBookingModal = useCallback(
    (tutor) => {
      if (!isLoggedIn) {
        requireLogin("thuê gia sư");
        return;
      }
      setSelectedTutorForBooking(tutor);
      setIsBookingModalOpen(true);
    },
    [isLoggedIn, requireLogin]
  );

  const handleCloseBookingModal = useCallback(() => {
    setIsBookingModalOpen(false);
    setSelectedTutorForBooking(null);
  }, []);

  // Callback khi đặt lịch thành công từ modal
  const handleBookingSuccessInList = useCallback(
    () => {
      handleCloseBookingModal();
      toast.success("Yêu cầu thuê gia sư đã được gửi thành công!");
      // Fetch lại trang hiện tại để cập nhật trạng thái booking của card đó
      fetchTutorsData(currentPage);
    },
    [currentPage, fetchTutorsData, handleCloseBookingModal] // Thêm fetchTutorsData
  );

  // Callback khi hủy yêu cầu thành công từ TutorCard
  const handleCancelSuccessInList = useCallback(
    () => {
      toast.success("Đã hủy yêu cầu thuê gia sư.");
      // Fetch lại trang hiện tại để cập nhật trạng thái booking của card đó
      fetchTutorsData(currentPage);
    },
    [currentPage, fetchTutorsData] // Thêm fetchTutorsData
  );

  // Callback khi trạng thái yêu thích thay đổi từ TutorCard
  const handleFavoriteStatusChanged = useCallback(
    (tutorId, newIsFavorite) => {
      // Cập nhật UI ngay lập tức mà không cần fetch lại
      setTutors((prevTutors) =>
        prevTutors.map((t) =>
          t.id === tutorId ? { ...t, isInitiallyFavorite: newIsFavorite } : t
        )
      );
    },
    [] // Không cần dependencies
  );

  const totalPages = Math.ceil(totalTutors / TUTORS_PER_PAGE);
  const indexOfFirstTutor = (currentPage - 1) * TUTORS_PER_PAGE;
  const indexOfLastTutorOnPage = Math.min(
    indexOfFirstTutor + TUTORS_PER_PAGE,
    totalTutors
  );

  return (
    <section className="search-results-section">
      <div className="results-header">
        {/* Hiển thị lỗi nếu có */}
        {error && <p className="error-message">{error}</p>}
        {/* Hiển thị số lượng kết quả */}
        {!error && (
          <p className="results-count">
            {isLoading && tutors.length === 0
              ? "Đang tải danh sách gia sư..."
              : !isLoading && totalTutors > 0
              ? `Hiển thị ${
                  totalTutors > 0 ? indexOfFirstTutor + 1 : 0
                } - ${indexOfLastTutorOnPage} trên tổng ${totalTutors} gia sư`
              : !isLoading && totalTutors === 0
              ? "Không tìm thấy gia sư nào."
              : isLoading && tutors.length > 0
              ? `Đang tải thêm gia sư... (Tổng: ${totalTutors})` // Thông báo khi load trang mới
              : ""}
          </p>
        )}
      </div>

      {/* Skeleton loading khi đang load lần đầu và chưa có data */}
      {isLoading && tutors.length === 0 ? (
        <div className="tutor-list redesigned-list loading">
          {Array.from({ length: TUTORS_PER_PAGE }).map((_, index) => (
            <TutorCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      ) : !error && tutors.length > 0 ? ( // Hiển thị danh sách nếu không lỗi và có data
        <>
          <div className="tutor-list redesigned-list">
            {tutors.map((tutor) => (
              <TutorCard
                key={tutor.id}
                tutor={tutor} // tutor đã chứa bookingRequestId
                onOpenBookingModal={handleOpenBookingModal}
                onCancelSuccess={handleCancelSuccessInList} // Truyền callback hủy thành công
                isLoggedIn={isLoggedIn}
                onFavoriteStatusChange={handleFavoriteStatusChanged} // Truyền callback yêu thích
              />
            ))}
          </div>
          {/* Phân trang */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : !isLoading && !error && totalTutors === 0 ? ( // Hiển thị khi không load, không lỗi, không có data
        <p className="no-results">Không tìm thấy gia sư nào.</p>
      ) : null}

      {/* Booking Modal */}
      {selectedTutorForBooking && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={handleCloseBookingModal}
          tutorId={selectedTutorForBooking.id}
          tutorName={selectedTutorForBooking.name}
          onBookingSuccess={handleBookingSuccessInList} // Dùng callback của List
          maxHoursPerLesson={selectedTutorForBooking.teachingTime}
          availableScheduleRaw={selectedTutorForBooking.dateTimeLearn || []}
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
