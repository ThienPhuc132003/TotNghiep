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

const ListOfCurriculumnPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [modalData, setModalData] = useState({});
  const [modalMode, setModalMode] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const currentPath = "/giao-trinh";
  const [majors, setMajors] = useState([]);

  const resetState = () => {
    setSearchInput("");
    setCurrentPage(0);
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = {
        rpp: itemsPerPage,
        page: currentPage + 1,
      };

      if (sortConfig.key) {
        query.sort = JSON.stringify([
          { key: sortConfig.key, type: sortConfig.direction.toUpperCase() },
        ]);
      }

      const queryString = qs.stringify(query, { encode: false });

      const response = await Api({
        endpoint: `curriculumn/get-list?${queryString}`,
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
  }, [currentPage, itemsPerPage, sortConfig, t]);

  const fetchMajors = useCallback(async () => {
    try {
      const response = await Api({
        endpoint: "major",
        method: METHOD_TYPE.GET,
      });

      if (response.success) {
        setMajors(response.data.items); // Sửa ở đây, lấy data.items
        console.log("Majors fetched successfully:", response.data.items); // Kiểm tra dữ liệu trả về
      } else {
        console.error("Failed to fetch majors:", response.message);
        toast.error(`Lấy danh sách ngành thất bại: ${response.message}`);
      }
    } catch (error) {
      console.error("An error occurred while fetching majors:", error.message);
      toast.error(`Lấy danh sách ngành thất bại: ${error.message}`);
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
    const normalizedQuery = unidecode(query.toLowerCase());
    const filtered = data.filter((item) => {
      const curriculumnName = item.curriculumnName || "";
      const curriculumnMajor = item.curriculumnMajor || "";
      const status = item.status || "";

      const normalizedCurriculumnName = unidecode(
        curriculumnName.toLowerCase()
      );
      const normalizedCurriculumnMajor = unidecode(
        curriculumnMajor.toLowerCase()
      );
      const normalizedStatus = unidecode(status.toLowerCase());

      return (
        normalizedCurriculumnName.includes(normalizedQuery) ||
        normalizedCurriculumnMajor.includes(normalizedQuery) ||
        normalizedStatus.includes(normalizedQuery)
      );
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

  const handleDelete = async (curriculumnId) => {
    setDeleteItemId(curriculumnId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await Api({
        endpoint: `curriculumn/delete-by-admin/${deleteItemId}`,
        method: METHOD_TYPE.DELETE,
      });
      if (response.success) {
        fetchData();
        toast.success("Xóa thành công");
      } else {
        console.log("Failed to delete curriculumn");
        toast.error("Xóa thất bại");
      }
    } catch (error) {
      console.error(
        "An error occurred while deleting curriculumn:",
        error.message
      );
      toast.error("Xóa thất bại");
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
    }
  };

  const handleView = (curriculumn) => {
    setModalData({
      curriculumnId: curriculumn.curriculumnId,
      curriculumnName: curriculumn.curriculumnName,
      status: curriculumn.status,
    });
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (curriculumn) => {
    setModalData({
      curriculumnId: curriculumn.curriculumnId,
      curriculumnName: curriculumn.curriculumnName,
      status: curriculumn.status,
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

  const handleUpdateCurriculumn = async (formData) => {
    try {
      const response = await Api({
        endpoint: `curriculumn/update-by-admin/${modalData.curriculumnId}`,
        method: METHOD_TYPE.PUT,
        data: {
          curriculumnName: formData.curriculumnName,
          curriculumnMajor: formData.curriculumnMajor,
          curriculumnUrl: formData.curriculumnUrl,
          description: formData.description,
        },
      });

      if (response.success) {
        handleSave();
        toast.success("Cập nhật thành công");
      } else {
        console.log("Failed to update curriculumn");
        toast.error("Cập nhật thất bại");
      }
    } catch (error) {
      console.error(
        "An error occurred while updating curriculumn:",
        error.message
      );
      toast.error("Cập nhật thất bại");
    }
  };

  const handleLock = async (curriculumn) => {
    const newStatus = curriculumn.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      const response = await Api({
        endpoint: `curriculumn/update-by-admin/${curriculumn.curriculumnId}`,
        method: METHOD_TYPE.PUT,
        data: { status: newStatus },
      });

      if (response.success) {
        setData((prevData) =>
          prevData.map((item) =>
            item.curriculumnId === curriculumn.curriculumnId
              ? { ...item, status: newStatus }
              : item
          )
        );
        setFilteredData((prevFilteredData) =>
          prevFilteredData.map((item) =>
            item.curriculumnId === curriculumn.curriculumnId
              ? { ...item, status: newStatus }
              : item
          )
        );

        toast.success(
          `Giáo trình ${curriculumn.curriculumnName} đã được ${
            newStatus === "ACTIVE" ? "mở khóa" : "khóa"
          } thành công!`
        );
      } else {
        toast.error(
          `Cập nhật thất bại: ${response.message || "Lỗi không xác định"}`
        );
        console.error("Failed to update curriculumn:", response.message);
      }
    } catch (error) {
      toast.error(`Cập nhật thất bại: ${error.message || "Lỗi mạng"}`);
      console.error(
        "An error occurred while updating curriculumn:",
        error.message
      );
    }
  };

  const columns = [
    {
      title: "Số thứ tự",
      dataKey: "index",
      renderCell: (_, __, rowIndex) =>
        currentPage * itemsPerPage + rowIndex + 1,
    },
    { title: "Tên giáo trình", dataKey: "curriculumnName", sortable: true },
    { title: "Ngành", dataKey: "major.majorName", sortable: true },
    {
      title: "Trạng thái",
      dataKey: "status",
      sortable: true,
      renderCell: (value) => (value === "ACTIVE" ? "Đang mở" : "Khóa"),
    },
  ];

  const handleAddCurriculumn = () => {
    setModalMode("add");
    setModalData({
      curriculumnName: "",
      curriculumnMajor: "",
      curriculumnUrl: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleCreateCurriculumn = async (formData) => {
    try {
      const response = await Api({
        endpoint: "curriculumn/create-by-admin",
        method: METHOD_TYPE.POST,
        data: formData,
      });

      if (response.success) {
        toast.success("Thêm giáo trình thành công");
        fetchData();
        handleSave();
      } else {
        toast.error(`Thêm giáo trình thất bại: ${response.message}`);
        console.error("Failed to create curriculumn:", response.message);
      }
    } catch (error) {
      toast.error(`Thêm giáo trình thất bại: ${error.message}`);
      console.error(
        "An error occurred while creating curriculumn:",
        error.message
      );
    }
  };

  const editFields = [
    { key: "curriculumnName", label: "Tên giáo trình", type: "text" },
    { key: "major.majorName", label: "Negành", type: "text" },
    { key: "curriculumnUrl", label: "URL giáo trình", type: "text" },
    { key: "description", label: "Mô tả", type: "textarea" },
  ];

  const addFields = [
    { key: "curriculumnName", label: "Tên giáo trình", type: "text" },
    {
      key: "curriculumnMajor",
      label: "Ngành",
      type: "select",
      options: majors.map((major) => ({
        // Sửa ở đây
        label: major.majorName,
        value: major.majorName,
      })),
    },
    { key: "curriculumnUrl", label: "URL giáo trình", type: "text" },
    { key: "description", label: "Mô tả", type: "textarea" },
  ];

  return (
    <AdminDashboardLayout currentPath={currentPath}>
      <div className="admin-content">
        <h2 className="admin-list-title">Danh sách giáo trình</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            <SearchBar
              value={searchInput}
              onChange={handleSearchInputChange}
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
              placeholder="Tìm kiếm giáo trình"
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
            <button className="add-admin-button" onClick={handleAddCurriculumn}>
              Thêm
            </button>
          </div>
        </div>
        {error && <Alert severity="error">{error}</Alert>}
        <Table
          columns={columns}
          data={filteredData}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={(curriculumn) => handleDelete(curriculumn.curriculumnId)}
          onLock={handleLock}
          pageCount={Math.ceil(totalItems / itemsPerPage)}
          onPageChange={handlePageClick}
          forcePage={currentPage}
          onSort={handleSort}
          loading={isLoading}
          error={error}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(e) => setItemsPerPage(Number(e.target.value))}
          showLock={true}
          statusKey="status"
        />
        <p>Tổng số giáo trình: {totalItems}</p>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        contentLabel={
          modalMode === "edit" ? "Chỉnh sửa giáo trình" : "Thêm giáo trình"
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
          onSubmit={
            modalMode === "add"
              ? handleCreateCurriculumn
              : handleUpdateCurriculumn
          }
          onClose={handleCloseModal}
          title={
            modalMode === "add"
              ? "Thêm giáo trình"
              : modalMode === "edit"
              ? "Chỉnh sửa giáo trình"
              : "Xem giáo trình"
          }
        />
      </Modal>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message="Bạn có chắc muốn xóa giáo trình này?"
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
const ListOfCurriculumn = React.memo(ListOfCurriculumnPage);
export default ListOfCurriculumn;
