import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import TutorCard from "../../components/User/TutorCard"; // *** SỬ DỤNG TUTOR CARD ĐÃ CÓ ***
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeartCrack,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import LoadingSkeleton from "../../components/User/TutorCardSkeleton"; // Sử dụng Skeleton nếu muốn
import "../../assets/css/FavoriteTutorsPage.style.css"; // Đường dẫn CSS cho trang yêu thích
import PropTypes from "prop-types";
import { toast } from "react-toastify"; // Sử dụng toast cho thông báo
// import { Link } from 'react-router-dom'; // Bỏ comment nếu muốn thêm Link

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
      <button onClick={onRetry} className="btn btn-sm btn-danger">
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
  const [favoriteTutorsData, setFavoriteTutorsData] = useState([]); // Lưu trữ dữ liệu gốc từ API
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null); // ID của tutor đang bị xóa (dùng userId)
  const navigate = useNavigate(); // Hook để điều hướng

  // Hàm gọi API để lấy danh sách gia sư yêu thích
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
        // Lưu dữ liệu gốc, bao gồm cả myTutorId nếu cần cho việc xóa
        setFavoriteTutorsData(response.data.items);
      } else {
        throw new Error(
          response.message || "Không thể tải danh sách gia sư yêu thích."
        );
      }
    } catch (err) {
      console.error("Lỗi khi tải gia sư yêu thích:", err);
      setError(err.message || "Lỗi kết nối hoặc máy chủ. Vui lòng thử lại.");
      setFavoriteTutorsData([]); // Đảm bảo là mảng rỗng khi lỗi
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Gọi API khi component được mount lần đầu
  useEffect(() => {
    fetchFavoriteTutors();
  }, [fetchFavoriteTutors]);

  /**
   * Ánh xạ dữ liệu từ API my-tutor/me sang props mà TutorCard mong đợi.
   * @param {object} apiItem - Item từ response.data.items của API my-tutor/me
   * @returns {object|null} - Object props cho TutorCard hoặc null nếu dữ liệu không hợp lệ
   */
  const mapFavoriteApiToCardProps = (apiItem) => {
    const tutor = apiItem?.tutor;
    if (!tutor || !tutor.userId) {
      console.warn("Dữ liệu gia sư yêu thích không hợp lệ:", apiItem);
      return null;
    }

    // Ánh xạ tương tự mapApiTutorToCardProps trong TutorList,
    // nhưng lấy dữ liệu từ `tutor` object và không cần isInitiallyFavorite
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

    // API my-tutor/me hiện không có rating/review, đặt mặc định hoặc null
    const rating = 0; // Hoặc null nếu TutorCard xử lý được
    const reviewCount = 0; // Hoặc null

    // API my-tutor/me hiện không có bookingRequest trong tutor object
    const bookingRequest = null;

    return {
      id: tutor.userId, // Quan trọng: dùng userId làm ID chính
      myTutorRelationshipId: apiItem.myTutorId, // Lưu ID của mối quan hệ để xóa
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
      isVerified: tutor.isPublicProfile === true, // Giả định cần public để hiển thị
      rank: rankKey,
      teachingPlace: tutor.teachingPlace || null,
      bookingRequest: bookingRequest, // Hiện là null
    };
  };

  // Hàm xử lý khi người dùng nhấn nút "Bỏ yêu thích" trên TutorCard
  const handleRemoveFavorite = useCallback(
    async (tutorId, tutorName, myTutorRelationshipId) => {
      // Hỏi xác nhận trước khi xóa
      if (
        !window.confirm(
          `Bạn có chắc chắn muốn bỏ yêu thích gia sư "${tutorName}" không?`
        )
      ) {
        return;
      }

      // *** QUAN TRỌNG: Xác định ID cần dùng để xóa ***
      // Giả định API xóa dùng myTutorId. Nếu dùng tutorId, hãy thay đổi endpoint.
      const idToDelete = myTutorRelationshipId;
      const endpointToDelete = `my-tutor/${idToDelete}`; // Endpoint nếu dùng myTutorId
      // const endpointToDelete = `my-tutor/remove/${tutorId}`; // Endpoint nếu dùng tutorId

      if (!idToDelete && !tutorId) {
        // Kiểm tra nếu cả 2 ID đều không có (ít xảy ra)
        console.error("Không tìm thấy ID để xóa mối quan hệ yêu thích.");
        toast.error("Lỗi: Không thể xác định ID để bỏ yêu thích.");
        return;
      }

      setRemovingId(tutorId); // Đánh dấu đang xóa gia sư có userId này
      try {
        const response = await Api({
          endpoint: endpointToDelete,
          method: METHOD_TYPE.DELETE,
        });

        if (response.success) {
          // Xóa thành công, cập nhật lại danh sách trên UI
          setFavoriteTutorsData((prevData) =>
            prevData.filter((item) => item.tutor.userId !== tutorId)
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
        setRemovingId(null); // Hoàn tất xóa (dù thành công hay lỗi)
      }
    },
    []
  );

  // Hàm điều hướng đến trang chi tiết gia sư
  const handleViewProfile = useCallback(
    (tutorId) => {
      if (tutorId) {
        navigate(`/gia-su/${tutorId}`);
      }
    },
    [navigate]
  );

  // Hàm render danh sách gia sư hoặc các trạng thái khác
  const renderContent = () => {
    if (isLoading) {
      // return <LoadingSkeleton count={3} />; // Sử dụng Skeleton
      return (
        <div className="tutor-list redesigned-list favorite-tutor-grid loading">
          {Array.from({ length: 3 }).map(
            (
              _,
              index // Hiển thị 3 skeleton
            ) => (
              <LoadingSkeleton key={`skeleton-${index}`} />
            )
          )}
        </div>
      );
    }

    if (error) {
      return <ErrorState message={error} onRetry={fetchFavoriteTutors} />;
    }

    // Map dữ liệu API sang props cho TutorCard
    const mappedTutors = favoriteTutorsData
      .map(mapFavoriteApiToCardProps)
      .filter(Boolean); // Lọc bỏ các item không hợp lệ

    if (mappedTutors.length === 0) {
      return <EmptyState />;
    }

    // Hiển thị danh sách gia sư dùng TutorCard đã có
    return (
      <div className="tutor-list redesigned-list favorite-tutor-grid">
        {mappedTutors.map((tutorProps) => (
          <TutorCard
            key={tutorProps.id} // Sử dụng userId làm key
            tutor={tutorProps} // Truyền object props đã map
            // --- Props đặc biệt cho trang yêu thích ---
            isFavoriteOverride={true} // Luôn hiển thị là yêu thích
            onRemoveFavorite={() =>
              handleRemoveFavorite(
                tutorProps.id,
                tutorProps.name,
                tutorProps.myTutorRelationshipId
              )
            } // Hàm xóa từ trang này
            isRemoving={removingId === tutorProps.id} // Trạng thái đang xóa
            // --- Props chung (nếu cần) ---
            onViewProfile={() => handleViewProfile(tutorProps.id)}
            // Bỏ qua onOpenBookingModal và onCancelSuccess vì bookingRequest là null trên trang này
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="favorite-tutors-page-wrapper">
        <div className="favorite-tutors-container">
          <h1>Gia sư yêu thích của bạn</h1>
          {renderContent()}
          {/* Không cần Pagination ở đây */}
        </div>
      </div>
    </>
  );
};

export default FavoriteTutorsPage;
