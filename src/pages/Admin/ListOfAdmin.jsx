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
import Modal from "react-modal";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { Alert } from "@mui/material";
import unidecode from "unidecode";
import { toast, ToastContainer } from "react-toastify"; // Import toast và ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import CSS của react-toastify
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
  const [formErrors, setFormErrors] = useState({}); // Thêm state để lưu trữ lỗi

  const resetState = () => {
    setSearchInput("");
    setCurrentPage(0);
    setFilters([]); // Reset filters
  };

  const fetchData = useCallback(
    async (sortConfigOverride = sortConfig) => {
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

        let sortToUse = sortConfigOverride;

        if (!sortToUse.key) {
          sortToUse = { key: "createdAt", direction: "desc" };
        }

        query.sort = [
          { key: sortToUse.key, type: sortToUse.direction.toUpperCase() },
        ];

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
    },
    [currentPage, sortConfig, t, itemsPerPage, filters]
  );

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
      options: [
        { label: "nam", value: "MALE" },
        { label: "nữ", value: "FEMALE" },
      ],
      getValue: (option) => option, // Trả về value khi submit form
    },
    {
      key: "roleId",
      label: "Vai trò",
      type: "select",
      options: [
        { label: "Quản trị viên", value: "BEST_ADMIN" },
        { label: "Nhân viên", value: "ADMIN" },
      ],
      getValue: (option) => option, // Trả về value khi submit form
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
    setFormErrors({}); // Reset lỗi khi mở modal
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
      roleId: admin.roleId,
      status: admin.status,
    });
    setModalMode("edit");
    setIsModalOpen(true);
    setFormErrors({}); // Reset lỗi khi mở modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalData({});
    setModalMode(null);
    setFormErrors({}); // Reset lỗi khi đóng modal
  };

  const handleSave = async () => {
    fetchData();
    setIsModalOpen(false);
    setModalData({});
    setModalMode(null);
    setFormErrors({}); // Reset lỗi sau khi lưu
  };

  const handleCreateAdmin = async (formData) => {
    // const errors = validateAdminForm(formData);
    // if (Object.keys(errors).length > 0) {
    //   setFormErrors(errors);
    //   return;
    // }

    // Chuyển đổi giá trị roleId trước khi gửi lên server
    if (formData.roleId === "BEST_ADMIN") {
      formData.roleId = "BEST_ADMIN";
    } else if (formData.roleId === "ADMIN") {
      formData.roleId = "ADMIN";
    } else {
      formData.roleId = "UNKNOWN";
    }

    try {
      const response = await Api({
        endpoint: "admin/create-admin",
        method: METHOD_TYPE.POST,
        data: formData,
      });

      if (response.success) {
        toast.success("Thêm thành công"); // Hiển thị thông báo thành công
        // Gọi lại fetchData với sort createdAt giảm dần
        fetchData({ key: "createdAt", direction: "desc" });
        handleSave();
      } else {
        console.error("Failed to create admin:", response.message);
      }
    } catch (error) {
      console.error("An error occurred while creating admin:", error.message);
    }
  };

  const handleUpdateAdmin = async (formData) => {
    // const errors = validateAdminForm(formData);
    // if (Object.keys(errors).length > 0) {
    //   setFormErrors(errors);
    //   return;
    // }

    const allowedFields = [
      "fullname",
      "birthday",
      "email",
      "homeAddress",
      "gender",
      "status",
      "roleId",
    ];

    const filteredData = Object.keys(formData)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = formData[key];
        return obj;
      }, {});

    // Chuyển đổi giá trị roleId trước khi gửi lên server
    if (filteredData.roleId === "BEST_ADMIN") {
      filteredData.roleId = "BEST_ADMIN";
    } else if (filteredData.roleId === "ADMIN") {
      filteredData.roleId = "ADMIN";
    }

    // Chuyển đổi giá trị status trước khi gửi lên server
    if (filteredData.status === "ACTIVE") {
      filteredData.status = "ACTIVE";
    } else if (filteredData.status === "BLOCKED") {
      filteredData.status = "BLOCKED";
    }

    // Chuyển đổi giá trị gender trước khi gửi lên server
    if (filteredData.gender === "MALE") {
      filteredData.gender = "MALE";
    } else if (filteredData.gender === "FEMALE") {
      filteredData.gender = "FEMALE";
    }

    console.log("Updating admin with data:", filteredData);

    try {
      const response = await Api({
        endpoint: `admin/update-admin-by-id/${modalData.adminId}`,
        method: METHOD_TYPE.PUT,
        data: filteredData,
      });

      if (response.success) {
        handleSave();
        toast.success("cập nhật thành công");
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
      tooltip: "Mã nhân viên",
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
        if (value === "BEST_ADMIN") return "Quản trị viên";
        if (value === "ADMIN") return "Nhân viên";
        return "Chưa biết";
      },
    },
    { title: t("admin.phone"), dataKey: "phoneNumber", sortable: true },
    { title: t("admin.email"), dataKey: "email", sortable: true },
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
    { key: "fullname", label: t("admin.name"), type: "text" },
    { key: "email", label: t("admin.email"), type: "text" },
    { key: "homeAddress", label: t("admin.homeAddress"), type: "text" },
    { key: "birthday", label: t("admin.birthday"), type: "date" },
    {
      key: "gender",
      label: t("admin.gender"),
      type: "select",
      options: [
        { label: "nam", value: "MALE" },
        { label: "nữ", value: "FEMALE" },
      ],
      getValue: (option) => option,
    },
    {
      key: "status",
      label: t("admin.status"),
      type: "select",
      options: [
        { label: "Đang hoạt động", value: "ACTIVE" },
        { label: "Khóa", value: "BLOCKED" },
      ],
      getValue: (option) => option,
    },
    {
      key: "roleId",
      label: t("admin.role"),
      type: "select",
      options: [
        { label: "Quản trị viên", value: "BEST_ADMIN" },
        { label: "Nhân viên", value: "ADMIN" },
      ],
      getValue: (option) => option,
    },
  ];
  const validateAdminForm = (formData) => {
    const errors = {};

    if (!formData.fullname) {
      errors.fullname = "Vui lòng nhập họ và tên.";
    }

    if (!formData.birthday) {
      errors.birthday = "Vui lòng chọn ngày sinh.";
    }

    if (!formData.email) {
      errors.email = "Vui lòng nhập địa chỉ email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Địa chỉ email không hợp lệ.";
    }

    if (!formData.homeAddress) {
      errors.homeAddress = "Vui lòng nhập địa chỉ nhà.";
    }

    if (!formData.gender) {
      errors.gender = "Vui lòng chọn giới tính.";
    }

    if (!formData.status) {
      errors.status = "Vui lòng chọn trạng thái.";
    }

    if (!formData.roleId) {
      errors.roleId = "Vui lòng chọn vai trò.";
    }

    return errors;
  };

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
          onChange={(name, value) => {
            setModalData({ ...modalData, [name]: value });
            setFormErrors({ ...formErrors, [name]: "" }); // Xóa lỗi khi người dùng nhập
          }}
          onSubmit={modalMode === "add" ? handleCreateAdmin : handleUpdateAdmin}
          title={
            modalMode === "add"
              ? "Thêm nhân viên"
              : modalMode === "edit"
              ? "Sửa thông tin nhân viên"
              : "Xem thông tin nhân viên"
          }
          onClose={handleCloseModal}
          errors={formErrors} // Truyền errors cho FormDetail
        />
      </Modal>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message="Bạn có chắc muốn xóa admin này?"
      />
      <ToastContainer // Thêm ToastContainer
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

const ListOfAdmin = React.memo(ListOfAdminPage);
export default ListOfAdmin;
