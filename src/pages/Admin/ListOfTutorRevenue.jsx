import React, { useCallback, useEffect, useState, useMemo } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css";
import Table from "../../components/Table";
import SearchBar from "../../components/SearchBar";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { Alert } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import numeral from "numeral";
import "numeral/locales/vi";
import { exportToExcel } from "../../utils/excelExport";
import {
  formatDateForAPI,
  validateDateRange,
  getDefaultDateRange,
} from "../../utils/dateUtils";

// Helper định dạng tiền tệ
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return "N/A";
  }
  numeral.locale("vi");
  return numeral(value).format("0,0 đ");
};

// Helper lấy giá trị lồng nhau an toàn
const getSafeNestedValue = (obj, path, defaultValue = "N/A") => {
  if (!obj || !path) return defaultValue;
  const value = path.split(".").reduce((acc, part) => acc && acc[part], obj);
  return value !== undefined && value !== null ? value : defaultValue;
};

// Search Key Options
const searchKeyOptions = [
  { value: "userId", label: "Mã gia sư" },
  { value: "fullname", label: "Tên gia sư" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Số điện thoại" },
];

const ListOfTutorRevenuePage = () => {
  // --- States ---
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Date range states
  const [startDate, setStartDate] = useState(() => {
    const defaultRange = getDefaultDateRange();
    return defaultRange.startDate;
  });
  const [endDate, setEndDate] = useState(() => {
    const defaultRange = getDefaultDateRange();
    return defaultRange.endDate;
  });
  const [dateError, setDateError] = useState("");

  // Search states
  const [searchInput, setSearchInput] = useState("");
  const [selectedSearchField, setSelectedSearchField] = useState(
    searchKeyOptions[0].value
  );
  const [appliedSearchInput, setAppliedSearchInput] = useState("");
  const [appliedSearchField, setAppliedSearchField] = useState(
    searchKeyOptions[0].value
  );

  const [sortConfig, setSortConfig] = useState({
    key: "totalRevenue",
    direction: "desc",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentPath = "/doanh-thu-gia-su";

  // --- Reset State ---
  const resetState = useCallback(() => {
    // Reset to current year range
    const defaultRange = getDefaultDateRange();
    setStartDate(defaultRange.startDate);
    setEndDate(defaultRange.endDate);
    setDateError("");
    setSearchInput("");
    setSelectedSearchField(searchKeyOptions[0].value);
    setAppliedSearchInput("");
    setAppliedSearchField(searchKeyOptions[0].value);
    setSortConfig({ key: "totalRevenue", direction: "desc" });
    setCurrentPage(0);
  }, []);

  // Date change handlers with validation
  const handleStartDateChange = (event) => {
    const newStartDate = event.target.value;
    setStartDate(newStartDate);

    const error = validateDateRange(newStartDate, endDate);
    setDateError(error || "");
  };

  const handleEndDateChange = (event) => {
    const newEndDate = event.target.value;
    setEndDate(newEndDate);

    const error = validateDateRange(startDate, newEndDate);
    setDateError(error || "");
  };

  // Export data handler
  const handleExportData = useCallback(async () => {
    try {
      if (data.length === 0) {
        toast.warning("Không có dữ liệu để xuất");
        return;
      }

      const loadingToast = toast.loading("Đang xuất dữ liệu...");

      const exportColumns = [
        { header: "STT", key: "stt" },
        { header: "Mã gia sư", key: "userId" },
        { header: "Tên gia sư", key: "fullname" },
        { header: "Email", key: "email" },
        { header: "Số điện thoại", key: "phone" },
        { header: "Tổng doanh thu", key: "totalRevenue" },
        { header: "Số giao dịch", key: "transactionCount" },
        { header: "Doanh thu TB/GD", key: "averageRevenue" },
      ];

      const exportData = data.map((item, index) => ({
        stt: currentPage * itemsPerPage + index + 1,
        userId: getSafeNestedValue(item, "userId", ""),
        fullname: getSafeNestedValue(item, "fullname", ""),
        email: getSafeNestedValue(item, "email", ""),
        phone: getSafeNestedValue(item, "phone", ""),
        totalRevenue: formatCurrency(
          getSafeNestedValue(item, "totalRevenue", 0)
        ),
        transactionCount: getSafeNestedValue(item, "transactionCount", 0),
        averageRevenue: formatCurrency(
          getSafeNestedValue(item, "averageRevenue", 0)
        ),
      }));

      const summaryStats = {
        "Tổng số gia sư": totalItems,
        "Tổng doanh thu": formatCurrency(totalRevenue),
        "Doanh thu TB/gia sư": formatCurrency(totalRevenue / (totalItems || 1)),
      };

      // Format date range information
      const periodInfo = `Từ ${startDate} đến ${endDate}`;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `danh-sach-doanh-thu-gia-su-${timestamp}.xlsx`;
      console.log("=== DEBUG EXPORT ===");
      console.log("exportData:", exportData);
      console.log("exportColumns:", exportColumns);
      console.log("summaryStats:", summaryStats);
      console.log("periodInfo:", periodInfo);

      // Export to Excel
      await exportToExcel({
        data: exportData,
        columns: exportColumns,
        title: "DANH SÁCH DOANH THU GIA SƯ",
        filename: filename,
        summaryStats: summaryStats,
        period: periodInfo,
        currentPage: currentPage,
        itemsPerPage: itemsPerPage,
      });

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`Đã xuất ${data.length} bản ghi thành công!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Có lỗi xảy ra khi xuất dữ liệu Excel");
    }
  }, [
    data,
    currentPage,
    itemsPerPage,
    totalItems,
    totalRevenue,
    startDate,
    endDate,
  ]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ctrl + R: Refresh data
      if (event.ctrlKey && event.key === "r") {
        event.preventDefault();
        resetState();
        return;
      }
      // Ctrl + E: Export data
      if (event.ctrlKey && event.key === "e") {
        event.preventDefault();
        handleExportData();
        return;
      }
      // Ctrl + F: Focus search
      if (event.ctrlKey && event.key === "f") {
        event.preventDefault();
        const searchInput = document.querySelector(".admin-search-input");
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleExportData, resetState]);

  // --- Columns Definition ---
  const columns = useMemo(
    () => [
      {
        title: "STT",
        dataKey: "stt",
        sortable: false,
        renderCell: (_, __, rowIndex) =>
          currentPage * itemsPerPage + rowIndex + 1,
      },
      {
        title: "Mã gia sư",
        dataKey: "userId",
        sortKey: "userId",
        sortable: true,
        renderCell: (_, row) => getSafeNestedValue(row, "userId", "..."),
      },
      {
        title: "Tên gia sư",
        dataKey: "fullname",
        sortKey: "fullname",
        sortable: true,
        renderCell: (_, row) => getSafeNestedValue(row, "fullname", "..."),
      },
      {
        title: "Email",
        dataKey: "email",
        sortKey: "email",
        sortable: true,
        renderCell: (_, row) => getSafeNestedValue(row, "email", "..."),
      },
      {
        title: "Số điện thoại",
        dataKey: "phone",
        sortKey: "phone",
        sortable: true,
        renderCell: (_, row) => getSafeNestedValue(row, "phone", "..."),
      },
      {
        title: "Tổng doanh thu",
        dataKey: "totalRevenue",
        sortKey: "totalRevenue",
        sortable: true,
        renderCell: (_, row) =>
          formatCurrency(getSafeNestedValue(row, "totalRevenue", 0)),
      },
      {
        title: "Số giao dịch",
        dataKey: "transactionCount",
        sortKey: "transactionCount",
        sortable: true,
        renderCell: (_, row) => getSafeNestedValue(row, "transactionCount", 0),
      },
      {
        title: "Doanh thu TB/GD",
        dataKey: "averageRevenue",
        sortKey: "averageRevenue",
        sortable: true,
        renderCell: (_, row) =>
          formatCurrency(getSafeNestedValue(row, "averageRevenue", 0)),
      },
    ],
    [currentPage, itemsPerPage]
  );

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const finalFilterConditions = [];

      // Add search filter if search value is provided
      if (
        appliedSearchInput &&
        appliedSearchInput.trim() &&
        appliedSearchField
      ) {
        finalFilterConditions.push({
          key: appliedSearchField,
          operator: "like",
          value: appliedSearchInput.trim(),
        });
      }

      const query = {
        rpp: itemsPerPage,
        page: currentPage + 1,
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
        ...(finalFilterConditions.length > 0 && {
          filter: JSON.stringify(finalFilterConditions),
        }),
        sort: JSON.stringify([
          { key: sortConfig.key, type: sortConfig.direction.toUpperCase() },
        ]),
      };

      const responsePayload = await Api({
        endpoint: `tutor-revenue/search-with-time`,
        method: METHOD_TYPE.GET,
        query: query,
      });

      if (responsePayload && responsePayload.success) {
        const responseInnerData = responsePayload.data;
        if (
          responseInnerData &&
          Array.isArray(responseInnerData.items) &&
          typeof responseInnerData.total === "number"
        ) {
          setData(responseInnerData.items);
          setTotalItems(responseInnerData.total);
          setPageCount(Math.ceil(responseInnerData.total / itemsPerPage));

          // Calculate total revenue
          const total = responseInnerData.items.reduce((sum, item) => {
            return sum + (item.totalRevenue || 0);
          }, 0);
          setTotalRevenue(total);
        } else {
          throw new Error("Invalid response structure");
        }
      } else {
        throw new Error(responsePayload?.message || "Unknown error");
      }
    } catch (error) {
      console.error("Fetch data error:", error);
      setError(error.message || "Có lỗi xảy ra khi tải dữ liệu");
      setData([]);
      setTotalItems(0);
      setPageCount(1);
      setTotalRevenue(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    sortConfig,
    startDate,
    endDate,
    appliedSearchInput,
    appliedSearchField,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Event Handlers ---
  const handlePageClick = (event) => {
    if (typeof event.selected === "number") setCurrentPage(event.selected);
  };

  const handleSort = (sortKey) => {
    setSortConfig((prev) => ({
      key: sortKey,
      direction:
        prev.key === sortKey && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(0);
  };

  const handleItemsPerPageChange = (newPageSize) => {
    setItemsPerPage(newPageSize);
    setCurrentPage(0);
  };

  // Search handlers
  const handleSearchInputChange = (value) => {
    setSearchInput(value);
  };

  const handleSearchFieldChange = (event) => {
    const newField = event.target.value;
    setSelectedSearchField(newField);
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setAppliedSearchInput(searchInput);
      setAppliedSearchField(selectedSearchField);
      setCurrentPage(0);
    }
  };

  const handleSearchButtonClick = () => {
    setAppliedSearchInput(searchInput);
    setAppliedSearchField(selectedSearchField);
    setCurrentPage(0);
  };

  // --- Render ---
  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        {/* Header */}
        <div className="admin-header">
          <h2 className="admin-title">📊 DANH SÁCH DOANH THU GIA SƯ</h2>
          <div className="admin-actions">
            <button
              className="btn btn-refresh"
              onClick={resetState}
              disabled={isLoading}
              title="Làm mới dữ liệu (Ctrl+R)"
            >
              🔄 Làm mới
            </button>
            <button
              className="btn btn-export"
              onClick={handleExportData}
              disabled={isLoading || data.length === 0}
              title="Xuất Excel (Ctrl+E)"
            >
              📊 Xuất Excel
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="help-text-container">
          <div
            className="help-text"
            style={{
              padding: "8px 12px",
              background: "#f0f7ff",
              borderLeft: "4px solid #2196F3",
              margin: "10px 0",
              fontSize: "14px",
              color: "#1976D2",
            }}
          >
            💡 Mẹo: Nhấn Ctrl+R để làm mới, Ctrl+E để xuất Excel, Ctrl+F để tìm
            kiếm nhanh
          </div>
        </div>

        {/* Filter Controls */}
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            {/* Start Date */}
            <div className="filter-control">
              <label htmlFor="startDateInput" className="filter-label">
                Từ ngày:
              </label>
              <input
                id="startDateInput"
                type="text"
                value={startDate}
                onChange={handleStartDateChange}
                className="status-filter-select"
                placeholder="DD/MM/YYYY"
                aria-label="Nhập ngày bắt đầu (DD/MM/YYYY)"
                style={{ width: "120px" }}
              />
            </div>
            {/* End Date */}
            <div className="filter-control">
              <label htmlFor="endDateInput" className="filter-label">
                Đến ngày:
              </label>
              <input
                id="endDateInput"
                type="text"
                value={endDate}
                onChange={handleEndDateChange}
                className="status-filter-select"
                placeholder="DD/MM/YYYY"
                aria-label="Nhập ngày kết thúc (DD/MM/YYYY)"
                style={{ width: "120px" }}
              />
            </div>
            {/* Date Error Display */}
            {dateError && (
              <div className="filter-control">
                <span
                  className="date-error-message"
                  style={{
                    color: "red",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {dateError}
                </span>
              </div>
            )}
            {/* Search Field Dropdown */}
            <div className="filter-control">
              <select
                id="searchFieldSelect"
                value={selectedSearchField}
                onChange={handleSearchFieldChange}
                className="status-filter-select"
                aria-label="Chọn trường để tìm kiếm"
              >
                {searchKeyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Search Bar */}
            <SearchBar
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchKeyPress}
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
              placeholder={
                searchKeyOptions.find(
                  (opt) => opt.value === selectedSearchField
                )
                  ? `Nhập ${searchKeyOptions
                      .find((opt) => opt.value === selectedSearchField)
                      .label.toLowerCase()}...`
                  : "Nhập từ khóa tìm kiếm..."
              }
            />
            <button
              className="btn btn-search"
              onClick={handleSearchButtonClick}
              disabled={isLoading}
              title="Tìm kiếm"
            >
              🔍 Tìm
            </button>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="stats-summary">
          {!isLoading && data.length > 0 && (
            <>
              <h3
                style={{
                  margin: "1rem 0 0 0",
                  color: "#2e7d32",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                  textAlign: "center",
                }}
              >
                💰 Tổng doanh thu: {formatCurrency(totalRevenue)}
              </h3>
              <p
                style={{
                  margin: "0.5rem 0 0 0",
                  textAlign: "center",
                  color: "#6c757d",
                  fontSize: "0.9rem",
                }}
              >
                Từ {startDate} đến {endDate}
                {data.length > 0 && ` • ${totalItems} gia sư`}
              </p>
            </>
          )}
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Table
          columns={columns}
          data={data}
          totalItems={totalItems}
          pageCount={pageCount}
          onPageChange={handlePageClick}
          forcePage={currentPage}
          onSort={handleSort}
          currentSortConfig={sortConfig}
          onItemsPerPageChange={handleItemsPerPageChange}
          isLoading={isLoading}
        />
      </div>
      <ToastContainer />
    </>
  );

  return (
    <AdminDashboardLayout
      currentPath={currentPath}
      childrenMiddleContentLower={childrenMiddleContentLower}
    />
  );
};

const ListOfTutorRevenue = React.memo(ListOfTutorRevenuePage);
export default ListOfTutorRevenue;
