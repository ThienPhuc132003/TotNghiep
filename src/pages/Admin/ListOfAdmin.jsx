  /* eslint-disable no-undef */
  import React, { useCallback, useEffect, useState, useMemo } from "react";
  import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
  import "../../assets/css/Admin/ListOfAdmin.style.css"; // Sử dụng file CSS chung
  import "../../assets/css/Modal.style.css"; // CSS cho Modal (react-modal)
  import Table from "../../components/Table";
  import SearchBar from "../../components/SearchBar";
  import Api from "../../network/Api";
  import { METHOD_TYPE } from "../../network/methodType";
  import FormDetail from "../../components/FormDetail";
  import { useTranslation } from "react-i18next";
  import Modal from "react-modal";
  import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
  import { Alert } from "@mui/material";
  import { toast, ToastContainer } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";
  import { format, parseISO, isValid } from "date-fns";

  // Set the app element for accessibility
  Modal.setAppElement("#root");

  // Định nghĩa các lựa chọn cho bộ lọc vai trò
  const roleFilterOptions = [
    { value: "", label: "Tất cả vai trò" },
    { value: "BEST_ADMIN", label: "Quản trị viên" },
    { value: "ADMIN", label: "Nhân viên" },
  ];
  // Định nghĩa các lựa chọn cho bộ lọc trạng thái
  const statusFilterOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "ACTIVE", label: "Hoạt động" },
    { value: "BLOCKED", label: "Đã khóa" },
  ];

  // Định nghĩa các cột có thể tìm kiếm
  const searchableColumnOptions = [
    { value: "adminId", label: "Mã NV" }, // Mã NV là mặc định
    { value: "adminProfile.fullname", label: "Tên" },
    { value: "phoneNumber", label: "Số điện thoại" },
    { value: "email", label: "Email" },
  ];

  // Helper định dạng ngày
  const formatDate = (dateString, formatString = "dd/MM/yyyy") => {
    if (!dateString) return "N/A";
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, formatString) : "Ngày không hợp lệ";
    } catch (e) {
      return "Lỗi ngày";
    }
  };

  // Helper lấy giá trị lồng nhau an toàn
  const getSafeNestedValue = (obj, path, defaultValue = "N/A") => {
    const value = path.split(".").reduce((acc, part) => acc && acc[part], obj);
    return value !== undefined && value !== null ? value : defaultValue;
  };

  const ListOfAdminPage = () => {
    const { t } = useTranslation();
    // --- States ---
    const [data, setData] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [pageCount, setPageCount] = useState(1);

    const [searchInput, setSearchInput] = useState("");
    // selectedSearchField giờ mặc định là cột đầu tiên trong searchableColumnOptions
    const [selectedSearchField, setSelectedSearchField] = useState(searchableColumnOptions[0].value);

    const [appliedSearchInput, setAppliedSearchInput] = useState("");
    // appliedSearchField cũng mặc định là cột đầu tiên
    const [appliedSearchField, setAppliedSearchField] = useState(searchableColumnOptions[0].value);

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
    const [deleteMessage, setDeleteMessage] = useState("");
    const [error, setError] = useState(null);
    const currentPath = "/nhan-vien";

    // --- Columns Definition ---
    const columns = useMemo(
      () => [
        { title: "Mã NV", dataKey: "adminId", sortable: true },
        {
          title: t("admin.name"),
          dataKey: "adminProfile.fullname",
          sortKey: "adminProfile.fullname",
          sortable: true,
          renderCell: (_, row) =>
            getSafeNestedValue(row, "adminProfile.fullname", "..."),
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
    const resetState = useCallback(() => {
      setSearchInput("");
      setSelectedSearchField(searchableColumnOptions[0].value); // Reset về cột mặc định
      setAppliedSearchInput("");
      setAppliedSearchField(searchableColumnOptions[0].value); // Reset applied field về cột mặc định
      setSelectedRoleFilter("");
      setSelectedStatusFilter("");
      setSortConfig({ key: "createdAt", direction: "desc" });
      setCurrentPage(0);
    }, []);

    // --- Fetch Data ---
    const fetchData = useCallback(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const finalFilterConditions = [];

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
        // Sử dụng giá trị đã áp dụng cho tìm kiếm
        // appliedSearchField sẽ luôn có giá trị (cột mặc định)
        // Chỉ thêm filter nếu appliedSearchInput có giá trị
        if (appliedSearchInput && appliedSearchField) {
          finalFilterConditions.push({
            key: appliedSearchField,
            operator: "like",
            value: appliedSearchInput,
          });
        }

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

        const responsePayload = await Api({
          endpoint: `admin/search`,
          method: METHOD_TYPE.GET,
          query: query,
        });

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
      } catch (errorCatch) {
        console.error("Fetch data error caught:", errorCatch.message || errorCatch);
        const errorMessage = errorCatch.message || t("common.errorLoadingData") || "Có lỗi xảy ra khi tải dữ liệu.";
        setError(errorMessage);
        setData([]);
        setTotalItems(0);
        setPageCount(1);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }, [
      currentPage,
      itemsPerPage,
      sortConfig,
      appliedSearchInput,
      appliedSearchField,
      selectedRoleFilter,
      selectedStatusFilter,
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
      const newField = event.target.value;
      setSelectedSearchField(newField);
      // Nếu muốn reset search input khi đổi cột, hoặc search ngay, thêm logic ở đây
    };

    const handleApplyFiltersAndSearch = () => {
      // selectedSearchField sẽ luôn có giá trị
      if (searchInput.trim()) {
        setAppliedSearchField(selectedSearchField); // Luôn lấy field đang được chọn
        setAppliedSearchInput(searchInput);
      } else {
        // Nếu không có input, xóa điều kiện search đã áp dụng (nếu có)
        // và đảm bảo appliedSearchField vẫn là field đang được chọn (hoặc field mặc định)
        setAppliedSearchField(selectedSearchField);
        setAppliedSearchInput("");
      }
      setCurrentPage(0);
    };

    const handleSearchKeyPress = (e) => {
      if (e.key === "Enter") {
        // selectedSearchField luôn có giá trị
        if (searchInput.trim()) {
          handleApplyFiltersAndSearch();
        }
        // Nếu không có input, nhấn Enter không làm gì (hoặc có thể coi là xóa filter search nếu muốn)
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
        const value = getSafeNestedValue(formData, f.key, null);
        const isPasswordEdit =
          mode === "edit" &&
          (f.key === "password" || f.key === "confirmPassword");

        if (
          f.required !== false &&
          !isPasswordEdit &&
          (value === null || String(value).trim() === "")
        ) {
          errors[f.key] = `Vui lòng nhập ${f.label.toLowerCase()}.`;
        }
      });

      if (!formData.fullname?.trim())
        errors.fullname = "Vui lòng nhập họ và tên.";
      if (mode === "add" && !formData.birthday)
        errors.birthday = "Vui lòng chọn ngày sinh.";
      if (!formData.email?.trim()) errors.email = "Vui lòng nhập email.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        errors.email = "Email không hợp lệ.";
      if (mode === "add") {
        if (!formData.password) errors.password = "Vui lòng nhập mật khẩu.";
        else if (formData.password.length < 6)
          errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
        if (!formData.confirmPassword)
          errors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
        else if (formData.password !== formData.confirmPassword)
          errors.confirmPassword = "Mật khẩu không khớp.";
      }
      if (!formData.homeAddress?.trim())
        errors.homeAddress = "Vui lòng nhập địa chỉ.";
      if (!formData.gender) errors.gender = "Vui lòng chọn giới tính.";
      if (!formData.roleId) errors.roleId = "Vui lòng chọn vai trò.";

      return errors;
    };

    const handleCreateAdmin = async (formData) => {
      const errors = validateAdminForm(formData, "add");
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        toast.warn("Vui lòng kiểm tra lại thông tin nhập.");
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
          toast.success("Thêm nhân viên thành công!");
          setSortConfig({ key: "createdAt", direction: "desc" });
          if (currentPage !== 0) {
            setCurrentPage(0);
          } else {
            fetchData();
          }
          handleCloseModal();
        } else {
          const msg = responsePayload?.message || "Thêm nhân viên thất bại.";
          toast.error(msg);
          if (responsePayload?.errors) setFormErrors(responsePayload.errors);
        }
      } catch (err) {
        console.error("Create admin error:", err);
        toast.error(
          `Thêm nhân viên thất bại: ${err.message || "Lỗi không xác định"}`
        );
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleUpdateAdmin = async (formData) => {
      const errors = validateAdminForm(formData, "edit");
      delete errors.password;
      delete errors.confirmPassword;

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        toast.warn("Vui lòng kiểm tra lại thông tin nhập.");
        return;
      }
      setFormErrors({});
      setIsSubmitting(true);

      const allowedUpdateFields = [
        "fullname",
        "birthday",
        "email",
        "homeAddress",
        "gender",
        "roleId",
      ];
      const updateData = {};
      allowedUpdateFields.forEach((key) => {
        if (formData[key] !== undefined && formData[key] !== null) {
          updateData[key] = formData[key];
        }
      });

      try {
        const responsePayload = await Api({
          endpoint: `admin/update-admin-by-id/${modalData.adminId}`,
          method: METHOD_TYPE.PUT,
          data: updateData,
        });
        if (responsePayload.success) {
          toast.success("Cập nhật thông tin thành công!");
          fetchData();
          handleCloseModal();
        } else {
          const msg = responsePayload?.message || "Cập nhật thất bại.";
          toast.error(msg);
          if (responsePayload?.errors) setFormErrors(responsePayload.errors);
        }
      } catch (err) {
        console.error("Update admin error:", err);
        toast.error(`Cập nhật thất bại: ${err.message || "Lỗi không xác định"}`);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleDelete = (admin) => {
      if (!admin || !admin.adminId) return;
      const adminName = getSafeNestedValue(
        admin,
        "adminProfile.fullname",
        admin.adminId
      );
      setDeleteItemId(admin.adminId);
      setDeleteMessage(
        `Bạn có chắc muốn xóa nhân viên "${adminName}"?`
      );
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
          toast.success("Xóa nhân viên thành công!");
          if (data.length === 1 && currentPage > 0) {
            setCurrentPage(currentPage - 1);
          } else {
            fetchData();
          }
        } else {
          toast.error(
            `Xóa thất bại: ${responsePayload?.message || "Lỗi không xác định"}`
          );
        }
      } catch (err) {
        console.error("Delete admin error:", err);
        toast.error(`Xóa thất bại: ${err.message || "Lỗi không xác định"}`);
      } finally {
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
        setDeleteItemId(null);
        setDeleteMessage("");
      }
    };

    const handleLock = async (admin) => {
      if (!admin?.adminId) return;
      const newStatus = admin.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
      const actionText = newStatus === "ACTIVE" ? "Mở khóa" : "Khóa";
      const name = getSafeNestedValue(
        admin,
        "adminProfile.fullname",
        admin.adminId
      );

      if (!window.confirm(`Bạn chắc muốn ${actionText} tài khoản "${name}"?`))
        return;

      try {
        const responsePayload = await Api({
          endpoint: `admin/update-admin-by-id/${admin.adminId}`,
          method: METHOD_TYPE.PUT,
          data: { status: newStatus },
        });
        if (responsePayload.success) {
          setData((prevData) =>
            prevData.map((item) =>
              item.adminId === admin.adminId
                ? { ...item, status: newStatus }
                : item
            )
          );
          toast.success(`${actionText} tài khoản "${name}" thành công!`);
        } else {
          toast.error(
            `${actionText} thất bại: ${
              responsePayload?.message || "Lỗi không xác định"
            }`
          );
        }
      } catch (err) {
        console.error("Lock/Unlock admin error:", err);
        toast.error(
          `${actionText} thất bại: ${err.message || "Lỗi không xác định"}`
        );
      }
    };

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
      });
      setModalMode("edit");
      setIsModalOpen(true);
      setFormErrors({});
    };

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
          renderValue: (v) =>
            v === "MALE" ? "Nam" : v === "FEMALE" ? "Nữ" : "Không xác định",
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
          renderValue: (v) =>
            v === "BEST_ADMIN"
              ? "Quản trị viên"
              : v === "ADMIN"
              ? "Nhân viên"
              : "Không xác định",
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
          renderValue: (v) =>
            v ? formatDate(v, "dd/MM/yyyy HH:mm") : "Chưa cập nhật",
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
              <div className="filter-control">
                <select
                  id="searchFieldSelect"
                  value={selectedSearchField}
                  onChange={handleSearchFieldChange}
                  className="status-filter-select"
                  aria-label="Chọn trường để tìm kiếm"
                >
                  {searchableColumnOptions.map((option) => (
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
                placeholder={
                  searchableColumnOptions.find(opt => opt.value === selectedSearchField)
                  ? `Nhập ${searchableColumnOptions.find(opt => opt.value === selectedSearchField)?.label.toLowerCase()}...`
                  : "Nhập tìm kiếm..." // Fallback placeholder
                }
                // SearchBar không còn bị disabled vì selectedSearchField luôn có giá trị
              />
              
              <div className="filter-control">
                <label htmlFor="roleFilter" className="filter-label">
                  Vai trò:
                </label>
                <select
                  id="roleFilter"
                  value={selectedRoleFilter}
                  onChange={handleRoleFilterChange}
                  className="status-filter-select"
                >
                  {roleFilterOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-control">
                <label htmlFor="statusFilter" className="filter-label">
                  Trạng thái:
                </label>
                <select
                  id="statusFilter"
                  value={selectedStatusFilter}
                  onChange={handleStatusFilterChange}
                  className="status-filter-select"
                >
                  {statusFilterOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="refresh-button"
                onClick={handleApplyFiltersAndSearch}
                title="Áp dụng bộ lọc & Tìm kiếm"
                aria-label="Áp dụng bộ lọc và tìm kiếm"
                disabled={isLoading || isSubmitting || (
                    // Disable nếu không có gì để tìm kiếm (input trống) VÀ không có filter nào được chọn
                    // VÀ các giá trị đã áp dụng giống hệt các giá trị hiện tại (tránh nhấn thừa)
                    !searchInput.trim() &&
                    !selectedRoleFilter &&
                    !selectedStatusFilter &&
                    appliedSearchInput === searchInput &&
                    appliedSearchField === selectedSearchField
                )}
              >
                <i className="fa-solid fa-search"></i>
              </button>
              <button
                className="refresh-button"
                onClick={resetState}
                title="Làm mới bộ lọc"
                aria-label="Làm mới bộ lọc"
                disabled={isLoading || isSubmitting}
              >
                <i className="fa-solid fa-rotate-left"></i>
              </button>
            </div>
            <div className="filter-add-admin">
              <button className="add-admin-button" onClick={handleAddAdmin}  disabled={isLoading || isSubmitting}>
                {t("common.addButton")}
              </button>
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
            totalItems={totalItems}
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
            currentSortConfig={sortConfig}
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
              Tổng số nhân viên: {totalItems}
            </p>
          )}
          {!isLoading && !error && data.length === 0 && totalItems === 0 && (
              <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "1em", color: "#777" }}>
                  Không có dữ liệu nhân viên.
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
          contentLabel={
            modalMode === "add"
              ? "Thêm nhân viên"
              : modalMode === "edit"
              ? "Sửa thông tin"
              : "Xem thông tin"
          }
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
                  ? "Sửa thông tin nhân viên"
                  : "Xem thông tin nhân viên"
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
          message={deleteMessage}
          isDeleting={isDeleting}
        />

        <ToastContainer position="top-right" autoClose={3000} theme="light" />
      </AdminDashboardLayout>
    );
  };

  const ListOfAdmin = React.memo(ListOfAdminPage);
  export default ListOfAdmin;