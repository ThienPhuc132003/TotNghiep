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
import "../../assets/css/FormDetail.style.css"; // Đảm bảo import
import Table from "../../components/Table";
import SearchBar from "../../components/SearchBar";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import FormDetail from "../../components/FormDetail"; // Import FormDetail
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import ImageCropModal from "../../components/ImageCropModal";
import qs from "qs";
import { Alert } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import numeral from "numeral";
import "numeral/locales/vi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faUpload } from "@fortawesome/free-solid-svg-icons";

// Set the app element for accessibility
Modal.setAppElement("#root");

// --- Helpers (Giữ nguyên) ---
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return "N/A";
  }
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
        maxWidth: "100px",
        maxHeight: "100px",
        display: "block",
        marginTop: "5px",
        border: "1px solid #eee",
        objectFit: "contain",
      }}
    />
  );
};
// --- End Helpers ---

const ListOfValueConfigsPage = () => {
  // --- States (Giữ nguyên) ---
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [modalData, setModalData] = useState({});
  const [modalMode, setModalMode] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "price",
    direction: "asc",
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const currentPath = "/goi-thanh-toan";
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // --- Reset State (Giữ nguyên) ---
  const resetState = () => {
    setSearchInput("");
    setSearchQuery("");
    setSortConfig({ key: "price", direction: "asc" });
    setCurrentPage(0);
  };

  // --- Fetch Data (Giữ nguyên) ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filterConditions = [];
      if (searchQuery) {
        filterConditions.push({
          key: "valueConfigId,price,coinConfig,description",
          operator: "like",
          value: searchQuery,
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
      const queryString = qs.stringify(query, { encode: false });
      const response = await Api({
        endpoint: `value-config/get-list?${queryString}`,
        method: METHOD_TYPE.GET,
      });
      if (response.success && response.data) {
        setData(response.data.items || []);
        setTotalItems(response.data.total || 0);
        setPageCount(Math.ceil((response.data.total || 0) / itemsPerPage));
      } else {
        throw new Error(response.message || t("common.errorLoadingData"));
      }
    } catch (error) {
      console.error("Fetch value config error:", error);
      setError(error.message || t("common.errorLoadingData"));
      setData([]);
      setTotalItems(0);
      setPageCount(1);
      toast.error(`Tải danh sách gói thất bại: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, sortConfig, searchQuery, t]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    numeral.locale("vi");
  }, []);

  // --- Handlers (Pagination, Search, Sort - Giữ nguyên) ---
  const handlePageClick = (event) => {
    if (typeof event.selected === "number") {
      setCurrentPage(event.selected);
    }
  };
  const handleSearchInputChange = (value) => {
    setSearchInput(value);
  };
  const handleApplySearch = () => {
    setCurrentPage(0);
    setSearchQuery(searchInput);
  };
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleApplySearch();
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

  // --- CRUD Handlers (Giữ nguyên) ---
  const handleDelete = (valueConfig) => {
    if (!valueConfig || !valueConfig.valueConfigId) return;
    const configDesc = valueConfig.description || valueConfig.valueConfigId;
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
        if (data.length === 1 && currentPage > 0) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchData();
        }
      } else {
        console.error("Failed to delete value config:", response.message);
        toast.error(
          `Xóa gói thất bại: ${response.message || "Lỗi không xác định"}`
        );
      }
    } catch (error) {
      console.error("An error occurred while deleting value config:", error);
      toast.error(`Xóa gói thất bại: ${error.message || "Lỗi mạng"}`);
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

  // --- Image Upload Handlers (Giữ nguyên) ---
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
      if (!uploadResponse?.success || !uploadResponse?.data?.mediaUrl) {
        throw new Error(uploadResponse?.message || "Upload ảnh gói thất bại.");
      }
      const finalUrl = uploadResponse.data.mediaUrl;
      setModalData((prev) => ({ ...prev, urlConfig: finalUrl }));
      toast.dismiss("uploading-image");
      toast.success("Upload ảnh thành công!");
      setImageToCrop(null);
    } catch (error) {
      console.error("Lỗi xử lý ảnh gói:", error);
      toast.dismiss("uploading-image");
      toast.error(error.message || "Lỗi upload ảnh gói.");
      setImageToCrop(null);
    } finally {
      setIsUploadingImage(false);
    }
  }, []);

  // --- Validation Form (Giữ nguyên) ---
  const validateForm = (formData) => {
    let errors = {};
    if (
      formData.price === null ||
      formData.price === undefined ||
      String(formData.price).trim() === ""
    ) {
      errors.price = "Vui lòng nhập giá tiền.";
    } else if (isNaN(Number(formData.price))) {
      errors.price = "Giá tiền phải là một số.";
    } else if (Number(formData.price) <= 0) {
      errors.price = "Giá tiền phải lớn hơn 0.";
    }
    if (
      formData.coinConfig === null ||
      formData.coinConfig === undefined ||
      String(formData.coinConfig).trim() === ""
    ) {
      errors.coinConfig = "Vui lòng nhập số coin.";
    } else if (!Number.isInteger(Number(formData.coinConfig))) {
      errors.coinConfig = "Số coin phải là số nguyên.";
    } else if (Number(formData.coinConfig) <= 0) {
      errors.coinConfig = "Số coin phải lớn hơn 0.";
    }
    if (!formData.urlConfig?.trim())
      errors.urlConfig = "Vui lòng upload ảnh cho gói.";
    if (!formData.description?.trim())
      errors.description = "Vui lòng nhập mô tả.";
    return errors;
  };

  // --- Form Submit Handler (Giữ nguyên) ---
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
        } else {
          fetchData();
        }
        handleCloseModal();
      } else {
        const errorMsg =
          modalMode === "add" ? "Thêm gói thất bại" : "Cập nhật gói thất bại";
        toast.error(`${errorMsg}: ${response.message || "Lỗi không xác định"}`);
        if (response.errors) setFormErrors(response.errors);
      }
    } catch (error) {
      console.error(`Error ${modalMode}ing value config:`, error);
      const errorMsg =
        modalMode === "add" ? "Thêm gói thất bại" : "Cập nhật gói thất bại";
      toast.error(`${errorMsg}: ${error.message || "Lỗi mạng"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Columns Definition (Giữ nguyên) ---
  const columns = useMemo(
    () => [
      { title: "Mã gói", dataKey: "valueConfigId", sortable: true },
      {
        title: "Giá (VNĐ)",
        dataKey: "price",
        sortable: true,
        renderCell: formatCurrency,
      },
      { title: "Số Coin", dataKey: "coinConfig", sortable: true },
      { title: "Mô tả", dataKey: "description", sortable: true },
    ],
    []
  );

  // --- Fields Definition (Giữ nguyên) ---
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
        label: "Số Coin",
        type: "number",
        required: true,
        placeholder: "Ví dụ: 50",
      },
      { key: "description", label: "Mô tả", type: "textarea", required: true },
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
      { key: "coinConfig", label: "Số Coin", readOnly: true },
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

  // --- JSX Render ---
  const childrenMiddleContentLower = (
    /* ... Giữ nguyên JSX cho Table, SearchBar ... */
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
          {" "}
          <div className="search-bar-filter">
            {" "}
            <SearchBar
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchKeyPress}
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
              placeholder="Tìm mã, giá, coin, mô tả..."
            />{" "}
            <button
              className="refresh-button"
              onClick={handleApplySearch}
              title="Tìm kiếm"
              aria-label="Tìm kiếm"
            >
              <i className="fa-solid fa-search"></i>
            </button>{" "}
            <button
              className="refresh-button"
              onClick={resetState}
              title="Làm mới"
              aria-label="Làm mới"
            >
              <i className="fa-solid fa-rotate-left"></i>
            </button>{" "}
          </div>{" "}
          <div className="filter-add-admin">
            {" "}
            <button className="add-admin-button" onClick={handleAddValueConfig}>
              {t("common.addButton")}
            </button>{" "}
          </div>{" "}
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
            {" "}
            Tổng số gói: {totalItems}{" "}
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
      {/* Modal Add/Edit/View */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Quản lý Gói Thanh Toán"
        className="modal medium"
        overlayClassName="overlay"
        closeTimeoutMS={300}
      >
        {modalMode && (
          // Sử dụng FormDetail làm container chính
          <FormDetail
            formData={modalData}
            // Chọn fields phù hợp
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
            // Không dùng onSubmit của FormDetail vì có nút riêng
            // onSubmit={handleFormSubmit}
            onClose={handleCloseModal} // Nút X trên header
            errors={formErrors}
            // Không truyền isSubmitting vì có nút riêng
          >
            {/* === Truyền khu vực upload ảnh và nút bấm vào children === */}
            {modalMode !== "view" && (
              <>
                {/* Khu vực Upload Ảnh */}
                <div
                  className="form-detail-group"
                  style={{ marginTop: "1rem" }}
                >
                  <label htmlFor="urlConfigUpload">
                    Ảnh Gói <span className="required-asterisk">*</span>
                  </label>
                  <div className="image-upload-area">
                    <div className="image-preview">
                      {isUploadingImage ? (
                        <FontAwesomeIcon
                          icon={faSpinner}
                          spin
                          size="2x"
                          color="#aaa"
                        />
                      ) : modalData.urlConfig ? (
                        <img src={modalData.urlConfig} alt="Ảnh gói hiện tại" />
                      ) : (
                        <span className="no-image-text">Chưa có ảnh</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="button-select-image"
                      onClick={handleTriggerImageInput}
                      disabled={isUploadingImage || isSubmitting}
                    >
                      <FontAwesomeIcon
                        icon={faUpload}
                        style={{ marginRight: "8px" }}
                      />
                      {modalData.urlConfig ? "Thay đổi ảnh" : "Chọn ảnh"}
                    </button>
                    {formErrors.urlConfig && (
                      <p className="form-detail-error-message">
                        {formErrors.urlConfig}
                      </p>
                    )}
                  </div>
                </div>

                {/* Nút Submit/Cancel tùy chỉnh */}
                <div className="form-detail-actions">
                  <button
                    type="button"
                    className="form-detail-cancel-button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting || isUploadingImage}
                  >
                    {" "}
                    Hủy{" "}
                  </button>
                  <button
                    type="button"
                    className="form-detail-save-button"
                    onClick={() => handleFormSubmit(modalData)}
                    disabled={isSubmitting || isUploadingImage}
                  >
                    {isSubmitting ? (
                      <>
                        <FontAwesomeIcon
                          icon={faSpinner}
                          spin
                          style={{ marginRight: "8px" }}
                        />{" "}
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu Gói"
                    )}
                  </button>
                </div>
              </>
            )}
            {/* === Kết thúc children === */}
          </FormDetail>
        )}
      </Modal>

      {/* Modals khác */}
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
      />
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </AdminDashboardLayout>
  );
};

const ListOfValueConfigs = React.memo(ListOfValueConfigsPage);
export default ListOfValueConfigs;
