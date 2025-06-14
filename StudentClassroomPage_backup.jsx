import { useState, useEffect, useCallback, memo } from "react";
import { useSearchParams } from "react-router-dom";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "../../assets/css/StudentClassroomPage.style.css";
import dfMale from "../../assets/images/df-male.png";
import ClassroomEvaluationModal from "../../components/User/ClassroomEvaluationModal";

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

const dayLabels = {
  Monday: "Thứ 2",
  Tuesday: "Thứ 3",
  Wednesday: "Thứ 4",
  Thursday: "Thứ 5",
  Friday: "Thứ 6",
  Saturday: "Thứ 7",
  Sunday: "Chủ Nhật",
};

const statusLabels = {
  IN_SESSION: "Đang học",
  PENDING: "Chờ bắt đầu",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

const parseDateTimeLearn = (dateTimeLearn) => {
  if (!dateTimeLearn || !Array.isArray(dateTimeLearn)) return [];
  return dateTimeLearn.map((item) => {
    try {
      const parsed = JSON.parse(item);
      return {
        day: dayLabels[parsed.day] || parsed.day,
        times: parsed.times.join(", "),
      };
    } catch (e) {
      console.error("Error parsing dateTimeLearn item:", item, e);
      return { day: "Lỗi", times: "Lỗi" };
    }
  });
};

// Helper function to calculate classroom progress
const calculateClassProgress = (startDay, endDay) => {
  if (!startDay || !endDay) return { percentage: 0, status: "unknown" };

  try {
    const start = new Date(startDay);
    const end = new Date(endDay);
    const now = new Date();

    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();

    if (elapsed < 0) return { percentage: 0, status: "not_started" };
    if (elapsed > totalDuration)
      return { percentage: 100, status: "completed" };

    const percentage = Math.round((elapsed / totalDuration) * 100);
    return { percentage, status: "in_progress" };
  } catch (error) {
    console.error("Error calculating progress:", error);
    return { percentage: 0, status: "error" };
  }
};

// MeetingRatingModal Component - extracted outside main component
const MeetingRatingModal = ({ meeting, isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoverRating(0);
      setComment("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá!");
      return;
    }
    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá!");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        meetingId: meeting.meetingId,
        rating,
        comment: comment.trim(),
      });
      onClose();
      toast.success("Đánh giá buổi học thành công!");
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Có lỗi xảy ra khi đánh giá. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isHalf = (hoverRating || rating) === i - 0.5;
      const isFull = (hoverRating || rating) >= i;

      stars.push(
        <div key={i} className="scp-star-container">
          {/* Half star (left side) */}
          <div
            className={`scp-star-half scp-star-left ${
              isHalf || isFull ? "active" : ""
            }`}
            onMouseEnter={() => setHoverRating(i - 0.5)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(i - 0.5)}
          >
            <i className="fas fa-star"></i>
          </div>
          {/* Full star (right side) */}
          <div
            className={`scp-star-half scp-star-right ${
              isFull ? "active" : ""
            }`}
            onMouseEnter={() => setHoverRating(i)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(i)}
          >
            <i className="fas fa-star"></i>
          </div>
        </div>
      );
    }
    return stars;
  };

  if (!isOpen) return null;

  return (
    <div className="scp-modal-overlay" onClick={onClose}>
      <div className="scp-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="scp-modal-header">
          <h3 className="scp-modal-title">
            <i className="fas fa-star"></i>
            Đánh giá buổi học
          </h3>
          <button className="scp-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="scp-modal-body">
          <div className="scp-meeting-info-summary">
            <h4>Thông tin buổi học</h4>
            <p>
              <strong>Chủ đề:</strong> {meeting?.topic || "Không có chủ đề"}
            </p>
            <p>
              <strong>Meeting ID:</strong> {meeting?.zoomMeetingId}
            </p>
            <p>
              <strong>Thời gian:</strong>{" "}
              {meeting?.startTime
                ? new Date(meeting.startTime).toLocaleString("vi-VN")
                : "N/A"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="scp-rating-form">
            <div className="scp-rating-section">
              <label className="scp-rating-label">
                <i className="fas fa-star"></i>
                Đánh giá chất lượng buổi học
              </label>
              <div className="scp-star-rating">{renderStars()}</div>
              <div className="scp-rating-text">
                {rating > 0 && (
                  <span className="scp-rating-value">
                    {rating} sao{" "}
                    {rating === 1
                      ? ""
                      : rating < 2
                      ? "(Tệ)"
                      : rating < 3
                      ? "(Bình thường)"
                      : rating < 4
                      ? "(Tốt)"
                      : rating < 5
                      ? "(Rất tốt)"
                      : "(Xuất sắc)"}
                  </span>
                )}
              </div>
            </div>

            <div className="scp-comment-section">
              <label className="scp-comment-label">
                <i className="fas fa-comment"></i>
                Nội dung đánh giá
              </label>
              <textarea
                className="scp-comment-textarea"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về buổi học này..."
                rows={4}
                maxLength={500}
              />
              <div className="scp-comment-counter">
                {comment.length}/500 ký tự
              </div>
            </div>

            <div className="scp-modal-actions">
              <button
                type="button"
                className="scp-cancel-btn"
                onClick={onClose}
                disabled={isSubmitting}
              >
                <i className="fas fa-times"></i>
                Hủy
              </button>
              <button
                type="submit"
                className="scp-submit-btn"
                disabled={isSubmitting || rating === 0}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Gửi đánh giá
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main Student Classroom Page Component
const getCountByStatus = (items, status) => {
  if (status === "IN_SESSION") {
    return items.filter(
      (item) =>
        item.status === "IN_SESSION" ||
        item.status === "PENDING" ||
        !item.status
    ).length;
  } else if (status === "ENDED") {
    return items.filter(
      (item) =>
        item.status === "COMPLETED" ||
        item.status === "CANCELLED" ||
        item.status === "ENDED"
    ).length;
  }
  return items.length;
};

// Client-side filtering và pagination cho classrooms/meetings
// Lý do dùng client-side: API không hỗ trợ filter theo status
const getFilteredItems = (items, status, page, itemsPerPage) => {
  // Step 1: Filter theo status
  let filtered = items;
  if (status === "IN_SESSION") {
    filtered = items.filter(
      (item) =>
        item.status === "IN_SESSION" ||
        item.status === "PENDING" ||
        !item.status
    );
  } else if (status === "ENDED") {
    filtered = items.filter(
      (item) =>
        item.status === "COMPLETED" ||
        item.status === "CANCELLED" ||
        item.status === "ENDED"
    );
  }

  // Step 2: Apply client-side pagination trên filtered data
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return {
    items: filtered.slice(startIndex, endIndex), // Paginated items
    total: filtered.length, // Total items AFTER filtering
  };
};

// Helper function to get safe avatar URL
const getSafeAvatarUrl = (user) => {
  if (user?.avatar && user.avatar.trim() !== "") {
    return user.avatar;
  }
  return dfMale;
};

// Helper function for avatar error handling
const handleAvatarError = (event) => {
  if (event.target.src !== dfMale) {
    event.target.onerror = null;
    event.target.src = dfMale;
  }
};

const StudentClassroomPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalClassrooms, setTotalClassrooms] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  // Store all classrooms for accurate filtering and pagination
  const [allClassrooms, setAllClassrooms] = useState([]);
  // Evaluation modal state
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [selectedClassroomForEvaluation, setSelectedClassroomForEvaluation] =
    useState(null);

  // Meeting rating modal state
  const [showMeetingRatingModal, setShowMeetingRatingModal] = useState(false);
  const [selectedMeetingForRating, setSelectedMeetingForRating] = useState(null);

  // Meeting list state
  const [meetingList, setMeetingList] = useState([]);
  const [allMeetings, setAllMeetings] = useState([]);
  const [currentMeetingPage, setCurrentMeetingPage] = useState(1);
  const [isMeetingLoading, setIsMeetingLoading] = useState(false);
  const [totalMeetings, setTotalMeetings] = useState(0);
  const meetingsPerPage = 2;

  // New state for main classroom tabs
  const [activeClassroomTab, setActiveClassroomTab] = useState("IN_SESSION");

  // New state for showing meeting view
  const [showMeetingView, setShowMeetingView] = useState(false);
  const [currentClassroomForMeetings, setCurrentClassroomForMeetings] =
    useState(null);
  const [activeMeetingTab, setActiveMeetingTab] = useState("ENDED");

  const currentUser = useSelector((state) => state.user.userProfile);
  const [searchParams, setSearchParams] = useSearchParams();
  const fetchStudentClassrooms = useCallback(
    async (page, forceRefresh = false) => {
      if (!currentUser?.userId) {
        setError("Không tìm thấy thông tin người dùng.");
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const queryParams = {
          page: 1,
          rpp: 1000,
        };

        console.log(
          `🔍 Fetching all student classrooms for client-side filtering${
            forceRefresh ? " (forced refresh)" : ""
          }`
        );
        const response = await Api({
          endpoint: "classroom/search-for-user",
          method: METHOD_TYPE.GET,
          query: queryParams,
          requireToken: true,
        });

        console.log("📦 Student classroom API response:", response);

        // Extract data from response - classroom/search-for-user returns data.items
        const allData =
          response?.data?.items ||
          response?.data?.classrooms ||
          response?.items ||
          [];

        console.log(`📊 Total classrooms fetched: ${allData.length}`);
        console.log("📊 Student classrooms data:", allData);

        if (allData.length > 0) {
          setAllClassrooms(allData);

          // Use getFilteredItems for consistent filtering and pagination
          const result = getFilteredItems(
            allData,
            activeClassroomTab,
            page,
            itemsPerPage
          );
          setClassrooms(result.items);
          setTotalClassrooms(result.total);
          setCurrentPage(page);

          console.log(
            `📊 Filtered classrooms (${activeClassroomTab}): ${result.total}, showing page ${page}`
          );
        } else {
          console.log("❌ No classrooms data in response");
          setClassrooms([]);
          setAllClassrooms([]);
          setTotalClassrooms(0);
        }
      } catch (error) {
        console.error("❌ Error fetching classrooms:", error);
        setError("Lỗi khi tải danh sách lớp học.");
        setClassrooms([]);
        setAllClassrooms([]);
        setTotalClassrooms(0);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser?.userId, itemsPerPage, activeClassroomTab]
  );

  // Handle viewing meetings - fixed to use correct API and data path
  const handleViewMeetings = useCallback(
    async (classroomId, classroomName, page = 1) => {
      console.log(
        `🚀 Student handleViewMeetings called: classroomId=${classroomId}, classroomName=${classroomName}, page=${page}`
      );

      setIsMeetingLoading(true);
      setError(null);

      try {
        console.log(
          "📞 Student calling meeting/get-meeting API with POST method like tutor..."
        );

        // Use the same API call format as tutor (POST with data)
        const response = await Api({
          endpoint: "meeting/get-meeting",
          method: METHOD_TYPE.POST,
          data: { classroomId: classroomId },
          requireToken: true,
        });

        console.log("📦 Student meeting API response:", response);

        // Use the same data extraction logic as tutor
        const meetings =
          response?.data?.result?.items ||
          response?.result?.items ||
          response?.data?.items ||
          [];

        console.log(
          `📊 Student meetings extracted: ${meetings.length} meetings`
        );
        console.log("📊 Student meetings data:", meetings);

        if (meetings.length > 0) {
          setAllMeetings(meetings);

          // Use getFilteredItems function like tutor (filter + paginate in one step)
          const result = getFilteredItems(
            meetings,
            activeMeetingTab, // Default to "ENDED" as set in state
            page,
            meetingsPerPage
          );

          console.log(
            `📊 Student filtered meetings (${activeMeetingTab}): ${result.total} total, ${result.items.length} on page ${page}`
          );

          setMeetingList(result.items);
          setTotalMeetings(result.total);
          setCurrentMeetingPage(page);

          // Set meeting view state
          setShowMeetingView(true);
          setCurrentClassroomForMeetings({
            classroomId: classroomId,
            nameOfRoom: classroomName,
          });

          // Update URL params to maintain state
          setSearchParams({
            view: "meetings",
            classroomId: encodeURIComponent(classroomId),
            classroomName: encodeURIComponent(classroomName),
            page: page,
            tab: activeMeetingTab, // Default to "ENDED"
          });

          console.log("✅ Student meeting view setup completed");
        } else {
          console.log("📭 Student no meetings found");
          setAllMeetings([]);
          setMeetingList([]);
          setTotalMeetings(0);
          setCurrentMeetingPage(1);

          // Still show meeting view with empty state, don't fallback to main view
          setShowMeetingView(true);
          setCurrentClassroomForMeetings({
            classroomId: classroomId,
            nameOfRoom: classroomName,
          });

          // Still set URL params to maintain state
          setSearchParams({
            view: "meetings",
            classroomId: encodeURIComponent(classroomId),
            classroomName: encodeURIComponent(classroomName),
            page: 1,
            tab: activeMeetingTab,
          });

          console.log("📭 Student empty meeting view setup completed");
        }
      } catch (error) {
        console.error("❌ Student error fetching meetings:", error);
        setError("Lỗi khi tải danh sách buổi học.");
        setAllMeetings([]);
        setMeetingList([]);
        setTotalMeetings(0);

        // Don't fallback to main view on error, just show empty meeting view
        setShowMeetingView(true);
        setCurrentClassroomForMeetings({
          classroomId: classroomId,
          nameOfRoom: classroomName,
        });
      } finally {
        setIsMeetingLoading(false);
      }
    },
    [activeMeetingTab, meetingsPerPage, setSearchParams]
  );

  // URL param handling for deep linking
  useEffect(() => {
    const view = searchParams.get("view");
    const classroomId = searchParams.get("classroomId");
    const classroomName = searchParams.get("classroomName");
    const page = parseInt(searchParams.get("page")) || 1;
    const tab = searchParams.get("tab") || "ENDED"; // Default to ENDED for meetings

    if (view === "meetings" && classroomId && classroomName) {
      console.log("🔗 Student restoring meeting view from URL params");

      // Set the tab first
      setActiveMeetingTab(tab);

      // Then restore the meeting view
      handleViewMeetings(
        decodeURIComponent(classroomId),
        decodeURIComponent(classroomName),
        page
      );
    }
  }, [searchParams, handleViewMeetings]);
  // Initial data fetch
  useEffect(() => {
    fetchStudentClassrooms(1);
  }, [fetchStudentClassrooms]);

  // Handle meeting page change - use getFilteredItems like tutor
  const handleMeetingPageChange = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= Math.ceil(totalMeetings / meetingsPerPage) &&
      allMeetings.length > 0
    ) {
      console.log(
        `📄 Student meeting page change: ${currentMeetingPage} -> ${newPage} (using getFilteredItems like tutor)`
      );

      // Use getFilteredItems function like tutor (filter + paginate in one step)
      const result = getFilteredItems(
        allMeetings,
        activeMeetingTab,
        newPage,
        meetingsPerPage
      );

      // Update meetingList with filtered and paginated results
      setMeetingList(result.items);
      setCurrentMeetingPage(newPage);

      console.log(
        `📄 Student page ${newPage}: ${result.total} total filtered meetings, showing ${result.items.length} items`
      );

      // Update URL params to maintain state
      if (currentClassroomForMeetings) {
        setSearchParams({
          view: "meetings",
          classroomId: encodeURIComponent(
            currentClassroomForMeetings.classroomId
          ),
          classroomName: encodeURIComponent(
            currentClassroomForMeetings.nameOfRoom
          ),
          page: newPage,
          tab: activeMeetingTab,
        });
      }
    }
  };

  // Handle meeting tab change
  const handleMeetingTabChange = (newTab) => {
    setActiveMeetingTab(newTab);
    setCurrentMeetingPage(1);

    console.log(
      `🎯 Student meeting tab switch: ${activeMeetingTab} -> ${newTab} (client-side filtering only)`
    );

    // Use getFilteredItems to get new filtered data
    const result = getFilteredItems(allMeetings, newTab, 1, meetingsPerPage);
    setMeetingList(result.items);
    setTotalMeetings(result.total);

    // Update URL to reflect tab change
    if (currentClassroomForMeetings) {
      setSearchParams({
        view: "meetings",
        classroomId: encodeURIComponent(
          currentClassroomForMeetings.classroomId
        ),
        classroomName: encodeURIComponent(
          currentClassroomForMeetings.nameOfRoom
        ),
        page: 1,
        tab: newTab,
      });
    }
  };

  // Handle classroom tab change
  const handleClassroomTabChange = (newTab) => {
    setActiveClassroomTab(newTab);
    setCurrentPage(1);

    console.log(
      `🎯 Student classroom tab switch: ${activeClassroomTab} -> ${newTab} (client-side filtering only)`
    );

    if (allClassrooms.length > 0) {
      const result = getFilteredItems(allClassrooms, newTab, 1, itemsPerPage);
      setClassrooms(result.items);
      setTotalClassrooms(result.total);
      setCurrentPage(1);

      console.log(
        `📊 Student filtered classrooms (${newTab}): ${result.total} total`
      );
    } else {
      console.log("📥 No classrooms in allClassrooms, fetching from server...");
      fetchStudentClassrooms(1);
    }
  };

  // Handle page change for classrooms
  const handlePageChange = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= Math.ceil(totalClassrooms / itemsPerPage) &&
      allClassrooms.length > 0
    ) {
      const result = getFilteredItems(
        allClassrooms,
        activeClassroomTab,
        newPage,
        itemsPerPage
      );
      setClassrooms(result.items);
      setCurrentPage(newPage);

      console.log(
        `📄 Student classroom page change: ${currentPage} -> ${newPage}`
      );
    }
  };

  // Other handlers
  const handleGoBack = () => {
    setShowMeetingView(false);
    setCurrentClassroomForMeetings(null);
    setSearchParams({});
  };

  const handleGoToMeetingView = async (classroomId, classroomName) => {
    await handleViewMeetings(classroomId, classroomName);
  };

  const handleClassroomEvaluation = (classroom) => {
    setSelectedClassroomForEvaluation(classroom);
    setShowEvaluationModal(true);
  };

  const handleEvaluationSubmit = async (evaluationData) => {
    console.log("Evaluation submitted:", evaluationData);
    toast.success("Đánh giá đã được gửi thành công!");
    setShowEvaluationModal(false);
    setSelectedClassroomForEvaluation(null);
  };

  const handleCloseEvaluationModal = () => {
    setShowEvaluationModal(false);
    setSelectedClassroomForEvaluation(null);
  };
  // Meeting rating handlers
  const handleMeetingRating = (meeting) => {
    setSelectedMeetingForRating(meeting);
    setShowMeetingRatingModal(true);
  };

  const handleCloseMeetingRatingModal = () => {
    setShowMeetingRatingModal(false);
    setSelectedMeetingForRating(null);
  };

  const handleMeetingRatingSubmit = async (ratingData) => {
    console.log("Meeting rating submitted:", ratingData);
    // TODO: Implement API call to submit rating
    toast.success("Đánh giá buổi học đã được gửi thành công!");
    setShowMeetingRatingModal(false);
    setSelectedMeetingForRating(null);
  };

  // Early return check for user authentication
  if (!currentUser?.userId) {
    return (
      <div className="student-classroom-page">
        <h2 className="scp-page-title">Lớp học của tôi</h2>
        <p>Vui lòng đăng nhập để xem thông tin lớp học.</p>
      </div>
    );
  }

  // Meeting View Component
  const MeetingView = () => {
    if (!showMeetingView || !currentClassroomForMeetings) return null;

    const handleJoinMeeting = (meeting) => {
      const zoomUrl = meeting.joinUrl || meeting.join_url;
      if (zoomUrl) {
        window.open(zoomUrl, "_blank");
        toast.success("Đang mở Zoom meeting...");
      } else {
        toast.error("Không tìm thấy link tham gia buổi học.");
      }
    };
    return (
      <div className="student-classroom-page">
        {/* Breadcrumb Navigation */}
        <div className="scp-breadcrumb">
          <span className="scp-breadcrumb-item">
            <i className="fas fa-home"></i>
            <button className="scp-breadcrumb-link" onClick={handleGoBack}>
              Lớp học của tôi
            </button>
          </span>
          <span className="scp-breadcrumb-separator">
            <i className="fas fa-chevron-right"></i>
          </span>
          <span className="scp-breadcrumb-current">
            Buổi học - {currentClassroomForMeetings.nameOfRoom}
          </span>
        </div>
        <div className="scp-meeting-view">
          <div className="scp-meeting-header">
            <div className="scp-meeting-title">
              <i className="fas fa-video"></i>
              Phòng học - {currentClassroomForMeetings.nameOfRoom}
            </div>
            <button className="scp-back-btn" onClick={handleGoBack}>
              <i className="fas fa-arrow-left"></i>
              Quay lại danh sách lớp học
            </button>
          </div>

          {/* Meeting Tabs */}
          <div className="scp-meeting-tabs-container">
            <div className="scp-meeting-tabs">
              <button
                className={`scp-tab ${
                  activeMeetingTab === "IN_SESSION" ? "active" : ""
                }`}
                onClick={() => handleMeetingTabChange("IN_SESSION")}
              >
                <i className="fas fa-video"></i>
                Phòng học đang hoạt động
                <span className="scp-tab-count">
                  ({getCountByStatus(allMeetings, "IN_SESSION")})
                </span>
              </button>
              <button
                className={`scp-tab ${
                  activeMeetingTab === "ENDED" ? "active" : ""
                }`}
                onClick={() => handleMeetingTabChange("ENDED")}
              >
                <i className="fas fa-video-slash"></i>
                Phòng học đã kết thúc
                <span className="scp-tab-count">
                  ({getCountByStatus(allMeetings, "ENDED")})
                </span>
              </button>
            </div>
          </div>

          {/* Meeting List */}
          <div className="scp-meeting-list">
            {isMeetingLoading ? (
              <div className="scp-loading">
                <div className="scp-spinner"></div>
                <p>Đang tải danh sách buổi học...</p>
              </div>
            ) : meetingList.length > 0 ? (
              <div className="scp-meeting-grid">
                {meetingList.map((meeting, index) => (
                  <div
                    key={meeting.meetingId || index}
                    className="scp-meeting-card"
                  >
                    <div className="scp-meeting-header">
                      <h4 className="scp-meeting-title">
                        {meeting.topic || `Buổi học ${index + 1}`}
                      </h4>
                      <span
                        className={`scp-meeting-status ${meeting.status?.toLowerCase()}`}
                      >
                        {statusLabels[meeting.status] ||
                          meeting.status ||
                          "Chưa xác định"}
                      </span>
                    </div>

                    <div className="scp-meeting-details">
                      <p>
                        <strong>Thời gian:</strong>{" "}
                        {formatDate(meeting.startTime)}
                      </p>
                      <p>
                        <strong>Mã phòng:</strong> {meeting.meetingId || "N/A"}
                      </p>
                      {meeting.duration && (
                        <p>
                          <strong>Thời lượng:</strong> {meeting.duration} phút
                        </p>
                      )}
                    </div>                    <div className="scp-meeting-actions">
                      {meeting.status === "IN_SESSION" ||
                      meeting.status === "STARTED" ? (
                        <button
                          className="scp-join-meeting-btn"
                          onClick={() => handleJoinMeeting(meeting)}
                        >
                          <i className="fas fa-video"></i>
                          Tham gia
                        </button>
                      ) : (meeting.status === "ENDED" ||
                          meeting.status === "COMPLETED") &&
                        meeting.isRating === false ? (
                        <button
                          className="scp-rate-meeting-btn"
                          onClick={() => handleMeetingRating(meeting)}
                        >
                          <i className="fas fa-star"></i>
                          Đánh giá
                        </button>
                      ) : (meeting.status === "ENDED" ||
                          meeting.status === "COMPLETED") &&
                        meeting.isRating === true ? (
                        <button className="scp-meeting-rated-btn" disabled>
                          <i className="fas fa-check-circle"></i>
                          Đã đánh giá
                        </button>
                      ) : (
                        <button className="scp-meeting-ended-btn" disabled>
                          <i className="fas fa-check-circle"></i>
                          Đã kết thúc
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="scp-empty-meetings">
                <div className="scp-empty-icon">
                  <i className="fas fa-calendar-times"></i>
                </div>
                <h3>Không có buổi học nào</h3>
                <p>
                  {activeMeetingTab === "IN_SESSION"
                    ? "Hiện tại không có buổi học nào đang diễn ra."
                    : "Không có buổi học nào đã kết thúc."}
                </p>
              </div>
            )}
          </div>

          {/* Meeting Pagination */}
          {meetingList.length > 0 &&
            Math.ceil(totalMeetings / meetingsPerPage) > 1 && (
              <div className="scp-pagination">
                <button
                  className="scp-pagination-btn"
                  onClick={() => handleMeetingPageChange(currentMeetingPage - 1)}
                  disabled={currentMeetingPage === 1}
                >
                  <i className="fas fa-chevron-left"></i>
                  Trước
                </button>

                <span className="scp-pagination-info">
                  Trang {currentMeetingPage} /{" "}
                  {Math.ceil(totalMeetings / meetingsPerPage)}
                </span>

                <button
                  className="scp-pagination-btn"
                  onClick={() => handleMeetingPageChange(currentMeetingPage + 1)}
                  disabled={
                    currentMeetingPage ===
                    Math.ceil(totalMeetings / meetingsPerPage)
                  }
                >
                  Sau
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
        </div>
      );
    };

    // If showing meeting view
    if (showMeetingView) {
      return <MeetingView />;
    }
    // Main Classroom List View
    return (
      <div className="student-classroom-page">
        <div className="scp-header-section">
          <h2 className="scp-page-title">Lớp học của tôi ({totalClassrooms})</h2>
          <button
            className="scp-refresh-btn"
            onClick={() => {
              console.log("🔄 Manual refresh triggered");
              fetchStudentClassrooms(1, true); // Force refresh
            }}
            disabled={isLoading}
            title="Làm mới dữ liệu"
          >
            <i className={`fas fa-sync-alt ${isLoading ? "fa-spin" : ""}`}></i>
            {isLoading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        {/* Classroom Tabs */}
        <div className="scp-classroom-tabs-container">
          <div className="scp-classroom-tabs">
            <button
              className={`scp-classroom-tab ${
                activeClassroomTab === "IN_SESSION" ? "active" : ""
              }`}
              onClick={() => handleClassroomTabChange("IN_SESSION")}
            >
              Đang học ({getCountByStatus(allClassrooms, "IN_SESSION")})
            </button>
            <button
              className={`scp-classroom-tab ${
                activeClassroomTab === "ENDED" ? "active" : ""
              }`}
              onClick={() => handleClassroomTabChange("ENDED")}
            >
              Đã hoàn thành ({getCountByStatus(allClassrooms, "ENDED")})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="scp-loading">
            <div className="scp-spinner"></div>
            <p>Đang tải danh sách lớp học...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="scp-error">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
            <button
              onClick={() => fetchStudentClassrooms(1)}
              className="scp-retry-btn"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Classroom List */}
        {!isLoading && !error && classrooms.length > 0 && (
          <div className="scp-classroom-grid">
            {classrooms.map((classroom) => {
              const schedule = parseDateTimeLearn(classroom.dateTimeLearn);
              const progress = calculateClassProgress(
                classroom.startDay,
                classroom.endDay
              );

              return (
                <div key={classroom.classroomId} className="scp-classroom-card">
                  <div className="scp-classroom-header">
                    <h3 className="scp-classroom-title">
                      {classroom.nameOfRoom}
                    </h3>
                    <span
                      className={`scp-classroom-status ${classroom.status?.toLowerCase()}`}
                    >
                      {statusLabels[classroom.status] ||
                        classroom.status ||
                        "Chưa xác định"}
                    </span>
                  </div>

                  <div className="scp-classroom-content">
                    <div className="scp-tutor-info">
                      <img
                        src={getSafeAvatarUrl(classroom.tutor)}
                        alt="Avatar"
                        className="scp-tutor-avatar"
                        onError={handleAvatarError}
                      />{" "}
                      <div className="scp-tutor-details">
                        <p className="scp-tutor-name">
                          {classroom.tutor?.fullname ||
                            `${classroom.tutor?.firstName || ""} ${
                              classroom.tutor?.lastName || ""
                            }`.trim() ||
                            "Chưa xác định"}
                        </p>
                        <p className="scp-tutor-phone">
                          {classroom.tutor?.phoneNumber}
                        </p>
                      </div>
                    </div>{" "}
                    <div className="scp-classroom-info">
                      <p>
                        <strong>Môn học:</strong>{" "}
                        {classroom.tutor?.subject?.subjectName ||
                          classroom.subject ||
                          "Chưa xác định"}
                      </p>
                      <p>
                        <strong>Thời gian:</strong>{" "}
                        {formatDate(classroom.startDay)} -{" "}
                        {formatDate(classroom.endDay)}
                      </p>
                      <p>
                        <strong>Giá:</strong>{" "}
                        {(
                          classroom.tutor?.coinPerHours ||
                          classroom.price ||
                          0
                        ).toLocaleString()}{" "}
                        VND/giờ
                      </p>

                      {schedule.length > 0 && (
                        <div className="scp-schedule">
                          <strong>Lịch học:</strong>
                          {schedule.map((item, index) => (
                            <span key={index} className="scp-schedule-item">
                              {item.day}: {item.times}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="scp-progress">
                        <div className="scp-progress-label">
                          <strong>Tiến độ:</strong> {progress.percentage}%
                        </div>
                        <div className="scp-progress-bar">
                          <div
                            className={`scp-progress-fill ${progress.status}`}
                            style={{ width: `${progress.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="scp-classroom-actions">
                    <button
                      className="scp-view-meetings-btn"
                      onClick={() =>
                        handleGoToMeetingView(
                          classroom.classroomId,
                          classroom.nameOfRoom
                        )
                      }
                    >
                      <i className="fas fa-calendar-alt"></i>
                      Xem buổi học
                    </button>

                    {classroom.status === "COMPLETED" && (
                      <button
                        className="scp-evaluate-btn"
                        onClick={() => handleClassroomEvaluation(classroom)}
                      >
                        <i className="fas fa-star"></i>
                        Đánh giá
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && classrooms.length === 0 && (
          <div className="scp-empty-state">
            <div className="scp-empty-icon">
              <i className="fas fa-chalkboard-teacher"></i>
            </div>
            <h3>Không có lớp học nào</h3>
            <p>
              {activeClassroomTab === "IN_SESSION"
                ? "Bạn chưa tham gia lớp học nào đang diễn ra."
                : "Bạn chưa hoàn thành lớp học nào."}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!isLoading &&
          !error &&
          classrooms.length > 0 &&
          Math.ceil(totalClassrooms / itemsPerPage) > 1 && (
            <div className="scp-pagination">
              <button
                className="scp-pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left"></i>
                Trước
              </button>

              <span className="scp-pagination-info">
                Trang {currentPage} / {Math.ceil(totalClassrooms / itemsPerPage)}
              </span>

              <button
                className="scp-pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={
                  currentPage === Math.ceil(totalClassrooms / itemsPerPage)
                }
              >
                Sau
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}

        {/* Evaluation Modal */}
        {showEvaluationModal && selectedClassroomForEvaluation && (
          <ClassroomEvaluationModal
            isOpen={showEvaluationModal}
            classroomName={selectedClassroomForEvaluation.nameOfRoom}
            onSubmit={handleEvaluationSubmit}
            onClose={handleCloseEvaluationModal}
          />
        )}        {/* Meeting Rating Modal - for đánh giá meeting */}
        {showMeetingRatingModal && selectedMeetingForRating && (
          <MeetingRatingModal
            meeting={selectedMeetingForRating}
            isOpen={showMeetingRatingModal}
            onClose={handleCloseMeetingRatingModal}
            onSubmit={handleMeetingRatingSubmit}
          />
        )}
      </div>
    );
};

export default memo(StudentClassroomPage);
