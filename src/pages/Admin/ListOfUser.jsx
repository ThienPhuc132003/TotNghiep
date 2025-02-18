// src/pages/Admin/ListOfUser.jsx
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
import i18n from "../../i18n";
import Modal from "react-modal";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { formatInTimeZone } from "date-fns-tz";
import qs from "qs";
import { Alert } from "@mui/material";

// Set the app element for accessibility
Modal.setAppElement("#root");

const ListOfUserPage = () => {
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
  const currentPath = "/quan-ly-nguoi-dung";

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

  const resetState = () => {
    setSearchInput("");
    setSearchQuery("");
    setSortConfig({ key: "", direction: "asc" });
    setCurrentPage(0);
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
        endpoint: `user/search?${queryString}`,
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

  const handleDelete = async (userId) => {
    setDeleteItemId(userId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await Api({
        endpoint: `user/${deleteItemId}`,
        method: METHOD_TYPE.DELETE,
      });

      if (response.success) {
        fetchData();
      } else {
        console.log("Failed to delete user");
      }
    } catch (error) {
      console.error("An error occurred while deleting user:", error.message);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
    }
  };

  const handleAddUser = () => {
    setModalMode("add");
    setModalData({
      fullname: "",
      birthday: "",
      email: "",
      phoneNumber: "",
      homeAddress: "",
      gender: "MALE",
      password: "",
      confirmPassword: "",
    });
    setIsModalOpen(true);
  };

  const handleView = (user) => {
    setModalData({
      userId: user.userId,
      fullname: user.userProfile.fullname,
      phoneNumber: user.phoneNumber,
      email: user.email,
      homeAddress: user.userProfile.homeAddress,
      birthday: user.userProfile.birthday,
      gender: user.userProfile.gender,
      workEmail: user.userProfile.workEmail,
      roleId: user.roleId,
    });
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setModalData({
      userId: user.userId,
      fullname: user.userProfile.fullname,
      phoneNumber: user.phoneNumber,
      email: user.email,
      homeAddress: user.userProfile.homeAddress,
      birthday: user.userProfile.birthday,
      gender: user.userProfile.gender,
      workEmail: user.userProfile.workEmail,
      roleId: user.roleId,
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

  const handleCreateUser = async (formData) => {
    try {
      const response = await Api({
        endpoint: "user/create-user",
        method: METHOD_TYPE.POST,
        data: formData,
      });

      if (response.success) {
        handleSave();
      } else {
        console.error("Failed to create user:", response.message);
      }
    } catch (error) {
      console.error("An error occurred while creating user:", error.message);
    }
  };

  const handleUpdateUser = async (formData) => {
    try {
      const response = await Api({
        endpoint: `user/update-user/${modalData.userId}`,
        method: METHOD_TYPE.PUT,
        data: formData,
      });

      if (response.success) {
        handleSave();
      } else {
        console.error("Failed to update user:", response.message);
      }
    } catch (error) {
      console.error("An error occurred while updating user:", error.message);
    }
  };

  const columns = [
    { title: "Mã người dùng", dataKey: "userId", sortable: true },
    {
      title: t("admin.name"),
      dataKey: "userProfile.fullname",
      sortable: true,
    },
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
          "yyyy-MM-dd HH:mm:ss"
        );
      },
    },
    { title: t("common.createdBy"), dataKey: "createdBy", sortable: true },
  ];

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
    {
      key: "roleId",
      label: t("admin.role"),
      type: "select",
      options: ["USER", "TUTOR"],
    },
    { key: "password", label: t("admin.password"), type: "password" },
    {
      key: "confirmPassword",
      label: t("admin.confirmPassword"),
      type: "password",
    },
  ];

  const editFields = [
    { key: "userId", label: "Mã người dùng", readOnly: true },
    { key: "fullname", label: t("admin.name") },
    { key: "birthday", label: t("admin.birthday"), type: "date" },
    { key: "email", label: t("admin.email"), readOnly: true },
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
      options: ["USER", "TUTOR"],
    },
  ];

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
            <button className="add-admin-button" onClick={handleAddUser}>
              {t("common.addButton")}
            </button>
            <button
              className="refresh-button"
              onClick={() => {
                resetState();
                fetchData();
              }}
            >
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
          onDelete={(user) => handleDelete(user.userId)}
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
        contentLabel={modalMode === "add" ? "Add User" : "Edit User"}
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
          onSubmit={modalMode === "add" ? handleCreateUser : handleUpdateUser}
        />
      </Modal>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message="Bạn có chắc muốn xóa người dùng này?"
      />
    </AdminDashboardLayout>
  );
};

const ListOfUser = React.memo(ListOfUserPage);
export default ListOfUser;