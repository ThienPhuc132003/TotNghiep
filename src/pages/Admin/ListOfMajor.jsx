// src/pages/Admin/ListOfMajor.jsx
import React, { useCallback, useEffect, useState } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css";
import Table from "../../components/Table";
import SearchBar from "../../components/SearchBar";
import AdminFilterButton from "../../components/Admin/AdminFilterButton";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import FormDetail from "../../components/FormDetail";
import { useTranslation } from "react-i18next";
import Modal from "../../components/Modal";

const ListOfMajorPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalData, setModalData] = useState({});
  const [modalMode, setModalMode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 5;
  const currentPath = "/quan-ly-nganh";

  const fetchData = useCallback(
    async (filter = []) => {
      setIsLoading(true);
      try {
        const query = {
          rpp: itemsPerPage,
          page: currentPage + 1,
        };

        if (searchQuery) {
          filter.push({
            key: "majorId",
            operator: "like",
            value: searchQuery,
          });
        }

        const response = await Api({
          endpoint: "major",
          method: METHOD_TYPE.GET,
          query,
        });

        if (response.success === true) {
          setData(response.data.items);
          setTotalItems(response.data.total);
        } else {
          console.log("Failed to fetch data");
        }
      } catch (error) {
        console.log("An error occurred while fetching data");
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, itemsPerPage, searchQuery]
  );

  useEffect(() => {
    fetchData();
  }, [currentPage, fetchData]);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const handleDelete = async (majorId) => {
    if (window.confirm(t("major.confirmDelete"))) {
      try {
        const response = await Api({
          endpoint: `major/${majorId}`,
          method: METHOD_TYPE.DELETE,
        });

        if (response.success) {
          fetchData(); // Refresh the data after deletion
        } else {
          console.log("Failed to delete major");
        }
      } catch (error) {
        console.log("An error occurred while deleting major");
      }
    }
  };

  const handleAddMajor = () => {
    setModalMode("add");
    setModalData({
      majorName: "",
    });
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
    fetchData(); // Refresh the data after saving
    setIsModalOpen(false);
    setModalData({});
    setModalMode(null);
  };

  const handleCreateMajor = async (formData) => {
    try {
      const response = await Api({
        endpoint: "major",
        method: METHOD_TYPE.POST,
        data: formData,
      });

      if (response.success) {
        handleSave();
      } else {
        console.log("Failed to create major");
      }
    } catch (error) {
      console.log("An error occurred while creating major");
    }
  };

  const handleApplyFilter = (filterValues) => {
    // Apply filter logic here
    console.log("Filter applied with values:", filterValues);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const pageCount = Math.ceil(totalItems / itemsPerPage);

  const addFields = [
    { key: "majorName", label: t("major.name") },
  ];

  const editFields = [
    { key: "majorId", label: t("major.id"), readOnly: true },
    { key: "majorName", label: t("major.name") },
  ];

  const columns = [
    { title: t("major.id"), dataKey: "majorId" },
    { title: t("major.name"), dataKey: "majorName" },
  ];

  const combinedMajors = data;

  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        <h2 className="admin-list-title">{t("major.listTitle")}</h2>
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
            <button className="add-admin-button" onClick={handleAddMajor}>
              {t("common.addButton")}
            </button>
            <AdminFilterButton
              fields={editFields}
              onApply={handleApplyFilter}
            />
          </div>
        </div>
        {isLoading ? (
          <p>{t("common.loading")}</p>
        ) : (
          <Table
            columns={columns}
            data={combinedMajors}
            onEdit={handleEdit}
            onDelete={(major) => handleDelete(major.majorId)}
            pageCount={pageCount}
            onPageChange={handlePageClick}
          />
        )}
      </div>
    </>
  );

  return (
    <AdminDashboardLayout
      currentPath={currentPath}
      currentPage={t("major.management")}
      childrenMiddleContentLower={childrenMiddleContentLower}
    >
      {/* Major Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <FormDetail
          formData={modalData}
          fields={modalMode === "add" ? addFields : editFields}
          mode={modalMode || "view"} // Ensure mode is never null
          onChange={(name, value) =>
            setModalData({ ...modalData, [name]: value })
          }
          onSubmit={modalMode === "add" ? handleCreateMajor : handleSave}
          onClose={handleCloseModal}
        />
      </Modal>
    </AdminDashboardLayout>
  );
};

const ListOfMajor = React.memo(ListOfMajorPage);
export default ListOfMajor;