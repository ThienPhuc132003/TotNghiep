import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "../../assets/css/TutorClassroomPage.style.css";
import dfMale from "../../assets/images/df-male.png";

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

// Modal component for creating Zoom meeting
const CreateMeetingModal = ({
  isOpen,
  onClose,
  onSubmit,
  classroomName,
  defaultTopic,
}) => {
  const [formData, setFormData] = useState({
    topic: defaultTopic || `Lớp học: ${classroomName}`,
    password: Math.random().toString(36).substring(2, 8),
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        topic: defaultTopic || `Lớp học: ${classroomName}`,
        password: Math.random().toString(36).substring(2, 8),
      });
    }
  }, [isOpen, classroomName, defaultTopic]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.topic.trim()) {
      toast.error("Vui lòng nhập chủ đề phòng họp!");
      return;
    }
    if (!formData.password.trim()) {
      toast.error("Vui lòng nhập mật khẩu phòng họp!");
      return;
    }
    onSubmit(formData);
  };

  const generateRandomPassword = () => {
    const newPassword = Math.random().toString(36).substring(2, 8);
    setFormData((prev) => ({
      ...prev,
      password: newPassword,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="tcp-modal-overlay" onClick={onClose}>
      <div className="tcp-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tcp-modal-header">
          <h3>Tạo phòng học Zoom</h3>
          <button className="tcp-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="tcp-meeting-form">
          <div className="tcp-form-group">
            <label htmlFor="topic">Chủ đề phòng học:</label>
            <input
              type="text"
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleInputChange}
              placeholder="Nhập chủ đề phòng học..."
              maxLength={200}
              required
            />
          </div>
          <div className="tcp-form-group">
            <label htmlFor="password">Mật khẩu phòng học:</label>
            <div className="tcp-password-input-group">
              <input
                type="text"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu..."
                maxLength={10}
                required
              />
              <button
                type="button"
                className="tcp-generate-password-btn"
                onClick={generateRandomPassword}
                title="Tạo mật khẩu ngẫu nhiên"
              >
                <i className="fas fa-random"></i>
              </button>
            </div>
            <small className="tcp-form-note">
              Mật khẩu từ 1-10 ký tự, có thể bao gồm chữ cái và số
            </small>
          </div>
          <div className="tcp-form-actions">
            <button
              type="button"
              className="tcp-btn tcp-btn-cancel"
              onClick={onClose}
            >
              Hủy
            </button>
            <button type="submit" className="tcp-btn tcp-btn-primary">
              <i className="fas fa-video" style={{ marginRight: "8px" }}></i>
              Tạo phòng học
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// PropTypes for CreateMeetingModal
CreateMeetingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  classroomName: PropTypes.string.isRequired,
  defaultTopic: PropTypes.string,
};

const TutorClassroomPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalClassrooms, setTotalClassrooms] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  // Store all classrooms for accurate filtering and pagination
  const [allClassrooms, setAllClassrooms] = useState([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);

  // Meeting states
  const [meetingList, setMeetingList] = useState([]);
  const [allMeetings, setAllMeetings] = useState([]);
  const [totalMeetings, setTotalMeetings] = useState(0);
  const [currentMeetingPage, setCurrentMeetingPage] = useState(1);
  const [isMeetingLoading, setIsMeetingLoading] = useState(false);
  const meetingsPerPage = 2;

  // View states
  const [showMeetingView, setShowMeetingView] = useState(false);
  const [currentClassroomForMeetings, setCurrentClassroomForMeetings] =
    useState(null);
  const [activeMeetingTab, setActiveMeetingTab] = useState("IN_SESSION");
  const [activeClassroomTab, setActiveClassroomTab] = useState("IN_SESSION");

  const currentUser = useSelector((state) => state.user.userProfile);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchTutorClassrooms = useCallback(
    async (page = 1) => {
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
          "🔍 Fetching all tutor classrooms for client-side filtering and accurate pagination"
        );

        const response = await Api({
          endpoint: "classroom/search-for-tutor",
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
            `✅ Fetched ${allClassroomsData.length} total tutor classrooms from server`
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
      } catch (error) {
        console.error("❌ Error fetching classrooms:", error);
        setError(
          error.response?.data?.message ||
            "Có lỗi xảy ra khi tải danh sách lớp học. Vui lòng thử lại."
        );
        setClassrooms([]);
        setAllClassrooms([]);
        setTotalClassrooms(0);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser?.userId, activeClassroomTab, itemsPerPage]
  );

  useEffect(() => {
    console.log(`📱 Initial loading of tutor classrooms`);
    fetchTutorClassrooms(1);
  }, [fetchTutorClassrooms]);

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
        fetchTutorClassrooms(newPage);
      }
    }
  };

  const handleClassroomTabChange = (newTab) => {
    console.log(`🔄 Tutor tab change: ${activeClassroomTab} -> ${newTab}`);
    setActiveClassroomTab(newTab);
    setCurrentPage(1); // Reset to first page when changing tabs

    // Apply client-side filtering using allClassrooms data
    if (allClassrooms.length > 0) {
      const result = getFilteredItems(allClassrooms, newTab, 1, itemsPerPage);

      setClassrooms(result.items);
      setTotalClassrooms(result.total); // Set total for current filter

      console.log(`📊 Filtered classrooms for tab ${newTab}:`, result.total);
      console.log(
        `📄 Page 1: Showing ${result.items.length} of ${result.total} filtered classrooms`
      );
    } else {
      // No data in allClassrooms, need to fetch
      console.log("📥 No classrooms in allClassrooms, fetching from server...");
      fetchTutorClassrooms(1);
    }
  };

  const handleEnterClassroom = async (classroomId, classroomName) => {
    try {
      setIsMeetingLoading(true);
      const loadingToastId = toast.loading("Đang tải danh sách phòng học...");

      const queryParams = {
        classroomId: classroomId,
        page: 1,
        rpp: 1000, // Get all meetings
        sort: JSON.stringify([{ key: "startTime", type: "DESC" }]),
      };

      const response = await Api({
        endpoint: "meeting/search",
        method: METHOD_TYPE.GET,
        query: queryParams,
        requireToken: false,
      });

      toast.dismiss(loadingToastId);

      if (response.success && response.data) {
        const allMeetingsData = response.data.items || [];
        setAllMeetings(allMeetingsData);

        // Apply client-side filtering based on active tab
        const result = getFilteredItems(
          allMeetingsData,
          activeMeetingTab,
          1,
          meetingsPerPage
        );

        setMeetingList(result.items);
        setTotalMeetings(result.total);
        setCurrentMeetingPage(1);
        setCurrentClassroomForMeetings({
          classroomId,
          classroomName,
          nameOfRoom: classroomName,
        });
        setShowMeetingView(true);

        toast.success("Đã tải danh sách phòng học!");
      } else {
        toast.error(
          "Không tìm thấy phòng học nào. Vui lòng tạo phòng học trước."
        );
        setMeetingList([]);
        setAllMeetings([]);
        setTotalMeetings(0);
      }
    } catch (error) {
      console.error("Error fetching meeting data:", error);
      toast.error(
        "Có lỗi xảy ra khi tải danh sách phòng học. Vui lòng thử lại."
      );
      setMeetingList([]);
      setAllMeetings([]);
      setTotalMeetings(0);
    } finally {
      setIsMeetingLoading(false);
    }
  };

  const handleBackToClassrooms = () => {
    setShowMeetingView(false);
    setCurrentClassroomForMeetings(null);
    setMeetingList([]);
    setAllMeetings([]);
  };

  const handleOpenCreateMeetingModal = (classroomId, classroomName) => {
    const zoomToken = localStorage.getItem("zoomAccessToken");
    if (!zoomToken) {
      toast.error("Vui lòng kết nối với Zoom trước khi tạo phòng học!");
      navigate("/tai-khoan/ho-so/phong-hoc", {
        state: {
          needZoomConnection: true,
          classroomId,
          classroomName,
          fromClassroom: true,
        },
      });
      return;
    }

    setSelectedClassroom({ classroomId, classroomName });
    setIsModalOpen(true);
  };

  const handleCreateMeetingSubmit = async (formData) => {
    if (!selectedClassroom) return;

    const { classroomId } = selectedClassroom;

    try {
      const loadingToastId = toast.loading("Đang tạo phòng học...");

      const meetingData = {
        classroomId: classroomId,
        topic: formData.topic,
        password: formData.password,
      };

      const response = await Api({
        endpoint: "meeting/create",
        method: METHOD_TYPE.POST,
        body: meetingData,
        requireToken: false,
      });

      toast.dismiss(loadingToastId);

      if (response.success) {
        toast.success("Tạo phòng học thành công!");
        setIsModalOpen(false);
        setSelectedClassroom(null);
        // Refresh meeting list
        await handleEnterClassroom(
          classroomId,
          selectedClassroom.classroomName
        );
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi tạo phòng học!");
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast.error("Có lỗi xảy ra khi tạo phòng học. Vui lòng thử lại!");
    }
  };

  const handleMeetingTabChange = (newTab) => {
    setActiveMeetingTab(newTab);
    setCurrentMeetingPage(1);

    if (allMeetings.length > 0) {
      const result = getFilteredItems(allMeetings, newTab, 1, meetingsPerPage);
      setMeetingList(result.items);
      setTotalMeetings(result.total);
    }
  };

  const handleMeetingPageChange = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= Math.ceil(totalMeetings / meetingsPerPage) &&
      allMeetings.length > 0
    ) {
      const result = getFilteredItems(
        allMeetings,
        activeMeetingTab,
        newPage,
        meetingsPerPage
      );
      setMeetingList(result.items);
      setCurrentMeetingPage(newPage);
    }
  };

  // Early return check
  if (!currentUser?.userId) {
    return (
      <div className="tutor-classroom-page">
        <h2 className="tcp-page-title">Quản lý lớp học</h2>
        <p>Vui lòng đăng nhập để xem thông tin lớp học.</p>
      </div>
    );
  }

  // Meeting View Component
  if (showMeetingView && currentClassroomForMeetings) {
    return (
      <div className="tutor-classroom-page">
        <div className="tcp-back-section">
          <button className="tcp-back-btn" onClick={handleBackToClassrooms}>
            <i className="fas fa-arrow-left" style={{ marginRight: "8px" }}></i>
            Quay lại danh sách lớp học
          </button>
        </div>

        <div className="tcp-meeting-title-section">
          <h3 className="tcp-meeting-title">
            Danh sách phòng học - {currentClassroomForMeetings.nameOfRoom}
          </h3>
        </div>

        <div className="tcp-meeting-tabs-section">
          <div className="tcp-meeting-tabs-container">
            <div className="tcp-meeting-tabs">
              <button
                className={`tcp-tab ${
                  activeMeetingTab === "IN_SESSION" ? "active" : ""
                }`}
                onClick={() => handleMeetingTabChange("IN_SESSION")}
              >
                <i className="fas fa-video"></i> Đang diễn ra
                <span className="tcp-tab-count">
                  ({getCountByStatus(allMeetings, "IN_SESSION")})
                </span>
              </button>
              <button
                className={`tcp-tab ${
                  activeMeetingTab === "ENDED" ? "active" : ""
                }`}
                onClick={() => handleMeetingTabChange("ENDED")}
              >
                <i className="fas fa-history"></i>
                Lịch sử
                <span className="tcp-tab-count">
                  ({getCountByStatus(allMeetings, "ENDED")})
                </span>
              </button>
            </div>
            <button
              className="tcp-create-meeting-btn"
              onClick={() =>
                handleOpenCreateMeetingModal(
                  currentClassroomForMeetings.classroomId,
                  currentClassroomForMeetings.nameOfRoom
                )
              }
            >
              <i className="fas fa-plus"></i>
              Tạo phòng học
            </button>
          </div>
        </div>

        <div className="tcp-meeting-list-inline">
          {isMeetingLoading ? (
            <div className="tcp-meeting-loading">
              <div className="tcp-skeleton-container">
                {[...Array(meetingsPerPage)].map((_, index) => (
                  <div
                    key={index}
                    className="tcp-skeleton tcp-skeleton-meeting-card"
                  ></div>
                ))}
              </div>
            </div>
          ) : meetingList && meetingList.length > 0 ? (
            meetingList.map((meeting, index) => {
              const isEnded =
                meeting.status === "COMPLETED" ||
                meeting.status === "ENDED" ||
                meeting.status === "FINISHED" ||
                (meeting.endTime && new Date(meeting.endTime) < new Date());

              return (
                <div
                  key={meeting.id || index}
                  className="tcp-meeting-item-inline"
                >
                  <div className="tcp-meeting-info">
                    <h4 className="tcp-meeting-topic">{meeting.topic}</h4>
                    <div className="tcp-meeting-details">
                      <p>
                        <strong>Meeting ID:</strong>{" "}
                        {meeting.zoomMeetingId || meeting.id}
                      </p>
                      <p>
                        <strong>Mật khẩu:</strong>{" "}
                        {meeting.password || "Không có"}
                      </p>
                      <p>
                        <strong>Thời gian bắt đầu:</strong>{" "}
                        {meeting.startTime
                          ? new Date(meeting.startTime).toLocaleString("vi-VN")
                          : "Chưa xác định"}
                      </p>
                      <p>
                        <strong>Trạng thái:</strong>{" "}
                        <span
                          className={`tcp-status ${meeting.status?.toLowerCase()}`}
                        >
                          {meeting.status === "IN_SESSION"
                            ? "Đang diễn ra"
                            : isEnded
                            ? "Đã kết thúc"
                            : "Chờ bắt đầu"}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="tcp-meeting-actions">
                    {!isEnded && (
                      <>
                        <a
                          href={meeting.joinUrl || meeting.join_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tcp-btn tcp-btn-join"
                          title="Tham gia qua Zoom"
                        >
                          <i
                            className="fas fa-video"
                            style={{ marginRight: "8px" }}
                          ></i>
                          Tham gia Zoom
                        </a>
                        <button
                          className="tcp-btn tcp-btn-copy"
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
                      </>
                    )}
                    {isEnded && (
                      <div className="tcp-meeting-ended">
                        <span className="tcp-ended-label">
                          <i className="fas fa-check-circle"></i>
                          Phiên đã kết thúc
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="tcp-no-meetings-inline">
              <i
                className={`fas ${
                  activeMeetingTab === "IN_SESSION"
                    ? "fa-video-slash"
                    : "fa-clock"
                }`}
              ></i>
              <h4>
                {activeMeetingTab === "IN_SESSION"
                  ? "Không có phòng học đang diễn ra"
                  : "Chưa có lịch sử phòng học"}
              </h4>
              <p>
                {activeMeetingTab === "IN_SESSION"
                  ? "Hiện tại chưa có phòng học nào đang hoạt động. Hãy tạo phòng học mới để bắt đầu."
                  : "Chưa có phòng học nào đã kết thúc. Lịch sử các phòng học sẽ hiển thị ở đây."}
              </p>
            </div>
          )}
        </div>

        {/* Meeting Pagination */}
        {totalMeetings > meetingsPerPage && (
          <div className="tcp-meeting-pagination">
            <button
              onClick={() => handleMeetingPageChange(currentMeetingPage - 1)}
              disabled={currentMeetingPage === 1}
              className="tcp-pagination-btn"
            >
              <i className="fas fa-chevron-left"></i>
              Trước
            </button>
            <span className="tcp-pagination-info">
              Trang {currentMeetingPage} của{" "}
              {Math.ceil(totalMeetings / meetingsPerPage)}
            </span>
            <button
              onClick={() => handleMeetingPageChange(currentMeetingPage + 1)}
              disabled={
                currentMeetingPage ===
                Math.ceil(totalMeetings / meetingsPerPage)
              }
              className="tcp-pagination-btn"
            >
              Sau
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Main Classroom List View
  return (
    <div className="tutor-classroom-page">
      <h2 className="tcp-page-title">Quản lý lớp học ({totalClassrooms})</h2>

      {/* Classroom Tabs */}
      <div className="tcp-classroom-tabs-container">
        <div className="tcp-classroom-tabs">
          <button
            className={`tcp-tab ${
              activeClassroomTab === "IN_SESSION" ? "active" : ""
            }`}
            onClick={() => handleClassroomTabChange("IN_SESSION")}
          >
            <i className="fas fa-play-circle"></i>
            Lớp học đang hoạt động
            <span className="tcp-tab-count">
              ({getCountByStatus(allClassrooms, "IN_SESSION")})
            </span>
          </button>
          <button
            className={`tcp-tab ${
              activeClassroomTab === "ENDED" ? "active" : ""
            }`}
            onClick={() => handleClassroomTabChange("ENDED")}
          >
            <i className="fas fa-check-circle"></i>
            Lớp học đã kết thúc
            <span className="tcp-tab-count">
              ({getCountByStatus(allClassrooms, "ENDED")})
            </span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="tcp-skeleton-container">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="tcp-skeleton tcp-skeleton-card"></div>
          ))}
        </div>
      )}

      {error && <p className="tcp-error-message">{error}</p>}

      {!isLoading && !error && classrooms.length === 0 && (
        <div className="tcp-empty-state">
          <p>Bạn hiện không có lớp học nào.</p>
          <button
            className="tcp-find-student-btn"
            onClick={() => navigate("/gia-su")}
          >
            Quay về trang gia sư
          </button>
        </div>
      )}

      {!isLoading && !error && classrooms.length > 0 && (
        <div className="tcp-classroom-list">
          {classrooms.map((classroom, index) => (
            <div
              key={classroom.classroomId || index}
              className="tcp-classroom-card"
            >
              <div className="tcp-card-header">
                <h3 className="tcp-classroom-name">{classroom.nameOfRoom}</h3>
                <span
                  className={`tcp-status-badge tcp-status-${classroom.status?.toLowerCase()}`}
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

              <div className="tcp-card-content">
                <div className="tcp-student-info">
                  <img
                    src={getSafeAvatarUrl(classroom.user)}
                    alt={classroom.user?.fullname || "Học viên"}
                    className="tcp-student-avatar"
                    onError={handleAvatarError}
                  />
                  <div className="tcp-student-details">
                    <h4>{classroom.user?.fullname || "N/A"}</h4>
                    <p>{classroom.user?.personalEmail || "N/A"}</p>
                    <p>
                      <strong>Chuyên ngành:</strong>{" "}
                      {classroom.user?.major?.majorName || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="tcp-classroom-info">
                  <div className="tcp-info-item">
                    <i className="fas fa-calendar"></i>
                    <span>
                      <strong>Bắt đầu:</strong> {formatDate(classroom.startDay)}
                    </span>
                  </div>
                  <div className="tcp-info-item">
                    <i className="fas fa-calendar-check"></i>
                    <span>
                      <strong>Kết thúc:</strong> {formatDate(classroom.endDay)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="tcp-card-footer">
                <div className="tcp-action-buttons">
                  <button
                    className="tcp-action-btn tcp-view-meetings-btn"
                    onClick={() =>
                      handleEnterClassroom(
                        classroom.classroomId,
                        classroom.nameOfRoom
                      )
                    }
                    disabled={!classroom.classroomId}
                  >
                    <i className="fas fa-video"></i>
                    Xem phòng học
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && totalClassrooms > itemsPerPage && (
        <div className="tcp-pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="tcp-pagination-btn"
          >
            <i className="fas fa-chevron-left"></i>
            Trước
          </button>
          <span className="tcp-pagination-info">
            Trang {currentPage} của {Math.ceil(totalClassrooms / itemsPerPage)}
            <span className="tcp-total-items">({totalClassrooms} lớp học)</span>
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === Math.ceil(totalClassrooms / itemsPerPage)}
            className="tcp-pagination-btn"
          >
            Sau
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Create Meeting Modal */}
      {isModalOpen && selectedClassroom && (
        <CreateMeetingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateMeetingSubmit}
          classroomName={selectedClassroom.classroomName}
          defaultTopic={`Lớp học: ${selectedClassroom.classroomName}`}
        />
      )}
    </div>
  );
};

export default memo(TutorClassroomPage);
