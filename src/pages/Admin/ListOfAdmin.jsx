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
import i18n from "../../i18n";
import Modal from "react-modal";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { formatInTimeZone } from "date-fns-tz";
import { Alert } from "@mui/material";
import unidecode from "unidecode";
// Set the app element for accessibility
Modal.setAppElement("#root");

const ListOfAdminPage = () => {
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
  const currentPath = "/nhan-vien";
  const [filters, setFilters] = useState([]);
  const [pageCount, setPageCount] = useState(1);

  const resetState = () => {
    setSearchInput("");
    setCurrentPage(0);
    setFilters([]); // Reset filters
  };

  const fetchData = useCallback(async () => {
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
  }, [currentPage, sortConfig, t, itemsPerPage, filters]);

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
    {
      title: "Mã NV",
      dataKey: "adminId",
      sortable: true,
      tooltip: "Mã người nhân viên",
    },
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
        return value === "BEST_ADMIN" ? "Quản trị viên" : "Nhân viên";
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

  const handleSearchInputChange = (query) => {
    setSearchInput(query);
    const normalizedQuery = unidecode(query.toLowerCase());
    const collator = new Intl.Collator("vi", { sensitivity: "base" });

    const filtered = data.filter((item) => {
      const searchValues = {
        adminId: item.adminId,
        fullname: item.adminProfile?.fullname || "",
        roleId:
          item.roleId === "BEST_ADMIN"
            ? "Quản trị viên"
            : item.roleId === "ADMIN"
            ? "Nhân viên"
            : "Không xác định",
        phoneNumber: item.phoneNumber,
        email: item.email,
        status: item.status === "ACTIVE" ? "Đang hoạt động" : "Khóa",
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
            <h2 className="admin-list-title">Danh sách nhân viên</h2>
            <div className="search-bar-filter-container">
              <div className="search-bar-filter">
                <SearchBar
                  value={searchInput}
                  onChange={handleSearchInputChange}
                  searchBarClassName="admin-search"
                  searchInputClassName="admin-search-input"
                  placeholder="Tìm kiếm nhân viên"
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
                <button className="add-admin-button" onClick={handleAddAdmin}>
                  {t("common.addButton")}
                </button>
              </div>
            </div>
            {error && <Alert severity="error">{error}</Alert>}
            <Table
              columns={columns}
              data={filteredData} // Sử dụng filteredData thay vì data
              onView={handleView}
              onEdit={handleEdit}
              onDelete={(admin) => handleDelete(admin.adminId)}
              pageCount={pageCount} // Truyền pageCount
              onPageChange={handlePageClick}
              forcePage={currentPage}
              onSort={handleSort}
              loading={isLoading}
              error={error}
              itemsPerPage={itemsPerPage} // Truyền itemsPerPage
              onItemsPerPageChange={handleItemsPerPageChange} // Truyền callback
            />
            <p>Tổng số nhân viên: {totalItems}</p> {/* Hiện thị totalItems */}
          </div>
        </>
      }
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
