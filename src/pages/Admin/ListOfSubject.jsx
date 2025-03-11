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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import qs from "qs";

// Set the app element for accessibility
Modal.setAppElement("#root");

const ListOfSubjectPage = () => {
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
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const currentPath = "/mon-hoc";
  const [filters, setFilters] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [majors, setMajors] = useState([]); // State to store majors data

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
    setFilters([]);
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
      };

      if (filters.length > 0) {
        query.filter = filters;
      }

      if (sortConfig.key) {
        query.sort = [
          { key: sortConfig.key, type: sortConfig.direction.toUpperCase() },
        ];
      }

      const queryString = qs.stringify(query, { encode: false });

      const response = await Api({
        endpoint: `subject/search?${queryString}`,
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
  }, [currentPage, sortConfig, t, itemsPerPage, filters]);

  const fetchMajors = useCallback(async (search = "") => {
    try {
      const query = {
        rpp: 100, // Lấy tối đa 100 ngành học
        page: 1,
        filter: search
          ? JSON.stringify([
              { key: "majorName", operator: "like", value: search },
            ])
          : undefined,
      };
      const queryString = qs.stringify(query, { encode: false });

      const response = await Api({
        endpoint: `major/search?${queryString}`,
        method: METHOD_TYPE.GET,
      });

      if (response.success) {
        setMajors(response.data.items);
      } else {
        console.error("Failed to fetch majors:", response.message);
      }
    } catch (error) {
      console.error("An error occurred while fetching majors:", error.message);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchMajors();
  }, [fetchData, fetchMajors]);

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
      const subjectId = item.subjectId || "";
      const subjectName = item.subjectName || "";
      const majorName = item.major?.majorName || "";
      const majorIdValue = item.major?.majorId || "";

      const normalizedSubjectId = unidecode(subjectId.toLowerCase());
      const normalizedSubjectName = unidecode(subjectName.toLowerCase());
      const normalizedMajorName = unidecode(majorName.toLowerCase());
      const normalizedMajorId = unidecode(majorIdValue.toLowerCase());

      return (
        normalizedSubjectId.includes(normalizedQuery) ||
        normalizedSubjectName.includes(normalizedQuery) ||
        normalizedMajorName.includes(normalizedQuery) ||
        normalizedMajorId.includes(normalizedQuery)
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

  const handleDelete = async (subjectId) => {
    setDeleteItemId(subjectId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await Api({
        endpoint: `subject/delete/${deleteItemId}`,
        method: METHOD_TYPE.DELETE,
      });

      if (response.success) {
        fetchData();
        toast.success("Xóa thành công");
      } else {
        console.log("Failed to delete subject");
        toast.error("Xóa thất bại");
      }
    } catch (error) {
      console.error("An error occurred while deleting subject:", error.message);
      toast.error("Xóa thất bại");
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
    }
  };

  const handleAddSubject = () => {
    setModalMode("add");
    setModalData({
      subjectName: "",
      majorId: "",
    });
    setIsModalOpen(true);
    setFormErrors({});
    fetchMajors(); // Load majors when adding
  };

  const handleView = (subject) => {
    setModalData({
      subjectId: subject.subjectId,
      subjectName: subject.subjectName,
      majorId: subject.major?.majorId || "",
      majorName: subject.major?.majorName || "",
    });
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (subject) => {
    setModalData({
      subjectId: subject.subjectId,
      subjectName: subject.subjectName,
      majorId: subject.major?.majorId || "",
      majorName: subject.major?.majorName || "",
    });
    setModalMode("edit");
    setIsModalOpen(true);
    setFormErrors({});
    fetchMajors(); // Load majors when editing
  };

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

  const handleCreateSubject = async (formData) => {
    try {
      const response = await Api({
        endpoint: "subject/create",
        method: METHOD_TYPE.POST,
        data: {
          ...formData,
        },
      });

      if (response.success) {
        handleSave();
        toast.success("Thêm thành công");
        // Thêm môn học mới vào đầu danh sách
        const newSubject = response.data;
        setData((prevData) => [newSubject, ...prevData]);
        setFilteredData((prevData) => [newSubject, ...prevData]);
      } else {
        console.log("Failed to create subject");
        toast.error("Thêm thất bại");
      }
    } catch (error) {
      console.error("An error occurred while creating subject:", error.message);
      toast.error("Thêm thất bại");
    }
  };

  const handleUpdateSubject = async (formData) => {
    try {
      const response = await Api({
        endpoint: `subject/update/${modalData.subjectId}`,
        method: METHOD_TYPE.PUT,
        data: {
          ...formData,
        },
      });

      if (response.success) {
        handleSave();
        toast.success(t("subject.updateSuccess"));
        // Cập nhật danh sách sau khi chỉnh sửa
        setData((prevData) =>
          prevData.map((item) =>
            item.subjectId === modalData.subjectId
              ? { ...item, ...formData }
              : item
          )
        );
        setFilteredData((prevData) =>
          prevData.map((item) =>
            item.subjectId === modalData.subjectId
              ? { ...item, ...formData }
              : item
          )
        );
      } else {
        console.log("Failed to update subject");
        toast.error("Chỉnh sửa thất bại");
      }
    } catch (error) {
      console.error("An error occurred while updating subject:", error.message);
      toast.error("Chỉnh sửa thất bại");
    }
  };

  const handleFormSubmit = async (formData) => {
    // Now, majorId is directly available in formData
    if (modalMode === "add") {
      handleCreateSubject(formData);
    } else if (modalMode === "edit") {
      handleUpdateSubject(formData);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(0); // Reset to the first page when items per page changes
  };

  const columns = [
    { title: "Mã môn học", dataKey: "subjectId", sortable: true },
    { title: "Tên môn học", dataKey: "subjectName", sortable: true },
    { title: "Tên ngành", dataKey: "major.majorName", sortable: true },
    { title: "Mã ngành", dataKey: "major.majorId", sortable: true },
  ];

  const addFields = [
    { key: "subjectName", label: "Tên môn học" },
    {
      key: "majorId",
      label: "Mã ngành",
      type: "select",
      options: majors.map((major) => major.majorId),
      renderOption: (option) => {
        const major = majors.find((major) => major.majorId === option);
        return major ? major.majorName : option;
      },
    },
  ];

  const editFields = [
    { key: "subjectId", label: "Mã môn học", type: "text", readOnly: true },
    { key: "subjectName", label: t("subject.name"), type: "text" },
    {
      key: "majorId",
      label: "Mã ngành",
      type: "select",
      options: majors.map((major) => major.majorId),
      renderOption: (option) => {
        const major = majors.find((major) => major.majorId === option);
        return major ? major.majorName : option;
      },
    },
  ];

  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        <h2 className="admin-list-title">Danh sách môn học</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            <SearchBar
              value={searchInput}
              onChange={handleSearchInputChange}
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
              placeholder="Tìm kiếm môn học"
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
          <div className="filter-add-admin">
            <button className="add-admin-button" onClick={handleAddSubject}>
              {t("common.addButton")}
            </button>
          </div>
        </div>
        {error && <Alert severity="error">{error}</Alert>}
        <Table
          columns={columns}
          data={filteredData}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={(subject) => handleDelete(subject.subjectId)}
          pageCount={Math.ceil(totalItems / itemsPerPage)}
          onPageChange={handlePageClick}
          forcePage={currentPage}
          onSort={handleSort}
          loading={isLoading}
          error={error}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
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
        contentLabel={
          modalMode === "add" ? "Thêm môn học" : "Chỉnh sửa thông tin môn học"
        }
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
          onSubmit={handleFormSubmit}
          title={
            modalMode === "add"
              ? "Thêm môn học"
              : modalMode === "edit"
              ? "Chỉnh sửa thông tin môn học"
              : "Xem thông tin môn học"
          }
          onClose={handleCloseModal}
          errors={formErrors}
          majors={majors}
        />
      </Modal>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message="Bạn có chắc chắn muốn xóa môn học này?"
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

const ListOfSubject = React.memo(ListOfSubjectPage);
export default ListOfSubject;
