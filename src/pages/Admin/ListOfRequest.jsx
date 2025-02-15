import React, { useCallback, useEffect, useState } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css";
import Table from "../../components/Table";
import SearchBar from "../../components/SearchBar";
import AdminFilterButton from "../../components/Admin/AdminFilterButton";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { useTranslation } from "react-i18next";
import Spinner from "../../components/Spinner";
import qs from "qs";

const ListOfRequestPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const itemsPerPage = 10;
  const currentPath = "/quan-ly-yeu-cau";

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
        endpoint: `user/get-list/:status?${queryString}`,
        method: METHOD_TYPE.GET,
      });

      if (response.success) {
        setData(response.data.items);
        setTotalItems(response.data.total);
      } else {
        setError(t("common.errorLoadingData"));
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
    setSortConfig({ key: "", direction: "asc" }); // Reset sort configuration
    setCurrentPage(0); // Reset to first page on search
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
    // Apply filter logic here
    console.log("Filter applied with values:", filterValues);
    // Update the search query or other state based on the filter values
    setSearchQuery(filterValues.email || "");
    setSortConfig({ key: "", direction: "asc" }); // Reset sort configuration
    setCurrentPage(0); // Reset to first page on filter apply
  };

  const handleDelete = (requestId) => {
    // Handle delete logic here
    console.log("Delete request with ID:", requestId);
  };

  const filterFields = [
    { key: "email", label: t("admin.email") },
    {
      key: "status",
      label: t("admin.status"),
      type: "select",
      options: ["PENDING", "APPROVED", "REJECTED"],
    },
    { key: "createdAt", label: t("common.createdAt"), type: "date" },
  ];

  const columns = [
    { title: t("admin.id"), dataKey: "userId", sortable: true },
    { title: t("admin.email"), dataKey: "email", sortable: true },
    { title: t("admin.phone"), dataKey: "phoneNumber", sortable: true },
    { title: t("admin.majorName"), dataKey: "tutorProfile.majorName", sortable: true },
    { title: t("admin.univercity"), dataKey: "tutorProfile.univercity", sortable: true },
    { title: t("admin.GPA"), dataKey: "tutorProfile.GPA", sortable: true },
    {
      title: t("admin.dateTimeLearn"),
      dataKey: "tutorProfile.dateTimeLearn",
      renderCell: (value) => (
        <ul>
          {value.map((item, index) => (
            <li key={index}>
              {item.day}: {item.times.join(", ")}
            </li>
          ))}
        </ul>
      ),
    },
  ];

  const combinedRequests = data.map((item) => ({
    ...item,
    majorName: item.tutorProfile.majorName,
    univercity: item.tutorProfile.univercity,
    GPA: item.tutorProfile.GPA,
    dateTimeLearn: item.tutorProfile.dateTimeLearn,
  }));

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
            <AdminFilterButton fields={filterFields} onApply={handleApplyFilter} />
          </div>
        </div>
        {isLoading ? (
          <div className="loading-container">
            <Spinner /> {t("common.loading")}
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <Table
            columns={columns}
            data={combinedRequests}
            pageCount={Math.ceil(totalItems / itemsPerPage)}
            onPageChange={handlePageClick}
            forcePage={currentPage}
            onSort={handleSort}
            onDelete={handleDelete}
          />
        )}
      </div>
    </>
  );

  return (
    <AdminDashboardLayout
      currentPath={currentPath}
      childrenMiddleContentLower={childrenMiddleContentLower}
    />
  );
};

const ListOfRequest = React.memo(ListOfRequestPage);
export default ListOfRequest;