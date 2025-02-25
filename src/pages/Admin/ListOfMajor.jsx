// src/pages/Admin/ListOfMajor.jsx
import React, { useState, useCallback, useEffect } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css";
import "../../assets/css/Modal.style.css";
import Table from "../../components/Table";
import SearchBar from "../../components/SearchBar";
import AdminFilterButton from "../../components/Admin/AdminFilterButton";
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
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const itemsPerPage = 10;
  const currentPath = "/nganh";
  const [filters, setFilters] = useState([]);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("searchQuery", searchQuery);
    if (sortConfig.key) {
      params.append("sortKey", sortConfig.key);
      params.append("sortDirection", sortConfig.direction);
    }
    params.append("page", currentPage + 1);
  }, [searchQuery, sortConfig, currentPage]);

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

    setSearchQuery(initialSearchQuery);
    setSortConfig({
      key: initialSortKey,
      direction: initialSortDirection,
    });
    setCurrentPage(initialPage);
    setSearchInput(initialSearchQuery);
  }, []);

  useEffect(() => {
    updateUrl();
  }, [searchQuery, sortConfig, currentPage, updateUrl]);

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

      if (sortConfig.key) {
        query.sort = [
          { key: sortConfig.key, type: sortConfig.direction.toUpperCase() },
        ];
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
  }, [currentPage, searchQuery, sortConfig, t, itemsPerPage, filters]);

  useEffect(() => {
    fetchData();
  }, [currentPage, fetchData]);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setSortConfig({ key: "", direction: "asc" });
    setCurrentPage(0);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSort = useCallback((sortKey) => {
    setSortConfig((prevConfig) => {
      const newDirection =
        prevConfig.key === sortKey && prevConfig.direction === "asc"
          ? "desc"
          : "asc";
      return { key: sortKey, direction: newDirection };
    });
  }, []);

  const handleApplyFilter = (filterValues) => {
    const newFilters = Object.keys(filterValues).map((key) => ({
      key,
      operator: filterValues[key].operator,
      value: filterValues[key].value,
    }));
    setFilters(newFilters);
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

  const handleView = useCallback((major) => {
    setModalData({
      majorId: major.majorId,
      majorName: major.majorName,
    });
    setModalMode("view");
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((major) => {
    setModalData({
      majorId: major.majorId,
      majorName: major.majorName,
    });
    setModalMode("edit");
    setIsModalOpen(true);
  }, []);

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
  const columns = [
    { title: t("major.id"), dataKey: "majorId", sortable: true },
    { title: t("major.name"), dataKey: "majorName", sortable: true },
  ];

  const addFields = [
    { key: "majorId", label: t("major.id") },
    { key: "majorName", label: t("major.name") },
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
              placeholder={t("major.searchPlaceholder")}
            />
            <button
              className="refresh-button"
              onClick={() => {
                resetState();
                fetchData();
              }}
            >
              {t("common.refresh")}
            </button>
            <AdminFilterButton
              fields={editFields}
              onApply={handleApplyFilter}
            />
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
          onDelete={handleDelete}
          pageCount={Math.ceil(totalItems / itemsPerPage)}
          onPageChange={handlePageClick}
          forcePage={currentPage}
          onSort={handleSort}
          loading={isLoading}
          error={error}
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
              ? t("major.addMajor")
              : modalMode === "edit"
              ? t("major.editMajor")
              : t("major.viewMajor")
          }
          onClose={handleCloseModal}
        />
      </Modal>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message={t("major.deleteConfirmation")}
      />
    </AdminDashboardLayout>
  );
};

const ListOfMajor = React.memo(ListOfMajorPage);
export default ListOfMajor;
