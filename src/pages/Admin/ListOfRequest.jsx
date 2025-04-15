/* eslint-disable no-undef */
import React, { useCallback, useEffect, useState, useMemo } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css"; // Shared styles
import "../../assets/css/Modal.style.css"; // Modal styles
// Specific styles if needed (uncomment if you create this file)
// import "../../assets/css/Admin/ListOfRequest.style.css";
import Table from "../../components/Table"; // Use the updated Table component
import SearchBar from "../../components/SearchBar";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import FormDetail from "../../components/FormDetail"; // For viewing details
import TutorLevelList from "../../components/Static_Data/TutorLevelList"; // For approval modal
import Modal from "react-modal";
import { Alert } from "@mui/material";
import unidecode from "unidecode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

Modal.setAppElement("#root");

// Helper function to format status
const formatStatus = (status) => {
  switch (status) {
    case "REQUEST":
      return <span className="status status-request">Chờ duyệt</span>;
    case "ACCEPT":
      return <span className="status status-accept">Đã duyệt</span>;
    case "REFUSE":
      return <span className="status status-refuse">Từ chối</span>;
    case "CANCEL":
      return <span className="status status-cancel">Đã hủy</span>;
    default:
      return (
        <span className="status status-unknown">{status || "Không rõ"}</span>
      );
  }
};

// Helper function to parse and format dateTimeLearn
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
  if (!dateTimeLearnArray || !Array.isArray(dateTimeLearnArray))
    return "Không có"; // Changed from N/A
  try {
    const parsed = dateTimeLearnArray.map((jsonString) =>
      JSON.parse(jsonString)
    );
    if (parsed.length === 0) return "Không có"; // Handle empty parsed array
    return (
      <ul className="datetime-list">
        {parsed.map((item, index) => (
          <li key={index}>
            <strong>
              {item.day === "Sunday"
                ? "CN"
                : `Thứ ${daysOfWeek.indexOf(item.day) + 2}`}
            </strong>
            : {item.times.join(", ")}
          </li>
        ))}
      </ul>
    );
  } catch (e) {
    console.error("Error parsing dateTimeLearn:", e);
    return "Lỗi định dạng";
  }
};

// Helper to generate link for evidence
const renderEvidenceLink = (url) => {
  if (!url) return "Không có";
  if (url.startsWith("http") || url.startsWith("blob:")) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="evidence-link"
      >
        Xem file
      </a>
    );
  }
  return url;
};

// Status Filter Options
const statusFilterOptions = [
  { value: "REQUEST", label: "Chờ duyệt" },
  { value: "ACCEPT", label: "Đã duyệt" },
  { value: "REFUSE", label: "Từ chối" },
  { value: "CANCEL", label: "Đã hủy" },
  { value: "", label: "Tất cả trạng thái" },
];

const ListOfRequestPage = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // General loading for fetch
  const [isSolvingRequest, setIsSolvingRequest] = useState(false); // Specific loading for approve/reject
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const currentPath = "/quan-ly-yeu-cau";
  const [pageCount, setPageCount] = useState(1);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("REQUEST");
  // States for Approval Modal
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState(null);
  const [selectedLevelId, setSelectedLevelId] = useState("");

  const resetState = () => {
    setSearchInput("");
    setCurrentPage(0);
    setSelectedStatusFilter("REQUEST");
  };

  const fetchData = useCallback(
    async (sortConfigOverride = sortConfig) => {
      setIsLoading(true);
      setError(null);
      try {
        const query = { rpp: itemsPerPage, page: currentPage + 1 };
        if (selectedStatusFilter) {
          query.filter = JSON.stringify([
            { key: "status", operator: "like", value: selectedStatusFilter },
          ]);
        } else {
          delete query.filter;
        }
        let sortToUse = sortConfigOverride;
        if (!sortToUse.key) {
          sortToUse = { key: "createdAt", direction: "desc" };
        }
        query.sort = JSON.stringify([
          { key: sortToUse.key, type: sortToUse.direction.toUpperCase() },
        ]);
        const response = await Api({
          endpoint: `tutor-request/search-request`,
          method: METHOD_TYPE.GET,
          query: query,
        });
        if (
          response.success &&
          response.data &&
          Array.isArray(response.data.items)
        ) {
          setData(response.data.items);
          setFilteredData(response.data.items);
          setTotalItems(response.data.total);
          setPageCount(Math.ceil(response.data.total / itemsPerPage));
        } else {
          setError(response.message || "Lỗi tải dữ liệu");
          setData([]);
          setFilteredData([]);
          setTotalItems(0);
          setPageCount(1);
        }
      } catch (error) {
        console.error("Fetch data error:", error);
        setError("Lỗi tải dữ liệu");
        setData([]);
        setFilteredData([]);
        setTotalItems(0);
        setPageCount(1);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, sortConfig, itemsPerPage, selectedStatusFilter]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };
  const handleSort = (sortKey) => {
    setSortConfig((prev) => ({
      key: sortKey,
      direction:
        prev.key === sortKey && prev.direction === "asc" ? "desc" : "asc",
    }));
  };
  const handleView = (request) => {
    setModalData(request);
    setIsDetailModalOpen(true);
  };
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setModalData(null);
  };

  // Action Handlers
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
        headers: { "Content-Type": "application/json" },
      });
      if (response.success) {
        toast.success("Duyệt yêu cầu thành công!");
        fetchData();
        handleCloseApprovalModal();
      } else {
        toast.error(`Duyệt thất bại: ${response.message || "Lỗi"}`);
      }
    } catch (error) {
      toast.error(`Duyệt thất bại: ${error.message || "Lỗi mạng"}`);
      console.error("Approve error:", error);
    } finally {
      setIsSolvingRequest(false);
    }
  };
  const handleRejectClick = async (request) => {
    if (!request || !request.tutorRequestId) return;
    if (
      window.confirm(
        `Bạn chắc muốn từ chối yêu cầu "${request.tutorRequestId}" của ${request.fullname}?`
      )
    ) {
      const requestId = request.tutorRequestId;
      setIsSolvingRequest(true);
      try {
        const response = await Api({
          endpoint: `tutor-request/solve-request/${requestId}`,
          method: METHOD_TYPE.PUT,
          data: { click: "REFUSE" },
          headers: { "Content-Type": "application/json" },
        });
        if (response.success) {
          toast.success("Từ chối yêu cầu thành công!");
          fetchData();
        } else {
          toast.error(`Từ chối thất bại: ${response.message || "Lỗi"}`);
        }
      } catch (error) {
        toast.error(`Từ chối thất bại: ${error.message || "Lỗi mạng"}`);
        console.error("Reject error:", error);
      } finally {
        setIsSolvingRequest(false);
      }
    }
  };

  // Table Columns
  const columns = useMemo(
    () => [
      { title: "ID Yêu Cầu", dataKey: "tutorRequestId", sortable: true },
      { title: "Họ và Tên", dataKey: "fullname", sortable: true },
      { title: "Trường ĐH", dataKey: "univercity", sortable: true },
      { title: "Chuyên ngành", dataKey: "major.majorName", sortable: true },
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
    ],
    []
  );

  // Fields for Detail View Modal
  const viewFields = useMemo(
    () => [
      { key: "tutorRequestId", label: "ID Yêu cầu" },
      { key: "userId", label: "UserID" },
      {
        key: "status",
        label: "Trạng thái",
        renderValue: (status) => (status ? formatStatus(status) : "Không có"),
      },
      { key: "fullname", label: "Họ và Tên" },
      // Avatar field removed from here as it's displayed separately in the modal
      {
        key: "birthday",
        label: "Ngày sinh",
        renderValue: (d) =>
          d ? format(new Date(d), "dd/MM/yyyy") : "Không có",
      },
      {
        key: "gender",
        label: "Giới tính",
        renderValue: (gender) =>
          gender === "MALE" ? "Nam" : gender === "FEMALE" ? "Nữ" : "Không có",
      },
      {
        key: "univercity",
        label: "Trường Đại học",
        renderValue: (val) => val || "Không có",
      },
      {
        key: "major.majorName",
        label: "Chuyên ngành",
        renderValue: (val) => val || "Không có",
      },
      {
        key: "GPA",
        label: "Điểm GPA",
        renderValue: (val) =>
          val !== null && val !== undefined ? val : "Không có",
      },
      {
        key: "evidenceOfGPA",
        label: "Minh chứng GPA",
        renderValue: renderEvidenceLink,
      },
      {
        key: "subject.subjectName",
        label: "Môn học 1",
        renderValue: (val) => val || "Không có",
      },
      {
        key: "descriptionOfSubject",
        label: "Mô tả môn 1",
        renderValue: (val) => val || "Không có",
      },
      {
        key: "evidenceOfSubject",
        label: "Minh chứng môn 1",
        renderValue: renderEvidenceLink,
      },
      {
        key: "subject2.subjectName",
        label: "Môn học 2",
        renderValue: (val) => val || "Không có",
      },
      {
        key: "descriptionOfSubject2",
        label: "Mô tả môn 2",
        renderValue: (val) => val || "Không có",
      },
      {
        key: "evidenceOfSubject2",
        label: "Minh chứng môn 2",
        renderValue: renderEvidenceLink,
      },
      {
        key: "subject3.subjectName",
        label: "Môn học 3",
        renderValue: (val) => val || "Không có",
      },
      {
        key: "descriptionOfSubject3",
        label: "Mô tả môn 3",
        renderValue: (val) => val || "Không có",
      },
      {
        key: "evidenceOfSubject3",
        label: "Minh chứng môn 3",
        renderValue: renderEvidenceLink,
      },
      {
        key: "description",
        label: "Giới thiệu bản thân",
        renderValue: (val) => val || "Không có",
      },
      {
        key: "teachingTime",
        label: "Thời gian/tiết",
        renderValue: (t) =>
          t ? `${parseFloat(t).toFixed(2)} giờ` : "Không có",
      },
      {
        key: "teachingMethod",
        label: "Phương thức dạy",
        renderValue: (method) =>
          method === "ONLINE"
            ? "Trực tuyến"
            : method === "OFFLINE"
            ? "Tại nhà"
            : method === "BOTH"
            ? "Cả hai"
            : "Không có",
      },
      {
        key: "teachingPlace",
        label: "Khu vực dạy Offline",
        renderValue: (val) => val || "Không có",
      },
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
      {
        key: "bankName",
        label: "Ngân hàng",
        renderValue: (val) => val || "Không có",
      },
      {
        key: "bankNumber",
        label: "Số tài khoản",
        renderValue: (val) => val || "Không có",
      },
      {
        key: "dateTimeLearn",
        label: "Lịch rảnh",
        renderValue: (val) =>
          val && val.length > 0 ? formatDateTimeLearn(val) : "Không có",
      },
      {
        key: "tutorLevel.levelName",
        label: "Cấp độ gia sư",
        renderValue: (val) => val || "Chưa có",
      },
      {
        key: "totalTestPoints",
        label: "Điểm test",
        renderValue: (p) => (p !== null && p !== undefined ? p : "Chưa có"),
      },
      {
        key: "createdAt",
        label: "Ngày tạo",
        renderValue: (d) =>
          d ? format(new Date(d), "dd/MM/yyyy HH:mm") : "Không có",
      },
      {
        key: "updatedAt",
        label: "Cập nhật",
        renderValue: (d) =>
          d ? format(new Date(d), "dd/MM/yyyy HH:mm") : "Không có",
      },
    ],
    []
  );

  const handleSearchInputChange = (query) => {
    setSearchInput(query);
    const normQuery = unidecode(query.toLowerCase().trim());
    if (!normQuery) {
      setFilteredData(data);
      return;
    }
    const filtered = data.filter((item) => {
      const searchable = [
        item.tutorRequestId,
        item.fullname,
        item.univercity,
        item.major?.majorName,
        item.totalTestPoints?.toString(),
        item.GPA?.toString(),
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return unidecode(searchable).includes(normQuery);
    });
    setFilteredData(filtered);
    setCurrentPage(0);
  };
  const handleItemsPerPageChange = (newPageSize) => {
    setItemsPerPage(newPageSize);
    setCurrentPage(0);
  };
  const handleStatusFilterChange = (event) => {
    setSelectedStatusFilter(event.target.value);
    setCurrentPage(0);
  };

  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        <h2 className="admin-list-title">Quản lý Yêu cầu Làm Gia sư</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            <SearchBar
              value={searchInput}
              onChange={handleSearchInputChange}
              placeholder="Tìm ID, Tên, Trường, Ngành, Trạng thái..."
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
            />
            <div className="filter-control">
              {" "}
              <label htmlFor="statusFilter" className="filter-label">
                Lọc:
              </label>{" "}
              <select
                id="statusFilter"
                value={selectedStatusFilter}
                onChange={handleStatusFilterChange}
                className="status-filter-select"
              >
                {" "}
                {statusFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {" "}
                    {option.label}{" "}
                  </option>
                ))}{" "}
              </select>{" "}
            </div>
            <button
              className="refresh-button"
              onClick={() => {
                resetState();
                fetchData();
              }}
              title="Làm mới"
            >
              {" "}
              <i className="fa-solid fa-rotate fa-lg"></i>{" "}
            </button>
          </div>
          <div className="filter-add-admin"> {/* Empty div */} </div>
        </div>
        {error && (
          <Alert severity="error" style={{ marginTop: "1rem" }}>
            {error}
          </Alert>
        )}
        <Table
          columns={columns}
          data={filteredData}
          // Pass action handlers needed for this page
          onView={handleView}
          onApprove={handleApproveClick}
          onReject={handleRejectClick}
          // Other Table props
          pageCount={pageCount}
          onPageChange={handlePageClick}
          forcePage={currentPage}
          onSort={handleSort} // Pass sort handler
          loading={isLoading || isSolvingRequest}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          showLock={false}
          statusKey="status"
        />
        {!isLoading && !error && <p>Tổng số yêu cầu: {totalItems}</p>}
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
            <h2>Duyệt Yêu Cầu: {requestToApprove.tutorRequestId}</h2>
            <p>
              Gia sư: <strong>{requestToApprove.fullname}</strong>
            </p>
            <div className="form-detail-group">
              {" "}
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
            <div className="modal-action-buttons approval-actions">
              <button
                className="action-button cancel"
                onClick={handleCloseApprovalModal}
                disabled={isSolvingRequest}
              >
                Hủy
              </button>
              <button
                className="action-button approve"
                onClick={handleConfirmApprove}
                disabled={!selectedLevelId || isSolvingRequest}
              >
                {" "}
                {isSolvingRequest ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin /> Đang xử lý...
                  </>
                ) : (
                  "Xác nhận Duyệt"
                )}{" "}
              </button>
            </div>
          </div>
        )}
      </Modal>
      {/* No Delete Confirmation Modal */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AdminDashboardLayout>
  );
};

const ListOfRequest = React.memo(ListOfRequestPage);
export default ListOfRequest;
