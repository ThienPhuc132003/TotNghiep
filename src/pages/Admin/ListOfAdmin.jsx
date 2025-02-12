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
import { formatInTimeZone } from "date-fns-tz";
import i18n from "../../i18n";
import Spinner from "../../components/Spinner";

const ListOfAdminPage = () => {
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
  const [error, setError] = useState(null);
  const itemsPerPage = 7;
  const currentPath = "/quan-ly-admin";

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
            key: "adminId",
            operator: "like",
            value: searchQuery,
          },
        ]);
      }

      const response = await Api({
        endpoint: "admin/search",
        method: METHOD_TYPE.GET,
        query,
      });

      if (response.success === true) {
        setData(response.data.items);
        setTotalItems(response.data.total);
      } else {
        setError(t("common.errorLoadingData"));
      }
    } catch (error) {
      setError(t("common.errorLoadingData"));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, t]);

  useEffect(() => {
    fetchData();
  }, [currentPage, fetchData]);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(0); // Reset to first page on search
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleAddAdmin = () => {
    setModalMode("add");
    setModalData({
      fullname: "",
      birthday: "",
      email: "",
      phoneNumber: "",
      homeAddress: "",
      gender: "",
      password: "",
      confirmPassword: "",
      roleId: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (admin) => {
    setModalData({
      adminId: admin.adminId,
      fullname: admin.adminProfile.fullname,
      phoneNumber: admin.phoneNumber,
      email: admin.email,
      homeAddress: admin.adminProfile.homeAddress,
      birthday: admin.adminProfile.birthday,
      gender: admin.adminProfile.gender,
      workEmail: admin.adminProfile.workEmail,
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
        endpoint: "admin",
        method: METHOD_TYPE.POST,
        data: formData,
      });

      if (response.success) {
        handleSave();
      } else {
        console.log("Failed to create admin");
      }
    } catch (error) {
      console.log("An error occurred while creating admin");
    }
  };

  const handleDelete = async (adminId) => {
    if (window.confirm(t("admin.confirmDelete"))) {
      try {
        const response = await Api({
          endpoint: `admin/${adminId}`,
          method: METHOD_TYPE.DELETE,
        });

        if (response.success) {
          fetchData(); // Refresh the data after deletion
        } else {
          console.log("Failed to delete admin");
        }
      } catch (error) {
        console.log("An error occurred while deleting admin");
      }
    }
  };

  const handleApplyFilter = (filterValues) => {
    // Apply filter logic here
    console.log("Filter applied with values:", filterValues);
  };

  const pageCount = Math.ceil(totalItems / itemsPerPage);

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

  const viewFields = [
    { key: "adminId", label: t("admin.id") },
    { key: "fullname", label: t("admin.name") },
    { key: "phoneNumber", label: t("admin.phone") },
    { key: "email", label: t("admin.email") },
    { key: "homeAddress", label: t("admin.homeAddress") },
    { key: "birthday", label: t("admin.birthday") },
    { key: "gender", label: t("admin.gender") },
    { key: "workEmail", label: t("admin.workEmail") },
    { key: "roleId", label: t("admin.role") },
  ];

  const editFields = viewFields.map((field) => ({
    ...field,
    readOnly: ![
      "fullname",
      "birthday",
      "phoneNumber",
      "homeAddress",
      "gender",
      "roleId",
    ].includes(field.key),
  }));

  const columns = [
    { title: t("admin.id"), dataKey: "adminId" },
    { title: t("admin.name"), dataKey: "adminProfile.fullname" },
    { title: t("admin.role"), dataKey: "roleId" },
    { title: t("admin.phone"), dataKey: "phoneNumber" },
    { title: t("admin.email"), dataKey: "email" },
    {
      title: t("admin.idCard"),
      dataKey: "adminProfile.identifyCardNumber",
    },
    {
      title: t("common.createdAt"),
      dataKey: "createdAt",
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
    { title: t("common.createdBy"), dataKey: "createdBy" },
    {
      title: t("admin.status"),
      dataKey: "status",
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
            onView={handleEdit}
            onEdit={handleEdit}
            onDelete={(admin) => handleDelete(admin.adminId)}
            pageCount={pageCount}
            onPageChange={handlePageClick}
            forcePage={currentPage}
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
    </AdminDashboardLayout>
  );
};

const ListOfAdmin = React.memo(ListOfAdminPage);
export default ListOfAdmin;
