// src/pages/User/TutorBookingRequestsPage.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux"; // Vẫn dùng để lấy isAuthenticated và userProfile
import Cookies from "js-cookie"; // Import Cookies
import PropTypes from "prop-types";
import "../../assets/css/TutorBookingRequestsPage.style.css"; // Đảm bảo đường dẫn CSS đúng và đã BEM hóa

// --- HELPER FUNCTIONS ---
const getStatusClass = (currentStatus) => {
  switch (currentStatus?.toUpperCase()) {
    case "REQUEST":
      return "status-request";
    case "APPROVED":
      return "status-approved";
    case "REJECTED":
      return "status-rejected";
    case "CANCEL":
      return "status-cancel";
    case "COMPLETED":
      return "status-completed";
    default:
      return "status-default";
  }
};

const getStatusText = (currentStatus) => {
  switch (currentStatus?.toUpperCase()) {
    case "REQUEST":
      return "Chờ duyệt";
    case "APPROVED":
      return "Đã chấp nhận";
    case "REJECTED":
      return "Đã từ chối";
    case "CANCEL":
      return "Đã hủy"; // Hoặc "Đã hủy bởi người học"
    case "COMPLETED":
      return "Đã hoàn thành";
    default:
      return currentStatus || "Không xác định";
  }
};

// --- BookingRequestCard COMPONENT ---
const BookingRequestCard = ({ request, onUpdateRequestStatus }) => {
  const {
    user,
    dateTimeLearn,
    lessonsPerWeek,
    totalLessons,
    hoursPerLesson,
    startDay,
    totalcoins,
    status,
    createdAt,
    bookingRequestId,
  } = request;

  const getAvatarSrc = (userData) => {
    if (!userData) return "/assets/images/df-male.png"; // Cung cấp đường dẫn mặc định
    if (userData.avatar) return userData.avatar;
    return userData.gender === "FEMALE"
      ? "/assets/images/df-female.png"
      : "/assets/images/df-male.png";
  };

  const formatDateTimeLearn = (dateTimeArray) => {
    if (!Array.isArray(dateTimeArray) || dateTimeArray.length === 0)
      return "Chưa cập nhật";
    return dateTimeArray
      .map((itemStr) => {
        try {
          const item = JSON.parse(itemStr);
          const daysOfWeek = {
            Monday: "Thứ 2",
            Tuesday: "Thứ 3",
            Wednesday: "Thứ 4",
            Thursday: "Thứ 5",
            Friday: "Thứ 6",
            Saturday: "Thứ 7",
            Sunday: "Chủ nhật",
          };
          const dayInVietnamese = daysOfWeek[item.day] || item.day;
          return `${dayInVietnamese}: ${item.times.join(", ")}`;
        } catch (e) {
          console.error("Lỗi parse JSON lịch học:", itemStr, e);
          return "Lịch học lỗi";
        }
      })
      .join("; ");
  };

  const formatDate = (dateString, includeTime = true) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      ...(includeTime && { hour: "2-digit", minute: "2-digit" }), // Thêm giờ phút nếu includeTime là true
    };
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", options);
    } catch (error) {
      console.error("Lỗi định dạng ngày:", dateString, error);
      return "Ngày không hợp lệ";
    }
  };

  const handleAccept = () => {
    onUpdateRequestStatus(bookingRequestId, "APPROVED", null);
  };

  const handleReject = () => {
    const reason = prompt("Nhập lý do từ chối (bỏ trống nếu không có):");
    if (reason !== null) {
      onUpdateRequestStatus(bookingRequestId, "REJECTED", reason || null);
    }
  };

  if (!user) {
    return (
      <div className="brc-card brc-card--error">
        <p>Lỗi: Dữ liệu người học từ yêu cầu này không hợp lệ.</p>
      </div>
    );
  }

  return (
    <div className="brc-card">
      <div className="brc-header">
        <div className="brc-user-info">
          <img
            src={getAvatarSrc(user)}
            alt={user.fullname || "Avatar người học"}
            className="brc-user-info__avatar"
          />
          <div className="brc-user-info__details">
            <p
              className="brc-user-info__name"
              title={user.fullname || "Người học"}
            >
              {user.fullname || "Người học"}
            </p>
            {user.major && (
              <p
                className="brc-user-info__major"
                title={user.major.majorName || "Chưa có thông tin ngành"}
              >
                {user.major.majorName || "Chưa có thông tin ngành"}
              </p>
            )}
          </div>
        </div>
        <div className={`brc-status-badge ${getStatusClass(status)}`}>
          {getStatusText(status)}
        </div>
      </div>
      <div className="brc-body">
        <div className="brc-info-row">
          <span className="brc-info-row__label">
            <i className="fas fa-calendar-alt brc-info-row__icon"></i> Ngày gửi:
          </span>
          <span className="brc-info-row__value">{formatDate(createdAt)}</span>
        </div>
        <div className="brc-info-row">
          <span className="brc-info-row__label">
            <i className="fas fa-calendar-check brc-info-row__icon"></i> Ngày
            bắt đầu:
          </span>
          <span className="brc-info-row__value">
            {startDay ? formatDate(startDay, false) : "N/A"}
          </span>
        </div>
        <div className="brc-info-row">
          <span className="brc-info-row__label">
            <i className="fas fa-clock brc-info-row__icon"></i> Lịch học:
          </span>
          <span className="brc-info-row__value brc-info-row__value--schedule-detail">
            {formatDateTimeLearn(dateTimeLearn)}
          </span>
        </div>
        <div className="brc-info-row">
          <span className="brc-info-row__label">
            <i className="fas fa-calendar-day brc-info-row__icon"></i>{" "}
            Buổi/tuần:
          </span>
          <span className="brc-info-row__value">{lessonsPerWeek}</span>
        </div>
        <div className="brc-info-row">
          <span className="brc-info-row__label">
            <i className="fas fa-layer-group brc-info-row__icon"></i> Tổng buổi:
          </span>
          <span className="brc-info-row__value">{totalLessons}</span>
        </div>
        <div className="brc-info-row">
          <span className="brc-info-row__label">
            <i className="fas fa-hourglass-half brc-info-row__icon"></i> Thời
            lượng/buổi:
          </span>
          <span className="brc-info-row__value">{hoursPerLesson} giờ</span>
        </div>
        <div className="brc-info-row">
          <span className="brc-info-row__label">
            <i className="fas fa-coins brc-info-row__icon"></i> Tổng chi phí:
          </span>
          <span className="brc-info-row__value">
            {totalcoins ? totalcoins.toLocaleString("vi-VN") : 0} xu
          </span>
        </div>
      </div>
      {status && status.toUpperCase() === "REQUEST" && (
        <div className="brc-actions">
          <button
            className="brc-actions__button brc-actions__button--accept"
            onClick={handleAccept}
            aria-label="Chấp nhận yêu cầu"
          >
            <i className="fas fa-check-circle"></i> Chấp nhận
          </button>
          <button
            className="brc-actions__button brc-actions__button--reject"
            onClick={handleReject}
            aria-label="Từ chối yêu cầu"
          >
            <i className="fas fa-times-circle"></i> Từ chối
          </button>
        </div>
      )}
    </div>
  );
};
BookingRequestCard.propTypes = {
  request: PropTypes.shape({
    bookingRequestId: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    tutorId: PropTypes.string.isRequired,
    dateTimeLearn: PropTypes.arrayOf(PropTypes.string).isRequired,
    lessonsPerWeek: PropTypes.number.isRequired,
    totalLessons: PropTypes.number.isRequired,
    hoursPerLesson: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    totalcoins: PropTypes.number,
    startDay: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    noteOfTutor: PropTypes.string,
    isHire: PropTypes.bool,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
    user: PropTypes.shape({
      userId: PropTypes.string.isRequired,
      userDisplayName: PropTypes.string,
      fullname: PropTypes.string,
      avatar: PropTypes.string,
      gender: PropTypes.string,
      majorId: PropTypes.string,
      major: PropTypes.shape({
        majorId: PropTypes.string,
        majorName: PropTypes.string,
      }),
    }).isRequired,
  }).isRequired,
  onUpdateRequestStatus: PropTypes.func.isRequired,
};

// --- TutorBookingRequestsPage COMPONENT ---
const TutorBookingRequestsPage = () => {
  const [bookingRequests, setBookingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false); // Để xử lý loading khi cập nhật
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");

  // Lấy isAuthenticated và userProfile từ Redux để kiểm tra trạng thái UI và điều kiện fetch
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const userProfile = useSelector((state) => state.user.userProfile);
  // Token sẽ được đọc trực tiếp từ Cookies

  const fetchBookingRequests = useCallback(
    async (currentFilterStatus) => {
      const tokenFromCookie = Cookies.get("token"); // Đọc token từ cookies

      if (!isAuthenticated || !tokenFromCookie) {
        setError("Bạn cần đăng nhập để xem thông tin này.");
        setIsLoading(false);
        return;
      }
      // Kiểm tra userProfile để đảm bảo thông tin người dùng (ví dụ: vai trò) đã được tải
      if (!userProfile) {
        setError(
          "Thông tin người dùng chưa được tải. Vui lòng đợi hoặc làm mới trang."
        );
        setIsLoading(false);
        return;
      }
      // Optional: Kiểm tra vai trò ở đây nếu cần
      // const currentUserRole = userProfile?.roleId?.toUpperCase() || userProfile?.userProfile?.roleId?.toUpperCase();
      // if (currentUserRole !== 'TUTOR') {
      //    setError("Bạn không có quyền truy cập trang này.");
      //    setIsLoading(false);
      //    return;
      // }

      if (bookingRequests.length === 0 && !isUpdating)
        setIsLoading(true); // Chỉ loading toàn trang nếu chưa có data
      else setIsUpdating(true); // Nếu có data rồi thì là đang filter hoặc update
      setError(null);

      try {
        let apiUrl = `${
          import.meta.env.VITE_API_URL
        }/booking-request/get-list-booking`;
        if (currentFilterStatus) {
          apiUrl += `?status=${currentFilterStatus}`;
        }

        const response = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${tokenFromCookie}` }, // Sử dụng token từ cookies
        });

        if (response.data && Array.isArray(response.data.items)) {
          setBookingRequests(response.data.items);
        } else if (
          response.data &&
          response.data.items === null &&
          response.data.total === 0
        ) {
          setBookingRequests([]); // Không có yêu cầu nào
        } else {
          console.warn(
            "API response for booking requests was not as expected:",
            response.data
          );
          setBookingRequests([]); // Set rỗng nếu response không đúng dạng
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách yêu cầu:", err);
        let errorMessage = "Không thể tải danh sách yêu cầu. Vui lòng thử lại.";
        if (err.response) {
          errorMessage =
            err.response.data?.message ||
            `Lỗi ${err.response.status}: ${err.response.statusText}`;
        } else if (err.request) {
          errorMessage =
            "Không nhận được phản hồi từ máy chủ. Kiểm tra kết nối mạng.";
        } else {
          errorMessage = err.message;
        }
        setError(errorMessage);
        setBookingRequests([]); // Xóa data cũ nếu có lỗi
      } finally {
        setIsLoading(false);
        setIsUpdating(false);
      }
    },
    [isAuthenticated, userProfile, bookingRequests.length, isUpdating]
  ); // Thêm isUpdating để fetch lại đúng

  useEffect(() => {
    const tokenFromCookie = Cookies.get("token");
    // Chỉ fetch khi đã đăng nhập, có token trong cookie và có profile
    if (isAuthenticated && tokenFromCookie && userProfile) {
      fetchBookingRequests(filterStatus);
    } else if (!isAuthenticated || !tokenFromCookie) {
      setError("Vui lòng đăng nhập để xem danh sách yêu cầu.");
      setIsLoading(false);
    } else if (!userProfile) {
      // Đã auth, có token, nhưng profile chưa load -> hiển thị loading
      setError(null);
      setIsLoading(true);
    }
    // Dependencies là filterStatus, isAuthenticated, userProfile.
    // fetchBookingRequests đã có tokenFromCookie bên trong nó.
  }, [filterStatus, isAuthenticated, userProfile, fetchBookingRequests]);

  const handleActualUpdateStatusAPI = async (requestId, newStatus, note) => {
    const tokenFromCookie = Cookies.get("token"); // Đọc token từ cookies
    if (!tokenFromCookie) {
      // Thông báo cho người dùng bằng toastify thay vì alert
      // import { toast } from 'react-toastify';
      // toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      return;
    }
    setIsUpdating(true);
    try {
      // TODO: Thay thế bằng API call thực tế của bạn
      // Ví dụ:
      // await axios.put(`${import.meta.env.VITE_API_URL}/booking-request/${requestId}/update-status`,
      //   { status: newStatus, noteOfTutor: note },
      //   { headers: { Authorization: `Bearer ${tokenFromCookie}` } }
      // );
      console.log(
        `(GIẢ LẬP API) Cập nhật yêu cầu ${requestId} thành ${newStatus} với ghi chú: ${
          note || "không"
        }`
      );
      await new Promise((resolve) => setTimeout(resolve, 700)); // Giả lập độ trễ API

      // toast.success(`Yêu cầu đã được ${newStatus === 'APPROVED' ? 'chấp nhận' : 'từ chối'}.`);
      alert(
        `Yêu cầu đã được ${
          newStatus === "APPROVED" ? "chấp nhận" : "từ chối"
        }. (Giả lập)`
      );
      fetchBookingRequests(filterStatus); // Tải lại danh sách với filter hiện tại
    } catch (error) {
      console.error("Lỗi API khi cập nhật trạng thái:", error);
      // toast.error("Lỗi cập nhật trạng thái: " + (error.response?.data?.message || error.message));
      alert(
        "Lỗi cập nhật trạng thái: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="tbrp-loading-state">Đang tải dữ liệu yêu cầu...</div>
    );
  }

  // Nếu có lỗi và không có data nào để hiển thị (sau khi đã qua isLoading)
  // Hoặc nếu chưa đăng nhập/chưa có profile (lỗi đã được set trong useEffect)
  if (error && bookingRequests.length === 0 && !isUpdating) {
    return <div className="tbrp-error-state">{error}</div>;
  }

  return (
    <div className="tbrp-container">
      <h2 className="tbrp-title">Yêu Cầu Thuê Gia Sư</h2>
      <div className="tbrp-filter-controls">
        <label htmlFor="statusFilter" className="tbrp-filter-controls__label">
          Lọc theo trạng thái:{" "}
        </label>
        <select
          id="statusFilter"
          value={filterStatus}
          onChange={handleFilterChange}
          className="tbrp-filter-controls__select"
          aria-label="Lọc yêu cầu theo trạng thái"
          disabled={isUpdating || isLoading}
        >
          <option value="">Tất cả</option>
          <option value="REQUEST">Chờ duyệt</option>
          <option value="APPROVED">Đã chấp nhận</option>
          <option value="REJECTED">Đã từ chối</option>
          <option value="CANCEL">Đã hủy bởi người học</option>
          <option value="COMPLETED">Đã hoàn thành</option>
        </select>
      </div>

      {isUpdating && <div className="tbrp-loading-inline">Đang xử lý...</div>}
      {/* Hiển thị lỗi nếu có trong quá trình filter/update nhưng vẫn có data cũ */}
      {error && bookingRequests.length > 0 && (
        <div className="tbrp-error-state tbrp-error-state--inline">{error}</div>
      )}

      {!isUpdating && bookingRequests.length === 0 && !error ? (
        <p className="tbrp-no-requests-message">
          Hiện tại không có yêu cầu thuê nào{" "}
          {filterStatus
            ? `với trạng thái "${getStatusText(filterStatus)}"`
            : ""}
          .
        </p>
      ) : null}

      {bookingRequests.length > 0 && (
        <div className="tbrp-requests-list">
          {bookingRequests.map((request) => (
            <BookingRequestCard
              key={request.bookingRequestId}
              request={request}
              onUpdateRequestStatus={handleActualUpdateStatusAPI}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorBookingRequestsPage;
