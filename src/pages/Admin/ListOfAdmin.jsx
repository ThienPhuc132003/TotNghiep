/* eslint-disable no-undef */
import React, { useCallback, useEffect, useState, useMemo } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css";
import "../../assets/css/Modal.style.css";
import Table from "../../components/Table";
import SearchBar from "../../components/SearchBar";
import Api from "../../network/Api"; // Đường dẫn đến Api.js
import { METHOD_TYPE } from "../../network/methodType";
import FormDetail from "../../components/FormDetail";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { Alert } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format, parseISO, isValid } from "date-fns"; // Import date-fns

// Set the app element for accessibility
Modal.setAppElement("#root");

// Định nghĩa các lựa chọn cho bộ lọc
const roleFilterOptions = [
  { value: "", label: "Tất cả vai trò" },
  { value: "BEST_ADMIN", label: "Quản trị viên" },
  { value: "ADMIN", label: "Nhân viên" },
];
const statusFilterOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "BLOCKED", label: "Đã khóa" },
];

// Helper định dạng ngày
const formatDate = (dateString, formatString = "dd/MM/yyyy") => {
  if (!dateString) return "N/A";
  try {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, formatString) : "Ngày không hợp lệ";
  } catch (e) {
    // console.error("Error formatting date:", e); // Tắt log lỗi này nếu không cần thiết
    return "Lỗi ngày";
  }
};

const ListOfAdminPage = () => {
  const { t } = useTranslation();
  // --- States ---
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [modalData, setModalData] = useState({});
  const [modalMode, setModalMode] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const currentPath = "/nhan-vien";

  // --- Columns Definition (Định nghĩa TRƯỚC fetchData) ---
  const columns = useMemo(
    () => [
      { title: "Mã NV", dataKey: "adminId", sortable: true },
      {
        title: t("admin.name"),
        dataKey: "adminProfile.fullname",
        sortable: true,
        renderCell: (v) => v || "...",
      },
      {
        title: t("admin.role"),
        dataKey: "roleId",
        sortable: true,
        renderCell: (v) =>
          v === "BEST_ADMIN" ? "QTV" : v === "ADMIN" ? "NV" : "?",
      },
      { title: t("admin.phone"), dataKey: "phoneNumber", sortable: false },
      { title: t("admin.email"), dataKey: "email", sortable: true },
      {
        title: "Trạng thái",
        dataKey: "status",
        sortable: true,
        renderCell: (v) =>
          v === "ACTIVE" ? (
            <span className="status status-active">Hoạt động</span>
          ) : v === "BLOCKED" ? (
            <span className="status status-blocked">Khóa</span>
          ) : (
            <span className="status status-unknown">?</span>
          ),
      },
      {
        title: "Ngày tạo",
        dataKey: "createdAt",
        sortable: true,
        renderCell: (v) => formatDate(v, "dd/MM/yy"),
      },
    ],
    [t]
  );

  // --- Reset State ---
  const resetState = () => {
    setSearchInput("");
    setSearchQuery("");
    setSelectedRoleFilter("");
    setSelectedStatusFilter("");
    setSortConfig({ key: "createdAt", direction: "desc" });
    setCurrentPage(0);
  };

  // --- Fetch Data (Tạo danh sách filter LIKE riêng lẻ) ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // --- Xây dựng Filter ---
      const finalFilterConditions = [];
      const keysWithDedicatedFilters = ["roleId", "status"];

      // 1. Thêm các điều kiện lọc riêng trước (AND logic)
      if (selectedRoleFilter) {
        finalFilterConditions.push({
          key: "roleId",
          operator: "equal",
          value: selectedRoleFilter,
        });
      }
      if (selectedStatusFilter) {
        finalFilterConditions.push({
          key: "status",
          operator: "equal",
          value: selectedStatusFilter,
        });
      }

      // 2. Xử lý tìm kiếm chung (Thêm các điều kiện LIKE riêng lẻ - Backend có thể hiểu là AND)
      if (searchQuery) {
        const searchableDataKeys = columns
          .map((col) => col.dataKey)
          .filter(
            (key) =>
              key &&
              !keysWithDedicatedFilters.includes(key) &&
              key !== "createdAt"
          ); // Loại bỏ cả createdAt khỏi search LIKE

        searchableDataKeys.forEach((key) => {
          finalFilterConditions.push({
            key: key,
            operator: "like",
            value: searchQuery,
          });
        });
        console.warn(
          "Backend might interpret multiple 'like' filters as AND, not OR."
        );
        console.log(
          "Generated individual LIKE filters:",
          searchableDataKeys.map((key) => ({
            key,
            operator: "like",
            value: searchQuery,
          }))
        );
      }
      // --- Kết thúc xây dựng Filter ---

      // --- Chuẩn bị Query Object ---
      const query = {
        rpp: itemsPerPage,
        page: currentPage + 1,
        ...(finalFilterConditions.length > 0 && {
          filter: JSON.stringify(finalFilterConditions),
        }),
        sort: JSON.stringify([
          { key: sortConfig.key, type: sortConfig.direction.toUpperCase() },
        ]),
      };

      console.log("--- Preparing to call API ---");
      console.log("Query Object (to be stringified by Api.js):", query);
      console.log("------------------------------");

      // Gọi Api (Giả định trả về payload data)
      const responsePayload = await Api({
        endpoint: `admin/search`,
        method: METHOD_TYPE.GET,
        query: query,
      });
      console.log("API Response Payload (Processed):", responsePayload);

      // Xử lý responsePayload
      if (responsePayload && responsePayload.success) {
        const responseInnerData = responsePayload.data;
        if (
          responseInnerData &&
          Array.isArray(responseInnerData.items) &&
          typeof responseInnerData.total === "number"
        ) {
          setData(responseInnerData.items);
          setTotalItems(responseInnerData.total);
          setPageCount(Math.ceil(responseInnerData.total / itemsPerPage));
        } else {
          console.error("Unexpected data structure:", responsePayload);
          throw new Error(
            t("common.errorProcessingData") || "Lỗi xử lý dữ liệu."
          );
        }
      } else {
        throw new Error(
          responsePayload?.message ||
            t("common.errorLoadingData") ||
            "Lỗi không xác định từ API."
        );
      }
    } catch (error) {
      console.error("Fetch data error caught:", error.message || error);
      setError(
        error.message ||
          t("common.errorLoadingData") ||
          "Có lỗi xảy ra khi tải dữ liệu."
      );
      setData([]);
      setTotalItems(0);
      setPageCount(1);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    sortConfig,
    searchQuery,
    selectedRoleFilter,
    selectedStatusFilter,
    t,
    columns, // Thêm columns dependency
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handlers ---
  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
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
  const handleApplyFiltersAndSearch = () => {
    setCurrentPage(0);
    setSearchQuery(searchInput);
  };
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleApplyFiltersAndSearch();
    }
  };
  const handleRoleFilterChange = (event) => {
    setCurrentPage(0);
    setSelectedRoleFilter(event.target.value);
  };
  const handleStatusFilterChange = (event) => {
    setCurrentPage(0);
    setSelectedStatusFilter(event.target.value);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setModalData({});
      setModalMode(null);
      setFormErrors({});
    }, 300);
  };

  const validateAdminForm = (formData, mode) => {
    const errors = {};
    const fieldsToValidate = mode === "add" ? addFields : editFields;
    fieldsToValidate.forEach((f) => {
      if (f.readOnly && mode === "edit") return;
      if (
        f.required !== false &&
        !formData[f.key] &&
        !(
          mode === "edit" &&
          (f.key === "password" || f.key === "confirmPassword")
        )
      ) {
        errors[f.key] = `Vui lòng nhập ${f.label.toLowerCase()}.`;
      }
    });
    if (!formData.fullname) {
      errors.fullname = "Vui lòng nhập họ và tên.";
    }
    if (mode === "add" && !formData.birthday) {
      errors.birthday = "Vui lòng chọn ngày sinh.";
    }
    if (!formData.email) {
      errors.email = "Vui lòng nhập email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email không hợp lệ.";
    }
    if (mode === "add" && !formData.password) {
      errors.password = "Vui lòng nhập mật khẩu.";
    } else if (
      mode === "add" &&
      formData.password &&
      formData.password.length < 6
    ) {
      errors.password = "Mật khẩu > 6 ký tự.";
    }
    if (mode === "add" && !formData.confirmPassword) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    } else if (
      mode === "add" &&
      formData.password !== formData.confirmPassword
    ) {
      errors.confirmPassword = "Mật khẩu không khớp.";
    }
    if (!formData.homeAddress) {
      errors.homeAddress = "Vui lòng nhập địa chỉ.";
    }
    if (!formData.gender) {
      errors.gender = "Vui lòng chọn giới tính.";
    }
    if (!formData.roleId) {
      errors.roleId = "Vui lòng chọn vai trò.";
    }
    return errors;
  };

  const handleCreateAdmin = async (formData) => {
    const errors = validateAdminForm(formData, "add");
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.warn("Kiểm tra lại thông tin.");
      return;
    }
    setFormErrors({});
    setIsSubmitting(true);
    try {
      const responsePayload = await Api({
        endpoint: "admin/create-admin",
        method: METHOD_TYPE.POST,
        data: formData,
      });
      if (responsePayload.success) {
        toast.success("Thêm thành công");
        setSortConfig({ key: "createdAt", direction: "desc" });
        if (currentPage !== 0) setCurrentPage(0);
        else fetchData();
        handleCloseModal();
      } else {
        const msg = responsePayload?.message || "Thêm thất bại.";
        toast.error(msg);
        if (responsePayload?.errors) setFormErrors(responsePayload.errors);
      }
    } catch (err) {
      toast.error(`Thêm thất bại: ${err.message || "Lỗi"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAdmin = async (formData) => {
    const errors = validateAdminForm(formData, "edit");
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.warn("Kiểm tra lại thông tin.");
      return;
    }
    setFormErrors({});
    setIsSubmitting(true);
    const allowed = [
      "fullname",
      "birthday",
      "email",
      "homeAddress",
      "gender",
      "roleId",
    ];
    const filtered = Object.keys(formData)
      .filter((k) => allowed.includes(k))
      .reduce((o, k) => {
        if (formData[k] != null) o[k] = formData[k];
        return o;
      }, {});
    if (Object.keys(filtered).length === 0) {
      toast.info("Không có gì thay đổi.");
      setIsSubmitting(false);
      handleCloseModal();
      return;
    }
    try {
      const responsePayload = await Api({
        endpoint: `admin/update-admin-by-id/${modalData.adminId}`,
        method: METHOD_TYPE.PUT,
        data: filtered,
      });
      if (responsePayload.success) {
        toast.success("Cập nhật thành công");
        fetchData();
        handleCloseModal();
      } else {
        const msg = responsePayload?.message || "Cập nhật thất bại.";
        toast.error(msg);
        if (responsePayload?.errors) setFormErrors(responsePayload.errors);
      }
    } catch (err) {
      toast.error(`Cập nhật thất bại: ${err.message || "Lỗi"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (adminId) => {
    setDeleteItemId(adminId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;
    setIsDeleting(true);
    try {
      const responsePayload = await Api({
        endpoint: `admin/delete-admin-by-id/${deleteItemId}`,
        method: METHOD_TYPE.DELETE,
      });
      if (responsePayload.success) {
        toast.success("Xóa thành công!");
        if (data.length === 1 && currentPage > 0)
          setCurrentPage(currentPage - 1);
        else fetchData();
      } else {
        toast.error(`Xóa thất bại: ${responsePayload?.message || "Lỗi"}`);
      }
    } catch (err) {
      toast.error(`Xóa thất bại: ${err.message || "Lỗi"}`);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
    }
  };

  const handleLock = async (admin) => {
    if (!admin?.adminId) return;
    const newStatus = admin.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const actionText = newStatus === "ACTIVE" ? "Mở khóa" : "Khóa";
    const name = admin.adminProfile?.fullname || admin.adminId;
    if (!window.confirm(`Bạn chắc muốn ${actionText} tài khoản "${name}"?`))
      return;
    try {
      const responsePayload = await Api({
        endpoint: `admin/update-admin-by-id/${admin.adminId}`,
        method: METHOD_TYPE.PUT,
        data: { status: newStatus },
      });
      if (responsePayload.success) {
        setData((prev) =>
          prev.map((item) =>
            item.adminId === admin.adminId
              ? { ...item, status: newStatus }
              : item
          )
        );
        toast.success(`${actionText} tài khoản "${name}" thành công!`);
      } else {
        toast.error(
          `${actionText} thất bại: ${responsePayload?.message || "Lỗi"}`
        );
      }
    } catch (err) {
      toast.error(`${actionText} thất bại: ${err.message || "Lỗi"}`);
    }
  };

  // --- Handlers mở Modal ---
  const handleAddAdmin = () => {
    setModalMode("add");
    setModalData({
      fullname: "",
      birthday: "",
      email: "",
      phoneNumber: "",
      homeAddress: "",
      gender: "MALE",
      roleId: "ADMIN",
      password: "",
      confirmPassword: "",
    });
    setIsModalOpen(true);
    setFormErrors({});
  };
  const handleView = (admin) => {
    const p = admin.adminProfile || {};
    setModalData({
      adminId: admin.adminId,
      fullname: p.fullname || "",
      phoneNumber: admin.phoneNumber || "",
      email: admin.email || "",
      homeAddress: p.homeAddress || "",
      birthday: p.birthday || "",
      gender: p.gender || "",
      roleId: admin.roleId || "",
      status: admin.status || "",
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    });
    setModalMode("view");
    setIsModalOpen(true);
  };
  const handleEdit = (admin) => {
    const p = admin.adminProfile || {};
    setModalData({
      adminId: admin.adminId,
      fullname: p.fullname || "",
      phoneNumber: admin.phoneNumber || "",
      email: admin.email || "",
      homeAddress: p.homeAddress || "",
      birthday: p.birthday ? format(parseISO(p.birthday), "yyyy-MM-dd") : "",
      gender: p.gender || "MALE",
      roleId: admin.roleId || "ADMIN",
      status: admin.status || "",
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    });
    setModalMode("edit");
    setIsModalOpen(true);
    setFormErrors({});
  };

  // --- Fields (useMemo) ---
  const addFields = useMemo(
    () => [
      { key: "fullname", label: t("admin.name"), required: true },
      {
        key: "birthday",
        label: t("admin.birthday"),
        type: "date",
        required: true,
      },
      { key: "email", label: t("admin.email"), type: "email", required: true },
      { key: "phoneNumber", label: t("admin.phone"), required: true },
      {
        key: "homeAddress",
        label: t("admin.homeAddress"),
        type: "textarea",
        required: true,
      },
      {
        key: "gender",
        label: t("admin.gender"),
        type: "select",
        options: [
          { label: "Nam", value: "MALE" },
          { label: "Nữ", value: "FEMALE" },
        ],
        required: true,
      },
      {
        key: "roleId",
        label: "Vai trò",
        type: "select",
        options: [
          { label: "Quản trị viên", value: "BEST_ADMIN" },
          { label: "Nhân viên", value: "ADMIN" },
        ],
        required: true,
      },
      {
        key: "password",
        label: t("admin.password"),
        type: "password",
        required: true,
      },
      {
        key: "confirmPassword",
        label: t("admin.confirmPassword"),
        type: "password",
        required: true,
      },
    ],
    [t]
  );
  const editFields = useMemo(
    () => [
      { key: "adminId", label: "Mã NV", readOnly: true },
      { key: "fullname", label: t("admin.name"), required: true },
      { key: "email", label: t("admin.email"), type: "email", required: true },
      { key: "phoneNumber", label: t("admin.phone"), readOnly: true },
      {
        key: "homeAddress",
        label: t("admin.homeAddress"),
        type: "textarea",
        required: true,
      },
      {
        key: "birthday",
        label: t("admin.birthday"),
        type: "date",
        required: true,
        renderValue: (v) => formatDate(v),
      },
      {
        key: "gender",
        label: t("admin.gender"),
        type: "select",
        options: [
          { label: "Nam", value: "MALE" },
          { label: "Nữ", value: "FEMALE" },
        ],
        required: true,
      },
      {
        key: "roleId",
        label: "Vai trò",
        type: "select",
        options: [
          { label: "Quản trị viên", value: "BEST_ADMIN" },
          { label: "Nhân viên", value: "ADMIN" },
        ],
        required: true,
      },
      {
        key: "status",
        label: "Trạng thái",
        readOnly: true,
        renderValue: (v) => (v === "ACTIVE" ? "Hoạt động" : "Đã khóa"),
      },
      {
        key: "createdAt",
        label: "Ngày tạo",
        readOnly: true,
        renderValue: (v) => formatDate(v, "dd/MM/yyyy HH:mm"),
      },
      {
        key: "updatedAt",
        label: "Cập nhật",
        readOnly: true,
        renderValue: (v) => formatDate(v, "dd/MM/yyyy HH:mm"),
      },
    ],
    [t]
  );

  // --- JSX Render ---
  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        <h2 className="admin-list-title">Danh sách nhân viên</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            <SearchBar
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchKeyPress}
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
              placeholder="Tìm kiếm Mã NV, Tên, SĐT, Email..."
            />
            <div className="filter-control">
              {" "}
              <label htmlFor="roleFilter" className="filter-label">
                Vai trò:
              </label>{" "}
              <select
                id="roleFilter"
                value={selectedRoleFilter}
                onChange={handleRoleFilterChange}
                className="status-filter-select"
              >
                {" "}
                {roleFilterOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}{" "}
              </select>{" "}
            </div>
            <div className="filter-control">
              {" "}
              <label htmlFor="statusFilter" className="filter-label">
                Trạng thái:
              </label>{" "}
              <select
                id="statusFilter"
                value={selectedStatusFilter}
                onChange={handleStatusFilterChange}
                className="status-filter-select"
              >
                {" "}
                {statusFilterOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}{" "}
              </select>{" "}
            </div>
            <button
              className="refresh-button"
              onClick={handleApplyFiltersAndSearch}
              title="Áp dụng"
              aria-label="Áp dụng"
            >
              {" "}
              <i className="fa-solid fa-search"></i>{" "}
            </button>
            <button
              className="refresh-button"
              onClick={resetState}
              title="Làm mới"
              aria-label="Làm mới"
            >
              {" "}
              <i className="fa-solid fa-rotate-left"></i>{" "}
            </button>
          </div>
          <div className="filter-add-admin">
            {" "}
            <button className="add-admin-button" onClick={handleAddAdmin}>
              {" "}
              {t("common.addButton")}{" "}
            </button>{" "}
          </div>
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Table
          columns={columns}
          data={data}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onLock={handleLock}
          showLock={true}
          statusKey="status"
          pageCount={pageCount}
          onPageChange={handlePageClick}
          forcePage={currentPage}
          onSort={handleSort}
          loading={isLoading}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          currentSortConfig={sortConfig}
        />
        {!isLoading && !error && (
          <p
            style={{
              textAlign: "right",
              marginTop: "1rem",
              fontSize: "0.9em",
              color: "#555",
            }}
          >
            {" "}
            Tổng số: {totalItems}{" "}
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
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        contentLabel="..."
        className="modal"
        overlayClassName="overlay"
        closeTimeoutMS={300}
      >
        {modalMode && (
          <FormDetail
            formData={modalData}
            fields={modalMode === "add" ? addFields : editFields}
            mode={modalMode}
            onChange={(name, value) => {
              setModalData((prev) => ({ ...prev, [name]: value }));
              if (formErrors[name]) {
                setFormErrors((prev) => ({ ...prev, [name]: "" }));
              }
            }}
            onSubmit={
              modalMode === "add" ? handleCreateAdmin : handleUpdateAdmin
            }
            title={
              modalMode === "add"
                ? "Thêm nhân viên"
                : modalMode === "edit"
                ? "Sửa thông tin"
                : "Xem thông tin"
            }
            onClose={handleCloseModal}
            errors={formErrors}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message="Bạn có chắc muốn xóa nhân viên này? Không thể hoàn tác."
        isDeleting={isDeleting}
      />
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </AdminDashboardLayout>
  );
};

const ListOfAdmin = React.memo(ListOfAdminPage);
export default ListOfAdmin;
