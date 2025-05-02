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
import qs from "qs";
import { Alert } from "@mui/material";
// import unidecode from "unidecode"; // <<< Bỏ import
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import numeral from "numeral";
import "numeral/locales/vi";

// Set the app element for accessibility
Modal.setAppElement("#root");

// Helper format tiền tệ
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return "N/A";
  }
  numeral.locale("vi"); // Đảm bảo locale được set
  return numeral(value).format("0,0 đ");
};

const ListOfTutorLevelPage = () => {
  const { t } = useTranslation();
  // --- States ---
  const [data, setData] = useState([]); // Chỉ cần data
  // Bỏ filteredData
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Query tìm kiếm thực tế
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(""); // State message xóa
  const [modalData, setModalData] = useState({});
  const [modalMode, setModalMode] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // 0-based index
  const [isLoading, setIsLoading] = useState(false); // Loading bảng
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading nút Lưu modal
  const [isDeleting, setIsDeleting] = useState(false); // Loading nút Xóa modal
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "levelName",
    direction: "asc",
  }); // Sort mặc định theo tên hạng
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default 10
  const currentPath = "/hang-gia-su";
  const [formErrors, setFormErrors] = useState({});
  // Bỏ state filters

  // Bỏ URL Sync

  // --- Reset State ---
  const resetState = () => {
    setSearchInput("");
    setSearchQuery("");
    setSortConfig({ key: "levelName", direction: "asc" });
    setCurrentPage(0);
    // Bỏ setFilters
  };

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filterConditions = [];
      if (searchQuery) {
        filterConditions.push({
          key: "tutorLevelId,levelName,description,salary", // Các trường tìm kiếm
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
      console.log("Fetching tutor levels with query:", queryString);

      const response = await Api({
        endpoint: `tutor-level/search?${queryString}`, // Endpoint tìm kiếm hạng
        method: METHOD_TYPE.GET,
      });
      console.log("API Response (Tutor Levels):", response);

      if (response.success && response.data) {
        setData(response.data.items || []);
        setTotalItems(response.data.total || 0);
        setPageCount(Math.ceil((response.data.total || 0) / itemsPerPage));
      } else {
        throw new Error(response.message || t("common.errorLoadingData"));
      }
    } catch (error) {
      console.error("Fetch tutor level error:", error);
      setError(error.message || t("common.errorLoadingData"));
      setData([]);
      setTotalItems(0);
      setPageCount(1);
      toast.error(`Tải danh sách hạng thất bại: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, sortConfig, searchQuery, t]); // Thêm searchQuery

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    numeral.locale("vi"); // Set locale khi component mount
  }, []);

  // --- Handlers ---
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
    setSortConfig((prevConfig) => {
      const newDirection =
        prevConfig.key === sortKey && prevConfig.direction === "asc"
          ? "desc"
          : "asc";
      return { key: sortKey, direction: newDirection };
    });
    setCurrentPage(0);
  };

  const handleItemsPerPageChange = (newPageSize) => {
    setItemsPerPage(newPageSize);
    setCurrentPage(0);
  };

  // --- CRUD Handlers ---
  const handleDelete = (tutorLevel) => {
    // Nhận object
    if (!tutorLevel || !tutorLevel.tutorLevelId) return;
    const levelName = tutorLevel.levelName || tutorLevel.tutorLevelId;
    setDeleteItemId(tutorLevel.tutorLevelId);
    setDeleteMessage(`Bạn có chắc muốn xóa hạng "${levelName}"?`); // Set message động
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;
    setIsDeleting(true);
    try {
      const response = await Api({
        endpoint: `tutor-level/delete/${deleteItemId}`, // Endpoint xóa
        method: METHOD_TYPE.DELETE,
      });
      if (response.success) {
        toast.success("Xóa thành công");
        if (data.length === 1 && currentPage > 0) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchData();
        }
      } else {
        console.log("Failed to delete tutor level:", response.message);
        // Thông báo lỗi cụ thể hơn nếu có thể
        toast.error(
          `Xóa thất bại: ${response.message || "Hạng đang được sử dụng"}`
        );
      }
    } catch (error) {
      console.error("An error occurred while deleting tutor level:", error);
      toast.error(`Xóa thất bại: ${error.message || "Lỗi mạng"}`);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
      setDeleteMessage("");
      setIsDeleting(false);
    }
  };

  // Mở modal thêm
  const handleAddTutorLevel = () => {
    setModalMode("add");
    setModalData({
      // Reset form
      levelName: "",
      salary: "",
      description: "",
    });
    setFormErrors({}); // Xóa lỗi cũ
    setIsModalOpen(true);
  };

  // Mở modal xem
  const handleView = (tutorLevel) => {
    setModalData({
      // Lấy dữ liệu từ item
      tutorLevelId: tutorLevel.tutorLevelId,
      levelName: tutorLevel.levelName || "",
      salary: tutorLevel.salary ?? "", // Dùng ?? để xử lý cả null/undefined
      description: tutorLevel.description || "",
      // Thêm createdAt/updatedAt nếu API trả về và muốn xem
      // createdAt: tutorLevel.createdAt,
      // updatedAt: tutorLevel.updatedAt,
    });
    setModalMode("view");
    setIsModalOpen(true);
  };

  // Mở modal sửa
  const handleEdit = (tutorLevel) => {
    setModalData({
      // Lấy dữ liệu để sửa
      tutorLevelId: tutorLevel.tutorLevelId,
      levelName: tutorLevel.levelName || "",
      salary: tutorLevel.salary ?? "",
      description: tutorLevel.description || "",
    });
    setModalMode("edit");
    setFormErrors({}); // Xóa lỗi cũ
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalData({});
    setModalMode(null);
    setFormErrors({});
  };

  // Bỏ handleSave

  // Validation Form
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

  // Submit handler chung cho Add/Edit
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
      // Đảm bảo gửi salary là số
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
      } else {
        return;
      } // Không làm gì ở mode 'view'

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
        } else {
          fetchData(); // Load lại trang hiện tại
        }
        handleCloseModal();
      } else {
        const errorMsg =
          modalMode === "add" ? "Thêm hạng thất bại" : "Cập nhật hạng thất bại";
        toast.error(`${errorMsg}: ${response.message || "Lỗi không xác định"}`);
        if (response.errors) setFormErrors(response.errors);
      }
    } catch (error) {
      console.error(`Error ${modalMode}ing tutor level:`, error);
      const errorMsg =
        modalMode === "add" ? "Thêm hạng thất bại" : "Cập nhật hạng thất bại";
      toast.error(`${errorMsg}: ${error.message || "Lỗi mạng"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Columns Definition ---
  const columns = useMemo(
    () => [
      {
        title: "Mã hạng",
        dataKey: "tutorLevelId",
        sortable: true,
        tooltip: "Mã hạng gia sư",
      },
      { title: "Tên hạng", dataKey: "levelName", sortable: true },
      {
        title: "Lương",
        dataKey: "salary",
        sortable: true,
        renderCell: formatCurrency,
      }, // Dùng helper
      { title: "Mô tả", dataKey: "description", sortable: true },
    ],
    []
  ); // Không có dependencies

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
      }, // Thêm placeholder
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
      }, // Thêm renderValue
      { key: "description", label: "Mô tả", type: "textarea", required: true },
      // Thêm createdAt/updatedAt nếu cần xem
      // { key: "createdAt", label: "Ngày tạo", readOnly: true, renderValue: (v) => safeFormatDate(v)},
      // { key: "updatedAt", label: "Cập nhật", readOnly: true, renderValue: (v) => v ? safeFormatDate(v) : 'N/A'},
    ],
    []
  );

  // --- JSX Render ---
  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        <h2 className="admin-list-title">Danh sách hạng gia sư</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            <SearchBar
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchKeyPress} // Thêm tìm bằng Enter
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
              placeholder="Tìm mã, tên hạng, mô tả..." // Cập nhật placeholder
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
          {/* Nút thêm */}
          <div className="filter-add-admin">
            <button className="add-admin-button" onClick={handleAddTutorLevel}>
              {t("common.addButton")}
            </button>
          </div>
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Table */}
        <Table
          columns={columns}
          data={data} // Dùng data trực tiếp
          totalItems={totalItems} // Truyền totalItems
          // Actions
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete} // Truyền object
          // Không có lock cho hạng
          showLock={false}
          // Pagination & Sort
          pageCount={pageCount}
          onPageChange={handlePageClick}
          forcePage={currentPage}
          onSort={handleSort}
          currentSortConfig={sortConfig} // Truyền sort config
          // Loading & Items per page
          loading={isLoading}
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
            Tổng số hạng gia sư: {totalItems}
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
        contentLabel={
          modalMode === "add"
            ? "Thêm hạng gia sư"
            : modalMode === "edit"
            ? "Sửa hạng gia sư"
            : "Xem hạng gia sư"
        }
        className="modal" // Có thể thêm class 'medium'
        overlayClassName="overlay"
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
              if (formErrors[name]) {
                setFormErrors({ ...formErrors, [name]: "" });
              }
            }}
            onSubmit={handleFormSubmit} // Dùng handler chung
            onClose={handleCloseModal}
            errors={formErrors}
            isSubmitting={isSubmitting} // Truyền state loading
          />
        )}
      </Modal>

      {/* Modal Delete Confirmation */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message={deleteMessage} // Message động
        isDeleting={isDeleting} // State loading xóa
      />

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </AdminDashboardLayout>
  );
};

const ListOfTutorLevel = React.memo(ListOfTutorLevelPage);
export default ListOfTutorLevel;
