// TutorList.jsx
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
import AcceptedRequestsModal from "../User/AcceptedRequestsModal";
import {
  updateTutorBookingStatusOptimistic,
  clearTutorBookingStatusOptimistic,
  updateTutorFavoriteStatus,
} from "../../utils/bookingStateHelpers";

const TUTORS_PER_PAGE = 8;

const mapApiTutorToCardProps = (apiTutor, isLoggedInFlag) => {
  if (!apiTutor || !apiTutor.tutorProfile || !apiTutor.userId) {
    console.warn("[mapApiTutorToCardProps] Invalid apiTutor data:", apiTutor);
    return null;
  }
  const profile = apiTutor.tutorProfile;

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
  let apiIsTutorAcceptingRequestFlagOutput = null;
  if (isLoggedInFlag) {
    if (typeof profile.isBookingRequestAccepted === "boolean") {
      apiIsTutorAcceptingRequestFlagOutput = profile.isBookingRequestAccepted;
      console.log(`[DEBUG isBookingRequestAccepted] Tutor ${fullname}:`, {
        isBookingRequestAccepted: profile.isBookingRequestAccepted,
        tutorId: apiTutor.userId,
        hasBookingRequest: !!profile.bookingRequest,
        bookingRequestStatus: profile.bookingRequest?.status,
      });
    } // Always process booking status regardless of isBookingRequestAccepted
    // This matches the logic in TutorDetailPage
    // Previously, the condition `if (apiIsTutorAcceptingRequestFlagOutput !== true)`
    // was skipping booking status logic when isBookingRequestAccepted = true,
    // which caused cancel buttons to not show for pending requests.
    // The isBookingRequestAccepted flag indicates if tutor accepts requests,
    // not whether there are existing pending requests to process.
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

    if (!finalBookingId) {
      finalBookingId =
        profile.bookingRequestId ||
        profile.bookingRequest?.bookingRequestId ||
        null;
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
    isTutorAcceptingRequestAPIFlag: apiIsTutorAcceptingRequestFlagOutput,
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

  const [tutors, setTutors] = useState([]);
  const [totalTutors, setTotalTutors] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState(null);

  const [isAcceptedRequestsModalOpen, setIsAcceptedRequestsModalOpen] =
    useState(false);
  const [selectedTutorForAccepted, setSelectedTutorForAccepted] =
    useState(null);

  const requireLogin = useCallback(
    (action = "thực hiện chức năng này") => {
      toast.info(`Vui lòng đăng nhập để ${action}!`);
      navigate("/login", { state: { from: location } });
    },
    [navigate, location] // navigate và location là dependencies
  );
  const fetchTutorsData = useCallback(
    async (pageToFetch = 1) => {
      setIsLoading(true);
      setError(null);
      // DEBUG: Clear previous debug data
      localStorage.removeItem("tutorDebugData");

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
          // DEBUG: Log raw API response for isBookingRequestAccepted analysis
          if (response.data.items.length > 0) {
            console.log(
              "[DEBUG API Response] Raw tutor data for isBookingRequestAccepted analysis:"
            );
            response.data.items.slice(0, 3).forEach((item, index) => {
              console.log(`  Tutor ${index + 1}:`, {
                tutorName: item.tutorProfile?.fullname || "Unknown",
                userId: item.userId,
                isBookingRequestAccepted:
                  item.tutorProfile?.isBookingRequestAccepted,
                isBookingRequest: item.tutorProfile?.isBookingRequest,
                bookingRequest: item.tutorProfile?.bookingRequest,
                bookingRequestId: item.tutorProfile?.bookingRequestId,
              });
            });
          }

          const mappedTutors = response.data.items
            .map((apiTutor) => mapApiTutorToCardProps(apiTutor, isLoggedIn)) // Không còn async map ở đây
            .filter(Boolean);
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
    [isLoggedIn, searchTerm, selectedLevelId, selectedMajorId, sortBy] // Dependencies của fetchTutorsData
  );

  useEffect(() => {
    setCurrentPage(1);
    fetchTutorsData(1);
  }, [fetchTutorsData]);

  const handlePageChange = useCallback(
    (pageNumber) => {
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
    },
    [totalTutors, currentPage, fetchTutorsData]
  ); // Dependencies cho handlePageChange

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
  const handleBookingSuccessInList = useCallback(
    (tutorId, newBookingStatus) => {
      console.log("[DEBUG handleBookingSuccessInList] Called with:", {
        tutorId,
        newBookingStatus,
      });

      handleCloseBookingModal();
      toast.success("Yêu cầu thuê đã được gửi thành công!");

      // Update local state using helper function
      setTutors((prevTutors) => {
        console.log("[DEBUG handleBookingSuccessInList] Before update:", {
          prevTutors: prevTutors.map((t) => ({
            id: t.id,
            name: t.name,
            bookingInfoCard: t.bookingInfoCard,
          })),
          tutorToUpdate: prevTutors.find((t) => t.id === tutorId)
            ?.bookingInfoCard,
          totalTutors: prevTutors.length,
        });

        // Find the tutor being updated
        const tutorToUpdate = prevTutors.find((t) => t.id === tutorId);
        if (!tutorToUpdate) {
          console.error(
            "[DEBUG handleBookingSuccessInList] Tutor not found with ID:",
            tutorId
          );
          console.log(
            "[DEBUG handleBookingSuccessInList] Available tutor IDs:",
            prevTutors.map((t) => t.id)
          );
          return prevTutors; // Return unchanged if tutor not found
        }
        const updatedTutors = updateTutorBookingStatusOptimistic(
          prevTutors,
          tutorId,
          newBookingStatus
        );

        console.log("[DEBUG handleBookingSuccessInList] After update:", {
          updatedTutors: updatedTutors.map((t) => ({
            id: t.id,
            name: t.name,
            bookingInfoCard: t.bookingInfoCard,
          })),
          updatedTutor: updatedTutors.find((t) => t.id === tutorId)
            ?.bookingInfoCard,
          updateSuccess: !!updatedTutors.find(
            (t) =>
              t.id === tutorId &&
              t.bookingInfoCard?.status === newBookingStatus.status
          ),
        });

        // Force re-render by creating a completely new array reference
        return [...updatedTutors];
      });

      // Add a small delay to check if the state actually updated
      setTimeout(() => {
        console.log(
          "[DEBUG handleBookingSuccessInList] State verification after timeout:"
        );
        setTutors((currentTutors) => {
          const verifyTutor = currentTutors.find((t) => t.id === tutorId);
          console.log("Current tutor state after update:", {
            tutorId,
            foundTutor: !!verifyTutor,
            bookingInfoCard: verifyTutor?.bookingInfoCard,
            expectedStatus: newBookingStatus.status,
            actualStatus: verifyTutor?.bookingInfoCard?.status,
            statusMatch:
              verifyTutor?.bookingInfoCard?.status === newBookingStatus.status,
          });
          return currentTutors; // Don't change state, just verify
        });
      }, 100);
    },
    [handleCloseBookingModal]
  );
  const handleCancelSuccessInList = useCallback((tutorId) => {
    // Update local state using optimistic helper function
    setTutors((prevTutors) =>
      clearTutorBookingStatusOptimistic(prevTutors, tutorId)
    );
    toast.success("Đã hủy yêu cầu thành công!");
  }, []);
  const handleFavoriteStatusChangeInList = useCallback(
    (tutorId, newIsFavorite) => {
      setTutors((prevTutors) =>
        updateTutorFavoriteStatus(prevTutors, tutorId, newIsFavorite)
      );
    },
    []
  );

  const handleOpenAcceptedRequestsModalFromCard = useCallback(
    (tutorData) => {
      if (!isLoggedIn) {
        requireLogin("xem yêu cầu đã duyệt");
        return;
      }
      setSelectedTutorForAccepted(tutorData);
      setIsAcceptedRequestsModalOpen(true);
    },
    [isLoggedIn, requireLogin]
  );

  const handleCloseAcceptedRequestsModal = useCallback(() => {
    setIsAcceptedRequestsModalOpen(false);
    setSelectedTutorForAccepted(null);
  }, []);
  const handleActionSuccessFromAcceptedModal = useCallback(
    (tutorId, updatedStatus) => {
      // Update local state using helper function instead of fetching all data
      if (tutorId && updatedStatus) {
        setTutors((prevTutors) =>
          updateTutorBookingStatusOptimistic(prevTutors, tutorId, updatedStatus)
        );
      } else {
        // Fallback to full refresh if no specific update info provided
        fetchTutorsData(currentPage);
      }
    },
    [currentPage, fetchTutorsData]
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
                onOpenAcceptedRequestsModal={
                  handleOpenAcceptedRequestsModalFromCard
                }
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
      {selectedTutorForAccepted && (
        <AcceptedRequestsModal
          isOpen={isAcceptedRequestsModalOpen}
          onClose={handleCloseAcceptedRequestsModal}
          tutorId={selectedTutorForAccepted.id}
          tutorName={selectedTutorForAccepted.name}
          onActionSuccess={handleActionSuccessFromAcceptedModal}
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
