import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "../../assets/css/TutorClassroomPage.style.css";

// Date formatting helper
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

// Helper functions for meeting filtering and pagination
const getCountByStatus = (items, status) => {
  if (status === "IN_SESSION") {
    return items.filter(
      (item) =>
        item.status === "IN_SESSION" ||
        item.status === "PENDING" ||
        item.status === "STARTED" ||
        item.status === "WAITING" ||
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
  let filtered = items;
  if (status === "IN_SESSION") {
    filtered = items.filter(
      (item) =>
        item.status === "IN_SESSION" ||
        item.status === "PENDING" ||
        item.status === "STARTED" ||
        item.status === "WAITING" ||
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

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return {
    items: filtered.slice(startIndex, endIndex),
    total: filtered.length,
  };
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

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="tcp-modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        zIndex: 999999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="tcp-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tcp-modal-header">
          <h3>Tạo phòng học trực tuyến</h3>
          <button className="tcp-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="tcp-modal-body">
          <form onSubmit={handleSubmit}>
            <div className="tcp-form-group">
              <label htmlFor="topic" className="tcp-form-label">
                Chủ đề phòng học:
              </label>
              <input
                type="text"
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                placeholder="Nhập chủ đề phòng học..."
                maxLength={200}
                className="tcp-form-input"
                required
              />
            </div>
            <div className="tcp-form-group">
              <label htmlFor="password" className="tcp-form-label">
                Mật khẩu phòng học:
              </label>
              <div className="tcp-password-group">
                <input
                  type="text"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu..."
                  maxLength={10}
                  className="tcp-form-input"
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
              <small className="tcp-form-help-text">
                Mật khẩu từ 1-10 ký tự, có thể bao gồm chữ cái và số
              </small>
            </div>
          </form>
        </div>
        <div className="tcp-modal-footer">
          <button
            type="button"
            className="tcp-btn tcp-btn-secondary"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            type="button"
            className="tcp-btn tcp-btn-primary"
            onClick={handleSubmit}
          >
            <i className="fas fa-video"></i>
            Tạo phòng học
          </button>
        </div>
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

const TutorClassroomMeetingsPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [allMeetings, setAllMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalMeetings, setTotalMeetings] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMeetingTab, setActiveMeetingTab] = useState("ENDED"); // Default to ENDED since most meetings are usually ended
  const meetingsPerPage = 3;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);

  // Get classroom info from URL params
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.userProfile);
  const classroomId =
    searchParams.get("classroomId") || location.state?.classroomId;
  const classroomName =
    searchParams.get("classroomName") || location.state?.classroomName;

  // Zoom OAuth states
  const [isZoomConnected, setIsZoomConnected] = useState(false);

  // Check Zoom connection on component mount
  useEffect(() => {
    const checkZoomConnection = () => {
      const zoomAccessToken = localStorage.getItem("zoomAccessToken");

      console.log("🔍 Checking Zoom connection:", {
        hasToken: !!zoomAccessToken,
        tokenLength: zoomAccessToken?.length,
      });

      if (zoomAccessToken) {
        setIsZoomConnected(true);
        console.log("✅ Zoom is connected");
      } else {
        setIsZoomConnected(false);
        console.log("❌ Zoom not connected");
      }
    };
    checkZoomConnection();
  }, []);

  // Handle return from Zoom OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const fromZoomConnection = urlParams.get("fromZoomConnection");
    const returnClassroomId = urlParams.get("classroomId");

    console.log("🔍 Checking OAuth return params:", {
      fromZoomConnection,
      returnClassroomId,
      currentClassroomId: classroomId,
    }); // If user just came back from Zoom OAuth
    if (fromZoomConnection === "true") {
      console.log("🔙 User returned from Zoom OAuth - opening create modal");

      // Check if Zoom is now connected
      const zoomAccessToken = localStorage.getItem("zoomAccessToken");
      if (zoomAccessToken) {
        console.log("✅ Zoom token found after OAuth - opening modal");
        setIsZoomConnected(true);

        // Auto-open create meeting modal after successful OAuth if we have classroom info
        if (
          returnClassroomId &&
          (returnClassroomId === classroomId || !classroomId)
        ) {
          setTimeout(() => {
            setSelectedClassroom({
              classroomId: returnClassroomId,
              classroomName:
                urlParams.get("classroomName") || classroomName || "Lớp học",
            });
            setIsModalOpen(true);
            toast.success(
              "Zoom đã kết nối thành công! Bạn có thể tạo phòng học ngay bây giờ."
            );
          }, 1000);
        } else {
          // Just show success message if no specific classroom
          toast.success("Zoom đã kết nối thành công!");
        }

        // Clean up URL params
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      } else {
        console.log("❌ No Zoom token found after OAuth return");
        toast.error("Kết nối Zoom không thành công. Vui lòng thử lại!");
      }
    }
  }, [location.search, classroomId, classroomName]);
  // Function to redirect to Zoom OAuth
  const redirectToZoomOAuth = async () => {
    console.log("🔗 Redirecting to Zoom OAuth...");

    // Store current page info to return after OAuth (using sessionStorage like other pages)
    const returnPath = `/tai-khoan/ho-so/quan-ly-lop-hoc/${classroomId}/meetings`;
    const returnState = {
      fromZoomOAuth: true,
      classroomId,
      classroomName,
    };

    console.log("💾 Storing return state:", { returnPath, returnState });
    sessionStorage.setItem("zoomReturnPath", returnPath);
    sessionStorage.setItem("zoomReturnState", JSON.stringify(returnState));

    try {
      // Use meeting/auth API to get dynamic OAuth URL
      console.log("📡 Calling meeting/auth API...");
      const response = await Api({
        endpoint: "meeting/auth",
        method: METHOD_TYPE.GET,
      });

      console.log("📡 meeting/auth response:", response);

      if (response?.success && response?.data?.zoomAuthUrl) {
        const zoomOAuthUrl = response.data.zoomAuthUrl;
        console.log("🔗 Zoom OAuth URL from API:", zoomOAuthUrl);
        window.location.href = zoomOAuthUrl;
      } else {
        console.error("❌ Invalid response from meeting/auth:", response);
        toast.error("Không thể lấy URL đăng nhập Zoom. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("❌ Error calling meeting/auth API:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Lỗi kết nối đến máy chủ";
      toast.error(`Không thể kết nối đến Zoom: ${errorMessage}`);
    }
  };
  console.log("🏫 TutorClassroomMeetingsPage - Classroom info:", {
    classroomId,
    classroomName,
    searchParams: Object.fromEntries(searchParams),
    locationState: location.state,
  });

  // Handle back to classroom list
  const handleBackToClassrooms = () => {
    navigate("/tai-khoan/ho-so/quan-ly-lop-hoc");
  };

  // Simple fetch function for manual calls (like pagination)
  const fetchMeetings = useCallback(
    async (page = 1) => {
      if (!classroomId || isLoading) return;

      try {
        setIsLoading(true);
        setError(null);
        const queryParams = {
          classroomId: classroomId,
        };

        const response = await Api({
          endpoint: "meeting/get-meeting",
          method: METHOD_TYPE.POST,
          data: queryParams,
          requireToken: true,
        });

        if (
          response.success &&
          response.data &&
          response.data.result &&
          Array.isArray(response.data.result.items)
        ) {
          const allMeetingsData = response.data.result.items;
          setAllMeetings(allMeetingsData);

          // Apply client-side filtering
          const result = getFilteredItems(
            allMeetingsData,
            activeMeetingTab,
            page,
            meetingsPerPage
          );
          setMeetings(result.items);
          setTotalMeetings(result.total);
          setCurrentPage(page);
        } else {
          setMeetings([]);
          setAllMeetings([]);
          setTotalMeetings(0);
        }
      } catch (error) {
        console.error("❌ Error fetching meetings:", error);
        setError("Lỗi khi tải danh sách phòng học.");
        setMeetings([]);
        setAllMeetings([]);
        setTotalMeetings(0);
      } finally {
        setIsLoading(false);
      }
    },
    [classroomId, isLoading, activeMeetingTab, meetingsPerPage]
  ); // Initial load - ONLY when classroomId changes
  useEffect(() => {
    if (!classroomId) return;

    console.log("🔄 Loading meetings for classroom:", classroomId);

    const loadMeetings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await Api({
          endpoint: "meeting/get-meeting",
          method: METHOD_TYPE.POST,
          data: { classroomId: classroomId },
          requireToken: true,
        });

        if (
          response.success &&
          response.data &&
          response.data.result &&
          Array.isArray(response.data.result.items)
        ) {
          const allMeetingsData = response.data.result.items;
          console.log(`✅ Fetched ${allMeetingsData.length} meetings`);
          setAllMeetings(allMeetingsData);
        } else {
          console.log("❌ No meetings data");
          setAllMeetings([]);
        }
      } catch (error) {
        console.error("❌ Error fetching meetings:", error);
        setError("Lỗi khi tải danh sách phòng học.");
        setAllMeetings([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMeetings();
  }, [classroomId]); // ONLY classroomId

  // Apply filtering when allMeetings or filters change
  useEffect(() => {
    if (allMeetings.length > 0) {
      const result = getFilteredItems(
        allMeetings,
        activeMeetingTab,
        currentPage,
        meetingsPerPage
      );
      setMeetings(result.items);
      setTotalMeetings(result.total);
    } else {
      setMeetings([]);
      setTotalMeetings(0);
    }
  }, [allMeetings, activeMeetingTab, currentPage, meetingsPerPage]);
  // Handle tab changes
  const handleMeetingTabChange = (newTab) => {
    if (newTab === activeMeetingTab) return;

    console.log(`🔄 Meeting tab change: ${activeMeetingTab} -> ${newTab}`);
    setActiveMeetingTab(newTab);
    setCurrentPage(1); // Reset to page 1 when changing tabs

    // The useEffect for filtering will handle the rest automatically
  };
  // Handle page changes
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(totalMeetings / meetingsPerPage)) {
      console.log(`📄 Page change: ${currentPage} -> ${newPage}`);
      setCurrentPage(newPage);

      // The useEffect for filtering will handle the rest automatically
    }
  };

  // Handle modal functions
  const handleOpenCreateMeetingModal = () => {
    console.log(
      "🔍 Opening create meeting modal for classroom:",
      classroomId,
      classroomName
    );

    if (!classroomId || !classroomName) {
      toast.error("Không thể tạo phòng học. Thiếu thông tin lớp học.");
      return;
    }

    // Check Zoom access token first
    const zoomAccessToken = localStorage.getItem("zoomAccessToken");
    console.log("🔍 Checking Zoom access token before opening modal:", {
      hasToken: !!zoomAccessToken,
      tokenLength: zoomAccessToken?.length,
    });

    if (!zoomAccessToken) {
      console.log("❌ No Zoom access token found - redirecting to Zoom OAuth");
      toast.error("Bạn cần đăng nhập Zoom để tạo phòng học!");
      redirectToZoomOAuth();
      return;
    }

    console.log("✅ Zoom token found - opening modal");
    setIsModalOpen(true);
    setSelectedClassroom({
      classroomId: classroomId,
      classroomName: classroomName || `Lớp học ${classroomId}`,
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClassroom(null);
  };

  const handleCreateMeetingSubmit = async (formData) => {
    console.log("🚀 handleCreateMeetingSubmit called with:", formData);
    console.log("🏫 Current classroom info:", {
      classroomId,
      classroomName,
      selectedClassroom,
    });

    if (!selectedClassroom) {
      console.error("❌ No selectedClassroom found");
      toast.error("Không tìm thấy thông tin lớp học!");
      return;
    }

    if (!classroomId) {
      console.error("❌ No classroomId found");
      toast.error("Không tìm thấy ID lớp học!");
      return;
    }

    let loadingToastId;
    try {
      loadingToastId = toast.loading("Đang tạo phòng học...");

      const meetingData = {
        classroomId: classroomId,
        topic: formData.topic,
        password: formData.password,
      };

      console.log("🔍 Creating meeting with data:", meetingData);

      const response = await Api({
        endpoint: "meeting/create",
        method: METHOD_TYPE.POST,
        data: meetingData,
        requireToken: true,
      });

      console.log("📡 API Response:", response);
      toast.dismiss(loadingToastId);

      if (response.success) {
        console.log("✅ Meeting created successfully:", response.data);
        toast.success("Tạo phòng học thành công!");
        setIsModalOpen(false);
        setSelectedClassroom(null);

        // Auto-switch to IN_SESSION tab if not already there
        if (activeMeetingTab !== "IN_SESSION") {
          setActiveMeetingTab("IN_SESSION");
        } // Refresh the meeting list
        setTimeout(() => {
          fetchMeetings(1, true);
        }, 500);
      } else {
        console.error("❌ API Error:", response);
        const errorMessage =
          response.message ||
          response.error ||
          "Có lỗi xảy ra khi tạo phòng học!";
        toast.error(errorMessage);
        if (loadingToastId) toast.dismiss(loadingToastId);
      }
    } catch (error) {
      console.error("❌ Exception creating meeting:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Có lỗi xảy ra khi tạo phòng học. Vui lòng thử lại!";
      toast.error(errorMessage);
      if (loadingToastId) toast.dismiss(loadingToastId);
    }
  };
  // Handle join meeting - Direct to Zoom URL
  const handleJoinMeeting = (meeting) => {
    const joinUrl = meeting.joinUrl || meeting.join_url;

    if (!joinUrl) {
      toast.error("Không tìm thấy link tham gia phòng học.");
      console.error("❌ No joinUrl found for meeting:", meeting);
      return;
    }

    // Open Zoom meeting in new window/tab
    window.open(joinUrl, "_blank", "noopener,noreferrer");
    toast.success("Đang mở phòng học Zoom...");

    console.log("🔗 Opening Zoom meeting:", {
      meetingId: meeting.meetingId,
      topic: meeting.topic,
      joinUrl: joinUrl,
    });
  };

  // Early return checks
  if (!currentUser?.userId) {
    return (
      <div className="tutor-classroom-page">
        <h2 className="tcp-page-title">Quản lý phòng học</h2>
        <p>Vui lòng đăng nhập để xem thông tin phòng học.</p>
      </div>
    );
  }

  if (!classroomId || !classroomName) {
    return (
      <div className="tutor-classroom-page">
        <h2 className="tcp-page-title">Quản lý phòng học</h2>
        <p>Thông tin lớp học không hợp lệ.</p>
        <button className="tcp-back-btn" onClick={handleBackToClassrooms}>
          <i className="fas fa-arrow-left"></i>
          Quay lại danh sách lớp học
        </button>
      </div>
    );
  }

  return (
    <div className="tutor-classroom-page">
      {/* Breadcrumb Navigation */}
      <div className="tcp-breadcrumb">
        <span className="tcp-breadcrumb-item">
          <i className="fas fa-home"></i>
          <button
            className="tcp-breadcrumb-link"
            onClick={handleBackToClassrooms}
          >
            Quản lý lớp học
          </button>
        </span>
        <span className="tcp-breadcrumb-separator">
          <i className="fas fa-chevron-right"></i>
        </span>
        <span className="tcp-breadcrumb-item tcp-breadcrumb-current">
          <i className="fas fa-video"></i>
          Phòng học - {classroomName}
        </span>
      </div>
      <div className="tcp-meeting-view">
        <div className="tcp-meeting-header">
          <div className="tcp-meeting-title">
            <i className="fas fa-video"></i>
            Phòng học - {classroomName}
          </div>
          <button className="tcp-back-btn" onClick={handleBackToClassrooms}>
            <i className="fas fa-arrow-left"></i>
            Quay lại danh sách lớp học
          </button>{" "}
        </div>

        {/* Zoom Status Alert */}
        {!isZoomConnected && (
          <div className="tcp-zoom-status-alert">
            <div className="tcp-alert tcp-alert-warning">
              <i className="fas fa-exclamation-triangle"></i>
              <span>
                Bạn chưa kết nối với Zoom. Khi tạo phòng học, hệ thống sẽ tự
                động chuyển bạn đến trang đăng nhập Zoom.
              </span>
            </div>
          </div>
        )}

        {/* Meeting Controls */}
        <div className="tcp-meeting-controls">
          <div className="tcp-meeting-tabs">
            <button
              className={`tcp-tab ${
                activeMeetingTab === "IN_SESSION" ? "active" : ""
              }`}
              onClick={() => handleMeetingTabChange("IN_SESSION")}
            >
              <i className="fas fa-play-circle"></i>
              Phòng học đang hoạt động
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
              <i className="fas fa-check-circle"></i>
              Phòng học đã kết thúc
              <span className="tcp-tab-count">
                ({getCountByStatus(allMeetings, "ENDED")})
              </span>
            </button>
          </div>

          <button
            className="tcp-create-meeting-btn"
            onClick={handleOpenCreateMeetingModal}
          >
            <i className="fas fa-plus"></i>
            Tạo phòng học
          </button>
        </div>
        <div className="tcp-meeting-content">
          {isLoading ? (
            <div className="tcp-loading">
              <div className="tcp-loading-spinner"></div>
              <p className="tcp-loading-text">
                Đang tải danh sách phòng học...
              </p>
            </div>
          ) : error ? (
            <div className="tcp-error">
              <i className="fas fa-exclamation-triangle"></i>
              <p>{error}</p>
              <button
                className="tcp-retry-btn"
                onClick={() => fetchMeetings(1)}
              >
                <i className="fas fa-refresh"></i>
                Thử lại
              </button>
            </div>
          ) : meetings.length === 0 ? (
            <div className="tcp-empty-state">
              <div className="tcp-empty-icon">
                <i className="fas fa-video"></i>
              </div>
              <h3>Chưa có phòng học nào</h3>
              <p>
                {activeMeetingTab === "IN_SESSION"
                  ? "Hiện tại chưa có phòng học nào đang hoạt động. Hãy tạo phòng học mới để bắt đầu."
                  : "Chưa có phòng học nào đã kết thúc."}
              </p>
            </div>
          ) : (
            <div className="tcp-meeting-list">
              {" "}
              {meetings.map((meeting) => {
                // Check if meeting has ended - improved logic
                const isEnded =
                  meeting.status === "ENDED" ||
                  meeting.status === "COMPLETED" ||
                  meeting.status === "FINISHED" ||
                  meeting.status === "CANCELLED" ||
                  (meeting.endTime && new Date(meeting.endTime) < new Date());

                return (
                  <div key={meeting.meetingId} className="tcp-meeting-card">
                    <div className="tcp-meeting-info">
                      <div className="tcp-meeting-topic">
                        <i className="fas fa-video"></i>
                        <h4>{meeting.topic}</h4>
                      </div>{" "}
                      <div className="tcp-meeting-details">
                        {/* Meeting ID và Zoom Meeting ID đã được ẩn theo yêu cầu gia sư */}
                        <div className="tcp-meeting-detail-item">
                          <span className="tcp-detail-label">Mật khẩu:</span>
                          <span className="tcp-detail-value">
                            {meeting.password || "N/A"}
                          </span>
                        </div>
                        <div className="tcp-meeting-detail-item">
                          <span className="tcp-detail-label">
                            Thời gian bắt đầu:
                          </span>
                          <span className="tcp-detail-value">
                            {formatDate(meeting.startTime)}
                          </span>
                        </div>
                        <div className="tcp-meeting-detail-item">
                          <span className="tcp-detail-label">
                            Thời gian kết thúc:
                          </span>
                          <span className="tcp-detail-value">
                            {formatDate(meeting.endTime)}
                          </span>
                        </div>
                        <div className="tcp-meeting-detail-item">
                          <span className="tcp-detail-label">Trạng thái:</span>
                          <span
                            className={`tcp-status-badge tcp-status-${meeting.status?.toLowerCase()}`}
                          >
                            {statusLabels[meeting.status] ||
                              meeting.status ||
                              "Chưa xác định"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="tcp-meeting-actions">
                      {!isEnded ? (
                        <button
                          className="tcp-action-btn tcp-join-btn"
                          onClick={() => handleJoinMeeting(meeting)}
                          title="Tham gia phòng học"
                        >
                          <i className="fas fa-sign-in-alt"></i>
                          Tham gia
                        </button>
                      ) : (
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
              })}
            </div>
          )}

          {/* Pagination */}
          {!isLoading &&
            !error &&
            meetings.length > 0 &&
            Math.ceil(totalMeetings / meetingsPerPage) > 1 && (
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
                  Trang {currentPage} /{" "}
                  {Math.ceil(totalMeetings / meetingsPerPage)}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={
                    currentPage === Math.ceil(totalMeetings / meetingsPerPage)
                  }
                  className="tcp-pagination-btn"
                >
                  Sau
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
        </div>
      </div>{" "}
      {/* Create Meeting Modal */}
      {isModalOpen && selectedClassroom && (
        <CreateMeetingModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleCreateMeetingSubmit}
          classroomName={
            selectedClassroom.classroomName || classroomName || "Lớp học"
          }
          defaultTopic={`Lớp học: ${
            selectedClassroom.classroomName || classroomName || "Không xác định"
          }`}
        />
      )}
      {/* Debug Modal State */}
      {console.log("🔍 Modal Debug:", {
        isModalOpen,
        selectedClassroom,
        classroomId,
        classroomName,
      })}
    </div>
  );
};

export default memo(TutorClassroomMeetingsPage);
