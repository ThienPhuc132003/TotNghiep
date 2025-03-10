// src/pages/Admin/ListOfTutor.jsx
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
import qs from "qs";
import { Alert } from "@mui/material";

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
  const [sortKey, setSortKey] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const currentPath = "/gia-su";

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("searchQuery", searchQuery);
    if (sortKey) {
      params.append("sortKey", sortKey);
      params.append("sortDirection", sortDirection);
    }
    params.append("page", currentPage + 1);
  }, [searchQuery, sortKey, sortDirection, currentPage]);

  const resetState = () => {
    setSearchInput("");
    setSearchQuery("");
    setSortKey("");
    setSortDirection("asc");
    setCurrentPage(0);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialSearchQuery = params.get("searchQuery") || "";
    const initialSortKey = params.get("sortKey") || "";
    const initialSortDirection = params.get("sortDirection") || "asc";
    const initialPage = parseInt(params.get("page") || "1", 10) - 1;

    setSearchQuery(initialSearchQuery);
    setSortKey(initialSortKey);
    setSortDirection(initialSortDirection);
    setCurrentPage(initialPage);
    setSearchInput(initialSearchQuery);
  }, []);

  useEffect(() => {
    updateUrl();
  }, [searchQuery, sortKey, sortDirection, currentPage, updateUrl]);

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

      if (sortKey) {
        query.sort = JSON.stringify([
          { key: sortKey, type: sortDirection.toUpperCase() },
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
  }, [currentPage, sortKey, sortDirection, itemsPerPage, t]);

  useEffect(() => {
    fetchData();
  }, [currentPage, fetchData]);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const handleSearch = () => {
    const query = searchInput.toLowerCase();
    const filtered = data.filter((item) =>
      Object.values(item).some(
        (value) => value && value.toString().toLowerCase().includes(query)
      )
    );
    setFilteredData(filtered);
    setCurrentPage(0);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortKey === key && sortDirection === "asc") {
      direction = "desc";
    }
    setSortKey(key);
    setSortDirection(direction);
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
      } else {
        console.log("Failed to delete tutor");
      }
    } catch (error) {
      console.error("An error occurred while deleting tutor:", error.message);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
    }
  };

  const handleView = (tutor) => {
    setModalData({
      userId: tutor.userId,
      fullname: tutor.userProfile.fullname,
      email: tutor.userProfile.personalEmail,
      phoneNumber: tutor.phoneNumber,
      homeAddress: tutor.userProfile.homeAddress,
      birthday: tutor.userProfile.birthday,
      gender: tutor.userProfile.gender,
      status: tutor.status,
    });
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (tutor) => {
    setModalData({
      userId: tutor.userId,
      fullname: tutor.userProfile.fullname,
      email: tutor.userProfile.personalEmail,
      phoneNumber: tutor.phoneNumber,
      homeAddress: tutor.userProfile.homeAddress,
      birthday: tutor.userProfile.birthday,
      gender: tutor.userProfile.gender,
      status: tutor.status,
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

  const handleCreateTutor = async (formData) => {
    try {
      const response = await Api({
        endpoint: "user/create-user",
        method: METHOD_TYPE.POST,
        data: formData,
      });

      if (response.success) {
        handleSave();
      } else {
        console.error("Failed to create tutor:", response.message);
      }
    } catch (error) {
      console.error("An error occurred while creating tutor:", error.message);
    }
  };

  const handleUpdateTutor = async (formData) => {
    const allowedFields = [
      "fullname",
      "birthday",
      "phoneNumber",
      "workEmail",
      "homeAddress",
      "gender",
    ];

    const filteredData = Object.keys(formData)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = formData[key];
        return obj;
      }, {});

    try {
      const response = await Api({
        endpoint: `user/update-user-by-id/${modalData.userId}`,
        method: METHOD_TYPE.PUT,
        data: filteredData,
      });

      if (response.success) {
        handleSave();
      } else {
        console.error("Failed to update tutor:", response.message);
      }
    } catch (error) {
      console.error("An error occurred while updating tutor:", error.message);
    }
  };

  const columns = [
    { title: "Mã người dùng", dataKey: "userId", sortable: true },
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
    { key: "email", label: t("admin.email") },
    { key: "phoneNumber", label: t("admin.phone") },
    { key: "homeAddress", label: t("admin.homeAddress") },
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
      options: ["PENDING", "ACTIVE", "INACTIVE"],
    },
  ];

  const editFields = [
    { key: "userId", label: "Mã người dùng", readOnly: true },
    { key: "fullname", label: t("admin.name") },
    { key: "email", label: t("admin.email") },
    { key: "phoneNumber", label: t("admin.phone") },
    { key: "homeAddress", label: t("admin.homeAddress") },
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
      options: ["PENDING", "ACTIVE", "INACTIVE"],
    },
  ];

  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        <h2 className="admin-list-title">Danh sách gia sư</h2>
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
              placeholder="Tìm kiếm theo mã gia sư"
            />{" "}
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
          onEdit={handleEdit}
          onDelete={(tutor) => handleDelete(tutor.userId)}
          pageCount={Math.ceil(totalItems / itemsPerPage)}
          onPageChange={handlePageClick}
          forcePage={currentPage}
          onSort={handleSort}
          loading={isLoading}
          error={error}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(e) => setItemsPerPage(Number(e.target.value))}
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
          onChange={(name, value) =>
            setModalData({ ...modalData, [name]: value })
          }
          onSubmit={modalMode === "add" ? handleCreateTutor : handleUpdateTutor}
          onClose={handleCloseModal} // Pass handleCloseModal to FormDetail
        />
      </Modal>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message="Bạn có chắc muốn xóa gia sư này?"
      />
    </AdminDashboardLayout>
  );
};

const ListOfTutor = React.memo(ListOfTutorPage);
export default ListOfTutor;
