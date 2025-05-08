/* eslint-disable no-undef */
import React, { useCallback, useEffect, useState, useMemo } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css"; // Shared styles
import "../../assets/css/Modal.style.css"; // Modal styles
// import "../../assets/css/Admin/ListOfRequest.style.css"; // Uncomment if specific styles are needed
import Table from "../../components/Table";
import SearchBar from "../../components/SearchBar";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import FormDetail from "../../components/FormDetail";
import TutorLevelList from "../../components/Static_Data/TutorLevelList";
import Modal from "react-modal";
import { Alert } from "@mui/material";
// Removed unidecode as filtering is now server-side
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format, parseISO, isValid } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import qs from "qs";

Modal.setAppElement("#root");

// Helper lấy giá trị lồng nhau an toàn
const getSafeNestedValue = (obj, path, defaultValue = "N/A") => {
  if (!obj || !path) return defaultValue;
  const value = path
    .split(".")
    .reduce(
      (acc, part) => (acc && typeof acc === "object" ? acc[part] : undefined),
      obj
    ); // Thêm kiểm tra typeof acc
  return value !== undefined && value !== null ? value : defaultValue;
};

// Helper function to format status
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

// Helper định dạng ngày an toàn hơn
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

// Helper function to parse and format dateTimeLearn (Improved Safety)
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
      <ul
        className="datetime-list"
        style={{ paddingLeft: "1.2em", margin: 0, listStyleType: "none" }}
      >
        {" "}
        {/* Style cơ bản */}
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
    console.error("Error processing dateTimeLearn:", e);
    return "Lỗi định dạng";
  }
};

// Helper to generate link for evidence
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
        className="evidence-link"
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

// Status Filter Options
const statusFilterOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "REQUEST", label: "Chờ duyệt" },
  { value: "ACCEPT", label: "Đã duyệt" },
  { value: "REFUSE", label: "Từ chối" },
  { value: "CANCEL", label: "Đã hủy" },
];

const ListOfRequestPage = () => {
  // --- States ---
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSolvingRequest, setIsSolvingRequest] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const currentPath = "/quan-ly-yeu-cau"; // Khai báo ở đây là đúng
  const [pageCount, setPageCount] = useState(1);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("REQUEST");
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState(null);
  const [selectedLevelId, setSelectedLevelId] = useState("");

  // --- Reset State ---
  const resetState = () => {
    setSearchInput("");
    setSearchQuery("");
    setSelectedStatusFilter("REQUEST");
    setSortConfig({ key: "createdAt", direction: "desc" });
    setCurrentPage(0);
  };

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
      if (searchQuery) {
        filterConditions.push({
          key: "tutorRequestId,fullname,gmail,univercity,major.majorName",
          operator: "like",
          value: searchQuery,
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

      const queryString = qs.stringify(query, { encode: false });
      console.log("Fetching requests with query:", queryString);

      const response = await Api({
        endpoint: `tutor-request/search-request?${queryString}`,
        method: METHOD_TYPE.GET,
      });
      console.log("API Response:", response);

      if (response.success && response.data) {
        // ****** ĐÃ SỬA LỖI Ở ĐÂY ******
        setData(response.data.items || []);
        // ****** KẾT THÚC SỬA LỖI ******
        setTotalItems(response.data.total || 0);
        setPageCount(Math.ceil((response.data.total || 0) / itemsPerPage));
      } else {
        throw new Error(response.message || "Lỗi tải dữ liệu yêu cầu.");
      }
    } catch (error) {
      console.error("Fetch data error:", error);
      setError(error.message || "Lỗi tải dữ liệu yêu cầu.");
      setData([]);
      setTotalItems(0);
      setPageCount(1);
      toast.error(`Tải dữ liệu thất bại: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    sortConfig,
    selectedStatusFilter,
    searchQuery,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handlers ---
  const handlePageClick = (event) => {
    if (typeof event.selected === "number") {
      setCurrentPage(event.selected);
    }
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

  const handleApplySearch = () => {
    setCurrentPage(0);
    setSearchQuery(searchInput);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleApplySearch();
    }
  };

  const handleStatusFilterChange = (event) => {
    setSelectedStatusFilter(event.target.value);
    setCurrentPage(0);
  };

  // --- Modal Handlers ---
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

  // --- Action Handlers (Approve/Reject) ---
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
        method: METHOD_TYPE.POST, // Assuming PUT for update
        data: { click: "ACCEPT", tutorLevelId: selectedLevelId },
      });
      if (response.success) {
        toast.success("Duyệt yêu cầu thành công!");
        fetchData();
        handleCloseApprovalModal();
      } else {
        throw new Error(response.message || "Duyệt yêu cầu thất bại");
      }
    } catch (error) {
      toast.error(`Duyệt thất bại: ${error.message}`);
      console.error("Approve error:", error);
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
          method: METHOD_TYPE.POST, // Assuming PUT for update
          data: { click: "REFUSE" },
        });
        if (response.success) {
          toast.success("Từ chối yêu cầu thành công!");
          fetchData();
        } else {
          throw new Error(response.message || "Từ chối yêu cầu thất bại");
        }
      } catch (error) {
        toast.error(`Từ chối thất bại: ${error.message}`);
        console.error("Reject error:", error);
      } finally {
        setIsSolvingRequest(false);
      }
    }
  };

  // --- Table Columns Definition ---
  const columns = useMemo(
    () => [
      { title: "ID", dataKey: "tutorRequestId", sortable: true },
      { title: "Họ và Tên", dataKey: "fullname", sortable: true },
      { title: "Email", dataKey: "gmail", sortable: true },
      { title: "Trường ĐH", dataKey: "univercity", sortable: true },
      {
        title: "Chuyên ngành",
        dataKey: "major.majorName",
        sortKey: "major.majorName",
        sortable: true,
        renderCell: (_, row) =>
          getSafeNestedValue(row, "major.majorName", "N/A"),
      },
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

  // --- Fields for Detail View Modal ---
  const viewFields = useMemo(
    () => [
      { key: "tutorRequestId", label: "ID Yêu cầu" },
      { key: "userId", label: "UserID" },
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
        label: "Cấp độ gia sư",
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
  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        <h2 className="admin-list-title">Quản lý Yêu cầu Làm Gia sư</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            <SearchBar
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchKeyPress}
              placeholder="Tìm ID, Tên, Trường, Ngành..." // Bỏ Trạng thái vì đã có filter riêng
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
            />
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
                    {" "}
                    {option.label}{" "}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="refresh-button"
              onClick={handleApplySearch}
              title="Tìm kiếm"
              aria-label="Tìm kiếm"
            >
              <i className="fa-solid fa-search"></i>
            </button>
            <button
              className="refresh-button"
              onClick={resetState}
              title="Làm mới bộ lọc & tìm kiếm"
              aria-label="Làm mới bộ lọc và tìm kiếm"
            >
              <i className="fa-solid fa-rotate-left"></i>
            </button>
          </div>
          <div className="filter-add-admin"></div>
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
          showLock={false}
          statusKey="status"
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
      >
        {modalData && (
          <FormDetail
            formData={modalData}
            fields={viewFields}
            mode="view"
            onChange={() => {}}
            onSubmit={() => {}}
            title="Chi tiết Yêu cầu"
            onClose={handleCloseDetailModal}
            avatarUrl={modalData?.avatar}
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
            <div className="form-content">
              <p>
                Gia sư: <strong>{requestToApprove.fullname}</strong>
              </p>
              <div className="form-detail-group">
                <label htmlFor="tutorLevelApproval">
                  Chọn Hạng Gia Sư:<span className="required-asterisk">*</span>
                </label>
                <TutorLevelList
                  name="tutorLevelApproval"
                  value={selectedLevelId}
                  onChange={handleLevelSelect}
                  required={true}
                  placeholder="-- Chọn hạng --"
                />
              </div>
              <div className="form-detail-actions">
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

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </AdminDashboardLayout>
  );
};

const ListOfRequest = React.memo(ListOfRequestPage);
export default ListOfRequest;
