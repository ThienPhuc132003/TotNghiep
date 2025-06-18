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

  // View states
  const [showMeetingView, setShowMeetingView] = useState(false);
  const [currentClassroomForMeetings, setCurrentClassroomForMeetings] =
    useState(null);
  const [activeMeetingTab, setActiveMeetingTab] = useState("ENDED"); // Default to ENDED since all current meetings are ENDED
  const [activeClassroomTab, setActiveClassroomTab] = useState("IN_SESSION");
  const currentUser = useSelector((state) => state.user.userProfile);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fetchTutorClassrooms = useCallback(
    async (page = 1, forceRefresh = false) => {
      if (!currentUser?.userId) {
        setError("Không tìm thấy thông tin người dùng.");
        return;
      }

      // OPTIMIZATION: Skip API call if we already have cached data (unless forced refresh)
      if (!forceRefresh && allClassrooms.length > 0) {
        console.log("📋 Using cached classroom data for client-side filtering");

        const result = getFilteredItems(
          allClassrooms,
          activeClassroomTab,
          page,
          itemsPerPage
        );

        setClassrooms(result.items);
        setTotalClassrooms(result.total);
        setCurrentPage(page);

        console.log(
          `📊 Client-side filtering from cache for status '${activeClassroomTab}':`,
          `${result.items.length} of ${result.total} items on page ${page}`
        );
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // OPTIMIZATION STRATEGY:
        // Khi filter theo status (IN_SESSION/ENDED), server-side pagination không hữu ích
        // vì backend không hỗ trợ filter status. Thay vào đó:
        // 1. Fetch ALL classrooms trong 1 request (rpp=1000)
        // 2. Cache data để tránh fetch lại khi đổi tab/page
        // 3. Client-side filter + pagination từ cached data
        const queryParams = {
          page: 1, // Always fetch from page 1 to get all data
          rpp: 1000, // Large number to ensure we get ALL classrooms
          // NOTE: Backend API doesn't support status filtering
        };

        console.log(
          "🔍 Fetching ALL tutor classrooms (one-time fetch for caching)"
        );
        console.log(
          "📊 Strategy: Fetch once → Cache → Client-side filter/paginate"
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
            `✅ Fetched and cached ${allClassroomsData.length} total tutor classrooms`
          );

          // Cache all classrooms for subsequent filtering operations
          setAllClassrooms(allClassroomsData);

          // Apply client-side filtering for current tab
          const result = getFilteredItems(
            allClassroomsData,
            activeClassroomTab,
            page,
            itemsPerPage
          );

          setClassrooms(result.items);
          setTotalClassrooms(result.total); // Total AFTER filtering by status
          setCurrentPage(page);

          console.log(
            `📊 Initial client-side filtering results for status '${activeClassroomTab}':`
          );
          console.log(
            `   📈 Total classrooms cached: ${allClassroomsData.length}`
          );
          console.log(`   🔍 Filtered by status: ${result.total}`);
          console.log(
            `   📄 Page ${page}: Showing ${result.items.length} of ${result.total} filtered items`
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
    [currentUser?.userId, allClassrooms, activeClassroomTab, itemsPerPage]
  ); // Auto-open modal after returning from Zoom OAuth
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

          // Clear URL parameters first to prevent re-triggering
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );

          // Set classroom info and open modal
          setSelectedClassroom({
            classroomId: decodeURIComponent(classroomId),
            classroomName: decodeURIComponent(classroomName),
          });
          setIsModalOpen(true);
          console.log("✅ Modal should be opened now");
        } else {
          console.log("❌ No Zoom token found");
          // Clean URL if no token
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);
  // Handle URL parameters to restore view state on refresh
  useEffect(() => {
    const view = searchParams.get("view");
    const classroomId = searchParams.get("id");
    const classroomName = searchParams.get("name");
    if (view === "meetings" && classroomId && classroomName) {
      // Restore meeting view - need to load meetings
      const restoreMeetingView = async () => {
        try {
          setIsMeetingLoading(true);

          console.log(
            "🔍 TUTOR DEBUG - Restoring meeting view using meeting/get-meeting API"
          );

          // Use meeting/get-meeting API for consistency with main handleEnterClassroom function
          const requestData = {
            classroomId: decodeURIComponent(classroomId),
          };

          const response = await Api({
            endpoint: "meeting/get-meeting",
            method: METHOD_TYPE.POST,
            data: requestData,
            requireToken: true,
          });
          console.log(
            "🔍 TUTOR DEBUG - meeting/get-meeting restore response:",
            response
          );
          console.log(
            "🔍 TUTOR DEBUG - Full restore response structure:",
            JSON.stringify(response, null, 2)
          ); // Check for data in the correct path: response.data.result.items
          let allMeetingsData = [];
          if (response.success) {
            if (
              response.data &&
              response.data.result &&
              response.data.result.items
            ) {
              allMeetingsData = response.data.result.items;
              console.log(
                "✅ TUTOR DEBUG - Restored meetings from response.data.result.items:",
                allMeetingsData.length
              );
            } else if (response.result && response.result.items) {
              allMeetingsData = response.result.items;
              console.log(
                "✅ TUTOR DEBUG - Restored meetings from response.result.items (fallback):",
                allMeetingsData.length
              );
            } else if (response.data && response.data.items) {
              allMeetingsData = response.data.items;
              console.log(
                "✅ TUTOR DEBUG - Restored meetings from response.data.items (fallback 2):",
                allMeetingsData.length
              );
            } else {
              console.log(
                "⚠️ TUTOR DEBUG - No items found in response.data.result.items, response.result.items, or response.data.items during restore"
              );
              console.log(
                "🔍 TUTOR DEBUG - Available restore response keys:",
                Object.keys(response)
              );
            }

            if (allMeetingsData.length > 0) {
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
            } else {
              console.log(
                "⚠️ TUTOR DEBUG - No meetings found during restore, showing empty view"
              );
              // If no data, still show the meeting view but empty
              setMeetingList([]);
              setAllMeetings([]);
              setTotalMeetings(0);
              setCurrentClassroomForMeetings({
                classroomId: decodeURIComponent(classroomId),
                classroomName: decodeURIComponent(classroomName),
                nameOfRoom: decodeURIComponent(classroomName),
              });
              setShowMeetingView(true);
            }
          } else {
            console.log(
              "❌ TUTOR DEBUG - meeting/get-meeting restore failed, API call unsuccessful"
            );
            // If API call failed, still show the meeting view but empty
            setMeetingList([]);
            setAllMeetings([]);
            setTotalMeetings(0);
            setCurrentClassroomForMeetings({
              classroomId: decodeURIComponent(classroomId),
              classroomName: decodeURIComponent(classroomName),
              nameOfRoom: decodeURIComponent(classroomName),
            });
            setShowMeetingView(true);
          }
        } catch (error) {
          console.error(
            "❌ TUTOR DEBUG - Error restoring meeting view:",
            error
          );
          // If error, fallback to main view
          setSearchParams({});
        } finally {
          setIsMeetingLoading(false);
        }
      };
      restoreMeetingView();
    } else {
      // Default view - classroom list
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
    if (
      newPage >= 1 &&
      newPage <= Math.ceil(totalClassrooms / itemsPerPage) &&
      newPage !== currentPage
    ) {
      console.log(`📄 Page change: ${currentPage} -> ${newPage}`);
      setCurrentPage(newPage);

      // OPTIMIZATION: Use cached data for client-side pagination
      if (allClassrooms.length > 0) {
        const result = getFilteredItems(
          allClassrooms,
          activeClassroomTab,
          newPage,
          itemsPerPage
        );
        setClassrooms(result.items);

        console.log(
          `📄 Client-side pagination: Page ${newPage}, showing ${result.items.length} of ${result.total} filtered classrooms`
        );
      } else {
        // Fallback: fetch from server if no cached data
        console.log("📥 No cached data available, fetching from server...");
        fetchTutorClassrooms(newPage, true); // Force refresh
      }
    }
  };
  const handleClassroomTabChange = (newTab) => {
    console.log(`🔄 Tutor tab change: ${activeClassroomTab} -> ${newTab}`);
    setActiveClassroomTab(newTab);
    setCurrentPage(1); // Reset to first page when changing tabs

    // OPTIMIZATION: Use cached data for filtering instead of API call
    if (allClassrooms.length > 0) {
      const result = getFilteredItems(allClassrooms, newTab, 1, itemsPerPage);

      setClassrooms(result.items);
      setTotalClassrooms(result.total); // Set total for current filter

      console.log(
        `📊 Client-side tab filtering for '${newTab}': ${result.total} total, showing ${result.items.length} on page 1`
      );
    } else {
      // No cached data, need to fetch from server
      console.log("📥 No cached classrooms, fetching from server...");
      fetchTutorClassrooms(1, true); // Force refresh
    }
  };
  const handleEnterClassroom = async (classroomId, classroomName) => {
    try {
      setIsMeetingLoading(true);
      const loadingToastId = toast.loading("Đang tải danh sách phòng học...");
      console.log("🔍 TUTOR DEBUG - Fetching meetings for classroom:", {
        classroomId,
        classroomName,
        endpoint: "meeting/get-meeting",
        timestamp: new Date().toISOString(),
        forceClearCache:
          allMeetings.length === 0 ? "Yes - cache cleared" : "No - using cache",
      });

      // Debug token
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      console.log("🔍 TUTOR DEBUG - Token status:", {
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        tokenPreview: token ? token.substring(0, 20) + "..." : "No token",
      });
      console.log("🔍 TUTOR DEBUG - About to call API:", {
        endpoint: "meeting/get-meeting",
        method: "POST",
        data: { classroomId: classroomId },
        requireToken: true,
      });

      const response = await Api({
        endpoint: "meeting/get-meeting",
        method: METHOD_TYPE.POST,
        data: {
          classroomId: classroomId,
        },
        requireToken: true,
      });

      console.log("🔍 TUTOR DEBUG - API call completed. Response:", response);
      console.log("🔍 TUTOR DEBUG - meeting/get-meeting response:", response);
      console.log(
        "🔍 TUTOR DEBUG - Full response structure:",
        JSON.stringify(response, null, 2)
      );
      toast.dismiss(loadingToastId);

      // Check for data in the correct path based on API structure: response.data.result.items
      let allMeetingsData = [];
      if (
        response.success &&
        response.data &&
        response.data.result &&
        response.data.result.items
      ) {
        allMeetingsData = response.data.result.items;
        console.log(
          "✅ TUTOR DEBUG - Found meetings in response.data.result.items:",
          allMeetingsData.length
        );
        console.log(
          "🔍 TUTOR DEBUG - Meeting statuses:",
          allMeetingsData.map((m) => m.status)
        );

        if (allMeetingsData.length > 0) {
          console.log(
            "🔍 TUTOR DEBUG - Setting meetings to state:",
            allMeetingsData.length
          );
          console.log(
            "🔍 TUTOR DEBUG - Meeting details:",
            allMeetingsData.map((m) => ({
              meetingId: m.meetingId,
              status: m.status,
              topic: m.topic,
              createdAt: m.createdAt,
            }))
          );
          setAllMeetings(allMeetingsData);

          // Check meeting statuses and auto-set appropriate tab
          const hasInSessionMeetings = allMeetingsData.some(
            (m) =>
              m.status === "IN_SESSION" || m.status === "PENDING" || !m.status
          );
          const hasEndedMeetings = allMeetingsData.some(
            (m) =>
              m.status === "ENDED" ||
              m.status === "COMPLETED" ||
              m.status === "CANCELLED"
          );

          console.log("🔍 TUTOR DEBUG - Meeting status analysis:", {
            hasInSessionMeetings,
            hasEndedMeetings,
            currentActiveMeetingTab: activeMeetingTab,
            totalMeetings: allMeetingsData.length,
          });

          // Auto-adjust tab if current tab has no meetings
          let finalTab = activeMeetingTab;
          if (
            activeMeetingTab === "IN_SESSION" &&
            !hasInSessionMeetings &&
            hasEndedMeetings
          ) {
            finalTab = "ENDED";
            setActiveMeetingTab("ENDED");
            console.log(
              "🔄 TUTOR DEBUG - Auto-switching to ENDED tab (no IN_SESSION meetings found)"
            );
          } else if (
            activeMeetingTab === "ENDED" &&
            !hasEndedMeetings &&
            hasInSessionMeetings
          ) {
            finalTab = "IN_SESSION";
            setActiveMeetingTab("IN_SESSION");
            console.log(
              "🔄 TUTOR DEBUG - Auto-switching to IN_SESSION tab (no ENDED meetings found)"
            );
          }

          const result = getFilteredItems(
            allMeetingsData,
            finalTab,
            1,
            meetingsPerPage
          );

          console.log("🔍 TUTOR DEBUG - Filtered result:", {
            totalItems: allMeetingsData.length,
            filteredItems: result.items.length,
            activeTab: finalTab,
            resultTotal: result.total,
          });

          setMeetingList(result.items);
          setTotalMeetings(result.total);
          setCurrentMeetingPage(1);
          setCurrentClassroomForMeetings({
            classroomId,
            classroomName,
            nameOfRoom: classroomName,
          });

          console.log("🔍 TUTOR DEBUG - About to show meeting view");
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

          toast.success(`Đã tải ${allMeetingsData.length} phòng học!`);
          console.log("🔍 TUTOR DEBUG - Meeting view should now be visible");
        } else {
          console.log("⚠️ TUTOR DEBUG - No meetings found for this classroom");
          setAllMeetings([]);
          setMeetingList([]);
          setTotalMeetings(0);
          setCurrentMeetingPage(1);
          setCurrentClassroomForMeetings({
            classroomId,
            classroomName,
            nameOfRoom: classroomName,
          });
          setShowMeetingView(true);

          // Set URL params even when no meetings
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

          toast.info("Chưa có phòng học nào được tạo cho lớp này.");
        }
      } else {
        console.log(
          "❌ TUTOR DEBUG - API call failed or invalid response structure:",
          response
        );
        console.log(
          "🔍 TUTOR DEBUG - Response keys:",
          Object.keys(response || {})
        );
        toast.error("Không thể tải danh sách phòng học. Vui lòng thử lại!");
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

    // Reset modal states to prevent modal from showing when returning to classroom list
    setIsModalOpen(false);
    setSelectedClassroom(null);

    // Clear URL params to return to main classroom view
    setSearchParams({});
  };

  // Handler to close modal and stay on classroom list (not switch to meeting view)
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClassroom(null);
    // Do NOT switch to meeting view when modal is closed
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
      // Fix: Use the exact path without leading slash to match routing
      sessionStorage.setItem(
        "zoomReturnPath",
        "/tai-khoan/ho-so/quan-ly-lop-hoc"
      );
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

      console.log("🔍 DEBUG - meeting/create response:", {
        success: response.success,
        data: response.data,
        newMeeting: response.data?.meeting || response.data,
        timestamp: new Date().toISOString(),
      });

      if (response.success) {
        console.log("✅ DEBUG - Meeting created successfully!");
        const newMeeting = response.data?.meeting || response.data;
        if (newMeeting) {
          console.log("🔍 DEBUG - New meeting details:", {
            meetingId: newMeeting.meetingId || newMeeting.id,
            status: newMeeting.status,
            topic: newMeeting.topic,
            classroomId: newMeeting.classroomId,
          });
        }

        toast.success("Tạo phòng học thành công!");
        setIsModalOpen(false);
        setSelectedClassroom(null);
        // Reset cached meetings to force refresh
        setAllMeetings([]);
        setMeetingList([]);
        setTotalMeetings(0);

        // Clear any existing cache and force a fresh API call
        console.log("🔍 DEBUG - Clearing all meeting cache before refresh");

        // Refresh meeting list with a small delay to ensure backend has processed the new meeting
        setTimeout(async () => {
          // Auto-switch to IN_SESSION tab to show new meetings (since they're typically active when created)
          console.log(
            "🔍 DEBUG - Switching to IN_SESSION tab to show new meeting"
          );
          setActiveMeetingTab("IN_SESSION");

          await handleEnterClassroom(
            classroomId,
            selectedClassroom.classroomName
          );
        }, 500); // Small delay to ensure API has time to process
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
        <p>Vui lòng đăng nhập để xem thông tin lớp học.</p>{" "}
      </div>
    );
  }
  // Meeting View Component
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
          </div>{" "}
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
                {" "}
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
      <div className="tcp-header-section">
        <h2 className="tcp-page-title">Quản lý lớp học ({totalClassrooms})</h2>
        <button
          className="tcp-refresh-btn"
          onClick={() => {
            console.log("🔄 Manual refresh triggered");
            fetchTutorClassrooms(1, true); // Force refresh
          }}
          disabled={isLoading}
          title="Làm mới dữ liệu"
        >
          <i className={`fas fa-sync-alt ${isLoading ? "fa-spin" : ""}`}></i>
          {isLoading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>
      {/* Performance indicator for large datasets */}
      {allClassrooms.length > 500 && (
        <div className="tcp-performance-notice">
          <i className="fas fa-info-circle"></i>
          <span>
            Đang hiển thị {allClassrooms.length} lớp học. Dữ liệu được lọc và
            phân trang tại client để tối ưu trải nghiệm.
            {allClassrooms.length > 1000 && (
              <strong>
                {" "}
                Khuyến nghị: Liên hệ admin để tối ưu server-side filtering.
              </strong>
            )}
          </span>
        </div>
      )}
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

        {/* Caching status indicator */}
        {/* <div className="tcp-cache-status">
          {allClassrooms.length > 0 ? (
            <span className="tcp-cache-active">
              <i className="fas fa-database"></i>
              Đã cache {allClassrooms.length} lớp học
            </span>
          ) : (
            <span className="tcp-cache-empty">
              <i className="fas fa-exclamation-circle"></i>
              Chưa có dữ liệu cache
            </span>
          )}
        </div> */}
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
                    {" "}
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
      })}{" "}
      {isModalOpen && selectedClassroom && (
        <CreateMeetingModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleCreateMeetingSubmit}
          classroomName={selectedClassroom.classroomName}
          defaultTopic={`Lớp học: ${selectedClassroom.classroomName}`}
        />
      )}
    </div>
  );
};

export default memo(TutorClassroomPage);
