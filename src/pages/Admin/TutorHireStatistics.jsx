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

// Helper định dạng ngày
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (error) {
    return "N/A";
  }
};

// Helper lấy giá trị lồng nhau an toàn
const getSafeNestedValue = (obj, path, defaultValue = "N/A") => {
  if (!obj || !path) return defaultValue;
  const value = path.split(".").reduce((acc, part) => acc && acc[part], obj);
  return value !== undefined && value !== null ? value : defaultValue;
};

// Helper lấy placeholder cho search input
const getSearchPlaceholder = (selectedField) => {
  const placeholders = {
    "user.userId": "Nhập mã học viên...",
    "user.fullname": "Nhập tên học viên...",
    "tutor.userId": "Nhập mã gia sư...",
    "tutor.fullname": "Nhập tên gia sư...",
    "user.major.majorName": "Nhập tên ngành...",
    createdAt: "Nhập ngày thuê (dd/mm/yyyy)...",
  };
  return placeholders[selectedField] || "Nhập từ khóa tìm kiếm...";
};

// Period Type Options - DEPRECATED: Now using date range
// const periodTypeOptions = [
//   { value: "DAY", label: "Ngày" },
//   { value: "WEEK", label: "Tuần" },
//   { value: "MONTH", label: "Tháng" },
//   { value: "YEAR", label: "Năm" },
// ];

// Search Key Options
const searchKeyOptions = [
  { value: "user.userId", label: "Mã học viên" },
  { value: "user.fullname", label: "Tên học viên" },
  { value: "tutor.userId", label: "Mã gia sư" },
  { value: "tutor.fullname", label: "Tên gia sư" },
  { value: "user.major.majorName", label: "Ngành" },
  { value: "createdAt", label: "Ngày thuê" },
];

const TutorHireStatisticsPage = () => {
  // --- States ---
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalHires, setTotalHires] = useState(0);
  // Date range states (replacing periodType/periodValue)
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
    key: "createdAt",
    direction: "desc",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentPath = "/luot-thue-gia-su"; // --- Reset State ---
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
    setSortConfig({ key: "createdAt", direction: "desc" });
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
    if (data.length === 0) {
      toast.warning("Không có dữ liệu để xuất");
      return;
    }

    const toastId = toast.loading("Đang xuất dữ liệu...");

    try {
      // Define columns for Excel export
      const exportColumns = [
        { title: "STT", dataKey: "stt" },
        { title: "Mã học viên", dataKey: "userId" },
        { title: "Tên học viên", dataKey: "studentName" },
        { title: "Mã gia sư", dataKey: "tutorId" },
        { title: "Tên gia sư", dataKey: "tutorName" },
        { title: "Ngành", dataKey: "major" },
        { title: "Ngày thuê", dataKey: "hireDate" },
      ];

      // Prepare data for Excel export
      const exportData = data.map((row, index) => ({
        stt: currentPage * itemsPerPage + index + 1,
        userId: getSafeNestedValue(row, "user.userId", ""),
        studentName: getSafeNestedValue(row, "user.fullname", ""),
        tutorId: getSafeNestedValue(row, "tutor.userId", ""),
        tutorName: getSafeNestedValue(row, "tutor.fullname", ""),
        major: getSafeNestedValue(row, "user.major.majorName", ""),
        hireDate: formatDate(row.createdAt),
      }));

      // Calculate summary statistics
      const summaryStats = [
        { label: "Tổng số lượt thuê", value: data.length },
        {
          label: "Số gia sư được thuê",
          value: new Set(
            data.map((item) => getSafeNestedValue(item, "tutor.userId"))
          ).size,
        },
        {
          label: "Số học viên thuê",
          value: new Set(
            data.map((item) => getSafeNestedValue(item, "user.userId"))
          ).size,
        },
        {
          label: "Số ngành học",
          value: new Set(
            data.map((item) => getSafeNestedValue(item, "user.major.majorName"))
          ).size,
        },
      ]; // Format date range information
      const periodInfo = `Từ ${startDate} đến ${endDate}`;

      console.log("=== DEBUG TUTOR HIRE EXPORT ===");
      console.log("exportData:", exportData);
      console.log("exportColumns:", exportColumns);
      console.log("summaryStats:", summaryStats);
      console.log("periodInfo:", periodInfo);

      await exportToExcel({
        data: exportData,
        columns: exportColumns,
        filename: `thong-ke-luot-thue-gia-su-${new Date()
          .toISOString()
          .slice(0, 10)}`,
        title: "THỐNG KÊ LƯỢT THUÊ GIA SƯ",
        period: periodInfo,
        summaryStats,
      });

      toast.update(toastId, {
        render: `Đã xuất ${data.length} bản ghi thành công!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.update(toastId, {
        render: "Có lỗi xảy ra khi xuất dữ liệu",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  }, [data, currentPage, itemsPerPage, startDate, endDate]);

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
        sortable: true,
        renderCell: (value, row) => getSafeNestedValue(row, "user.userId", ""),
      },
      {
        title: "Tên học viên",
        dataKey: "user.fullname",
        sortable: true,
        renderCell: (value, row) =>
          getSafeNestedValue(row, "user.fullname", ""),
      },
      {
        title: "Mã gia sư",
        dataKey: "tutor.userId",
        sortable: true,
        renderCell: (value, row) => getSafeNestedValue(row, "tutor.userId", ""),
      },
      {
        title: "Tên gia sư",
        dataKey: "tutor.fullname",
        sortable: true,
        renderCell: (value, row) =>
          getSafeNestedValue(row, "tutor.fullname", ""),
      },
      {
        title: "Ngành",
        dataKey: "user.major.majorName",
        sortable: true,
        renderCell: (value, row) =>
          getSafeNestedValue(row, "user.major.majorName", ""),
      },
      {
        title: "Ngày thuê",
        dataKey: "createdAt",
        sortable: true,
        renderCell: (value) => formatDate(value),
      },
    ],
    [currentPage, itemsPerPage]
  );

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const finalFilterConditions = []; // Add search filter if search value is provided
      if (
        appliedSearchInput &&
        appliedSearchInput.trim() &&
        appliedSearchField
      ) {
        // Use different operators based on the field type
        let operator = "like";

        // For user/tutor IDs, use exact match
        if (appliedSearchField.includes("userId")) {
          operator = "equal";
        }
        // For date fields, use date-specific operator
        else if (appliedSearchField === "createdAt") {
          operator = "like"; // Assuming the backend can handle date-like searches
        }

        finalFilterConditions.push({
          key: appliedSearchField,
          operator: operator,
          value: appliedSearchInput.trim(),
        });
      }
      const query = {
        page: currentPage + 1,
        limit: itemsPerPage,
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
        filter: JSON.stringify(finalFilterConditions),
        sort: JSON.stringify([
          { key: sortConfig.key, type: sortConfig.direction.toUpperCase() },
        ]),
      };

      const responsePayload = await Api({
        endpoint: `booking-request/search-with-time`,
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

          // Set total hires from API response
          setTotalHires(responseInnerData.total || 0);
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
        "Có lỗi xảy ra khi tải dữ liệu thống kê lượt thuê gia sư.";
      setError(errorMessage);
      setData([]);
      setTotalItems(0);
      setPageCount(1);
      setTotalHires(0);
      toast.error(errorMessage);
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

  // Search handlers following ListOfAdmin pattern
  const handleSearchInputChange = (value) => {
    setSearchInput(value);
  };

  const handleSearchFieldChange = (event) => {
    const newField = event.target.value;
    setSelectedSearchField(newField);
  };

  const handleApplyFiltersAndSearch = () => {
    setAppliedSearchInput(searchInput);
    setAppliedSearchField(selectedSearchField);
    setCurrentPage(0);
  };

  // Clear search when Enter is pressed
  const handleSearchKeyPress = (event) => {
    if (event.key === "Enter") {
      handleApplyFiltersAndSearch();
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
            Thống kê lượt thuê gia sư
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
        </div>{" "}
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
            </div>{" "}
            {/* Search Bar */}
            <SearchBar
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchKeyPress}
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
              placeholder={getSearchPlaceholder(selectedSearchField)}
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
            </button>
            {/* Export Button */}
            <button
              className="refresh-button"
              onClick={handleExportData}
              title="Xuất Excel (Ctrl+E)"
              aria-label="Xuất dữ liệu Excel"
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
        {/* Total Hires Display */}
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
              Đang tải dữ liệu lượt thuê...
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", color: "#dc3545" }}>
              <i
                className="fa-solid fa-exclamation-triangle"
                style={{ marginRight: "0.5rem" }}
              ></i>
              Không thể tải dữ liệu lượt thuê
            </div>
          ) : (
            <>
              <h3
                style={{
                  margin: "0",
                  color: "#17a2b8",
                  fontSize: "1.2rem",
                  textAlign: "center",
                }}
              >
                📊 Tổng số lượt thuê:{" "}
                <strong>{totalHires.toLocaleString()} lượt</strong>
              </h3>
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
          showLock={false}
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

const TutorHireStatistics = React.memo(TutorHireStatisticsPage);
export default TutorHireStatistics;
