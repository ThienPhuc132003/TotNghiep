import React, { useCallback, useEffect, useState } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css";
import Table from "../../components/Table";
import SearchBar from "../../components/SearchBar";
import FilterButton from "../../components/FilterButton";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import AdminForm from "../../components/Admin/AdminForm";
import { formatInTimeZone } from "date-fns-tz";
import { useTranslation } from "react-i18next";
import Modal from "../../components/Modal";

const ListOfAdminPage = () => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalData, setModalData] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentStatus, setCurrentStatus] = useState("ACTIVE");
  const itemsPerPage = 5;
  const currentPath = "/quan-ly-admin"; 

  console.log("admin-management-pagesssss");
  const fetchData = useCallback(
    async (filter = []) => {
      try {
        const query = {
          rpp: itemsPerPage,
          page: currentPage + 1,
        };

        if (searchQuery) {
          filter.push({
            key: "adminId",
            operator: "like",
            value: searchQuery,
          });
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
          console.log("Failed to fetch data");
        }
      } catch (error) {
        console.log("An error occurred while fetching data");
      }
    },
    [currentPage, itemsPerPage, searchQuery]
  );

  useEffect(() => {
    fetchData();
  }, [currentPage, fetchData]);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const handleDelete = async (adminId) => {
    if (window.confirm(t("admin.confirmDelete"))) {
      try {
        const response = await Api({
          endpoint: `admin-service/admin/${adminId}`,
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

  const handleAddAdmin = () => {
    setModalMode("add");
    setModalData(null);
    setIsModalOpen(true);
  };

  const handleView = (admin) => {
    setModalData(admin);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (admin) => {
    setModalData(admin);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalData(null);
    setModalMode(null);
  };

  const handleSave = () => {
    fetchData(); // Refresh the data after saving
    setIsModalOpen(false);
    setModalData(null);
    setModalMode(null);
  };

  const handleApplyFilter = (filterValues) => {
    // Apply filter logic here
    console.log("Filter applied with values:", filterValues);
  };

  const pageCount = Math.ceil(totalItems / itemsPerPage);

  const activeAdmins = data.filter((admin) => admin.status === "ACTIVE");
  const inactiveAdmins = data.filter((admin) => admin.status === "INACTIVE");

  const fields = [
    { key: "adminId", label: t("admin.id") },
    { key: "adminProfile.fullname", label: t("admin.name") },
    { key: "phoneNumber", label: t("admin.phone") },
    { key: "email", label: t("admin.email") },
    { key: "adminProfile.identifyCardNumber", label: t("admin.idCard") },
    { key: "createdAt", label: t("common.createdAt") },
    { key: "createdBy", label: t("common.createdBy") },
  ];

  const columns = [
    { title: t("admin.id"), dataKey: "adminId" },
    { title: t("admin.name"), dataKey: "adminProfile.fullname" },
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
  ];

  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        <h2>{t("admin.listTitle")}</h2>
        <div className="admin-search-filter">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            searchBarClassName="admin-search"
            searchInputClassName="admin-search-input"
            placeholder={t("admin.searchPlaceholder")}
          />
          <div className="filter-add-admin">
            <button className="add-admin-button" onClick={handleAddAdmin}>
              {t("admin.addButton")}
            </button>
            <FilterButton fields={fields} onApply={handleApplyFilter} />
          </div>
        </div>
        <div className="status-buttons">
          <button
            className={`status-button ${
              currentStatus === "ACTIVE" ? "active" : ""
            }`}
            onClick={() => setCurrentStatus("ACTIVE")}
          >
            {t("admin.active")}
          </button>
          <button
            className={`status-button ${
              currentStatus === "INACTIVE" ? "active" : ""
            }`}
            onClick={() => setCurrentStatus("INACTIVE")}
          >
            {t("admin.inactive")}
          </button>
        </div>
        {currentStatus === "ACTIVE" ? (
          <>
            <Table
              columns={columns}
              data={activeAdmins}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={(admin) => handleDelete(admin.adminId)}
              pageCount={pageCount}
              onPageChange={handlePageClick}
            />
          </>
        ) : inactiveAdmins.length > 0 ? (
          <>
            <Table
              columns={columns}
              data={inactiveAdmins}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={(admin) => handleDelete(admin.adminId)}
              pageCount={pageCount}
              onPageChange={handlePageClick}
            />
          </>
        ) : (
          <p>{t("admin.noInactiveData")}</p>
        )}
      </div>
    </>
  );

  return (
    <AdminDashboardLayout
      currentPath={currentPath}
      currentPage={t("admin.management")}
      childrenMiddleContentLower={childrenMiddleContentLower}
    >
      {/* Admin Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <AdminForm
          mode={modalMode || "view"} // Ensure mode is never null
          adminId={
            modalMode === "view" || modalMode === "edit"
              ? modalData.adminId
              : null
          }
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      </Modal>
    </AdminDashboardLayout>
  );
};

const ListOfAdmin = React.memo(ListOfAdminPage);
export default ListOfAdmin;