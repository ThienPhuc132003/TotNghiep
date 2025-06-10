// Tutor Revenue Dashboard - Clean version to avoid naming conflicts
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
  return placeholders[selectedField] || placeholders.all;
};

// Period type options
const PERIOD_TYPES = [
  { value: "DAY", label: "Ngày" },
  { value: "WEEK", label: "Tuần" },
  { value: "MONTH", label: "Tháng" },
  { value: "YEAR", label: "Năm" },
];

const TutorRevenueDashboard = () => {
  // Redux selectors
  const userProfile = useSelector((state) => state.user.userProfile);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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
    if (!isAuthenticated || !userProfile) return false;

    // Check if user has roles array
    if (userProfile.roles && Array.isArray(userProfile.roles)) {
      return userProfile.roles.some(
        (role) =>
          role.name === "TUTOR" ||
          role.name === "Tutor" ||
          role.name?.toLowerCase() === "tutor"
      );
    }

    // Fallback to roleId check
    if (userProfile.roleId) {
      return String(userProfile.roleId).toUpperCase() === "TUTOR";
    }

    return false;
  }, [isAuthenticated, userProfile]);

  // Get tutor ID
  const tutorId = useMemo(() => {
    if (!userProfile) return null;

    // Try different possible ID fields
    return (
      userProfile.id || userProfile.userId || userProfile.userProfile?.userId
    );
  }, [userProfile]);

  // Debug logging for troubleshooting
  useEffect(() => {
    console.log("🔍 TutorRevenueDashboard Debug:", {
      isAuthenticated,
      userProfile,
      isTutor,
      tutorId,
      roles: userProfile?.roles,
      roleId: userProfile?.roleId,
    });
  }, [isAuthenticated, userProfile, isTutor, tutorId]);

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

  const handleSearch = () => {
    setAppliedSearchInput(searchInput);
    setAppliedSearchField(selectedSearchField);
    setCurrentPage(0);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setAppliedSearchInput("");
    setSelectedSearchField("all");
    setAppliedSearchField("all");
    setCurrentPage(0);
  };

  const handleExportData = useCallback(() => {
    if (!data || data.length === 0) {
      toast.warning("Không có dữ liệu để xuất");
      return;
    }

    try {
      const exportData = data.map((item, index) => ({
        STT: index + 1,
        "Tên học sinh": getSafeNestedValue(item, "studentName"),
        "Số tiền": numeral(item.amount || 0).format("0,0") + " VNĐ",
        "Trạng thái": getSafeNestedValue(item, "status"),
        "Mô tả": getSafeNestedValue(item, "description"),
        "Ngày tạo": getSafeNestedValue(item, "createdAt")
          ? new Date(item.createdAt).toLocaleDateString("vi-VN")
          : "N/A",
      }));

      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const filename = `thong-ke-doanh-thu-gia-su-${timestamp}.xlsx`;

      exportToExcel(exportData, filename);
      toast.success("Xuất dữ liệu thành công!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Có lỗi xảy ra khi xuất dữ liệu");
    }
  }, [data]);

  // Pagination
  const paginatedData = useMemo(() => {
    return data.slice(
      currentPage * itemsPerPage,
      (currentPage + 1) * itemsPerPage
    );
  }, [data, currentPage, itemsPerPage]);

  // Data fetching
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
      toast.error("Không thể tải dữ liệu doanh thu");
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

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
  }, [resetState, handleExportData]);

  // Early return for unauthorized access
  if (!isTutor) {
    return (
      <div className="admin-content-container">
        <Alert severity="warning" sx={{ margin: 2 }}>
          <div>
            <h3>Truy cập bị từ chối</h3>
            <p>Trang này chỉ dành cho gia sư.</p>
          </div>
        </Alert>
      </div>
    );
  }

  // Table configuration
  const tableConfig = {
    title: "Thống kê Doanh thu Cá nhân",
    columns: [
      {
        key: "index",
        title: "STT",
        width: "60px",
        render: (_, __, index) => currentPage * itemsPerPage + index + 1,
      },
      {
        key: "studentName",
        title: "Tên học sinh",
        render: (value) =>
          getSafeNestedValue({ studentName: value }, "studentName"),
      },
      {
        key: "amount",
        title: "Số tiền",
        render: (value) => numeral(value || 0).format("0,0") + " VNĐ",
      },
      {
        key: "status",
        title: "Trạng thái",
        render: (value) => getSafeNestedValue({ status: value }, "status"),
      },
      {
        key: "description",
        title: "Mô tả",
        render: (value) =>
          getSafeNestedValue({ description: value }, "description"),
      },
      {
        key: "createdAt",
        title: "Ngày tạo",
        render: (value) =>
          value ? new Date(value).toLocaleDateString("vi-VN") : "N/A",
      },
    ],
    data: paginatedData,
    totalItems,
    pageCount,
    currentPage,
    itemsPerPage,
    onPageClick: handlePageClick,
    onItemsPerPageChange: handleItemsPerPageChange,
    isLoading,
  };
  return (
    <div className="admin-content-container">
      <ToastContainer />

      {/* Breadcrumb */}
      <div className="admin-breadcrumb">
        <span>{currentPath}</span>
      </div>

      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">📊 Thống kê Doanh thu Cá nhân</h1>
        <div className="admin-page-actions">
          <button
            onClick={handleExportData}
            className="admin-export-btn"
            disabled={isLoading || !data.length}
          >
            📤 Xuất Excel
          </button>
          <button
            onClick={() => window.location.reload()}
            className="admin-refresh-btn"
            disabled={isLoading}
          >
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="admin-stats-container">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">💰</div>
          <div className="admin-stat-content">
            <h3>Tổng doanh thu</h3>
            <p className="admin-stat-number">
              {numeral(totalRevenue).format("0,0")} VNĐ
            </p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">📝</div>
          <div className="admin-stat-content">
            <h3>Tổng giao dịch</h3>
            <p className="admin-stat-number">{totalItems}</p>
          </div>
        </div>
      </div>

      {/* Period Filter */}
      <div className="admin-filter-section">
        <div className="admin-filter-group">
          <label>Loại thời gian:</label>
          <select
            value={periodType}
            onChange={handlePeriodTypeChange}
            className="admin-select"
          >
            {PERIOD_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-filter-group">
          <label>Giá trị:</label>
          <input
            type="number"
            min="1"
            value={periodValue}
            onChange={handlePeriodValueChange}
            className="admin-input"
          />
        </div>
      </div>

      {/* Search Section */}
      <div className="admin-search-section">
        <SearchBar
          searchInput={searchInput}
          onSearchInputChange={handleSearchInputChange}
          selectedSearchField={selectedSearchField}
          onSearchFieldChange={handleSearchFieldChange}
          searchFieldOptions={searchFieldOptions}
          onSearch={handleSearch}
          onClearSearch={handleClearSearch}
          placeholder={getSearchPlaceholder(selectedSearchField)}
          disabled={isLoading}
        />
      </div>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ margin: 2 }}>
          {error}
        </Alert>
      )}

      {/* Data Table */}
      <div className="admin-table-section">
        <Table config={tableConfig} />
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="admin-help-section">
        <small>
          💡 <strong>Phím tắt:</strong> Ctrl+F (Tìm kiếm), Ctrl+E (Xuất Excel),
          Ctrl+R (Đặt lại)
        </small>
      </div>
    </div>
  );
};

export default TutorRevenueDashboard;
