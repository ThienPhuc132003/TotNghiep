import React, { useState, useCallback, useEffect } from "react";
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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import qs from "qs"; // Import qs

// Set the app element for accessibility
Modal.setAppElement("#root");

const ListOfMajorPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [modalData, setModalData] = useState({});
  const [modalMode, setModalMode] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const currentPath = "/nganh";
  const [filters, setFilters] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("searchQuery", searchQuery);
    if (sortConfig.key) params.append("sortKey", sortConfig.key);
    if (sortConfig.direction)
      params.append("sortDirection", sortConfig.direction);
    params.append("page", currentPage + 1);
    params.append("rpp", itemsPerPage);
    window.history.pushState({}, "", `?${params.toString()}`);
  }, [searchQuery, sortConfig, currentPage, itemsPerPage]);

  const resetState = () => {
    setSearchInput("");
    setSearchQuery("");
    setSortConfig({ key: "", direction: "asc" });
    setCurrentPage(0);
    setFilters([]);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialSearchQuery = params.get("searchQuery") || "";
    const initialSortKey = params.get("sortKey") || "";
    const initialSortDirection = params.get("sortDirection") || "asc";
    const initialPage = parseInt(params.get("page") || "1", 10) - 1;
    const initialItemsPerPage = parseInt(params.get("rpp") || "10", 10);

    setSearchQuery(initialSearchQuery);
    setSortConfig({ key: initialSortKey, direction: initialSortDirection });
    setCurrentPage(initialPage);
    setSearchInput(initialSearchQuery);
    setItemsPerPage(initialItemsPerPage);
  }, []);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  const fetchData = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const query = {
        rpp: itemsPerPage,
        page: currentPage + 1,
      };

      if (filters.length > 0) {
        query.filter = JSON.stringify(filters);
      }

      if (sortConfig.key) {
        query.sort = JSON.stringify([
          { key: sortConfig.key, type: sortConfig.direction.toUpperCase() },
        ]);
      }

      const queryString = qs.stringify(query, { encode: false });

      const response = await Api({
        endpoint: `major/search?${queryString}`,
        method: METHOD_TYPE.GET,
      });

      if (response.success) {
        setData(response.data.items);
        setFilteredData(response.data.items);
        setTotalItems(response.data.total);
      } else {
        setError(response.message || t("common.errorLoadingData"));
      }
    } catch (error) {
      setError(t("common.errorLoadingData"));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, sortConfig, t, itemsPerPage, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const handleSearchInputChange = (query) => {
    setSearchInput(query);
    setSearchQuery(query);
  };

  useEffect(() => {
    const normalizedQuery = unidecode(searchQuery.toLowerCase());
    const filtered = data.filter((item) => {
      if (!item) return false;
      const majorId = item.majorId || "";
      const majorName = item.majorName || "";

      const normalizedMajorId = unidecode(majorId.toLowerCase());
      const normalizedMajorName = unidecode(majorName.toLowerCase());

      return (
        normalizedMajorId.includes(normalizedQuery) ||
        normalizedMajorName.includes(normalizedQuery)
      );
    });
    setFilteredData(filtered);
  }, [searchQuery, data]);

  const handleSort = (key) => {
    setSortConfig((prevConfig) => {
      const newDirection =
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc";
      return { key: key, direction: newDirection };
    });
    setCurrentPage(0);
  };

  const handleDelete = async (majorId) => {
    setDeleteItemId(majorId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await Api({
        endpoint: `major/delete/${deleteItemId}`,
        method: METHOD_TYPE.DELETE,
      });

      if (response.success) {
        fetchData();
        toast.success("Xóa thành công");
      } else {
        console.log("Failed to delete major");
        toast.error("Xóa không thành công");
      }
    } catch (error) {
      console.error("An error occurred while deleting major:", error.message);
      toast.error("Xóa không thành công");
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
    }
  };

  const handleAddMajor = () => {
    setModalMode("add");
    setModalData({
      sumName: "",
      majorName: "",
    });
    setIsModalOpen(true);
    setFormErrors({});
  };

  const handleView = (major) => {
    setModalData({
      majorId: major.majorId,
      sumName: major.sumName,
      majorName: major.majorName,
    });
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (major) => {
    setModalData({
      majorId: major.majorId,
      sumName: major.sumName,
      majorName: major.majorName,
    });
    setModalMode("edit");
    setIsModalOpen(true);
    setFormErrors({});
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalData({});
    setModalMode(null);
    setFormErrors({});
  };
  const handleSave = async () => {
    fetchData();
    setIsModalOpen(false);
    setModalData({});
    setModalMode(null);
    setFormErrors({});
  };

  const handleCreateMajor = async (formData) => {
    try {
      const response = await Api({
        endpoint: "major/create",
        method: METHOD_TYPE.POST,
        data: formData,
      });

      if (response.success) {
        handleSave();
        toast.success("Thêm thành công");
        // Thêm ngành mới vào đầu danh sách
        const newMajor = response.data;
        setData((prevData) => [newMajor, ...prevData]);
        setFilteredData((prevData) => [newMajor, ...prevData]);
      } else {
        console.log("Failed to create major");
        toast.error("Thêm không thành công");
      }
    } catch (error) {
      console.error("An error occurred while creating major:", error.message);
      toast.error("Thêm không thành công");
    }
  };

  const handleUpdateMajor = async (formData) => {
    try {
      const response = await Api({
        endpoint: `major/update/${modalData.majorId}`,
        method: METHOD_TYPE.PUT,
        data: formData,
      });

      if (response.success) {
        handleSave();
        toast.success("Cập nhật thành công");
        // Cập nhật danh sách sau khi chỉnh sửa
        setData((prevData) =>
          prevData.map((item) =>
            item.majorId === modalData.majorId ? { ...item, ...formData } : item
          )
        );
        setFilteredData((prevData) =>
          prevData.map((item) =>
            item.majorId === modalData.majorId ? { ...item, ...formData } : item
          )
        );
      } else {
        console.log("Failed to update major");
        toast.error("Cập nhật không thành công");
      }
    } catch (error) {
      console.error("An error occurred while updating major:", error.message);
      toast.error("Cập nhật không thành công");
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(0); // Reset to the first page when items per page changes
  };

  const columns = [
    { title: "Mã ngành", dataKey: "majorId", sortable: true },
    { title: "Tên viết tắt", dataKey: "sumName", sortable: true },
    { title: t("major.name"), dataKey: "majorName", sortable: true },
  ];

  const addFields = [
    { key: "sumName", label: "Tên viết tắt" },
    { key: "majorName", label: "Tên ngành" },
  ];

  const editFields = [
    { key: "majorId", label: "Mã ngành", type: "text", readOnly: true },
    { key: "sumName", label: "Tên viết tắt", type: "text" },
    { key: "majorName", label: "Tên ngành", type: "text" },
  ];

  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        <h2 className="admin-list-title">{t("major.listTitle")}</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            <SearchBar
              value={searchInput}
              onChange={handleSearchInputChange}
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
              placeholder="Tìm kiếm ngành"
            />
            <button
              className="refresh-button"
              onClick={() => {
                resetState();
                fetchData();
              }}
            >
              <i className="fa-solid fa-rotate fa-lg"></i>
            </button>
          </div>
          <div className="filter-add-admin">
            <button className="add-admin-button" onClick={handleAddMajor}>
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
          onDelete={(major) => handleDelete(major.majorId)}
          pageCount={Math.ceil(totalItems / itemsPerPage)}
          onPageChange={handlePageClick}
          forcePage={currentPage}
          onSort={handleSort}
          loading={isLoading}
          error={error}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
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
        contentLabel={modalMode === "add" ? "Thêm ngành" : "Chỉnh sửa nghành"}
        className="modal"
        overlayClassName="overlay"
      >
        <FormDetail
          formData={modalData}
          fields={modalMode === "add" ? addFields : editFields}
          mode={modalMode || "view"}
          onChange={(name, value) =>
            setModalData({ ...modalData, [name]: value })
          }
          onSubmit={modalMode === "add" ? handleCreateMajor : handleUpdateMajor}
          title={
            modalMode === "add"
              ? "Thêm ngành"
              : modalMode === "edit"
              ? "Chỉnh sửa ngành"
              : "Xem thông tin ngành"
          }
          onClose={handleCloseModal}
          errors={formErrors}
        />
      </Modal>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message="Bạn có chắc chắn muốn xóa ngành này?"
      />
      <ToastContainer
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

const ListOfMajor = React.memo(ListOfMajorPage);
export default ListOfMajor;
