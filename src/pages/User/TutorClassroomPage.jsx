import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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

const TutorClassroomPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalClassrooms, setTotalClassrooms] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Or get from a config

  const currentUser = useSelector((state) => state.user.userProfile);
  const navigate = useNavigate(); // <<< THÊM MỚI

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
      const loadingToastId = toast.loading("Đang tải thông tin phòng học..."); // Call API to get meeting information (same endpoint for both student and tutor)
      const response = await Api({
        endpoint: "meeting/get-meeting",
        method: METHOD_TYPE.GET,
        query: {
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
        const meetingData = response.data.items[0]; // Get first meeting item

        // Navigate to meeting room with meeting data
        navigate("/tai-khoan/ho-so/phong-hop-zoom", {
          state: {
            meetingData: meetingData,
            classroomName: classroomName,
            classroomId: classroomId,
          },
        });

        toast.success("Đang chuyển đến phòng học...");
      } else {
        toast.error(
          "Không tìm thấy thông tin phòng học. Vui lòng thử lại sau."
        );
      }
    } catch (error) {
      console.error("Error fetching meeting data:", error);
      toast.error(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi tải thông tin phòng học. Vui lòng thử lại."
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
      )}
    </div>
  );
};

export default TutorClassroomPage;
