// src/pages/Admin/ListOfRequest.jsx
import React, { useCallback, useEffect, useState } from "react";
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
import qs from "qs";

// Set the app element for accessibility
Modal.setAppElement("#root");

const ListOfRequestPage = () => {
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
  const itemsPerPage = 5;
  const currentPath = "/quan-ly-yeu-cau";

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("searchQuery", searchQuery);
    if (sortConfig.key) {
      params.append("sortKey", sortConfig.key);
      params.append("sortDirection", sortConfig.direction);
    }
    params.append("page", currentPage + 1);

    const newUrl = `${currentPath}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
  }, [searchQuery, sortConfig, currentPage, currentPath]);

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
    setIsLoading(true);
    setError(null);
    try {
      const query = {
        rpp: itemsPerPage,
        page: currentPage + 1,
      };

      if (searchQuery) {
        query.filter = JSON.stringify([
          {
            key: "email",
            operator: "like",
            value: searchQuery,
          },
        ]);
      }

      if (sortConfig.key) {
        query.sort = JSON.stringify([
          { key: sortConfig.key, type: sortConfig.direction.toUpperCase() },
        ]);
      }

      const queryString = qs.stringify(query, { encode: false });

      const response = await Api({
        endpoint: `user/get-list/:REQUEST?${queryString}`,
        method: METHOD_TYPE.GET,
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
  }, [currentPage, searchQuery, sortConfig, t]);

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

  const handleSort = (sortKey) => {
    setSortConfig((prevConfig) => {
      const newDirection =
        prevConfig.key === sortKey && prevConfig.direction === "asc"
          ? "desc"
          : "asc";
      return { key: sortKey, direction: newDirection };
    });
  };

  const handleApplyFilter = (filterValues) => {
    setSearchQuery(filterValues.email || "");
    setSortConfig({ key: "", direction: "asc" });
    setCurrentPage(0);
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
      } else {
        console.log("Failed to delete request");
      }
    } catch (error) {
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

  const handleCreateRequest = async (formData) => {
    try {
      const response = await Api({
        endpoint: "request",
        method: METHOD_TYPE.POST,
        data: formData,
      });

      if (response.success) {
        handleSave();
      } else {
        console.error("Failed to create request:", response.message);
      }
    } catch (error) {
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
        handleSave();
      } else {
        console.error("Failed to update request:", response.message);
      }
    } catch (error) {
      console.error("An error occurred while updating request:", error.message);
    }
  };

  const columns = [
    { title: t("request.id"), dataKey: "requestId", sortable: true },
    { title: t("request.email"), dataKey: "email", sortable: true },
    { title: t("request.phone"), dataKey: "phoneNumber", sortable: true },
    { title: t("request.majorName"), dataKey: "tutorProfile.majorName", sortable: true },
    { title: t("request.univercity"), dataKey: "tutorProfile.univercity", sortable: true },
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

  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        <h2 className="admin-list-title">{t("request.listTitle")}</h2>
        <div className="admin-search-filter">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            searchBarClassName="admin-search"
            searchInputClassName="admin-search-input"
            searchBarButtonClassName="admin-search-button"
            searchBarOnClick={handleSearch}
            onKeyPress={handleKeyPress}
            placeholder={t("common.searchPlaceholder")}
          />
          <div className="filter-add-admin">
            <button className="add-admin-button" onClick={handleAddRequest}>
              {t("common.addButton")}
            </button>
            <button className="refresh-button" onClick={fetchData}>
              {t("common.refresh")}
            </button>
            <AdminFilterButton fields={editFields} onApply={handleApplyFilter} />
          </div>
        </div>
        {error && <Alert severity="error">{error}</Alert>}
        <Table
          columns={columns}
          data={data}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={(request) => handleDelete(request.requestId)}
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
        contentLabel={modalMode === "add" ? "Add Request" : "Edit Request"}
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
          onSubmit={modalMode === "add" ? handleCreateRequest : handleUpdateRequest}
        />
      </Modal>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message="Bạn có chắc muốn xóa yêu cầu này?"
      />
    </AdminDashboardLayout>
  );
};

const ListOfRequest = React.memo(ListOfRequestPage);
export default ListOfRequest;