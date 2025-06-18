import { useState, useEffect, useCallback, memo } from "react";
import { useSearchParams } from "react-router-dom";
import PropTypes from "prop-types";
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
  ENDED: "Đã kết thúc",
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

// Helper functions for accurate counting and pagination
const getCountByStatus = (items, status) => {
  if (status === "IN_SESSION") {
    return items.filter(
      (item) =>
        item.status === "IN_SESSION" ||
        item.status === "PENDING" ||
        item.status === "STARTED" ||
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

const getFilteredItems = (allItems, statusFilter, page, itemsPerPage) => {
  let filteredItems;

  if (statusFilter === "IN_SESSION") {
    // SYNC WITH TUTOR: Remove STARTED status to match tutor logic exactly
    filteredItems = allItems.filter(
      (item) =>
        item.status === "IN_SESSION" ||
        item.status === "PENDING" ||
        !item.status
    );
    console.log("🔍 STUDENT DEBUG - IN_SESSION filter applied:", {
      totalItems: allItems.length,
      filteredCount: filteredItems.length,
      statusCounts: {
        IN_SESSION: allItems.filter((i) => i.status === "IN_SESSION").length,
        PENDING: allItems.filter((i) => i.status === "PENDING").length,
        noStatus: allItems.filter((i) => !i.status).length,
        STARTED: allItems.filter((i) => i.status === "STARTED").length, // Check if any STARTED exist
      },
    });
  } else if (statusFilter === "ENDED") {
    filteredItems = allItems.filter(
      (item) =>
        item.status === "COMPLETED" ||
        item.status === "CANCELLED" ||
        item.status === "ENDED"
    );
    console.log("🔍 STUDENT DEBUG - ENDED filter applied:", {
      totalItems: allItems.length,
      filteredCount: filteredItems.length,
      statusCounts: {
        COMPLETED: allItems.filter((i) => i.status === "COMPLETED").length,
        CANCELLED: allItems.filter((i) => i.status === "CANCELLED").length,
        ENDED: allItems.filter((i) => i.status === "ENDED").length,
      },
      filteredItems: filteredItems.map((item) => ({
        meetingId: item.meetingId,
        topic: item.topic,
        status: item.status,
      })),
    });
  } else {
    filteredItems = allItems;
    console.log(
      "🔍 STUDENT DEBUG - No filter applied, showing all items:",
      filteredItems.length
    );
  }

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  console.log("🔍 STUDENT DEBUG - Pagination applied:", {
    page,
    itemsPerPage,
    startIndex,
    endIndex,
    totalFiltered: filteredItems.length,
    paginatedCount: paginatedItems.length,
  });

  return {
    items: paginatedItems,
    total: filteredItems.length,
  };
};

// Handle image loading errors
const handleImageError = (event) => {
  if (event?.target) {
    event.target.src = dfMale;
  }
};

// MeetingRatingModal Component
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
      toast.success("Đánh giá đã được gửi thành công!");
      onClose();
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Có lỗi xảy ra khi đánh giá. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingDescription = (rating) => {
    if (rating === 0) return "";
    if (rating <= 1) return "(Rất tệ)";
    if (rating <= 2) return "(Tệ)";
    if (rating <= 3) return "(Bình thường)";
    if (rating <= 4) return "(Tốt)";
    return "(Xuất sắc)";
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
              </label>{" "}
              {/* Custom Star Rating with Half Star Support */}
              <div className="scp-star-rating-container">
                <div
                  className="scp-custom-star-rating"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((starIndex) => (
                    <div key={starIndex} className="scp-star-wrapper">
                      {/* Left half of star (0.5) */}
                      <div
                        className={`scp-star-half scp-star-left ${
                          (hoverRating || rating) >= starIndex - 0.5
                            ? "filled"
                            : ""
                        }`}
                        onClick={() => setRating(starIndex - 0.5)}
                        onMouseEnter={() => setHoverRating(starIndex - 0.5)}
                      >
                        <i className="fas fa-star"></i>
                      </div>
                      {/* Right half of star (1.0) */}
                      <div
                        className={`scp-star-half scp-star-right ${
                          (hoverRating || rating) >= starIndex ? "filled" : ""
                        }`}
                        onClick={() => setRating(starIndex)}
                        onMouseEnter={() => setHoverRating(starIndex)}
                      >
                        <i className="fas fa-star"></i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>{" "}
              <div className="scp-rating-text">
                {(hoverRating || rating) > 0 && (
                  <span className="scp-rating-value">
                    <i
                      className="fas fa-star"
                      style={{ color: "#ffc107", marginRight: "5px" }}
                    ></i>
                    {(hoverRating || rating).toFixed(1)} sao{" "}
                    {getRatingDescription(hoverRating || rating)}
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

// PropTypes for MeetingRatingModal
MeetingRatingModal.propTypes = {
  meeting: PropTypes.shape({
    meetingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    topic: PropTypes.string,
    zoomMeetingId: PropTypes.string,
    startTime: PropTypes.string,
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

// Main Student Classroom Page Component
const StudentClassroomPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalClassrooms, setTotalClassrooms] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  const [allClassrooms, setAllClassrooms] = useState([]);

  // Evaluation modal state
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [selectedClassroomForEvaluation, setSelectedClassroomForEvaluation] =
    useState(null);

  // Meeting rating modal state
  const [showMeetingRatingModal, setShowMeetingRatingModal] = useState(false);
  const [selectedMeetingForRating, setSelectedMeetingForRating] =
    useState(null);

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

      if (isLoading && !forceRefresh) return;

      setIsLoading(true);
      setError(null);

      try {
        const queryParams = { userId: currentUser.userId };

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
    [currentUser?.userId, itemsPerPage, activeClassroomTab, isLoading]
  );
  // Handle viewing meetings - fixed to use correct API and data path
  const handleViewMeetings = useCallback(
    async (classroomId, classroomName, page = 1) => {
      console.log(
        `🚀 Student handleViewMeetings called: classroomId=${classroomId}, classroomName=${classroomName}, page=${page}`
      );

      setIsMeetingLoading(true);
      setError(null);

      // Initialize finalTab variable at function scope
      let finalTab = activeMeetingTab;
      try {
        console.log(
          "📞 Student calling meeting/get-meeting API with POST method like tutor..."
        );

        // Debug token status like tutor
        const token =
          localStorage.getItem("accessToken") ||
          sessionStorage.getItem("accessToken");
        console.log("🔍 STUDENT DEBUG - Token status:", {
          hasToken: !!token,
          tokenLength: token ? token.length : 0,
          tokenPreview: token ? token.substring(0, 20) + "..." : "No token",
        });

        console.log("🔍 STUDENT DEBUG - About to call API:", {
          endpoint: "meeting/get-meeting",
          method: "POST",
          data: { classroomId: classroomId },
          requireToken: true,
        });

        // Use the same API call format as tutor (POST with data)
        const response = await Api({
          endpoint: "meeting/get-meeting",
          method: METHOD_TYPE.POST,
          data: { classroomId: classroomId },
          requireToken: true,
        });

        console.log(
          "🔍 STUDENT DEBUG - API call completed. Response:",
          response
        );
        console.log("📦 Student meeting API response:", response);
        console.log(
          "🔍 STUDENT DEBUG - Full response structure:",
          JSON.stringify(response, null, 2)
        ); // Use the same data extraction logic as tutor - check for data in response.data.result.items FIRST
        let meetings = [];
        if (
          response.success &&
          response.data &&
          response.data.result &&
          response.data.result.items
        ) {
          meetings = response.data.result.items;
          console.log(
            "✅ STUDENT DEBUG - Found meetings in response.data.result.items:",
            meetings.length
          );
          console.log(
            "🔍 STUDENT DEBUG - Meeting statuses:",
            meetings.map((m) => m.status)
          );
        } else {
          console.log(
            "❌ STUDENT DEBUG - API call failed or invalid response structure:",
            response
          );
          console.log(
            "🔍 STUDENT DEBUG - Response keys:",
            Object.keys(response || {})
          );
          console.log("🔍 STUDENT DEBUG - response.success:", response.success);
          console.log("🔍 STUDENT DEBUG - response.data:", response.data);
        }
        console.log(
          `📊 Student meetings extracted: ${meetings.length} meetings`
        );
        console.log("📊 Student meetings data:", meetings);

        if (meetings.length > 0) {
          console.log(
            "🔍 STUDENT DEBUG - Setting meetings to state:",
            meetings.length
          );
          console.log(
            "🔍 STUDENT DEBUG - Meeting details:",
            meetings.map((m) => ({
              meetingId: m.meetingId,
              status: m.status,
              topic: m.topic,
            }))
          );
          setAllMeetings(meetings); // Check meeting statuses and auto-set appropriate tab (same logic as tutor)
          const hasInSessionMeetings = meetings.some(
            (m) =>
              m.status === "IN_SESSION" || m.status === "PENDING" || !m.status
          );
          const hasEndedMeetings = meetings.some(
            (m) =>
              m.status === "ENDED" ||
              m.status === "COMPLETED" ||
              m.status === "CANCELLED"
          );

          console.log("🔍 STUDENT DEBUG - Meeting status analysis:", {
            hasInSessionMeetings,
            hasEndedMeetings,
            currentActiveMeetingTab: activeMeetingTab,
            allStatuses: meetings.map((m) => m.status),
            inSessionItems: meetings.filter(
              (m) =>
                m.status === "IN_SESSION" || m.status === "PENDING" || !m.status
            ),
            endedItems: meetings.filter(
              (m) =>
                m.status === "ENDED" ||
                m.status === "COMPLETED" ||
                m.status === "CANCELLED"
            ),
          });

          // Auto-adjust tab if current tab has no meetings (same logic as tutor)
          if (
            activeMeetingTab === "IN_SESSION" &&
            !hasInSessionMeetings &&
            hasEndedMeetings
          ) {
            finalTab = "ENDED";
            setActiveMeetingTab("ENDED");
            console.log(
              "🔄 STUDENT DEBUG - Auto-switching to ENDED tab (no IN_SESSION meetings found)"
            );
          } else if (
            activeMeetingTab === "ENDED" &&
            !hasEndedMeetings &&
            hasInSessionMeetings
          ) {
            finalTab = "IN_SESSION";
            setActiveMeetingTab("IN_SESSION");
            console.log(
              "🔄 STUDENT DEBUG - Auto-switching to IN_SESSION tab (no ENDED meetings found)"
            );
          } else {
            console.log("🔍 STUDENT DEBUG - No tab auto-switch needed:", {
              currentTab: activeMeetingTab,
              hasInSession: hasInSessionMeetings,
              hasEnded: hasEndedMeetings,
              finalTab: finalTab,
            });
          }

          const result = getFilteredItems(
            meetings,
            finalTab,
            page,
            meetingsPerPage
          );
          console.log("🔍 STUDENT DEBUG - Filtered result:", {
            totalItems: meetings.length,
            filteredItems: result.items.length,
            activeTab: finalTab,
            resultTotal: result.total,
          });

          console.log(
            "🔍 STUDENT DEBUG - meetingList state will be set to:",
            result.items
          );
          console.log(
            "🔍 STUDENT DEBUG - First meeting in result:",
            result.items[0]
          );

          setMeetingList(result.items);
          setTotalMeetings(result.total);
          setCurrentMeetingPage(page);

          console.log(
            `📊 Student filtered meetings (${finalTab}): ${result.total}, showing page ${page}`
          );

          // Set meeting view state
          setCurrentClassroomForMeetings({
            classroomId,
            nameOfRoom: classroomName,
          });

          console.log("🔍 STUDENT DEBUG - About to show meeting view");
          setShowMeetingView(true);

          // Update URL params with final tab (after auto-switch)
          setSearchParams({
            classroomId,
            classroomName,
            tab: finalTab,
            page: page.toString(),
          });

          toast.success(`Đã tải ${meetings.length} phòng học!`);
          console.log("🔍 STUDENT DEBUG - Meeting view should now be visible");
        } else {
          console.log(
            "⚠️ STUDENT DEBUG - No meetings found for this classroom"
          );
          setAllMeetings([]);
          setMeetingList([]);
          setTotalMeetings(0);
          setCurrentMeetingPage(1);
          setCurrentClassroomForMeetings({
            classroomId,
            nameOfRoom: classroomName,
          });

          console.log("🔍 STUDENT DEBUG - About to show meeting view (empty)");
          setShowMeetingView(true);

          // Update URL params even when no meetings
          setSearchParams({
            classroomId,
            classroomName,
            tab: finalTab,
            page: page.toString(),
          });
          toast.info("Chưa có phòng học nào được tạo cho lớp này.");
        }
      } catch (error) {
        console.error("❌ Student error fetching meetings:", error);
        setError("Lỗi khi tải danh sách buổi học.");
        setMeetingList([]);
        setAllMeetings([]);
        setTotalMeetings(0);

        // FIXED: Still show meeting view even on error, don't stay on classroom list
        setCurrentClassroomForMeetings({
          classroomId,
          nameOfRoom: classroomName,
        });
        setShowMeetingView(true);

        // Also set URL params to maintain state
        setSearchParams({
          classroomId,
          classroomName,
          tab: finalTab,
          page: page.toString(),
        });
      } finally {
        setIsMeetingLoading(false);
      }
    },
    [activeMeetingTab, meetingsPerPage, setSearchParams]
  );

  // Handle tab changes for classrooms
  const handleClassroomTabChange = (newTab) => {
    if (newTab === activeClassroomTab) return;

    console.log(
      `🔄 Student classroom tab change: ${activeClassroomTab} -> ${newTab}`
    );
    setActiveClassroomTab(newTab);

    if (allClassrooms.length > 0) {
      const result = getFilteredItems(allClassrooms, newTab, 1, itemsPerPage);
      setClassrooms(result.items);
      setTotalClassrooms(result.total);
      setCurrentPage(1);
      console.log(
        `📊 Student filtered after tab change: ${result.total} items`
      );
    } else {
      fetchStudentClassrooms(1);
    }
  };

  // Handle tab changes for meetings
  const handleMeetingTabChange = (newTab) => {
    if (newTab === activeMeetingTab) return;

    console.log(
      `🔄 Student meeting tab change: ${activeMeetingTab} -> ${newTab}`
    );
    setActiveMeetingTab(newTab);

    if (allMeetings.length > 0) {
      const result = getFilteredItems(allMeetings, newTab, 1, meetingsPerPage);
      setMeetingList(result.items);
      setTotalMeetings(result.total);
      setCurrentMeetingPage(1);
      console.log(
        `📊 Student filtered meetings after tab change: ${result.total} items`
      );
    }
  };

  // Initial load and URL parameter restoration
  useEffect(() => {
    const classroomId = searchParams.get("classroomId");
    const classroomName = searchParams.get("classroomName");
    const tab = searchParams.get("tab");
    const page = parseInt(searchParams.get("page")) || 1;

    if (classroomId && classroomName) {
      console.log("🔄 Student restoring meeting view from URL params");
      if (tab) setActiveMeetingTab(tab);
      handleViewMeetings(classroomId, classroomName, page);
    } else {
      fetchStudentClassrooms(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.userId, searchParams]);

  // Handle refresh
  const handleRefresh = () => {
    if (showMeetingView && currentClassroomForMeetings) {
      handleViewMeetings(
        currentClassroomForMeetings.classroomId,
        currentClassroomForMeetings.nameOfRoom,
        currentMeetingPage
      );
    } else {
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
    console.log("🔍 STUDENT DEBUG - handleGoToMeetingView called with:", {
      classroomId,
      classroomName,
      timestamp: new Date().toISOString(),
    });
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

  const handleJoinMeeting = (meeting) => {
    const zoomUrl = meeting.joinUrl || meeting.join_url;
    if (zoomUrl) {
      window.open(zoomUrl, "_blank");
      toast.success("Đang mở phòng học trực tuyến...");
    } else {
      toast.error("Không tìm thấy link tham gia buổi học.");
    }
  };

  // If showing meeting view
  if (showMeetingView) {
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
          </span>{" "}
          <span className="scp-breadcrumb-item scp-breadcrumb-current">
            <i className="fas fa-video"></i>
            Phòng học - {currentClassroomForMeetings.nameOfRoom}
          </span>
        </div>
        <div className="scp-meeting-view">
          {" "}
          <div className="scp-meeting-header">
            <div className="scp-meeting-title">
              <i className="fas fa-video"></i>
              Phòng học - {currentClassroomForMeetings.nameOfRoom} (
              {totalMeetings})
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
          </div>{" "}
          {/* Meeting List */}{" "}
          <div className="scp-meeting-content">
            {/* DEBUG: Meeting render state */}
            <div style={{ display: "none" }}>
              DEBUG - meetingList.length: {meetingList.length},
              isMeetingLoading: {isMeetingLoading.toString()}, totalMeetings:{" "}
              {totalMeetings}, activeMeetingTab: {activeMeetingTab}
            </div>

            {isMeetingLoading ? (
              <div className="scp-loading">
                <div className="scp-loading-spinner"></div>
                <p className="scp-loading-text">
                  Đang tải danh sách phòng học...
                </p>
              </div>
            ) : meetingList.length > 0 ? (
              <ul className="scp-meeting-list">
                {meetingList.map((meeting, index) => {
                  const isEnded =
                    meeting.status === "COMPLETED" ||
                    meeting.status === "ENDED" ||
                    meeting.status === "FINISHED" ||
                    (meeting.endTime && new Date(meeting.endTime) < new Date());

                  return (
                    <li
                      key={meeting.meetingId || index}
                      className="scp-meeting-item"
                    >
                      <div className="scp-meeting-info">
                        <p>
                          <i className="fas fa-bookmark"></i>
                          <strong>Chủ đề:</strong>{" "}
                          {meeting.topic || "Không có chủ đề"}
                        </p>
                        <p>
                          <i className="fas fa-id-card"></i>
                          <strong>Meeting ID:</strong>{" "}
                          {meeting.zoomMeetingId ||
                            meeting.id ||
                            meeting.meetingId}
                        </p>
                        {meeting.password && (
                          <p>
                            <i className="fas fa-key"></i>
                            <strong>Mật khẩu:</strong> {meeting.password}
                          </p>
                        )}
                        <p>
                          <i className="fas fa-clock"></i>
                          <strong>Thời gian bắt đầu:</strong>{" "}
                          {meeting.startTime
                            ? new Date(meeting.startTime).toLocaleString(
                                "vi-VN"
                              )
                            : "Chưa xác định"}
                        </p>
                        {meeting.endTime && (
                          <p>
                            <i className="fas fa-history"></i>
                            <strong>Thời gian kết thúc:</strong>{" "}
                            {new Date(meeting.endTime).toLocaleString("vi-VN")}
                          </p>
                        )}
                        <p>
                          <i className="fas fa-info-circle"></i>
                          <strong>Trạng thái:</strong>{" "}
                          <span
                            className={`scp-meeting-status ${
                              isEnded
                                ? "scp-meeting-status-ended"
                                : "scp-meeting-status-active"
                            }`}
                          >
                            {statusLabels[meeting.status] ||
                              meeting.status ||
                              "Chưa xác định"}
                          </span>
                        </p>
                      </div>

                      {!isEnded ? (
                        <div className="scp-meeting-actions">
                          <button
                            className="scp-action-btn scp-join-meeting-btn"
                            onClick={() => handleJoinMeeting(meeting)}
                          >
                            <i className="fas fa-external-link-alt"></i>
                            Tham gia
                          </button>
                          {meeting.joinUrl && (
                            <button
                              className="scp-action-btn scp-copy-link-btn"
                              onClick={() => {
                                navigator.clipboard.writeText(meeting.joinUrl);
                                toast.success("Đã sao chép link tham gia!");
                              }}
                              title="Sao chép link"
                            >
                              <i className="fas fa-copy"></i>
                              Sao chép link
                            </button>
                          )}
                        </div>
                      ) : meeting.isRating === false ? (
                        <div className="scp-meeting-actions">
                          <button
                            className="scp-action-btn scp-rate-meeting-btn"
                            onClick={() => handleMeetingRating(meeting)}
                          >
                            <i className="fas fa-star"></i>
                            Đánh giá
                          </button>
                        </div>
                      ) : (
                        <div className="scp-meeting-ended">
                          <span className="scp-ended-label">
                            <i className="fas fa-check-circle"></i>
                            {meeting.isRating === true
                              ? "Đã đánh giá"
                              : "Phiên đã kết thúc"}
                          </span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="scp-empty-state">
                {/* DEBUG: Why empty state is showing */}
                <div
                  style={{
                    fontSize: "12px",
                    color: "red",
                    marginBottom: "10px",
                  }}
                >
                  DEBUG: meetingList.length={meetingList.length}, totalMeetings=
                  {totalMeetings}, allMeetings.length={allMeetings.length},
                  activeMeetingTab={activeMeetingTab}
                </div>

                <i
                  className={`fas ${
                    activeMeetingTab === "IN_SESSION"
                      ? "fa-video-slash"
                      : "fa-clock"
                  }`}
                ></i>
                <h3>
                  {activeMeetingTab === "IN_SESSION"
                    ? "Không có phòng học nào đang hoạt động"
                    : "Không có phòng học nào đã kết thúc"}
                </h3>
                <p>
                  {activeMeetingTab === "IN_SESSION"
                    ? "Hiện tại không có phòng học nào đang diễn ra."
                    : "Không có phòng học nào đã kết thúc."}{" "}
                </p>
              </div>
            )}
          </div>
          {/* Meeting Pagination */}
          {totalMeetings > meetingsPerPage && (
            <div className="scp-meeting-pagination">
              <button
                onClick={() => {
                  const newPage = currentMeetingPage - 1;
                  if (newPage >= 1 && allMeetings.length > 0) {
                    const result = getFilteredItems(
                      allMeetings,
                      activeMeetingTab,
                      newPage,
                      meetingsPerPage
                    );
                    setMeetingList(result.items);
                    setCurrentMeetingPage(newPage);
                  }
                }}
                disabled={currentMeetingPage === 1}
                className="scp-pagination-btn"
              >
                <i className="fas fa-chevron-left"></i>
                Trước
              </button>
              <span className="scp-pagination-info">
                Trang {currentMeetingPage} /{" "}
                {Math.ceil(totalMeetings / meetingsPerPage)}
              </span>
              <button
                onClick={() => {
                  const newPage = currentMeetingPage + 1;
                  const maxPage = Math.ceil(totalMeetings / meetingsPerPage);
                  if (newPage <= maxPage && allMeetings.length > 0) {
                    const result = getFilteredItems(
                      allMeetings,
                      activeMeetingTab,
                      newPage,
                      meetingsPerPage
                    );
                    setMeetingList(result.items);
                    setCurrentMeetingPage(newPage);
                  }
                }}
                disabled={
                  currentMeetingPage >=
                  Math.ceil(totalMeetings / meetingsPerPage)
                }
                className="scp-pagination-btn"
              >
                Sau
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>

        {/* Meeting Rating Modal */}
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
  }

  // Main Classroom List View
  return (
    <div className="student-classroom-page">
      <div className="scp-header-section">
        {" "}
        <h2 className="scp-page-title">Lớp học của tôi ({totalClassrooms})</h2>
        <button
          className="scp-refresh-btn"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <i className={`fas fa-sync-alt ${isLoading ? "fa-spin" : ""}`}></i>
          {isLoading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      {/* Classroom Tabs */}
      <div className="scp-tabs-container">
        <div className="scp-tabs">
          <button
            className={`scp-tab ${
              activeClassroomTab === "IN_SESSION" ? "active" : ""
            }`}
            onClick={() => handleClassroomTabChange("IN_SESSION")}
          >
            <i className="fas fa-play-circle"></i>
            Lớp học đang diễn ra
            <span className="scp-tab-count">
              ({getCountByStatus(allClassrooms, "IN_SESSION")})
            </span>
          </button>
          <button
            className={`scp-tab ${
              activeClassroomTab === "ENDED" ? "active" : ""
            }`}
            onClick={() => handleClassroomTabChange("ENDED")}
          >
            <i className="fas fa-check-circle"></i>
            Lớp học đã hoàn thành
            <span className="scp-tab-count">
              ({getCountByStatus(allClassrooms, "ENDED")})
            </span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="scp-error">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="scp-error-close">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="scp-loading">
          <div className="scp-spinner"></div>
          <p>Đang tải danh sách lớp học...</p>
        </div>
      )}

      {/* Classroom List */}
      {!isLoading && !error && classrooms.length > 0 && (
        <div className="scp-classroom-list">
          {classrooms.map((classroom, index) => {
            const schedule = parseDateTimeLearn(classroom.dateTimeLearn);

            return (
              <div
                key={classroom.classroomId || index}
                className="scp-classroom-card"
              >
                <div className="scp-card-header">
                  <div className="scp-card-title-section">
                    <i className="fas fa-chalkboard-teacher"></i>
                    <h3 className="scp-classroom-name">
                      {classroom.nameOfRoom || `Lớp học ${index + 1}`}
                    </h3>
                  </div>
                  <span
                    className={`scp-status-badge scp-status-${classroom.status?.toLowerCase()}`}
                  >
                    <i className="fas fa-circle"></i>
                    {statusLabels[classroom.status] ||
                      classroom.status ||
                      "Chưa xác định"}
                  </span>
                </div>{" "}
                {/* Tutor Section - Similar to tcp-student-section but for tutor */}
                <div className="scp-tutor-section">
                  <div className="scp-tutor-avatar-container">
                    <img
                      src={
                        classroom.tutorAvatar ||
                        classroom.tutor?.avatar ||
                        dfMale
                      }
                      alt={
                        classroom.tutorName ||
                        classroom.tutor?.fullname ||
                        "Gia sư"
                      }
                      className="scp-tutor-avatar"
                      onError={handleImageError}
                    />
                    <div className="scp-avatar-overlay">
                      <i className="fas fa-user-graduate"></i>
                    </div>
                  </div>
                  <div className="scp-tutor-details">
                    <div className="scp-tutor-name">
                      <i className="fas fa-user-graduate"></i>
                      {classroom.tutorName ||
                        classroom.tutor?.fullname ||
                        "Chưa cập nhật"}
                    </div>
                    <div className="scp-tutor-info-grid">
                      <div className="scp-info-item">
                        <i className="fas fa-university"></i>
                        <span>Trường: </span>
                        <span className="highlight">
                          {classroom.tutor?.university || "N/A"}
                        </span>
                      </div>
                      <div className="scp-info-item">
                        <i className="fas fa-graduation-cap"></i>
                        <span>Chuyên ngành: </span>
                        <span className="highlight">
                          {classroom.tutor?.major?.majorName || "N/A"}
                        </span>
                      </div>
                      <div className="scp-info-item">
                        <i className="fas fa-medal"></i>
                        <span>Cấp độ: </span>
                        <span className="highlight">
                          {classroom.tutor?.tutorLevel?.levelName || "N/A"}
                        </span>
                      </div>
                      <div className="scp-info-item">
                        <i className="fas fa-coins"></i>
                        <span>Học phí: </span>
                        <span className="highlight">
                          {classroom.price
                            ? `${parseInt(
                                classroom.price
                              ).toLocaleString()} VNĐ`
                            : classroom.tutor?.coinPerHours
                            ? `${parseInt(
                                classroom.tutor.coinPerHours
                              ).toLocaleString()} Xu/giờ`
                            : "Thỏa thuận"}
                        </span>
                      </div>
                      <div className="scp-info-item">
                        <i className="fas fa-book"></i>
                        <span>Môn học: </span>
                        <span className="highlight">
                          {classroom.subjectName ||
                            classroom.subject?.subjectName ||
                            "Chưa cập nhật"}
                        </span>
                      </div>
                      <div className="scp-info-item">
                        <i className="fas fa-star"></i>
                        <span>Đánh giá: </span>
                        <span className="highlight">
                          {classroom.classroomEvaluation &&
                          parseFloat(classroom.classroomEvaluation) > 0
                            ? `${classroom.classroomEvaluation}/5.0 ⭐`
                            : "Chưa có đánh giá"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Class Details Section */}
                <div className="scp-class-details">
                  <div className="scp-class-info-grid">
                    <div className="scp-info-group">
                      <div className="scp-info-label">
                        <i className="fas fa-calendar-alt"></i>
                        Ngày bắt đầu
                      </div>
                      <div className="scp-info-value">
                        {formatDate(classroom.startDay)}
                      </div>
                    </div>
                    <div className="scp-info-group">
                      <div className="scp-info-label">
                        <i className="fas fa-calendar-check"></i>
                        Ngày kết thúc
                      </div>
                      <div className="scp-info-value">
                        {formatDate(classroom.endDay)}
                      </div>
                    </div>
                  </div>

                  {/* Schedule Display */}
                  <div className="scp-info-group">
                    <div className="scp-info-label">
                      <i className="fas fa-clock"></i>
                      Lịch học
                    </div>
                    {schedule.length > 0 ? (
                      <ul className="scp-schedule-list">
                        {schedule.map((s, index) => (
                          <li key={index}>
                            <strong>{s.day}:</strong> {s.times}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="scp-info-value">Chưa có lịch học.</div>
                    )}
                  </div>
                </div>
                {/* Card Footer with Action Buttons */}
                <div className="scp-card-footer">
                  <div className="scp-action-buttons">
                    <button
                      className="scp-action-btn scp-view-meetings-btn"
                      onClick={() =>
                        handleGoToMeetingView(
                          classroom.classroomId,
                          classroom.nameOfRoom
                        )
                      }
                    >
                      <i className="fas fa-video"></i>
                      Xem phòng học
                    </button>

                    {classroom.status === "COMPLETED" && (
                      <button
                        className="scp-action-btn scp-evaluate-btn"
                        onClick={() => handleClassroomEvaluation(classroom)}
                      >
                        <i className="fas fa-star"></i>
                        Đánh giá
                      </button>
                    )}
                  </div>
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
      )}
    </div>
  );
};

export default memo(StudentClassroomPage);
