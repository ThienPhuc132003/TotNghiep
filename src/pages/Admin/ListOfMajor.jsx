import React, { useState, useCallback, useEffect } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css";
import "../../assets/css/Modal.style.css";
import Table from "../../components/Table";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import FormDetail from "../../components/FormDetail";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { Alert } from "@mui/material";

// Set the app element for accessibility
Modal.setAppElement("#root");

const ListOfMajorPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
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
  const [sortKey, setSortKey] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const currentPath = "/nganh";
  const [filters, setFilters] = useState([]);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("searchQuery", searchQuery);
    if (sortKey) {
      params.append("sortKey", sortKey);
      params.append("sortDirection", sortDirection);
    }
    params.append("page", currentPage + 1);
  }, [searchQuery, sortKey, sortDirection, currentPage]);

  const resetState = () => {
    setSearchInput("");
    setSearchQuery("");
    setSortKey("");
    setSortDirection("asc");
    setCurrentPage(0);
    setFilters([]);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialSearchQuery = params.get("searchQuery") || "";
    const initialSortKey = params.get("sortKey") || "";
    const initialSortDirection = params.get("sortDirection") || "asc";
    const initialPage = parseInt(params.get("page") || "1", 10) - 1;

    setSearchQuery(initialSearchQuery);
    setSortKey(initialSortKey);
    setSortDirection(initialSortDirection);
    setCurrentPage(initialPage);
    setSearchInput(initialSearchQuery);
  }, []);

  useEffect(() => {
    updateUrl();
  }, [searchQuery, sortKey, sortDirection, currentPage, updateUrl]);

  const fetchData = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const query = {
        rpp: itemsPerPage,
        page: currentPage + 1,
      };

      if (searchQuery) {
        query.filter = [
          {
            key: "majorId",
            operator: "like",
            value: searchQuery,
          },
        ];
      }

      if (filters.length > 0) {
        query.filter = [...(query.filter || []), ...filters];
      }

      if (sortKey) {
        query.sort = [{ key: sortKey, type: sortDirection.toUpperCase() }];
      }

      const response = await Api({
        endpoint: `major/search`,
        method: METHOD_TYPE.GET,
        query: query,
      });

      if (response.success) {
        setData(response.data.items);
        setTotalItems(response.data.total);
      } else {
        setError(response.message || t("common.errorLoadingData"));
      }
    } catch (error) {
      setError(t("common.errorLoadingData"));
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    searchQuery,
    sortKey,
    sortDirection,
    t,
    itemsPerPage,
    filters,
  ]);

  useEffect(() => {
    fetchData();
  }, [currentPage, fetchData]);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setSortKey("");
    setSortDirection("asc");
    setCurrentPage(0);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortKey === key && sortDirection === "asc") {
      direction = "desc";
    }
    setSortKey(key);
    setSortDirection(direction);
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
      } else {
        console.log("Failed to delete major");
      }
    } catch (error) {
      console.error("An error occurred while deleting major:", error.message);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
    }
  };

  const handleAddMajor = () => {
    setModalMode("add");
    setModalData({
      majorId: "",
      majorName: "",
    });
    setIsModalOpen(true);
  };

  const handleView = (major) => {
    setModalData({
      majorId: major.majorId,
      majorName: major.majorName,
    });
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (major) => {
    setModalData({
      majorId: major.majorId,
      majorName: major.majorName,
    });
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalData({});
    setModalMode(null);
  };

  const handleSave = async () => {
    fetchData();
    setIsModalOpen(false);
    setModalData({});
    setModalMode(null);
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
      } else {
        console.log("Failed to create major");
      }
    } catch (error) {
      console.error("An error occurred while creating major:", error.message);
    }
  };

  const handleUpdateMajor = async (formData) => {
    const allowedFields = ["majorId", "majorName"];
    const filteredData = Object.keys(formData)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = formData[key];
        return obj;
      }, {});

    try {
      const response = await Api({
        endpoint: `major/update/${modalData.majorId}`,
        method: METHOD_TYPE.PUT,
        data: filteredData,
      });

      if (response.success) {
        handleSave();
      } else {
        console.log("Failed to update major");
      }
    } catch (error) {
      console.error("An error occurred while updating major:", error.message);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(0); // Reset to the first page when items per page changes
  };

  const columns = [
    { title: "Tên viết tắt", dataKey: "majorId", sortable: true },
    { title: t("major.name"), dataKey: "majorName", sortable: true },
  ];

  const addFields = [
    { key: "majorId", label: "Tên viết tắt" },
    { key: "majorName", label: "Tên ngành" },
  ];

  const editFields = [
    { key: "majorId", label: t("major.id"), type: "text", readOnly: true },
    { key: "majorName", label: t("major.name"), type: "text" },
  ];

  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        <h2 className="admin-list-title">{t("major.listTitle")}</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
              searchBarButtonClassName="admin-search-button"
              searchBarOnClick={handleSearch}
              onKeyPress={handleKeyPress}
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
          data={data}
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
        contentLabel={
          modalMode === "add" ? t("major.addMajor") : t("major.editMajor")
        }
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
              ? t("Thêm ngành")
              : modalMode === "edit"
              ? "Chỉnh sửa ngành"
              : "Xem ngành"
          }
          onClose={handleCloseModal}
        />
      </Modal>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message="Bạn có chắc chắn muốn xóa ngành này?"
      />
    </AdminDashboardLayout>
  );
};

const ListOfMajor = React.memo(ListOfMajorPage);
export default ListOfMajor;
