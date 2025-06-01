/* eslint-disable no-undef */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css";
import "../../assets/css/Modal.style.css";
import "../../assets/css/FormDetail.style.css";
import Table from "../../components/Table";
import SearchBar from "../../components/SearchBar";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import FormDetail from "../../components/FormDetail";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import ImageCropModal from "../../components/ImageCropModal";
import { Alert } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import numeral from "numeral";
import "numeral/locales/vi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faUpload } from "@fortawesome/free-solid-svg-icons";

Modal.setAppElement("#root");

// --- Helpers ---
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(Number(value)))
    return "N/A";
  numeral.locale("vi");
  return numeral(value).format("0,0 đ");
};
const renderImageUrl = (url) => {
  if (!url || typeof url !== "string")
    return <em style={{ color: "#888" }}>Không có ảnh</em>;
  return (
    <img
      src={url}
      alt="Ảnh gói"
      style={{
        maxWidth: "80px",
        maxHeight: "80px",
        display: "block",
        margin: "auto",
        border: "1px solid #eee",
        objectFit: "contain",
        borderRadius: "4px",
      }}
    />
  );
};
// --- End Helpers ---

const searchableValueConfigColumnOptions = [
  { value: "valueConfigId", label: "Mã gói" },
  { value: "price", label: "Giá (VNĐ)", placeholderSuffix: " (số)" },
  { value: "coinConfig", label: "Số Xu", placeholderSuffix: " (số)" },
  { value: "description", label: "Mô tả" },
];

const ListOfValueConfigsPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [searchInput, setSearchInput] = useState("");
  const [selectedSearchField, setSelectedSearchField] = useState(
    searchableValueConfigColumnOptions[0].value
  );
  const [appliedSearchInput, setAppliedSearchInput] = useState("");
  const [appliedSearchField, setAppliedSearchField] = useState(
    searchableValueConfigColumnOptions[0].value
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [modalData, setModalData] = useState({});
  const [modalMode, setModalMode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "price",
    direction: "asc",
  });
  const currentPath = "/goi-thanh-toan";
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const resetState = useCallback(() => {
    setSearchInput("");
    setSelectedSearchField(searchableValueConfigColumnOptions[0].value);
    setAppliedSearchInput("");
    setAppliedSearchField(searchableValueConfigColumnOptions[0].value);
    setSortConfig({ key: "price", direction: "asc" });
    setCurrentPage(0);
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filterConditions = [];
      if (appliedSearchInput && appliedSearchField) {
        filterConditions.push({
          key: appliedSearchField,
          operator:
            appliedSearchField === "price" ||
            appliedSearchField === "coinConfig" ||
            appliedSearchField === "valueConfigId"
              ? "equal"
              : "like",
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

      const response = await Api({
        endpoint: `value-config/get-list`,
        method: METHOD_TYPE.GET,
        data: query,
      });

      if (response.success && response.data) {
        setData(response.data.items || []);
        setTotalItems(response.data.total || 0);
        setPageCount(Math.ceil((response.data.total || 0) / itemsPerPage));
      } else {
        throw new Error(response.message || t("common.errorLoadingData"));
      }
    } catch (errorCatch) {
      const errorMessage = errorCatch.message || t("common.errorLoadingData");
      setError(errorMessage);
      setData([]);
      setTotalItems(0);
      setPageCount(1);
      toast.error(`Tải danh sách gói thất bại: ${errorMessage}`);
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

  const handlePageClick = (event) => {
    if (typeof event.selected === "number") setCurrentPage(event.selected);
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

  const handleDelete = (valueConfig) => {
    if (!valueConfig || !valueConfig.valueConfigId) return;
    const configDesc =
      valueConfig.description || `Gói ID ${valueConfig.valueConfigId}`;
    setDeleteItemId(valueConfig.valueConfigId);
    setDeleteMessage(`Bạn có chắc muốn xóa gói "${configDesc}"?`);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;
    setIsDeleting(true);
    try {
      const response = await Api({
        endpoint: `value-config/delete/${deleteItemId}`,
        method: METHOD_TYPE.DELETE,
      });
      if (response.success) {
        toast.success("Xóa gói thành công");
        if (data.length === 1 && currentPage > 0)
          setCurrentPage(currentPage - 1);
        else fetchData();
      } else {
        toast.error(
          `Xóa gói thất bại: ${response.message || "Lỗi không xác định"}`
        );
      }
    } catch (errorCatch) {
      toast.error(`Xóa gói thất bại: ${errorCatch.message || "Lỗi mạng"}`);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
      setDeleteMessage("");
      setIsDeleting(false);
    }
  };

  const handleAddValueConfig = () => {
    setModalMode("add");
    setModalData({ price: "", coinConfig: "", urlConfig: "", description: "" });
    setFormErrors({});
    setImageToCrop(null);
    setIsModalOpen(true);
  };

  const handleView = (valueConfig) => {
    setModalData({
      valueConfigId: valueConfig.valueConfigId,
      price: valueConfig.price ?? "",
      coinConfig: valueConfig.coinConfig ?? "",
      urlConfig: valueConfig.urlConfig || "",
      description: valueConfig.description || "",
    });
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (valueConfig) => {
    setModalData({
      valueConfigId: valueConfig.valueConfigId,
      price: valueConfig.price ?? "",
      coinConfig: valueConfig.coinConfig ?? "",
      urlConfig: valueConfig.urlConfig || "",
      description: valueConfig.description || "",
    });
    setModalMode("edit");
    setFormErrors({});
    setImageToCrop(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setModalData({});
      setModalMode(null);
      setFormErrors({});
      setImageToCrop(null);
    }, 300);
  };

  const handleTriggerImageInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  }, []);

  const handleImageSelected = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setFormErrors((prev) => ({ ...prev, urlConfig: "" }));
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result);
        setIsCropModalOpen(true);
      };
      reader.onerror = () => {
        toast.error("Không thể đọc file ảnh.");
      };
      reader.readAsDataURL(file);
    } else {
      toast.warn("Vui lòng chọn file ảnh hợp lệ (jpg, png,...).");
    }
  }, []);

  const handleCloseCropModal = useCallback(() => {
    if (!isUploadingImage) {
      setIsCropModalOpen(false);
      setImageToCrop(null);
    }
  }, [isUploadingImage]);

  const handleCropSaveForUrlConfig = useCallback(async (croppedImageBlob) => {
    setIsCropModalOpen(false);
    if (!croppedImageBlob) return;
    setIsUploadingImage(true);
    toast.info("Đang tải ảnh lên...", {
      autoClose: false,
      toastId: "uploading-image",
    });
    try {
      const fileNameResponse = await Api({
        endpoint: "media/media-url",
        query: { mediaCategory: "VALUE_CONFIG_IMAGE" },
        method: METHOD_TYPE.GET,
      });
      if (!fileNameResponse?.success || !fileNameResponse?.data?.fileName) {
        throw new Error(
          fileNameResponse?.message || "Lỗi lấy định danh file ảnh."
        );
      }
      const fileName = fileNameResponse.data.fileName;
      const uploadFormData = new FormData();
      const uploadFileName = `${fileName}.jpeg`;
      uploadFormData.append("file", croppedImageBlob, uploadFileName);
      const uploadResponse = await Api({
        endpoint: `media/upload-media`,
        query: { mediaCategory: "VALUE_CONFIG_IMAGE", fileName: fileName },
        method: METHOD_TYPE.POST,
        data: uploadFormData,
      });
      console.log("Test thử 1 lần", uploadResponse);
      if (!uploadResponse?.success || !uploadResponse?.data?.mediaUrl) {
        throw new Error(uploadResponse?.message || "Upload ảnh gói thất bại.");
      }
      const finalUrl = uploadResponse.data.mediaUrl;
      setModalData((prev) => ({ ...prev, urlConfig: finalUrl }));
      toast.dismiss("uploading-image");
      toast.success("Upload ảnh thành công!");
      setImageToCrop(null);
    } catch (errorCatch) {
      toast.dismiss("uploading-image");
      toast.error(errorCatch.message || "Lỗi upload ảnh gói.");
      setImageToCrop(null);
    } finally {
      setIsUploadingImage(false);
    }
  }, []);

  const validateForm = (formData) => {
    let errors = {};
    if (
      formData.price === null ||
      formData.price === undefined ||
      String(formData.price).trim() === ""
    ) {
      errors.price = "Vui lòng nhập giá tiền.";
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errors.price = "Giá tiền phải là số dương.";
    }
    if (
      formData.coinConfig === null ||
      formData.coinConfig === undefined ||
      String(formData.coinConfig).trim() === ""
    ) {
      errors.coinConfig = "Vui lòng nhập số Xu.";
    } else if (
      !Number.isInteger(Number(formData.coinConfig)) ||
      Number(formData.coinConfig) <= 0
    ) {
      errors.coinConfig = "Số xu phải là số nguyên dương.";
    }
    if (!modalData.urlConfig?.trim())
      errors.urlConfig = "Vui lòng upload ảnh cho gói.";
    if (!formData.description?.trim())
      errors.description = "Vui lòng nhập mô tả.";
    return errors;
  };

  const handleFormSubmit = async (currentFormData) => {
    const finalFormData = {
      ...currentFormData,
      urlConfig: modalData.urlConfig,
    };
    const errors = validateForm(finalFormData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.warn("Vui lòng kiểm tra lại thông tin nhập, bao gồm cả ảnh.");
      return;
    }
    setFormErrors({});
    setIsSubmitting(true);
    const apiData = {
      price: Number(finalFormData.price),
      coinConfig: Number(finalFormData.coinConfig),
      urlConfig: finalFormData.urlConfig,
      description: finalFormData.description,
    };
    try {
      let response;
      if (modalMode === "add") {
        response = await Api({
          endpoint: "value-config/create",
          method: METHOD_TYPE.POST,
          data: apiData,
        });
      } else if (modalMode === "edit") {
        response = await Api({
          endpoint: `value-config/update/${modalData.valueConfigId}`,
          method: METHOD_TYPE.PUT,
          data: apiData,
        });
      } else {
        setIsSubmitting(false);
        return;
      }

      if (response.success) {
        const successMsg =
          modalMode === "add"
            ? "Thêm gói thành công"
            : "Cập nhật gói thành công";
        toast.success(successMsg);
        if (modalMode === "add") {
          setSortConfig({ key: "price", direction: "asc" });
          if (currentPage !== 0) setCurrentPage(0);
          else fetchData();
        } else fetchData();
        handleCloseModal();
      } else {
        const errorMsg =
          modalMode === "add" ? "Thêm gói thất bại" : "Cập nhật gói thất bại";
        toast.error(`${errorMsg}: ${response.message || "Lỗi không xác định"}`);
        if (response.errors) setFormErrors(response.errors);
      }
    } catch (errorCatch) {
      const errorMsg =
        modalMode === "add" ? "Thêm gói thất bại" : "Cập nhật gói thất bại";
      toast.error(`${errorMsg}: ${errorCatch.message || "Lỗi mạng"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo(
    () => [
      { title: "Mã gói", dataKey: "valueConfigId", sortable: true },
      {
        title: "Giá (VNĐ)",
        dataKey: "price",
        sortable: true,
        renderCell: formatCurrency,
      },
      { title: "Số Xu", dataKey: "coinConfig", sortable: true },
      { title: "Mô tả", dataKey: "description", sortable: false },
      {
        title: "Ảnh",
        dataKey: "urlConfig",
        renderCell: renderImageUrl,
        sortable: false,
      },
    ],
    []
  );

  const commonFields = useMemo(
    () => [
      {
        key: "price",
        label: "Giá tiền (VNĐ)",
        type: "number",
        required: true,
        placeholder: "Ví dụ: 50000",
      },
      {
        key: "coinConfig",
        label: "Số Xu",
        type: "number",
        required: true,
        placeholder: "Ví dụ: 50",
      },
      {
        key: "description",
        label: "Mô tả",
        type: "textarea",
        required: true,
        rows: 3,
      },
    ],
    []
  );

  const addFields = useMemo(() => [...commonFields], [commonFields]);

  const editFieldsForForm = useMemo(
    () => [
      { key: "valueConfigId", label: "Mã gói", readOnly: true },
      ...commonFields,
    ],
    [commonFields]
  );

  const viewFields = useMemo(
    () => [
      { key: "valueConfigId", label: "Mã gói", readOnly: true },
      {
        key: "price",
        label: "Giá tiền (VNĐ)",
        readOnly: true,
        renderValue: formatCurrency,
      },
      { key: "coinConfig", label: "Số Xu", readOnly: true },
      {
        key: "urlConfig",
        label: "Ảnh gói",
        readOnly: true,
        renderValue: renderImageUrl,
      },
      { key: "description", label: "Mô tả", readOnly: true },
    ],
    []
  );

  const currentSearchFieldConfig = useMemo(
    () =>
      searchableValueConfigColumnOptions.find(
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
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelected}
        style={{ display: "none" }}
        accept="image/png, image/jpeg, image/jpg"
        disabled={isUploadingImage || isSubmitting}
      />
      <div className="admin-content">
        <h2 className="admin-list-title">Danh sách Gói thanh toán</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            <div className="filter-control">
              <select
                id="searchFieldSelectValueConfig"
                value={selectedSearchField}
                onChange={handleSearchFieldChange}
                className="status-filter-select"
                aria-label="Chọn trường để tìm kiếm"
              >
                {searchableValueConfigColumnOptions.map((option) => (
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
              disabled={isLoading || isSubmitting}
            >
              {" "}
              <i className="fa-solid fa-search"></i>{" "}
            </button>
            <button
              className="refresh-button"
              onClick={resetState}
              title="Làm mới"
              aria-label="Làm mới"
              disabled={isLoading || isSubmitting}
            >
              {" "}
              <i className="fa-solid fa-rotate-left"></i>{" "}
            </button>
          </div>
          <div className="filter-add-admin">
            <button
              className="add-admin-button"
              onClick={handleAddValueConfig}
              disabled={isLoading || isSubmitting}
            >
              {" "}
              {t("common.addButton")}{" "}
            </button>
          </div>
        </div>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Table
          data={data}
          columns={columns}
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
            {" "}
            Tổng số gói: {totalItems}{" "}
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
            Không có dữ liệu gói thanh toán.{" "}
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
        contentLabel="Quản lý Gói Thanh Toán"
        className={`modal ${modalMode === "view" ? "" : "medium"}`}
        overlayClassName="overlay"
        closeTimeoutMS={300}
      >
        {modalMode && (
          <FormDetail
            formData={modalData}
            fields={
              modalMode === "view"
                ? viewFields
                : modalMode === "add"
                ? addFields
                : editFieldsForForm
            }
            mode={modalMode}
            title={
              modalMode === "add"
                ? "Thêm Gói Thanh Toán"
                : modalMode === "edit"
                ? "Sửa Gói Thanh Toán"
                : "Xem Chi Tiết Gói"
            }
            onChange={(name, value) => {
              setModalData({ ...modalData, [name]: value });
              if (formErrors[name]) {
                setFormErrors((prev) => ({ ...prev, [name]: "" }));
              }
            }}
            onClose={handleCloseModal}
            errors={formErrors}
          >
            {" "}
            {modalMode !== "view" && (
              <>
                {" "}
                <div
                  className="form-detail-group"
                  style={{
                    marginTop: "1rem",
                    marginBottom: "1rem",
                    gridColumn: "1 / -1",
                  }}
                >
                  {" "}
                  <label>
                    {" "}
                    Ảnh Gói <span className="required-asterisk">*</span>{" "}
                  </label>{" "}
                  <div className="image-upload-area">
                    {" "}
                    <div className="image-preview">
                      {" "}
                      {isUploadingImage ? (
                        <FontAwesomeIcon
                          icon={faSpinner}
                          spin
                          size="2x"
                          color="#aaa"
                        />
                      ) : modalData.urlConfig ? (
                        renderImageUrl(modalData.urlConfig)
                      ) : (
                        <span className="no-image-text">Chưa có ảnh</span>
                      )}{" "}
                    </div>{" "}
                    <button
                      type="button"
                      className="button-select-image"
                      onClick={handleTriggerImageInput}
                      disabled={isUploadingImage || isSubmitting}
                    >
                      {" "}
                      <FontAwesomeIcon
                        icon={faUpload}
                        style={{ marginRight: "8px" }}
                      />{" "}
                      {modalData.urlConfig ? "Thay đổi ảnh" : "Chọn ảnh"}{" "}
                    </button>{" "}
                    {formErrors.urlConfig && (
                      <p className="form-detail-error-message">
                        {" "}
                        {formErrors.urlConfig}{" "}
                      </p>
                    )}{" "}
                  </div>{" "}
                </div>{" "}
                <div className="form-detail-actions">
                  {" "}
                  <button
                    type="button"
                    className="form-detail-cancel-button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting || isUploadingImage}
                  >
                    {" "}
                    Hủy{" "}
                  </button>{" "}
                  <button
                    type="button"
                    className="form-detail-save-button"
                    onClick={() => handleFormSubmit(modalData)}
                    disabled={isSubmitting || isUploadingImage}
                  >
                    {" "}
                    {isSubmitting ? (
                      <>
                        {" "}
                        <FontAwesomeIcon
                          icon={faSpinner}
                          spin
                          style={{ marginRight: "8px" }}
                        />{" "}
                        Đang lưu...{" "}
                      </>
                    ) : (
                      "Lưu Gói"
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
      />
      <ImageCropModal
        isOpen={isCropModalOpen}
        onRequestClose={handleCloseCropModal}
        imageSrc={imageToCrop}
        onCropSave={handleCropSaveForUrlConfig}
        isSaving={isUploadingImage}
      />
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </AdminDashboardLayout>
  );
};

const ListOfValueConfigs = React.memo(ListOfValueConfigsPage);
export default ListOfValueConfigs;
