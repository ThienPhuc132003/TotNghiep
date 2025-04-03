/* eslint-disable no-undef */
import React, { useCallback, useEffect, useState } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css";
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
import unidecode from "unidecode";
import { toast, ToastContainer } from "react-toastify"; // Import toast và ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import CSS của react-toastify
// Set the app element for accessibility
Modal.setAppElement("#root");

const ListOfRequestPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // Thêm state này
  const [totalItems, setTotalItems] = useState(0); // Giữ lại totalItems
  const [searchInput, setSearchInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [modalData, setModalData] = useState({});
  const [modalMode, setModalMode] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [itemsPerPage, setItemsPerPage] = useState(10); // Giá trị mặc định
  const currentPath = "/yeu-cau";
  const [filters, setFilters] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const [formErrors, setFormErrors] = useState({}); // Thêm state để lưu trữ lỗi

  const resetState = () => {
    setSearchInput("");
    setCurrentPage(0);
    setFilters([]); // Reset filters
  };

  const fetchData = useCallback(
    async (sortConfigOverride = sortConfig) => {
      setIsLoading(true);
      setError(null);
      try {
        const query = {
          rpp: itemsPerPage, // Sử dụng itemsPerPage state
          page: currentPage + 1,
        };

        if (filters.length > 0) {
          query.filter = filters;
        }

        let sortToUse = sortConfigOverride;

        if (!sortToUse.key) {
          sortToUse = { key: "createdAt", direction: "desc" };
        }

        query.sort = [
          { key: sortToUse.key, type: sortToUse.direction.toUpperCase() },
        ];

        const response = await Api({
          endpoint: `user/get-list/:REQUEST`,
          method: METHOD_TYPE.GET,
          query: query,
        });

        if (response.success) {
          setData(response.data.items);
          setFilteredData(response.data.items); // Lưu trữ dữ liệu vào state mới
          setTotalItems(response.data.total); // Giữ lại totalItems
          setPageCount(Math.ceil(response.data.total / itemsPerPage)); // Cập nhật pageCount
        } else {
          setError(response.message || t("common.errorLoadingData"));
        }
      } catch (error) {
        setError(t("common.errorLoadingData"));
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, sortConfig, t, itemsPerPage, filters]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const handleSort = (sortKey) => {
    setSortConfig((prevConfig) => {
      const newDirection =
        prevConfig.key === sortKey && prevConfig.direction === "asc"
          ? "desc"
          : "asc";
      return { key: sortKey, direction: newDirection };
    });
  };

  const handleDelete = async (requestId) => {
    setDeleteItemId(requestId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await Api({
        endpoint: `request/${deleteItemId}`,
        method: METHOD_TYPE.DELETE,
      });

      if (response.success) {
        fetchData();
        toast.success("Xóa thành công!");
      } else {
        toast.error(
          `Xóa thất bại: ${response.message || "Lỗi không xác định"}`
        );
        console.log("Failed to delete request");
      }
    } catch (error) {
      toast.error(`Xóa thất bại: ${error.message || "Lỗi mạng"}`);
      console.error("An error occurred while deleting request:", error.message);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
    }
  };

  const handleAddRequest = () => {
    setModalMode("add");
    setModalData({
      email: "",
      phoneNumber: "",
      majorName: "",
      univercity: "",
      GPA: "",
      dateTimeLearn: [],
    });
    setIsModalOpen(true);
    setFormErrors({}); // Reset lỗi khi mở modal
  };

  const handleView = (request) => {
    setModalData({
      requestId: request.requestId,
      email: request.email,
      phoneNumber: request.phoneNumber,
      majorName: request.tutorProfile.majorName,
      univercity: request.tutorProfile.univercity,
      GPA: request.tutorProfile.GPA,
      dateTimeLearn: request.tutorProfile.dateTimeLearn,
    });
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (request) => {
    setModalData({
      requestId: request.requestId,
      email: request.email,
      phoneNumber: request.phoneNumber,
      majorName: request.tutorProfile.majorName,
      univercity: request.tutorProfile.univercity,
      GPA: request.tutorProfile.GPA,
      dateTimeLearn: request.tutorProfile.dateTimeLearn,
    });
    setModalMode("edit");
    setIsModalOpen(true);
    setFormErrors({}); // Reset lỗi khi mở modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalData({});
    setModalMode(null);
    setFormErrors({}); // Reset lỗi khi đóng modal
  };

  const handleSave = async () => {
    fetchData();
    setIsModalOpen(false);
    setModalData({});
    setModalMode(null);
    setFormErrors({}); // Reset lỗi sau khi lưu
  };

  const handleCreateRequest = async (formData) => {
    try {
      const response = await Api({
        endpoint: "request",
        method: METHOD_TYPE.POST,
        data: formData,
      });

      if (response.success) {
        toast.success("Thêm mới thành công!"); // Hiển thị thông báo thành công
        // Gọi lại fetchData với sort createdAt giảm dần
        fetchData({ key: "createdAt", direction: "desc" });
        handleSave();
      } else {
        toast.error(
          `Thêm mới thất bại: ${response.message || "Lỗi không xác định"}`
        );
        console.error("Failed to create request:", response.message);
      }
    } catch (error) {
      toast.error(`Thêm mới thất bại: ${error.message || "Lỗi mạng"}`);
      console.error("An error occurred while creating request:", error.message);
    }
  };

  const handleUpdateRequest = async (formData) => {
    try {
      const response = await Api({
        endpoint: `request/${modalData.requestId}`,
        method: METHOD_TYPE.PUT,
        data: formData,
      });

      if (response.success) {
        toast.success("Cập nhật thành công!");
        handleSave();
      } else {
        toast.error(
          `Cập nhật thất bại: ${response.message || "Lỗi không xác định"}`
        );
        console.error("Failed to update request:", response.message);
      }
    } catch (error) {
      toast.error(`Cập nhật thất bại: ${error.message || "Lỗi mạng"}`);
      console.error("An error occurred while updating request:", error.message);
    }
  };

  const columns = [
    { title: t("request.id"), dataKey: "requestId", sortable: true },
    { title: t("request.email"), dataKey: "email", sortable: true },
    { title: t("request.phone"), dataKey: "phoneNumber", sortable: true },
    {
      title: t("request.majorName"),
      dataKey: "tutorProfile.majorName",
      sortable: true,
    },
    {
      title: t("request.univercity"),
      dataKey: "tutorProfile.univercity",
      sortable: true,
    },
    { title: t("request.GPA"), dataKey: "tutorProfile.GPA", sortable: true },
    {
      title: t("request.dateTimeLearn"),
      dataKey: "tutorProfile.dateTimeLearn",
      renderCell: (value) => (
        <ul>
          {value.map((item, index) => (
            <li key={index}>
              {item.day}: {item.times.join(", ")}
            </li>
          ))}
        </ul>
      ),
    },
  ];

  const addFields = [
    { key: "email", label: t("request.email") },
    { key: "phoneNumber", label: t("request.phone") },
    { key: "majorName", label: t("request.majorName") },
    { key: "univercity", label: t("request.univercity") },
    { key: "GPA", label: t("request.GPA") },
    {
      key: "dateTimeLearn",
      label: t("request.dateTimeLearn"),
      type: "date",
    },
  ];

  const editFields = [
    { key: "requestId", label: t("request.id"), readOnly: true },
    { key: "email", label: t("request.email") },
    { key: "phoneNumber", label: t("request.phone") },
    { key: "majorName", label: t("request.majorName") },
    { key: "univercity", label: t("request.univercity") },
    { key: "GPA", label: t("request.GPA") },
    {
      key: "dateTimeLearn",
      label: t("request.dateTimeLearn"),
      type: "date",
    },
  ];

  const handleSearchInputChange = (query) => {
    setSearchInput(query);
    const normalizedQuery = unidecode(query.toLowerCase());
    const collator = new Intl.Collator("vi", { sensitivity: "base" });

    const filtered = data.filter((item) => {
      const searchValues = {
        requestId: item.requestId,
        email: item.email,
        phoneNumber: item.phoneNumber,
        majorName: item.tutorProfile?.majorName || "",
        univercity: item.tutorProfile?.univercity || "",
        gpa: item.tutorProfile?.GPA || "",
      };

      return Object.values(searchValues).some((value) => {
        if (value) {
          const stringValue = value.toString().toLowerCase();
          const normalizedValue = unidecode(stringValue);

          // Tạo biểu thức chính quy
          const regex = new RegExp(normalizedQuery, "i");

          return (
            collator.compare(normalizedValue, normalizedQuery) === 0 ||
            normalizedValue.includes(normalizedQuery) ||
            regex.test(normalizedValue)
          );
        }
        return false;
      });
    });

    setFilteredData(filtered);
  };

  const handleItemsPerPageChange = (newPageSize) => {
    setItemsPerPage(newPageSize);
    setCurrentPage(0); // Reset về trang đầu tiên
  };

  return (
    <AdminDashboardLayout
      currentPath={currentPath}
      childrenMiddleContentLower={
        <>
          <div className="admin-content">
            <h2 className="admin-list-title">Danh sách yêu cầu làm gia sư</h2>
            <div className="search-bar-filter-container">
              <div className="search-bar-filter">
                <SearchBar
                  value={searchInput}
                  onChange={handleSearchInputChange}
                  searchBarClassName="admin-search"
                  searchInputClassName="admin-search-input"
                  placeholder="Tìm kiếm yêu cầu"
                />
                <button
                  className="refresh-button"
                  onClick={() => {
                    resetState();
                    fetchData();
                  }}
                >
                  <i className="fa-solid fa-rotate"></i>
                </button>
              </div>
              <div className="filter-add-admin">
                <button className="add-admin-button" onClick={handleAddRequest}>
                  {t("common.addButton")}
                </button>
              </div>
            </div>
            {error && <Alert severity="error">{error}</Alert>}
            <Table
              columns={columns}
              data={filteredData}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={(request) => handleDelete(request.requestId)}
              pageCount={pageCount} // Truyền pageCount
              onPageChange={handlePageClick}
              forcePage={currentPage}
              onSort={handleSort}
              loading={isLoading}
              error={error}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
            <p>Tổng số yêu cầu: {totalItems}</p> {/* Hiện thị totalItems */}
          </div>
        </>
      }
    >
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        contentLabel={modalMode === "add" ? "Add Request" : "Edit Request"}
        className="modal"
        overlayClassName="overlay"
      >
        <FormDetail
          formData={modalData}
          fields={modalMode === "add" ? addFields : editFields}
          mode={modalMode || "view"}
          onChange={(name, value) => {
            setModalData({ ...modalData, [name]: value });
            setFormErrors({ ...formErrors, [name]: "" }); // Xóa lỗi khi người dùng nhập
          }}
          onSubmit={
            modalMode === "add" ? handleCreateRequest : handleUpdateRequest
          }
          onClose={handleCloseModal}
          errors={formErrors} // Truyền errors cho FormDetail
        />
      </Modal>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message="Bạn có chắc muốn xóa yêu cầu này?"
      />
      <ToastContainer // Thêm ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AdminDashboardLayout>
  );
};

const ListOfRequest = React.memo(ListOfRequestPage);
export default ListOfRequest;
