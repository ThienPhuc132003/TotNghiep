import { useState, useEffect, useCallback } from "react";
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

const mapApiTutorToCardProps = async (
  apiTutor,
  isLoggedInFlag,
) => {
  if (!apiTutor || !apiTutor.tutorProfile || !apiTutor.userId) {
    console.warn("[mapApiTutorToCardProps] Invalid apiTutor data:", apiTutor);
    return null;
  }
  const profile = apiTutor.tutorProfile;
  const tutorIdForAPI = profile.userId;

  const avatar = profile.avatar || null;
  const fullname = profile.fullname || "Gia sư ẩn danh";
  const coinPerHours = profile.coinPerHours ?? 0;
  const levelName = profile.tutorLevel?.levelName || "Chưa cập nhật";
  let rankKey = "bronze";
  const lNL =
    typeof levelName === "string"
      ? levelName.toLowerCase().replace(/\s+/g, "")
      : "";
  if (lNL === "bạc" || lNL === "silver") rankKey = "silver";
  else if (lNL === "vàng" || lNL === "gold") rankKey = "gold";
  else if (lNL === "bạchkim" || lNL === "platinum") rankKey = "platinum";
  else if (lNL === "kimcương" || lNL === "diamond") rankKey = "diamond";
  const apiRating = profile.rating;
  const apiNumberOfRating = profile.numberOfRating;

  let finalDetailedStatus = null;
  let finalBookingId = null;
  let apiIsTutorAcceptingRequestFlag = null;

  if (isLoggedInFlag) {
    if (typeof profile.isBookingRequestAccepted === "boolean") {
      apiIsTutorAcceptingRequestFlag = profile.isBookingRequestAccepted;
    }

    if (apiIsTutorAcceptingRequestFlag === true) {
      try {
        const acceptedBookingResponse = await Api({
          endpoint: `booking-request/get-my-booking-request-accept/${tutorIdForAPI}`,
          method: METHOD_TYPE.GET,
          requireToken: true,
        });
        if (
          acceptedBookingResponse?.data?.items &&
          acceptedBookingResponse.data.items.length > 0
        ) {
          const acceptedRequest = acceptedBookingResponse.data.items.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          )[0];
          if (
            acceptedRequest &&
            acceptedRequest.status &&
            acceptedRequest.status.toUpperCase() === "ACCEPT"
          ) {
            finalDetailedStatus = "ACCEPT";
            finalBookingId = acceptedRequest.bookingRequestId;
          } else {
            console.warn(
              `TutorList: API isBookingRequestAccepted=true cho tutor ${tutorIdForAPI} nhưng API phụ không có YC ACCEPT hợp lệ.`
            );
            if (profile.bookingRequest && profile.bookingRequest.status) {
              finalDetailedStatus = profile.bookingRequest.status.toUpperCase();
              finalBookingId =
                profile.bookingRequest.bookingRequestId ||
                profile.bookingRequestId;
            }
          }
        } else {
          console.warn(
            `TutorList: API isBookingRequestAccepted=true cho tutor ${tutorIdForAPI} nhưng API phụ không trả về items.`
          );
          if (profile.bookingRequest && profile.bookingRequest.status) {
            finalDetailedStatus = profile.bookingRequest.status.toUpperCase();
            finalBookingId =
              profile.bookingRequest.bookingRequestId ||
              profile.bookingRequestId;
          }
        }
      } catch (error) {
        console.error(
          `TutorList: Lỗi gọi API get-my-booking-request-accept cho tutor ${tutorIdForAPI}:`,
          error
        );
        if (profile.bookingRequest && profile.bookingRequest.status) {
          finalDetailedStatus = profile.bookingRequest.status.toUpperCase();
          finalBookingId =
            profile.bookingRequest.bookingRequestId || profile.bookingRequestId;
        } else if (
          profile.isBookingRequest === true &&
          (profile.bookingRequestId || profile.bookingRequest?.bookingRequestId)
        ) {
          finalDetailedStatus = "REQUEST";
          finalBookingId =
            profile.bookingRequestId ||
            profile.bookingRequest?.bookingRequestId;
        }
      }
    } else {
      if (profile.bookingRequest && profile.bookingRequest.status) {
        finalDetailedStatus = profile.bookingRequest.status.toUpperCase();
        finalBookingId =
          profile.bookingRequest.bookingRequestId || profile.bookingRequestId;
      } else if (
        profile.isBookingRequest === true &&
        (profile.bookingRequestId || profile.bookingRequest?.bookingRequestId)
      ) {
        finalDetailedStatus = "REQUEST";
        finalBookingId =
          profile.bookingRequestId || profile.bookingRequest?.bookingRequestId;
      }
    }
  }

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
      apiRating !== null && apiRating !== undefined ? parseFloat(apiRating) : 0,
    reviewCount: apiNumberOfRating || 0,
    isVerified:
      apiTutor.checkActive === "ACTIVE" && profile.isPublicProfile === true,
    rank: rankKey,
    hourlyRate: coinPerHours,
    teachingTime: profile.teachingTime
      ? parseFloat(profile.teachingTime)
      : null,
    isTutorAcceptingRequestAPIFlag: apiIsTutorAcceptingRequestFlag,
    bookingInfoCard: {
      status: finalDetailedStatus,
      bookingId: finalBookingId,
    },
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
  const currentUserId = useSelector((state) => state.user.userProfile?.userId);

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

        const response = await Api({
          endpoint: endpoint,
          method: METHOD_TYPE.GET,
          query: query,
          requireToken: isLoggedIn,
        });

        if (response?.data?.items && Array.isArray(response.data.items)) {
          const mappedTutorsPromises = response.data.items.map((apiTutor) =>
            mapApiTutorToCardProps(apiTutor, isLoggedIn, currentUserId)
          );
          const mappedTutors = (await Promise.all(mappedTutorsPromises)).filter(
            Boolean
          );
          setTutors(mappedTutors);
          setTotalTutors(response.data.total || 0);
        } else {
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
    [
      isLoggedIn,
      currentUserId,
      searchTerm,
      selectedLevelId,
      selectedMajorId,
      sortBy,
    ]
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
        requireLogin("gửi yêu cầu thuê gia sư");
        return;
      }
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
    fetchTutorsData(currentPage);
  }, [currentPage, fetchTutorsData]);

  const handleConfirmHireSuccessInList = useCallback(() => {
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
  const indexOfLastTutorOnPage = Math.min(
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
                } - ${indexOfLastTutorOnPage} của ${totalTutors} gia sư`
              : !isLoading && totalTutors === 0
              ? "Không tìm thấy gia sư nào phù hợp."
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
                onConfirmHireSuccess={handleConfirmHireSuccessInList}
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
