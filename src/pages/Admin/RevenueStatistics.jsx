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

// Period Type Options
const periodTypeOptions = [
  { value: "DAY", label: "Ngày" },
  { value: "WEEK", label: "Tuần" },
  { value: "MONTH", label: "Tháng" },
  { value: "YEAR", label: "Năm" },
];

// Search Key Options
const searchKeyOptions = [
  { value: "user.userId", label: "Mã học viên" },
  { value: "user.fullname", label: "Tên học viên" },
  { value: "tutor.userId", label: "Mã gia sư" },
  { value: "tutor.fullname", label: "Tên gia sư" },
];

const RevenueStatisticsPage = () => {
  // --- States ---
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalRevenue, setTotalRevenue] = useState(0);
  // Filter states
  const [periodType, setPeriodType] = useState("MONTH");
  const [periodValue, setPeriodValue] = useState(1);
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
    key: "createdAt",
    direction: "desc",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentPath = "/doanh-thu";

  // --- Reset State ---
  const resetState = useCallback(() => {
    setPeriodType("MONTH");
    setPeriodValue(1);
    setSearchInput("");
    setSelectedSearchField(searchKeyOptions[0].value);
    setAppliedSearchInput("");
    setAppliedSearchField(searchKeyOptions[0].value);
    setSortConfig({ key: "createdAt", direction: "desc" });
    setCurrentPage(0);
  }, []);
  // Export data handler
  const handleExportData = useCallback(async () => {
    try {
      if (!data || data.length === 0) {
        toast.warning("Không có dữ liệu để xuất");
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading("Đang tạo file Excel...");

      // Define columns for export
      const exportColumns = [
        { title: "STT", dataKey: "stt" },
        { title: "Mã học viên", dataKey: "user.userId" },
        { title: "Tên học viên", dataKey: "user.fullname" },
        { title: "Mã gia sư", dataKey: "tutor.userId" },
        { title: "Tên gia sư", dataKey: "tutor.fullname" },
        { title: "Tiền học viên đóng", dataKey: "coinOfUserPayment" },
        { title: "Tiền trả gia sư", dataKey: "coinOfTutorReceive" },
        { title: "Doanh thu", dataKey: "coinOfWebReceive" },
      ];

      // Calculate summary statistics
      const totalTransactions = totalItems;
      const averageRevenue =
        data.length > 0
          ? (
              data.reduce((sum, row) => sum + (row.coinOfWebReceive || 0), 0) /
              data.length
            ).toFixed(0)
          : 0;

      const summaryStats = {
        "Tổng số giao dịch": totalTransactions,
        "Tổng doanh thu": formatCurrency(totalRevenue),
        "Doanh thu TB/GD": formatCurrency(averageRevenue),
      };

      // Format period information
      const periodLabels = {
        DAY: "Ngày",
        WEEK: "Tuần",
        MONTH: "Tháng",
        YEAR: "Năm",
      };

      const periodInfo = periodValue
        ? `${periodLabels[periodType] || periodType}: ${periodValue}`
        : "Tất cả thời gian";

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `thong-ke-doanh-thu-${timestamp}.xlsx`;

      // Export to Excel
      await exportToExcel({
        data: data,
        columns: exportColumns,
        title: "THỐNG KÊ DOANH THU CỦA GIASUVLU",
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
    periodType,
    periodValue,
  ]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ctrl + R: Refresh data
      if (event.ctrlKey && event.key === "r") {
        event.preventDefault();
        resetState();
        return;
      } // Ctrl + E: Export data
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
        title: "Mã học viên",
        dataKey: "user.userId",
        sortKey: "user.userId",
        sortable: true,
        renderCell: (_, row) => getSafeNestedValue(row, "user.userId", "..."),
      },
      {
        title: "Tên học viên",
        dataKey: "user.fullname",
        sortKey: "user.fullname",
        sortable: true,
        renderCell: (_, row) => getSafeNestedValue(row, "user.fullname", "..."),
      },
      {
        title: "Mã gia sư",
        dataKey: "tutor.userId",
        sortKey: "tutor.userId",
        sortable: true,
        renderCell: (_, row) => getSafeNestedValue(row, "tutor.userId", "..."),
      },
      {
        title: "Tên gia sư",
        dataKey: "tutor.fullname",
        sortKey: "tutor.fullname",
        sortable: true,
        renderCell: (_, row) =>
          getSafeNestedValue(row, "tutor.fullname", "..."),
      },
      {
        title: "Tiền học viên đóng",
        dataKey: "coinOfUserPayment",
        sortKey: "coinOfUserPayment",
        sortable: true,
        renderCell: formatCurrency,
      },
      {
        title: "Tiền trả gia sư",
        dataKey: "coinOfTutorReceive",
        sortKey: "coinOfTutorReceive",
        sortable: true,
        renderCell: formatCurrency,
      },
      {
        title: "Doanh thu",
        dataKey: "coinOfWebReceive",
        sortKey: "coinOfWebReceive",
        sortable: true,
        renderCell: formatCurrency,
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
        periodType: periodType,
        periodValue: periodValue,
        ...(finalFilterConditions.length > 0 && {
          filter: JSON.stringify(finalFilterConditions),
        }),
        sort: JSON.stringify([
          { key: sortConfig.key, type: sortConfig.direction.toUpperCase() },
        ]),
      };

      const responsePayload = await Api({
        endpoint: `manage-payment/search-with-time`,
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

          // Set total revenue from API response
          setTotalRevenue(responseInnerData.totalRevenue || 0);
        } else {
          throw new Error("Lỗi xử lý dữ liệu từ API.");
        }
      } else {
        throw new Error(
          responsePayload?.message || "Lỗi không xác định từ API."
        );
      }
    } catch (errorCatch) {
      const errorMessage =
        errorCatch.message ||
        "Có lỗi xảy ra khi tải dữ liệu thống kê doanh thu.";
      setError(errorMessage);
      setData([]);
      setTotalItems(0);
      setPageCount(1);
      setTotalRevenue(0);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    sortConfig,
    periodType,
    periodValue,
    appliedSearchInput,
    appliedSearchField,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    numeral.locale("vi");
  }, []);

  // --- Handlers ---
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

  const handlePeriodTypeChange = (event) => {
    setPeriodType(event.target.value);
    setCurrentPage(0);
  };

  const handlePeriodValueChange = (event) => {
    const value = parseInt(event.target.value);
    if (value > 0) {
      setPeriodValue(value);
      setCurrentPage(0);
    }
  };

  // Search handlers following ListOfAdmin pattern
  const handleSearchInputChange = (value) => {
    setSearchInput(value);
  };

  const handleSearchFieldChange = (event) => {
    const newField = event.target.value;
    setSelectedSearchField(newField);
  };

  const handleApplyFiltersAndSearch = () => {
    if (searchInput.trim()) {
      setAppliedSearchField(selectedSearchField);
      setAppliedSearchInput(searchInput);
    } else {
      setAppliedSearchField(selectedSearchField);
      setAppliedSearchInput("");
    }
    setCurrentPage(0);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      if (searchInput.trim()) {
        handleApplyFiltersAndSearch();
      }
    }
  };

  // --- JSX Render ---
  const childrenMiddleContentLower = (
    <>
      {" "}
      <div className="admin-content">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "25px",
          }}
        >
          <h2 className="admin-list-title" style={{ margin: 0 }}>
            Doanh thu GiaSuVLU
          </h2>
          <div
            title="Keyboard Shortcuts:&#10;Ctrl + R: Refresh&#10;Ctrl + E: Export&#10;Ctrl + F: Focus Search"
            style={{
              cursor: "help",
              backgroundColor: "#17a2b8",
              color: "white",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
            }}
          >
            ?
          </div>
        </div>

        {/* Filter Controls */}
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            {/* Period Type */}
            <div className="filter-control">
              <label htmlFor="periodTypeSelect" className="filter-label">
                Loại thời gian:
              </label>
              <select
                id="periodTypeSelect"
                value={periodType}
                onChange={handlePeriodTypeChange}
                className="status-filter-select"
                aria-label="Chọn loại thời gian"
              >
                {periodTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Period Value */}
            <div className="filter-control">
              <label htmlFor="periodValueInput" className="filter-label">
                Số lượng:
              </label>
              <input
                id="periodValueInput"
                type="number"
                min="1"
                value={periodValue}
                onChange={handlePeriodValueChange}
                className="status-filter-select"
                style={{ width: "80px" }}
                aria-label="Nhập số lượng thời gian"
              />
            </div>
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
                      ?.label.toLowerCase()}...`
                  : "Nhập tìm kiếm..."
              }
            />
            {/* Apply Filters Button */}
            <button
              className="refresh-button"
              onClick={handleApplyFiltersAndSearch}
              title="Áp dụng bộ lọc & Tìm kiếm"
              aria-label="Áp dụng bộ lọc và tìm kiếm"
              disabled={
                isLoading ||
                (!searchInput.trim() &&
                  appliedSearchInput === searchInput &&
                  appliedSearchField === selectedSearchField)
              }
            >
              <i className="fa-solid fa-search"></i>
            </button>{" "}
            {/* Reset Button */}
            <button
              className="refresh-button"
              onClick={resetState}
              title="Làm mới bộ lọc"
              aria-label="Làm mới bộ lọc"
              disabled={isLoading}
            >
              <i className="fa-solid fa-rotate-left"></i>
            </button>{" "}
            {/* Export Button */}
            <button
              className="refresh-button"
              onClick={handleExportData}
              title="Xuất Excel (Ctrl+E)"
              aria-label="Xuất Excel"
              disabled={isLoading || data.length === 0}
              style={{
                backgroundColor: data.length > 0 ? "#28a745" : undefined,
                color: data.length > 0 ? "white" : undefined,
              }}
            >
              <i className="fa-solid fa-file-excel"></i>
            </button>
          </div>
        </div>
        {/* Total Revenue Display */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            border: "1px solid #dee2e6",
          }}
        >
          {isLoading ? (
            <div style={{ textAlign: "center", color: "#6c757d" }}>
              <i
                className="fa-solid fa-spinner fa-spin"
                style={{ marginRight: "0.5rem" }}
              ></i>
              Đang tải dữ liệu doanh thu...
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", color: "#dc3545" }}>
              <i
                className="fa-solid fa-exclamation-triangle"
                style={{ marginRight: "0.5rem" }}
              ></i>
              Không thể tải dữ liệu doanh thu
            </div>
          ) : (
            <>
              <h3
                style={{
                  margin: "0",
                  color: "#28a745",
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
                Trong {periodValue}{" "}
                {periodTypeOptions
                  .find((opt) => opt.value === periodType)
                  ?.label.toLowerCase()}{" "}
                gần đây
                {data.length > 0 && ` • ${totalItems} giao dịch`}
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
          loading={isLoading}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
        {!isLoading && !error && data.length > 0 && (
          <p
            style={{
              textAlign: "right",
              marginTop: "1rem",
              fontSize: "0.9em",
              color: "#555",
            }}
          >
            Tổng số giao dịch: {totalItems}
          </p>
        )}
        {!isLoading && !error && data.length === 0 && totalItems === 0 && (
          <p
            style={{
              textAlign: "center",
              marginTop: "2rem",
              fontSize: "1em",
              color: "#777",
            }}
          >
            Không có dữ liệu thống kê cho khoảng thời gian này.
          </p>
        )}
      </div>
    </>
  );

  return (
    <AdminDashboardLayout
      currentPath={currentPath}
      childrenMiddleContentLower={childrenMiddleContentLower}
    >
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </AdminDashboardLayout>
  );
};

const RevenueStatistics = React.memo(RevenueStatisticsPage);
export default RevenueStatistics;
