import React, { useState, useCallback, useEffect, useMemo } from "react";
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
import { Alert } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// qs không cần thiết nữa nếu Api class tự xử lý
// import qs from "qs";

Modal.setAppElement("#root");

// Searchable Columns for Majors
const searchableMajorColumnOptions = [
  { value: "majorId", label: "Mã ngành" },
  { value: "sumName", label: "Tên viết tắt" },
  { value: "majorName", label: "Tên ngành" },
];

const ListOfMajorPage = () => {
  const { t } = useTranslation();
  // --- States ---
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [searchInput, setSearchInput] = useState("");
  const [selectedSearchField, setSelectedSearchField] = useState(
    searchableMajorColumnOptions[0].value // Mặc định cột đầu tiên
  );
  const [appliedSearchInput, setAppliedSearchInput] = useState("");
  const [appliedSearchField, setAppliedSearchField] = useState(
    searchableMajorColumnOptions[0].value
  );

  const [sortConfig, setSortConfig] = useState({
    key: "majorName",
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

  const currentPath = "/nganh";

  // --- Reset State ---
  const resetState = useCallback(() => {
    setSearchInput("");
    setSelectedSearchField(searchableMajorColumnOptions[0].value);
    setAppliedSearchInput("");
    setAppliedSearchField(searchableMajorColumnOptions[0].value);
    setSortConfig({ key: "majorName", direction: "asc" });
    setCurrentPage(0);
  }, []);

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const filterConditions = [];
      if (appliedSearchInput && appliedSearchField) {
        filterConditions.push({
          key: appliedSearchField,
          operator: "like", // Hoặc 'equal' cho ID nếu backend hỗ trợ chính xác
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

      console.log("Fetching majors with query:", query);
      const response = await Api({
        endpoint: `major/search`, // Endpoint tìm kiếm ngành
        method: METHOD_TYPE.GET,
        query: query, // Truyền object query
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
      console.error("Fetch major error:", errorCatch);
      const errorMessage = errorCatch.message || t("common.errorLoadingData");
      setError(errorMessage);
      setData([]);
      setTotalItems(0);
      setPageCount(1);
      toast.error(`Tải danh sách ngành thất bại: ${errorMessage}`);
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

  // --- CRUD Handlers (giữ nguyên các handler khác) ---
  const handleDelete = (major) => {
    if (!major || !major.majorId) return;
    const majorName = major.majorName || major.majorId;
    setDeleteItemId(major.majorId);
    setDeleteMessage(`Bạn có chắc chắn muốn xóa ngành "${majorName}"?`);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;
    setIsDeleting(true);
    try {
      const response = await Api({
        endpoint: `major/delete/${deleteItemId}`,
        method: METHOD_TYPE.DELETE,
      });
      if (response.success) {
        toast.success("Xóa thành công");
        if (data.length === 1 && currentPage > 0) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchData();
        }
      } else {
        toast.error(
          `Xóa không thành công: ${response.message || "Lỗi không xác định"}`
        );
      }
    } catch (errorCatch) {
      toast.error(`Xóa không thành công: ${errorCatch.message || "Lỗi mạng"}`);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
      setDeleteMessage("");
      setIsDeleting(false);
    }
  };

  const handleAddMajor = () => {
    setModalMode("add");
    setModalData({ sumName: "", majorName: "" });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleView = (major) => {
    setModalData({
      majorId: major.majorId,
      sumName: major.sumName || "",
      majorName: major.majorName || "",
    });
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (major) => {
    setModalData({
      majorId: major.majorId,
      sumName: major.sumName || "",
      majorName: major.majorName || "",
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

  const validateMajorForm = (formData) => {
    const errors = {};
    if (!formData.majorName?.trim())
      errors.majorName = "Vui lòng nhập tên ngành.";
    // Thêm validate cho sumName nếu cần
    if (!formData.sumName?.trim())
      errors.sumName = "Vui lòng nhập tên viết tắt.";
    // Kiểm tra sumName không nên chứa khoảng trắng và nên viết hoa
    else if (/\s/.test(formData.sumName))
      errors.sumName = "Tên viết tắt không được chứa khoảng trắng.";
    else if (formData.sumName !== formData.sumName.toUpperCase())
      errors.sumName = "Tên viết tắt nên được viết hoa.";

    return errors;
  };

  const handleCreateMajor = async (formData) => {
    const errors = validateMajorForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.warn("Vui lòng kiểm tra lại thông tin nhập.");
      return;
    }
    setFormErrors({});
    setIsSubmitting(true);
    try {
      const response = await Api({
        endpoint: "major/create",
        method: METHOD_TYPE.POST,
        data: formData,
      });
      if (response.success) {
        toast.success("Thêm ngành thành công");
        setSortConfig({ key: "majorName", direction: "asc" });
        if (currentPage !== 0) setCurrentPage(0);
        else fetchData();
        handleCloseModal();
      } else {
        toast.error(
          `Thêm không thành công: ${response.message || "Lỗi không xác định"}`
        );
        if (response.errors) setFormErrors(response.errors);
      }
    } catch (errorCatch) {
      toast.error(`Thêm không thành công: ${errorCatch.message || "Lỗi mạng"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMajor = async (formData) => {
    const errors = validateMajorForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.warn("Vui lòng kiểm tra lại thông tin nhập.");
      return;
    }
    setFormErrors({});
    setIsSubmitting(true);
    try {
      const updateData = {
        sumName: formData.sumName,
        majorName: formData.majorName,
      };
      const response = await Api({
        endpoint: `major/update/${modalData.majorId}`,
        method: METHOD_TYPE.PUT,
        data: updateData,
      });
      if (response.success) {
        toast.success("Cập nhật thành công");
        fetchData();
        handleCloseModal();
      } else {
        toast.error(
          `Cập nhật không thành công: ${
            response.message || "Lỗi không xác định"
          }`
        );
        if (response.errors) setFormErrors(response.errors);
      }
    } catch (errorCatch) {
      toast.error(
        `Cập nhật không thành công: ${errorCatch.message || "Lỗi mạng"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Columns Definition ---
  const columns = useMemo(
    () => [
      { title: "Mã ngành", dataKey: "majorId", sortable: true },
      { title: "Tên viết tắt", dataKey: "sumName", sortable: true },
      { title: t("major.name"), dataKey: "majorName", sortable: true },
    ],
    [t]
  );

  // --- Fields Definition ---
  const addFields = useMemo(
    () => [
      {
        key: "sumName",
        label: "Tên viết tắt",
        placeholder: "Ví dụ: CNTT",
        required: true,
      }, // Thêm required
      {
        key: "majorName",
        label: "Tên ngành",
        required: true,
        placeholder: "Ví dụ: Công nghệ thông tin",
      },
    ],
    []
  );

  const editFields = useMemo(
    () => [
      { key: "majorId", label: "Mã ngành", readOnly: true },
      {
        key: "sumName",
        label: "Tên viết tắt",
        placeholder: "Ví dụ: CNTT",
        required: true,
      }, // Thêm required
      {
        key: "majorName",
        label: "Tên ngành",
        required: true,
        placeholder: "Ví dụ: Công nghệ thông tin",
      },
    ],
    []
  );

  // --- JSX Render ---
  const currentSearchFieldConfig = useMemo(
    () =>
      searchableMajorColumnOptions.find(
        (opt) => opt.value === selectedSearchField
      ),
    [selectedSearchField]
  );
  const searchPlaceholder = currentSearchFieldConfig
    ? `Nhập ${currentSearchFieldConfig.label.toLowerCase()}...`
    : "Nhập tìm kiếm...";

  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        <h2 className="admin-list-title">{t("major.listTitle")}</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            {/* Select chọn cột tìm kiếm */}
            <div className="filter-control">
              <select
                id="searchFieldSelectMajor"
                value={selectedSearchField}
                onChange={handleSearchFieldChange}
                className="status-filter-select"
                aria-label="Chọn trường để tìm kiếm"
              >
                {searchableMajorColumnOptions.map((option) => (
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
              onClick={handleAddMajor}
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
          pageCount={pageCount}
          onPageChange={handlePageClick}
          forcePage={currentPage}
          onSort={handleSort}
          currentSortConfig={sortConfig}
          loading={isLoading || isDeleting || isSubmitting} // Kết hợp loading states
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
            Tổng số ngành: {totalItems}
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
            Không có dữ liệu ngành.
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
            ? "Thêm ngành"
            : modalMode === "edit"
            ? "Chỉnh sửa ngành"
            : "Xem ngành"
        }
        className="modal" // Có thể thêm class 'small' hoặc 'medium' nếu modal này thường nhỏ
        overlayClassName="overlay"
        closeTimeoutMS={300}
      >
        {modalMode && (
          <FormDetail
            formData={modalData}
            fields={modalMode === "add" ? addFields : editFields}
            mode={modalMode}
            onChange={(name, value) => {
              setModalData({ ...modalData, [name]: value });
              if (formErrors[name])
                setFormErrors((prev) => ({ ...prev, [name]: "" }));
            }}
            onSubmit={
              modalMode === "add" ? handleCreateMajor : handleUpdateMajor
            }
            title={
              modalMode === "add"
                ? "Thêm ngành"
                : modalMode === "edit"
                ? "Chỉnh sửa ngành"
                : "Xem thông tin ngành"
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

const ListOfMajor = React.memo(ListOfMajorPage);
export default ListOfMajor;
