import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PropTypes from "prop-types";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "../../assets/css/TutorClassroomPage.style.css";
import dfMale from "../../assets/images/df-male.png";

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

// Day labels for schedule parsing
const dayLabels = {
  1: "Thứ 2",
  2: "Thứ 3",
  3: "Thứ 4",
  4: "Thứ 5",
  5: "Thứ 6",
  6: "Thứ 7",
  0: "Chủ nhật",
  7: "Chủ nhật",
};

// Parse dateTimeLearn from JSON string format
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
  console.log("🔍 DEBUG - CreateMeetingModal props:", {
    isOpen,
    classroomName,
    defaultTopic,
  });

  const [formData, setFormData] = useState({
    topic: defaultTopic || `Lớp học: ${classroomName}`,
    password: Math.random().toString(36).substring(2, 8),
  });

  useEffect(() => {
    if (isOpen) {
      console.log("🔍 DEBUG - Modal opened, setting form data");
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
    console.log("🔍 DEBUG - Modal not open, returning null");
    return null;
  }

  console.log("🔍 DEBUG - Rendering modal UI with form data:", formData);
  return (
    <div className="tcp-modal-overlay" onClick={onClose}>
      <div className="tcp-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tcp-modal-header">
          <h3>Tạo phòng học Zoom</h3>
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

  // Classroom detail states
  const [showClassroomDetail, setShowClassroomDetail] = useState(false);
  const [currentClassroomDetail, setCurrentClassroomDetail] = useState(null);

  // View states
  const [showMeetingView, setShowMeetingView] = useState(false);
  const [currentClassroomForMeetings, setCurrentClassroomForMeetings] =
    useState(null);
  const [activeMeetingTab, setActiveMeetingTab] = useState("IN_SESSION");
  const [activeClassroomTab, setActiveClassroomTab] = useState("IN_SESSION");
  const currentUser = useSelector((state) => state.user.userProfile);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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
          // Remove include parameter as API doesn't support it properly
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

          // Debug: Log first classroom to see structure
          if (allClassroomsData.length > 0) {
            console.log(
              "🔍 DEBUG - First classroom structure:",
              allClassroomsData[0]
            );
            console.log(
              "🔍 DEBUG - First classroom user:",
              allClassroomsData[0]?.user
            );
            console.log(
              "🔍 DEBUG - First classroom tutor:",
              allClassroomsData[0]?.tutor
            );
          }

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
  // Auto-open modal after returning from Zoom OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromZoomConnection = urlParams.get("fromZoomConnection");
    const classroomId = urlParams.get("classroomId");
    const classroomName = urlParams.get("classroomName");

    console.log("🔍 DEBUG - OAuth callback check:", {
      fromZoomConnection,
      classroomId,
      classroomName,
      hasZoomToken: !!localStorage.getItem("zoomAccessToken"),
    });

    if (fromZoomConnection === "true" && classroomId && classroomName) {
      // Wait for classrooms to load, then auto-open modal
      const timer = setTimeout(() => {
        const zoomToken = localStorage.getItem("zoomAccessToken");
        console.log("🔍 DEBUG - Setting up auto-open modal:", {
          hasZoomToken: !!zoomToken,
          classroomId: decodeURIComponent(classroomId),
          classroomName: decodeURIComponent(classroomName),
        });

        if (zoomToken) {
          toast.success(
            "Kết nối Zoom thành công! Bây giờ bạn có thể tạo phòng học."
          );
          setSelectedClassroom({
            classroomId: decodeURIComponent(classroomId),
            classroomName: decodeURIComponent(classroomName),
          });
          setIsModalOpen(true);
          console.log("✅ Modal should be opened now");
        } else {
          console.log("❌ No Zoom token found");
        }
      }, 1000);

      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);

      return () => clearTimeout(timer);
    }
  }, []);

  // Handle URL parameters to restore view state on refresh
  useEffect(() => {
    const view = searchParams.get("view");
    const classroomId = searchParams.get("id");
    const classroomName = searchParams.get("name");
    if (view === "detail" && classroomId && classroomName) {
      // Restore classroom detail view
      const decodedClassroomId = decodeURIComponent(classroomId);
      const decodedClassroomName = decodeURIComponent(classroomName);

      // Try to find the full classroom object from allClassrooms
      const foundClassroom = allClassrooms.find(
        (c) => c.classroomId === decodedClassroomId
      );

      if (foundClassroom) {
        // Use the full classroom object with all data
        setCurrentClassroomDetail(foundClassroom);
      } else {
        // Fallback to basic data from URL
        setCurrentClassroomDetail({
          classroomId: decodedClassroomId,
          nameOfRoom: decodedClassroomName,
        });
      }

      setShowClassroomDetail(true);
      setShowMeetingView(false);
    } else if (view === "meetings" && classroomId && classroomName) {
      // Restore meeting view - need to load meetings
      const restoreMeetingView = async () => {
        try {
          setIsMeetingLoading(true);

          const queryParams = {
            classroomId: decodeURIComponent(classroomId),
            page: 1,
            rpp: 1000,
            sort: JSON.stringify([{ key: "startTime", type: "DESC" }]),
          };

          const response = await Api({
            endpoint: "meeting/search",
            method: METHOD_TYPE.GET,
            query: queryParams,
            requireToken: false,
          });

          if (response.success && response.data) {
            const allMeetingsData = response.data.items || [];
            setAllMeetings(allMeetingsData);

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
  }, [
    searchParams,
    activeMeetingTab,
    meetingsPerPage,
    setSearchParams,
    allClassrooms,
  ]);

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

        // Set URL params if not already set (avoid infinite loop during restore)
        if (
          !searchParams.get("view") ||
          searchParams.get("view") !== "meetings"
        ) {
          setSearchParams({
            view: "meetings",
            id: encodeURIComponent(classroomId),
            name: encodeURIComponent(classroomName),
          });
        }

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
    setShowClassroomDetail(false);
    setCurrentClassroomDetail(null);

    // Clear URL params
    setSearchParams({});
  }; // Function to show classroom detail from action button
  const handleShowClassroomDetail = (classroom) => {
    // Use data from the list instead of calling separate API
    setCurrentClassroomDetail(classroom);
    setShowClassroomDetail(true);

    // Update URL params
    setSearchParams({
      view: "detail",
      id: encodeURIComponent(classroom.classroomId),
      name: encodeURIComponent(classroom.nameOfRoom),
    });
  }; // Function to go to meeting view from detail view
  const handleGoToMeetingView = async (classroomId, classroomName) => {
    // Exit classroom detail view first
    setShowClassroomDetail(false);
    setCurrentClassroomDetail(null);

    // Update URL params for meeting view
    setSearchParams({
      view: "meetings",
      id: encodeURIComponent(classroomId),
      name: encodeURIComponent(classroomName),
    });

    await handleEnterClassroom(classroomId, classroomName);
  };
  const handleOpenCreateMeetingModal = (classroomId, classroomName) => {
    console.log("🔍 DEBUG - Opening create meeting modal:", {
      classroomId,
      classroomName,
      hasZoomToken: !!localStorage.getItem("zoomAccessToken"),
    });

    const zoomToken = localStorage.getItem("zoomAccessToken");
    if (!zoomToken) {
      console.log("❌ No Zoom token, redirecting to profile");

      // Save return path and state for OAuth callback
      sessionStorage.setItem("zoomReturnPath", "/quan-ly-lop-hoc");
      sessionStorage.setItem(
        "zoomReturnState",
        JSON.stringify({
          classroomId,
          classroomName,
          fromClassroom: true,
        })
      );

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

    console.log("✅ Setting selected classroom and opening modal");
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
      <div className="tutor-classroom-page">
        <div className="tcp-detail-header">
          <button className="tcp-back-btn" onClick={handleBackToClassrooms}>
            <i className="fas fa-arrow-left" style={{ marginRight: "8px" }}></i>
            Quay lại danh sách lớp học
          </button>
          <h3 className="tcp-detail-title">
            Chi tiết lớp học - {classroom.nameOfRoom}
          </h3>
        </div>

        <div className="tcp-detail-content">
          <div className="tcp-detail-section">
            <h4 className="tcp-detail-section-title">
              <i className="fas fa-user-graduate"></i>
              Thông tin học viên
            </h4>

            {/* Debug: Log classroom data */}
            {console.log("🔍 DEBUG - Classroom data:", classroom)}
            {console.log("🔍 DEBUG - User data:", classroom?.user)}

            <div className="tcp-student-detail-info">
              <img
                src={classroom.user?.avatar || dfMale}
                alt={classroom.user?.fullname || "Học viên"}
                className="tcp-detail-avatar"
              />
              <div className="tcp-student-info-grid">
                <div className="tcp-info-item">
                  <i className="fas fa-user"></i>
                  <span>
                    <strong>Tên:</strong> {classroom.user?.fullname || "N/A"}
                  </span>
                </div>
                <div className="tcp-info-item">
                  <i className="fas fa-envelope"></i>
                  <span>
                    <strong>Email:</strong>{" "}
                    {classroom.user?.personalEmail ||
                      classroom.user?.workEmail ||
                      "N/A"}
                  </span>
                </div>
                <div className="tcp-info-item">
                  <i className="fas fa-phone"></i>
                  <span>
                    <strong>Số điện thoại:</strong>{" "}
                    {classroom.user?.phoneNumber || "N/A"}
                  </span>
                </div>
                <div className="tcp-info-item">
                  <i className="fas fa-birthday-cake"></i>
                  <span>
                    <strong>Ngày sinh:</strong>{" "}
                    {classroom.user?.birthday
                      ? formatDate(classroom.user.birthday)
                      : "N/A"}
                  </span>
                </div>
                <div className="tcp-info-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>
                    <strong>Địa chỉ:</strong>{" "}
                    {classroom.user?.homeAddress || "N/A"}
                  </span>
                </div>
                <div className="tcp-info-item">
                  <i className="fas fa-graduation-cap"></i>
                  <span>
                    <strong>Ngành học:</strong>{" "}
                    {classroom.user?.major?.majorName || "N/A"}
                  </span>
                </div>
                <div className="tcp-info-item">
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

          <hr className="tcp-divider" />

          <div className="tcp-class-details">
            <div className="tcp-class-info-grid">
              <div className="tcp-info-group">
                <div className="tcp-info-label">
                  <i className="fas fa-play-circle"></i>
                  Ngày bắt đầu:
                </div>
                <div className="tcp-info-value">
                  {formatDate(classroom.startDay)}
                </div>
              </div>

              <div className="tcp-info-group">
                <div className="tcp-info-label">
                  <i className="fas fa-stop-circle"></i>
                  Ngày kết thúc:
                </div>
                <div className="tcp-info-value">
                  {formatDate(classroom.endDay)}
                </div>
              </div>

              <div className="tcp-info-group">
                <div className="tcp-info-label">
                  <i className="fas fa-chart-line"></i>
                  Tiến độ lớp học:
                </div>
                <div className="tcp-info-value">
                  {" "}
                  <div className="tcp-progress-container">
                    <div className="tcp-progress-bar">
                      <div
                        className="tcp-progress-fill"
                        style={{ width: `${progress.percentage}%` }}
                      ></div>
                    </div>
                    <span className="tcp-progress-text">
                      {progress.percentage}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="tcp-info-group">
                <div className="tcp-info-label">
                  <i className="fas fa-info-circle"></i>
                  Trạng thái:
                </div>
                <div className="tcp-info-value">
                  <span
                    className={`tcp-status ${
                      classroom.status === "IN_SESSION"
                        ? "tcp-status-active"
                        : "tcp-status-ended"
                    }`}
                  >
                    {classroom.status === "IN_SESSION"
                      ? "Đang diễn ra"
                      : "Đã kết thúc"}
                  </span>
                </div>
              </div>

              <div className="tcp-info-group">
                <div className="tcp-info-label">
                  <i className="fas fa-book"></i>
                  Môn học:
                </div>
                <div className="tcp-info-value">
                  {classroom.subject?.subjectName || "N/A"}
                </div>
              </div>

              <div className="tcp-info-group">
                <div className="tcp-info-label">
                  <i className="fas fa-star"></i>
                  Đánh giá:
                </div>
                <div className="tcp-info-value">
                  {classroom.rating ? (
                    <div className="tcp-rating">
                      <span className="tcp-rating-score">
                        {classroom.rating.toFixed(1)}
                      </span>
                      <div className="tcp-stars">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`fas fa-star ${
                              i < Math.floor(classroom.rating)
                                ? "tcp-star-filled"
                                : "tcp-star-empty"
                            }`}
                          ></i>
                        ))}
                      </div>
                    </div>
                  ) : (
                    "Chưa có đánh giá"
                  )}
                </div>
              </div>

              <div className="tcp-info-group tcp-schedule-group">
                <div className="tcp-info-label">
                  <i className="fas fa-calendar-alt"></i>
                  Lịch học:
                </div>
                <div className="tcp-info-value">
                  {schedule && schedule.length > 0 ? (
                    <ul className="tcp-schedule-list">
                      {schedule.map((s, index) => (
                        <li key={index}>
                          <strong>{s.day}:</strong> {s.times}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="tcp-info-value">Chưa có lịch học.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="tcp-detail-actions">
            <button
              className="tcp-action-btn tcp-view-meetings-btn"
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
          </div>
        </div>
      </div>
    );
  };

  // Show classroom detail view if active
  if (showClassroomDetail) {
    return <ClassroomDetailView />;
  } // Meeting View Component
  if (showMeetingView && currentClassroomForMeetings) {
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
            Phòng học - {currentClassroomForMeetings.nameOfRoom}
          </span>
        </div>

        <div className="tcp-meeting-view">
          <div className="tcp-meeting-header">
            <div className="tcp-meeting-title">
              <i className="fas fa-video"></i>
              Phòng học - {currentClassroomForMeetings.nameOfRoom}
            </div>
            <button className="tcp-back-btn" onClick={handleBackToClassrooms}>
              <i className="fas fa-arrow-left"></i>
              Quay lại danh sách lớp học
            </button>
          </div>

          {/* Meeting Tabs */}
          <div className="tcp-meeting-tabs-container">
            <div className="tcp-meeting-tabs">
              <button
                className={`tcp-tab ${
                  activeMeetingTab === "IN_SESSION" ? "active" : ""
                }`}
                onClick={() => handleMeetingTabChange("IN_SESSION")}
              >
                <i className="fas fa-video"></i>
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
                <i className="fas fa-video-slash"></i>
                Phòng học đã kết thúc
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
            </button>{" "}
          </div>

          <div className="tcp-meeting-content">
            {isMeetingLoading ? (
              <div className="tcp-loading">
                <div className="tcp-loading-spinner"></div>
                <p className="tcp-loading-text">
                  Đang tải danh sách phòng học...
                </p>
              </div>
            ) : meetingList && meetingList.length > 0 ? (
              <ul className="tcp-meeting-list">
                {meetingList.map((meeting, index) => {
                  const isEnded =
                    meeting.status === "COMPLETED" ||
                    meeting.status === "ENDED" ||
                    meeting.status === "FINISHED" ||
                    (meeting.endTime && new Date(meeting.endTime) < new Date());
                  const handleJoinMeeting = (meeting) => {
                    const zoomUrl = meeting.joinUrl || meeting.join_url;
                    if (zoomUrl) {
                      window.open(zoomUrl, "_blank");
                      toast.success("Đang mở phòng học Zoom...");
                    } else {
                      toast.error("Không tìm thấy link tham gia phòng học.");
                    }
                  };

                  const handleJoinMeetingEmbedded = (meeting) => {
                    // Navigate to meeting room with meeting data
                    navigate("/tai-khoan/ho-so/phong-hoc", {
                      state: {
                        meetingData: meeting,
                        classroomName: currentClassroomForMeetings.nameOfRoom,
                        classroomId:
                          meeting.classroomId ||
                          currentClassroomForMeetings.classroomId,
                        userRole: "host",
                        isNewMeeting: false,
                      },
                    });
                  };

                  return (
                    <li
                      key={meeting.meetingId || index}
                      className="tcp-meeting-item"
                    >
                      <div className="tcp-meeting-info">
                        <p>
                          <i className="fas fa-bookmark"></i>
                          <strong>Chủ đề:</strong>{" "}
                          {meeting.topic || "Không có chủ đề"}
                        </p>
                        <p>
                          <i className="fas fa-id-card"></i>
                          <strong>Meeting ID:</strong>{" "}
                          {meeting.zoomMeetingId || meeting.id}
                        </p>
                        <p>
                          <i className="fas fa-key"></i>
                          <strong>Mật khẩu:</strong>{" "}
                          {meeting.password || "Không có"}
                        </p>
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
                            className={`tcp-meeting-status ${
                              isEnded
                                ? "tcp-meeting-status-ended"
                                : "tcp-meeting-status-active"
                            }`}
                          >
                            {isEnded ? "Đã kết thúc" : "Đang hoạt động"}
                          </span>
                        </p>
                      </div>{" "}
                      {!isEnded ? (
                        <div className="tcp-meeting-actions">
                          <button
                            className="tcp-action-btn tcp-join-meeting-btn"
                            onClick={() => handleJoinMeeting(meeting)}
                          >
                            <i className="fas fa-external-link-alt"></i>
                            Tham gia
                          </button>
                          <button
                            className="tcp-action-btn tcp-join-embedded-btn"
                            onClick={() => handleJoinMeetingEmbedded(meeting)}
                          >
                            <i className="fas fa-sign-in-alt"></i>
                            Tham gia (Embedded)
                          </button>
                          <button
                            className="tcp-action-btn tcp-copy-link-btn"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                meeting.joinUrl || meeting.join_url
                              );
                              toast.success("Đã sao chép link tham gia!");
                            }}
                            title="Sao chép link"
                          >
                            <i className="fas fa-copy"></i>
                            Sao chép link
                          </button>
                        </div>
                      ) : (
                        <div className="tcp-meeting-ended">
                          <span className="tcp-ended-label">
                            <i className="fas fa-check-circle"></i>
                            Phiên đã kết thúc
                          </span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="tcp-empty-state">
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
                Trang {currentMeetingPage} /{" "}
                {Math.ceil(totalMeetings / meetingsPerPage)}
              </span>
              <button
                onClick={() => handleMeetingPageChange(currentMeetingPage + 1)}
                disabled={
                  currentMeetingPage >=
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
      )}{" "}
      {!isLoading && !error && classrooms.length > 0 && (
        <div className="tcp-classroom-list">
          {classrooms.map((classroom, index) => {
            // Enhanced processing similar to StudentClassroomPage
            const classroomName =
              classroom.nameOfRoom || `Lớp học #${classroom.classroomId}`;
            const statusLabel =
              statusLabels[classroom.status] ||
              classroom.status ||
              "Không xác định";

            // Calculate progress if status is IN_SESSION
            let progress = { percentage: 0 };
            if (
              classroom.status === "IN_SESSION" &&
              classroom.startDay &&
              classroom.endDay
            ) {
              const startDate = new Date(classroom.startDay);
              const endDate = new Date(classroom.endDay);
              const currentDate = new Date();
              const totalDuration = endDate - startDate;
              const elapsedDuration = currentDate - startDate;

              if (totalDuration > 0 && elapsedDuration >= 0) {
                progress.percentage = Math.min(
                  100,
                  Math.max(
                    0,
                    Math.round((elapsedDuration / totalDuration) * 100)
                  )
                );
              }
            }

            // Parse schedule information from API data
            const schedule = [];
            if (
              classroom.dateTimeLearn &&
              Array.isArray(classroom.dateTimeLearn)
            ) {
              classroom.dateTimeLearn.forEach((dateTimeStr) => {
                try {
                  // Parse JSON string like: "{\"day\":\"Monday\",\"times\":[\"05:00\"]}"
                  const dateTimeObj = JSON.parse(dateTimeStr);
                  if (
                    dateTimeObj.day &&
                    dateTimeObj.times &&
                    Array.isArray(dateTimeObj.times)
                  ) {
                    const dayLabel =
                      {
                        Monday: "Thứ 2",
                        Tuesday: "Thứ 3",
                        Wednesday: "Thứ 4",
                        Thursday: "Thứ 5",
                        Friday: "Thứ 6",
                        Saturday: "Thứ 7",
                        Sunday: "Chủ Nhật",
                      }[dateTimeObj.day] || dateTimeObj.day;

                    const times = dateTimeObj.times.join(", ");
                    schedule.push({
                      day: dayLabel,
                      times: times,
                    });
                  }
                } catch (error) {
                  console.error(
                    "Error parsing dateTimeLearn:",
                    error,
                    dateTimeStr
                  );
                }
              });
            }

            return (
              <div
                key={classroom.classroomId || index}
                className="tcp-classroom-card"
              >
                <div className="tcp-card-header">
                  <div className="tcp-card-title-section">
                    <i className="fas fa-chalkboard-teacher"></i>
                    <h3 className="tcp-classroom-name">{classroomName}</h3>
                  </div>
                  <span
                    className={`tcp-status-badge tcp-status-${classroom.status?.toLowerCase()}`}
                  >
                    <i className="fas fa-circle"></i>
                    {statusLabel}
                  </span>
                </div>
                <div className="tcp-student-section">
                  <div className="tcp-student-avatar-container">
                    <img
                      src={getSafeAvatarUrl(classroom.user)}
                      alt={classroom.user?.fullname || "Học viên"}
                      className="tcp-student-avatar"
                      onError={handleAvatarError}
                    />
                    <div className="tcp-avatar-overlay">
                      <i className="fas fa-user-graduate"></i>
                    </div>
                  </div>
                  <div className="tcp-student-details">
                    <div className="tcp-student-name">
                      <i className="fas fa-user"></i>
                      {classroom.user?.fullname || "N/A"}
                    </div>
                    <div className="tcp-student-info-grid">
                      <div className="tcp-info-item">
                        <i className="fas fa-envelope"></i>
                        <span>Email: </span>
                        <span className="highlight">
                          {classroom.user?.personalEmail || "N/A"}
                        </span>
                      </div>
                      <div className="tcp-info-item">
                        <i className="fas fa-phone"></i>
                        <span>Điện thoại: </span>
                        <span className="highlight">
                          {classroom.user?.phoneNumber || "N/A"}
                        </span>
                      </div>
                      <div className="tcp-info-item">
                        <i className="fas fa-book"></i>
                        <span>Chuyên ngành: </span>
                        <span className="highlight">
                          {classroom.user?.major?.majorName || "N/A"}
                        </span>
                      </div>
                      <div className="tcp-info-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>Địa chỉ: </span>
                        <span className="highlight">
                          {classroom.user?.homeAddress || "N/A"}
                        </span>
                      </div>
                      <div className="tcp-info-item">
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
                      <div className="tcp-info-item">
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
                <div className="tcp-class-details">
                  <div className="tcp-class-info-grid">
                    <div className="tcp-info-group">
                      <div className="tcp-info-label">
                        <i className="fas fa-calendar-alt"></i>
                        Ngày bắt đầu
                      </div>
                      <div className="tcp-info-value">
                        {formatDate(classroom.startDay)}
                      </div>
                    </div>
                    <div className="tcp-info-group">
                      <div className="tcp-info-label">
                        <i className="fas fa-calendar-check"></i>
                        Ngày kết thúc
                      </div>
                      <div className="tcp-info-value">
                        {formatDate(classroom.endDay)}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Progress Bar */}
                  {classroom.status === "IN_SESSION" && (
                    <div className="tcp-progress-section">
                      <div className="tcp-progress-header">
                        <div className="tcp-progress-label">
                          <i className="fas fa-chart-line"></i>
                          Tiến độ lớp học
                        </div>
                        <div className="tcp-progress-percentage">
                          {progress.percentage}%
                        </div>
                      </div>
                      <div className="tcp-progress-bar-container">
                        <div
                          className="tcp-progress-bar-fill"
                          style={{ width: `${progress.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Schedule Display */}
                  <div className="tcp-info-group">
                    <div className="tcp-info-label">
                      <i className="fas fa-clock"></i>
                      Lịch học
                    </div>
                    {schedule.length > 0 ? (
                      <ul className="tcp-schedule-list">
                        {schedule.map((s, index) => (
                          <li key={index}>
                            <strong>{s.day}:</strong> {s.times}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="tcp-info-value">Chưa có lịch học.</div>
                    )}
                  </div>
                </div>{" "}
                <div className="tcp-card-footer">
                  <div className="tcp-action-buttons">
                    <button
                      className="tcp-action-btn tcp-view-detail-btn"
                      onClick={() => handleShowClassroomDetail(classroom)}
                    >
                      <i className="fas fa-eye"></i>
                      Xem chi tiết
                    </button>

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
            );
          })}
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
      )}{" "}
      {/* Create Meeting Modal */}
      {console.log("🔍 DEBUG - Modal render check:", {
        isModalOpen,
        selectedClassroom,
        shouldRender: isModalOpen && selectedClassroom,
      })}
      {isModalOpen && selectedClassroom && (
        <CreateMeetingModal
          isOpen={isModalOpen}
          onClose={() => {
            console.log("🔍 DEBUG - Closing modal");
            setIsModalOpen(false);
          }}
          onSubmit={handleCreateMeetingSubmit}
          classroomName={selectedClassroom.classroomName}
          defaultTopic={`Lớp học: ${selectedClassroom.classroomName}`}
        />
      )}
    </div>
  );
};

export default memo(TutorClassroomPage);
