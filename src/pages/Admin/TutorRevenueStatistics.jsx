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

// Helper định dạng ngày (reserved for future use)
// const formatDate = (dateString) => {
//   if (!dateString) return "N/A";
//   try {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("vi-VN", {
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//     });
//   } catch (error) {
//     return "N/A";
//   }
// };

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
    totalHire: "Nhập số lượt thuê...",
    totalRevenueWithTime: "Nhập doanh thu...",
  };
  return placeholders[selectedField] || "Nhập từ khóa tìm kiếm...";
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
  { value: "all", label: "Tất cả các trường" },
  { value: "userId", label: "Mã gia sư" },
  { value: "fullname", label: "Tên gia sư" },
  { value: "totalHire", label: "Tổng số lượt được thuê" },
  { value: "totalRevenueWithTime", label: "Tổng doanh thu của gia sư" },
];

const TutorRevenueStatisticsPage = () => {
  // --- States ---
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Period selection states
  const [periodType, setPeriodType] = useState("MONTH");
  const [periodValue, setPeriodValue] = useState(1);
  // Search states
  const [searchInput, setSearchInput] = useState("");
  const [selectedSearchField, setSelectedSearchField] = useState("all");
  const [appliedSearchInput, setAppliedSearchInput] = useState("");
  const [appliedSearchField, setAppliedSearchField] = useState("all");
  // Tạm thời comment sort để test
  // const [sortConfig, setSortConfig] = useState({
  //   key: "totalRevenueWithTime",
  //   direction: "desc",
  // });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentPath = "/doanh-thu-gia-su";
  // --- Reset State ---
  const resetState = useCallback(() => {
    setPeriodType("MONTH");
    setPeriodValue(1);
    setSearchInput("");
    setSelectedSearchField("all");
    setAppliedSearchInput("");
    setAppliedSearchField("all");
    // setSortConfig({ key: "totalRevenueWithTime", direction: "desc" });
    setCurrentPage(0);
    setItemsPerPage(10);
  }, []);

  // --- Event Handlers ---
  const handlePageClick = (event) => {
    if (typeof event.selected === "number") setCurrentPage(event.selected);
  };
  // Tạm thời comment sort để test
  // const handleSort = (sortKey) => {
  //   if (!sortKey) return;
  //   setSortConfig((prev) => ({
  //     key: sortKey,
  //     direction:
  //       prev.key === sortKey && prev.direction === "asc" ? "desc" : "asc",
  //   }));
  //   setCurrentPage(0);
  // };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(0);
  };

  const handlePeriodTypeChange = (event) => {
    setPeriodType(event.target.value);
    setCurrentPage(0);
  };

  const handlePeriodValueChange = (event) => {
    setPeriodValue(parseInt(event.target.value) || 1);
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
  // handleApplyFiltersAndSearch function (reserved for future use)
  // const handleApplyFiltersAndSearch = () => {
  //   handleSearchSubmit();
  // };
  // Export data handler
  const handleExportData = useCallback(async () => {
    if (!data || data.length === 0) {
      toast.warning("Không có dữ liệu để xuất");
      return;
    }

    const toastId = toast.loading("Đang xuất dữ liệu...");

    try {
      // Prepare data for Excel export
      const exportData = data.map((row, index) => ({
        STT: currentPage * itemsPerPage + index + 1,
        "Mã gia sư": getSafeNestedValue(row, "userId", ""),
        "Tên gia sư": getSafeNestedValue(row, "fullname", ""),
        "Tổng số lượt được thuê": getSafeNestedValue(row, "totalHire", 0),
        "Tổng doanh thu của gia sư": numeral(
          getSafeNestedValue(row, "totalRevenueWithTime", 0)
        ).format("0,0"),
      }));

      // Calculate summary statistics
      const totalRevenue = data.reduce(
        (sum, item) =>
          sum + (getSafeNestedValue(item, "totalRevenueWithTime", 0) || 0),
        0
      );
      const totalHires = data.reduce(
        (sum, item) => sum + (getSafeNestedValue(item, "totalHire", 0) || 0),
        0
      );
      const averageRevenuePerTutor =
        data.length > 0 ? totalRevenue / data.length : 0;
      const averageHiresPerTutor =
        data.length > 0 ? totalHires / data.length : 0;

      const summaryStats = [
        { label: "Tổng số gia sư", value: data.length },
        {
          label: "Tổng doanh thu",
          value: numeral(totalRevenue).format("0,0") + " VNĐ",
        },
        { label: "Tổng số lượt thuê", value: totalHires },
        {
          label: "Doanh thu trung bình/gia sư",
          value: numeral(averageRevenuePerTutor).format("0,0") + " VNĐ",
        },
        {
          label: "Số lượt thuê trung bình/gia sư",
          value: numeral(averageHiresPerTutor).format("0.0"),
        },
      ];

      // Generate period text based on selected period type and value
      const getPeriodText = () => {
        const now = new Date();
        switch (periodType) {
          case "DAY": {
            const dayDate = new Date(now);
            dayDate.setDate(dayDate.getDate() - periodValue + 1);
            return `${periodValue} ngày gần nhất (${dayDate.toLocaleDateString(
              "vi-VN"
            )} - ${now.toLocaleDateString("vi-VN")})`;
          }
          case "WEEK":
            return `${periodValue} tuần gần nhất`;
          case "MONTH":
            return `${periodValue} tháng gần nhất`;
          case "YEAR":
            return `${periodValue} năm gần nhất`;
          default:
            return "Tất cả thời gian";
        }
      };

      await exportToExcel({
        data: exportData,
        filename: `thong-ke-doanh-thu-gia-su-${new Date()
          .toISOString()
          .slice(0, 10)}`,
        title: "THỐNG KÊ DOANH THU GIA SƯ",
        period: getPeriodText(),
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
  }, [data, currentPage, itemsPerPage, periodType, periodValue]);

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
        title: "Mã gia sư",
        dataKey: "userId",
        sortKey: "userId",
        // Tạm thời comment sort để test
        sortable: false,
        renderCell: (value) => value || "N/A",
      },
      {
        title: "Tên gia sư",
        dataKey: "fullname",
        sortKey: "fullname",
        // Tạm thời comment sort để test
        sortable: false,
        renderCell: (value) => value || "N/A",
      },
      {
        title: "Tổng số lượt được thuê",
        dataKey: "totalHire",
        sortKey: "totalHire",
        // Tạm thời comment sort để test
        sortable: false,
        renderCell: (value) => (value || 0).toLocaleString("vi-VN"),
      },
      {
        title: "Tổng doanh thu của gia sư",
        dataKey: "totalRevenueWithTime",
        sortKey: "totalRevenueWithTime",
        // Tạm thời comment sort để test
        sortable: false,
        renderCell: (value) => `${(value || 0).toLocaleString("vi-VN")} Xu`,
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
            appliedSearchField === "totalHire" ||
            appliedSearchField === "totalRevenueWithTime"
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
            { key: "totalHire", operator: "equal" },
            { key: "totalRevenueWithTime", operator: "equal" },
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
        periodType,
        periodValue,
        filter: JSON.stringify(finalFilterConditions),
        // Tạm thời comment sort để test
        // sort: JSON.stringify([
        //   { key: sortConfig.key, type: sortConfig.direction.toUpperCase() },
        // ]),
      };

      const responsePayload = await Api({
        endpoint: `manage-payment/search-with-time-for-tutor-revenue`,
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

          // Calculate total revenue from items
          const totalRevenueCalculated = responseInnerData.items.reduce(
            (sum, item) => sum + (item.totalRevenueWithTime || 0),
            0
          );
          setTotalRevenue(totalRevenueCalculated);
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
        "Có lỗi xảy ra khi tải dữ liệu thống kê doanh thu gia sư.";
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
  // Clear search when Enter is pressed (reserved for future use)
  // const handleSearchKeyPress = (event) => {
  //   if (event.key === "Enter") {
  //     handleApplyFiltersAndSearch();
  //   }
  // };

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
            Thống kê doanh thu gia sư
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
                disabled={isLoading}
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
                Giá trị:
              </label>
              <input
                id="periodValueInput"
                type="number"
                min="1"
                value={periodValue}
                onChange={handlePeriodValueChange}
                className="admin-search-input"
                style={{ width: "80px" }}
                disabled={isLoading}
              />
            </div>
            {/* Select chọn cột tìm kiếm */}
            <div className="filter-control">
              <select
                id="searchFieldSelectTutorRevenue"
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
            />{" "}
            <button
              className="refresh-button"
              onClick={handleApplyFiltersAndSearch}
              title="Tìm kiếm"
              aria-label="Tìm kiếm"
              disabled={isLoading}
            >
              {" "}
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
                <strong style={{ color: "#495057" }}>Tổng doanh thu:</strong>
                <div
                  style={{
                    fontSize: "24px",
                    color: "#28a745",
                    marginTop: "5px",
                  }}
                >
                  {totalRevenue.toLocaleString("vi-VN")} Xu
                </div>
              </div>
            </div>
          </div>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}{" "}
        <Table
          columns={columns}
          data={data}
          totalItems={totalItems}
          pageCount={pageCount}
          onPageChange={handlePageClick}
          forcePage={currentPage}
          // Tạm thời comment sort để test
          // onSort={handleSort}
          // currentSortConfig={sortConfig}
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
      titlePage="Thống kê doanh thu gia sư"
      pathPage={currentPath}
      childrenMiddleContentLower={childrenMiddleContentLower}
    />
  );
};

export default TutorRevenueStatisticsPage;
