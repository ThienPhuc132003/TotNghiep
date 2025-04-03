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
import qs from "qs";
import { Alert } from "@mui/material";
import unidecode from "unidecode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Set the app element for accessibility
Modal.setAppElement("#root");

const ListOfTutorPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
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
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" }); // Use object for sort config
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const currentPath = "/gia-su";
  const [formErrors, setFormErrors] = useState({});

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("searchQuery", searchQuery);
    if (sortConfig.key) {
      params.append("sortKey", sortConfig.key);
      params.append("sortDirection", sortConfig.direction);
    }
    params.append("page", currentPage + 1);
    window.history.pushState({}, "", `?${params.toString()}`);
  }, [searchQuery, sortConfig, currentPage]);

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
    setSortConfig({ key: initialSortKey, direction: initialSortDirection });
    setCurrentPage(initialPage);
    setSearchInput(initialSearchQuery);
  }, []);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = {
        rpp: itemsPerPage,
        page: currentPage + 1,
        filter: JSON.stringify([
          {
            key: "roleId",
            operator: "equal",
            value: "TUTOR",
          },
        ]),
      };

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
        setFilteredData(response.data.items);
        setTotalItems(response.data.total);
      } else {
        setError(response.message || t("common.errorLoadingData"));
      }
    } catch (error) {
      setError(t("common.errorLoadingData"));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, sortConfig, itemsPerPage, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const handleSearchInputChange = (query) => {
    setSearchInput(query);
    setSearchQuery(query);
  };

  useEffect(() => {
    const normalizedQuery = unidecode(searchQuery.toLowerCase());
    const filtered = data.filter((item) => {
      const fullname = item.userProfile?.fullname || "";
      const email = item.email || "";
      const phoneNumber = item.phoneNumber || "";

      const normalizedFullname = unidecode(fullname.toLowerCase());
      const normalizedEmail = unidecode(email.toLowerCase());
      const normalizedPhoneNumber = unidecode(phoneNumber.toLowerCase());

      return (
        normalizedFullname.includes(normalizedQuery) ||
        normalizedEmail.includes(normalizedQuery) ||
        normalizedPhoneNumber.includes(normalizedQuery)
      );
    });
    setFilteredData(filtered);
  }, [searchQuery, data]);

  const handleSort = (key) => {
    setSortConfig((prevConfig) => {
      const newDirection =
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc";
      return { key: key, direction: newDirection };
    });
  };

  const handleDelete = async (tutorId) => {
    setDeleteItemId(tutorId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await Api({
        endpoint: `user/delete-user-by-id/${deleteItemId}`,
        method: METHOD_TYPE.DELETE,
      });
      if (response.success) {
        fetchData();
        toast.success("Xóa thành công");
      } else {
        console.log("Failed to delete tutor");
        toast.error("Xóa thất bại");
      }
    } catch (error) {
      console.error("An error occurred while deleting tutor:", error.message);
      toast.error("Xóa thất bại");
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
    }
  };
  const handleView = (tutor) => {
    setModalData({
      userId: tutor.userId,
      fullname: tutor.userProfile?.fullname || "",
      email: tutor.email,
      phoneNumber: tutor.phoneNumber,
      homeAddress: tutor.userProfile?.homeAddress || "",
      birthday: tutor.userProfile?.birthday || "",
      gender: tutor.userProfile?.gender || "",
      checkActive: tutor.checkActive === "ACTIVE" ? "Hoạt động" : "Khóa",
      majorName: tutor.userProfile?.major?.majorName || "",
      GPA: tutor.tutorProfile?.GPA || "",
      univercity: tutor.tutorProfile?.univercity || "",
      educationalCertification:
        tutor.tutorProfile?.educationalCertification || "",
      status: tutor.status, // Thêm status
      roleId: tutor.roleId, // Thêm roleId
      certificates: tutor.tutorProfile?.certificates || [], // Lấy danh sách chứng chỉ
    });
    setModalMode("view");
    setIsModalOpen(true);
  };
  // const handleEdit = (tutor) => {
  //   const status = tutor.checkActive;
  //   setModalData({
  //     userId: tutor.userId,
  //     fullname: tutor.userProfile?.fullname || "",
  //     email: tutor.email,
  //     phoneNumber: tutor.phoneNumber,
  //     homeAddress: tutor.userProfile?.homeAddress || "",
  //     birthday: tutor.userProfile?.birthday || "",
  //     gender: tutor.gender || "",
  //     status: status,
  //     majorName: tutor.userProfile?.major?.majorName || "",
  //     GPA: tutor.tutorProfile?.GPA || "",
  //     univercity: tutor.tutorProfile?.univercity || "",
  //     educationalCertification:
  //       tutor.tutorProfile?.educationalCertification || "",
  //   });
  //   setModalMode("edit");
  //   setIsModalOpen(true);
  //   setFormErrors({});
  // };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalData({});
    setModalMode(null);
    setFormErrors({});
  };

  const handleSave = async () => {
    fetchData();
    setIsModalOpen(false);
    setModalData({});
    setModalMode(null);
    setFormErrors({});
  };

  const handleCreateTutor = async (formData) => {
    try {
      const response = await Api({
        endpoint: "user/create-user",
        method: METHOD_TYPE.POST,
        data: formData,
      });

      if (response.success) {
        handleSave();
        toast.success("Thêm thành công");
      } else {
        console.error("Failed to create tutor:", response.message);
        toast.error("Thêm thất bại");
      }
    } catch (error) {
      console.error("An error occurred while creating tutor:", error.message);
      toast.error("Thêm thất bại");
    }
  };

  const handleUpdateTutor = async (formData) => {
    const updateData = {
      checkActive: formData.status,
    };

    try {
      const response = await Api({
        endpoint: `user/update-user-by-id/${modalData.userId}`,
        method: METHOD_TYPE.PUT,
        data: updateData,
      });

      if (response.success) {
        handleSave();
        toast.success("Cập nhật thành công");
      } else {
        console.error("Failed to update tutor:", response.message);
        toast.error("Cập nhật thất bại");
      }
    } catch (error) {
      console.error("An error occurred while updating tutor:", error.message);
      toast.error("Cập nhật thất bại");
    }
  };
  const handleLock = async (tutor) => {
    const newCheckActive =
      tutor.checkActive === "ACTIVE" ? "BLOCKED" : "ACTIVE";

    try {
      const response = await Api({
        endpoint: `user/update-user-by-id/${tutor.userId}`,
        method: METHOD_TYPE.PUT,
        data: { checkActive: newCheckActive },
      });

      if (response.success) {
        setData((prevData) =>
          prevData.map((item) =>
            item.userId === tutor.userId
              ? { ...item, checkActive: newCheckActive }
              : item
          )
        );
        setFilteredData((prevFilteredData) =>
          prevFilteredData.map((item) =>
            item.userId === tutor.userId
              ? { ...item, checkActive: newCheckActive }
              : item
          )
        );

        toast.success(
          `Gia sư ${tutor.userProfile?.fullname} đã được ${
            newCheckActive === "ACTIVE" ? "mở khóa" : "khóa"
          } thành công!`
        );
      } else {
        toast.error(
          `Cập nhật thất bại: ${response.message || "Lỗi không xác định"}`
        );
        console.error("Failed to update tutor:", response.message);
      }
    } catch (error) {
      toast.error(`Cập nhật thất bại: ${error.message || "Lỗi mạng"}`);
      console.error("An error occurred while updating tutor:", error.message);
    }
  };
  const columns = [
    {
      title: t("admin.name"),
      dataKey: "userProfile.fullname",
      sortable: true,
    },
    {
      title: t("admin.email"),
      dataKey: "email",
      sortable: true,
    },
    { title: t("admin.phone"), dataKey: "phoneNumber", sortable: true },
    {
      title: "Giới tính",
      dataKey: "userProfile.gender",
      sortable: true,
      renderCell: (value) => {
        if (value === "MALE") return "Nam";
        if (value === "FEMALE") return "Nữ";
      },
    },
    {
      title: "Hạng gia sư",
      dataKey: "tutorProfile.tutorLevel.levelName",
      sortable: true,
    },
    {
      title: t("admin.status"),
      dataKey: "checkActive",
      sortable: true,
      renderCell: (value) => {
        if (value === "ACTIVE") return "Hoạt động";
        if (value === "BLOCKED") return "Khóa";
        return "Chưa biết";
      },
    },
  ];

  const addFields = [
    { key: "fullname", label: t("admin.name"), readOnly: true },
    { key: "email", label: t("admin.email"), readOnly: true },
    { key: "phoneNumber", label: t("admin.phone"), readOnly: true },
    { key: "homeAddress", label: t("admin.homeAddress"), readOnly: true },
    {
      key: "birthday",
      label: t("admin.birthday"),
      type: "date",
      readOnly: true,
    },
    {
      key: "gender",
      label: t("admin.gender"),
      type: "select",
      options: ["MALE", "FEMALE"],
      readOnly: true,
    },
    {
      key: "status",
      label: t("admin.status"),
      type: "select",
      options: ["PENDING", "ACTIVE", "INACTIVE"],
    },
    { key: "majorName", label: "Ngành dạy", readOnly: true },
    { key: "GPA", label: "Điểm số tổng thể", readOnly: true },
    { key: "univercity", label: "Trường đại học", readOnly: true },
    { key: "educationalCertification", label: "Chứng chỉ", readOnly: true },
  ];

  const editFields = [
    { key: "userId", label: "Mã người dùng", readOnly: true },
    { key: "fullname", label: t("admin.name"), readOnly: true },
    { key: "email", label: t("admin.email"), readOnly: true },
    { key: "phoneNumber", label: t("admin.phone"), readOnly: true },
    { key: "homeAddress", label: t("admin.homeAddress"), readOnly: true },
    {
      key: "birthday",
      label: t("admin.birthday"),
      type: "date",
      readOnly: true,
    },
    {
      key: "gender",
      label: t("admin.gender"),
      type: "select",
      options: [
        { label: "Nam", value: "MALE" },
        { label: "Nữ", value: "FEMALE" },
      ],
      readOnly: true,
    },
    { key: "majorName", label: "Ngành dạy", readOnly: true },
    { key: "GPA", label: "Điểm số tổng thể", readOnly: true },
    { key: "univercity", label: "Trường đại học", readOnly: true },
    { key: "educationalCertification", label: "Chứng chỉ", readOnly: true },
  ];
  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        <h2 className="admin-list-title">Danh sách gia sư</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            <SearchBar
              value={searchInput}
              onChange={handleSearchInputChange}
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
              placeholder="Tìm kiếm theo mã gia sư"
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
          <div className="filter-add-admin"></div>
        </div>
        {error && <Alert severity="error">{error}</Alert>}
        <Table
          columns={columns}
          data={filteredData}
          onView={handleView}
          onDelete={(tutor) => handleDelete(tutor.userId)}
          pageCount={Math.ceil(totalItems / itemsPerPage)}
          onPageChange={handlePageClick}
          forcePage={currentPage}
          onSort={handleSort}
          loading={isLoading}
          error={error}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(e) => setItemsPerPage(Number(e.target.value))}
          onLock={handleLock}
          showLock={true}
          statusKey="checkActive"
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
        contentLabel={modalMode === "add" ? "Add Tutor" : "Edit Tutor"}
        className="modal"
        overlayClassName="overlay"
      >
        <FormDetail
          formData={modalData}
          fields={modalMode === "add" ? addFields : editFields}
          mode={modalMode || "view"}
          title={
            modalMode === "add"
              ? "Thêm gia sư"
              : modalMode === "edit"
              ? "Sửa thông tin gia sư"
              : "Xem thông tin gia sư"
          }
          onChange={(name, value) => {
            setModalData({ ...modalData, [name]: value });
          }}
          onSubmit={modalMode === "add" ? handleCreateTutor : handleUpdateTutor}
          onClose={handleCloseModal}
          errors={formErrors}
          showFileManagement={true} // Kích hoạt chức năng quản lý file
        />
      </Modal>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message="Bạn có chắc muốn xóa gia sư này?"
      />
      <ToastContainer
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

const ListOfTutor = React.memo(ListOfTutorPage);
export default ListOfTutor;
