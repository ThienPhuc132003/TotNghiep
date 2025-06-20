import { useCallback, useEffect, useState, useMemo } from "react";
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

// Helper lấy giá trị lồng nhau an toàn
const getSafeNestedValue = (obj, path, defaultValue = "N/A") => {
  if (!obj || !path) return defaultValue;
  const value = path.split(".").reduce((acc, part) => acc && acc[part], obj);
  return value !== undefined && value !== null ? value : defaultValue;
};

// Helper lấy placeholder cho search input
const getSearchPlaceholder = (selectedField) => {
  const placeholders = {
    all: "Tìm kiếm trong tất cả các trường...",
    userId: "Nhập mã gia sư...",
    fullname: "Nhập tên gia sư...",
    totalAssessmentWithTime: "Nhập tổng lượt đánh giá...",
    averageAssessmentWithTime: "Nhập điểm trung bình...",
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
  { value: "all", label: "Tất cả các trường" },
  { value: "userId", label: "Mã gia sư" },
  { value: "fullname", label: "Tên gia sư" },
  { value: "totalAssessmentWithTime", label: "Tổng lượt đánh giá" },
  { value: "averageAssessmentWithTime", label: "Điểm đánh giá trung bình" },
];

const TutorAssessmentStatisticsPage = () => {
  // --- States ---
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalAssessments, setTotalAssessments] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
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
  const [selectedSearchField, setSelectedSearchField] = useState("all");
  const [appliedSearchInput, setAppliedSearchInput] = useState("");
  const [appliedSearchField, setAppliedSearchField] = useState("all");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentPath = "/danh-gia-gia-su"; // --- Reset State ---
  const resetState = useCallback(() => {
    // Reset to current year range
    const defaultRange = getDefaultDateRange();
    setStartDate(defaultRange.startDate);
    setEndDate(defaultRange.endDate);
    setDateError("");
    setSearchInput("");
    setSelectedSearchField("all");
    setAppliedSearchInput("");
    setAppliedSearchField("all");
    setCurrentPage(0);
    setItemsPerPage(10);
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

  // --- Event Handlers ---
  const handlePageClick = (event) => {
    if (typeof event.selected === "number") setCurrentPage(event.selected);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(0);
  };

  const handleSearchInputChange = (value) => {
    setSearchInput(value);
  };

  const handleSearchFieldChange = (event) => {
    setSelectedSearchField(event.target.value);
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
      handleApplyFiltersAndSearch();
    }
  };
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
        { title: "Mã gia sư", dataKey: "userId" },
        { title: "Tên gia sư", dataKey: "fullname" },
        { title: "Tổng lượt đánh giá", dataKey: "totalAssessmentWithTime" },
        {
          title: "Điểm đánh giá trung bình",
          dataKey: "averageAssessmentWithTime",
        },
      ];

      // Calculate summary statistics
      const totalTutors = totalItems;
      const totalAssessments = data.reduce(
        (sum, row) =>
          sum + (getSafeNestedValue(row, "totalAssessmentWithTime", 0) || 0),
        0
      );
      const averageRating =
        data.length > 0
          ? (
              data.reduce(
                (sum, row) =>
                  sum +
                  (getSafeNestedValue(row, "averageAssessmentWithTime", 0) ||
                    0),
                0
              ) / data.length
            ).toFixed(2)
          : 0;

      const summaryStats = {
        "Tổng số gia sư": totalTutors,
        "Tổng lượt đánh giá": totalAssessments,
        "Điểm TB chung": averageRating,
      }; // Format date range information
      const periodInfo = `Từ ${startDate} đến ${endDate}`;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `thong-ke-danh-gia-gia-su-${timestamp}.xlsx`; // Export to Excel
      await exportToExcel({
        data: data,
        columns: exportColumns,
        title: "THỐNG KÊ SỐ LƯỢNG ĐÁNH GIÁ GIA SƯ",
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
  }, [data, currentPage, itemsPerPage, totalItems, startDate, endDate]);

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
        sortable: false,
        renderCell: (value) => value || "N/A",
      },
      {
        title: "Tên gia sư",
        dataKey: "fullname",
        sortKey: "fullname",
        sortable: false,
        renderCell: (value) => value || "N/A",
      },
      {
        title: "Tổng lượt đánh giá",
        dataKey: "totalAssessmentWithTime",
        sortKey: "totalAssessmentWithTime",
        sortable: false,
        renderCell: (value) => (value || 0).toLocaleString("vi-VN"),
      },
      {
        title: "Điểm đánh giá trung bình",
        dataKey: "averageAssessmentWithTime",
        sortKey: "averageAssessmentWithTime",
        sortable: false,
        renderCell: (value) => {
          const rating = value || 0;
          return rating > 0 ? rating.toFixed(2) : "0.00";
        },
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
      if (appliedSearchInput && appliedSearchInput.trim()) {
        const searchValue = appliedSearchInput.trim();

        if (appliedSearchField && appliedSearchField !== "all") {
          // Search in specific field
          let operator = "like";

          // For numeric fields, use exact match
          if (
            appliedSearchField === "totalAssessmentWithTime" ||
            appliedSearchField === "averageAssessmentWithTime"
          ) {
            operator = "equal";
          }
          // For user IDs, use exact match
          else if (appliedSearchField === "userId") {
            operator = "equal";
          }

          finalFilterConditions.push({
            key: appliedSearchField,
            operator: operator,
            value: searchValue,
          });
        } else {
          // Search in all fields (OR condition)
          const searchFields = [
            { key: "userId", operator: "equal" },
            { key: "fullname", operator: "like" },
            { key: "totalAssessmentWithTime", operator: "equal" },
            { key: "averageAssessmentWithTime", operator: "equal" },
          ];

          // Create OR conditions for all searchable fields
          searchFields.forEach((field) => {
            finalFilterConditions.push({
              key: field.key,
              operator: field.operator,
              value: searchValue,
              logicalOperator: "OR",
            });
          });
        }
      }
      const query = {
        page: currentPage + 1,
        limit: itemsPerPage,
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
        filter: JSON.stringify(finalFilterConditions),
      };

      const responsePayload = await Api({
        endpoint: `classroom-assessment/search-with-time`,
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

          // Calculate total assessments and average rating
          const totalAssessmentsCalculated = responseInnerData.items.reduce(
            (sum, item) => sum + (item.totalAssessmentWithTime || 0),
            0
          );
          setTotalAssessments(totalAssessmentsCalculated);

          // Calculate average rating across all tutors
          const validRatings = responseInnerData.items.filter(
            (item) => item.averageAssessmentWithTime > 0
          );
          const averageRatingCalculated =
            validRatings.length > 0
              ? validRatings.reduce(
                  (sum, item) => sum + (item.averageAssessmentWithTime || 0),
                  0
                ) / validRatings.length
              : 0;
          setAverageRating(averageRatingCalculated);
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
        "Có lỗi xảy ra khi tải dữ liệu thống kê đánh giá gia sư.";
      setError(errorMessage);
      setData([]);
      setTotalItems(0);
      setPageCount(1);
      setTotalAssessments(0);
      setAverageRating(0);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
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

  // --- JSX Render ---
  const childrenMiddleContentLower = (
    <>
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
            Thống kê đánh giá gia sư
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
        {/* All Controls in One Row */}
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
                disabled={isLoading}
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
                disabled={isLoading}
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

            {/* Select chọn cột tìm kiếm */}
            <div className="filter-control">
              <select
                id="searchFieldSelectTutorAssessment"
                value={selectedSearchField}
                onChange={handleSearchFieldChange}
                className="status-filter-select"
                aria-label="Chọn trường để tìm kiếm"
                disabled={isLoading}
              >
                {searchKeyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <SearchBar
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchKeyPress}
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
              placeholder={getSearchPlaceholder(selectedSearchField)}
            />

            <button
              className="refresh-button"
              onClick={handleApplyFiltersAndSearch}
              title="Tìm kiếm"
              aria-label="Tìm kiếm"
              disabled={isLoading}
            >
              <i className="fa-solid fa-search"></i>
            </button>

            {/* Export Button */}
            <button
              className="refresh-button"
              onClick={handleExportData}
              title="Xuất Excel (Ctrl+E)"
              aria-label="Xuất Excel"
              disabled={isLoading || !data.length}
              style={{
                backgroundColor: "#28a745",
                borderColor: "#28a745",
                color: "white",
              }}
            >
              <i className="fa-solid fa-file-excel"></i>
            </button>

            {/* Refresh Button */}
            <button
              className="refresh-button"
              onClick={resetState}
              title="Làm mới (Ctrl+R)"
              aria-label="Làm mới"
              disabled={isLoading}
            >
              <i className="fa-solid fa-rotate-left"></i>
            </button>
          </div>
        </div>
        {/* Summary Statistics */}
        {!isLoading && !error && (
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
                marginBottom: "15px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "15px",
                  borderRadius: "8px",
                  border: "1px solid #dee2e6",
                  minWidth: "200px",
                }}
              >
                <strong style={{ color: "#495057" }}>Tổng số gia sư:</strong>
                <div
                  style={{
                    fontSize: "24px",
                    color: "#007bff",
                    marginTop: "5px",
                  }}
                >
                  {totalItems.toLocaleString("vi-VN")}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "15px",
                  borderRadius: "8px",
                  border: "1px solid #dee2e6",
                  minWidth: "200px",
                }}
              >
                <strong style={{ color: "#495057" }}>
                  Tổng lượt đánh giá:
                </strong>
                <div
                  style={{
                    fontSize: "24px",
                    color: "#28a745",
                    marginTop: "5px",
                  }}
                >
                  {totalAssessments.toLocaleString("vi-VN")}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "15px",
                  borderRadius: "8px",
                  border: "1px solid #dee2e6",
                  minWidth: "200px",
                }}
              >
                <strong style={{ color: "#495057" }}>Điểm trung bình:</strong>
                <div
                  style={{
                    fontSize: "24px",
                    color: "#ffc107",
                    marginTop: "5px",
                  }}
                >
                  {averageRating.toFixed(2)} / 5.00
                </div>
              </div>
            </div>
          </div>
        )}
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
            Tổng số gia sư: {totalItems}
          </p>
        )}
      </div>
      <ToastContainer />
    </>
  );

  return (
    <AdminDashboardLayout
      titlePage="Thống kê đánh giá gia sư"
      pathPage={currentPath}
      childrenMiddleContentLower={childrenMiddleContentLower}
    />
  );
};

export default TutorAssessmentStatisticsPage;
