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

// Searchable Columns for Subjects
const searchableSubjectColumnOptions = [
  { value: "subjectId", label: "Mã môn học" },
  { value: "subjectName", label: "Tên môn học" },
  { value: "major.majorName", label: "Tên ngành" }, // Key cho tìm kiếm tên ngành
];

const ListOfSubjectPage = () => {
  const { t } = useTranslation();
  // --- States ---
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [searchInput, setSearchInput] = useState("");
  const [selectedSearchField, setSelectedSearchField] = useState(
    searchableSubjectColumnOptions[0].value // Mặc định cột đầu tiên
  );
  const [appliedSearchInput, setAppliedSearchInput] = useState("");
  const [appliedSearchField, setAppliedSearchField] = useState(
    searchableSubjectColumnOptions[0].value
  );

  const [sortConfig, setSortConfig] = useState({
    key: "subjectName",
    direction: "asc",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const [modalMode, setModalMode] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [majors, setMajors] = useState([]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const currentPath = "/mon-hoc";

  // --- Reset State ---
  const resetState = useCallback(() => {
    setSearchInput("");
    setSelectedSearchField(searchableSubjectColumnOptions[0].value);
    setAppliedSearchInput("");
    setAppliedSearchField(searchableSubjectColumnOptions[0].value);
    setSortConfig({ key: "subjectName", direction: "asc" });
    setCurrentPage(0);
  }, []);

  // --- Fetch Majors ---
  const fetchMajors = useCallback(async () => {
    try {
      const response = await Api({
        endpoint: `major/search`, // Lấy tất cả ngành, có thể cần phân trang nếu nhiều
        method: METHOD_TYPE.GET,
        query: { rpp: 1000, page: 1 }, // Lấy nhiều ngành một lúc
      });
      if (response.success && Array.isArray(response.data?.items)) {
        setMajors(response.data.items);
      } else {
        console.error("Failed to fetch majors:", response.message);
      }
    } catch (errorCatch) {
      console.error(
        "An error occurred while fetching majors:",
        errorCatch.message
      );
    }
  }, []);

  // --- Fetch Data (Subjects) ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filterConditions = [];
      if (appliedSearchInput && appliedSearchField) {
        filterConditions.push({
          key: appliedSearchField,
          operator: "like",
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

      console.log("Fetching subjects with query:", query);
      const response = await Api({
        endpoint: `subject/search`,
        method: METHOD_TYPE.GET,
        query: query,
      });
      console.log("API Response (Subjects):", response);

      if (response.success && response.data) {
        setData(response.data.items || []);
        setTotalItems(response.data.total || 0);
        setPageCount(Math.ceil((response.data.total || 0) / itemsPerPage));
      } else {
        throw new Error(response.message || t("common.errorLoadingData"));
      }
    } catch (errorCatch) {
      console.error("Fetch subject error:", errorCatch);
      const errorMessage = errorCatch.message || t("common.errorLoadingData");
      setError(errorMessage);
      setData([]);
      setTotalItems(0);
      setPageCount(1);
      toast.error(`Tải danh sách môn học thất bại: ${errorMessage}`);
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

  // --- UseEffect Hooks ---
  useEffect(() => {
    fetchMajors();
  }, [fetchMajors]);

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
  const handleDelete = (subject) => {
    if (!subject || !subject.subjectId) return;
    const subjectName = subject.subjectName || subject.subjectId;
    setDeleteItemId(subject.subjectId);
    setDeleteMessage(`Bạn có chắc chắn muốn xóa môn học "${subjectName}"?`);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;
    setIsDeleting(true);
    try {
      const response = await Api({
        endpoint: `subject/delete/${deleteItemId}`,
        method: METHOD_TYPE.DELETE,
      });
      if (response.success) {
        toast.success("Xóa môn học thành công");
        if (data.length === 1 && currentPage > 0)
          setCurrentPage(currentPage - 1);
        else fetchData();
      } else {
        toast.error(
          `Xóa thất bại: ${response.message || "Lỗi không xác định"}`
        );
      }
    } catch (errorCatch) {
      toast.error(`Xóa thất bại: ${errorCatch.message || "Lỗi mạng"}`);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
      setDeleteMessage("");
      setIsDeleting(false);
    }
  };

  const handleAddSubject = () => {
    setModalMode("add");
    setModalData({
      subjectName: "",
      majorId: majors.length > 0 ? majors[0].majorId : "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleView = (subject) => {
    setModalData({
      subjectId: subject.subjectId,
      subjectName: subject.subjectName || "",
      majorId: getSafeNestedValue(subject, "major.majorId", ""),
      majorName: getSafeNestedValue(subject, "major.majorName", "N/A"),
    });
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (subject) => {
    setModalData({
      subjectId: subject.subjectId,
      subjectName: subject.subjectName || "",
      majorId: getSafeNestedValue(subject, "major.majorId", ""),
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

  const validateSubjectForm = (formData) => {
    const errors = {};
    if (!formData.subjectName?.trim())
      errors.subjectName = "Vui lòng nhập tên môn học.";
    if (!formData.majorId) errors.majorId = "Vui lòng chọn ngành.";
    return errors;
  };

  const handleFormSubmit = async (formData) => {
    const errors = validateSubjectForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.warn("Vui lòng kiểm tra lại thông tin nhập.");
      return;
    }
    setFormErrors({});
    setIsSubmitting(true);
    const apiData = {
      subjectName: formData.subjectName,
      majorId: formData.majorId,
    };
    try {
      let response;
      if (modalMode === "add") {
        response = await Api({
          endpoint: "subject/create",
          method: METHOD_TYPE.POST,
          data: apiData,
        });
      } else if (modalMode === "edit") {
        response = await Api({
          endpoint: `subject/update/${modalData.subjectId}`,
          method: METHOD_TYPE.PUT,
          data: apiData,
        });
      } else return;

      if (response.success) {
        const successMsg =
          modalMode === "add"
            ? "Thêm môn học thành công"
            : "Cập nhật môn học thành công";
        toast.success(successMsg);
        if (modalMode === "add") {
          setSortConfig({ key: "subjectName", direction: "asc" });
          if (currentPage !== 0) setCurrentPage(0);
          else fetchData();
        } else fetchData();
        handleCloseModal();
      } else {
        const errorMsg =
          modalMode === "add"
            ? "Thêm môn học thất bại"
            : "Cập nhật môn học thất bại";
        toast.error(`${errorMsg}: ${response.message || "Lỗi không xác định"}`);
        if (response.errors) setFormErrors(response.errors);
      }
    } catch (errorCatch) {
      const errorMsg =
        modalMode === "add"
          ? "Thêm môn học thất bại"
          : "Cập nhật môn học thất bại";
      toast.error(`${errorMsg}: ${errorCatch.message || "Lỗi mạng"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Columns Definition ---
  const columns = useMemo(
    () => [
      { title: "Mã môn học", dataKey: "subjectId", sortable: true },
      { title: "Tên môn học", dataKey: "subjectName", sortable: true },
      {
        title: "Tên ngành",
        dataKey: "major.majorName",
        sortKey: "major.majorName",
        sortable: true,
        renderCell: (_, row) =>
          getSafeNestedValue(row, "major.majorName", "N/A"),
      },
    ],
    []
  );

  // --- Fields Definition ---
  const addFields = useMemo(
    () => [
      { key: "subjectName", label: "Tên môn học", required: true },
      {
        key: "majorId",
        label: "Ngành",
        type: "select",
        required: true,
        options: majors.map((major) => ({
          label: major.majorName,
          value: major.majorId,
        })),
        placeholder: "-- Chọn ngành --",
      },
    ],
    [majors]
  );

  const editFields = useMemo(
    () => [
      { key: "subjectId", label: "Mã môn học", readOnly: true },
      { key: "subjectName", label: "Tên môn học", required: true },
      {
        key: "majorId",
        label: "Ngành",
        type: "select",
        required: true,
        options: majors.map((major) => ({
          label: major.majorName,
          value: major.majorId,
        })),
        placeholder: "-- Chọn ngành --",
      },
      // Thêm các trường readOnly nếu cần hiển thị ở view mode (ví dụ `majorName`)
      {
        key: "majorName",
        label: "Tên ngành (Hiện tại)",
        readOnly: true,
        renderValue: (v, data) => getSafeNestedValue(data, "majorName", "N/A"),
      },
    ],
    [majors]
  );

  // --- JSX Render ---
  const currentSearchFieldConfig = useMemo(
    () =>
      searchableSubjectColumnOptions.find(
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
        <h2 className="admin-list-title">Danh sách môn học</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            {/* Select chọn cột tìm kiếm */}
            <div className="filter-control">
              <select
                id="searchFieldSelectSubject"
                value={selectedSearchField}
                onChange={handleSearchFieldChange}
                className="status-filter-select"
                aria-label="Chọn trường để tìm kiếm"
              >
                {searchableSubjectColumnOptions.map((option) => (
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
              onClick={handleAddSubject}
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
            Tổng số môn học: {totalItems}
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
            Không có dữ liệu môn học.
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
            ? "Thêm môn học"
            : modalMode === "edit"
            ? "Chỉnh sửa môn học"
            : "Xem môn học"
        }
        className="modal"
        overlayClassName="overlay"
        closeTimeoutMS={300}
      >
        {modalMode && (
          <FormDetail
            formData={modalData}
            // Sử dụng editFields cho cả view mode để hiển thị đúng tên ngành
            fields={modalMode === "add" ? addFields : editFields}
            mode={modalMode}
            onChange={(name, value) => {
              setModalData({ ...modalData, [name]: value });
              if (formErrors[name])
                setFormErrors((prev) => ({ ...prev, [name]: "" }));
            }}
            onSubmit={handleFormSubmit}
            title={
              modalMode === "add"
                ? "Thêm môn học"
                : modalMode === "edit"
                ? "Chỉnh sửa môn học"
                : "Xem thông tin môn học"
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

const ListOfSubject = React.memo(ListOfSubjectPage);
export default ListOfSubject;
