import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "../../assets/css/TutorClassroomPage.style.css";
import dfMale from "../../assets/images/df-male.png";

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

// Modal component for displaying meeting list
const MeetingListModal = ({ isOpen, onClose, meetings, classroomName }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;
  const handleJoinMeeting = (meeting) => {
    // Navigate to TutorMeetingRoomPage with meeting data for embedded Zoom
    navigate("/tai-khoan/ho-so/phong-hoc", {
      state: {
        meetingData: meeting,
        classroomName: classroomName,
        classroomId: meeting.classroomId,
        userRole: "host", // Tutor is always host
        isNewMeeting: false,
      },
    });
    onClose(); // Close the modal
  };

  return (
    <div className="tcp-modal-overlay" onClick={onClose}>
      <div
        className="tcp-modal-content tcp-meeting-list-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tcp-modal-header">
          <h3>Danh sách phòng học - {classroomName}</h3>
          <button className="tcp-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="tcp-meeting-list">
          {meetings && meetings.length > 0 ? (
            meetings.map((meeting, index) => (
              <div key={meeting.id || index} className="tcp-meeting-item">
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
                      <strong>Thời gian tạo:</strong>{" "}
                      {new Date(
                        meeting.createdAt || meeting.created_at
                      ).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
                <div className="tcp-meeting-actions">
                  <button
                    className="tcp-btn tcp-btn-join"
                    onClick={() => handleJoinMeeting(meeting)}
                  >
                    <i
                      className="fas fa-sign-in-alt"
                      style={{ marginRight: "8px" }}
                    ></i>
                    Tham gia (Embedded)
                  </button>
                  <a
                    href={meeting.joinUrl || meeting.join_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tcp-btn tcp-btn-external"
                    title="Mở trong tab mới"
                  >
                    <i className="fas fa-external-link-alt"></i>
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
                  </button>{" "}
                </div>
              </div>
            ))
          ) : (
            <div className="tcp-no-meetings">
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

const parseDateTimeLearn = (dateTimeLearn) => {
  if (!dateTimeLearn || !Array.isArray(dateTimeLearn)) return [];
  return dateTimeLearn.map((item) => {
    try {
      const parsed = JSON.parse(item);
      return {
        day: dayLabels[parsed.day] || parsed.day,
        times: parsed.times.join(", "),
      };
    } catch (error) {
      console.error("Error parsing dateTimeLearn item:", error);
      return { day: "N/A", times: "N/A" };
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

// Helper function to calculate meeting counts by status
const calculateMeetingCounts = (meetings) => {
  const inSessionCount = meetings.filter((meeting) => 
    meeting.status === "IN_SESSION" ||
    meeting.status === "STARTED" ||
    meeting.status === "PENDING" ||
    !meeting.status
  ).length;
  
  const endedCount = meetings.filter((meeting) => 
    meeting.status === "COMPLETED" ||
    meeting.status === "ENDED" ||
    meeting.status === "FINISHED"
  ).length;
  
  return {
    IN_SESSION: inSessionCount,
    ENDED: endedCount,
    total: meetings.length
  };
};

// Helper function to calculate classroom counts by status
const calculateClassroomCounts = (classrooms) => {
  const inSessionCount = classrooms.filter((classroom) => 
    classroom.status === "IN_SESSION" ||
    classroom.status === "ACTIVE" ||
    classroom.status === "ONGOING" ||
    !classroom.status
  ).length;
  
  const endedCount = classrooms.filter((classroom) => 
    classroom.status === "ENDED" ||
    classroom.status === "COMPLETED" ||
    classroom.status === "FINISHED"
  ).length;
  
  return {
    IN_SESSION: inSessionCount,
    ENDED: endedCount,
    total: classrooms.length
  };
};

const TutorClassroomPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalClassrooms, setTotalClassrooms] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2; // Changed to 2 as suggested

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [meetingList, setMeetingList] = useState([]); // For storing meeting list
  // Meeting pagination state
  const [totalMeetings, setTotalMeetings] = useState(0);
  const [currentMeetingPage, setCurrentMeetingPage] = useState(1);
  const [isMeetingLoading, setIsMeetingLoading] = useState(false);
  const meetingsPerPage = 2; // 2 meetings per page
  // Meeting count tracking by tab
  const [meetingCounts, setMeetingCounts] = useState({
    IN_SESSION: 0,
    ENDED: 0,
    total: 0
  });

  // Classroom count tracking by tab
  const [classroomCounts, setClassroomCounts] = useState({
    IN_SESSION: 0,
    ENDED: 0,
    total: 0
  });

  // Store all classrooms for client-side filtering
  const [allClassrooms, setAllClassrooms] = useState([]);
  
  // Store all meetings for client-side filtering
  const [allMeetings, setAllMeetings] = useState([]);

  // New state for showing meeting list directly on page instead of modal
  const [showMeetingView, setShowMeetingView] = useState(false);
  const [currentClassroomForMeetings, setCurrentClassroomForMeetings] =
    useState(null);
  const [activeMeetingTab, setActiveMeetingTab] = useState("IN_SESSION");// New state for tab navigation

  // New state for classroom detail view
  const [showClassroomDetail, setShowClassroomDetail] = useState(false);
  const [currentClassroomDetail, setCurrentClassroomDetail] = useState(null);

  // New state for main classroom tabs
  const [activeClassroomTab, setActiveClassroomTab] = useState("IN_SESSION");  // Handler for classroom tab changes (client-side filtering only)
  const handleClassroomTabChange = (newTab) => {
    console.log(`🔄 Tab change: ${activeClassroomTab} -> ${newTab}`);
    setActiveClassroomTab(newTab);
    setCurrentPage(1); // Reset to first page when changing tabs

    // Apply client-side filtering using allClassrooms data
    if (allClassrooms.length > 0) {
      const filteredClassrooms = allClassrooms.filter((classroom) => {
        if (newTab === "IN_SESSION") {
          return classroom.status === "IN_SESSION" ||
                 classroom.status === "ACTIVE" ||
                 classroom.status === "ONGOING" ||
                 !classroom.status;
        } else if (newTab === "ENDED") {
          return classroom.status === "ENDED" ||
                 classroom.status === "COMPLETED" ||
                 classroom.status === "FINISHED";
        }
        return true; // Show all if no specific filter
      });
      
      console.log(`📊 Filtered classrooms for tab ${newTab}:`, filteredClassrooms.length);
      
      // Apply pagination to filtered results
      const startIndex = 0; // Reset to first page
      const endIndex = itemsPerPage;
      const paginatedClassrooms = filteredClassrooms.slice(startIndex, endIndex);
      
      setClassrooms(paginatedClassrooms);
      setTotalClassrooms(filteredClassrooms.length); // Set total for current filter
      
      console.log(`📄 Page 1: Showing ${paginatedClassrooms.length} of ${filteredClassrooms.length} filtered classrooms`);
    } else {
      // No data in allClassrooms, need to fetch
      console.log("📥 No classrooms in allClassrooms, fetching from server...");
      fetchTutorClassrooms(1);
    }
  };

  const currentUser = useSelector((state) => state.user.userProfile);
  const navigate = useNavigate();
  const location = useLocation();
  // Function to go back from meeting view to classroom list
  const handleBackToClassrooms = () => {
    setShowMeetingView(false);
    setCurrentClassroomForMeetings(null);
    setMeetingList([]);
    setShowClassroomDetail(false);
    setCurrentClassroomDetail(null);
  };

  // Function to show classroom detail
  const handleShowClassroomDetail = (classroom) => {
    setCurrentClassroomDetail(classroom);
    setShowClassroomDetail(true);
  };

  // Function to go to meeting view from detail view
  const handleGoToMeetingView = async (classroomId, classroomName) => {
    setShowClassroomDetail(false);
    await handleEnterClassroom(classroomId, classroomName);
  };
  // Handle return from Zoom connection
  useEffect(() => {
    if (location.state?.fromClassroom && location.state?.zoomConnected) {
      const { classroomId, classroomName } = location.state;
      toast.success(
        "Kết nối Zoom thành công! Bây giờ bạn có thể tạo phòng học."
      );
      // Auto-open create meeting modal for the classroom
      if (classroomId && classroomName) {
        setTimeout(() => {
          setSelectedClassroom({ classroomId, nameOfRoom: classroomName });
          setIsModalOpen(true);
        }, 1000);
      }

      // Clear the state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);  const fetchTutorClassrooms = useCallback(
    async (page /* statusFilter = null */) => {
      if (!currentUser?.userId) {
        // Should not happen if page is protected, but good to check
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
          "🔍 Fetching all classrooms for client-side filtering and accurate pagination"
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
            `✅ Fetched ${allClassroomsData.length} total classrooms from server`
          );
          
          // Store all classrooms for filtering
          setAllClassrooms(allClassroomsData);
          
          // Calculate counts by status
          const counts = calculateClassroomCounts(allClassroomsData);
          setClassroomCounts(counts);
          
          // Apply client-side filtering based on active tab
          const filteredClassrooms = allClassroomsData.filter((classroom) => {
            if (activeClassroomTab === "IN_SESSION") {
              return classroom.status === "IN_SESSION" ||
                     classroom.status === "ACTIVE" ||
                     classroom.status === "ONGOING" ||
                     !classroom.status;
            } else if (activeClassroomTab === "ENDED") {
              return classroom.status === "ENDED" ||
                     classroom.status === "COMPLETED" ||
                     classroom.status === "FINISHED";
            }
            return true; // Show all if no specific filter
          });
          
          console.log(`📊 Filtered classrooms for tab ${activeClassroomTab}:`, filteredClassrooms.length);
          
          // Apply pagination to filtered results
          const startIndex = (page - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const paginatedClassrooms = filteredClassrooms.slice(startIndex, endIndex);
          
          setClassrooms(paginatedClassrooms);
          setTotalClassrooms(filteredClassrooms.length); // Set total for current filter
          setCurrentPage(page);
          
          console.log(`📄 Page ${page}: Showing ${paginatedClassrooms.length} of ${filteredClassrooms.length} filtered classrooms`);
        } else {
          console.log("❌ API response invalid or empty");
          setClassrooms([]);
          setAllClassrooms([]);
          setTotalClassrooms(0);
          setClassroomCounts({ IN_SESSION: 0, ENDED: 0, total: 0 });
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
        setClassroomCounts({ IN_SESSION: 0, ENDED: 0, total: 0 });
      } finally {
        setIsLoading(false);      }
    },
    [currentUser?.userId, activeClassroomTab, itemsPerPage]
  );
  
  useEffect(() => {
    // Initial load - always load all classrooms on component mount
    console.log(`📱 Initial loading of tutor classrooms`);
    fetchTutorClassrooms(1); // No filter on initial load to show all classrooms
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only trigger on component mount  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(totalClassrooms / itemsPerPage)) {
      setCurrentPage(newPage);

      // Apply client-side filtering and pagination using allClassrooms data
      if (allClassrooms.length > 0) {
        const filteredClassrooms = allClassrooms.filter((classroom) => {
          if (activeClassroomTab === "IN_SESSION") {
            return classroom.status === "IN_SESSION" ||
                   classroom.status === "ACTIVE" ||
                   classroom.status === "ONGOING" ||
                   !classroom.status;
          } else if (activeClassroomTab === "ENDED") {
            return classroom.status === "ENDED" ||
                   classroom.status === "COMPLETED" ||
                   classroom.status === "FINISHED";
          }
          return true; // Show all if no specific filter
        });
        
        // Apply pagination to filtered results
        const startIndex = (newPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedClassrooms = filteredClassrooms.slice(startIndex, endIndex);
        
        setClassrooms(paginatedClassrooms);
        
        console.log(`📄 Page ${newPage}: Showing ${paginatedClassrooms.length} of ${filteredClassrooms.length} filtered classrooms`);
      } else {
        // Fallback to server fetch if no data
        fetchTutorClassrooms(newPage);
      }
    }
  };  const handleEnterClassroom = async (classroomId, classroomName, page = 1) => {
    try {
      setIsMeetingLoading(true);
      // Show loading toast
      const loadingToastId = toast.loading("Đang tải danh sách phòng học..."); 
      
      // Build query parameters - fetch ALL meetings for accurate filtering
      const queryParams = {
        classroomId: classroomId,
        page: 1, // Always fetch from page 1
        rpp: 1000, // Large number to get all meetings
        sort: JSON.stringify([{ key: "startTime", type: "DESC" }]),
      };

      console.log(
        `🔍 Fetching all meetings for classroom ${classroomId} for client-side filtering and accurate pagination`
      );
      console.log(`📊 Active meeting tab: ${activeMeetingTab}`);

      // Call API to search for meetings
      const response = await Api({
        endpoint: "meeting/search",
        method: METHOD_TYPE.GET,
        query: queryParams,
        requireToken: false, // axiosClient handles Zoom Bearer token
      });

      // Dismiss loading toast
      toast.dismiss(loadingToastId);      
      
      if (response.success && response.data) {
        const allMeetingsData = response.data.items || [];
        console.log(`✅ Fetched ${allMeetingsData.length} total meetings from server`);
        
        // Store all meetings for filtering
        setAllMeetings(allMeetingsData);
        
        // Calculate meeting counts by status
        const counts = calculateMeetingCounts(allMeetingsData);
        setMeetingCounts(counts);
        
        // Apply client-side filtering based on active tab
        const filteredMeetings = allMeetingsData.filter((meeting) => {
          if (!meeting || !meeting.status) {
            console.warn("⚠️ Meeting missing status:", meeting);
            return false;
          }

          if (activeMeetingTab === "IN_SESSION") {
            return meeting.status === "IN_SESSION" ||
                   meeting.status === "STARTED" ||
                   meeting.status === "PENDING" ||
                   !meeting.status;
          } else if (activeMeetingTab === "ENDED") {
            return meeting.status === "COMPLETED" ||
                   meeting.status === "ENDED" ||
                   meeting.status === "FINISHED";
          }
          return true; // Show all if no specific filter
        });
        
        console.log(`📊 Filtered meetings for tab ${activeMeetingTab}:`, filteredMeetings.length);
        
        // Apply pagination to filtered results
        const startIndex = (page - 1) * meetingsPerPage;
        const endIndex = startIndex + meetingsPerPage;
        const paginatedMeetings = filteredMeetings.slice(startIndex, endIndex);
        
        setMeetingList(paginatedMeetings);
        setTotalMeetings(filteredMeetings.length); // Set total for current filter
        setCurrentMeetingPage(page);
        setCurrentClassroomForMeetings({
          classroomId,
          classroomName,
          nameOfRoom: classroomName,
        });
        setShowMeetingView(true);

        console.log(`📄 Page ${page}: Showing ${paginatedMeetings.length} of ${filteredMeetings.length} filtered meetings`);
        toast.success("Đã tải danh sách phòng học!");
      } else {
        toast.error(
          "Không tìm thấy phòng học nào. Vui lòng tạo phòng học trước."
        );
        setMeetingList([]);
        setAllMeetings([]);
        setTotalMeetings(0);
        setMeetingCounts({ IN_SESSION: 0, ENDED: 0, total: 0 });
      }
    } catch (error) {
      console.error("Error fetching meeting data:", error);      
      toast.error(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi tải danh sách phòng học. Vui lòng thử lại."
      );
      setMeetingList([]);
      setAllMeetings([]);
      setTotalMeetings(0);
      setMeetingCounts({ IN_SESSION: 0, ENDED: 0, total: 0 });
    } finally {
      setIsMeetingLoading(false);
    }
  };// Function to open create meeting modal
  const handleOpenCreateMeetingModal = (classroomId, classroomName) => {
    // Check if Zoom token exists
    const zoomToken = localStorage.getItem("zoomAccessToken");
    if (!zoomToken) {
      toast.error("Bạn cần kết nối tài khoản Zoom để tạo phòng học!");

      // Store return information for ZoomCallback
      sessionStorage.setItem(
        "zoomReturnPath",
        "/tai-khoan/ho-so/quan-ly-lop-hoc"
      );
      sessionStorage.setItem(
        "zoomReturnState",
        JSON.stringify({
          zoomConnected: true,
          fromClassroom: true,
          classroomId: classroomId,
          classroomName: classroomName,
        })
      );

      // Redirect to Zoom connection page with classroom info
      navigate("/tai-khoan/ho-so/phong-hoc", {
        state: {
          needZoomConnection: true,
          returnTo: "classroom",
          classroomId: classroomId,
          classroomName: classroomName,
        },
      });
      return;
    }

    setSelectedClassroom({ classroomId, classroomName });
    setIsModalOpen(true);
  }; // Function to handle meeting creation with form data
  const handleCreateMeetingSubmit = async (formData) => {
    if (!selectedClassroom) return;

    const { classroomId } = selectedClassroom;

    try {
      // Show loading toast
      const loadingToastId = toast.loading("Đang tạo phòng học Zoom..."); // Get tokens
      const zoomAccessToken = localStorage.getItem("zoomAccessToken");

      if (!zoomAccessToken) {
        toast.dismiss(loadingToastId);
        toast.error(
          "Không tìm thấy Zoom access token. Vui lòng kết nối lại Zoom."
        );
        return;
      }
      console.log("Zoom token available:", !!zoomAccessToken);
      console.log("Zoom token length:", zoomAccessToken?.length);
      const meetingPayload = {
        topic: formData.topic,
        password: formData.password,
        classroomId: classroomId,
        // Token được gửi qua header bởi axiosClient, không qua payload
      };
      console.log("Creating meeting with payload:", meetingPayload);

      // Call API to create meeting with proper token configuration
      const response = await Api({
        endpoint: "meeting/create",
        method: METHOD_TYPE.POST,
        data: meetingPayload,
        requireToken: true, // FIX: Use same token config as working CreateMeetingPage
      });

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      console.log("Create meeting response:", response);
      if (response && response.success && response.data) {
        toast.success("Tạo phòng học Zoom thành công!");
        setIsModalOpen(false);

        // Instead of auto-navigating, show a success message and let user manually enter classroom
        toast.info(
          "Bạn có thể vào lớp học để xem danh sách phòng học đã tạo!",
          {
            autoClose: 5000,
          }
        );

        // Optionally refresh the classroom list to show updated status
        fetchTutorClassrooms(currentPage);
      } else {
        const errorMessage =
          response?.message || "Không thể tạo phòng học Zoom";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error creating Zoom meeting:", error);
      toast.error(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi tạo phòng học Zoom. Vui lòng thử lại."
      );
    }
  };

  // Meeting pagination handlers
  const handleMeetingPageChange = async (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= Math.ceil(totalMeetings / meetingsPerPage) &&
      allMeetings.length > 0
    ) {
      // Apply client-side filtering and pagination using allMeetings data
      const filteredMeetings = allMeetings.filter((meeting) => {
        if (!meeting || !meeting.status) {
          console.warn("⚠️ Meeting missing status:", meeting);
          return false;
        }

        if (activeMeetingTab === "IN_SESSION") {
          return meeting.status === "IN_SESSION" ||
                 meeting.status === "STARTED" ||
                 meeting.status === "PENDING" ||
                 !meeting.status;
        } else if (activeMeetingTab === "ENDED") {
          return meeting.status === "COMPLETED" ||
                 meeting.status === "ENDED" ||
                 meeting.status === "FINISHED";
        }
        return true; // Show all if no specific filter
      });
      
      // Apply pagination to filtered results
      const startIndex = (newPage - 1) * meetingsPerPage;
      const endIndex = startIndex + meetingsPerPage;
      const paginatedMeetings = filteredMeetings.slice(startIndex, endIndex);      
      setMeetingList(paginatedMeetings);
      setCurrentMeetingPage(newPage);
      
      console.log(`📄 Meeting Page ${newPage}: Showing ${paginatedMeetings.length} of ${filteredMeetings.length} filtered meetings`);
    }
  };
  
  // Function to handle meeting tab change with pagination reset
  const handleMeetingTabChange = async (newTab) => {
    setActiveMeetingTab(newTab);
    setCurrentMeetingPage(1); // Reset to first page when switching tabs

    // Apply client-side filtering using allMeetings data
    if (allMeetings.length > 0) {
      const filteredMeetings = allMeetings.filter((meeting) => {
        if (!meeting || !meeting.status) {
          console.warn("⚠️ Meeting missing status:", meeting);
          return false;
        }

        if (newTab === "IN_SESSION") {
          return meeting.status === "IN_SESSION" ||
                 meeting.status === "STARTED" ||
                 meeting.status === "PENDING" ||
                 !meeting.status;
        } else if (newTab === "ENDED") {
          return meeting.status === "COMPLETED" ||
                 meeting.status === "ENDED" ||
                 meeting.status === "FINISHED";
        }
        return true; // Show all if no specific filter
      });
      
      console.log(`📊 Filtered meetings for tab ${newTab}:`, filteredMeetings.length);
      
      // Apply pagination to filtered results
      const startIndex = 0; // Reset to first page
      const endIndex = meetingsPerPage;
      const paginatedMeetings = filteredMeetings.slice(startIndex, endIndex);
      
      setMeetingList(paginatedMeetings);
      setTotalMeetings(filteredMeetings.length); // Set total for current filter
      
      console.log(`📄 Page 1: Showing ${paginatedMeetings.length} of ${filteredMeetings.length} filtered meetings`);
    } else {
      // No data in allMeetings, need to fetch
      console.log("📥 No meetings in allMeetings, fetching from server...");
      if (currentClassroomForMeetings) {
        await handleEnterClassroom(
          currentClassroomForMeetings.classroomId,
          currentClassroomForMeetings.classroomName,
          1
        );
      }
    }
  };

  if (!currentUser?.userId) {
    return (
      <div className="tutor-classroom-page">
        <h2 className="tcp-page-title">Quản lý lớp học</h2>
        <p>Vui lòng đăng nhập để xem thông tin lớp học.</p>
      </div>
    );
  }
  // Classroom Detail View Component
  const InlineMeetingListView = () => {
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
      `📊 Meeting filtering: ${meetingList.length} total → ${filteredMeetings.length} filtered (tab: ${activeMeetingTab})`
    );

    return (
      <div className="tcp-inline-meeting-view">
        {/* Back button section - separate row */}
        <div className="tcp-back-section">
          <button className="tcp-back-btn" onClick={handleBackToClassrooms}>
            <i className="fas fa-arrow-left" style={{ marginRight: "8px" }}></i>
            Quay lại danh sách lớp học
          </button>
        </div>{" "}
        {/* Meeting title section */}
        <div className="tcp-meeting-title-section">
          <h3 className="tcp-meeting-title">
            Danh sách phòng học - {currentClassroomForMeetings.nameOfRoom}
          </h3>
        </div>        {/* Tabs and actions section */}
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
                  ({meetingCounts.IN_SESSION})
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
                  ({meetingCounts.ENDED})
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
        </div>{" "}
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
          ) : filteredMeetings && filteredMeetings.length > 0 ? (
            filteredMeetings.map((meeting, index) => {
              // Check if meeting has ended
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
                        <strong>Thời gian kết thúc:</strong>{" "}
                        {meeting.endTime
                          ? new Date(meeting.endTime).toLocaleString("vi-VN")
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
  };

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
      <div className="tcp-classroom-detail-view">
        {/* Header */}
        <div className="tcp-detail-header">
          <button className="tcp-back-btn" onClick={handleBackToClassrooms}>
            <i className="fas fa-arrow-left" style={{ marginRight: "8px" }}></i>
            Quay lại danh sách lớp học
          </button>
          <h3 className="tcp-detail-title">
            Chi tiết lớp học - {classroom.nameOfRoom}
          </h3>
        </div>{" "}
        {/* Student Information - Single Section */}
        <div className="tcp-detail-content">
          <div className="tcp-detail-section">
            <h4 className="tcp-detail-section-title">
              <i className="fas fa-user-graduate"></i>
              Thông tin học viên
            </h4>{" "}
            <div className="tcp-avatar-section">
              <img
                src={getSafeAvatarUrl(classroom.user)}
                alt={classroom.user?.fullname || "Học viên"}
                className="tcp-detail-avatar"
                onError={handleAvatarError}
              />
              <div className="tcp-avatar-info">
                <h4>{classroom.user?.fullname || "N/A"}</h4>
                <p>{classroom.user?.personalEmail || "N/A"}</p>
              </div>
            </div>
            <div className="tcp-student-info-grid">
              <div className="tcp-detail-info-group">
                <div className="tcp-detail-label">
                  <i className="fas fa-phone"></i>
                  Số điện thoại:
                </div>
                <div className="tcp-detail-value">
                  {classroom.user?.phoneNumber || "N/A"}
                </div>
              </div>

              <div className="tcp-detail-info-group">
                <div className="tcp-detail-label">
                  <i className="fas fa-map-marker-alt"></i>
                  Địa chỉ:
                </div>
                <div className="tcp-detail-value">
                  {classroom.user?.homeAddress || "N/A"}
                </div>
              </div>

              <div className="tcp-detail-info-group">
                <div className="tcp-detail-label">
                  <i className="fas fa-calendar"></i>
                  Ngày sinh:
                </div>
                <div className="tcp-detail-value">
                  {classroom.user?.birthday
                    ? formatDate(classroom.user.birthday)
                    : "N/A"}
                </div>
              </div>

              <div className="tcp-detail-info-group">
                <div className="tcp-detail-label">
                  <i className="fas fa-graduation-cap"></i>
                  Chuyên ngành:
                </div>
                <div className="tcp-detail-value highlight">
                  {classroom.user?.major?.majorName || "N/A"}
                </div>
              </div>

              <div className="tcp-detail-info-group">
                <div className="tcp-detail-label">
                  <i className="fas fa-venus-mars"></i>
                  Giới tính:
                </div>
                <div className="tcp-detail-value">
                  {classroom.user?.gender === "MALE"
                    ? "Nam"
                    : classroom.user?.gender === "FEMALE"
                    ? "Nữ"
                    : "N/A"}
                </div>
              </div>

              <div className="tcp-detail-info-group">
                <div className="tcp-detail-label">
                  <i className="fas fa-coins"></i>
                  Mức học phí:
                </div>
                <div className="tcp-detail-value highlight">
                  {classroom.tutor?.coinPerHours
                    ? `${classroom.tutor.coinPerHours.toLocaleString()} Xu/giờ`
                    : "Thỏa thuận"}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Class Information */}
        <div className="tcp-detail-section" style={{ marginBottom: "24px" }}>
          <h4 className="tcp-detail-section-title">
            <i className="fas fa-calendar-alt"></i>
            Thông tin lớp học
          </h4>{" "}
          <div className="tcp-student-info-grid">
            <div className="tcp-detail-info-group">
              <div className="tcp-detail-label">
                <i className="fas fa-play-circle"></i>
                Ngày bắt đầu:
              </div>
              <div className="tcp-detail-value">
                {formatDate(classroom.startDay)}
              </div>
            </div>

            <div className="tcp-detail-info-group">
              <div className="tcp-detail-label">
                <i className="fas fa-stop-circle"></i>
                Ngày kết thúc:
              </div>
              <div className="tcp-detail-value">
                {formatDate(classroom.endDay)}
              </div>
            </div>

            <div className="tcp-detail-info-group">
              <div className="tcp-detail-label">
                <i className="fas fa-info-circle"></i>
                Trạng thái:
              </div>
              <div className="tcp-detail-value">
                <span
                  className={`tcp-status-indicator ${classroom.status
                    ?.toLowerCase()
                    .replace("_", "-")}`}
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
            </div>

            <div className="tcp-detail-info-group">
              <div className="tcp-detail-label">
                <i className="fas fa-star"></i>
                Đánh giá lớp học:
              </div>
              <div className="tcp-detail-value highlight">
                {classroom.classroomEvaluation
                  ? `${classroom.classroomEvaluation}/5.0 ⭐`
                  : "Chưa có đánh giá"}
              </div>
            </div>

            <div className="tcp-detail-info-group">
              <div className="tcp-detail-label">
                <i className="fas fa-book"></i>
                Môn học:
              </div>
              <div className="tcp-detail-value highlight">
                {classroom.tutor?.subject?.subjectName || "N/A"}
              </div>
            </div>

            <div className="tcp-detail-info-group">
              <div className="tcp-detail-label">
                <i className="fas fa-medal"></i>
                Cấp độ gia sư:
              </div>
              <div className="tcp-detail-value">
                {classroom.tutor?.tutorLevel?.levelName || "N/A"}
              </div>
            </div>
          </div>{" "}
          {/* Progress Bar */}
          {classroom.status === "IN_SESSION" && (
            <div className="tcp-detail-progress">
              <div className="tcp-detail-progress-label">
                <span>
                  <i className="fas fa-chart-line"></i>
                  Tiến độ lớp học
                </span>
                <span className="highlight">{progress.percentage}%</span>
              </div>
              <div className="tcp-detail-progress-bar">
                <div
                  className="tcp-detail-progress-fill"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
            </div>
          )}
          {/* Schedule */}
          <div className="tcp-detail-info-group">
            <div className="tcp-detail-label">
              <i className="fas fa-calendar-week"></i>
              Lịch học trong tuần:
            </div>
            {schedule.length > 0 ? (
              <div className="tcp-schedule-grid">
                {schedule.map((s, index) => (
                  <div key={index} className="tcp-schedule-item">
                    <i className="fas fa-clock"></i>
                    {s.day}: {s.times}
                  </div>
                ))}
              </div>
            ) : (
              <div className="tcp-detail-value">Chưa có lịch học.</div>
            )}
          </div>
        </div>
        {/* Action Buttons */}
        <div className="tcp-detail-actions">
          <button
            className="tcp-detail-btn tcp-detail-btn-meetings"
            onClick={() =>
              handleGoToMeetingView(classroom.classroomId, classroom.nameOfRoom)
            }
          >
            <i className="fas fa-video"></i>
            Xem phòng học
          </button>

          <button
            className="tcp-detail-btn tcp-detail-btn-create"
            onClick={() =>
              handleOpenCreateMeetingModal(
                classroom.classroomId,
                classroom.nameOfRoom
              )
            }
          >
            <i className="fas fa-plus"></i>
            Tạo phòng học mới
          </button>
        </div>
      </div>
    );
  };
  return (
    <div className="tutor-classroom-page">
      {showClassroomDetail ? (
        <ClassroomDetailView />
      ) : showMeetingView ? (
        <InlineMeetingListView />
      ) : (
        <>
          <h2 className="tcp-page-title">
            Quản lý lớp học ({totalClassrooms})
          </h2>{" "}          {/* Classroom Tabs */}
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
                  ({classroomCounts.IN_SESSION})
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
                  ({classroomCounts.ENDED})
                </span>
              </button>
            </div>
          </div>
          {isLoading && (
            <div className="tcp-skeleton-container">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="tcp-skeleton tcp-skeleton-card"
                ></div>
              ))}
            </div>
          )}
          {error && <p className="tcp-error-message">{error}</p>}{" "}
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
          {!isLoading &&
            !error &&
            classrooms.length > 0 &&
            (() => {
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
                "📊 Rendering classrooms:",
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
                  <div className="tcp-empty-state">
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
                        className="tcp-find-student-btn"
                        onClick={() => navigate("/gia-su")}
                      >
                        Quay về trang gia sư
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <div className="tcp-classroom-list">
                  {filteredClassrooms.map((classroom) => {
                    const schedule = parseDateTimeLearn(
                      classroom.dateTimeLearn
                    );
                    const classroomName =
                      classroom.nameOfRoom || "Lớp học không tên";
                    const statusLabel =
                      statusLabels[classroom.status] ||
                      classroom.status ||
                      "N/A";
                    const progress = calculateClassProgress(
                      classroom.startDay,
                      classroom.endDay
                    );

                    return (
                      <div
                        key={classroom.classroomId}
                        className="tcp-classroom-card"
                      >
                        <div className="tcp-card-header">
                          <div className="tcp-card-title-section">
                            <i className="fas fa-chalkboard-teacher"></i>
                            <h3 className="tcp-classroom-name">
                              {classroomName}
                            </h3>
                          </div>
                          <span
                            className={`tcp-status-badge tcp-status-${classroom.status
                              ?.toLowerCase()
                              .replace("_", "-")}`}
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
                            {statusLabel}
                          </span>
                        </div>
                        <div className="tcp-card-body">
                          {/* Student Section */}
                          <div className="tcp-student-section">
                            {" "}
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
                              <h4 className="tcp-student-name">
                                <i className="fas fa-user"></i>
                                {classroom.user?.fullname || "N/A"}
                              </h4>
                              <div className="tcp-student-info-grid">
                                <div className="tcp-info-item">
                                  <i className="fas fa-envelope"></i>
                                  <span>
                                    {classroom.user?.personalEmail || "N/A"}
                                  </span>
                                </div>
                                <div className="tcp-info-item">
                                  <i className="fas fa-phone"></i>
                                  <span>
                                    {classroom.user?.phoneNumber || "N/A"}
                                  </span>
                                </div>
                                <div className="tcp-info-item">
                                  <i className="fas fa-graduation-cap"></i>
                                  <span className="highlight">
                                    {classroom.user?.major?.majorName || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <hr className="tcp-divider" />

                          {/* Class Details Section */}
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
                                  <i className="fas fa-book"></i>
                                  Môn học:
                                </div>
                                <div className="tcp-info-value highlight">
                                  {classroom.tutor?.subject?.subjectName ||
                                    "N/A"}
                                </div>
                              </div>

                              <div className="tcp-info-group">
                                <div className="tcp-info-label">
                                  <i className="fas fa-coins"></i>
                                  Học phí:
                                </div>
                                <div className="tcp-info-value highlight">
                                  {classroom.tutor?.coinPerHours
                                    ? `${classroom.tutor.coinPerHours.toLocaleString()} Xu/giờ`
                                    : "Thỏa thuận"}
                                </div>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            {classroom.status === "IN_SESSION" && (
                              <div className="tcp-progress-section">
                                <div className="tcp-progress-header">
                                  <span className="tcp-progress-label">
                                    <i className="fas fa-chart-line"></i>
                                    Tiến độ lớp học
                                  </span>
                                  <span className="tcp-progress-percentage highlight">
                                    {progress.percentage}%
                                  </span>
                                </div>
                                <div className="tcp-progress-bar-container">
                                  <div
                                    className="tcp-progress-bar-fill"
                                    style={{ width: `${progress.percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}

                            {/* Schedule */}
                            <div className="tcp-schedule-section">
                              <div className="tcp-schedule-label">
                                <i className="fas fa-calendar-week"></i>
                                Lịch học trong tuần:
                              </div>
                              {schedule.length > 0 ? (
                                <div className="tcp-schedule-grid">
                                  {schedule.map((s, index) => (
                                    <div
                                      key={index}
                                      className="tcp-schedule-item"
                                    >
                                      <i className="fas fa-clock"></i>
                                      <span>
                                        {s.day}: {s.times}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="tcp-no-schedule">
                                  <i className="fas fa-calendar-times"></i>
                                  <span>Chưa có lịch học</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>{" "}
                        <div className="tcp-card-footer">
                          <div className="tcp-action-buttons">
                            {/* Simplified: All classrooms get the same 2 buttons */}
                            <button
                              className="tcp-action-btn tcp-view-detail-btn"
                              onClick={() =>
                                handleShowClassroomDetail(classroom)
                              }
                              disabled={!classroom.classroomId}
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
                              Xem danh sách phòng học
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}{" "}
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
                Trang {currentPage} của{" "}
                {Math.ceil(totalClassrooms / itemsPerPage)}
                <span className="tcp-total-items">
                  ({totalClassrooms} lớp học)
                </span>
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={
                  currentPage === Math.ceil(totalClassrooms / itemsPerPage)
                }
                className="tcp-pagination-btn"
              >
                Sau
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Meeting Modal */}
      {isModalOpen && selectedClassroom && (
        <CreateMeetingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateMeetingSubmit}
          classroomName={selectedClassroom.nameOfRoom}
          defaultTopic={`Lớp học: ${selectedClassroom.nameOfRoom}`}
        />
      )}
    </div>
  );
};

export default memo(TutorClassroomPage);
