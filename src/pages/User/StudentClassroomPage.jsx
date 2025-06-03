import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  const itemsPerPage = 10;

  // Evaluation modal state
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [selectedClassroomForEvaluation, setSelectedClassroomForEvaluation] =
    useState(null);

  const currentUser = useSelector((state) => state.user.userProfile);
  const navigate = useNavigate();

  const fetchStudentClassrooms = useCallback(
    async (page) => {
      if (!currentUser?.userId) {
        setError("Không tìm thấy thông tin người dùng.");
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await Api({
          endpoint: "classroom/search-for-user",
          method: METHOD_TYPE.GET,
          query: {
            page: page,
            rpp: itemsPerPage,
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
        console.error("Error fetching student classrooms:", err);
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
    fetchStudentClassrooms(currentPage);
  }, [fetchStudentClassrooms, currentPage]);

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

  if (!currentUser?.userId) {
    return (
      <div className="student-classroom-page">
        <h2 className="scp-page-title">Lớp học của tôi</h2>
        <p>Vui lòng đăng nhập để xem thông tin lớp học.</p>
      </div>
    );
  }

  return (
    <div className="student-classroom-page">
      <h2 className="scp-page-title">Lớp học của tôi ({totalClassrooms})</h2>
      {isLoading && (
        <div className="scp-skeleton-container">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="scp-skeleton scp-skeleton-card"></div>
          ))}
        </div>
      )}
      {error && <p className="scp-error-message">{error}</p>}
      {!isLoading && !error && classrooms.length === 0 && (
        <div className="scp-empty-state">
          <p>Bạn hiện không có lớp học nào đang hoạt động.</p>
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
              <div key={classroom.classroomId} className="scp-classroom-card">
                <div className="scp-card-header">
                  <h3 className="scp-classroom-name">{classroomName}</h3>
                  <span
                    className={`scp-status-badge scp-status-${classroom.status?.toLowerCase()}`}
                  >
                    {statusLabel}
                  </span>
                </div>
                <div className="scp-card-body">
                  <div className="scp-tutor-info">
                    <img
                      src={classroom.tutor?.avatar || dfMale}
                      alt={classroom.tutor?.fullname || "Gia sư"}
                      className="scp-tutor-avatar"
                    />
                    <div>
                      <p>
                        <strong>Gia sư:</strong>{" "}
                        {classroom.tutor?.fullname || "N/A"}
                      </p>
                      <p>
                        <strong>Trường:</strong>{" "}
                        {classroom.tutor?.univercity || "N/A"}
                      </p>
                      <p>
                        <strong>Chuyên ngành:</strong>{" "}
                        {classroom.tutor?.major?.majorName || "N/A"}
                      </p>
                      <p>
                        <strong>Môn dạy:</strong>{" "}
                        {classroom.tutor?.subject?.subjectName || "N/A"}
                      </p>
                      <p>
                        <strong>Trình độ:</strong>{" "}
                        {classroom.tutor?.tutorLevel?.levelName || "N/A"}
                      </p>
                      <p>
                        <strong>Học phí:</strong>{" "}
                        <span className="scp-price">
                          {classroom.tutor?.coinPerHours
                            ? `${classroom.tutor.coinPerHours.toLocaleString(
                                "vi-VN"
                              )} Xu/giờ`
                            : "Thỏa thuận"}
                        </span>
                      </p>
                    </div>
                  </div>
                  <hr className="scp-divider" />{" "}
                  <div className="scp-class-details">
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
                      <div className="scp-progress-section">
                        <div className="scp-progress-label">
                          Tiến độ lớp học: {progress.percentage}%
                        </div>
                        <div className="scp-progress-bar">
                          <div
                            className={`scp-progress-fill ${progress.status}`}
                            style={{ width: `${progress.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <p>
                      <strong>Lịch học:</strong>
                    </p>
                    {schedule.length > 0 ? (
                      <ul className="scp-schedule-list">
                        {schedule.map((s, index) => (
                          <li key={index}>
                            {s.day}: {s.times}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Chưa có lịch học.</p>
                    )}
                    <div className="scp-progress-container">
                      <div
                        className="scp-progress-bar"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <p className="scp-progress-text">
                      {progressStatus === "completed" &&
                        "Lớp học đã hoàn thành."}
                      {progressStatus === "in_progress" &&
                        `Đang học: ${progressPercentage}%`}
                      {progressStatus === "not_started" &&
                        "Lớp học chưa bắt đầu."}
                    </p>
                  </div>
                </div>
                <div className="scp-card-footer">
                  <div className="scp-action-buttons">
                    {" "}
                    {classroom.status === "IN_SESSION" && (
                      <button
                        className="scp-action-btn scp-enter-btn"
                        onClick={() =>
                          handleEnterClassroom(
                            classroom.classroomId,
                            classroomName
                          )
                        }
                      >
                        Vào lớp học
                      </button>
                    )}
                    {classroom.status === "COMPLETED" &&
                      !classroom.classroomEvaluation && (
                        <button
                          className="scp-action-btn scp-evaluate-btn"
                          onClick={() =>
                            handleEvaluateClass(
                              classroom.classroomId,
                              classroomName
                            )
                          }
                        >
                          Đánh giá lớp học
                        </button>
                      )}
                    {classroom.classroomEvaluation && (
                      <span className="scp-evaluated-badge">Đã đánh giá</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!isLoading && totalClassrooms > itemsPerPage && (
        <div className="scp-pagination">
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
          </button>{" "}
        </div>
      )}{" "}
      {/* Evaluation Modal */}
      {showEvaluationModal && selectedClassroomForEvaluation && (
        <ClassroomEvaluationModal
          isOpen={showEvaluationModal}
          classroomName={selectedClassroomForEvaluation.classroomName}
          onSubmit={handleEvaluationSubmit}
          onClose={handleCloseEvaluationModal}
        />
      )}{" "}
      {/* Debug Components - only for development */}
      {/* <QuickDebug /> */}
      {/* <ClassroomAPITest /> */}
      {/* <CreateMeetingTest /> */}
    </div>
  );
};

export default StudentClassroomPage;
