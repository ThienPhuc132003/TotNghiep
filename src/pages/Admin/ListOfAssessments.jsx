import { useCallback, useEffect, useState, useMemo } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css"; // Shared styles
import "../../assets/css/Modal.style.css"; // Modal styles
import "../../assets/css/FormDetail.style.css";
import Table from "../../components/Table";
import SearchBar from "../../components/SearchBar";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import FormDetail from "../../components/FormDetail";
import Modal from "react-modal";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { Alert } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format, isValid, parseISO } from "date-fns";

Modal.setAppElement("#root");

// Helper function to get safe nested value
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

// Helper function to format date safely
const safeFormatDate = (dateInput, formatString = "dd/MM/yyyy") => {
  if (!dateInput) return "Không có";
  try {
    const date =
      typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    return isValid(date) ? format(date, formatString) : "Ngày không hợp lệ";
  } catch (e) {
    return "Lỗi ngày";
  }
};

// Helper function to format rating with stars
const formatRating = (rating) => {
  const ratingValue = parseFloat(rating) || 0;
  const stars =
    "★".repeat(Math.floor(ratingValue)) +
    "☆".repeat(5 - Math.floor(ratingValue));
  return (
    <span className="rating-display" style={{ color: "#f39c12" }}>
      {stars} ({ratingValue.toFixed(1)})
    </span>
  );
};

// Search key options - Updated to include all searchable columns (excluding STT)
const searchKeyOptions = [
  { value: "user.fullname", label: "Tên người học" },
  { value: "tutor.fullname", label: "Tên gia sư" },
  { value: "classroom.classroomEvaluation", label: "Điểm đánh giá" },
  { value: "classroom.nameOfRoom", label: "Tên phòng học" },
  { value: "classroom.startDay", label: "Ngày bắt đầu" },
  { value: "classroom.endDay", label: "Ngày kết thúc" },
  { value: "description", label: "Nội dung đánh giá" },
];

// Get search placeholder
const getSearchPlaceholder = (selectedField) => {
  const fieldLabels = {
    "user.fullname": "Nhập tên người học...",
    "tutor.fullname": "Nhập tên gia sư...",
    "classroom.classroomEvaluation": "Nhập điểm đánh giá (1-5)...",
    "classroom.nameOfRoom": "Nhập tên phòng học...",
    "classroom.startDay": "Nhập ngày bắt đầu (dd/mm/yyyy)...",
    "classroom.endDay": "Nhập ngày kết thúc (dd/mm/yyyy)...",
    description: "Nhập nội dung đánh giá...",
  };
  return fieldLabels[selectedField] || "Nhập từ khóa tìm kiếm...";
};

const ListOfAssessments = () => {
  // --- States ---
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // Search states
  const [searchInput, setSearchInput] = useState("");
  const [selectedSearchField, setSelectedSearchField] =
    useState("user.fullname");
  const [appliedSearchInput, setAppliedSearchInput] = useState("");
  const [appliedSearchField, setAppliedSearchField] = useState("user.fullname");

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentPath = "/admin/danh-gia";

  // --- Event Handlers ---
  const handlePageClick = (event) => {
    if (typeof event.selected === "number") setCurrentPage(event.selected);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(0);
  };

  const handleSearch = () => {
    setAppliedSearchInput(searchInput);
    setAppliedSearchField(selectedSearchField);
    setCurrentPage(0);
  };
  const handleReset = () => {
    setSearchInput("");
    setSelectedSearchField("user.fullname");
    setAppliedSearchInput("");
    setAppliedSearchField("user.fullname");
    setCurrentPage(0);
  };

  const handleViewDetails = (assessment) => {
    setSelectedAssessment(assessment);
    setShowDetailModal(true);
  };
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedAssessment(null);
  };

  // NOTE: Delete functionality temporarily disabled
  // const handleDeleteClick = (assessment) => {
  //   setItemToDelete(assessment);
  //   setShowDeleteModal(true);
  // };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setIsLoading(true);
      const response = await Api({
        endpoint: `classroom-assessment/${itemToDelete.classroomAssessmentId}`,
        method: METHOD_TYPE.DELETE,
        requireToken: true,
      });

      if (response.success) {
        toast.success("Xóa đánh giá thành công!");
        fetchData(); // Refresh data
      } else {
        throw new Error(response.message || "Xóa thất bại");
      }
    } catch (error) {
      console.error("Error deleting assessment:", error);
      toast.error("Có lỗi xảy ra khi xóa đánh giá!");
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  }; // --- Table Columns Configuration - Updated for classroom-assessment/search API ---
  const columns = useMemo(
    () => [
      {
        title: "STT",
        dataKey: "stt",
        sortable: false,
        renderCell: (_, __, rowIndex) =>
          currentPage * itemsPerPage + rowIndex + 1,
      },
      {
        title: "Tên người học",
        dataKey: "user.fullname",
        sortKey: "user.fullname",
        sortable: true,
        renderCell: (value, row) =>
          getSafeNestedValue(row, "user.fullname", "N/A"),
      },
      {
        title: "Tên gia sư",
        dataKey: "tutor.fullname",
        sortKey: "tutor.fullname",
        sortable: true,
        renderCell: (value, row) =>
          getSafeNestedValue(row, "tutor.fullname", "N/A"),
      },
      {
        title: "Đánh giá",
        dataKey: "classroom.classroomEvaluation",
        sortKey: "classroom.classroomEvaluation",
        sortable: true,
        renderCell: (value, row) =>
          formatRating(
            getSafeNestedValue(row, "classroom.classroomEvaluation", 0)
          ),
      },
      {
        title: "Ngày bắt đầu",
        dataKey: "classroom.startDay",
        sortKey: "classroom.startDay",
        sortable: true,
        renderCell: (value, row) =>
          safeFormatDate(getSafeNestedValue(row, "classroom.startDay")),
      },
      {
        title: "Ngày kết thúc",
        dataKey: "classroom.endDay",
        sortKey: "classroom.endDay",
        sortable: true,
        renderCell: (value, row) =>
          safeFormatDate(getSafeNestedValue(row, "classroom.endDay")),
      },
    ],
    [currentPage, itemsPerPage]
  );

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = {
        page: currentPage,
        size: itemsPerPage,
      }; // Add search filter if search value is provided
      if (appliedSearchInput && appliedSearchInput.trim()) {
        const searchValue = appliedSearchInput.trim();
        // Search specific field only
        query.filterConditions = [
          {
            key: appliedSearchField,
            operation: "LIKE",
            value: searchValue,
          },
        ];
      }

      console.log("🔍 Fetching assessments with query:", query);

      const response = await Api({
        endpoint: "classroom-assessment/search",
        method: METHOD_TYPE.GET,
        query: query,
        requireToken: true,
      });

      console.log("📦 Assessments API response:", response);

      if (response && response.success) {
        const responseData = response.data;
        if (
          responseData &&
          Array.isArray(responseData.items) &&
          typeof responseData.total === "number"
        ) {
          setData(responseData.items);
          setTotalItems(responseData.total);
          setPageCount(Math.ceil(responseData.total / itemsPerPage));
        } else {
          throw new Error("Lỗi xử lý dữ liệu từ API.");
        }
      } else {
        throw new Error(response?.message || "Lỗi không xác định từ API.");
      }
    } catch (errorCatch) {
      const errorMessage =
        errorCatch.message || "Có lỗi xảy ra khi tải danh sách đánh giá.";
      setError(errorMessage);
      setData([]);
      setTotalItems(0);
      setPageCount(1);
      console.error("❌ Error fetching assessments:", errorCatch);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, appliedSearchInput, appliedSearchField]);

  // --- Effects ---
  useEffect(() => {
    fetchData();
  }, [fetchData]); // --- Assessment Detail Fields - Organized by main entities (user, tutor, classroom) ---
  const detailFields = useMemo(() => {
    if (!selectedAssessment) return [];

    return [
      // === THÔNG TIN NGƯỜI HỌC ===
      {
        key: "user.fullname",
        label: "Tên người học",
        renderValue: () =>
          getSafeNestedValue(selectedAssessment, "user.fullname", "Không có"),
      },
      {
        key: "user.email",
        label: "Email người học",
        renderValue: () =>
          getSafeNestedValue(selectedAssessment, "user.email", "Không có"),
      },
      {
        key: "user.phoneNumber",
        label: "Số điện thoại người học",
        renderValue: () =>
          getSafeNestedValue(
            selectedAssessment,
            "user.phoneNumber",
            "Chưa cập nhật"
          ),
      },
      {
        key: "user.checkActive",
        label: "Trạng thái người học",
        renderValue: () =>
          getSafeNestedValue(selectedAssessment, "user.checkActive", true)
            ? "Đang hoạt động"
            : "Tạm khóa",
      },

      // === THÔNG TIN GIA SƯ ===
      {
        key: "tutor.fullname",
        label: "Tên gia sư",
        renderValue: () =>
          getSafeNestedValue(selectedAssessment, "tutor.fullname", "Không có"),
      },
      {
        key: "tutor.email",
        label: "Email gia sư",
        renderValue: () =>
          getSafeNestedValue(selectedAssessment, "tutor.email", "Không có"),
      },
      {
        key: "tutor.phoneNumber",
        label: "Số điện thoại gia sư",
        renderValue: () =>
          getSafeNestedValue(
            selectedAssessment,
            "tutor.phoneNumber",
            "Chưa cập nhật"
          ),
      },
      {
        key: "tutor.checkActive",
        label: "Trạng thái gia sư",
        renderValue: () =>
          getSafeNestedValue(selectedAssessment, "tutor.checkActive", true)
            ? "Đang hoạt động"
            : "Tạm khóa",
      },

      // === THÔNG TIN LỚP HỌC ===
      {
        key: "classroom.nameOfRoom",
        label: "Tên phòng học",
        renderValue: () =>
          getSafeNestedValue(
            selectedAssessment,
            "classroom.nameOfRoom",
            "Không có"
          ),
      },
      {
        key: "classroom.startDay",
        label: "Ngày bắt đầu",
        renderValue: () =>
          safeFormatDate(
            getSafeNestedValue(selectedAssessment, "classroom.startDay")
          ),
      },
      {
        key: "classroom.endDay",
        label: "Ngày kết thúc",
        renderValue: () =>
          safeFormatDate(
            getSafeNestedValue(selectedAssessment, "classroom.endDay")
          ),
      },
      {
        key: "classroom.classroomEvaluation",
        label: "Điểm đánh giá",
        renderValue: () =>
          formatRating(
            getSafeNestedValue(
              selectedAssessment,
              "classroom.classroomEvaluation",
              0
            )
          ),
      },
      {
        key: "classroom.status",
        label: "Trạng thái lớp học",
        renderValue: () =>
          getSafeNestedValue(
            selectedAssessment,
            "classroom.status",
            "Không xác định"
          ),
      },

      // === CHI TIẾT ĐÁNH GIÁ ===
      {
        key: "description",
        label: "Nội dung đánh giá",
        type: "textarea",
        renderValue: () =>
          selectedAssessment.description || "Không có nội dung đánh giá",
      },
      {
        key: "meetingScope",
        label: "Phạm vi đánh giá",
        renderValue: () =>
          selectedAssessment.meetingId
            ? "Đánh giá cho buổi học cụ thể"
            : "Đánh giá tổng quát cho toàn bộ khóa học",
      },
      {
        key: "createdAt",
        label: "Ngày tạo đánh giá",
        renderValue: () =>
          safeFormatDate(selectedAssessment.createdAt, "dd/MM/yyyy HH:mm:ss"),
      },
      {
        key: "updatedAt",
        label: "Ngày cập nhật cuối",
        renderValue: () =>
          safeFormatDate(selectedAssessment.updatedAt, "dd/MM/yyyy HH:mm:ss"),
      },
    ];
  }, [selectedAssessment]);
  // --- JSX Render ---
  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        <h2 className="admin-list-title">Quản lý đánh giá</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            <div className="filter-control">
              <select
                id="searchFieldSelectAssessment"
                value={selectedSearchField}
                onChange={(e) => setSelectedSearchField(e.target.value)}
                className="status-filter-select"
                aria-label="Chọn trường để tìm kiếm"
                disabled={isLoading}
              >
                {searchKeyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>{" "}
            <SearchBar
              value={searchInput}
              onChange={(value) => setSearchInput(value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
              placeholder={getSearchPlaceholder(selectedSearchField)}
            />{" "}
            <button
              className="refresh-button"
              onClick={handleSearch}
              title="Tìm kiếm"
              aria-label="Tìm kiếm"
              disabled={isLoading}
            >
              <i className="fa-solid fa-search"></i>
            </button>
            <button
              className="refresh-button"
              onClick={handleReset}
              title="Làm mới"
              aria-label="Làm mới"
              disabled={isLoading}
            >
              <i className="fa-solid fa-rotate-left"></i>
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Table
          columns={columns}
          data={data}
          totalItems={totalItems}
          onView={handleViewDetails}
          pageCount={pageCount}
          onPageChange={handlePageClick}
          forcePage={currentPage}
          loading={isLoading}
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
            Tổng số đánh giá: {totalItems}
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
            Không có dữ liệu đánh giá.
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
      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onRequestClose={handleCloseDetailModal}
        contentLabel="Chi tiết đánh giá"
        className="modal"
        overlayClassName="overlay"
        closeTimeoutMS={300}
      >
        {selectedAssessment && (
          <FormDetail
            formData={selectedAssessment}
            fields={detailFields}
            mode="view"
            title="Chi tiết đánh giá"
            onClose={handleCloseDetailModal}
          />
        )}
      </Modal>
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        message={
          itemToDelete
            ? `Bạn có chắc muốn xóa đánh giá của ${getSafeNestedValue(
                itemToDelete,
                "user.fullname"
              )}?`
            : ""
        }
        isDeleting={isLoading}
      />{" "}
      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </AdminDashboardLayout>
  );
};

export default ListOfAssessments;
