import React,{ useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TutorCardSkeleton from "../../components/User/TutorCardSkeleton";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import BookingModal from "../User/BookingModal"; // Đảm bảo đường dẫn đúng
import TutorCard from "../../components/User/TutorCard"; // Đảm bảo đường dẫn đúng
import Pagination from "../Pagination"; // Đảm bảo đường dẫn đúng
import "../../assets/css/TutorCardSkeleton.style.css";
import "../../assets/css/TutorSearch.style.css";
import "../../assets/css/BookingModal.style.css";

const TUTORS_PER_PAGE = 8;

const mapApiTutorToCardProps = (apiTutor) => {
  if (!apiTutor || !apiTutor.tutorProfile || !apiTutor.userId) {
    console.warn(
      "[mapApiTutorToCardProps] Invalid apiTutor data, skipping:",
      apiTutor
    );
    return null;
  }
  const profile = apiTutor.tutorProfile;
  const avatar = profile.avatar || null;
  const fullname = profile.fullname || "Gia sư ẩn danh";
  const coinPerHours = profile.coinPerHours ?? 0;
  const levelName = profile.tutorLevel?.levelName || "Chưa cập nhật";
  let rankKey = "bronze";
  const lNL = typeof levelName === "string" ? levelName.toLowerCase() : "";
  if (lNL === "bạc") rankKey = "silver";
  else if (lNL === "vàng") rankKey = "gold";
  else if (lNL === "bạch kim") rankKey = "platinum";
  else if (lNL === "kim cương") rankKey = "diamond";

  let bookingRequestForCard = null;
  let idForCancellation = profile.bookingRequestId || null;

  if (profile.isBookingRequest === true) {
    bookingRequestForCard = {
      status: "REQUEST",
      bookingRequestId: idForCancellation,
    };
    if (!idForCancellation && profile.isBookingRequest !== null) {
      console.warn(
        "[mapApiTutorToCardProps] isBookingRequest=true, but bookingRequestId is null for tutor:",
        apiTutor.userId
      );
    }
  } else if (
    profile.bookingRequest &&
    typeof profile.bookingRequest === "object"
  ) {
    bookingRequestForCard = {
      status: profile.bookingRequest.status,
      bookingRequestId: profile.bookingRequest.bookingRequestId,
    };
    idForCancellation = profile.bookingRequest.bookingRequestId;
  }

  // SỬA Ở ĐÂY: Lấy đúng key từ API
  const apiRating = profile.rating; // Dữ liệu API của bạn dùng key "rating"
  const apiNumberOfRating = profile.numberOfRating; // Dữ liệu API của bạn dùng key "numberOfRating"

  console.log(
    `[mapApiTutorToCardProps] Tutor: ${profile.fullname}, API rating: ${apiRating}, API numberOfRating: ${apiNumberOfRating}, Mapped hourlyRate: ${coinPerHours}`
  );

  return {
    id: apiTutor.userId,
    imageUrl: avatar,
    name: fullname,
    major: profile.major?.majorName || "N/A",
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
      : ["N/A môn dạy"],
    rating:
      apiRating !== null && apiRating !== undefined ? parseFloat(apiRating) : 0, // Chuyển sang số, mặc định 0
    reviewCount: apiNumberOfRating || 0, // Mặc định 0 nếu không có
    isVerified:
      apiTutor.checkActive === "ACTIVE" && profile.isPublicProfile === true,
    rank: rankKey,
    hourlyRate: coinPerHours,
    teachingTime: profile.teachingTime
      ? parseFloat(profile.teachingTime)
      : null,
    bookingRequest: bookingRequestForCard,
    bookingRequestId: idForCancellation,
    isInitiallyFavorite: profile.isMyFavouriteTutor ?? false,
    teachingPlace: profile.teachingPlace || "N/A",
    description: profile.description || "Chưa có mô tả.",
    gender: profile.gender,
    university: profile.univercity || "N/A",
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
    (action = "thực hiện chức năng này") => {
      toast.info(`Vui lòng đăng nhập để ${action}!`);
      navigate("/login", { state: { from: location } });
    },
    [navigate, location]
  );

  const fetchTutorsData = useCallback(
    async (pageToFetch = 1) => {
      setIsLoading(true);
      setError(null);
      const endpoint = isLoggedIn
        ? "user/get-list-tutor-public"
        : "user/get-list-tutor-public-without-login";
      try {
        const query = { page: pageToFetch, rpp: TUTORS_PER_PAGE };
        if (searchTerm) query.searchTerm = searchTerm;
        if (selectedLevelId) query.levelId = selectedLevelId;
        if (selectedMajorId) query.majorId = selectedMajorId;
        if (sortBy) query.sortBy = sortBy;

        console.log(
          `[fetchTutorsData] Fetching page: ${pageToFetch}, LoggedIn: ${isLoggedIn}, Query:`,
          query
        );

        const response = await Api({
          endpoint: endpoint,
          method: METHOD_TYPE.GET,
          query: query,
          requireToken: isLoggedIn,
        });

        console.log(
          "[fetchTutorsData] API Response (r.data.items):",
          response?.data?.items
        );

        if (response?.data?.items && Array.isArray(response.data.items)) {
          const mappedTutors = response.data.items
            .map(mapApiTutorToCardProps)
            .filter(Boolean); // Loại bỏ các item null (nếu mapApiTutorToCardProps trả về null)
          setTutors(mappedTutors);
          setTotalTutors(response.data.total || 0);
        } else {
          console.warn(
            "[fetchTutorsData] No items found or invalid data structure",
            response?.data
          );
          setTutors([]);
          setTotalTutors(0);
        }
      } catch (err) {
        console.error(`[fetchTutorsData] Lỗi tải DSGS:`, err);
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403) &&
          isLoggedIn
        ) {
          setError(
            "Phiên đăng nhập có thể đã hết hạn. Vui lòng thử tải lại trang hoặc đăng nhập lại."
          );
        } else {
          setError("Không thể tải danh sách gia sư. Vui lòng thử lại sau.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isLoggedIn, searchTerm, selectedLevelId, selectedMajorId, sortBy]
  );

  useEffect(() => {
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
      fetchTutorsData(pageNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleOpenBookingModal = useCallback(
    (tutorDataFromCard) => {
      if (!isLoggedIn) {
        requireLogin("thuê gia sư");
        return;
      }
      console.log(
        "[TutorList DEBUG #1] Tutor data for booking modal (from TutorCard):",
        tutorDataFromCard
      );
      setSelectedTutorForBooking(tutorDataFromCard);
      setIsBookingModalOpen(true);
    },
    [isLoggedIn, requireLogin]
  );

  const handleCloseBookingModal = useCallback(() => {
    setIsBookingModalOpen(false);
    setSelectedTutorForBooking(null);
  }, []);

  const handleBookingSuccessInList = useCallback(() => {
    handleCloseBookingModal();
    toast.success("Yêu cầu thuê đã được gửi thành công!");
    fetchTutorsData(currentPage);
  }, [currentPage, fetchTutorsData, handleCloseBookingModal]);

  const handleCancelSuccessInList = useCallback(() => {
    toast.success("Đã hủy yêu cầu thuê thành công.");
    fetchTutorsData(currentPage);
  }, [currentPage, fetchTutorsData]);

  const handleFavoriteStatusChangeInList = useCallback(
    (tutorId, newIsFavorite) => {
      setTutors((prevTutors) =>
        prevTutors.map((t) =>
          t.id === tutorId ? { ...t, isInitiallyFavorite: newIsFavorite } : t
        )
      );
    },
    []
  );

  const totalPages = Math.ceil(totalTutors / TUTORS_PER_PAGE);
  const indexOfFirstTutor = (currentPage - 1) * TUTORS_PER_PAGE;
  const indexOfLastOnlineTutorOnPage = Math.min(
    indexOfFirstTutor + TUTORS_PER_PAGE,
    totalTutors
  );

  return (
    <section className="search-results-section">
      <div className="results-header">
        {error && <p className="error-message">{error}</p>}
        {!error && (
          <p className="results-count">
            {isLoading && tutors.length === 0
              ? "Đang tải danh sách gia sư..."
              : !isLoading && totalTutors > 0
              ? `Hiển thị ${
                  totalTutors > 0 ? indexOfFirstTutor + 1 : 0
                } - ${indexOfLastOnlineTutorOnPage} trên tổng số ${totalTutors} gia sư`
              : !isLoading && totalTutors === 0
              ? "Không tìm thấy gia sư nào phù hợp với tiêu chí của bạn."
              : isLoading && tutors.length > 0
              ? `Đang tải thêm... (Tổng số: ${totalTutors})`
              : ""}
          </p>
        )}
      </div>
      {isLoading && tutors.length === 0 ? (
        <div className="tutor-list redesigned-list loading">
          {Array.from({ length: TUTORS_PER_PAGE }).map((_, i) => (
            <TutorCardSkeleton key={`sk-${i}`} />
          ))}
        </div>
      ) : !error && tutors.length > 0 ? (
        <>
          <div className="tutor-list redesigned-list">
            {tutors.map((tutorProps) => (
              <TutorCard
                key={tutorProps.id}
                tutor={tutorProps}
                onOpenBookingModal={handleOpenBookingModal}
                onCancelSuccess={handleCancelSuccessInList}
                isLoggedIn={isLoggedIn}
                onFavoriteStatusChange={handleFavoriteStatusChangeInList}
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
        <p className="no-results">Không tìm thấy gia sư nào phù hợp.</p>
      ) : null}

      {selectedTutorForBooking && (
        <React.Fragment>
          {console.log(
            "[TutorList DEBUG #2] Rendering BookingModal with selectedTutor:",
            selectedTutorForBooking
          )}
          <BookingModal
            isOpen={isBookingModalOpen}
            onClose={handleCloseBookingModal}
            tutorId={selectedTutorForBooking.id}
            tutorName={selectedTutorForBooking.name}
            onBookingSuccess={handleBookingSuccessInList}
            maxHoursPerLesson={selectedTutorForBooking.teachingTime}
            availableScheduleRaw={selectedTutorForBooking.dateTimeLearn || []}
            hourlyRate={selectedTutorForBooking.hourlyRate}
          />
        </React.Fragment>
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
