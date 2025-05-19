// src/pages/Admin/ListOfCurriculumnPage.jsx (Hoặc đường dẫn tương ứng của bạn)
import React, { useCallback, useEffect, useState, useMemo } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css";
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
import qs from "qs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

Modal.setAppElement("#root");

const ListOfCurriculumnPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQueryForApi, setSearchQueryForApi] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [modalData, setModalData] = useState({});
  const [modalMode, setModalMode] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const currentPath = "/giao-trinh";
  const [majors, setMajors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [fileUploadErrorModal, setFileUploadErrorModal] = useState("");

  const resetSearchAndFilters = () => {
    setSearchInput("");
    setSearchQueryForApi("");
    setCurrentPage(0);
    setSortConfig({ key: "createdAt", direction: "desc" });
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filterConditions = [];
      if (searchQueryForApi) {
        filterConditions.push({
          key: "curriculumnName,description,major.majorName,subject.subjectName",
          operator: "like",
          value: searchQueryForApi,
        });
      }

      const query = {
        rpp: itemsPerPage,
        page: currentPage + 1,
        ...(filterConditions.length > 0 && { filter: JSON.stringify(filterConditions) }),
        sort: JSON.stringify([
          { key: sortConfig.key, type: sortConfig.direction.toUpperCase() },
        ]),
      };

      const queryString = qs.stringify(query, { encode: false });
      const response = await Api({
        endpoint: `curriculumn/search?${queryString}`,
        method: METHOD_TYPE.GET,
      });

      if (response.success && response.data) {
        setData(response.data.items || []);
        setTotalItems(response.data.total || 0);
      } else {
        throw new Error(response.message || t("common.errorLoadingData"));
      }
    } catch (err) {
      console.error("Fetch curriculumn error:", err);
      setError(err.message || t("common.errorLoadingData"));
      setData([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, sortConfig, searchQueryForApi, t]);

  const fetchMajors = useCallback(async () => {
    try {
      const response = await Api({
        endpoint: "major/search",
        method: METHOD_TYPE.GET,
        query: { rpp: 1000, page: 1 }
      });
      if (response.success && response.data) {
        setMajors(response.data.items || []);
      } else {
        console.error("Failed to fetch majors:", response.message);
      }
    } catch (error) {
      console.error("An error occurred while fetching majors:", error.message);
    }
  }, []);

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await Api({
        endpoint: "subject/search",
        method: METHOD_TYPE.GET,
        query: { rpp: 1000, page: 1 }
      });
      if (response.success && response.data) {
        setSubjects(response.data.items || []);
      } else {
        console.error("Failed to fetch subjects:", response.message);
      }
    } catch (error) {
      console.error("An error occurred while fetching subjects:", error.message);
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

  const handleSearchInputChange = (query) => {
    setSearchInput(query);
  };

  const handleApplySearch = () => {
    setCurrentPage(0);
    setSearchQueryForApi(searchInput);
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key: key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(0);
  };

  const handleDelete = (curriculumn) => {
    if (!curriculumn || !curriculumn.curriculumnId) return;
    setDeleteItemId(curriculumn.curriculumnId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItemId) {
      toast.error("Không xác định được giáo trình để xóa.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await Api({
        endpoint: `curriculumn/delete-by-admin/${deleteItemId}`,
        method: METHOD_TYPE.DELETE,
      });
      if (response.success) {
        toast.success("Xóa giáo trình thành công");
        if (data.length === 1 && currentPage > 0) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchData();
        }
      } else {
        throw new Error(response.message || "Xóa thất bại");
      }
    } catch (error) {
      console.error("Delete curriculumn error:", error);
      toast.error(`Xóa thất bại: ${error.message}`);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
      setIsSubmitting(false);
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
      status:"ACTIVE"
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
      setFormErrors(prev => ({ ...prev, curriculumnUrl: undefined }));
    }
  }, []);

  const handleFileUploadErrorModalCallback = useCallback((message, identifier) => {
    if (identifier === "curriculumnUrlModal") {
      const userMsg = message || "Upload file thất bại.";
      setFileUploadErrorModal(userMsg);
      setFormErrors(prev => ({ ...prev, curriculumnUrl: userMsg }));
    }
  }, []);

  const validateFormData = (formDataToValidate) => {
    const errors = {};
    if (!formDataToValidate.curriculumnName?.trim()) errors.curriculumnName = "Tên giáo trình không được để trống.";
    if (!formDataToValidate.majorId) errors.majorId = "Vui lòng chọn ngành.";
    if (!formDataToValidate.subjectId) errors.subjectId = "Vui lòng chọn môn học.";
    if (!formDataToValidate.description?.trim()) errors.description = "Mô tả không được để trống.";

    const currentFileUrl = modalData.curriculumnUrl;
    if (modalMode === 'add' && !currentFileUrl) {
        errors.curriculumnUrl = "Vui lòng tải lên file giáo trình.";
    } else if (fileUploadErrorModal && !currentFileUrl) {
        errors.curriculumnUrl = fileUploadErrorModal;
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
      toast.warn("Vui lòng kiểm tra lại thông tin đã nhập, bao gồm cả file upload.");
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
        toast.success(modalMode === "add" ? "Thêm giáo trình thành công" : "Cập nhật giáo trình thành công");
        fetchData();
        handleCloseModal();
      } else {
        throw new Error(response.message || (modalMode === "add" ? "Thêm thất bại" : "Cập nhật thất bại"));
      }
    } catch (error) {
      console.error(`Error ${modalMode} curriculumn:`, error);
      toast.error(`${modalMode === "add" ? "Thêm" : "Cập nhật"} thất bại: ${error.message}`);
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLock = async (curriculumn) => {
    if (!curriculumn || !curriculumn.curriculumnId) {
      toast.error("Không thể xác định giáo trình để thay đổi trạng thái.");
      return;
    }
    const newStatus = curriculumn.status === "ACTIVE" ? "UNACTIVE" : "ACTIVE";
    const curriculumnNameForToast = curriculumn.curriculumnName || curriculumn.curriculumnId;

    setIsSubmitting(true);
    try {
      const response = await Api({
        endpoint: `curriculumn/update-by-admin/${curriculumn.curriculumnId}`,
        method: METHOD_TYPE.PUT,
        data: { status: newStatus },
      });

      if (response.success) {
        toast.success(
          `Giáo trình "${curriculumnNameForToast}" đã ${newStatus === "ACTIVE" ? "mở khóa" : "khóa"} thành công.`
        );
        fetchData();
      } else {
        throw new Error(response.message || "Cập nhật trạng thái thất bại");
      }
    } catch (error) {
      console.error("Lock/Unlock curriculumn error:", error);
      toast.error(`Cập nhật trạng thái thất bại: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo(() => [
    {
      title: "STT",
      renderCell: (_, __, rowIndex) => currentPage * itemsPerPage + rowIndex + 1,
    },
    { title: "Tên giáo trình", dataKey: "curriculumnName", sortable: true },
    {
      title: "Ngành",
      dataKey: "major.majorName",
      renderCell: (_, row) => row.major?.majorName || "N/A",
      sortable: true,
    },
    {
      title: "Môn học",
      dataKey: "subject.subjectName",
      renderCell: (_, row) => row.subject?.subjectName || "N/A",
      sortable: true,
    },
    {
      title: "File",
      dataKey: "curriculumnUrl",
      renderCell: (value) =>
        value ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="table-link">
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
        value && value.length > 50 ? (
          <span title={value}>{value.substring(0, 50)}...</span>
        ) : (
          value || "Không có"
        ),
      sortable: true,
    },
    {
      title: "Trạng thái",
      dataKey: "status",
      sortable: true,
      renderCell: (value) => (value === "ACTIVE" ? "Đang mở" : "Đã khóa"),
    },
  ], [currentPage, itemsPerPage]);

  const commonFormFields = useMemo(() => [
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
      options: majors.map((major) => ({
        label: major.majorName,
        value: major.majorId,
      })),
      placeholder: "-- Chọn Ngành --",
    },
    {
      key: "subjectId",
      label: "Môn học",
      type: "select",
      required: true,
      options: subjects.map((subject) => ({
        label: subject.subjectName,
        value: subject.subjectId,
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
  ], [majors, subjects]);

  const addFields = useMemo(() => [...commonFormFields], [commonFormFields]);
  const editFields = useMemo(() => [
    { key: "curriculumnId", label: "Mã Giáo trình", readOnly: true },
    ...commonFormFields,
  ], [commonFormFields]);

  const viewFields = useMemo(() => [
    { key: "curriculumnId", label: "Mã Giáo trình" },
    { key: "curriculumnName", label: "Tên giáo trình" },
    { key: "majorName", label: "Ngành" },
    { key: "subjectName", label: "Môn học" },
    {
      key: "curriculumnUrl",
      label: "File Giáo trình",
      renderValue: (value) =>
        value ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="form-detail-link">
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
      renderValue: (value) => (value === "ACTIVE" ? "Đang mở" : "Đã khóa"),
    },
  ], []);


  return (
    <AdminDashboardLayout currentPath={currentPath}>
      <div className="admin-content">
        <h2 className="admin-list-title">Danh sách giáo trình</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            <SearchBar
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyPress={(e) => e.key === 'Enter' && handleApplySearch()}
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
              placeholder="Tìm tên, mô tả, ngành, môn..."
            />
            <button
                className="refresh-button"
                onClick={handleApplySearch}
                title="Tìm kiếm"
                aria-label="Tìm kiếm"
              >
                <i className="fa-solid fa-search"></i>
            </button>
            <button
              className="refresh-button"
              onClick={resetSearchAndFilters}
              title="Làm mới bộ lọc và danh sách"
            >
              <i className="fa-solid fa-rotate-left"></i>
            </button>
          </div>
          <div className="filter-add-admin">
            <button className="add-admin-button" onClick={handleAddCurriculumn}>
              Thêm giáo trình
            </button>
          </div>
        </div>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Table
          columns={columns}
          data={data}
          totalItems={totalItems}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onLock={handleLock}
          pageCount={Math.ceil(totalItems / itemsPerPage)}
          onPageChange={handlePageClick}
          forcePage={currentPage}
          onSort={handleSort}
          currentSortConfig={sortConfig}
          loading={isLoading}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(newSize) => {
            setItemsPerPage(newSize);
            setCurrentPage(0);
          }}
          showLock={true}
          statusKey="status"
        />
         {!isLoading && !error && data.length > 0 && (
          <p className="total-items-count">
            Tổng số giáo trình: {totalItems}
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
              if (formErrors[name]) {
                setFormErrors(prev => ({ ...prev, [name]: undefined }));
              }
              if (name !== 'curriculumnUrl' && formErrors.curriculumnUrl && modalData.curriculumnUrl) {
                 setFormErrors(prev => ({ ...prev, curriculumnUrl: undefined }));
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
            {(modalMode === "add" || modalMode === "edit") && (
              <>
                <div className="form-detail-group" style={{ gridColumn: "1 / -1", marginTop: "1rem" }}>
                  <GenericFileUploader
                    label="File Giáo trình"
                    mediaCategory="CURRICULUMN_DOCUMENT" // !!! THAY THẾ BẰNG MEDIA CATEGORY THỰC TẾ CỦA BẠN
                    initialFileUrl={modalData.curriculumnUrl}
                    onUploadComplete={handleFileUploadCompleteModal}
                    onError={handleFileUploadErrorModalCallback}
                    fileIdentifier="curriculumnUrlModal"
                    promptText="Tải file (PDF, DOC, PPT, Ảnh,...)"
                    required={modalMode === 'add'}
                    disabled={isSubmitting}
                  />
                  {(fileUploadErrorModal || formErrors?.curriculumnUrl) && (
                    <p className="form-detail-error-message" style={{ color: 'red', fontSize: '0.875em', marginTop: '0.25rem' }}>
                      {formErrors?.curriculumnUrl || fileUploadErrorModal}
                    </p>
                  )}
                </div>

                <div className="form-detail-actions" style={{ gridColumn: "1 / -1", marginTop: "1.5rem" }}>
                  <button
                    type="button"
                    className="form-detail-cancel-button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="form-detail-save-button"
                    onClick={() => handleFormSubmit(modalData)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: "8px" }} />
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu"
                    )}
                  </button>
                </div>
              </>
            )}
          </FormDetail>
        )}
      </Modal>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message="Bạn có chắc chắn muốn xóa giáo trình này không? Hành động này không thể hoàn tác."
        isDeleting={isSubmitting}
      />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
      />
    </AdminDashboardLayout>
  );
};

const ListOfCurriculumn = React.memo(ListOfCurriculumnPage);
export default ListOfCurriculumn;