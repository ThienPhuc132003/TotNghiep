// src/pages/Admin/ListOfStudent.jsx
import React, { useCallback, useEffect, useState, useMemo } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css"; // Dùng chung CSS
import "../../assets/css/Modal.style.css";
import Table from "../../components/Table";
import SearchBar from "../../components/SearchBar";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import FormDetail from "../../components/FormDetail";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
// qs không còn cần thiết nếu API không dùng nó trực tiếp ở FE nữa
import { Alert } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format, parseISO, isValid } from "date-fns";

Modal.setAppElement("#root");

// Helper lấy giá trị lồng nhau an toàn
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

// Helper định dạng ngày an toàn hơn
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

// Helper định dạng trạng thái khóa/mở
const formatLockStatus = (status) => {
  switch (status) {
    case "ACTIVE":
      return <span className="status status-active">Hoạt động</span>;
    case "BLOCKED":
      return <span className="status status-blocked">Đã khóa</span>;
    default:
      return (
        <span className="status status-unknown">{status || "Không rõ"}</span>
      );
  }
};

// Định nghĩa các cột có thể tìm kiếm cho Người học
const searchableStudentColumnOptions = [
  { value: "userId", label: "Mã người học" },
  { value: "userProfile.fullname", label: "Tên người học" },
  { value: "email", label: "Email" }, // Thêm email
  { value: "phoneNumber", label: "Số điện thoại" }, // Thêm SĐT
  {
    value: "userProfile.birthday",
    label: "Ngày sinh",
    placeholderSuffix: " (YYYY-MM-DD)",
  },
  { value: "userProfile.major.majorName", label: "Ngành" },
  {
    value: "createdAt",
    label: "Ngày tạo",
    placeholderSuffix: " (YYYY-MM-DD)",
  },
];

const ListOfStudentPage = () => {
  const { t } = useTranslation();
  // --- States ---
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [selectedSearchField, setSelectedSearchField] = useState(
    searchableStudentColumnOptions[0].value
  );
  const [appliedSearchInput, setAppliedSearchInput] = useState("");
  const [appliedSearchField, setAppliedSearchField] = useState(
    searchableStudentColumnOptions[0].value
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [modalData, setModalData] = useState({});
  const [modalMode, setModalMode] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingLock, setIsProcessingLock] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const currentPath = "/nguoi-hoc";

  // --- Reset State ---
  const resetState = useCallback(() => {
    setSearchInput("");
    setSelectedSearchField(searchableStudentColumnOptions[0].value);
    setAppliedSearchInput("");
    setAppliedSearchField(searchableStudentColumnOptions[0].value);
    setSortConfig({ key: "createdAt", direction: "desc" });
    setCurrentPage(0);
    // Không cần gọi fetchData ở đây vì các useEffect sẽ tự trigger khi state thay đổi
  }, []);

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filterConditions = [
        { key: "roleId", operator: "equal", value: "USER" },
      ];

      if (appliedSearchInput && appliedSearchField) {
        // QUAN TRỌNG: Backend API /user/search cần hỗ trợ tìm kiếm theo `key` đơn lẻ
        // Nếu backend chỉ hỗ trợ tìm kiếm trên một chuỗi các trường cố định,
        // thì việc chọn cột ở FE sẽ không thay đổi cách backend tìm kiếm.
        // Ví dụ: nếu backend tìm `value` trên `userId,userProfile.fullname,...`
        // thì dù `appliedSearchField` là gì, nó vẫn tìm trên tất cả các trường đó.
        // Giả định ở đây là backend hỗ trợ key đơn lẻ:
        filterConditions.push({
          key: appliedSearchField,
          operator: "like", // Hoặc 'equal' cho các trường như ID, ngày tháng nếu backend hỗ trợ
          value: appliedSearchInput,
        });
      }

      const query = {
        rpp: itemsPerPage,
        page: currentPage + 1,
        filter: JSON.stringify(filterConditions),
        sort: JSON.stringify([
          { key: sortConfig.key, type: sortConfig.direction.toUpperCase() },
        ]),
      };

      console.log("Fetching students with query:", query);

      const response = await Api({
        endpoint: `user/search`, // Endpoint user search, không cần qs.stringify ở đây nữa
        method: METHOD_TYPE.GET,
        query: query, // Truyền object query, class Api sẽ tự xử lý
      });
      console.log("API Response:", response);

      if (response.success && response.data) {
        setData(response.data.items || []);
        setTotalItems(response.data.total || 0);
        setPageCount(Math.ceil((response.data.total || 0) / itemsPerPage));
      } else {
        throw new Error(response.message || t("common.errorLoadingData"));
      }
    } catch (errorCatch) {
      console.error("Fetch student error:", errorCatch);
      const errorMessage = errorCatch.message || t("common.errorLoadingData");
      setError(errorMessage);
      setData([]);
      setTotalItems(0);
      setPageCount(1);
      toast.error(`Tải danh sách người học thất bại: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    sortConfig,
    appliedSearchInput,
    appliedSearchField,
    t,
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

  const handleSearchInputChange = (value) => {
    setSearchInput(value);
  };

  const handleSearchFieldChange = (event) => {
    setSelectedSearchField(event.target.value);
    // Có thể reset searchInput ở đây nếu muốn: setSearchInput("");
  };

  const handleApplySearch = () => {
    // Chỉ áp dụng nếu có input hoặc field thay đổi so với applied
    // Điều này giúp tránh gọi API thừa khi nhấn nút tìm kiếm mà không có gì mới
    if (searchInput.trim() || selectedSearchField !== appliedSearchField) {
      if (searchInput.trim()) {
        setAppliedSearchField(selectedSearchField);
        setAppliedSearchInput(searchInput);
      } else {
        // Nếu input trống, nhưng field thay đổi -> có thể là muốn xóa search theo field cũ
        // và áp dụng field mới (nếu có filter khác) hoặc xóa hẳn search
        setAppliedSearchField(selectedSearchField); // Giữ field mới
        setAppliedSearchInput(""); // Xóa input
      }
    } else if (!searchInput.trim() && appliedSearchInput) {
      // Nếu input bị xóa rỗng, và trước đó có tìm kiếm -> xóa điều kiện tìm kiếm
      setAppliedSearchInput("");
      // Giữ nguyên appliedSearchField hoặc reset về mặc định tùy logic
    }
    setCurrentPage(0);
    // fetchData sẽ được gọi lại bởi useEffect
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleApplySearch();
    }
  };

  const handleSort = (sortKey) => {
    setSortConfig((prevConfig) => ({
      key: sortKey,
      direction:
        prevConfig.key === sortKey && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
    setCurrentPage(0);
  };

  const handleItemsPerPageChange = (newPageSize) => {
    setItemsPerPage(newPageSize);
    setCurrentPage(0);
  };

  const handleDelete = (student) => {
    if (!student || !student.userId) return;
    const studentName = getSafeNestedValue(
      student,
      "userProfile.fullname",
      student.userId
    );
    setDeleteItemId(student.userId);
    setDeleteMessage(`Bạn có chắc muốn xóa người học "${studentName}"?`);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;
    setIsDeleting(true);
    try {
      const response = await Api({
        endpoint: `user/delete-user-by-id/${deleteItemId}`,
        method: METHOD_TYPE.DELETE,
      });
      if (response.success) {
        toast.success("Xóa người học thành công");
        if (data.length === 1 && currentPage > 0) {
          setCurrentPage(currentPage - 1); // Chuyển về trang trước nếu xóa item cuối cùng của trang hiện tại
        } else {
          fetchData(); // Tải lại dữ liệu cho trang hiện tại
        }
      } else {
        toast.error(
          `Xóa thất bại: ${response.message || "Lỗi không xác định"}`
        );
      }
    } catch (errorCatch) {
      toast.error(`Xóa thất bại: ${errorCatch.message || "Lỗi mạng"}`);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
      setDeleteMessage("");
      setIsDeleting(false);
    }
  };

  const handleView = (student) => {
    const studentDataForView = {
      userId: student.userId,
      fullname: getSafeNestedValue(
        student,
        "userProfile.fullname",
        "Chưa cập nhật"
      ),
      email: student.email,
      phoneNumber: student.phoneNumber || "Chưa cập nhật",
      homeAddress: getSafeNestedValue(
        student,
        "userProfile.homeAddress",
        "Chưa cập nhật"
      ),
      birthday: getSafeNestedValue(student, "userProfile.birthday", null),
      gender: getSafeNestedValue(student, "userProfile.gender", null),
      majorName: getSafeNestedValue(
        student,
        "userProfile.major.majorName",
        "Chưa cập nhật"
      ),
      status: student.status,
      checkActive: student.checkActive,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
    setModalData(studentDataForView);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setModalData({});
      setModalMode(null);
    }, 300); // Đợi animation của modal
  };

  const handleLock = async (student) => {
    if (!student || !student.userId) return;
    const newCheckActive =
      student.checkActive === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const actionText = newCheckActive === "ACTIVE" ? "Mở khóa" : "Khóa";
    const studentName = getSafeNestedValue(
      student,
      "userProfile.fullname",
      student.userId
    );

    if (
      !window.confirm(`Bạn chắc muốn ${actionText} tài khoản "${studentName}"?`)
    )
      return;

    setIsProcessingLock(true);
    try {
      const response = await Api({
        endpoint: `user/update-user-by-id/${student.userId}`,
        method: METHOD_TYPE.PUT,
        data: { checkActive: newCheckActive },
      });

      if (response.success) {
        setData((prevData) =>
          prevData.map((item) =>
            item.userId === student.userId
              ? { ...item, checkActive: newCheckActive }
              : item
          )
        );
        toast.success(`${actionText} tài khoản "${studentName}" thành công!`);
      } else {
        toast.error(
          `Cập nhật thất bại: ${response.message || "Lỗi không xác định"}`
        );
      }
    } catch (errorCatch) {
      toast.error(`Cập nhật thất bại: ${errorCatch.message || "Lỗi mạng"}`);
    } finally {
      setIsProcessingLock(false);
    }
  };

  // --- Columns Definition ---
  const columns = useMemo(
    () => [
      { title: "Mã NH", dataKey: "userId", sortable: true }, // Sửa title
      {
        title: "Tên người học", // Sửa title
        dataKey: "userProfile.fullname",
        sortKey: "userProfile.fullname",
        sortable: true,
        renderCell: (_, row) =>
          getSafeNestedValue(row, "userProfile.fullname", "..."),
      },
      {
        title: "Ngày sinh",
        dataKey: "userProfile.birthday",
        sortKey: "userProfile.birthday",
        sortable: true,
        renderCell: (v) => safeFormatDate(v, "dd/MM/yyyy"),
      },
      {
        title: "Ngành",
        dataKey: "userProfile.major.majorName",
        sortKey: "userProfile.major.majorName", // Đảm bảo backend hỗ trợ sort key này
        sortable: true,
        renderCell: (_, row) =>
          getSafeNestedValue(row, "userProfile.major.majorName", "Chưa có"),
      },
      {
        title: "Trạng thái",
        dataKey: "checkActive",
        sortable: true,
        renderCell: formatLockStatus,
      },
      {
        title: "Ngày tạo",
        dataKey: "createdAt",
        sortable: true,
        renderCell: (v) => safeFormatDate(v, "dd/MM/yy HH:mm"),
      },
    ],
    [] // Dependencies trống nếu không có gì thay đổi
  );

  // --- Fields Definition for View Modal ---
  const viewFields = useMemo(
    () => [
      { key: "userId", label: "Mã người học" },
      { key: "fullname", label: "Tên" },
      { key: "email", label: "Email" },
      { key: "phoneNumber", label: "Số điện thoại" },
      { key: "homeAddress", label: "Địa chỉ" },
      {
        key: "birthday",
        label: "Ngày sinh",
        renderValue: (v) => safeFormatDate(v, "dd/MM/yyyy"),
      },
      {
        key: "gender",
        label: "Giới tính",
        renderValue: (v) =>
          v === "MALE" ? "Nam" : v === "FEMALE" ? "Nữ" : "Khác",
      },
      { key: "majorName", label: "Ngành" },
      {
        key: "checkActive",
        label: "Trạng thái tài khoản",
        renderValue: formatLockStatus,
      },
      {
        key: "createdAt",
        label: "Ngày tạo",
        renderValue: (v) => safeFormatDate(v, "dd/MM/yyyy HH:mm"),
      },
      {
        key: "updatedAt",
        label: "Cập nhật",
        renderValue: (v) =>
          v ? safeFormatDate(v, "dd/MM/yyyy HH:mm") : "Chưa cập nhật",
      },
    ],
    []
  );

  // --- JSX Render ---
  const currentSearchFieldConfig = useMemo(
    () =>
      searchableStudentColumnOptions.find(
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
        <h2 className="admin-list-title">Danh sách người học</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            {/* Select chọn cột tìm kiếm */}
            <div className="filter-control">
              <select
                id="searchFieldSelectStudent"
                value={selectedSearchField}
                onChange={handleSearchFieldChange}
                className="status-filter-select" // Tái sử dụng class CSS
                aria-label="Chọn trường để tìm kiếm"
              >
                {searchableStudentColumnOptions.map((option) => (
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
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
              placeholder={searchPlaceholder}
            />
            <button
              className="refresh-button" // Tái sử dụng class CSS
              onClick={handleApplySearch}
              title="Tìm kiếm"
              aria-label="Tìm kiếm"
              disabled={isLoading || isProcessingLock}
            >
              <i className="fa-solid fa-search"></i>
            </button>
            <button
              className="refresh-button" // Tái sử dụng class CSS
              onClick={resetState}
              title="Làm mới bộ lọc"
              aria-label="Làm mới bộ lọc"
              disabled={isLoading || isProcessingLock}
            >
              <i className="fa-solid fa-rotate-left"></i>
            </button>
          </div>
          {/* Không có nút Add Student ở đây, nên div này có thể để trống hoặc bỏ */}
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
          onDelete={handleDelete}
          onLock={handleLock}
          showLock={true}
          statusKey="checkActive"
          pageCount={pageCount}
          onPageChange={handlePageClick}
          forcePage={currentPage}
          onSort={handleSort}
          currentSortConfig={sortConfig}
          loading={isLoading || isProcessingLock || isDeleting} // Kết hợp các trạng thái loading
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
            Tổng số người học: {totalItems}
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
            Không có dữ liệu người học.
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
      <Modal
        isOpen={isModalOpen && modalMode === "view"}
        onRequestClose={handleCloseModal}
        contentLabel="Xem thông tin người học"
        className="modal"
        overlayClassName="overlay"
        closeTimeoutMS={300}
      >
        {modalData && modalMode === "view" && (
          <FormDetail
            formData={modalData}
            fields={viewFields}
            mode="view"
            title="Xem thông tin người học"
            onClose={handleCloseModal}
          />
        )}
      </Modal>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message={deleteMessage}
        isDeleting={isDeleting}
      />

      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </AdminDashboardLayout>
  );
};

const ListOfStudent = React.memo(ListOfStudentPage);
export default ListOfStudent;
