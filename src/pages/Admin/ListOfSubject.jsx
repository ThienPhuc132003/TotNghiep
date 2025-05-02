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
// Bỏ unidecode
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import qs from "qs";

// Set the app element for accessibility
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

const ListOfSubjectPage = () => {
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
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading cho nút Lưu modal
  const [isDeleting, setIsDeleting] = useState(false); // Loading cho nút Xóa modal
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "subjectName",
    direction: "asc",
  }); // Sort theo tên môn học
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const currentPath = "/mon-hoc";
  // Bỏ state filters
  const [formErrors, setFormErrors] = useState({});
  const [majors, setMajors] = useState([]); // State lưu danh sách ngành

  // Bỏ updateUrl và useEffect liên quan

  // --- Reset State ---
  const resetState = () => {
    setSearchInput("");
    setSearchQuery("");
    setSortConfig({ key: "subjectName", direction: "asc" });
    setCurrentPage(0);
  };

  // --- Fetch Data (Subjects) ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filterConditions = [];
      if (searchQuery) {
        filterConditions.push({
          key: "subjectId,subjectName,major.majorName", // Các trường tìm kiếm
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
      console.log("Fetching subjects with query:", queryString);

      const response = await Api({
        endpoint: `subject/search?${queryString}`, // Endpoint tìm kiếm môn học
        method: METHOD_TYPE.GET,
      });
      console.log("API Response (Subjects):", response);

      if (response.success && response.data) {
        setData(response.data.items || []);
        setTotalItems(response.data.total || 0);
        setPageCount(Math.ceil((response.data.total || 0) / itemsPerPage));
      } else {
        throw new Error(response.message || t("common.errorLoadingData"));
      }
    } catch (error) {
      console.error("Fetch subject error:", error);
      setError(error.message || t("common.errorLoadingData"));
      setData([]);
      setTotalItems(0);
      setPageCount(1);
      toast.error(`Tải danh sách môn học thất bại: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, sortConfig, searchQuery, t]); // Thêm searchQuery

  // --- Fetch Majors ---
  const fetchMajors = useCallback(async () => {
    // Logic fetchMajors giữ nguyên hoặc cải thiện nếu cần (ví dụ: không cần search trong dropdown này)
    try {
      const query = { rpp: 1000, page: 1 }; // Lấy nhiều ngành một lúc
      const queryString = qs.stringify(query, { encode: false });
      const response = await Api({
        endpoint: `major/search?${queryString}`, // Endpoint tìm ngành
        method: METHOD_TYPE.GET,
      });
      if (response.success && Array.isArray(response.data?.items)) {
        setMajors(response.data.items);
        console.log("Majors fetched:", response.data.items.length);
      } else {
        console.error("Failed to fetch majors:", response.message);
        // Không nên toast error ở đây vì nó không phải lỗi chính của trang
      }
    } catch (error) {
      console.error("An error occurred while fetching majors:", error.message);
    }
  }, []); // Không có dependencies, chỉ fetch 1 lần

  // --- UseEffect Hooks ---
  useEffect(() => {
    fetchMajors(); // Fetch majors khi component mount
  }, [fetchMajors]);

  useEffect(() => {
    fetchData(); // Fetch subjects khi dependencies thay đổi
  }, [fetchData]);

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
  const handleDelete = (subject) => {
    // Nhận object
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
        endpoint: `subject/delete/${deleteItemId}`, // Endpoint xóa subject
        method: METHOD_TYPE.DELETE,
      });

      if (response.success) {
        toast.success("Xóa môn học thành công");
        if (data.length === 1 && currentPage > 0) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchData();
        }
      } else {
        console.log("Failed to delete subject:", response.message);
        toast.error(
          `Xóa thất bại: ${response.message || "Lỗi không xác định"}`
        );
      }
    } catch (error) {
      console.error("An error occurred while deleting subject:", error);
      toast.error(`Xóa thất bại: ${error.message || "Lỗi mạng"}`);
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
      // Reset form data
      subjectName: "",
      majorId: majors.length > 0 ? majors[0].majorId : "", // Chọn ngành đầu tiên làm mặc định
    });
    setFormErrors({});
    setIsModalOpen(true);
    // Không cần fetchMajors ở đây nữa nếu đã fetch ở useEffect
  };

  const handleView = (subject) => {
    setModalData({
      // Chuẩn bị data view
      subjectId: subject.subjectId,
      subjectName: subject.subjectName || "",
      majorId: getSafeNestedValue(subject, "major.majorId", ""),
      majorName: getSafeNestedValue(subject, "major.majorName", "N/A"), // Lấy cả tên ngành để hiển thị
      // Thêm createdAt, updatedAt nếu cần
      // createdAt: subject.createdAt,
      // updatedAt: subject.updatedAt,
    });
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (subject) => {
    setModalData({
      // Chuẩn bị data edit
      subjectId: subject.subjectId,
      subjectName: subject.subjectName || "",
      majorId: getSafeNestedValue(subject, "major.majorId", ""), // Cần majorId để select đúng
    });
    setModalMode("edit");
    setFormErrors({});
    setIsModalOpen(true);
    // Không cần fetchMajors ở đây nữa
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalData({});
    setModalMode(null);
    setFormErrors({});
  };

  // Validation
  const validateSubjectForm = (formData) => {
    const errors = {};
    if (!formData.subjectName?.trim())
      errors.subjectName = "Vui lòng nhập tên môn học.";
    if (!formData.majorId) errors.majorId = "Vui lòng chọn ngành.";
    return errors;
  };

  // Chung handler submit cho Add/Edit
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
          endpoint: `subject/update/${modalData.subjectId}`, // Dùng ID từ modalData gốc
          method: METHOD_TYPE.PUT,
          data: apiData,
        });
      } else {
        return; // Không làm gì nếu mode là view
      }

      if (response.success) {
        const successMsg =
          modalMode === "add"
            ? "Thêm môn học thành công"
            : "Cập nhật môn học thành công";
        toast.success(successMsg);
        if (modalMode === "add") {
          // Về trang đầu sau khi thêm
          setSortConfig({ key: "subjectName", direction: "asc" });
          if (currentPage !== 0) setCurrentPage(0);
          else fetchData();
        } else {
          fetchData(); // Load lại trang hiện tại sau khi sửa
        }
        handleCloseModal();
      } else {
        const errorMsg =
          modalMode === "add"
            ? "Thêm môn học thất bại"
            : "Cập nhật môn học thất bại";
        toast.error(`${errorMsg}: ${response.message || "Lỗi không xác định"}`);
        if (response.errors) setFormErrors(response.errors);
      }
    } catch (error) {
      console.error(`Error ${modalMode}ing subject:`, error);
      const errorMsg =
        modalMode === "add"
          ? "Thêm môn học thất bại"
          : "Cập nhật môn học thất bại";
      toast.error(`${errorMsg}: ${error.message || "Lỗi mạng"}`);
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
        sortKey: "major.majorName", // Cần backend hỗ trợ
        sortable: true,
        renderCell: (_, row) =>
          getSafeNestedValue(row, "major.majorName", "N/A"), // Dùng helper
      },
      // Thêm cột khác nếu cần
    ],
    []
  ); // Không có dependencies

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
          // Map từ state majors
          label: major.majorName,
          value: major.majorId,
        })),
        placeholder: "-- Chọn ngành --",
      },
    ],
    [majors]
  ); // Phụ thuộc state majors

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
      // Thêm các trường readOnly nếu cần hiển thị ở view mode
      // { key: "majorName", label: "Tên ngành (View)", readOnly: true, renderValue: (v, data) => getSafeNestedValue(data, 'major.majorName', 'N/A')},
      // { key: "createdAt", label: "Ngày tạo", readOnly: true, renderValue: (v) => v ? safeFormatDate(v) : 'N/A'},
    ],
    [majors]
  ); // Phụ thuộc state majors

  // --- JSX Render ---
  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        <h2 className="admin-list-title">Danh sách môn học</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            <SearchBar
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchKeyPress} // Thêm tìm bằng Enter
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
              placeholder="Tìm mã, tên môn học, tên ngành..." // Cập nhật placeholder
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
            <button className="add-admin-button" onClick={handleAddSubject}>
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
          onDelete={handleDelete} // Truyền object subject
          // Không có lock cho subject
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
            Tổng số môn học: {totalItems}
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
            ? "Thêm môn học"
            : modalMode === "edit"
            ? "Chỉnh sửa môn học"
            : "Xem môn học"
        }
        className="modal" // Có thể thêm class 'medium'
        overlayClassName="overlay"
      >
        {/* Render FormDetail khi có mode */}
        {modalMode && (
          <FormDetail
            formData={modalData}
            fields={modalMode === "add" ? addFields : editFields}
            mode={modalMode}
            onChange={(name, value) => {
              setModalData({ ...modalData, [name]: value });
              // Xóa lỗi khi thay đổi input
              if (formErrors[name]) {
                setFormErrors((prev) => ({ ...prev, [name]: "" }));
              }
            }}
            onSubmit={handleFormSubmit} // Dùng handler chung
            title={
              modalMode === "add"
                ? "Thêm môn học"
                : modalMode === "edit"
                ? "Chỉnh sửa môn học"
                : "Xem thông tin môn học"
            }
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

const ListOfSubject = React.memo(ListOfSubjectPage);
export default ListOfSubject;
