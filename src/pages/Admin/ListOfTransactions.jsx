import React, { useCallback, useEffect, useState, useMemo } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css"; // Sử dụng lại CSS
import Table from "../../components/Table";
import SearchBar from "../../components/SearchBar";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { Alert } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import numeral from "numeral";
import "numeral/locales/vi";
import { format, parseISO, isValid } from "date-fns"; // Thêm parseISO, isValid

// Helper định dạng ngày
const safeFormatDate = (dateString, formatString = "dd/MM/yyyy HH:mm") => {
  if (!dateString) return "N/A";
  try {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, formatString) : "Ngày không hợp lệ";
  } catch (e) {
    return "Lỗi ngày";
  }
};

// Helper định dạng tiền tệ VND
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(Number(amount)))
    return "N/A";
  numeral.locale("vi");
  return numeral(amount).format("0,0 đ");
};

// Helper định dạng số coin
const formatCoin = (amount) => {
  if (amount === null || amount === undefined || isNaN(Number(amount)))
    return "N/A";
  numeral.locale("vi");
  return numeral(amount).format("0,0"); // Không có "đ"
};

// Helper lấy giá trị lồng nhau an toàn
const getSafeNestedValue = (obj, path, defaultValue = "N/A") => {
  if (!obj || !path) return defaultValue;
  const value = path.split(".").reduce((acc, part) => acc && acc[part], obj);
  return value !== undefined && value !== null ? value : defaultValue;
};

// Searchable Columns for Transactions
const searchableTransactionColumnOptions = [
  { value: "customerFullname", label: "Tên người dùng" },
  { value: "customerEmail", label: "Email" },
  { value: "customerPhone", label: "Số điện thoại" },
  { value: "payment.payType", label: "Phương thức TT" },
  {
    value: "items.valueConfig.price",
    label: "Số tiền",
    placeholderSuffix: " (số)",
  }, // Tìm theo giá trị gốc
  {
    value: "items.valueConfig.coinConfig",
    label: "Số coin",
    placeholderSuffix: " (số)",
  }, // Tìm theo giá trị gốc
  { value: "createdAt", label: "Ngày tạo", placeholderSuffix: " (YYYY-MM-DD)" },
  // { value: "id", label: "Mã giao dịch" }, // Nếu có ID giao dịch và muốn tìm
];

// Status Filter Options for Transactions
const transactionStatusFilterOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "PENDING", label: "Đang chờ" },
  { value: "FAILED", label: "Thất bại" },
];

const ListOfTransactionsPage = () => {
  // --- States ---
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [searchInput, setSearchInput] = useState("");
  const [selectedSearchField, setSelectedSearchField] = useState(
    searchableTransactionColumnOptions[0].value
  );
  const [appliedSearchInput, setAppliedSearchInput] = useState("");
  const [appliedSearchField, setAppliedSearchField] = useState(
    searchableTransactionColumnOptions[0].value
  );
  const [selectedStatusFilter, setSelectedStatusFilter] = useState(""); // State cho filter trạng thái

  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentPath = "/lich-su-giao-dich";

  // --- Columns Definition ---
  const columns = useMemo(
    () => [
      {
        title: "STT",
        dataKey: "index",
        sortable: false,
        renderCell: (_, __, rowIndex) =>
          currentPage * itemsPerPage + rowIndex + 1,
      },
      {
        title: "Tên",
        dataKey: "customerFullname",
        sortKey: "customerFullname",
        sortable: true,
        renderCell: (v) => v || "...",
      },
      {
        title: "Email",
        dataKey: "customerEmail",
        sortKey: "customerEmail",
        sortable: true,
        renderCell: (v) => v || "...",
      },
      {
        title: "Số điện thoại",
        dataKey: "customerPhone",
        sortKey: "customerPhone",
        sortable: true,
        renderCell: (v) => v || "...",
      },
      {
        title: "Phương thức",
        dataKey: "payment.payType",
        sortKey: "payment.payType",
        sortable: true,
        renderCell: (_, row) =>
          getSafeNestedValue(row, "payment.payType", "..."),
      },
      {
        title: "Số tiền",
        dataKey: "items",
        sortKey: "items.valueConfig.price",
        sortable: true,
        renderCell: (items) => {
          if (Array.isArray(items) && items.length > 0) {
            const price = getSafeNestedValue(
              items[0],
              "valueConfig.price",
              null
            );
            return formatCurrency(price);
          }
          return formatCurrency(null);
        },
      },
      {
        title: "Số coin",
        dataKey: "items",
        sortKey: "items.valueConfig.coinConfig",
        sortable: true,
        renderCell: (items) => {
          if (Array.isArray(items) && items.length > 0) {
            return formatCoin(
              getSafeNestedValue(items[0], "valueConfig.coinConfig", null)
            ); // Dùng formatCoin
          }
          return "...";
        },
      },
      {
        title: "Trạng thái",
        dataKey: "status",
        sortable: true,
        renderCell: (v) =>
          v === "PAID" ? (
            <span className="status status-paid">Đã thanh toán</span>
          ) : v === "PENDING" ? (
            <span className="status status-pending">Đang chờ</span>
          ) : v === "FAILED" ? (
            <span className="status status-failed">Thất bại</span>
          ) : (
            <span className="status status-unknown">{v || "?"}</span>
          ),
      },
      {
        title: "Ngày tạo",
        dataKey: "createdAt",
        sortable: true,
        renderCell: (v) => safeFormatDate(v),
      },
    ],
    [currentPage, itemsPerPage]
  );

  // --- Reset State ---
  const resetState = useCallback(() => {
    setSearchInput("");
    setSelectedSearchField(searchableTransactionColumnOptions[0].value);
    setAppliedSearchInput("");
    setAppliedSearchField(searchableTransactionColumnOptions[0].value);
    setSelectedStatusFilter("");
    setSortConfig({ key: "createdAt", direction: "desc" });
    setCurrentPage(0);
  }, []);

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const finalFilterConditions = [];
      if (appliedSearchInput && appliedSearchField) {
        // Backend API `payment/search` cần hỗ trợ tìm kiếm theo `key` đơn lẻ
        // và xử lý `operator: "equal"` cho các trường số/coin.
        const isNumericSearch =
          appliedSearchField.toLowerCase().includes("price") ||
          appliedSearchField.toLowerCase().includes("coin");
        finalFilterConditions.push({
          key: appliedSearchField,
          operator: isNumericSearch ? "equal" : "like",
          value: appliedSearchInput,
        });
      }
      if (selectedStatusFilter) {
        finalFilterConditions.push({
          key: "status",
          operator: "equal",
          value: selectedStatusFilter,
        });
      }

      const query = {
        rpp: itemsPerPage,
        page: currentPage + 1,
        ...(finalFilterConditions.length > 0 && {
          filter: JSON.stringify(finalFilterConditions),
        }),
        sort: JSON.stringify([
          { key: sortConfig.key, type: sortConfig.direction.toUpperCase() },
        ]),
      };

      const responsePayload = await Api({
        endpoint: `payment/search`,
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
        errorCatch.message || "Có lỗi xảy ra khi tải dữ liệu giao dịch.";
      setError(errorMessage);
      setData([]);
      setTotalItems(0);
      setPageCount(1);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    sortConfig,
    appliedSearchInput,
    appliedSearchField,
    selectedStatusFilter,
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
  const handleSearchInputChange = (value) => {
    setSearchInput(value);
  };
  const handleSearchFieldChange = (event) => {
    setSelectedSearchField(event.target.value);
  };
  const handleStatusFilterChange = (event) => {
    setSelectedStatusFilter(event.target.value);
    setCurrentPage(0);
  };

  const handleApplySearchAndFilters = () => {
    if (searchInput.trim() || selectedSearchField !== appliedSearchField) {
      if (searchInput.trim()) {
        setAppliedSearchField(selectedSearchField);
        setAppliedSearchInput(searchInput);
      } else {
        setAppliedSearchField(selectedSearchField);
        setAppliedSearchInput("");
      }
    } else if (!searchInput.trim() && appliedSearchInput) {
      setAppliedSearchInput("");
    }
    setCurrentPage(0);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") handleApplySearchAndFilters();
  };

  // --- JSX Render ---
  const currentSearchFieldConfig = useMemo(
    () =>
      searchableTransactionColumnOptions.find(
        (opt) => opt.value === selectedSearchField
      ),
    [selectedSearchField]
  );
  const searchPlaceholder = currentSearchFieldConfig
    ? `Nhập ${currentSearchFieldConfig.label.toLowerCase()}${
        currentSearchFieldConfig.placeholderSuffix || ""
      }...`
    : "Nhập tìm kiếm...";

  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        <h2 className="admin-list-title">Lịch sử giao dịch</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            {/* Select chọn cột tìm kiếm */}
            <div className="filter-control">
              <select
                id="searchFieldSelectTransaction"
                value={selectedSearchField}
                onChange={handleSearchFieldChange}
                className="status-filter-select"
                aria-label="Chọn trường để tìm kiếm"
              >
                {searchableTransactionColumnOptions.map((option) => (
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
              placeholder={searchPlaceholder}
            />
            {/* Filter Trạng thái */}
            <div className="filter-control">
              <label
                htmlFor="statusFilterTransaction"
                className="filter-label"
                style={{ whiteSpace: "nowrap" }}
              >
                Trạng thái:
              </label>
              <select
                id="statusFilterTransaction"
                value={selectedStatusFilter}
                onChange={handleStatusFilterChange}
                className="status-filter-select"
                aria-label="Lọc theo trạng thái"
              >
                {transactionStatusFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="refresh-button"
              onClick={handleApplySearchAndFilters}
              title="Áp dụng bộ lọc & Tìm kiếm"
              aria-label="Áp dụng bộ lọc và tìm kiếm"
              disabled={isLoading}
            >
              <i className="fa-solid fa-search"></i>
            </button>
            <button
              className="refresh-button"
              onClick={resetState}
              title="Làm mới"
              aria-label="Làm mới"
              disabled={isLoading}
            >
              <i className="fa-solid fa-rotate-left"></i>
            </button>
          </div>
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
          statusKey="status" // Để Table có thể highlight hoặc xử lý logic dựa trên status nếu cần
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
            Không có dữ liệu giao dịch.
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

const ListOfTransactions = React.memo(ListOfTransactionsPage);
export default ListOfTransactions;
