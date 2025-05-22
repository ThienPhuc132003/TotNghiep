/* eslint-disable no-undef */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css"; // Shared styles
import "../../assets/css/Modal.style.css"; // Modal styles
import Table from "../../components/Table";
import SearchBar from "../../components/SearchBar";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import FormDetail from "../../components/FormDetail";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
// qs không cần thiết nữa nếu Api class tự xử lý
// import qs from "qs";
import { Alert } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import numeral from "numeral";
import "numeral/locales/vi";

Modal.setAppElement("#root");

// Helper format tiền tệ
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return "N/A";
  }
  numeral.locale("vi");
  return numeral(value).format("0,0 đ");
};

// Searchable Columns for Tutor Levels
const searchableTutorLevelColumnOptions = [
  { value: "tutorLevelId", label: "Mã hạng" },
  { value: "levelName", label: "Tên hạng" },
  { value: "salary", label: "Lương", placeholderSuffix: " (số)" }, // Gợi ý nhập số
  // { value: "description", label: "Mô tả" }, // Bỏ tìm theo mô tả nếu không cần
];

const ListOfTutorLevelPage = () => {
  const { t } = useTranslation();
  // --- States ---
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [searchInput, setSearchInput] = useState("");
  const [selectedSearchField, setSelectedSearchField] = useState(
    searchableTutorLevelColumnOptions[0].value // Mặc định cột đầu tiên
  );
  const [appliedSearchInput, setAppliedSearchInput] = useState("");
  const [appliedSearchField, setAppliedSearchField] = useState(
    searchableTutorLevelColumnOptions[0].value
  );

  const [sortConfig, setSortConfig] = useState({
    key: "levelName",
    direction: "asc",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const [modalMode, setModalMode] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const currentPath = "/hang-gia-su";

  // --- Reset State ---
  const resetState = useCallback(() => {
    setSearchInput("");
    setSelectedSearchField(searchableTutorLevelColumnOptions[0].value);
    setAppliedSearchInput("");
    setAppliedSearchField(searchableTutorLevelColumnOptions[0].value);
    setSortConfig({ key: "levelName", direction: "asc" });
    setCurrentPage(0);
  }, []);

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filterConditions = [];
      if (appliedSearchInput && appliedSearchField) {
        filterConditions.push({
          key: appliedSearchField,
          // Nếu tìm 'salary' mà backend cần 'equal' thì phải xử lý riêng
          operator: appliedSearchField === "salary" ? "equal" : "like",
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

      console.log("Fetching tutor levels with query:", query);
      const response = await Api({
        endpoint: `tutor-level/search`,
        method: METHOD_TYPE.GET,
        query: query,
      });
      console.log("API Response (Tutor Levels):", response);

      if (response.success && response.data) {
        setData(response.data.items || []);
        setTotalItems(response.data.total || 0);
        setPageCount(Math.ceil((response.data.total || 0) / itemsPerPage));
      } else {
        throw new Error(response.message || t("common.errorLoadingData"));
      }
    } catch (errorCatch) {
      console.error("Fetch tutor level error:", errorCatch);
      const errorMessage = errorCatch.message || t("common.errorLoadingData");
      setError(errorMessage);
      setData([]);
      setTotalItems(0);
      setPageCount(1);
      toast.error(`Tải danh sách hạng thất bại: ${errorMessage}`);
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

  useEffect(() => {
    numeral.locale("vi");
  }, []);

  // --- Handlers ---
  const handlePageClick = (event) => {
    if (typeof event.selected === "number") setCurrentPage(event.selected);
  };

  const handleSearchInputChange = (value) => {
    setSearchInput(value);
  };

  const handleSearchFieldChange = (event) => {
    setSelectedSearchField(event.target.value);
  };

  const handleApplySearch = () => {
    if (searchInput.trim() || selectedSearchField !== appliedSearchField) {
      if (searchInput.trim()) {
        setAppliedSearchField(selectedSearchField);
        setAppliedSearchInput(searchInput);
      } else {
        setAppliedSearchField(selectedSearchField);
        setAppliedSearchInput("");
      }
    } else if (!searchInput.trim() && appliedSearchInput) {
      setAppliedSearchInput("");
    }
    setCurrentPage(0);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") handleApplySearch();
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

  // --- CRUD Handlers (giữ nguyên) ---
  const handleDelete = (tutorLevel) => {
    if (!tutorLevel || !tutorLevel.tutorLevelId) return;
    const levelName = tutorLevel.levelName || tutorLevel.tutorLevelId;
    setDeleteItemId(tutorLevel.tutorLevelId);
    setDeleteMessage(`Bạn có chắc muốn xóa hạng "${levelName}"?`);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;
    setIsDeleting(true);
    try {
      const response = await Api({
        endpoint: `tutor-level/delete/${deleteItemId}`,
        method: METHOD_TYPE.DELETE,
      });
      if (response.success) {
        toast.success("Xóa thành công");
        if (data.length === 1 && currentPage > 0)
          setCurrentPage(currentPage - 1);
        else fetchData();
      } else {
        toast.error(
          `Xóa thất bại: ${response.message || "Hạng đang được sử dụng"}`
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

  const handleAddTutorLevel = () => {
    setModalMode("add");
    setModalData({ levelName: "", salary: "", description: "" });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleView = (tutorLevel) => {
    setModalData({
      tutorLevelId: tutorLevel.tutorLevelId,
      levelName: tutorLevel.levelName || "",
      salary: tutorLevel.salary ?? "",
      description: tutorLevel.description || "",
    });
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (tutorLevel) => {
    setModalData({
      tutorLevelId: tutorLevel.tutorLevelId,
      levelName: tutorLevel.levelName || "",
      salary: tutorLevel.salary ?? "",
      description: tutorLevel.description || "",
    });
    setModalMode("edit");
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      // Đợi animation nếu có
      setModalData({});
      setModalMode(null);
      setFormErrors({});
    }, 300);
  };

  const validateForm = (formData) => {
    let errors = {};
    if (!formData.levelName?.trim())
      errors.levelName = "Vui lòng nhập tên hạng.";
    if (
      formData.salary === null ||
      formData.salary === undefined ||
      String(formData.salary).trim() === ""
    ) {
      errors.salary = "Vui lòng nhập lương.";
    } else if (isNaN(Number(formData.salary))) {
      errors.salary = "Lương phải là một số.";
    } else if (Number(formData.salary) < 0) {
      errors.salary = "Lương không được âm.";
    }
    if (!formData.description?.trim())
      errors.description = "Vui lòng nhập mô tả.";
    return errors;
  };

  const handleFormSubmit = async (formData) => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.warn("Vui lòng kiểm tra lại thông tin nhập.");
      return;
    }
    setFormErrors({});
    setIsSubmitting(true);
    const apiData = {
      levelName: formData.levelName,
      salary: Number(formData.salary),
      description: formData.description,
    };
    try {
      let response;
      if (modalMode === "add") {
        response = await Api({
          endpoint: "tutor-level/create",
          method: METHOD_TYPE.POST,
          data: apiData,
        });
      } else if (modalMode === "edit") {
        response = await Api({
          endpoint: `tutor-level/update/${modalData.tutorLevelId}`,
          method: METHOD_TYPE.PUT,
          data: apiData,
        });
      } else return;

      if (response.success) {
        const successMsg =
          modalMode === "add"
            ? "Thêm hạng thành công"
            : "Cập nhật hạng thành công";
        toast.success(successMsg);
        if (modalMode === "add") {
          setSortConfig({ key: "levelName", direction: "asc" });
          if (currentPage !== 0) setCurrentPage(0);
          else fetchData();
        } else fetchData();
        handleCloseModal();
      } else {
        const errorMsg =
          modalMode === "add" ? "Thêm hạng thất bại" : "Cập nhật hạng thất bại";
        toast.error(`${errorMsg}: ${response.message || "Lỗi không xác định"}`);
        if (response.errors) setFormErrors(response.errors);
      }
    } catch (errorCatch) {
      const errorMsg =
        modalMode === "add" ? "Thêm hạng thất bại" : "Cập nhật hạng thất bại";
      toast.error(`${errorMsg}: ${errorCatch.message || "Lỗi mạng"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Columns Definition ---
  const columns = useMemo(
    () => [
      { title: "Mã hạng", dataKey: "tutorLevelId", sortable: true },
      { title: "Tên hạng", dataKey: "levelName", sortable: true },
      {
        title: "Lương",
        dataKey: "salary",
        sortable: true,
        renderCell: formatCurrency,
      },
      { title: "Mô tả", dataKey: "description", sortable: false }, // Mô tả thường dài, không nên sort
    ],
    []
  );

  // --- Fields Definition ---
  const addFields = useMemo(
    () => [
      { key: "levelName", label: "Tên hạng", required: true },
      {
        key: "salary",
        label: "Lương (VNĐ)",
        type: "number",
        required: true,
        placeholder: "Nhập số tiền",
      },
      { key: "description", label: "Mô tả", type: "textarea", required: true },
    ],
    []
  );

  const editFields = useMemo(
    () => [
      { key: "tutorLevelId", label: "Mã hạng", readOnly: true },
      { key: "levelName", label: "Tên hạng", required: true },
      {
        key: "salary",
        label: "Lương (VNĐ)",
        type: "number",
        required: true,
        placeholder: "Nhập số tiền",
        renderValue: formatCurrency,
      },
      { key: "description", label: "Mô tả", type: "textarea", required: true },
    ],
    []
  );

  // --- JSX Render ---
  const currentSearchFieldConfig = useMemo(
    () =>
      searchableTutorLevelColumnOptions.find(
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
        <h2 className="admin-list-title">Danh sách hạng gia sư</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            {/* Select chọn cột tìm kiếm */}
            <div className="filter-control">
              <select
                id="searchFieldSelectTutorLevel"
                value={selectedSearchField}
                onChange={handleSearchFieldChange}
                className="status-filter-select"
                aria-label="Chọn trường để tìm kiếm"
              >
                {searchableTutorLevelColumnOptions.map((option) => (
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
              className="refresh-button"
              onClick={handleApplySearch}
              title="Tìm kiếm"
              aria-label="Tìm kiếm"
              disabled={isLoading}
            >
              <i className="fa-solid fa-search"></i>
            </button>
            <button
              className="refresh-button"
              onClick={resetState}
              title="Làm mới"
              aria-label="Làm mới"
              disabled={isLoading}
            >
              <i className="fa-solid fa-rotate-left"></i>
            </button>
          </div>
          <div className="filter-add-admin">
            <button
              className="add-admin-button"
              onClick={handleAddTutorLevel}
              disabled={isLoading || isSubmitting}
            >
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
          showLock={false}
          pageCount={pageCount}
          onPageChange={handlePageClick}
          forcePage={currentPage}
          onSort={handleSort}
          currentSortConfig={sortConfig}
          loading={isLoading || isDeleting || isSubmitting}
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
            Tổng số hạng gia sư: {totalItems}
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
            Không có dữ liệu hạng gia sư.
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
            ? "Thêm hạng gia sư"
            : modalMode === "edit"
            ? "Sửa hạng gia sư"
            : "Xem hạng gia sư"
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
            title={
              modalMode === "add"
                ? "Thêm hạng gia sư"
                : modalMode === "edit"
                ? "Sửa thông tin hạng gia sư"
                : "Xem thông tin hạng gia sư"
            }
            onChange={(name, value) => {
              setModalData({ ...modalData, [name]: value });
              if (formErrors[name])
                setFormErrors({ ...formErrors, [name]: "" });
            }}
            onSubmit={handleFormSubmit}
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

const ListOfTutorLevel = React.memo(ListOfTutorLevelPage);
export default ListOfTutorLevel;
