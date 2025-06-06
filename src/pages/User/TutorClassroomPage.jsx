import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "../../assets/css/TutorClassroomPage.style.css";
import dfMale from "../../assets/images/df-male.png";

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
  if (!isOpen) return null;

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
                      <strong>ID:</strong> {meeting.id}
                    </p>
                    <p>
                      <strong>Mật khẩu:</strong>{" "}
                      {meeting.password || "Không có"}
                    </p>
                    <p>
                      <strong>Thời gian tạo:</strong>{" "}
                      {new Date(meeting.created_at).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
                <div className="tcp-meeting-actions">
                  <a
                    href={meeting.join_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tcp-btn tcp-btn-join"
                  >
                    <i
                      className="fas fa-sign-in-alt"
                      style={{ marginRight: "8px" }}
                    ></i>
                    Tham gia
                  </a>
                  <button
                    className="tcp-btn tcp-btn-copy"
                    onClick={() => {
                      navigator.clipboard.writeText(meeting.join_url);
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

const TutorClassroomPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalClassrooms, setTotalClassrooms] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Or get from a config
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [meetingList, setMeetingList] = useState([]);
  const [isMeetingListOpen, setIsMeetingListOpen] = useState(false);

  const currentUser = useSelector((state) => state.user.userProfile);
  const navigate = useNavigate();
  const location = useLocation();
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
  }, [location.state, location.pathname, navigate]);

  const fetchTutorClassrooms = useCallback(
    async (page) => {
      if (!currentUser?.userId) {
        // Should not happen if page is protected, but good to check
        setError("Không tìm thấy thông tin người dùng.");
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await Api({
          endpoint: "classroom/search-for-tutor",
          method: METHOD_TYPE.GET,
          query: {
            page: page,
            rpp: itemsPerPage,
            // The API implies it uses the logged-in tutor's ID from the token
          },
          requireToken: true,
        });
        if (
          response.success &&
          response.data &&
          Array.isArray(response.data.items)
        ) {
          setClassrooms(response.data.items);
          setTotalClassrooms(response.data.total || 0);
        } else {
          setClassrooms([]);
          setTotalClassrooms(0);
        }
      } catch (err) {
        console.error("Error fetching tutor classrooms:", err);
        setError(
          err.response?.data?.message ||
            "Đã xảy ra lỗi khi tải danh sách lớp học."
        );
        toast.error(
          err.response?.data?.message ||
            "Đã xảy ra lỗi khi tải danh sách lớp học."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser?.userId, itemsPerPage]
  );

  useEffect(() => {
    fetchTutorClassrooms(currentPage);
  }, [fetchTutorClassrooms, currentPage]);
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(totalClassrooms / itemsPerPage)) {
      setCurrentPage(newPage);
    }
  };
  const handleEnterClassroom = async (classroomId, classroomName) => {
    try {
      // Show loading toast
      const loadingToastId = toast.loading("Đang tải danh sách phòng học...");

      // Call API to get meeting information
      const response = await Api({
        endpoint: "meeting/get-meeting",
        method: METHOD_TYPE.POST,
        data: {
          classroomId: classroomId,
        },
        requireToken: true,
      });

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      if (
        response.success &&
        response.data &&
        response.data.items &&
        response.data.items.length > 0
      ) {
        // Show meeting list modal instead of navigating directly
        setMeetingList(response.data.items);
        setSelectedClassroom({ classroomId, classroomName });
        setIsMeetingListOpen(true);
      } else {
        toast.error(
          "Không tìm thấy phòng học nào. Vui lòng tạo phòng học trước."
        );
      }
    } catch (error) {
      console.error("Error fetching meeting data:", error);
      toast.error(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi tải danh sách phòng học. Vui lòng thử lại."
      );
    }
  }; // Function to open create meeting modal
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
      navigate("/tai-khoan/ho-so/phong-hop-zoom", {
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
  };
  // Function to handle meeting creation with form data
  const handleCreateMeetingSubmit = async (formData) => {
    if (!selectedClassroom) return;

    const { classroomId, classroomName } = selectedClassroom;

    try {
      // Show loading toast
      const loadingToastId = toast.loading("Đang tạo phòng học Zoom...");

      const meetingPayload = {
        topic: formData.topic,
        password: formData.password,
        classroomId: classroomId,
      };

      console.log("Creating meeting with payload:", meetingPayload);

      // Call API to create meeting
      const response = await Api({
        endpoint: "meeting/create",
        method: METHOD_TYPE.POST,
        data: meetingPayload,
        requireToken: true,
      });

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      console.log("Create meeting response:", response);

      if (response && response.success && response.data) {
        toast.success("Tạo phòng học Zoom thành công!");
        setIsModalOpen(false);

        // Navigate to the meeting room with created meeting data
        navigate("/tai-khoan/ho-so/phong-hop-zoom", {
          state: {
            meetingData: response.data,
            classroomName: classroomName,
            classroomId: classroomId,
            isNewMeeting: true,
          },
        });
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

  if (!currentUser?.userId) {
    return (
      <div className="tutor-classroom-page">
        <h2 className="tcp-page-title">Quản lý lớp học</h2>
        <p>Vui lòng đăng nhập để xem thông tin lớp học.</p>
      </div>
    );
  }

  return (
    <div className="tutor-classroom-page">
      <h2 className="tcp-page-title">Quản lý lớp học ({totalClassrooms})</h2>
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
          <p>Bạn hiện không có lớp học nào đang hoạt động.</p>
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
          {classrooms.map((classroom) => {
            const schedule = parseDateTimeLearn(classroom.dateTimeLearn);
            const classroomName = classroom.nameOfRoom || "Lớp học không tên";
            const statusLabel =
              statusLabels[classroom.status] || classroom.status || "N/A";
            const progress = calculateClassProgress(
              classroom.startDay,
              classroom.endDay
            );
            const { percentage: progressPercentage, status: progressStatus } =
              calculateClassProgress(classroom.startDay, classroom.endDay);

            return (
              <div key={classroom.classroomId} className="tcp-classroom-card">
                <div className="tcp-card-header">
                  <h3 className="tcp-classroom-name">{classroomName}</h3>
                  <span
                    className={`tcp-status-badge tcp-status-${classroom.status?.toLowerCase()}`}
                  >
                    {statusLabel}
                  </span>
                </div>
                <div className="tcp-card-body">
                  <div className="tcp-student-info">
                    <img
                      src={classroom.user?.avatar || dfMale}
                      alt={classroom.user?.fullname || "Học viên"}
                      className="tcp-student-avatar"
                    />
                    <div>
                      <p>
                        <strong>Học viên:</strong>{" "}
                        {classroom.user?.fullname || "N/A"}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {classroom.user?.personalEmail || "N/A"}
                      </p>
                      <p>
                        <strong>Chuyên ngành:</strong>{" "}
                        {classroom.user?.major?.majorName || "N/A"}
                      </p>
                      <p>
                        <strong>Số điện thoại:</strong>{" "}
                        {classroom.user?.phoneNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                  <hr className="tcp-divider" />
                  <div className="tcp-class-details">
                    <p>
                      <strong>Ngày bắt đầu:</strong>{" "}
                      {formatDate(classroom.startDay)}
                    </p>
                    <p>
                      <strong>Ngày kết thúc:</strong>{" "}
                      {formatDate(classroom.endDay)}
                    </p>

                    {/* Progress Bar */}
                    {classroom.status === "IN_SESSION" && (
                      <div className="tcp-progress-section">
                        <div className="tcp-progress-label">
                          Tiến độ lớp học: {progress.percentage}%
                        </div>
                        <div className="tcp-progress-bar">
                          <div
                            className={`tcp-progress-fill ${progress.status}`}
                            style={{ width: `${progress.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <p>
                      <strong>Lịch học:</strong>
                    </p>
                    {schedule.length > 0 ? (
                      <ul className="tcp-schedule-list">
                        {schedule.map((s, index) => (
                          <li key={index}>
                            {s.day}: {s.times}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Chưa có lịch học.</p>
                    )}
                    <div className="tcp-progress-container">
                      <div
                        className="tcp-progress-bar"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <p className="tcp-progress-text">
                      {progressStatus === "completed" &&
                        "Lớp học đã hoàn thành."}
                      {progressStatus === "in_progress" &&
                        `Đang học: ${progressPercentage}%`}
                      {progressStatus === "not_started" &&
                        "Lớp học chưa bắt đầu."}
                    </p>
                  </div>
                </div>{" "}
                <div className="tcp-card-footer">
                  <div className="tcp-action-buttons">
                    {" "}
                    {/* Tạo phòng học Zoom button - always visible */}
                    <button
                      className="tcp-action-btn tcp-create-meeting-btn"
                      onClick={() =>
                        handleOpenCreateMeetingModal(
                          classroom.classroomId,
                          classroom.nameOfRoom
                        )
                      }
                      disabled={!classroom.classroomId}
                      style={{
                        backgroundColor: "#007bff",
                        color: "white",
                        marginRight: "10px",
                      }}
                    >
                      <i
                        className="fas fa-video"
                        style={{ marginRight: "5px" }}
                      ></i>
                      Tạo phòng học
                    </button>
                    {classroom.status === "IN_SESSION" && (
                      <button
                        className="tcp-action-btn tcp-enter-btn"
                        onClick={() =>
                          handleEnterClassroom(
                            classroom.classroomId,
                            classroomName
                          )
                        }
                        disabled={!classroom.classroomId}
                      >
                        Vào lớp học
                      </button>
                    )}
                    {classroom.status === "PENDING" && (
                      <button
                        className="tcp-action-btn tcp-manage-btn"
                        onClick={() =>
                          handleEnterClassroom(
                            classroom.classroomId,
                            classroomName
                          )
                        }
                        disabled={!classroom.classroomId}
                      >
                        Chuẩn bị lớp học
                      </button>
                    )}
                    {classroom.status === "COMPLETED" && (
                      <span className="tcp-completed-badge">Đã hoàn thành</span>
                    )}
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
          >
            Trước
          </button>
          <span>
            Trang {currentPage} của {Math.ceil(totalClassrooms / itemsPerPage)}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === Math.ceil(totalClassrooms / itemsPerPage)}
          >
            Sau
          </button>
        </div>
      )}{" "}
      {/* Create Meeting Modal */}
      {isModalOpen && selectedClassroom && (
        <CreateMeetingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateMeetingSubmit}
          classroomName={selectedClassroom.nameOfRoom}
          defaultTopic={`Lớp học: ${selectedClassroom.nameOfRoom}`}
        />
      )}{" "}
      {/* Meeting List Modal */}
      {isMeetingListOpen && selectedClassroom && (
        <MeetingListModal
          isOpen={isMeetingListOpen}
          onClose={() => setIsMeetingListOpen(false)}
          meetings={meetingList}
          classroomName={selectedClassroom.nameOfRoom}
        />
      )}
    </div>
  );
};

export default memo(TutorClassroomPage);
