import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

// Helper functions for accurate counting and pagination
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
    async (page) => {
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
          "🔍 Fetching all student classrooms for client-side filtering"
        );

        const response = await Api({
          endpoint: "classroom/search-for-user",
          method: METHOD_TYPE.GET,
          query: queryParams,
          requireToken: true,
        });

        if (response.data && response.data.classrooms) {
          const allData = response.data.classrooms;
          console.log(`📊 Total classrooms fetched: ${allData.length}`);

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
        <div className="scp-header-with-back">
          <button className="scp-back-btn" onClick={handleGoBack}>
            <i className="fas fa-arrow-left"></i>
            Quay lại
          </button>
          <h2 className="scp-page-title">
            Buổi học - {currentClassroomForMeetings.nameOfRoom} ({totalMeetings}
            )
          </h2>
        </div>

        {/* Meeting Tabs */}
        <div className="scp-meeting-tabs-container">
          <div className="scp-meeting-tabs">
            <button
              className={`scp-meeting-tab ${
                activeMeetingTab === "IN_SESSION" ? "active" : ""
              }`}
              onClick={() => handleMeetingTabChange("IN_SESSION")}
            >
              Đang diễn ra ({getCountByStatus(allMeetings, "IN_SESSION")})
            </button>
            <button
              className={`scp-meeting-tab ${
                activeMeetingTab === "ENDED" ? "active" : ""
              }`}
              onClick={() => handleMeetingTabChange("ENDED")}
            >
              Đã kết thúc ({getCountByStatus(allMeetings, "ENDED")})
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
                  </div>

                  <div className="scp-meeting-actions">
                    {meeting.status === "IN_SESSION" ||
                    meeting.status === "STARTED" ? (
                      <button
                        className="scp-join-meeting-btn"
                        onClick={() => handleJoinMeeting(meeting)}
                      >
                        <i className="fas fa-video"></i>
                        Tham gia
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
      <h2 className="scp-page-title">Lớp học của tôi ({totalClassrooms})</h2>

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
                    />
                    <div className="scp-tutor-details">
                      <p className="scp-tutor-name">
                        {classroom.tutor?.firstName} {classroom.tutor?.lastName}
                      </p>
                      <p className="scp-tutor-phone">
                        {classroom.tutor?.phoneNumber}
                      </p>
                    </div>
                  </div>

                  <div className="scp-classroom-info">
                    <p>
                      <strong>Môn học:</strong> {classroom.subject}
                    </p>
                    <p>
                      <strong>Thời gian:</strong>{" "}
                      {formatDate(classroom.startDay)} -{" "}
                      {formatDate(classroom.endDay)}
                    </p>
                    <p>
                      <strong>Giá:</strong> {classroom.price?.toLocaleString()}{" "}
                      VND
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
      )}
    </div>
  );
};

export default memo(StudentClassroomPage);
