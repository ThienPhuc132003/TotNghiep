/* eslint-disable no-undef */
import React, { useCallback, useEffect, useState, useMemo } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css"; // Shared styles
import "../../assets/css/Modal.style.css"; // Modal styles
import Table from "../../components/Table";
import SearchBar from "../../components/SearchBar";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import FormDetail from "../../components/FormDetail";
import TutorLevelList from "../../components/Static_Data/TutorLevelList";
import Modal from "react-modal";
import { Alert } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format, parseISO, isValid } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
// qs không cần thiết nữa nếu Api class tự xử lý
// import qs from "qs";

Modal.setAppElement("#root");

// --- Helper Functions (Giữ nguyên các helper functions đã có) ---
const getSafeNestedValue = (obj, path, defaultValue = "N/A") => {
  if (!obj || !path) return defaultValue;
  const value = path
    .split(".")
    .reduce(
      (acc, part) => (acc && typeof acc === "object" ? acc[part] : undefined),
      obj
    );
  return value !== undefined && value !== null ? value : defaultValue;
};

const formatStatus = (status) => {
  switch (status) {
    case "REQUEST":
      return <span className="status status-pending">Chờ duyệt</span>;
    case "ACCEPT":
      return <span className="status status-active">Đã duyệt</span>;
    case "REFUSE":
      return <span className="status status-failed">Từ chối</span>;
    case "CANCEL":
      return <span className="status status-inactive">Đã hủy</span>;
    default:
      return (
        <span className="status status-unknown">{status || "Không rõ"}</span>
      );
  }
};

const safeFormatDate = (dateInput, formatString = "dd/MM/yyyy HH:mm") => {
  if (!dateInput) return "Không có";
  try {
    const date =
      typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    return isValid(date) ? format(date, formatString) : "Ngày không hợp lệ";
  } catch (e) {
    return "Lỗi ngày";
  }
};

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const formatDateTimeLearn = (dateTimeLearnArray) => {
  if (!Array.isArray(dateTimeLearnArray) || dateTimeLearnArray.length === 0)
    return "Không có";
  try {
    const parsed = dateTimeLearnArray
      .map((jsonString) => {
        try {
          return JSON.parse(jsonString);
        } catch {
          return null;
        }
      })
      .filter((item) => item && item.day && Array.isArray(item.times));
    if (parsed.length === 0) return "Không có";
    return (
      <ul style={{ paddingLeft: "1.2em", margin: 0, listStyleType: "none" }}>
        {parsed.map((item, index) => {
          const dayIndex = daysOfWeek.indexOf(item.day);
          const dayLabel =
            dayIndex === 6
              ? "CN"
              : dayIndex !== -1
              ? `Thứ ${dayIndex + 2}`
              : item.day;
          return (
            <li key={index}>
              <strong>{dayLabel}</strong>: {item.times.join(", ")}
            </li>
          );
        })}
      </ul>
    );
  } catch (e) {
    return "Lỗi định dạng";
  }
};

const renderEvidenceLink = (url) => {
  if (!url) return "Không có";
  if (
    typeof url === "string" &&
    (url.startsWith("http") ||
      url.startsWith("blob:") ||
      url.startsWith("www."))
  ) {
    const properUrl = url.startsWith("www.") ? `http://${url}` : url;
    return (
      <a
        href={properUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#007bff", textDecoration: "underline" }}
      >
        Xem file
      </a>
    );
  }
  return (
    <span title={url}>
      {String(url).substring(0, 30)}
      {String(url).length > 30 ? "..." : ""}
    </span>
  );
};

// --- End Helper Functions ---

// Status Filter Options
const statusFilterOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "REQUEST", label: "Chờ duyệt" },
  { value: "ACCEPT", label: "Đã duyệt" },
  { value: "REFUSE", label: "Từ chối" },
  { value: "CANCEL", label: "Đã hủy" },
];

// Searchable Columns for Tutor Requests
const searchableRequestColumnOptions = [
  { value: "tutorRequestId", label: "ID Yêu cầu" },
  { value: "fullname", label: "Họ và Tên" },
  { value: "emailOfTutor", label: "Email" }, // Sử dụng emailOfTutor từ data API
  { value: "univercity", label: "Trường Đại học" },
  { value: "totalTestPoints", label: "Điểm Test" },
  { value: "GPA", label: "GPA" },
  { value: "createdAt", label: "Ngày tạo", placeholderSuffix: " (YYYY-MM-DD)" },
];

const ListOfRequestPage = () => {
  // --- States ---
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [searchInput, setSearchInput] = useState("");
  const [selectedSearchField, setSelectedSearchField] = useState(
    searchableRequestColumnOptions[0].value // Mặc định cột đầu tiên
  );
  const [appliedSearchInput, setAppliedSearchInput] = useState("");
  const [appliedSearchField, setAppliedSearchField] = useState(
    searchableRequestColumnOptions[0].value
  );

  const [selectedStatusFilter, setSelectedStatusFilter] = useState("REQUEST");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState(null);
  const [selectedLevelId, setSelectedLevelId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSolvingRequest, setIsSolvingRequest] = useState(false);
  const [error, setError] = useState(null);

  const currentPath = "/quan-ly-yeu-cau";

  // --- Reset State ---
  const resetState = useCallback(() => {
    setSearchInput("");
    setSelectedSearchField(searchableRequestColumnOptions[0].value);
    setAppliedSearchInput("");
    setAppliedSearchField(searchableRequestColumnOptions[0].value);
    setSelectedStatusFilter("REQUEST");
    setSortConfig({ key: "createdAt", direction: "desc" });
    setCurrentPage(0);
  }, []);

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filterConditions = [];
      if (selectedStatusFilter) {
        filterConditions.push({
          key: "status",
          operator: "equal",
          value: selectedStatusFilter,
        });
      }
      // Sử dụng appliedSearchInput và appliedSearchField
      if (appliedSearchInput && appliedSearchField) {
        filterConditions.push({
          key: appliedSearchField,
          operator: "like", // Hoặc 'equal' cho ID/ngày nếu backend hỗ trợ chính xác
          value: appliedSearchInput,
        });
      }

      const query = {
        rpp: itemsPerPage,
        page: currentPage + 1,
        ...(filterConditions.length > 0 && {
          filter: JSON.stringify(filterConditions),
        }),
        sort: JSON.stringify([
          { key: sortConfig.key, type: sortConfig.direction.toUpperCase() },
        ]),
      };

      console.log("Fetching requests with query:", query);
      const response = await Api({
        endpoint: `tutor-request/search-request`, // Bỏ queryString, truyền query object
        method: METHOD_TYPE.GET,
        query: query, // Truyền object query
      });
      console.log("API Response:", response);

      if (response.success && response.data) {
        setData(response.data.items || []);
        setTotalItems(response.data.total || 0);
        setPageCount(Math.ceil((response.data.total || 0) / itemsPerPage));
      } else {
        throw new Error(response.message || "Lỗi tải dữ liệu yêu cầu.");
      }
    } catch (errorCatch) {
      console.error("Fetch data error:", errorCatch);
      const errorMessage = errorCatch.message || "Lỗi tải dữ liệu yêu cầu.";
      setError(errorMessage);
      setData([]);
      setTotalItems(0);
      setPageCount(1);
      toast.error(`Tải dữ liệu thất bại: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    sortConfig,
    selectedStatusFilter,
    appliedSearchInput,
    appliedSearchField,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handlers ---
  const handlePageClick = (event) => {
    if (typeof event.selected === "number") setCurrentPage(event.selected);
  };

  const handleSort = (sortKey) => {
    setSortConfig((prev) => ({
      key: sortKey,
      direction:
        prev.key === sortKey && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(0);
  };

  const handleItemsPerPageChange = (newPageSize) => {
    setItemsPerPage(newPageSize);
    setCurrentPage(0);
  };

  const handleSearchInputChange = (value) => {
    setSearchInput(value);
  };

  const handleSearchFieldChange = (event) => {
    setSelectedSearchField(event.target.value);
  };

  const handleApplySearch = () => {
    // Chỉ áp dụng nếu có input hoặc field thay đổi
    if (searchInput.trim() || selectedSearchField !== appliedSearchField) {
      if (searchInput.trim()) {
        setAppliedSearchField(selectedSearchField);
        setAppliedSearchInput(searchInput);
      } else {
        // Nếu input trống, nhưng field thay đổi -> áp dụng field mới, xóa input
        setAppliedSearchField(selectedSearchField);
        setAppliedSearchInput("");
      }
    } else if (!searchInput.trim() && appliedSearchInput) {
      // Nếu input bị xóa rỗng, và trước đó có tìm kiếm -> xóa điều kiện tìm kiếm
      setAppliedSearchInput("");
    }
    setCurrentPage(0);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") handleApplySearch();
  };

  const handleStatusFilterChange = (event) => {
    setSelectedStatusFilter(event.target.value);
    setCurrentPage(0);
  };

  // --- Modal Handlers (giữ nguyên) ---
  const handleView = (request) => {
    setModalData(request);
    setIsDetailModalOpen(true);
  };
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setModalData(null);
  };
  const handleApproveClick = (request) => {
    setRequestToApprove(request);
    setSelectedLevelId("");
    setIsApprovalModalOpen(true);
  };
  const handleCloseApprovalModal = () => {
    setIsApprovalModalOpen(false);
    setRequestToApprove(null);
    setSelectedLevelId("");
  };
  const handleLevelSelect = (name, value) => {
    setSelectedLevelId(value);
  };

  // --- Action Handlers (Approve/Reject) (giữ nguyên) ---
  const handleConfirmApprove = async () => {
    if (!requestToApprove || !selectedLevelId) {
      toast.warn("Vui lòng chọn hạng gia sư.");
      return;
    }
    const requestId = requestToApprove.tutorRequestId;
    setIsSolvingRequest(true);
    try {
      const response = await Api({
        endpoint: `tutor-request/solve-request/${requestId}`,
        method: METHOD_TYPE.POST,
        data: { click: "ACCEPT", tutorLevelId: selectedLevelId },
      });
      if (response.success) {
        toast.success("Duyệt yêu cầu thành công!");
        fetchData();
        handleCloseApprovalModal();
      } else {
        throw new Error(response.message || "Duyệt yêu cầu thất bại");
      }
    } catch (errorCatch) {
      toast.error(`Duyệt thất bại: ${errorCatch.message}`);
    } finally {
      setIsSolvingRequest(false);
    }
  };

  const handleRejectClick = async (request) => {
    if (!request || !request.tutorRequestId) return;
    const tutorName = request.fullname || request.tutorRequestId;
    if (window.confirm(`Bạn chắc muốn từ chối yêu cầu của ${tutorName}?`)) {
      const requestId = request.tutorRequestId;
      setIsSolvingRequest(true);
      try {
        const response = await Api({
          endpoint: `tutor-request/solve-request/${requestId}`,
          method: METHOD_TYPE.POST,
          data: { click: "REFUSE" },
        });
        if (response.success) {
          toast.success("Từ chối yêu cầu thành công!");
          fetchData();
        } else {
          throw new Error(response.message || "Từ chối yêu cầu thất bại");
        }
      } catch (errorCatch) {
        toast.error(`Từ chối thất bại: ${errorCatch.message}`);
      } finally {
        setIsSolvingRequest(false);
      }
    }
  };

  // --- Table Columns Definition ---
  const columns = useMemo(
    () => [
      { title: "ID YC", dataKey: "tutorRequestId", sortable: true }, // Sửa title
      { title: "Họ và Tên", dataKey: "fullname", sortable: true },
      { title: "Email", dataKey: "emailOfTutor", sortable: true }, // emailOfTutor là key đúng
      { title: "Trường ĐH", dataKey: "univercity", sortable: true },
      {
        title: "Điểm Test",
        dataKey: "totalTestPoints",
        renderCell: (p) => (p !== null && p !== undefined ? p : "Chưa có"),
        sortable: true,
      },
      { title: "GPA", dataKey: "GPA", sortable: true },
      {
        title: "Trạng thái",
        dataKey: "status",
        renderCell: formatStatus,
        sortable: true,
      },
      {
        title: "Ngày tạo",
        dataKey: "createdAt",
        sortable: true,
        renderCell: (v) => safeFormatDate(v, "dd/MM/yy HH:mm"),
      },
    ],
    []
  );

  // --- Fields for Detail View Modal (giữ nguyên) ---
  const viewFields = useMemo(
    () => [
      { key: "tutorRequestId", label: "ID Yêu cầu" },
      { key: "status", label: "Trạng thái", renderValue: formatStatus },
      { key: "fullname", label: "Họ và Tên" },
      {
        key: "birthday",
        label: "Ngày sinh",
        renderValue: (v) => safeFormatDate(v, "dd/MM/yyyy"),
      },
      {
        key: "gender",
        label: "Giới tính",
        renderValue: (v) =>
          v === "MALE" ? "Nam" : v === "FEMALE" ? "Nữ" : "Không có",
      },
      { key: "univercity", label: "Trường Đại học" },
      {
        key: "major.majorName",
        label: "Chuyên ngành",
        renderValue: (v, row) => getSafeNestedValue(row, "major.majorName"),
      },
      { key: "GPA", label: "Điểm GPA" },
      {
        key: "evidenceOfGPA",
        label: "Minh chứng GPA",
        renderValue: renderEvidenceLink,
      },
      {
        key: "subject.subjectName",
        label: "Môn học 1",
        renderValue: (v, row) => getSafeNestedValue(row, "subject.subjectName"),
      },
      { key: "descriptionOfSubject", label: "Mô tả môn 1" },
      {
        key: "evidenceOfSubject",
        label: "Minh chứng môn 1",
        renderValue: renderEvidenceLink,
      },
      {
        key: "subject2.subjectName",
        label: "Môn học 2",
        renderValue: (v, row) =>
          getSafeNestedValue(row, "subject2.subjectName"),
      },
      { key: "descriptionOfSubject2", label: "Mô tả môn 2" },
      {
        key: "evidenceOfSubject2",
        label: "Minh chứng môn 2",
        renderValue: renderEvidenceLink,
      },
      {
        key: "subject3.subjectName",
        label: "Môn học 3",
        renderValue: (v, row) =>
          getSafeNestedValue(row, "subject3.subjectName"),
      },
      { key: "descriptionOfSubject3", label: "Mô tả môn 3" },
      {
        key: "evidenceOfSubject3",
        label: "Minh chứng môn 3",
        renderValue: renderEvidenceLink,
      },
      { key: "description", label: "Giới thiệu bản thân" },
      {
        key: "teachingTime",
        label: "Thời gian/tiết",
        renderValue: (t) =>
          t ? `${parseFloat(t).toFixed(1)} giờ` : "Không có",
      },
      {
        key: "teachingMethod",
        label: "Phương thức dạy",
        renderValue: (v) =>
          v === "ONLINE"
            ? "Trực tuyến"
            : v === "OFFLINE"
            ? "Tại nhà"
            : v === "BOTH"
            ? "Cả hai"
            : "Không có",
      },
      { key: "teachingPlace", label: "Khu vực dạy Offline" },
      {
        key: "isUseCurriculumn",
        label: "Giáo trình riêng",
        renderValue: (v) =>
          typeof v === "boolean" ? (v ? "Có" : "Không") : "Không có",
      },
      {
        key: "videoUrl",
        label: "Video giới thiệu",
        renderValue: renderEvidenceLink,
      },
      { key: "bankName", label: "Ngân hàng" },
      { key: "bankNumber", label: "Số tài khoản" },
      {
        key: "dateTimeLearn",
        label: "Lịch rảnh",
        renderValue: formatDateTimeLearn,
      },
      {
        key: "tutorLevel.levelName",
        label: "Cấp độ gia sư (nếu đã duyệt)",
        renderValue: (v, row) =>
          getSafeNestedValue(row, "tutorLevel.levelName", "Chưa có"),
      },
      {
        key: "totalTestPoints",
        label: "Điểm test",
        renderValue: (p) => (p !== null && p !== undefined ? p : "Chưa có"),
      },
      {
        key: "createdAt",
        label: "Ngày tạo",
        renderValue: (d) => safeFormatDate(d),
      },
      {
        key: "updatedAt",
        label: "Cập nhật",
        renderValue: (d) => (d ? safeFormatDate(d) : "Chưa cập nhật"),
      },
    ],
    []
  );

  // --- JSX Render ---
  const currentSearchFieldConfig = useMemo(
    () =>
      searchableRequestColumnOptions.find(
        (opt) => opt.value === selectedSearchField
      ),
    [selectedSearchField]
  );
  const searchPlaceholder = currentSearchFieldConfig
    ? `Nhập ${currentSearchFieldConfig.label.toLowerCase()}${
        currentSearchFieldConfig.placeholderSuffix || ""
      }...`
    : "Nhập tìm kiếm...";

  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        <h2 className="admin-list-title">Quản lý Yêu cầu Làm Gia sư</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            {/* Select chọn cột tìm kiếm */}
            <div className="filter-control">
              <select
                id="searchFieldSelectRequest"
                value={selectedSearchField}
                onChange={handleSearchFieldChange}
                className="status-filter-select"
                aria-label="Chọn trường để tìm kiếm"
              >
                {searchableRequestColumnOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <SearchBar
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchKeyPress}
              placeholder={searchPlaceholder}
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
            />
            {/* Filter Trạng thái */}
            <div className="filter-control">
              <label htmlFor="statusFilter" className="filter-label">
                Lọc:
              </label>
              <select
                id="statusFilter"
                value={selectedStatusFilter}
                onChange={handleStatusFilterChange}
                className="status-filter-select"
              >
                {statusFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="refresh-button"
              onClick={handleApplySearch}
              title="Tìm kiếm"
              aria-label="Tìm kiếm"
              disabled={isLoading || isSolvingRequest}
            >
              <i className="fa-solid fa-search"></i>
            </button>
            <button
              className="refresh-button"
              onClick={resetState}
              title="Làm mới bộ lọc & tìm kiếm"
              aria-label="Làm mới bộ lọc và tìm kiếm"
              disabled={isLoading || isSolvingRequest}
            >
              <i className="fa-solid fa-rotate-left"></i>
            </button>
          </div>
          <div className="filter-add-admin"></div> {/* No Add button */}
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Table
          columns={columns}
          data={data}
          totalItems={totalItems}
          onView={handleView}
          onApprove={handleApproveClick}
          onReject={handleRejectClick}
          showLock={false} // Không có nút Khóa/Mở khóa ở đây
          statusKey="status" // Key để xác định có hiển thị nút Approve/Reject không
          pageCount={pageCount}
          onPageChange={handlePageClick}
          forcePage={currentPage}
          onSort={handleSort}
          currentSortConfig={sortConfig}
          loading={isLoading || isSolvingRequest}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />

        {!isLoading && !error && data.length > 0 && (
          <p
            style={{
              textAlign: "right",
              marginTop: "1rem",
              fontSize: "0.9em",
              color: "#555",
            }}
          >
            Tổng số yêu cầu: {totalItems}
          </p>
        )}
        {!isLoading && !error && data.length === 0 && totalItems === 0 && (
          <p
            style={{
              textAlign: "center",
              marginTop: "2rem",
              fontSize: "1em",
              color: "#777",
            }}
          >
            Không có dữ liệu yêu cầu.
          </p>
        )}
      </div>
    </>
  );

  return (
    <AdminDashboardLayout
      currentPath={currentPath}
      childrenMiddleContentLower={childrenMiddleContentLower}
    >
      {/* Detail View Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onRequestClose={handleCloseDetailModal}
        contentLabel="Chi tiết Yêu cầu"
        className="modal large"
        overlayClassName="overlay"
        closeTimeoutMS={300}
      >
        {modalData && (
          <FormDetail
            formData={modalData}
            fields={viewFields}
            mode="view"
            title="Chi tiết Yêu cầu"
            onClose={handleCloseDetailModal}
            avatarUrl={modalData?.avatar} // Giả sử có trường avatar trong modalData
          />
        )}
      </Modal>

      {/* Approval Modal */}
      <Modal
        isOpen={isApprovalModalOpen}
        onRequestClose={handleCloseApprovalModal}
        contentLabel="Duyệt Yêu Cầu"
        className="modal medium"
        overlayClassName="overlay"
        closeTimeoutMS={300}
      >
        {requestToApprove && (
          <div className="approval-modal-content">
            <div className="form-detail-header">
              <h2>Duyệt Yêu Cầu: {requestToApprove.tutorRequestId}</h2>
              <button
                className="form-detail-close-button"
                onClick={handleCloseApprovalModal}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>
            <div className="form-content" style={{ padding: "20px" }}>
              <p>
                Gia sư: <strong>{requestToApprove.fullname}</strong>
              </p>
              <div className="form-detail-group">
                <label
                  htmlFor="tutorLevelApproval"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Chọn Hạng Gia Sư:
                  <span
                    className="required-asterisk"
                    style={{ color: "red", marginLeft: "4px" }}
                  >
                    *
                  </span>
                </label>
                <TutorLevelList
                  name="tutorLevelApproval"
                  value={selectedLevelId}
                  onChange={handleLevelSelect}
                  required={true}
                  placeholder="-- Chọn hạng --"
                  // style cho select nếu cần
                />
              </div>
              <div
                className="form-detail-actions"
                style={{ marginTop: "25px" }}
              >
                <button
                  className="form-detail-cancel-button"
                  onClick={handleCloseApprovalModal}
                  disabled={isSolvingRequest}
                >
                  Hủy
                </button>
                <button
                  className="form-detail-save-button"
                  onClick={handleConfirmApprove}
                  disabled={!selectedLevelId || isSolvingRequest}
                >
                  {isSolvingRequest ? (
                    <>
                      <FontAwesomeIcon
                        icon={faSpinner}
                        spin
                        style={{ marginRight: "8px" }}
                      />{" "}
                      Đang xử lý...
                    </>
                  ) : (
                    "Xác nhận Duyệt"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </AdminDashboardLayout>
  );
};

const ListOfRequest = React.memo(ListOfRequestPage);
export default ListOfRequest;
