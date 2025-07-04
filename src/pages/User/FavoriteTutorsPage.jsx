// src/pages/User/FavoriteTutorsPage.jsx

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TutorCard from "../../components/User/TutorCard";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeartCrack,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import LoadingSkeleton from "../../components/User/TutorCardSkeleton"; // Bạn có thể chọn dùng Skeleton hoặc text loading
import "../../assets/css/FavoriteTutorsPage.style.css";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import BookingModal from "../../components/User/BookingModal";
import AcceptedRequestsModal from "../../components/User/AcceptedRequestsModal";

// --- Component phụ (EmptyState, ErrorState) ---
const EmptyState = () => (
  <div className="empty-state-container">
    <FontAwesomeIcon
      icon={faHeartCrack}
      size="3x"
      className="empty-state-icon"
    />
    <p>Bạn chưa có gia sư yêu thích nào.</p>
    {/* Optional: Link to search page */}
    {/* <Link to="/tim-gia-su" className="btn btn-primary">Tìm Gia sư ngay</Link> */}
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="error-state-container alert alert-danger">
    <FontAwesomeIcon icon={faExclamationTriangle} />
    <p>{message || "Đã có lỗi xảy ra khi tải danh sách gia sư."}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn btn-sm btn-danger-custom">
        {" "}
        {/* Thêm class custom nếu muốn style riêng */}
        Thử lại
      </button>
    )}
  </div>
);
ErrorState.propTypes = {
  message: PropTypes.string,
  onRetry: PropTypes.func,
};

// --- Component Chính: FavoriteTutorsPage ---
const FavoriteTutorsPage = () => {
  const [favoriteTutorsData, setFavoriteTutorsData] = useState([]); // Lưu trữ dữ liệu gốc từ API (mảng các item { myTutorId, tutorId, tutor: {...} })
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null); // ID của tutor (userId) đang trong quá trình bị xóa
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render key

  // Booking modal states
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState(null);

  // Accepted requests modal states
  const [isAcceptedRequestsModalOpen, setIsAcceptedRequestsModalOpen] =
    useState(false);
  const [selectedTutorForAccepted, setSelectedTutorForAccepted] =
    useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  const fetchFavoriteTutors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await Api({
        endpoint: "my-tutor/me",
        method: METHOD_TYPE.GET,
      });

      if (
        response.success &&
        response.data &&
        Array.isArray(response.data.items)
      ) {
        setFavoriteTutorsData(response.data.items);
      } else {
        throw new Error(
          response.message || "Không thể tải danh sách gia sư yêu thích."
        );
      }
    } catch (err) {
      console.error("Lỗi khi tải gia sư yêu thích:", err);
      setError(err.message || "Lỗi kết nối hoặc máy chủ. Vui lòng thử lại.");
      setFavoriteTutorsData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Chỉ fetch nếu đã xác thực, vì API "my-tutor/me" thường yêu cầu token
    if (isAuthenticated) {
      fetchFavoriteTutors();
    } else {
      // Nếu chưa đăng nhập, có thể hiển thị thông báo hoặc không làm gì cả
      // Hoặc redirect về login nếu trang này yêu cầu đăng nhập (đã được xử lý ở AccountPageLayout)
      setIsLoading(false); // Dừng loading nếu không fetch
      setFavoriteTutorsData([]); // Đảm bảo danh sách rỗng
    }
  }, [fetchFavoriteTutors, isAuthenticated]);
  const mapFavoriteApiToCardProps = (apiItem) => {
    const tutor = apiItem?.tutor; // Thông tin gia sư nằm trong object 'tutor'
    if (!tutor || !tutor.userId) {
      console.warn("Dữ liệu gia sư yêu thích không hợp lệ:", apiItem);
      return null;
    }

    const subjects = [
      tutor.subject?.subjectName,
      tutor.subject2?.subjectName,
      tutor.subject3?.subjectName,
    ].filter(Boolean);

    let rankKey = "bronze";
    const levelNameLower = tutor.tutorLevel?.levelName?.toLowerCase();
    if (levelNameLower === "bạc") rankKey = "silver";
    else if (levelNameLower === "vàng") rankKey = "gold";
    else if (levelNameLower === "bạch kim") rankKey = "platinum";
    else if (levelNameLower === "kim cương") rankKey = "diamond";

    // Lấy rating và reviewCount từ API `my-tutor/me` nếu có trong object `tutor`
    // Dựa trên data API bạn cung cấp: tutor.rating và tutor.numberOfRating
    const rating = tutor.rating ? parseFloat(tutor.rating) : 0;
    const reviewCount = tutor.numberOfRating || 0;

    // Map booking request status for favorites page
    let finalDetailedStatus = null;
    let finalBookingId = null;
    let apiIsTutorAcceptingRequestFlagOutput = null;

    if (isAuthenticated) {
      if (typeof tutor.isBookingRequestAccepted === "boolean") {
        apiIsTutorAcceptingRequestFlagOutput = tutor.isBookingRequestAccepted;
      }

      // Process booking status similar to TutorList logic
      if (tutor.bookingRequest && tutor.bookingRequest.status) {
        finalDetailedStatus = tutor.bookingRequest.status.toUpperCase();
        finalBookingId =
          tutor.bookingRequest.bookingRequestId || tutor.bookingRequestId;
      } else if (
        tutor.isBookingRequest === true &&
        (tutor.bookingRequestId || tutor.bookingRequest?.bookingRequestId)
      ) {
        finalDetailedStatus = "REQUEST";
        finalBookingId =
          tutor.bookingRequestId || tutor.bookingRequest?.bookingRequestId;
      }

      if (!finalBookingId) {
        finalBookingId =
          tutor.bookingRequestId ||
          tutor.bookingRequest?.bookingRequestId ||
          null;
      }
    }

    return {
      id: tutor.userId, // Quan trọng: dùng userId làm ID chính cho TutorCard
      imageUrl: tutor.avatar || null,
      name: tutor.fullname || "Chưa cập nhật tên",
      gender: tutor.gender || null,
      university: tutor.univercity || "Chưa cập nhật trường",
      GPA: tutor.GPA || null,
      description: tutor.description || "Chưa có mô tả.",
      teachingMethod: tutor.teachingMethod || null,
      hourlyRate: tutor.coinPerHours ?? 0,
      teachingTime: tutor.teachingTime ? parseFloat(tutor.teachingTime) : null,
      major: tutor.major?.majorName || "Chưa cập nhật ngành",
      level: tutor.tutorLevel?.levelName || "Chưa cập nhật trình độ",
      subjects: subjects.length > 0 ? subjects : ["Chưa cập nhật môn dạy"],
      rating: rating,
      reviewCount: reviewCount,
      isVerified: tutor.isPublicProfile === true,
      rank: rankKey,
      teachingPlace: tutor.teachingPlace || null,
      // Booking information for TutorCard
      isTutorAcceptingRequestAPIFlag: apiIsTutorAcceptingRequestFlagOutput,
      bookingInfoCard: {
        status: finalDetailedStatus,
        bookingId: finalBookingId,
      },
      isInitiallyFavorite: true, // Always true for favorites page
      // Additional fields for booking
      dateTimeLearn: tutor.dateTimeLearn || [],
    };
  };

  const handleRemoveFavorite = useCallback(
    async (tutorIdToRemove, tutorName) => {
      if (
        !window.confirm(
          `Bạn có chắc chắn muốn bỏ yêu thích gia sư "${tutorName}" không?`
        )
      ) {
        return;
      }

      if (!tutorIdToRemove) {
        console.error("Không tìm thấy ID của gia sư để bỏ yêu thích.");
        toast.error("Lỗi: Không thể xác định ID gia sư.");
        return;
      }

      const endpointToDelete = `my-tutor/remove/${tutorIdToRemove}`;

      setRemovingId(tutorIdToRemove);
      try {
        const response = await Api({
          endpoint: endpointToDelete,
          method: METHOD_TYPE.DELETE,
        });

        if (response.success) {
          setFavoriteTutorsData((prevData) =>
            // prevData là mảng các item { myTutorId, tutorId, tutor: {...} }
            // Lọc ra item nào có tutor.userId trùng với tutorIdToRemove
            prevData.filter((item) => item.tutor.userId !== tutorIdToRemove)
          );
          toast.success(`Đã bỏ yêu thích gia sư ${tutorName}`);
        } else {
          throw new Error(
            response.message || "Không thể bỏ yêu thích gia sư này."
          );
        }
      } catch (err) {
        console.error("Lỗi khi bỏ yêu thích:", err);
        toast.error(
          `Lỗi: ${
            err.message || "Không thể hoàn thành thao tác. Vui lòng thử lại."
          }`
        );
      } finally {
        setRemovingId(null);
      }
    },
    [] // Dependencies rỗng vì các hàm bên trong không thay đổi
  );

  const requireLogin = useCallback(
    (action = "thực hiện chức năng này") => {
      toast.info(`Vui lòng đăng nhập để ${action}!`);
      navigate("/login", { state: { from: location } });
    },
    [navigate, location]
  );

  const handleOpenBookingModal = useCallback(
    (tutorDataFromCard) => {
      if (!isAuthenticated) {
        requireLogin("gửi yêu cầu thuê gia sư");
        return;
      }
      setSelectedTutorForBooking(tutorDataFromCard);
      setIsBookingModalOpen(true);
    },
    [isAuthenticated, requireLogin]
  );

  const handleCloseBookingModal = useCallback(() => {
    setIsBookingModalOpen(false);
    setSelectedTutorForBooking(null);
  }, []);

  const handleBookingSuccessInFavorites = useCallback(
    async (tutorId, newBookingStatus) => {
      console.log("[DEBUG handleBookingSuccessInFavorites] Called with:", {
        tutorId,
        newBookingStatus,
      });

      handleCloseBookingModal();
      toast.success("Yêu cầu thuê đã được gửi thành công!");

      // Refresh the favorites list to get updated booking status
      try {
        await fetchFavoriteTutors();
        setRefreshKey((prev) => prev + 1);
        console.log("[DEBUG] Favorites list refreshed after booking success");
      } catch (error) {
        console.error("[DEBUG] Error during favorites refresh:", error);
      }
    },
    [handleCloseBookingModal, fetchFavoriteTutors]
  );

  const handleCancelSuccessInFavorites = useCallback(async () => {
    // Refresh favorites list after cancel success
    console.log(
      "[API REFRESH] Refreshing favorites list after cancel success..."
    );

    try {
      await fetchFavoriteTutors();
      setRefreshKey((prev) => prev + 1);
      console.log("[DEBUG] Favorites list refreshed after cancel success");
      toast.success("Đã hủy yêu cầu thành công!");
    } catch (error) {
      console.error(
        "[DEBUG] Error during favorites refresh after cancel:",
        error
      );
      toast.error("Đã hủy yêu cầu nhưng có lỗi khi cập nhật danh sách!");
    }
  }, [fetchFavoriteTutors]);

  const handleFavoriteStatusChangeInFavorites = useCallback(
    (tutorId, newIsFavorite) => {
      if (!newIsFavorite) {
        // If unfavorited, remove from the favorites list
        setFavoriteTutorsData((prevData) =>
          prevData.filter((item) => item.tutor.userId !== tutorId)
        );
        toast.success("Đã bỏ yêu thích gia sư");
      }
    },
    []
  );

  const handleOpenAcceptedRequestsModalFromCard = useCallback(
    (tutorData) => {
      if (!isAuthenticated) {
        requireLogin("xem yêu cầu đã duyệt");
        return;
      }
      setSelectedTutorForAccepted(tutorData);
      setIsAcceptedRequestsModalOpen(true);
    },
    [isAuthenticated, requireLogin]
  );

  const handleCloseAcceptedRequestsModal = useCallback(() => {
    setIsAcceptedRequestsModalOpen(false);
    setSelectedTutorForAccepted(null);
  }, []);

  const handleActionSuccessFromAcceptedModal = useCallback(() => {
    // Refresh favorites list after accepted modal action
    console.log(
      "[API REFRESH] Refreshing favorites list after accepted modal action..."
    );
    fetchFavoriteTutors();
    setRefreshKey((prev) => prev + 1);
  }, [fetchFavoriteTutors]);

  const handleViewProfile = useCallback(
    (tutorId) => {
      if (tutorId) {
        navigate(`/gia-su/${tutorId}`);
      }
    },
    [navigate]
  );

  const renderContent = () => {
    if (!isAuthenticated && !isLoading) {
      return (
        <div className="empty-state-container">
          {" "}
          {/* Hoặc một component riêng cho "Vui lòng đăng nhập" */}
          <p>
            Vui lòng{" "}
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login", { state: { from: location } });
              }}
            >
              đăng nhập
            </a>{" "}
            để xem danh sách gia sư yêu thích của bạn.
          </p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="tutor-list redesigned-list favorite-tutor-grid loading">
          {/* Có thể dùng LoadingSkeleton hoặc một spinner đơn giản */}
          {Array.from({ length: 3 }).map((_, index) => (
            <LoadingSkeleton key={`skeleton-${index}`} />
          ))}
          {/* Hoặc: <div className="loading-spinner-container"><FontAwesomeIcon icon={faSpinner} spin size="3x" /></div> */}
        </div>
      );
    }

    if (error) {
      return <ErrorState message={error} onRetry={fetchFavoriteTutors} />;
    }

    // Map dữ liệu API (favoriteTutorsData) sang props cho TutorCard
    const mappedTutors = favoriteTutorsData
      .map(mapFavoriteApiToCardProps)
      .filter(Boolean); // Lọc bỏ các item không hợp lệ (nếu có)

    if (mappedTutors.length === 0) {
      return <EmptyState />;
    }
    return (
      <div className="tutor-list redesigned-list favorite-tutor-grid">
        {mappedTutors.map((tutorCardProps) => (
          <TutorCard
            key={`${tutorCardProps.id}-${refreshKey}`}
            tutor={tutorCardProps}
            isFavoriteOverride={true}
            onRemoveFavorite={() =>
              handleRemoveFavorite(tutorCardProps.id, tutorCardProps.name)
            }
            isRemoving={removingId === tutorCardProps.id}
            onViewProfile={() => handleViewProfile(tutorCardProps.id)}
            isLoggedIn={isAuthenticated}
            className="favorite-tutor-card"
            // Add booking functionality
            onOpenBookingModal={handleOpenBookingModal}
            onOpenAcceptedRequestsModal={
              handleOpenAcceptedRequestsModalFromCard
            }
            onCancelSuccess={handleCancelSuccessInFavorites}
            onFavoriteStatusChange={handleFavoriteStatusChangeInFavorites}
          />
        ))}
      </div>
    );
  };
  return (
    <>
      {/* Class wrapper này có thể không cần thiết nếu .account-content-main đã style nền và padding */}
      {/* <div className="favorite-tutors-page-wrapper"> */}
      <div className="favorite-tutors-container">
        <h1>Gia sư yêu thích của bạn</h1>
        {renderContent()}
      </div>
      {/* </div> */}

      {/* Booking Modal */}
      {selectedTutorForBooking && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={handleCloseBookingModal}
          tutorId={selectedTutorForBooking.id}
          tutorName={selectedTutorForBooking.name}
          onBookingSuccess={handleBookingSuccessInFavorites}
          maxHoursPerLesson={selectedTutorForBooking.teachingTime}
          availableScheduleRaw={selectedTutorForBooking.dateTimeLearn || []}
          hourlyRate={selectedTutorForBooking.hourlyRate}
        />
      )}

      {/* Accepted Requests Modal */}
      {selectedTutorForAccepted && (
        <AcceptedRequestsModal
          isOpen={isAcceptedRequestsModalOpen}
          onClose={handleCloseAcceptedRequestsModal}
          tutorId={selectedTutorForAccepted.id}
          tutorName={selectedTutorForAccepted.name}
          onActionSuccess={handleActionSuccessFromAcceptedModal}
        />
      )}
    </>
  );
};

export default FavoriteTutorsPage;
