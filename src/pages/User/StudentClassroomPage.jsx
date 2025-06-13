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
// Debug components - only for development
// import ClassroomAPITest from "../../components/ClassroomAPITest";
// import QuickDebug from "../../components/QuickDebug";
// import CreateMeetingTest from "../../components/CreateMeetingTest";

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

const StudentClassroomPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalClassrooms, setTotalClassrooms] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2; // Changed to 2 as suggested

  // Store all classrooms for accurate filtering and pagination
  const [allClassrooms, setAllClassrooms] = useState([]);

  // Evaluation modal state
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [selectedClassroomForEvaluation, setSelectedClassroomForEvaluation] =
    useState(null);

  // Meeting list state for new implementation
  const [meetingList, setMeetingList] = useState([]);
  const [totalMeetings, setTotalMeetings] = useState(0);
  const [currentMeetingPage, setCurrentMeetingPage] = useState(1);
  const [isMeetingLoading, setIsMeetingLoading] = useState(false);
  const meetingsPerPage = 2; // 2 meetings per page

  // New state for main classroom tabs
  const [activeClassroomTab, setActiveClassroomTab] = useState("IN_SESSION");

  // New state for classroom detail view (similar to TutorClassroomPage)
  const [showClassroomDetail, setShowClassroomDetail] = useState(false);
  const [currentClassroomDetail, setCurrentClassroomDetail] = useState(null);

  // New state for showing meeting list directly on page instead of modal
  const [showMeetingView, setShowMeetingView] = useState(false);
  const [currentClassroomForMeetings, setCurrentClassroomForMeetings] =
    useState(null);
  const [activeMeetingTab, setActiveMeetingTab] = useState("IN_SESSION");
  const currentUser = useSelector((state) => state.user.userProfile);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fetchStudentClassrooms = useCallback(
    async (page /* statusFilter = null */) => {
      if (!currentUser?.userId) {
        setError("Không tìm thấy thông tin người dùng.");
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        // Build query parameters - fetch ALL classrooms for accurate filtering
        const queryParams = {
          page: 1, // Always fetch from page 1
          rpp: 1000, // Large number to get all classrooms
        };

        console.log(
          "🔍 Fetching all student classrooms for client-side filtering and accurate pagination"
        );

        const response = await Api({
          endpoint: "classroom/search-for-user",
          method: METHOD_TYPE.GET,
          query: queryParams,
          requireToken: true,
        });

        if (
          response.success &&
          response.data &&
          Array.isArray(response.data.items)
        ) {
          const allClassroomsData = response.data.items;
          console.log(
            `✅ Fetched ${allClassroomsData.length} total student classrooms from server`
          );

          // Store all classrooms for filtering
          setAllClassrooms(allClassroomsData);

          // Apply client-side filtering based on active tab
          const result = getFilteredItems(
            allClassroomsData,
            activeClassroomTab,
            page,
            itemsPerPage
          );

          setClassrooms(result.items);
          setTotalClassrooms(result.total); // Set total for current filter
          setCurrentPage(page);

          console.log(
            `📊 Filtered classrooms for tab ${activeClassroomTab}:`,
            result.total
          );
          console.log(
            `📄 Page ${page}: Showing ${result.items.length} of ${result.total} filtered classrooms`
          );
        } else {
          console.log("❌ API response invalid or empty");
          setClassrooms([]);
          setAllClassrooms([]);
          setTotalClassrooms(0);
        }
      } catch (err) {
        console.error("Error fetching student classrooms:", err);
        setError(
          err.response?.data?.message ||
            "Đã xảy ra lỗi khi tải danh sách lớp học."
        );
        toast.error(
          err.response?.data?.message ||
            "Đã xảy ra lỗi khi tải danh sách lớp học."
        );
        setClassrooms([]);
        setAllClassrooms([]);
        setTotalClassrooms(0);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser?.userId, itemsPerPage, activeClassroomTab]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  );
  useEffect(() => {
    // Initial load - always load all classrooms on component mount
    console.log(`📱 Initial loading of student classrooms`);
    fetchStudentClassrooms(1); // No filter on initial load to show all classrooms
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only trigger on component mount

  // Handle URL parameters to restore view state on refresh
  useEffect(() => {
    const view = searchParams.get("view");
    const classroomId = searchParams.get("id");
    const classroomName = searchParams.get("name");

    if (view === "detail" && classroomId && classroomName) {
      // Restore classroom detail view
      setCurrentClassroomDetail({
        classroomId: decodeURIComponent(classroomId),
        nameOfRoom: decodeURIComponent(classroomName),
      });
      setShowClassroomDetail(true);
      setShowMeetingView(false);
    } else if (view === "meetings" && classroomId && classroomName) {
      // Restore meeting view - need to load meetings
      const restoreMeetingView = async () => {
        try {
          setIsMeetingLoading(true);
          const requestData = {
            classroomId: decodeURIComponent(classroomId),
          };
          const response = await Api({
            endpoint: "meeting/get-meeting",
            method: METHOD_TYPE.GET,
            data: requestData,
            requireToken: true,
          });

          if (response.success && response.data) {
            const allMeetingsData = response.data.items || [];
            setMeetingList(allMeetingsData);
            setTotalMeetings(allMeetingsData.length);
            setCurrentMeetingPage(1);
            setCurrentClassroomForMeetings({
              classroomId: decodeURIComponent(classroomId),
              classroomName: decodeURIComponent(classroomName),
              nameOfRoom: decodeURIComponent(classroomName),
            });
            setShowMeetingView(true);
            setShowClassroomDetail(false);
          }
        } catch (error) {
          console.error("Error restoring meeting view:", error);
          // If error, fallback to main view
          setSearchParams({});
        } finally {
          setIsMeetingLoading(false);
        }
      };

      restoreMeetingView();
    } else {
      // Default view - classroom list
      setShowClassroomDetail(false);
      setShowMeetingView(false);
    }
  }, [searchParams, setSearchParams]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(totalClassrooms / itemsPerPage)) {
      setCurrentPage(newPage);

      // Apply client-side filtering and pagination using allClassrooms data
      if (allClassrooms.length > 0) {
        const result = getFilteredItems(
          allClassrooms,
          activeClassroomTab,
          newPage,
          itemsPerPage
        );
        setClassrooms(result.items);

        console.log(
          `📄 Page ${newPage}: Showing ${result.items.length} of ${result.total} filtered classrooms`
        );
      } else {
        // Fallback to server fetch if no data
        fetchStudentClassrooms(newPage);
      }
    }
  };
  const handleEvaluateClass = (classroomId, classroomName) => {
    setSelectedClassroomForEvaluation({
      classroomId,
      classroomName,
    });
    setShowEvaluationModal(true);
  };

  const handleEvaluationSubmit = async (evaluationData) => {
    try {
      const response = await Api({
        endpoint: "classroom-evaluation",
        method: METHOD_TYPE.POST,
        data: {
          classroomId: selectedClassroomForEvaluation.classroomId,
          ...evaluationData,
        },
        requireToken: true,
      });

      if (response.success) {
        toast.success("Đánh giá lớp học thành công!");
        setShowEvaluationModal(false);
        setSelectedClassroomForEvaluation(null);
        // Refresh the classroom list to update evaluation status
        fetchStudentClassrooms(currentPage);
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi đánh giá lớp học.");
      }
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi đánh giá lớp học."
      );
    }
  };
  const handleCloseEvaluationModal = () => {
    setShowEvaluationModal(false);
    setSelectedClassroomForEvaluation(null);
  };

  // Handler for viewing meetings with external Zoom links
  const handleViewMeetings = async (classroomId, classroomName, page = 1) => {
    try {
      setIsMeetingLoading(true);

      // Build request data
      const requestData = {
        classroomId: classroomId,
      };

      // Updated to use new endpoint meeting/get-meeting
      console.log(
        `🔍 Fetching all meetings for classroom ${classroomId} using new endpoint`
      );
      console.log(`📊 Active meeting tab: ${activeMeetingTab}`);
      const response = await Api({
        endpoint: `meeting/get-meeting`,
        method: METHOD_TYPE.GET,
        data: requestData,
        requireToken: true,
      });

      if (response.success && response.data) {
        setMeetingList(response.data.items || []);
        setTotalMeetings(response.data.total || 0);
        setCurrentMeetingPage(page);
        setCurrentClassroomForMeetings({
          classroomId,
          nameOfRoom: classroomName,
        });
        setShowMeetingView(true);
        setShowClassroomDetail(false); // Hide detail view when showing meetings
      } else {
        toast.info("Chưa có phòng học nào được tạo cho lớp này.");
        setMeetingList([]);
        setTotalMeetings(0);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
      toast.error("Không thể tải danh sách phòng học.");
      setMeetingList([]);
      setTotalMeetings(0);
    } finally {
      setIsMeetingLoading(false);
    }
  };

  // Function to go back from meeting view to classroom detail
  const handleBackToClassroomDetail = () => {
    setShowMeetingView(false);
    setCurrentClassroomForMeetings(null);
    setMeetingList([]);
    setShowClassroomDetail(true); // Show detail view again
  };

  // Function to go back from detail view to classroom list
  const handleBackToClassrooms = () => {
    setShowClassroomDetail(false);
    setCurrentClassroomDetail(null);
    setShowMeetingView(false);
    setCurrentClassroomForMeetings(null);
    setMeetingList([]);
  };

  // Function to show classroom detail from action button
  const handleShowClassroomDetail = (classroom) => {
    setCurrentClassroomDetail(classroom);
    setShowClassroomDetail(true);
  };

  // Function to go to meeting view from detail view
  const handleGoToMeetingView = async (classroomId, classroomName) => {
    await handleViewMeetings(classroomId, classroomName);
  };

  // Meeting pagination handlers
  const handleMeetingPageChange = async (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= Math.ceil(totalMeetings / meetingsPerPage) &&
      currentClassroomForMeetings
    ) {
      await handleViewMeetings(
        currentClassroomForMeetings.classroomId,
        currentClassroomForMeetings.nameOfRoom,
        newPage
      );
    }
  }; // Function to reset meeting pagination when switching tabs
  const handleMeetingTabChange = async (newTab) => {
    setActiveMeetingTab(newTab);
    setCurrentMeetingPage(1); // Reset to first page when switching tabs

    // No need to re-fetch data since we're using client-side filtering only
    // The render logic will automatically filter the existing meetingList array
    console.log(
      `🎯 Student meeting tab switch: ${activeMeetingTab} -> ${newTab} (client-side filtering only)`
    );
    console.log("📊 Current meetings to be filtered:", meetingList.length);

    // Only fetch new data if we don't have any meetings yet
    if (meetingList.length === 0 && currentClassroomForMeetings) {
      console.log("📥 No meetings in state, fetching from server...");
      await handleViewMeetings(
        currentClassroomForMeetings.classroomId,
        currentClassroomForMeetings.nameOfRoom,
        1
      );
    }
  };

  // Modal component for displaying meeting list
  const MeetingListModal = ({ isOpen, onClose, meetings, classroomName }) => {
    if (!isOpen) return null;

    const handleJoinMeeting = (meeting) => {
      // Open Zoom meeting in new tab instead of embedded view
      const zoomUrl = meeting.joinUrl || meeting.join_url;
      if (zoomUrl) {
        window.open(zoomUrl, "_blank");
        toast.success("Đang mở phòng học Zoom...");
      } else {
        toast.error("Không tìm thấy link tham gia phòng học.");
      }
      onClose(); // Close the modal
    };

    return (
      <div className="scp-modal-overlay" onClick={onClose}>
        <div
          className="scp-modal-content scp-meeting-list-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="scp-modal-header">
            <h3>Danh sách phòng học - {classroomName}</h3>
            <button className="scp-modal-close" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="scp-meeting-list">
            {meetings && meetings.length > 0 ? (
              meetings.map((meeting, index) => (
                <div key={meeting.id || index} className="scp-meeting-item">
                  <div className="scp-meeting-info">
                    <h4 className="scp-meeting-topic">{meeting.topic}</h4>
                    <div className="scp-meeting-details">
                      <p>
                        <strong>Meeting ID:</strong>{" "}
                        {meeting.zoomMeetingId || meeting.id}
                      </p>
                      <p>
                        <strong>Mật khẩu:</strong>{" "}
                        {meeting.password || "Không có"}
                      </p>
                      <p>
                        <strong>Thời gian tạo:</strong>{" "}
                        {new Date(
                          meeting.createdAt || meeting.created_at
                        ).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  <div className="scp-meeting-actions">
                    <button
                      className="scp-btn scp-btn-join"
                      onClick={() => handleJoinMeeting(meeting)}
                    >
                      <i
                        className="fas fa-external-link-alt"
                        style={{ marginRight: "8px" }}
                      ></i>
                      Tham gia phòng học
                    </button>
                    <button
                      className="scp-btn scp-btn-copy"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          meeting.joinUrl || meeting.join_url
                        );
                        toast.success("Đã sao chép link tham gia!");
                      }}
                      title="Sao chép link"
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="scp-no-meetings">
                <i className="fas fa-video-slash"></i>
                <p>Chưa có phòng học nào được tạo cho lớp này.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // PropTypes for MeetingListModal
  MeetingListModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    meetings: PropTypes.array,
    classroomName: PropTypes.string.isRequired,
  };
  if (!currentUser?.userId) {
    return (
      <div className="student-classroom-page">
        <h2 className="scp-page-title">Lớp học của tôi</h2>
        <p>Vui lòng đăng nhập để xem thông tin lớp học.</p>
      </div>
    );
  }

  // Classroom Detail View Component
  const ClassroomDetailView = () => {
    if (!showClassroomDetail || !currentClassroomDetail) return null;

    const classroom = currentClassroomDetail;
    const schedule = parseDateTimeLearn(classroom.dateTimeLearn);
    const progress = calculateClassProgress(
      classroom.startDay,
      classroom.endDay
    );

    return (
      <div className="student-classroom-page">
        <div className="scp-detail-header">
          <button className="scp-back-btn" onClick={handleBackToClassrooms}>
            <i className="fas fa-arrow-left" style={{ marginRight: "8px" }}></i>
            Quay lại danh sách lớp học
          </button>
          <h3 className="scp-detail-title">
            Chi tiết lớp học - {classroom.nameOfRoom}
          </h3>
        </div>

        <div className="scp-detail-content">
          <div className="scp-detail-section">
            <h4 className="scp-detail-section-title">
              <i className="fas fa-chalkboard-teacher"></i>
              Thông tin gia sư
            </h4>

            <div className="scp-tutor-detail-info">
              <img
                src={classroom.tutor?.avatar || dfMale}
                alt={classroom.tutor?.fullname || "Gia sư"}
                className="scp-detail-avatar"
              />
              <div className="scp-tutor-info-grid">
                <div className="scp-info-item">
                  <i className="fas fa-user"></i>
                  <span>
                    <strong>Tên:</strong> {classroom.tutor?.fullname || "N/A"}
                  </span>
                </div>
                <div className="scp-info-item">
                  <i className="fas fa-university"></i>
                  <span>
                    <strong>Trường:</strong>{" "}
                    {classroom.tutor?.univercity || "N/A"}
                  </span>
                </div>
                <div className="scp-info-item">
                  <i className="fas fa-graduation-cap"></i>
                  <span>
                    <strong>Chuyên ngành:</strong>{" "}
                    {classroom.tutor?.major?.majorName || "N/A"}
                  </span>
                </div>
                <div className="scp-info-item">
                  <i className="fas fa-book"></i>
                  <span>
                    <strong>Môn dạy:</strong>{" "}
                    {classroom.tutor?.subject?.subjectName || "N/A"}
                  </span>
                </div>
                <div className="scp-info-item">
                  <i className="fas fa-medal"></i>
                  <span>
                    <strong>Trình độ:</strong>{" "}
                    {classroom.tutor?.tutorLevel?.levelName || "N/A"}
                  </span>
                </div>
                <div className="scp-info-item">
                  <i className="fas fa-coins"></i>
                  <span className="highlight">
                    <strong>Học phí:</strong>{" "}
                    {classroom.tutor?.coinPerHours
                      ? `${classroom.tutor.coinPerHours.toLocaleString()} Xu/giờ`
                      : "Thỏa thuận"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <hr className="scp-divider" />
          <div className="scp-class-details">
            <div className="scp-class-info-grid">
              <div className="scp-info-group">
                <div className="scp-info-label">
                  <i className="fas fa-play-circle"></i>
                  Ngày bắt đầu:
                </div>
                <div className="scp-info-value">
                  {formatDate(classroom.startDay)}
                </div>
              </div>

              <div className="scp-info-group">
                <div className="scp-info-label">
                  <i className="fas fa-stop-circle"></i>
                  Ngày kết thúc:
                </div>
                <div className="scp-info-value">
                  {formatDate(classroom.endDay)}
                </div>
              </div>

              <div className="scp-info-group">
                <div className="scp-info-label">
                  <i className="fas fa-info-circle"></i>
                  Trạng thái:
                </div>
                <span
                  className={`scp-status-badge scp-status-${classroom.status?.toLowerCase()}`}
                >
                  <i
                    className={`fas ${
                      classroom.status === "IN_SESSION"
                        ? "fa-play-circle"
                        : classroom.status === "PENDING"
                        ? "fa-clock"
                        : "fa-check-circle"
                    }`}
                  ></i>
                  {statusLabels[classroom.status] || classroom.status}
                </span>
              </div>

              <div className="scp-info-group">
                <div className="scp-info-label">
                  <i className="fas fa-star"></i>
                  Đánh giá lớp học:
                </div>
                <div className="scp-info-value highlight">
                  {classroom.classroomEvaluation
                    ? `${classroom.classroomEvaluation}/5.0 ⭐`
                    : "Chưa có đánh giá"}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {classroom.status === "IN_SESSION" && (
              <div className="scp-progress-section">
                <div className="scp-progress-header">
                  <span className="scp-progress-label">
                    <i className="fas fa-chart-line"></i>
                    Tiến độ lớp học
                  </span>
                  <span className="scp-progress-percentage highlight">
                    {progress.percentage}%
                  </span>
                </div>
                <div className="scp-progress-bar-container">
                  <div
                    className="scp-progress-bar-fill"
                    style={{ width: `${progress.percentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Schedule */}
            <div className="scp-schedule-section">
              <h5>
                <i className="fas fa-calendar-alt"></i>
                Lịch học
              </h5>
              {schedule.length > 0 ? (
                <ul className="scp-schedule-list">
                  {schedule.map((s, index) => (
                    <li key={index} className="scp-schedule-item">
                      <i className="fas fa-clock"></i>
                      <span>
                        <strong>{s.day}:</strong> {s.times}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="scp-no-schedule">Chưa có lịch học.</p>
              )}
            </div>
          </div>{" "}
          {/* Action Buttons */}
          <div className="scp-detail-actions">
            <button
              className="scp-detail-btn scp-detail-btn-meetings"
              onClick={() =>
                handleGoToMeetingView(
                  classroom.classroomId,
                  classroom.nameOfRoom
                )
              }
            >
              <i className="fas fa-video"></i>
              Xem danh sách phòng học
            </button>

            {classroom.status === "COMPLETED" &&
              !classroom.classroomEvaluation && (
                <button
                  className="scp-detail-btn scp-detail-btn-evaluation"
                  onClick={() =>
                    handleEvaluateClass(
                      classroom.classroomId,
                      classroom.nameOfRoom
                    )
                  }
                >
                  <i className="fas fa-star"></i>
                  Đánh giá lớp học
                </button>
              )}
          </div>
        </div>
      </div>
    );
  }; // Meeting View Component (similar to TutorClassroomPage)
  const MeetingView = () => {
    if (!showMeetingView || !currentClassroomForMeetings) return null;

    // Apply client-side filtering for meetings (consistent with classroom filtering approach)
    const filteredMeetings = meetingList.filter((meeting) => {
      if (!meeting || !meeting.status) {
        console.warn("⚠️ Meeting missing status:", meeting);
        return false;
      }

      if (activeMeetingTab === "IN_SESSION") {
        return (
          meeting.status === "IN_SESSION" ||
          meeting.status === "STARTED" ||
          meeting.status === "PENDING" ||
          !meeting.status
        ); // Include meetings without status as active
      } else if (activeMeetingTab === "ENDED") {
        return (
          meeting.status === "COMPLETED" ||
          meeting.status === "ENDED" ||
          meeting.status === "FINISHED"
        );
      }
      return true;
    });

    console.log(
      `📊 Student meeting filtering: ${meetingList.length} total → ${filteredMeetings.length} filtered (tab: ${activeMeetingTab})`
    );

    const handleJoinMeeting = (meeting) => {
      const zoomUrl = meeting.joinUrl || meeting.join_url;
      if (zoomUrl) {
        window.open(zoomUrl, "_blank");
        toast.success("Đang mở phòng học Zoom...");
      } else {
        toast.error("Không tìm thấy link tham gia phòng học.");
      }
    };
    return (
      <div className="student-classroom-page">
        <div className="scp-meeting-view">
          <div className="scp-meeting-header">
            <div className="scp-meeting-title">
              <i className="fas fa-video"></i>
              Phòng học - {currentClassroomForMeetings.nameOfRoom}
            </div>{" "}
            <button
              className="scp-back-btn-meeting"
              onClick={handleBackToClassroomDetail}
            >
              <i className="fas fa-arrow-left"></i>
              Quay lại chi tiết lớp học
            </button>
          </div>
          {/* Meeting Tabs */}
          <div className="scp-meeting-tabs-container">
            <div className="scp-meeting-tabs">
              {" "}
              <button
                className={`scp-tab ${
                  activeMeetingTab === "IN_SESSION" ? "active" : ""
                }`}
                onClick={() => handleMeetingTabChange("IN_SESSION")}
              >
                <i className="fas fa-video"></i>
                Phòng học đang hoạt động
                <span className="scp-tab-count">
                  (
                  {
                    meetingList.filter(
                      (meeting) =>
                        meeting.status === "IN_SESSION" ||
                        meeting.status === "STARTED" ||
                        meeting.status === "PENDING" ||
                        !meeting.status
                    ).length
                  }
                  )
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
                  (
                  {
                    meetingList.filter(
                      (meeting) =>
                        meeting.status === "COMPLETED" ||
                        meeting.status === "ENDED" ||
                        meeting.status === "FINISHED"
                    ).length
                  }
                  )
                </span>
              </button>
            </div>
          </div>{" "}
          <div className="scp-meeting-content">
            {isMeetingLoading ? (
              <div className="scp-loading">
                <div className="scp-loading-spinner"></div>
                <p className="scp-loading-text">
                  Đang tải danh sách phòng học...
                </p>
              </div>
            ) : filteredMeetings.length === 0 ? (
              <div className="scp-empty-state">
                <i className="fas fa-video-slash"></i>
                <p>Không có phòng học nào trong trạng thái này.</p>
              </div>
            ) : (
              <>
                <ul className="scp-meeting-list">
                  {" "}
                  {filteredMeetings.map((meeting, index) => {
                    // Check if meeting has ended
                    const isEnded =
                      meeting.status === "COMPLETED" ||
                      meeting.status === "ENDED" ||
                      meeting.status === "FINISHED" ||
                      (meeting.endTime &&
                        new Date(meeting.endTime) < new Date());

                    return (
                      <li key={index} className="scp-meeting-item">
                        <div className="scp-meeting-info">
                          <p>
                            <i className="fas fa-clock"></i>
                            <strong>Thời gian bắt đầu:</strong>{" "}
                            {formatDate(meeting.startTime)}
                          </p>
                          <p>
                            <i className="fas fa-history"></i>
                            <strong>Thời gian kết thúc:</strong>{" "}
                            {meeting.endTime
                              ? formatDate(meeting.endTime)
                              : "Chưa xác định"}
                          </p>
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
                              {isEnded ? "Đã kết thúc" : "Đang hoạt động"}
                            </span>
                          </p>
                        </div>
                        {!isEnded ? (
                          <button
                            className="scp-action-btn scp-join-meeting-btn"
                            onClick={() => handleJoinMeeting(meeting)}
                          >
                            <i className="fas fa-sign-in-alt"></i>
                            Tham gia
                          </button>
                        ) : (
                          <div className="scp-meeting-ended">
                            <span className="scp-ended-label">
                              <i className="fas fa-check-circle"></i>
                              Phiên đã kết thúc
                            </span>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {/* Meeting Pagination */}
                {totalMeetings > meetingsPerPage && (
                  <div className="scp-pagination">
                    <button
                      className="scp-pagination-btn"
                      disabled={currentMeetingPage === 1}
                      onClick={() =>
                        handleMeetingPageChange(currentMeetingPage - 1)
                      }
                    >
                      <i className="fas fa-chevron-left"></i> Trước
                    </button>
                    <span className="scp-pagination-info">
                      Trang {currentMeetingPage} /{" "}
                      {Math.ceil(totalMeetings / meetingsPerPage)}
                    </span>
                    <button
                      className="scp-pagination-btn"
                      disabled={
                        currentMeetingPage >=
                        Math.ceil(totalMeetings / meetingsPerPage)
                      }
                      onClick={() =>
                        handleMeetingPageChange(currentMeetingPage + 1)
                      }
                    >
                      Sau <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    ); // Handler for classroom tab changes (client-side filtering only)
  };
  const handleClassroomTabChange = (newTab) => {
    console.log(`🔄 Student tab change: ${activeClassroomTab} -> ${newTab}`);
    setActiveClassroomTab(newTab);
    setCurrentPage(1); // Reset to first page when changing tabs

    // Apply client-side filtering using allClassrooms data
    if (allClassrooms.length > 0) {
      const result = getFilteredItems(allClassrooms, newTab, 1, itemsPerPage);

      setClassrooms(result.items);
      setTotalClassrooms(result.total); // Set total for current filter

      console.log(`📊 Filtered classrooms for tab ${newTab}:`, result.total);
      console.log(
        `� Page 1: Showing ${result.items.length} of ${result.total} filtered classrooms`
      );
    } else {
      // No data in allClassrooms, need to fetch
      console.log("📥 No classrooms in allClassrooms, fetching from server...");
      fetchStudentClassrooms(1);
    }
  };

  // If showing classroom detail view
  if (showClassroomDetail) {
    return <ClassroomDetailView />;
  }

  // If showing meeting view
  if (showMeetingView) {
    return <MeetingView />;
  }
  return (
    <div className="student-classroom-page">
      <h2 className="scp-page-title">Lớp học của tôi ({totalClassrooms})</h2>
      {/* Classroom Tabs */}
      <div className="scp-classroom-tabs-container">
        <div className="scp-classroom-tabs">
          <button
            className={`scp-tab ${
              activeClassroomTab === "IN_SESSION" ? "active" : ""
            }`}
            onClick={() => handleClassroomTabChange("IN_SESSION")}
          >
            {" "}
            <i className="fas fa-play-circle"></i>
            Lớp học đang hoạt động{" "}
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
            Lớp học đã kết thúc{" "}
            <span className="scp-tab-count">
              ({getCountByStatus(allClassrooms, "ENDED")})
            </span>
          </button>
        </div>
      </div>
      {isLoading && (
        <div className="scp-loading">
          <div className="scp-loading-spinner"></div>
          <p className="scp-loading-text">Đang tải danh sách lớp học...</p>
        </div>
      )}
      {error && <p className="scp-error-message">{error}</p>}{" "}
      {!isLoading && !error && classrooms.length === 0 && (
        <div className="scp-empty-state">
          <p>Bạn hiện không có lớp học nào.</p>
          <button
            className="scp-find-tutor-btn"
            onClick={() => navigate("/tim-gia-su")}
          >
            Tìm gia sư ngay
          </button>
        </div>
      )}
      {!isLoading && !error && classrooms.length > 0 && (
        <div className="scp-classroom-list">
          {" "}
          {(() => {
            // Use client-side filtering since server-side filtering is disabled
            let filteredClassrooms; // Apply client-side filtering based on active tab
            filteredClassrooms = classrooms.filter((classroom) => {
              // Add defensive checks for data integrity
              if (!classroom || !classroom.status) {
                console.warn("⚠️ Classroom missing status:", classroom);
                return false;
              }

              if (activeClassroomTab === "IN_SESSION") {
                return (
                  classroom.status === "IN_SESSION" ||
                  classroom.status === "PENDING"
                );
              } else if (activeClassroomTab === "ENDED") {
                return (
                  classroom.status === "COMPLETED" ||
                  classroom.status === "CANCELLED"
                );
              }
              return true; // Show all for other tabs
            });
            console.log(
              "📊 Rendering student classrooms:",
              filteredClassrooms.length,
              "of",
              classrooms.length,
              "total"
            );
            console.log("Current tab:", activeClassroomTab);
            console.log(
              "✅ Using client-side filtering (server-side disabled)"
            );
            console.log(
              "Classroom statuses:",
              filteredClassrooms.map((c) => ({
                id: c.classroomId,
                name: c.nameOfRoom,
                status: c.status,
              }))
            );

            if (filteredClassrooms.length === 0) {
              return (
                <div className="scp-empty-state">
                  <i
                    className={`fas ${
                      activeClassroomTab === "IN_SESSION"
                        ? "fa-play-circle"
                        : "fa-check-circle"
                    }`}
                  ></i>
                  <p>
                    {activeClassroomTab === "IN_SESSION"
                      ? "Hiện tại không có lớp học nào đang hoạt động."
                      : "Chưa có lớp học nào đã kết thúc."}
                  </p>
                  {activeClassroomTab === "IN_SESSION" && (
                    <button
                      className="scp-find-tutor-btn"
                      onClick={() => navigate("/tim-gia-su")}
                    >
                      Tìm gia sư ngay
                    </button>
                  )}
                </div>
              );
            }

            return filteredClassrooms.map((classroom) => {
              const schedule = parseDateTimeLearn(classroom.dateTimeLearn);
              const classroomName = classroom.nameOfRoom || "Lớp học không tên";
              const statusLabel =
                statusLabels[classroom.status] || classroom.status || "N/A";
              const progress = calculateClassProgress(
                classroom.startDay,
                classroom.endDay
              );

              return (
                <div key={classroom.classroomId} className="scp-classroom-card">
                  <div className="scp-card-header">
                    <div className="scp-card-title-section">
                      <i className="fas fa-chalkboard-teacher"></i>
                      <h3 className="scp-classroom-name">{classroomName}</h3>
                    </div>
                    <span
                      className={`scp-status-badge scp-status-${classroom.status?.toLowerCase()}`}
                    >
                      <i className="fas fa-circle"></i>
                      {statusLabel}
                    </span>
                  </div>

                  <div className="scp-tutor-section">
                    <div className="scp-tutor-avatar-container">
                      <img
                        src={classroom.tutor?.avatar || dfMale}
                        alt={classroom.tutor?.fullname || "Gia sư"}
                        className="scp-tutor-avatar"
                        onError={(e) => {
                          if (e.target.src !== dfMale) {
                            e.target.onerror = null;
                            e.target.src = dfMale;
                          }
                        }}
                      />
                      <div className="scp-avatar-overlay">
                        <i className="fas fa-graduation-cap"></i>
                      </div>
                    </div>
                    <div className="scp-tutor-details">
                      <div className="scp-tutor-name">
                        <i className="fas fa-user-tie"></i>
                        {classroom.tutor?.fullname || "N/A"}
                      </div>
                      <div className="scp-tutor-info-grid">
                        <div className="scp-info-item">
                          <i className="fas fa-university"></i>
                          <span>Trường: </span>
                          <span className="highlight">
                            {classroom.tutor?.univercity || "N/A"}
                          </span>
                        </div>
                        <div className="scp-info-item">
                          <i className="fas fa-book"></i>
                          <span>Chuyên ngành: </span>
                          <span className="highlight">
                            {classroom.tutor?.major?.majorName || "N/A"}
                          </span>
                        </div>
                        <div className="scp-info-item">
                          <i className="fas fa-chalkboard"></i>
                          <span>Môn dạy: </span>
                          <span className="highlight">
                            {classroom.tutor?.subject?.subjectName || "N/A"}
                          </span>
                        </div>
                        <div className="scp-info-item">
                          <i className="fas fa-medal"></i>
                          <span>Trình độ: </span>
                          <span className="highlight">
                            {classroom.tutor?.tutorLevel?.levelName || "N/A"}
                          </span>
                        </div>
                        <div className="scp-info-item">
                          <i className="fas fa-coins"></i>
                          <span>Học phí: </span>
                          <span className="highlight">
                            {classroom.tutor?.coinPerHours
                              ? `${classroom.tutor.coinPerHours.toLocaleString(
                                  "vi-VN"
                                )} Xu/giờ`
                              : "Thỏa thuận"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

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

                    {/* Enhanced Progress Bar */}
                    {classroom.status === "IN_SESSION" && (
                      <div className="scp-progress-section">
                        <div className="scp-progress-header">
                          <div className="scp-progress-label">
                            <i className="fas fa-chart-line"></i>
                            Tiến độ lớp học
                          </div>
                          <div className="scp-progress-percentage">
                            {progress.percentage}%
                          </div>
                        </div>
                        <div className="scp-progress-bar-container">
                          <div
                            className="scp-progress-bar-fill"
                            style={{ width: `${progress.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Enhanced Schedule Display */}
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

                  <div className="scp-card-footer">
                    <div className="scp-action-buttons">
                      <button
                        className="scp-action-btn scp-view-detail-btn"
                        onClick={() => handleShowClassroomDetail(classroom)}
                      >
                        <i className="fas fa-eye"></i>
                        Xem chi tiết
                      </button>

                      <button
                        className="scp-action-btn scp-view-meetings-btn"
                        onClick={() =>
                          handleViewMeetings(
                            classroom.classroomId,
                            classroomName
                          )
                        }
                      >
                        <i className="fas fa-video"></i>
                        Danh sách phòng học
                      </button>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}
      {!isLoading && totalClassrooms > itemsPerPage && (
        <div className="scp-pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="scp-pagination-btn"
          >
            <i className="fas fa-chevron-left"></i>
            Trước
          </button>
          <span className="scp-pagination-info">
            Trang {currentPage} của {Math.ceil(totalClassrooms / itemsPerPage)}
            <span className="scp-total-items">({totalClassrooms} lớp học)</span>
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === Math.ceil(totalClassrooms / itemsPerPage)}
            className="scp-pagination-btn"
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
          classroomName={selectedClassroomForEvaluation.classroomName}
          onSubmit={handleEvaluationSubmit}
          onClose={handleCloseEvaluationModal}
        />
      )}
      {/* Debug Components - only for development */}
      {/* <QuickDebug /> */}
      {/* <ClassroomAPITest /> */}
      {/* <CreateMeetingTest /> */}
    </div>
  );
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

const getFilteredItems = (items, status, page, itemsPerPage) => {
  // Filter theo status
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

  // Apply pagination
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return {
    items: filtered.slice(startIndex, endIndex),
    total: filtered.length,
  };
};

export default memo(StudentClassroomPage);
