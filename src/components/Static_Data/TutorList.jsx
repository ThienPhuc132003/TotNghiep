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
import { updateTutorFavoriteStatus } from "../../utils/bookingStateHelpers";
import { useDebugTutorState } from "../../hooks/useDebugTutorState"; // Import debug hook

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
  searchType = "all",
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
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render key

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState(null);

  const [isAcceptedRequestsModalOpen, setIsAcceptedRequestsModalOpen] =
    useState(false);
  const [selectedTutorForAccepted, setSelectedTutorForAccepted] =
    useState(null);

  // Debug state changes
  useDebugTutorState(tutors, refreshKey);

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

        // Tạo filter array theo chuẩn backend
        const filterConditions = [];
        // Filter theo search term với nhiều trường
        if (searchTerm && searchTerm.trim()) {
          const searchValue = searchTerm.trim();

          if (searchType === "name") {
            filterConditions.push({
              key: "tutorProfile.fullname",
              operator: "like",
              value: searchValue,
            });
          } else if (searchType === "university") {
            filterConditions.push({
              key: "tutorProfile.univercity",
              operator: "like",
              value: searchValue,
            });
          } else if (searchType === "subject") {
            // Tìm kiếm trong các môn học - chỉ thêm các filter riêng biệt
            filterConditions.push(
              {
                key: "tutorProfile.subject.subjectName",
                operator: "like",
                value: searchValue,
              },
              {
                key: "tutorProfile.subject2.subjectName",
                operator: "like",
                value: searchValue,
              },
              {
                key: "tutorProfile.subject3.subjectName",
                operator: "like",
                value: searchValue,
              }
            );
          } else {
            // Tìm kiếm tất cả - thêm multiple filters cho các trường khác nhau
            filterConditions.push(
              {
                key: "tutorProfile.fullname",
                operator: "like",
                value: searchValue,
              },
              {
                key: "tutorProfile.univercity",
                operator: "like",
                value: searchValue,
              },
              {
                key: "tutorProfile.subject.subjectName",
                operator: "like",
                value: searchValue,
              },
              {
                key: "tutorProfile.subject2.subjectName",
                operator: "like",
                value: searchValue,
              },
              {
                key: "tutorProfile.subject3.subjectName",
                operator: "like",
                value: searchValue,
              }
            );
          }
        }

        // Filter theo level ID
        if (selectedLevelId) {
          filterConditions.push({
            key: "tutorProfile.tutorLevelId",
            operator: "equal",
            value: selectedLevelId,
          });
        }

        // Filter theo major ID
        if (selectedMajorId) {
          filterConditions.push({
            key: "tutorProfile.majorId",
            operator: "equal",
            value: selectedMajorId,
          });
        }

        // Thêm filter conditions vào query
        if (filterConditions.length > 0) {
          query.filter = JSON.stringify(filterConditions);
        }

        // Thêm sort
        if (sortBy) {
          const sortConfig = getSortConfig(sortBy);
          if (sortConfig) {
            query.sort = JSON.stringify([sortConfig]);
          }
        }

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

          // DEBUG: Log tutors data AFTER API refresh
          console.log(
            "[DEBUG] AFTER API refresh - mapped tutors:",
            mappedTutors.length,
            "tutors"
          );
          if (mappedTutors.length > 0) {
            console.log("[DEBUG] First tutor AFTER refresh:", {
              id: mappedTutors[0].id,
              name: mappedTutors[0].name,
              isTutorAcceptingRequestAPIFlag:
                mappedTutors[0].isTutorAcceptingRequestAPIFlag,
              bookingInfoCard: mappedTutors[0].bookingInfoCard,
            });
          }
          setTutors(mappedTutors);
          setTotalTutors(response.data.total || 0);
          // Force re-render of all TutorCard components
          setRefreshKey((prev) => prev + 1);

          console.log(
            "[DEBUG] State updated with new tutors data, refresh key incremented"
          );
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
      searchTerm,
      searchType,
      selectedLevelId,
      selectedMajorId,
      sortBy,
    ] // Dependencies của fetchTutorsData
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
    async (tutorId, newBookingStatus) => {
      console.log("[DEBUG handleBookingSuccessInList] Called with:", {
        tutorId,
        newBookingStatus,
      });

      // Log current tutors state BEFORE refresh using functional update
      setTutors((prevTutors) => {
        console.log(
          "[DEBUG] Current tutors state BEFORE refresh:",
          prevTutors.length,
          "tutors"
        );
        const targetTutor = prevTutors.find((t) => t.id === tutorId);
        if (targetTutor) {
          console.log("[DEBUG] Target tutor BEFORE refresh:", {
            id: targetTutor.id,
            name: targetTutor.name,
            isTutorAcceptingRequestAPIFlag:
              targetTutor.isTutorAcceptingRequestAPIFlag,
            bookingInfoCard: targetTutor.bookingInfoCard,
          });
        }
        return prevTutors; // Return unchanged for now, will be updated by API refresh
      });

      handleCloseBookingModal();
      toast.success("Yêu cầu thuê đã được gửi thành công!");

      // Call API to refresh tutor list data instead of optimistic updates
      // This ensures we get the correct isBookingRequestAccepted values from server
      console.log(
        "[API REFRESH] Refreshing tutor list after booking success..."
      );

      // Wait for API refresh to complete
      try {
        await fetchTutorsData(currentPage);
        console.log("[DEBUG] API refresh completed after booking success");
      } catch (error) {
        console.error("[DEBUG] Error during API refresh:", error);
      }
    },
    [handleCloseBookingModal, fetchTutorsData, currentPage]
  );
  const handleCancelSuccessInList = useCallback(async () => {
    // Call API to refresh tutor list data instead of optimistic updates
    // This ensures we get the correct isBookingRequestAccepted values from server
    console.log("[API REFRESH] Refreshing tutor list after cancel success...");

    try {
      await fetchTutorsData(currentPage);
      console.log("[DEBUG] API refresh completed after cancel success");
      toast.success("Đã hủy yêu cầu thành công!");
    } catch (error) {
      console.error("[DEBUG] Error during API refresh after cancel:", error);
      toast.error("Đã hủy yêu cầu nhưng có lỗi khi cập nhật danh sách!");
    }
  }, [fetchTutorsData, currentPage]);
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

  const handleActionSuccessFromAcceptedModal = useCallback(() => {
    // Call API to refresh tutor list data instead of optimistic updates
    // This ensures we get the correct isBookingRequestAccepted values from server
    console.log(
      "[API REFRESH] Refreshing tutor list after accepted modal action..."
    );
    fetchTutorsData(currentPage);
  }, [currentPage, fetchTutorsData]);

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
          {" "}
          <div className="tutor-list redesigned-list">
            {tutors.map((tutorProps) => {
              console.log(
                `[DEBUG RENDER] Rendering TutorCard for ${tutorProps.name} with key: ${tutorProps.id}-${refreshKey}`
              );
              return (
                <TutorCard
                  key={`${tutorProps.id}-${refreshKey}`}
                  tutor={tutorProps}
                  onOpenBookingModal={handleOpenBookingModal}
                  onOpenAcceptedRequestsModal={
                    handleOpenAcceptedRequestsModalFromCard
                  }
                  onCancelSuccess={handleCancelSuccessInList}
                  isLoggedIn={isLoggedIn}
                  onFavoriteStatusChange={handleFavoriteStatusChangeInList}
                />
              );
            })}
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

// Helper function để convert sortBy thành sort config
const getSortConfig = (sortBy) => {
  switch (sortBy) {
    case "rating_desc":
      return { key: "tutorProfile.rating", type: "DESC" };
    case "rating_asc":
      return { key: "tutorProfile.rating", type: "ASC" };
    case "price_asc":
      return { key: "tutorProfile.coinPerHours", type: "ASC" };
    case "price_desc":
      return { key: "tutorProfile.coinPerHours", type: "DESC" };
    case "experience_desc":
      return { key: "tutorProfile.teachingTime", type: "DESC" };
    case "createdAt_desc":
      return { key: "createdAt", type: "DESC" };
    case "createdAt_asc":
      return { key: "createdAt", type: "ASC" };
    default:
      return { key: "tutorProfile.rating", type: "DESC" };
  }
};

TutorList.propTypes = {
  searchTerm: PropTypes.string,
  searchType: PropTypes.string,
  selectedLevelId: PropTypes.string,
  selectedMajorId: PropTypes.string,
  sortBy: PropTypes.string,
};
export default TutorList;
