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
import qs from "qs";
import { Alert } from "@mui/material";
import unidecode from "unidecode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import numeral from "numeral"; // Import numeral
import "numeral/locales/vi"; // Import locale nếu cần

// Set the app element for accessibility
Modal.setAppElement("#root");

const ListOfTutorLevelPage = () => {
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
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const currentPath = "/hang-gia-su";
  const [formErrors, setFormErrors] = useState({});
  const [filters, setFilters] = useState([]);
  const [pageCount, setPageCount] = useState(1);

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
    setFilters([]); // Reset filters
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
        query.filter = JSON.stringify(filters);
      }

      if (sortConfig.key) {
        query.sort = JSON.stringify([
          { key: sortConfig.key, type: sortConfig.direction.toUpperCase() },
        ]);
      }

      const queryString = qs.stringify(query, { encode: false });

      const response = await Api({
        endpoint: `tutor-level/search?${queryString}`,
        method: METHOD_TYPE.GET,
      });

      if (response.success) {
        setData(response.data.items);
        setFilteredData(response.data.items);
        setTotalItems(response.data.total);
        setPageCount(Math.ceil(response.data.total / itemsPerPage)); // Cập nhật pageCount
      } else {
        setError(response.message || t("common.errorLoadingData"));
      }
    } catch (error) {
      setError(t("common.errorLoadingData"));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, sortConfig, itemsPerPage, t, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    numeral.locale("vi"); // Set locale nếu cần
  }, []);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const handleSearchInputChange = (query) => {
    setSearchInput(query);
    setSearchQuery(query);

    const normalizedQuery = unidecode(query.toLowerCase());
    const filtered = data.filter((item) => {
      const searchValues = {
        tutorLevelId: item.tutorLevelId,
        levelName: item.levelName || "",
        salary: item.salary || "",
        description: item.description || "",
      };

      return Object.values(searchValues).some((value) => {
        if (value) {
          const stringValue = value.toString().toLowerCase();
          const normalizedValue = unidecode(stringValue);

          return normalizedValue.includes(normalizedQuery);
        }
        return false;
      });
    });
    setFilteredData(filtered);
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => {
      const newDirection =
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc";
      return { key: key, direction: newDirection };
    });
  };

  const handleDelete = async (tutorLevelId) => {
    setDeleteItemId(tutorLevelId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await Api({
        endpoint: `tutor-level/delete/${deleteItemId}`,
        method: METHOD_TYPE.DELETE,
      });
      if (response.success) {
        fetchData();
        toast.success("Xóa thành công");
      } else {
        console.log("Failed to delete tutor level");
        toast.error("Hạng này đang có gia sư sử dụng");
      }
    } catch (error) {
      console.error(
        "An error occurred while deleting tutor level:",
        error.message
      );
      toast.error("Hạng này đang có gia sư sử dụng");
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
    }
  };

  const handleView = (tutorLevel) => {
    setModalData({
      tutorLevelId: tutorLevel.tutorLevelId,
      levelName: tutorLevel.levelName,
      salary: tutorLevel.salary,
      description: tutorLevel.description,
    });
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (tutorLevel) => {
    setModalData({
      tutorLevelId: tutorLevel.tutorLevelId,
      levelName: tutorLevel.levelName,
      salary: tutorLevel.salary,
      description: tutorLevel.description,
    });
    setModalMode("edit");
    setIsModalOpen(true);
    setFormErrors({});
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

  const handleCreateTutorLevel = async (formData) => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      const response = await Api({
        endpoint: "tutor-level/create",
        method: METHOD_TYPE.POST,
        data: formData,
      });

      if (response.success) {
        handleSave();
        toast.success("Thêm thành công");
        // Thêm nhân viên mới vào đầu danh sách
        const newTutorLevel = response.data;
        setData((prevData) => [newTutorLevel, ...prevData]);
        setFilteredData((prevData) => [newTutorLevel, ...prevData]);
      } else {
        console.error("Failed to create tutor level:", response.message);
        toast.error("Thêm thất bại");
      }
    } catch (error) {
      console.error(
        "An error occurred while creating tutor level:",
        error.message
      );
      toast.error("Thêm thất bại");
    }
  };

  const handleUpdateTutorLevel = async (formData) => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      const response = await Api({
        endpoint: `tutor-level/update/${modalData.tutorLevelId}`,
        method: METHOD_TYPE.PUT,
        data: formData,
      });

      if (response.success) {
        handleSave();
        toast.success("Cập nhật thành công");
      } else {
        console.error("Failed to update tutor level:", response.message);
        toast.error(t("tutorLevel.updateFailed"));
      }
    } catch (error) {
      console.error(
        "An error occurred while updating tutor level:",
        error.message
      );
      toast.error(t("tutorLevel.updateFailed"));
    }
  };

  const validateForm = (formData) => {
    let errors = {};

    if (!formData.levelName) {
      errors.levelName = "Vui lòng nhập tên hạng.";
    }

    if (!formData.salary) {
      errors.salary = "Vui lòng nhập lương.";
    } else if (isNaN(Number(formData.salary))) {
      errors.salary = "Lương phải là một số.";
    }

    if (!formData.description) {
      errors.description = "Vui lòng nhập mô tả.";
    }

    return errors;
  };

  const columns = [
    {
      title: "Mã hạng",
      dataKey: "tutorLevelId",
      sortable: true,
      tooltip: "Mã hạng gia sư",
    },
    { title: "Tên hạng", dataKey: "levelName", sortable: true },
    {
      title: "Lương",
      dataKey: "salary",
      sortable: true,
      renderCell: (value) => {
        return numeral(value).format("0,0") + " đồng";
      },
    },
    { title: "Mô tả", dataKey: "description", sortable: true },
  ];

  const addFields = [
    { key: "levelName", label: "Tên hạng" },
    { key: "salary", label: "Lương" },
    { key: "description", label: "Mô tả" },
  ];

  const editFields = [
    { key: "tutorLevelId", label: "Mã hạng", readOnly: true },
    { key: "levelName", label: "Tên hạng" },
    { key: "salary", label: "Lương" },
    { key: "description", label: "Mô tả" },
  ];

  const handleItemsPerPageChange = (newPageSize) => {
    setItemsPerPage(newPageSize);
    setCurrentPage(0); // Reset về trang đầu tiên
  };

  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        <h2 className="admin-list-title">Danh sách hạng gia sư</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            <SearchBar
              value={searchInput}
              onChange={handleSearchInputChange}
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
              placeholder="Tìm kiếm hạng gia sư"
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
            <button
              className="add-admin-button"
              onClick={() => {
                setModalMode("add");
                setIsModalOpen(true); // Thêm dòng này để mở modal
              }}
            >
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
          onDelete={(tutorLevel) => handleDelete(tutorLevel.tutorLevelId)}
          pageCount={pageCount} // Truyền pageCount
          onPageChange={handlePageClick}
          forcePage={currentPage}
          onSort={handleSort}
          loading={isLoading}
          error={error}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
        <p>Tổng số hạng gia sư: {totalItems}</p>
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
          modalMode === "add" ? "Add Tutor Level" : "Edit Tutor Level"
        }
        className="modal"
        overlayClassName="overlay"
      >
        <FormDetail
          formData={modalData}
          fields={modalMode === "add" ? addFields : editFields}
          mode={modalMode || "view"}
          title={
            modalMode === "add"
              ? "Thêm hạng gia sư"
              : modalMode === "edit"
              ? "Sửa thông tin hạng gia sư"
              : "Xem thông tin hạng gia sư"
          }
          onChange={(name, value) => {
            setModalData({ ...modalData, [name]: value });
            setFormErrors({ ...formErrors, [name]: "" });
          }}
          onSubmit={
            modalMode === "add"
              ? handleCreateTutorLevel
              : handleUpdateTutorLevel
          }
          onClose={handleCloseModal}
          errors={formErrors}
        />
      </Modal>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message="Bạn có chắc muốn xóa hạng gia sư này?"
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

const ListOfTutorLevel = React.memo(ListOfTutorLevelPage);
export default ListOfTutorLevel;
