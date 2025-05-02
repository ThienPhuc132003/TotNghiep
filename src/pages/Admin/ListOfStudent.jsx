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
import qs from "qs";
import { Alert } from "@mui/material";
// Bỏ unidecode
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format, parseISO, isValid } from "date-fns"; // Thêm parseISO, isValid
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
  // Mặc định không cần giờ
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
      return <span className="status status-blocked">Đã khóa</span>; // Hoặc status-inactive
    default:
      return (
        <span className="status status-unknown">{status || "Không rõ"}</span>
      );
  }
};

const ListOfStudentPage = () => {
  const { t } = useTranslation();
  // --- States ---
  const [data, setData] = useState([]);
  // Bỏ filteredData
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1); // State cho tổng số trang
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // State cho query tìm kiếm thực tế
  const [isModalOpen, setIsModalOpen] = useState(false); // Chỉ dùng cho View modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(""); // State cho message xóa
  const [modalData, setModalData] = useState({}); // Dùng cho View modal
  const [modalMode, setModalMode] = useState(null); // Chỉ set thành 'view'
  const [currentPage, setCurrentPage] = useState(0); // Index 0-based
  const [isLoading, setIsLoading] = useState(false); // Loading chính cho bảng
  const [isProcessingLock, setIsProcessingLock] = useState(false); // Loading cho nút khóa/mở
  const [isDeleting, setIsDeleting] = useState(false); // Loading cho nút xóa
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  }); // Mặc định sort theo ngày tạo giảm dần
  const [itemsPerPage, setItemsPerPage] = useState(10); // Đổi lại thành 10 hoặc tùy ý
  const currentPath = "/nguoi-hoc";
  // Bỏ formErrors nếu không có form Add/Edit
  // const [formErrors, setFormErrors] = useState({});

  // Bỏ updateUrl và useEffect liên quan

  // --- Reset State ---
  const resetState = () => {
    setSearchInput("");
    setSearchQuery("");
    setSortConfig({ key: "createdAt", direction: "desc" }); // Reset về sort mặc định
    setCurrentPage(0);
  };

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Luôn lọc theo roleId=USER
      const filterConditions = [
        { key: "roleId", operator: "equal", value: "USER" },
      ];

      // Thêm filter tìm kiếm nếu có
      if (searchQuery) {
        filterConditions.push({
          key: "userId,userProfile.fullname,email,phoneNumber,userProfile.major.majorName", // Các trường tìm kiếm
          operator: "like",
          value: searchQuery,
        });
      }

      const query = {
        rpp: itemsPerPage,
        page: currentPage + 1, // API page 1-based
        filter: JSON.stringify(filterConditions), // Gửi filter đã kết hợp
        sort: JSON.stringify([
          { key: sortConfig.key, type: sortConfig.direction.toUpperCase() },
        ]),
      };

      const queryString = qs.stringify(query, { encode: false });
      console.log("Fetching students with query:", queryString);

      const response = await Api({
        endpoint: `user/search?${queryString}`, // Endpoint user search
        method: METHOD_TYPE.GET,
      });
      console.log("API Response:", response);

      if (response.success && response.data) {
        setData(response.data.items || []);
        setTotalItems(response.data.total || 0);
        setPageCount(Math.ceil((response.data.total || 0) / itemsPerPage));
      } else {
        throw new Error(response.message || t("common.errorLoadingData"));
      }
    } catch (error) {
      console.error("Fetch student error:", error);
      setError(error.message || t("common.errorLoadingData"));
      setData([]);
      setTotalItems(0);
      setPageCount(1);
      toast.error(`Tải danh sách người học thất bại: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, sortConfig, searchQuery, t]); // Thêm searchQuery

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

  // Trigger tìm kiếm backend
  const handleApplySearch = () => {
    setCurrentPage(0);
    setSearchQuery(searchInput);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleApplySearch();
    }
  };

  // Cập nhật sortConfig
  const handleSort = (sortKey) => {
    setSortConfig((prevConfig) => {
      const newDirection =
        prevConfig.key === sortKey && prevConfig.direction === "asc"
          ? "desc"
          : "asc";
      return { key: sortKey, direction: newDirection };
    });
    setCurrentPage(0);
  };

  // Cập nhật itemsPerPage
  const handleItemsPerPageChange = (newPageSize) => {
    setItemsPerPage(newPageSize);
    setCurrentPage(0);
  };

  // --- Action Handlers ---
  const handleDelete = (student) => {
    // Nhận cả object
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
        endpoint: `user/delete-user-by-id/${deleteItemId}`, // Endpoint xóa user
        method: METHOD_TYPE.DELETE,
      });
      if (response.success) {
        toast.success("Xóa người học thành công");
        if (data.length === 1 && currentPage > 0) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchData();
        }
      } else {
        console.error("Failed to delete student:", response.message);
        toast.error(
          `Xóa thất bại: ${response.message || "Lỗi không xác định"}`
        );
      }
    } catch (error) {
      console.error("An error occurred while deleting student:", error);
      toast.error(`Xóa thất bại: ${error.message || "Lỗi mạng"}`);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
      setDeleteMessage("");
      setIsDeleting(false);
    }
  };

  // Handler cho nút View
  const handleView = (student) => {
    // Chuẩn bị dữ liệu đầy đủ cho modal view
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
      birthday: getSafeNestedValue(student, "userProfile.birthday", null), // Giữ null nếu không có
      gender: getSafeNestedValue(student, "userProfile.gender", null), // Giữ null nếu không có
      majorName: getSafeNestedValue(
        student,
        "userProfile.major.majorName",
        "Chưa cập nhật"
      ),
      status: student.status, // Trạng thái tài khoản (PENDING, ACTIVE,...)
      checkActive: student.checkActive, // Trạng thái khóa/mở (ACTIVE, BLOCKED)
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      // Thêm các trường khác nếu cần hiển thị
    };
    setModalData(studentDataForView);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalData({});
    setModalMode(null);
    // Bỏ setFormErrors nếu không có form add/edit
  };

  // Handler cho nút Lock/Unlock
  const handleLock = async (student) => {
    if (!student || !student.userId) return;
    // Trạng thái mới dựa trên checkActive
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

    setIsProcessingLock(true); // Bắt đầu loading
    try {
      const response = await Api({
        endpoint: `user/update-user-by-id/${student.userId}`, // Endpoint cập nhật user
        method: METHOD_TYPE.PUT,
        // Chỉ gửi trường cần thay đổi
        data: { checkActive: newCheckActive },
      });

      if (response.success) {
        // Cập nhật state data để UI thay đổi ngay
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
        console.error(
          "Failed to update student lock status:",
          response.message
        );
      }
    } catch (error) {
      toast.error(`Cập nhật thất bại: ${error.message || "Lỗi mạng"}`);
      console.error(
        "An error occurred while updating student lock status:",
        error
      );
    } finally {
      setIsProcessingLock(false); // Kết thúc loading
    }
  };

  // --- Columns Definition ---
  const columns = useMemo(
    () => [
      { title: "Mã người dùng", dataKey: "userId", sortable: true },
      {
        title: "Tên",
        dataKey: "userProfile.fullname",
        sortKey: "userProfile.fullname", // Cần backend hỗ trợ sort nested
        sortable: true,
        renderCell: (_, row) =>
          getSafeNestedValue(row, "userProfile.fullname", "..."),
      },
      {
        title: "Ngày sinh",
        dataKey: "userProfile.birthday",
        sortKey: "userProfile.birthday",
        sortable: true,
        renderCell: (v) => safeFormatDate(v, "dd/MM/yyyy"), // Dùng safeFormatDate
      },
      {
        title: "Giới tính",
        dataKey: "userProfile.gender",
        sortKey: "userProfile.gender",
        sortable: true,
        renderCell: (v) =>
          v === "MALE" ? "Nam" : v === "FEMALE" ? "Nữ" : "Khác",
      },
      {
        title: "Ngành",
        dataKey: "userProfile.major.majorName",
        sortKey: "userProfile.major.majorName",
        sortable: true,
        renderCell: (_, row) =>
          getSafeNestedValue(row, "userProfile.major.majorName", "Chưa có"),
      },
      {
        title: "Trạng thái", // Đổi thành trạng thái khóa/mở
        dataKey: "checkActive",
        sortable: true,
        renderCell: formatLockStatus, // Dùng helper format trạng thái
      },
      {
        title: "Ngày tạo", // Thêm cột ngày tạo
        dataKey: "createdAt",
        sortable: true,
        renderCell: (v) => safeFormatDate(v, "dd/MM/yy HH:mm"),
      },
    ],
    []
  ); // Không có dependencies

  // --- Fields Definition for View Modal ---
  const viewFields = useMemo(
    () => [
      { key: "userId", label: "Mã người dùng" },
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
      { key: "majorName", label: "Ngành" }, // Dùng key đã chuẩn bị trong modalData
      {
        key: "checkActive",
        label: "Trạng thái",
        renderValue: formatLockStatus,
      }, // Trạng thái khóa/mở
      // { key: "status", label: "Trạng thái TK", renderValue: (v) => v }, // Trạng thái tài khoản (PENDING, ACTIVE...) nếu cần
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
  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        <h2 className="admin-list-title">Danh sách người học</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            <SearchBar
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchKeyPress} // Thêm tìm bằng Enter
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
              placeholder="Tìm mã, tên, email, SĐT, ngành..." // Cập nhật placeholder
            />
            {/* Nút tìm kiếm */}
            <button
              className="refresh-button"
              onClick={handleApplySearch}
              title="Tìm kiếm"
              aria-label="Tìm kiếm"
            >
              <i className="fa-solid fa-search"></i>
            </button>
            {/* Nút làm mới */}
            <button
              className="refresh-button"
              onClick={resetState}
              title="Làm mới"
              aria-label="Làm mới"
            >
              <i className="fa-solid fa-rotate-left"></i>
            </button>
          </div>
          {/* Không có nút Add Student ở đây */}
          <div className="filter-add-admin"></div>
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Table */}
        <Table
          columns={columns}
          data={data} // Dùng data
          totalItems={totalItems} // Truyền totalItems
          // Actions
          onView={handleView}
          onDelete={handleDelete} // Truyền cả object student
          onLock={handleLock} // Truyền handler khóa/mở
          showLock={true} // Hiển thị nút lock
          statusKey="checkActive" // Key để kiểm tra trạng thái lock
          // Pagination & Sort
          pageCount={pageCount}
          onPageChange={handlePageClick}
          forcePage={currentPage}
          onSort={handleSort}
          currentSortConfig={sortConfig} // Truyền sort config
          // Loading & Items per page
          // Kết hợp loading chính và loading lock
          loading={isLoading || isProcessingLock}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
        {/* Tổng số */}
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
      </div>
    </>
  );

  return (
    <AdminDashboardLayout
      currentPath={currentPath}
      childrenMiddleContentLower={childrenMiddleContentLower}
    >
      {/* View Modal */}
      <Modal
        isOpen={isModalOpen && modalMode === "view"} // Chỉ mở khi mode là view
        onRequestClose={handleCloseModal}
        contentLabel="Xem thông tin người học"
        className="modal" // Có thể thêm class 'large' nếu cần
        overlayClassName="overlay"
      >
        {/* Render FormDetail chỉ khi modalData có */}
        {modalData && (
          <FormDetail
            formData={modalData}
            fields={viewFields} // Sử dụng viewFields
            mode="view"
            title="Xem thông tin người học"
            onClose={handleCloseModal}
            // Không cần các props khác cho view mode (onChange, onSubmit, errors, isSubmitting)
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message={deleteMessage} // Dùng message động
        isDeleting={isDeleting} // Truyền state deleting
      />

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </AdminDashboardLayout>
  );
};

const ListOfStudent = React.memo(ListOfStudentPage);
export default ListOfStudent;
