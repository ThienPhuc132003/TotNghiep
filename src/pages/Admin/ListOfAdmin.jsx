// src/pages/Admin/ListOfAdmin.jsx
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
import i18n from "../../i18n";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { formatInTimeZone } from "date-fns-tz";
import qs from "qs";

const ListOfAdminPage = () => {
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
  const currentPath = "/quan-ly-nganh";

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
            key: "adminProfile.fullname",
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
        endpoint: `admin/search?${queryString}`,
        method: METHOD_TYPE.GET,
      });

      if (response.success) {
        setData(
          response.data.items.map((item) => ({
            ...item,
            fullname: item.adminProfile.fullname,
          }))
        );
        setTotalItems(response.data.total);
      } else {
        setError(t("common.errorLoadingData"));
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
    setSortConfig({ key: "", direction: "asc" }); // Reset sort configuration
    setCurrentPage(0); // Reset to first page on search
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

  const handleAddAdmin = () => {
    setModalMode("add");
    setModalData({
      fullname: "",
      birthday: "",
      email: "",
      phoneNumber: "",
      homeAddress: "",
      gender: "MALE", // Set default value for gender
      password: "",
      confirmPassword: "",
    });
    setIsModalOpen(true);
  };

  const handleView = (admin) => {
    setModalData({
      adminId: admin.adminId,
      fullname: admin.fullname,
      phoneNumber: admin.phoneNumber,
      email: admin.email,
      homeAddress: admin.homeAddress,
      birthday: admin.birthday,
      gender: admin.gender,
      workEmail: admin.workEmail,
      roleId: admin.roleId,
    });
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (admin) => {
    setModalData({
      adminId: admin.adminId,
      fullname: admin.fullname,
      phoneNumber: admin.phoneNumber,
      email: admin.email,
      homeAddress: admin.homeAddress,
      birthday: admin.birthday,
      gender: admin.gender,
      workEmail: admin.workEmail,
      roleId: admin.roleId,
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

  const handleCreateAdmin = async (formData) => {
    try {
      const response = await Api({
        endpoint: "admin/create-admin",
        method: METHOD_TYPE.POST,
        data: formData,
      });

      if (response.success) {
        handleSave();
      } else {
        console.error("Failed to create admin:", response.message);
      }
    } catch (error) {
      console.error("An error occurred while creating admin:", error.message);
    }
  };

  const handleDelete = async (adminId) => {
    setDeleteItemId(adminId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await Api({
        endpoint: `admin/${deleteItemId}`,
        method: METHOD_TYPE.DELETE,
      });

      if (response.success) {
        fetchData(); // Refresh the data after deletion
      } else {
        console.log("Failed to delete admin");
      }
    } catch (error) {
      console.error("An error occurred while deleting admin:", error.message);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
    }
  };

  const handleApplyFilter = (filterValues) => {
    // Apply filter logic here
    console.log("Filter applied with values:", filterValues);
    // Update the search query or other state based on the filter values
    setSearchQuery(filterValues.fullname || "");
    setSortConfig({ key: "", direction: "asc" }); // Reset sort configuration
    setCurrentPage(0); // Reset to first page on filter apply
  };

  const addFields = [
    { key: "fullname", label: t("admin.name") },
    { key: "birthday", label: t("admin.birthday"), type: "date" },
    { key: "email", label: t("admin.email") },
    { key: "phoneNumber", label: t("admin.phone") },
    { key: "homeAddress", label: t("admin.homeAddress") },
    {
      key: "gender",
      label: t("admin.gender"),
      type: "select",
      options: ["MALE", "FEMALE"],
    },
    { key: "password", label: t("admin.password") },
    { key: "confirmPassword", label: t("admin.confirmPassword") },
    {
      key: "roleId",
      label: t("admin.role"),
      type: "select",
      options: ["BEST_ADMIN", "OTHER_ROLE"],
    },
  ];

  const editFields = [
    { key: "adminId", label: t("admin.id"), readOnly: true },
    { key: "fullname", label: t("admin.name") },
    { key: "birthday", label: t("admin.birthday"), type: "date" },
    { key: "email", label: t("admin.email") },
    { key: "phoneNumber", label: t("admin.phone") },
    { key: "homeAddress", label: t("admin.homeAddress") },
    {
      key: "gender",
      label: t("admin.gender"),
      type: "select",
      options: ["MALE", "FEMALE"],
    },
    {
      key: "roleId",
      label: t("admin.role"),
      type: "select",
      options: ["BEST_ADMIN", "OTHER_ROLE"],
    },
  ];

  const columns = [
    { title: t("admin.id"), dataKey: "adminId", sortable: true },
    { title: t("admin.name"), dataKey: "fullname", sortable: true },
    { title: t("admin.role"), dataKey: "roleId", sortable: true },
    { title: t("admin.phone"), dataKey: "phoneNumber", sortable: true },
    { title: t("admin.email"), dataKey: "email", sortable: true },
    {
      title: t("common.createdAt"),
      dataKey: "createdAt",
      sortable: true,
      renderCell: (value) => {
        const timeZone =
          i18n.language === "vi" ? "Asia/Ho_Chi_Minh" : "America/New_York";
        return formatInTimeZone(
          new Date(value),
          timeZone,
          "yyyy-MM-dd HH:mm:ssXXX"
        );
      },
    },
    { title: t("common.createdBy"), dataKey: "createdBy", sortable: true },
    {
      title: t("admin.status"),
      dataKey: "status",
      sortable: true,
      renderCell: (value) => (
        <span className={`status ${value.toLowerCase()}`}>
          {t(`admin.${value.toLowerCase()}`)}
        </span>
      ),
    },
  ];

  const combinedAdmins = data;

  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        <h2 className="admin-list-title">{t("admin.listTitle")}</h2>
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
            <button className="add-admin-button" onClick={handleAddAdmin}>
              {t("common.addButton")}
            </button>
            <AdminFilterButton
              fields={editFields}
              onApply={handleApplyFilter}
            />
          </div>
        </div>
        {isLoading ? (
          <div className="loading-container">
            <Spinner /> {t("common.loading")}
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <Table
            columns={columns}
            data={combinedAdmins}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={(admin) => handleDelete(admin.adminId)}
            pageCount={Math.ceil(totalItems / itemsPerPage)}
            onPageChange={handlePageClick}
            forcePage={currentPage}
            onSort={handleSort}
          />
        )}
      </div>
    </>
  );

  return (
    <AdminDashboardLayout
      currentPath={currentPath}
      childrenMiddleContentLower={childrenMiddleContentLower}
    >
      {/* Admin Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalMode === "add" ? "Add Admin" : "Edit Admin"}
      >
        <FormDetail
          formData={modalData}
          fields={modalMode === "add" ? addFields : editFields}
          mode={modalMode || "view"} // Ensure mode is never null
          onChange={(name, value) =>
            setModalData({ ...modalData, [name]: value })
          }
          onSubmit={modalMode === "add" ? handleCreateAdmin : handleSave}
        />
      </Modal>
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this admin?"
      />
    </AdminDashboardLayout>
  );
};

const ListOfAdmin = React.memo(ListOfAdminPage);
export default ListOfAdmin;