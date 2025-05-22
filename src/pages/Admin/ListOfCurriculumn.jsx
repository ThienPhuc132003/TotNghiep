// src/pages/Admin/ListOfCurriculumnPage.jsx
import React, { useCallback, useEffect, useState, useMemo } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css"; // Đảm bảo file này có định nghĩa cho .status-active, .status-inactive
import "../../assets/css/Modal.style.css";
import "../../assets/css/FormDetail.style.css";
import Table from "../../components/Table";
import SearchBar from "../../components/SearchBar";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import FormDetail from "../../components/FormDetail";
import GenericFileUploader from "../../components/GenericFileUploader";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { Alert } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

Modal.setAppElement("#root");

// Searchable Columns for Curriculums
const searchableCurriculumColumnOptions = [
  { value: "curriculumnName", label: "Tên giáo trình" },
  { value: "major.majorName", label: "Tên ngành" },
  { value: "subject.subjectName", label: "Tên môn học" },
  { value: "curriculumnId", label: "Mã giáo trình" },
];

// Status Filter Options
const statusFilterOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "INACTIVE", label: "Không hoạt động" },
];

const ListOfCurriculumnPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pageCount, setPageCount] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [selectedSearchField, setSelectedSearchField] = useState(
    searchableCurriculumColumnOptions[0].value
  );
  const [appliedSearchInput, setAppliedSearchInput] = useState("");
  const [appliedSearchField, setAppliedSearchField] = useState(
    searchableCurriculumColumnOptions[0].value
  );
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(""); // Thêm state cho delete message
  const [modalData, setModalData] = useState({});
  const [modalMode, setModalMode] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // State riêng cho deleting
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const currentPath = "/giao-trinh";
  const [majors, setMajors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [fileUploadErrorModal, setFileUploadErrorModal] = useState("");

  const resetState = useCallback(() => {
    setSearchInput("");
    setSelectedSearchField(searchableCurriculumColumnOptions[0].value);
    setAppliedSearchInput("");
    setAppliedSearchField(searchableCurriculumColumnOptions[0].value);
    setSelectedStatusFilter("");
    setCurrentPage(0);
    setSortConfig({ key: "createdAt", direction: "desc" });
  }, []);

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
      if (selectedStatusFilter) {
        filterConditions.push({
          key: "status",
          operator: "equal",
          value: selectedStatusFilter,
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

      const response = await Api({
        endpoint: `curriculumn/search`,
        method: METHOD_TYPE.GET,
        query: query,
      });

      if (response.success && response.data) {
        setData(response.data.items || []);
        setTotalItems(response.data.total || 0);
        setPageCount(Math.ceil((response.data.total || 0) / itemsPerPage));
      } else {
        throw new Error(response.message || t("common.errorLoadingData"));
      }
    } catch (err) {
      const errorMessage = err.message || t("common.errorLoadingData");
      setError(errorMessage);
      setData([]);
      setTotalItems(0);
      setPageCount(1);
      toast.error(`Tải danh sách giáo trình thất bại: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    sortConfig,
    appliedSearchInput,
    appliedSearchField,
    selectedStatusFilter,
    t,
  ]);

  const fetchMajors = useCallback(async () => {
    try {
      const response = await Api({
        endpoint: "major/search",
        method: METHOD_TYPE.GET,
        query: { rpp: 1000, page: 1 },
      });
      if (response.success && response.data)
        setMajors(response.data.items || []);
      else console.error("Failed to fetch majors:", response.message);
    } catch (errorCatch) {
      console.error(
        "An error occurred while fetching majors:",
        errorCatch.message
      );
    }
  }, []);

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await Api({
        endpoint: "subject/search",
        method: METHOD_TYPE.GET,
        query: { rpp: 1000, page: 1 },
      });
      if (response.success && response.data)
        setSubjects(response.data.items || []);
      else console.error("Failed to fetch subjects:", response.message);
    } catch (errorCatch) {
      console.error(
        "An error occurred while fetching subjects:",
        errorCatch.message
      );
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    fetchMajors();
    fetchSubjects();
  }, [fetchMajors, fetchSubjects]);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };
  const handleSearchInputChange = (value) => {
    setSearchInput(value);
  };
  const handleSearchFieldChange = (event) => {
    setSelectedSearchField(event.target.value);
  };

  const handleApplySearchAndFilters = () => {
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

  const handleStatusFilterChange = (event) => {
    setSelectedStatusFilter(event.target.value);
    setCurrentPage(0);
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key: key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
    setCurrentPage(0);
  };

  const handleDelete = (curriculumn) => {
    if (!curriculumn || !curriculumn.curriculumnId) return;
    setDeleteItemId(curriculumn.curriculumnId);
    setDeleteMessage(
      `Bạn có chắc muốn xóa giáo trình "${
        curriculumn.curriculumnName || curriculumn.curriculumnId
      }"?`
    );
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItemId) {
      toast.error("Không xác định được giáo trình để xóa.");
      return;
    }
    setIsDeleting(true); // Dùng state isDeleting riêng
    try {
      const response = await Api({
        endpoint: `curriculumn/delete-by-admin/${deleteItemId}`,
        method: METHOD_TYPE.DELETE,
      });
      if (response.success) {
        toast.success("Xóa giáo trình thành công");
        if (data.length === 1 && currentPage > 0)
          setCurrentPage(currentPage - 1);
        else fetchData();
      } else {
        throw new Error(response.message || "Xóa thất bại");
      }
    } catch (errorCatch) {
      toast.error(`Xóa thất bại: ${errorCatch.message}`);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
      setDeleteMessage("");
      setIsDeleting(false); // Dùng state isDeleting riêng
    }
  };

  const handleView = (curriculumn) => {
    setModalData({
      curriculumnId: curriculumn.curriculumnId,
      curriculumnName: curriculumn.curriculumnName || "",
      majorName: curriculumn.major?.majorName || "N/A",
      subjectName: curriculumn.subject?.subjectName || "N/A",
      curriculumnUrl: curriculumn.curriculumnUrl || "",
      description: curriculumn.description || "",
      status: curriculumn.status,
    });
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (curriculumn) => {
    setModalData({
      curriculumnId: curriculumn.curriculumnId,
      curriculumnName: curriculumn.curriculumnName || "",
      majorId: curriculumn.majorId || "",
      subjectId: curriculumn.subjectId || "",
      curriculumnUrl: curriculumn.curriculumnUrl || "",
      description: curriculumn.description || "",
    });
    setModalMode("edit");
    setFormErrors({});
    setFileUploadErrorModal("");
    setIsModalOpen(true);
  };

  const handleAddCurriculumn = () => {
    setModalMode("add");
    setModalData({
      curriculumnName: "",
      majorId: "",
      subjectId: "",
      curriculumnUrl: "",
      description: "",
      status: "ACTIVE",
    });
    setFormErrors({});
    setFileUploadErrorModal("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setModalData({});
      setModalMode(null);
      setFormErrors({});
      setFileUploadErrorModal("");
    }, 300);
  };

  const handleFileUploadCompleteModal = useCallback((url, identifier) => {
    if (identifier === "curriculumnUrlModal") {
      setModalData((prev) => ({ ...prev, curriculumnUrl: url }));
      setFileUploadErrorModal("");
      setFormErrors((prev) => ({ ...prev, curriculumnUrl: undefined }));
    }
  }, []);

  const handleFileUploadErrorModalCallback = useCallback(
    (message, identifier) => {
      if (identifier === "curriculumnUrlModal") {
        const userMsg = message || "Upload file thất bại.";
        setFileUploadErrorModal(userMsg);
        setFormErrors((prev) => ({ ...prev, curriculumnUrl: userMsg }));
      }
    },
    []
  );

  const validateFormData = (formDataToValidate) => {
    const errors = {};
    if (!formDataToValidate.curriculumnName?.trim())
      errors.curriculumnName = "Tên giáo trình không được để trống.";
    if (!formDataToValidate.majorId) errors.majorId = "Vui lòng chọn ngành.";
    if (!formDataToValidate.subjectId)
      errors.subjectId = "Vui lòng chọn môn học.";
    if (!formDataToValidate.description?.trim())
      errors.description = "Mô tả không được để trống.";
    if (modalMode === "add" && !formDataToValidate.curriculumnUrl) {
      errors.curriculumnUrl = "Vui lòng tải lên file giáo trình.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (formDataFromFormDetail) => {
    const finalFormData = {
      ...formDataFromFormDetail,
      curriculumnUrl: modalData.curriculumnUrl,
    };
    if (!validateFormData(finalFormData)) {
      toast.warn(
        "Vui lòng kiểm tra lại thông tin đã nhập, bao gồm cả file upload."
      );
      return;
    }
    setIsSubmitting(true);
    const payload = {
      curriculumnName: finalFormData.curriculumnName,
      majorId: finalFormData.majorId,
      subjectId: finalFormData.subjectId,
      curriculumnUrl: finalFormData.curriculumnUrl,
      description: finalFormData.description,
    };
    if (modalMode === "add") payload.status = "ACTIVE";

    try {
      let response;
      if (modalMode === "add") {
        response = await Api({
          endpoint: "curriculumn/create-by-admin",
          method: METHOD_TYPE.POST,
          data: payload,
        });
      } else {
        response = await Api({
          endpoint: `curriculumn/update-by-admin/${modalData.curriculumnId}`,
          method: METHOD_TYPE.PUT,
          data: payload,
        });
      }
      if (response.success) {
        toast.success(
          modalMode === "add"
            ? "Thêm giáo trình thành công"
            : "Cập nhật giáo trình thành công"
        );
        fetchData();
        handleCloseModal();
      } else {
        throw new Error(
          response.message ||
            (modalMode === "add" ? "Thêm thất bại" : "Cập nhật thất bại")
        );
      }
    } catch (errorCatch) {
      toast.error(
        `${modalMode === "add" ? "Thêm" : "Cập nhật"} thất bại: ${
          errorCatch.message
        }`
      );
      if (errorCatch.response?.data?.errors)
        setFormErrors(errorCatch.response.data.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLock = async (curriculumn) => {
    if (!curriculumn || !curriculumn.curriculumnId) {
      toast.error("Không thể xác định giáo trình để thay đổi trạng thái.");
      return;
    }
    const newStatus = curriculumn.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const curriculumnNameForToast =
      curriculumn.curriculumnName || curriculumn.curriculumnId;

    // Xác nhận trước khi thực hiện
    if (
      !window.confirm(
        `Bạn có chắc muốn ${
          newStatus === "ACTIVE" ? "kích hoạt" : "hủy kích hoạt"
        } giáo trình "${curriculumnNameForToast}"?`
      )
    ) {
      return;
    }

    setIsSubmitting(true); // Dùng isSubmitting chung
    try {
      const response = await Api({
        endpoint: `curriculumn/update-status-by-admin/${curriculumn.curriculumnId}`,
        method: METHOD_TYPE.PUT,
        data: { status: newStatus },
      });
      if (response.success) {
        toast.success(
          `Giáo trình "${curriculumnNameForToast}" đã ${
            newStatus === "ACTIVE" ? "kích hoạt" : "hủy kích hoạt"
          } thành công.`
        );
        fetchData();
      } else {
        throw new Error(response.message || "Cập nhật trạng thái thất bại");
      }
    } catch (errorCatch) {
      toast.error(`Cập nhật trạng thái thất bại: ${errorCatch.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "STT",
        renderCell: (_, __, rowIndex) =>
          currentPage * itemsPerPage + rowIndex + 1,
      },
      { title: "Tên giáo trình", dataKey: "curriculumnName", sortable: true },
      {
        title: "Ngành",
        dataKey: "major.majorName",
        sortKey: "major.majorName",
        renderCell: (_, row) => row.major?.majorName || "N/A",
        sortable: true,
      },
      {
        title: "Môn học",
        dataKey: "subject.subjectName",
        sortKey: "subject.subjectName",
        renderCell: (_, row) => row.subject?.subjectName || "N/A",
        sortable: true,
      },
      {
        title: "File",
        dataKey: "curriculumnUrl",
        renderCell: (value) =>
          value ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="table-link"
            >
              Xem file
            </a>
          ) : (
            "Không có"
          ),
      },
      {
        title: "Mô tả",
        dataKey: "description",
        renderCell: (value) =>
          value && value.length > 30 ? (
            <span title={value}>{value.substring(0, 30)}...</span>
          ) : (
            value || "Không có"
          ),
        sortable: false,
      },
      {
        title: "Trạng thái",
        dataKey: "status",
        sortable: true,
        renderCell: (value) =>
          value === "ACTIVE" ? (
            <span className="status status-active">Hoạt động</span>
          ) : (
            <span className="status status-inactive">Không hoạt động</span>
          ),
      },
    ],
    [currentPage, itemsPerPage]
  );

  const commonFormFields = useMemo(
    () => [
      {
        key: "curriculumnName",
        label: "Tên giáo trình",
        type: "text",
        required: true,
      },
      {
        key: "majorId",
        label: "Ngành",
        type: "select",
        required: true,
        options: majors.map((m) => ({ label: m.majorName, value: m.majorId })),
        placeholder: "-- Chọn Ngành --",
      },
      {
        key: "subjectId",
        label: "Môn học",
        type: "select",
        required: true,
        options: subjects.map((s) => ({
          label: s.subjectName,
          value: s.subjectId,
        })),
        placeholder: "-- Chọn Môn học --",
      },
      {
        key: "description",
        label: "Mô tả",
        type: "textarea",
        rows: 4,
        required: true,
      },
    ],
    [majors, subjects]
  );

  const addFields = useMemo(() => [...commonFormFields], [commonFormFields]);
  const editFields = useMemo(
    () => [
      { key: "curriculumnId", label: "Mã Giáo trình", readOnly: true },
      ...commonFormFields,
    ],
    [commonFormFields]
  );
  const viewFields = useMemo(
    () => [
      { key: "curriculumnId", label: "Mã Giáo trình" },
      { key: "curriculumnName", label: "Tên giáo trình" },
      { key: "majorName", label: "Ngành" },
      { key: "subjectName", label: "Môn học" },
      {
        key: "curriculumnUrl",
        label: "File Giáo trình",
        renderValue: (value) =>
          value ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="form-detail-link"
            >
              Xem file
            </a>
          ) : (
            "Không có file"
          ),
      },
      { key: "description", label: "Mô tả" },
      {
        key: "status",
        label: "Trạng thái",
        renderValue: (value) =>
          value === "ACTIVE" ? "Hoạt động" : "Không hoạt động",
      },
    ],
    []
  );

  const currentSearchFieldConfig = useMemo(
    // Thêm useMemo cho placeholder
    () =>
      searchableCurriculumColumnOptions.find(
        (opt) => opt.value === selectedSearchField
      ),
    [selectedSearchField]
  );
  const searchPlaceholder = currentSearchFieldConfig
    ? `Nhập ${currentSearchFieldConfig.label.toLowerCase()}...`
    : "Nhập tìm kiếm...";

  return (
    <AdminDashboardLayout currentPath={currentPath}>
      <div className="admin-content">
        <h2 className="admin-list-title">Danh sách giáo trình</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            <div className="filter-control">
              <select
                id="searchFieldSelectCurriculum"
                value={selectedSearchField}
                onChange={handleSearchFieldChange}
                className="status-filter-select"
                aria-label="Chọn trường để tìm kiếm"
              >
                {searchableCurriculumColumnOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {" "}
                    {option.label}{" "}
                  </option>
                ))}
              </select>
            </div>
            <SearchBar
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyPress={(e) =>
                e.key === "Enter" && handleApplySearchAndFilters()
              }
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
              placeholder={searchPlaceholder}
            />{" "}
            {/* Sử dụng placeholder động */}
            <div className="filter-control">
              <label
                htmlFor="statusFilterCurriculum"
                className="filter-label"
                style={{ whiteSpace: "nowrap" }}
              >
                Trạng thái:
              </label>
              <select
                id="statusFilterCurriculum"
                value={selectedStatusFilter}
                onChange={handleStatusFilterChange}
                className="status-filter-select"
                aria-label="Lọc theo trạng thái"
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
              onClick={handleApplySearchAndFilters}
              title="Áp dụng bộ lọc & Tìm kiếm"
              aria-label="Áp dụng bộ lọc và tìm kiếm"
              disabled={isLoading || isSubmitting}
            >
              <i className="fa-solid fa-search"></i>
            </button>
            <button
              className="refresh-button"
              onClick={resetState}
              title="Làm mới"
              disabled={isLoading || isSubmitting}
            >
              <i className="fa-solid fa-rotate-left"></i>
            </button>
          </div>
          <div className="filter-add-admin">
            <button
              className="add-admin-button"
              onClick={handleAddCurriculumn}
              disabled={isLoading || isSubmitting}
            >
              {" "}
              Thêm giáo trình{" "}
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
          pageCount={pageCount}
          onPageChange={handlePageClick}
          forcePage={currentPage}
          onSort={handleSort}
          currentSortConfig={sortConfig}
          loading={isLoading || isSubmitting || isDeleting} // Kết hợp các trạng thái loading
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(newSize) => {
            setItemsPerPage(newSize);
            setCurrentPage(0);
          }}
          showLock={true}
          statusKey="status"
        />
        {!isLoading && !error && data.length > 0 && (
          <p
            className="total-items-count"
            style={{
              textAlign: "right",
              marginTop: "1rem",
              fontSize: "0.9em",
              color: "#555",
            }}
          >
            {" "}
            Tổng số giáo trình: {totalItems}{" "}
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
            {" "}
            Không có dữ liệu giáo trình.{" "}
          </p>
        )}
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        contentLabel={
          modalMode === "add"
            ? "Thêm Giáo trình"
            : modalMode === "edit"
            ? "Chỉnh sửa Giáo trình"
            : "Xem Chi tiết Giáo trình"
        }
        className={`modal ${modalMode === "view" ? "medium" : "large"}`}
        overlayClassName="overlay"
        closeTimeoutMS={300}
      >
        {modalMode && (
          <FormDetail
            formData={modalData}
            fields={
              modalMode === "add"
                ? addFields
                : modalMode === "edit"
                ? editFields
                : viewFields
            }
            mode={modalMode}
            onChange={(name, value) => {
              setModalData((prev) => ({ ...prev, [name]: value }));
              if (formErrors[name])
                setFormErrors((prev) => ({ ...prev, [name]: undefined }));
              if (
                name !== "curriculumnUrl" &&
                (formErrors.curriculumnUrl || fileUploadErrorModal) &&
                modalData.curriculumnUrl
              ) {
                setFormErrors((prev) => ({
                  ...prev,
                  curriculumnUrl: undefined,
                }));
                setFileUploadErrorModal("");
              }
            }}
            onClose={handleCloseModal}
            title={
              modalMode === "add"
                ? "Thêm Giáo trình Mới"
                : modalMode === "edit"
                ? "Chỉnh sửa Thông tin Giáo trình"
                : "Thông tin Chi tiết Giáo trình"
            }
            errors={formErrors}
          >
            {" "}
            {(modalMode === "add" || modalMode === "edit") && (
              <>
                {" "}
                <div
                  className="form-detail-group"
                  style={{ gridColumn: "1 / -1", marginTop: "1rem" }}
                >
                  {" "}
                  <GenericFileUploader
                    label="File Giáo trình"
                    mediaCategory="CURRICULUMN_DOCUMENT"
                    initialFileUrl={modalData.curriculumnUrl}
                    onUploadComplete={handleFileUploadCompleteModal}
                    onError={handleFileUploadErrorModalCallback}
                    fileIdentifier="curriculumnUrlModal"
                    promptText="Tải file (PDF, DOC, PPT, Ảnh,...)"
                    required={modalMode === "add" || !modalData.curriculumnUrl}
                    disabled={isSubmitting}
                  />{" "}
                  {(fileUploadErrorModal || formErrors?.curriculumnUrl) &&
                    !modalData.curriculumnUrl && (
                      <p
                        className="form-detail-error-message"
                        style={{
                          color: "red",
                          fontSize: "0.875em",
                          marginTop: "0.25rem",
                        }}
                      >
                        {" "}
                        {formErrors?.curriculumnUrl ||
                          fileUploadErrorModal}{" "}
                      </p>
                    )}{" "}
                </div>{" "}
                <div
                  className="form-detail-actions"
                  style={{ gridColumn: "1 / -1", marginTop: "1.5rem" }}
                >
                  {" "}
                  <button
                    type="button"
                    className="form-detail-cancel-button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                  >
                    Hủy
                  </button>{" "}
                  <button
                    type="button"
                    className="form-detail-save-button"
                    onClick={() => handleFormSubmit(modalData)}
                    disabled={isSubmitting}
                  >
                    {" "}
                    {isSubmitting ? (
                      <>
                        <FontAwesomeIcon
                          icon={faSpinner}
                          spin
                          style={{ marginRight: "8px" }}
                        />
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu"
                    )}{" "}
                  </button>{" "}
                </div>{" "}
              </>
            )}{" "}
          </FormDetail>
        )}
      </Modal>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message={deleteMessage}
        isDeleting={isDeleting}
      />{" "}
      {/* Truyền deleteMessage và isDeleting */}
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </AdminDashboardLayout>
  );
};

const ListOfCurriculumn = React.memo(ListOfCurriculumnPage);
export default ListOfCurriculumn;
