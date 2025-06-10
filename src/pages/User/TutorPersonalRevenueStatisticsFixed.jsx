// Tutor Personal Revenue Statistics - Professional Admin-style Layout
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { Alert } from "@mui/material";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import Table from "../../components/Table";
import SearchBar from "../../components/SearchBar";
import { exportToExcel } from "../../utils/excelExport";
import numeral from "numeral";
import "numeral/locales/vi";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/css/Admin/ListOfAdmin.style.css";

// Set Vietnamese locale for numeral
numeral.locale("vi");

// Helper functions
const getSafeNestedValue = (obj, path, defaultValue = "N/A") => {
  if (!obj || !path) return defaultValue;
  const value = path.split(".").reduce((acc, part) => acc && acc[part], obj);
  return value !== undefined && value !== null ? value : defaultValue;
};

const getSearchPlaceholder = (selectedField) => {
  const placeholders = {
    all: "Tìm kiếm trong tất cả các trường...",
    studentName: "Nhập tên học sinh...",
    amount: "Nhập số tiền...",
    status: "Nhập trạng thái...",
    description: "Nhập mô tả...",
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

const TutorPersonalRevenueStatistics = () => {
  // Redux selectors
  const userProfile = useSelector((state) => state.user.userProfile);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [periodType, setPeriodType] = useState("MONTH");
  const [periodValue, setPeriodValue] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [selectedSearchField, setSelectedSearchField] = useState("all");
  const [appliedSearchInput, setAppliedSearchInput] = useState("");
  const [appliedSearchField, setAppliedSearchField] = useState("all");
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Current path
  const currentPath = "Tài khoản > Hồ sơ > Thống kê doanh thu";

  // Search field options
  const searchFieldOptions = [
    { value: "all", label: "Tất cả trường" },
    { value: "studentName", label: "Tên học sinh" },
    { value: "amount", label: "Số tiền" },
    { value: "status", label: "Trạng thái" },
    { value: "description", label: "Mô tả" },
  ];

  // Check if user is a tutor
  const isTutor = useMemo(() => {
    return (
      isAuthenticated &&
      userProfile?.roleId &&
      String(userProfile.roleId).toUpperCase() === "TUTOR"
    );
  }, [isAuthenticated, userProfile]);

  // Get tutor ID
  const tutorId = useMemo(() => {
    return userProfile?.userProfile?.userId;
  }, [userProfile]);

  // Reset state
  const resetState = useCallback(() => {
    setCurrentPage(0);
    setItemsPerPage(10);
  }, []);

  // Event Handlers
  const handlePageClick = (event) => {
    if (typeof event.selected === "number") setCurrentPage(event.selected);
  };

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

  // Export function
  const handleExportData = useCallback(async () => {
    const toastId = toast.loading("Đang xuất dữ liệu...");
    try {
      const exportData = data.map((item, index) => ({
        STT: currentPage * itemsPerPage + index + 1,
        "Tên học sinh": getSafeNestedValue(item, "studentName", "N/A"),
        "Số tiền": `${(
          getSafeNestedValue(item, "amount", 0) || 0
        ).toLocaleString("vi-VN")} Xu`,
        "Trạng thái": getSafeNestedValue(item, "status", "N/A"),
        "Mô tả": getSafeNestedValue(item, "description", "N/A"),
        "Ngày tạo": getSafeNestedValue(item, "createdAt", "N/A"),
      }));

      await exportToExcel(exportData, "DoanhthuCaNhan", [
        "STT",
        "Tên học sinh",
        "Số tiền",
        "Trạng thái",
        "Mô tả",
        "Ngày tạo",
      ]);

      toast.update(toastId, {
        render: "Xuất dữ liệu thành công!",
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
  }, [data, currentPage, itemsPerPage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey && event.key === "r") {
        event.preventDefault();
        resetState();
        return;
      }
      if (event.ctrlKey && event.key === "e") {
        event.preventDefault();
        handleExportData();
        return;
      }
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

  // Columns Definition
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
        title: "Tên học sinh",
        dataKey: "studentName",
        sortKey: "studentName",
        sortable: false,
        renderCell: (value) => value || "N/A",
      },
      {
        title: "Số tiền",
        dataKey: "amount",
        sortKey: "amount",
        sortable: false,
        renderCell: (value) => `${(value || 0).toLocaleString("vi-VN")} Xu`,
      },
      {
        title: "Trạng thái",
        dataKey: "status",
        sortKey: "status",
        sortable: false,
        renderCell: (value) => value || "Hoàn thành",
      },
      {
        title: "Mô tả",
        dataKey: "description",
        sortKey: "description",
        sortable: false,
        renderCell: (value) => value || "Thanh toán học phí",
      },
      {
        title: "Ngày tạo",
        dataKey: "createdAt",
        sortKey: "createdAt",
        sortable: false,
        renderCell: (value) => {
          if (!value) return "N/A";
          try {
            return new Date(value).toLocaleDateString("vi-VN");
          } catch {
            return "N/A";
          }
        },
      },
    ],
    [currentPage, itemsPerPage]
  );

  // Fetch Data
  const fetchData = useCallback(async () => {
    if (!isTutor || !tutorId) {
      setError("Unauthorized access - only tutors can view this page");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const finalFilterConditions = [];

      // Add search filter if search value is provided
      if (appliedSearchInput && appliedSearchInput.trim()) {
        const searchValue = appliedSearchInput.trim();

        if (appliedSearchField && appliedSearchField !== "all") {
          let operator = "like";
          if (appliedSearchField === "amount") {
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
            { key: "studentName", operator: "like" },
            { key: "amount", operator: "equal" },
            { key: "status", operator: "like" },
            { key: "description", operator: "like" },
          ];

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
        rpp: itemsPerPage,
        tutorId: tutorId,
        timeType: periodType.toLowerCase(),
        periodValue: periodValue,
        filter: JSON.stringify(finalFilterConditions),
      };

      const responsePayload = await Api({
        endpoint: `manage-payment/search-with-time-by-tutor`,
        method: METHOD_TYPE.GET,
        query: query,
        requireToken: true,
      });

      if (responsePayload && responsePayload.data) {
        const payments = responsePayload.data || [];
        const total = responsePayload.totalItems || 0;
        const calculatedPageCount = Math.ceil(total / itemsPerPage);

        setData(payments);
        setTotalItems(total);
        setPageCount(calculatedPageCount);

        // Calculate total revenue
        const revenue = payments.reduce(
          (sum, payment) => sum + (payment.amount || 0),
          0
        );
        setTotalRevenue(revenue);
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      setError("Failed to load revenue data. Please try again.");
      toast.error("Failed to load revenue data");
    } finally {
      setIsLoading(false);
    }
  }, [
    isTutor,
    tutorId,
    currentPage,
    itemsPerPage,
    periodType,
    periodValue,
    appliedSearchInput,
    appliedSearchField,
  ]);

  // Load data on component mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Render unauthorized access
  if (!isAuthenticated) {
    return (
      <div className="admin-container">
        <div className="error-message">
          <Alert severity="error">
            <h2>Unauthorized Access</h2>
            <p>Please log in to view your revenue statistics.</p>
          </Alert>
        </div>
      </div>
    );
  }

  if (!isTutor) {
    return (
      <div className="admin-container">
        <div className="error-message">
          <Alert severity="error">
            <h2>Access Denied</h2>
            <p>This page is only available for tutors.</p>
          </Alert>
        </div>
      </div>
    );
  }

  // Main component content
  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        {/* Filter and Search Controls */}
        <div className="admin-controls">
          <div className="admin-filters">
            {/* Period Type Filter */}
            <div className="admin-filter-group">
              <label htmlFor="periodType">Loại thời gian:</label>
              <select
                id="periodType"
                value={periodType}
                onChange={handlePeriodTypeChange}
                disabled={isLoading}
                className="admin-select"
              >
                {periodTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Period Value Filter */}
            <div className="admin-filter-group">
              <label htmlFor="periodValue">Giá trị:</label>
              <input
                type="number"
                id="periodValue"
                value={periodValue}
                onChange={handlePeriodValueChange}
                disabled={isLoading}
                min="1"
                className="admin-input"
              />
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportData}
              disabled={isLoading || data.length === 0}
              className="admin-button admin-button-export"
            >
              📥 Xuất Excel (Ctrl+E)
            </button>

            {/* Refresh Button */}
            <button
              onClick={resetState}
              disabled={isLoading}
              className="admin-button admin-button-refresh"
            >
              🔄 Làm mới (Ctrl+R)
            </button>
          </div>

          {/* Search Bar */}
          <SearchBar
            searchInput={searchInput}
            selectedSearchField={selectedSearchField}
            searchFieldOptions={searchFieldOptions}
            onSearchInputChange={handleSearchInputChange}
            onSearchFieldChange={handleSearchFieldChange}
            onApplyFiltersAndSearch={handleApplyFiltersAndSearch}
            placeholder={getSearchPlaceholder(selectedSearchField)}
            disabled={isLoading}
            className="admin-search-input"
          />
        </div>

        {/* Statistics Summary */}
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
                <strong style={{ color: "#495057" }}>Tổng số giao dịch:</strong>
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

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Data Table */}
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

        {/* Footer Info */}
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
      </div>
      <ToastContainer />
    </>
  );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-breadcrumb">
          <span>{currentPath}</span>
        </div>
        <h1 className="admin-title">📊 Thống kê doanh thu cá nhân</h1>
        <p className="admin-subtitle">Quản lý và theo dõi doanh thu của bạn</p>
        <div
          className="temp-warning"
          style={{
            background: "#fff3cd",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ffeaa7",
            marginTop: "10px",
          }}
        >
          ⚠️ Biểu đồ tạm thời bị vô hiệu hóa do thiếu thư viện react-chartjs-2
        </div>
      </div>
      {childrenMiddleContentLower}
    </div>
  );
};

export default TutorPersonalRevenueStatistics;
