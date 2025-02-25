// src/pages/Admin/ListOfAdmin.jsx
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
import { Alert } from "@mui/material";

// Set the app element for accessibility
Modal.setAppElement("#root");

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
  const itemsPerPage = 10;
  const currentPath = "/nhan-vien";
  const [filters, setFilters] = useState([]);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("searchQuery", searchQuery);
    if (sortConfig.key) {
      params.append("sortKey", sortConfig.key);
      params.append("sortDirection", sortConfig.direction);
    }
    params.append("page", currentPage + 1);

    // const newUrl = `${currentPath}?${params.toString()}`;
    // window.history.pushState({}, "", newUrl);
  }, [searchQuery, sortConfig, currentPage]);

  const resetState = () => {
    setSearchInput("");
    setSearchQuery("");
    setSortConfig({ key: "", direction: "asc" });
    setCurrentPage(0);
    setFilters([]); // Reset filters
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
        query.filter = [
          {
            key: "adminId",
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
        endpoint: `admin/search`,
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
    const newFilters = Object.keys(filterValues).map((key) => ({
      key,
      operator: filterValues[key].operator,
      value: filterValues[key].value,
    }));
    setFilters(newFilters);
    setCurrentPage(0);
  };

  const handleDelete = async (adminId) => {
    setDeleteItemId(adminId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await Api({
        endpoint: `admin/delete-admin-by-id/${deleteItemId}`,
        method: METHOD_TYPE.DELETE,
      });

      if (response.success) {
        fetchData();
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
      options: ["BEST_ADMIN", "OTHER_ROLE"],
    },
    { key: "password", label: t("admin.password"), type: "password" },
    {
      key: "confirmPassword",
      label: t("admin.confirmPassword"),
      type: "password",
    },
  ];

  const handleAddAdmin = () => {
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

  const handleView = (admin) => {
    setModalData({
      adminId: admin.adminId,
      fullname: admin.adminProfile.fullname,
      phoneNumber: admin.phoneNumber,
      email: admin.email,
      homeAddress: admin.adminProfile.homeAddress,
      birthday: admin.adminProfile.birthday,
      gender: admin.adminProfile.gender,
      workEmail: admin.adminProfile.workEmail,
      roleId: admin.roleId === "BEST_ADMIN" ? "Admin" : "Nhân viên",
      status: admin.status,
    });
    setModalMode("view");
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
      roleId: admin.roleId === "BEST_ADMIN" ? "Admin" : "Nhân viên",
      status: admin.status,
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

  const handleUpdateAdmin = async (formData) => {
    const allowedFields = [
      "fullname",
      "birthday",
      "email",
      "homeAddress",
      "gender",
      "status",
      "roleId",
      // ...
    ];

    const filteredData = Object.keys(formData)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = formData[key];
        return obj;
      }, {});

    // Chuyển đổi giá trị roleId trước khi gửi lên server
    if (filteredData.roleId === "Admin") {
      filteredData.roleId = "BEST_ADMIN";
    } else if (filteredData.roleId === "Nhân viên") {
      filteredData.roleId = "ADMIN";
    }

    try {
      const response = await Api({
        endpoint: `admin/update-admin-by-id/${modalData.adminId}`,
        method: METHOD_TYPE.PUT,
        data: filteredData,
      });

      if (response.success) {
        handleSave();
      } else {
        console.error("Failed to update admin:", response.message);
      }
    } catch (error) {
      console.error("An error occurred while updating admin:", error.message);
    }
  };

  const columns = [
    { title: "Mã người nhân viên", dataKey: "adminId", sortable: true },
    {
      title: t("admin.name"),
      dataKey: "adminProfile.fullname",
      sortable: true,
    },
    {
      title: t("admin.role"),
      dataKey: "roleId",
      sortable: true,
      renderCell: (value) => {
        return value === "BEST_ADMIN" ? "ADMIN" : "Nhân viên";
      },
    },
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
          "HH:mm:ss yyyy-MM-dd"
        );
      },
    },
    { title: t("common.createdBy"), dataKey: "createdBy", sortable: true },
    {
      title: t("admin.status"),
      dataKey: "status",
      sortable: true,
      renderCell: (value) => {
        return value === "ACTIVE" ? "Đang hoạt động" : "Khóa";
      },
    },
  ];

  const editFields = [
    { key: "adminId", label: t("admin.id"), type: "text", readOnly: true },
    { key: "fullname", label: t("admin.name"), type: "text" },
    { key: "email", label: t("admin.email"), type: "text" },
    { key: "homeAddress", label: t("admin.homeAddress"), type: "text" },
    { key: "birthday", label: t("admin.birthday"), type: "date" },
    {
      key: "gender",
      label: t("admin.gender"),
      type: "select",
      options: ["MALE", "FEMALE"],
    },
    {
      key: "status",
      label: t("admin.status"),
      type: "select",
      options: ["ACTIVE", "BLOCKED"],
    },
    {
      key: "roleId",
      label: t("admin.role"),
      type: "select",
      options: ["BEST_ADMIN", "ADMIN"],
    },
  ];

  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        <h2 className="admin-list-title">{t("admin.listTitle")}</h2>
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
              placeholder="Tìm kiếm theo mã admin"
            />{" "}
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
            <button className="add-admin-button" onClick={handleAddAdmin}>
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
          onDelete={(admin) => handleDelete(admin.adminId)}
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
        contentLabel={modalMode === "add" ? "Add Admin" : "Edit Admin"}
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
          onSubmit={modalMode === "add" ? handleCreateAdmin : handleUpdateAdmin}
          title={
            modalMode === "add"
              ? "Thêm Admin"
              : modalMode === "edit"
              ? "Sửa thông tin nhân viên"
              : "Xem Admin"
          }
          onClose={handleCloseModal}
        />
      </Modal>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message="Bạn có chắc muốn xóa admin này?"
      />
    </AdminDashboardLayout>
  );
};

const ListOfAdmin = React.memo(ListOfAdminPage);
export default ListOfAdmin;
