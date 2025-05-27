// src/pages/User/TutorBookingRequestsPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import RejectReasonModal from "../../components/User/Modals/RejectReasonModal"; // Đường dẫn tới modal
import "../../assets/css/TutorBookingRequestsPage.style.css"; // Đảm bảo file CSS này tồn tại

// --- HELPER FUNCTIONS ---
const getStatusClass = (currentStatus) => {
  switch (currentStatus?.toUpperCase()) {
    case "REQUEST":
      return "status-request";
    case "ACCEPT":
      return "status-approved";
    case "REFUSE":
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
    case "ACCEPT":
      return "Đã chấp nhận";
    case "REFUSE":
      return "Đã từ chối";
    case "CANCEL":
      return "Đã hủy";
    case "COMPLETED":
      return "Đã hoàn thành";
    default:
      return currentStatus || "Không xác định";
  }
};

// --- BookingRequestCard COMPONENT ---
const BookingRequestCard = ({
  request,
  onUpdateRequestStatus,
  onOpenRejectModal,
}) => {
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
    if (!userData) return "/assets/images/df-male.png";
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
      ...(includeTime && { hour: "2-digit", minute: "2-digit" }),
    };
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", options);
    } catch (error) {
      return "Ngày không hợp lệ";
    }
  };

  // Gọi onUpdateRequestStatus trực tiếp cho ACCEPT
  const handleAccept = () =>
    onUpdateRequestStatus(bookingRequestId, "ACCEPT", null);

  // Gọi onOpenRejectModal cho REFUSE
  const handleReject = () => onOpenRejectModal(bookingRequestId);

  if (!user)
    return (
      <div className="brc-card brc-card--error">
        <p>Lỗi: Dữ liệu người học không hợp lệ.</p>
      </div>
    );

  return (
    <div className="brc-card">
      <div className="brc-header">
        <div className="brc-user-info">
          <img
            src={getAvatarSrc(user)}
            alt={user.fullname || "Avatar"}
            className="brc-user-info__avatar"
          />
          <div className="brc-user-info__details">
            <p className="brc-user-info__name" title={user.fullname}>
              {user.fullname || "Người học"}
            </p>
            {user.major && (
              <p className="brc-user-info__major" title={user.major.majorName}>
                {user.major.majorName || "Chưa có ngành"}
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
          >
            <i className="fas fa-check-circle"></i> Chấp nhận
          </button>
          <button
            className="brc-actions__button brc-actions__button--reject"
            onClick={handleReject}
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
  onOpenRejectModal: PropTypes.func.isRequired, // Thêm prop này
};

// --- Pagination Component ---
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}) => {
  if (totalPages <= 1) return null;
  const pageNumbers = [];
  const maxPagesToShow = 5;
  let startPage, endPage;
  if (totalPages <= maxPagesToShow) {
    startPage = 1;
    endPage = totalPages;
  } else {
    if (currentPage <= Math.ceil(maxPagesToShow / 2)) {
      startPage = 1;
      endPage = maxPagesToShow;
    } else if (currentPage + Math.floor(maxPagesToShow / 2) >= totalPages) {
      startPage = totalPages - maxPagesToShow + 1;
      endPage = totalPages;
    } else {
      startPage = currentPage - Math.floor(maxPagesToShow / 2);
      endPage = currentPage + Math.floor(maxPagesToShow / 2);
    }
  }
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  return (
    <nav className="tbrp-pagination" aria-label="Phân trang">
      <ul className="tbrp-pagination__list">
        <li
          className={`tbrp-pagination__item ${
            currentPage === 1 ? "disabled" : ""
          }`}
        >
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || disabled}
            className="tbrp-pagination__button"
          >
            Trước
          </button>
        </li>
        {startPage > 1 && (
          <>
            <li className="tbrp-pagination__item">
              <button
                onClick={() => onPageChange(1)}
                disabled={disabled}
                className="tbrp-pagination__button"
              >
                1
              </button>
            </li>
            {startPage > 2 && (
              <li className="tbrp-pagination__item tbrp-pagination__item--ellipsis">
                <span className="tbrp-pagination__ellipsis">...</span>
              </li>
            )}
          </>
        )}
        {pageNumbers.map((number) => (
          <li
            key={number}
            className={`tbrp-pagination__item ${
              currentPage === number ? "active" : ""
            }`}
          >
            <button
              onClick={() => onPageChange(number)}
              disabled={currentPage === number || disabled}
              className="tbrp-pagination__button"
            >
              {number}
            </button>
          </li>
        ))}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <li className="tbrp-pagination__item tbrp-pagination__item--ellipsis">
                <span className="tbrp-pagination__ellipsis">...</span>
              </li>
            )}
            <li className="tbrp-pagination__item">
              <button
                onClick={() => onPageChange(totalPages)}
                disabled={disabled}
                className="tbrp-pagination__button"
              >
                {totalPages}
              </button>
            </li>
          </>
        )}
        <li
          className={`tbrp-pagination__item ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || disabled}
            className="tbrp-pagination__button"
          >
            Sau
          </button>
        </li>
      </ul>
    </nav>
  );
};
Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

// --- TutorBookingRequestsPage COMPONENT ---
const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];
const DEFAULT_ITEMS_PER_PAGE = 10;

const TutorBookingRequestsPage = () => {
  const [bookingRequests, setBookingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false); // Dùng chung cho các hành động tốn thời gian (chuyển trang, submit form)
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [historyFilterStatus, setHistoryFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    type: "DESC",
  });

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingRequestId, setRejectingRequestId] = useState(null);
  // Không cần isSubmittingReject nữa, dùng isUpdating chung

  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const userProfile = useSelector((state) => state.user.userProfile);

  const buildQueryString = (page, rpp, sort, filter) => {
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("rpp", rpp.toString());
    queryParams.append("sort", JSON.stringify(sort));
    if (filter && filter.length > 0) {
      queryParams.append("filter", JSON.stringify(filter));
    }
    return queryParams.toString();
  };

  const fetchBookingRequests = useCallback(async () => {
    if (!isAuthenticated || !userProfile) {
      setError(
        isAuthenticated
          ? "Thông tin người dùng chưa tải."
          : "Bạn cần đăng nhập."
      );
      setIsLoading(false);
      setIsUpdating(false);
      return;
    }

    // Nếu là trang 1 (thường là do filter/tab/sort thay đổi), set isLoading
    // Nếu không phải trang 1 (chỉ chuyển trang), set isUpdating
    if (currentPage === 1) setIsLoading(true);
    else setIsUpdating(true);
    setError(null);

    try {
      const filterArray = [];
      if (activeTab === "pending") {
        filterArray.push({
          key: "status",
          operator: "equal",
          value: "REQUEST",
        });
      } else {
        if (historyFilterStatus === "ACCEPT") {
          filterArray.push({
            key: "status",
            operator: "equal",
            value: "ACCEPT",
          });
        } else if (historyFilterStatus === "REFUSE") {
          filterArray.push({
            key: "status",
            operator: "equal",
            value: "REFUSE",
          });
        } else {
          filterArray.push({
            key: "status",
            operator: "equal",
            value: "ACCEPT",
          });
          filterArray.push({
            key: "status",
            operator: "equal",
            value: "REFUSE",
          });
        }
      }

      const currentSortArray = [{ key: sortConfig.key, type: sortConfig.type }];
      const queryString = buildQueryString(
        currentPage,
        itemsPerPage,
        currentSortArray,
        filterArray
      );
      const endpointWithQuery = `/booking-request/get-list-booking?${queryString}`;

      const response = await Api({
        endpoint: endpointWithQuery,
        method: METHOD_TYPE.GET,
        requireToken: true,
      });

      if (response.success && response.data) {
        setBookingRequests(
          Array.isArray(response.data.items) ? response.data.items : []
        );
        setTotalPages(Math.ceil((response.data.total || 0) / itemsPerPage));
      } else {
        setBookingRequests([]);
        setTotalPages(0);
        if (!response.success)
          setError(response.message || "Không thể tải dữ liệu.");
      }
    } catch (err) {
      setError(
        err.message || err.response?.data?.message || "Lỗi tải danh sách."
      );
      setBookingRequests([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
      setIsUpdating(false);
    }
  }, [
    isAuthenticated,
    userProfile,
    currentPage,
    activeTab,
    historyFilterStatus,
    sortConfig,
    itemsPerPage,
  ]);

  useEffect(() => {
    if (isAuthenticated && userProfile) {
      fetchBookingRequests();
    } else if (!isAuthenticated) {
      setError("Vui lòng đăng nhập.");
      setIsLoading(false);
      setIsUpdating(false);
    } else if (!userProfile) {
      setError(null);
      setIsLoading(true);
      setIsUpdating(false);
    }
  }, [isAuthenticated, userProfile, fetchBookingRequests]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setHistoryFilterStatus("");
  };
  const handleHistoryFilterChange = (e) => {
    setHistoryFilterStatus(e.target.value);
    setCurrentPage(1);
  };
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };
  const handleSortChange = (e) => {
    const [key, type] = e.target.value.split("_");
    if (key && type) {
      setSortConfig({ key, type });
      setCurrentPage(1);
    }
  };
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage)
      setCurrentPage(newPage);
  };

  const handleOpenRejectModal = (requestId) => {
    setRejectingRequestId(requestId);
    setIsRejectModalOpen(true);
  };
  const handleCloseRejectModal = () => {
    setIsRejectModalOpen(false);
    setRejectingRequestId(null);
  };

  const handleActualUpdateStatusAPI = async (
    requestId,
    clickAction,
    noteOfTutor
  ) => {
    if (!isAuthenticated) {
      alert("Bạn cần đăng nhập.");
      return;
    }

    setIsUpdating(true); // Dùng chung isUpdating
    let success = false;

    try {
      const payload = { click: clickAction };
      if (clickAction === "REFUSE") {
        // Chỉ thêm noteOfTutor nếu là REFUSE
        payload.noteOfTutor = noteOfTutor; // noteOfTutor này từ modal
      }

      const response = await Api({
        endpoint: `booking-request/solve-booking/${requestId}`,
        method: METHOD_TYPE.PATCH,
        data: payload,
        requireToken: true,
      });

      if (response.success) {
        alert(
          `Yêu cầu đã được ${
            clickAction === "ACCEPT" ? "chấp nhận" : "từ chối"
          }.`
        );
        success = true;
      } else {
        alert(
          "Lỗi cập nhật trạng thái: " + (response.message || "Lỗi từ server")
        );
      }
    } catch (error) {
      alert(
        "Lỗi cập nhật trạng thái: " +
          (error.message || error.response?.data?.message || "Lỗi không rõ")
      );
    } finally {
      // Chỉ fetch lại nếu thành công để tránh fetch lại khi API lỗi
      if (success) {
        fetchBookingRequests(); // fetchBookingRequests sẽ tự set lại isLoading/isUpdating
      } else {
        setIsUpdating(false); // Nếu không thành công, tự reset isUpdating
      }
      if (clickAction === "REFUSE") {
        handleCloseRejectModal(); // Đóng modal dù thành công hay thất bại (sau khi alert)
      }
    }
  };

  const handleSubmitRejectReason = (reason) => {
    // Hàm này được gọi từ Modal
    if (rejectingRequestId) {
      handleActualUpdateStatusAPI(rejectingRequestId, "REFUSE", reason);
    }
  };

  if (isLoading)
    return <div className="tbrp-loading-state">Đang tải dữ liệu...</div>;
  if (error && bookingRequests.length === 0 && !isUpdating)
    return <div className="tbrp-error-state">{error}</div>;

  return (
    <div className="tbrp-container">
      <h2 className="tbrp-title">Quản Lý Yêu Cầu Thuê</h2>
      <div className="tbrp-tabs">
        <button
          className={`tbrp-tab-button ${
            activeTab === "pending" ? "active" : ""
          }`}
          onClick={() => handleTabChange("pending")}
          disabled={isUpdating || isLoading}
        >
          Yêu Cầu Chờ Duyệt
        </button>
        <button
          className={`tbrp-tab-button ${
            activeTab === "history" ? "active" : ""
          }`}
          onClick={() => handleTabChange("history")}
          disabled={isUpdating || isLoading}
        >
          Lịch Sử Yêu Cầu
        </button>
      </div>
      <div className="tbrp-controls-bar">
        {activeTab === "history" && (
          <div className="tbrp-filter-controls">
            <label
              htmlFor="historyStatusFilter"
              className="tbrp-filter-controls__label"
            >
              Trạng thái (Lịch sử):
            </label>
            <select
              id="historyStatusFilter"
              value={historyFilterStatus}
              onChange={handleHistoryFilterChange}
              className="tbrp-filter-controls__select"
              disabled={isUpdating || isLoading}
            >
              <option value="REFUSE">Đã từ chối</option>
              <option value="ACCEPT">Đã chấp nhận</option>
            </select>
          </div>
        )}
        <div className="tbrp-sort-controls">
          <label htmlFor="sortFilter" className="tbrp-sort-controls__label">
            Sắp xếp:
          </label>
          <select
            id="sortFilter"
            value={`${sortConfig.key}_${sortConfig.type}`}
            onChange={handleSortChange}
            className="tbrp-sort-controls__select"
            disabled={isUpdating || isLoading}
          >
            <option value="createdAt_DESC">Ngày gửi (Mới nhất)</option>
            <option value="createdAt_ASC">Ngày gửi (Cũ nhất)</option>
          </select>
        </div>
        <div className="tbrp-rpp-controls">
          <label htmlFor="itemsPerPage" className="tbrp-rpp-controls__label">
            Hiển thị:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="tbrp-rpp-controls__select"
            disabled={isUpdating || isLoading}
          >
            {ITEMS_PER_PAGE_OPTIONS.map((num) => (
              <option key={num} value={num}>
                {num} / trang
              </option>
            ))}
          </select>
        </div>
      </div>

      {isUpdating && !isLoading && (
        <div className="tbrp-loading-inline">Đang xử lý...</div>
      )}
      {error && bookingRequests.length > 0 && (
        <div className="tbrp-error-state tbrp-error-state--inline">{error}</div>
      )}

      {!isLoading && !isUpdating && bookingRequests.length === 0 && !error ? (
        <p className="tbrp-no-requests-message">
          Không có yêu cầu nào{" "}
          {activeTab === "pending"
            ? "đang chờ duyệt"
            : historyFilterStatus
            ? `khớp với trạng thái "${getStatusText(historyFilterStatus)}"`
            : "trong lịch sử"}
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
              onOpenRejectModal={handleOpenRejectModal}
            />
          ))}
        </div>
      )}

      {totalPages > 0 && !isLoading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          disabled={isUpdating || isLoading}
        />
      )}

      <RejectReasonModal
        isOpen={isRejectModalOpen}
        onClose={handleCloseRejectModal}
        onSubmitReason={handleSubmitRejectReason}
        isSubmitting={isUpdating} // Dùng chung isUpdating cho modal
      />
    </div>
  );
};
export default TutorBookingRequestsPage;
