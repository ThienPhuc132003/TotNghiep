import React, { useState, useCallback, useEffect, useMemo } from "react"; // Thêm useMemo
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
// Bỏ unidecode
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import qs from "qs";

// Set the app element for accessibility
Modal.setAppElement("#root");


const ListOfMajorPage = () => {
  const { t } = useTranslation();
  // --- States ---
  const [data, setData] = useState([]); // Chỉ cần data
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // State cho query tìm kiếm thực tế
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(""); // State cho message xóa
  const [modalData, setModalData] = useState({});
  const [modalMode, setModalMode] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // Index 0-based
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // State cho nút Lưu modal
  const [isDeleting, setIsDeleting] = useState(false); // State cho nút Xóa modal
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "majorName",
    direction: "asc",
  }); // Mặc định sort theo tên ngành
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const currentPath = "/nganh";
  // Bỏ state filters
  const [formErrors, setFormErrors] = useState({});

  // Bỏ updateUrl và useEffect liên quan

  // --- Reset State ---
  const resetState = () => {
    setSearchInput("");
    setSearchQuery("");
    setSortConfig({ key: "majorName", direction: "asc" }); // Reset về sort mặc định
    setCurrentPage(0);
    // Bỏ setFilters([]);
  };

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      // Xây dựng filter từ searchQuery
      const filterConditions = [];
      if (searchQuery) {
        filterConditions.push({
          key: "majorId,sumName,majorName", // Các trường muốn tìm kiếm
          operator: "like",
          value: searchQuery,
        });
      }

      const query = {
        rpp: itemsPerPage,
        page: currentPage + 1, // API dùng page 1-based
        // Sử dụng filterConditions đã tạo
        ...(filterConditions.length > 0 && {
          filter: JSON.stringify(filterConditions),
        }),
        sort: JSON.stringify([
          { key: sortConfig.key, type: sortConfig.direction.toUpperCase() },
        ]),
      };

      const queryString = qs.stringify(query, { encode: false });
      console.log("Fetching majors with query:", queryString);

      const response = await Api({
        endpoint: `major/search?${queryString}`, // Đảm bảo endpoint đúng
        method: METHOD_TYPE.GET,
      });
      console.log("API Response:", response);

      if (response.success && response.data) {
        setData(response.data.items || []);
        setTotalItems(response.data.total || 0);
        setPageCount(Math.ceil((response.data.total || 0) / itemsPerPage));
      } else {
        throw new Error(response.message || t("common.errorLoadingData"));
      }
    } catch (error) {
      console.error("Fetch major error:", error);
      setError(error.message || t("common.errorLoadingData"));
      setData([]);
      setTotalItems(0);
      setPageCount(1);
      toast.error(`Tải danh sách ngành thất bại: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, sortConfig, searchQuery, t]); // Thêm searchQuery

  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData đã chứa đủ dependencies

  // --- Handlers ---
  const handlePageClick = (event) => {
    if (typeof event.selected === "number") {
      setCurrentPage(event.selected);
    }
  };

  const handleSearchInputChange = (value) => {
    setSearchInput(value);
  };

  // Trigger tìm kiếm backend
  const handleApplySearch = () => {
    setCurrentPage(0);
    setSearchQuery(searchInput);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleApplySearch();
    }
  };

  // Cập nhật sortConfig
  const handleSort = (sortKey) => {
    setSortConfig((prevConfig) => {
      const newDirection =
        prevConfig.key === sortKey && prevConfig.direction === "asc"
          ? "desc"
          : "asc";
      return { key: sortKey, direction: newDirection };
    });
    setCurrentPage(0); // Về trang đầu khi sort
  };

  // Cập nhật itemsPerPage
  const handleItemsPerPageChange = (newPageSize) => {
    setItemsPerPage(newPageSize);
    setCurrentPage(0);
  };

  // --- CRUD Handlers ---
  const handleDelete = (major) => {
    // Nhận cả object major
    if (!major || !major.majorId) return;
    const majorName = major.majorName || major.majorId; // Lấy tên hoặc ID
    setDeleteItemId(major.majorId);
    setDeleteMessage(`Bạn có chắc chắn muốn xóa ngành "${majorName}"?`); // Set message động
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
        // Kiểm tra lùi trang nếu cần
        if (data.length === 1 && currentPage > 0) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchData(); // Fetch lại trang hiện tại
        }
      } else {
        console.log("Failed to delete major:", response.message);
        // Hiển thị lỗi cụ thể hơn nếu có, ví dụ ngành đang được sử dụng
        toast.error(
          `Xóa không thành công: ${response.message || "Lỗi không xác định"}`
        );
      }
    } catch (error) {
      console.error("An error occurred while deleting major:", error);
      toast.error(`Xóa không thành công: ${error.message || "Lỗi mạng"}`);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
      setDeleteMessage(""); // Reset message
      setIsDeleting(false);
    }
  };

  const handleAddMajor = () => {
    setModalMode("add");
    setModalData({
      // Reset data form
      sumName: "",
      majorName: "",
    });
    setFormErrors({}); // Xóa lỗi cũ
    setIsModalOpen(true);
  };

  const handleView = (major) => {
    setModalData({
      // Lấy dữ liệu từ item
      majorId: major.majorId,
      sumName: major.sumName || "",
      majorName: major.majorName || "",
      // Thêm các trường khác nếu có (createdAt, updatedAt,...)
    });
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (major) => {
    setModalData({
      // Lấy dữ liệu để sửa
      majorId: major.majorId,
      sumName: major.sumName || "",
      majorName: major.majorName || "",
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

  // Bỏ handleSave, logic save nằm trong handleCreate/Update

  // Validation Form
  const validateMajorForm = (formData) => {
    const errors = {};
    if (!formData.majorName?.trim())
      errors.majorName = "Vui lòng nhập tên ngành.";
    // Thêm validate cho sumName nếu cần (ví dụ: không được trùng, viết hoa,...)
    // if(!formData.sumName?.trim()) errors.sumName = "Vui lòng nhập tên viết tắt.";
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
        data: formData, // Gửi dữ liệu từ form
      });

      if (response.success) {
        toast.success("Thêm ngành thành công");
        // Reset sort về mặc định, về trang đầu
        setSortConfig({ key: "majorName", direction: "asc" });
        if (currentPage !== 0) {
          setCurrentPage(0);
        } else {
          fetchData(); // Fetch lại trang 1
        }
        handleCloseModal(); // Đóng modal
      } else {
        console.log("Failed to create major:", response.message);
        toast.error(
          `Thêm không thành công: ${response.message || "Lỗi không xác định"}`
        );
        if (response.errors) setFormErrors(response.errors);
      }
    } catch (error) {
      console.error("An error occurred while creating major:", error);
      toast.error(`Thêm không thành công: ${error.message || "Lỗi mạng"}`);
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
      // Chỉ gửi các trường cần update
      const updateData = {
        sumName: formData.sumName,
        majorName: formData.majorName,
      };
      const response = await Api({
        endpoint: `major/update/${modalData.majorId}`, // Dùng ID từ modalData
        method: METHOD_TYPE.PUT,
        data: updateData,
      });

      if (response.success) {
        toast.success("Cập nhật thành công");
        fetchData(); // Fetch lại dữ liệu
        handleCloseModal(); // Đóng modal
      } else {
        console.log("Failed to update major:", response.message);
        toast.error(
          `Cập nhật không thành công: ${
            response.message || "Lỗi không xác định"
          }`
        );
        if (response.errors) setFormErrors(response.errors);
      }
    } catch (error) {
      console.error("An error occurred while updating major:", error);
      toast.error(`Cập nhật không thành công: ${error.message || "Lỗi mạng"}`);
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
  ); // Chỉ phụ thuộc t

  // --- Fields Definition ---
  const addFields = useMemo(
    () => [
      { key: "sumName", label: "Tên viết tắt", placeholder: "Ví dụ: CNTT" },
      {
        key: "majorName",
        label: "Tên ngành",
        required: true,
        placeholder: "Ví dụ: Công nghệ thông tin",
      },
    ],
    []
  ); // Không có dependencies

  const editFields = useMemo(
    () => [
      { key: "majorId", label: "Mã ngành", readOnly: true }, // Không cho sửa Mã ngành
      { key: "sumName", label: "Tên viết tắt", placeholder: "Ví dụ: CNTT" },
      {
        key: "majorName",
        label: "Tên ngành",
        required: true,
        placeholder: "Ví dụ: Công nghệ thông tin",
      },
      // Thêm các trường readOnly nếu muốn hiển thị ở view mode
      // { key: "createdAt", label: "Ngày tạo", readOnly: true, renderValue: (v) => v ? new Date(v).toLocaleString('vi-VN') : 'N/A'},
      // { key: "updatedAt", label: "Cập nhật", readOnly: true, renderValue: (v) => v ? new Date(v).toLocaleString('vi-VN') : 'N/A'},
    ],
    []
  ); // Không có dependencies

  // --- JSX Render ---
  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        <h2 className="admin-list-title">{t("major.listTitle")}</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            <SearchBar
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchKeyPress} // Thêm onKeyPress
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
              placeholder="Tìm mã ngành, tên, viết tắt..." // Cập nhật placeholder
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
            <button className="add-admin-button" onClick={handleAddMajor}>
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
          onDelete={handleDelete} // Truyền cả object
          // Không có onLock cho Major
          // Pagination & Sort
          pageCount={pageCount}
          onPageChange={handlePageClick}
          forcePage={currentPage}
          onSort={handleSort}
          currentSortConfig={sortConfig} // Truyền sort config hiện tại
          // Loading & Items per page
          loading={isLoading}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange} // Đảm bảo đúng handler
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
            Tổng số ngành: {totalItems}
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
            ? "Thêm ngành"
            : modalMode === "edit"
            ? "Chỉnh sửa nghành"
            : "Xem ngành"
        }
        className="modal"
        overlayClassName="overlay"
      >
        {modalMode && (
          <FormDetail
            formData={modalData}
            fields={modalMode === "add" ? addFields : editFields}
            mode={modalMode}
            onChange={(name, value) => {
              setModalData({ ...modalData, [name]: value });
              if (formErrors[name]) {
                setFormErrors((prev) => ({ ...prev, [name]: "" }));
              }
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
            isSubmitting={isSubmitting} // Truyền state
          />
        )}
      </Modal>

      {/* Modal Delete Confirmation */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message={deleteMessage} // Truyền message động
        isDeleting={isDeleting} // Truyền state
      />

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </AdminDashboardLayout>
  );
};

const ListOfMajor = React.memo(ListOfMajorPage);
export default ListOfMajor;
