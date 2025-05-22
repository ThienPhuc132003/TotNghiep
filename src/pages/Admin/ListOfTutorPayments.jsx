/* eslint-disable no-undef */
import React, { useCallback, useEffect, useState, useMemo } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css"; // Sử dụng lại CSS chung
import Table from "../../components/Table";
import SearchBar from "../../components/SearchBar";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { Alert } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import numeral from "numeral";
import "numeral/locales/vi";
import { format, parseISO, isValid } from "date-fns";

// Helper định dạng ngày
const formatDate = (dateString, formatString = "dd/MM/yyyy HH:mm") => {
  if (!dateString) return "N/A";
  try {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, formatString) : "Ngày không hợp lệ";
  } catch (e) {
    return "Lỗi ngày";
  }
};

// Helper định dạng tiền tệ/coin
const formatCoin = (amount) => {
  if (amount === null || amount === undefined || isNaN(Number(amount)))
    return "N/A";
  numeral.locale("vi");
  return numeral(amount).format("0,0");
};

// Helper lấy giá trị lồng nhau an toàn
const getSafeNestedValue = (obj, path, defaultValue = "N/A") => {
  if (!obj || !path) return defaultValue;
  const value = path.split(".").reduce((acc, part) => acc && acc[part], obj);
  return value !== undefined && value !== null ? value : defaultValue;
};

// Searchable Columns for Tutor Payments
const searchableTutorPaymentColumnOptions = [
  { value: "tutor.fullname", label: "Tên Gia Sư" },
  { value: "user.personalEmail", label: "Email Người Dùng" }, // Giả sử email của người dùng học
  { value: "user.phoneNumber", label: "SĐT Người Dùng" }, // Giả sử SĐT của người dùng học
  {
    value: "coinOfUserPayment",
    label: "Coin Thanh Toán",
    placeholderSuffix: " (số)",
  },
  {
    value: "coinOfTutorReceive",
    label: "Coin Gia Sư Nhận",
    placeholderSuffix: " (số)",
  },
  {
    value: "coinOfWebReceive",
    label: "Coin Web Nhận",
    placeholderSuffix: " (số)",
  }, // <<< THÊM MỚI
  {
    value: "createdAt",
    label: "Ngày Giao Dịch",
    placeholderSuffix: " (YYYY-MM-DD)",
  },
  // { value: "paymentId", label: "Mã Giao Dịch" }, // <<< Cân nhắc thêm nếu paymentId là duy nhất và dễ tìm
];

const ListOfTutorPaymentsPage = () => {
  // --- States ---
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [searchInput, setSearchInput] = useState("");
  const [selectedSearchField, setSelectedSearchField] = useState(
    searchableTutorPaymentColumnOptions[0].value
  );
  const [appliedSearchInput, setAppliedSearchInput] = useState("");
  const [appliedSearchField, setAppliedSearchField] = useState(
    searchableTutorPaymentColumnOptions[0].value
  );

  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentPath = "/quan-ly-thanh-toan-gia-su";

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
        title: "Tên Gia Sư",
        dataKey: "tutor.fullname",
        sortKey: "tutor.fullname",
        sortable: true,
        renderCell: (_, row) =>
          getSafeNestedValue(row, "tutor.fullname", "..."),
      },
      {
        title: "Email Người Dùng",
        dataKey: "user.personalEmail",
        sortKey: "user.personalEmail",
        sortable: true,
        renderCell: (_, row) =>
          getSafeNestedValue(row, "user.personalEmail", "..."),
      },
      {
        title: "SĐT Người Dùng",
        dataKey: "user.phoneNumber",
        sortKey: "user.phoneNumber",
        sortable: true,
        renderCell: (_, row) =>
          getSafeNestedValue(row, "user.phoneNumber", "..."),
      },
      {
        title: "Coin Thanh Toán",
        dataKey: "coinOfUserPayment",
        sortable: true,
        renderCell: formatCoin,
      },
      {
        title: "Coin Gia Sư Nhận",
        dataKey: "coinOfTutorReceive",
        sortable: true,
        renderCell: formatCoin,
      },
      {
        title: "Coin Web Nhận",
        dataKey: "coinOfWebReceive",
        sortable: true,
        renderCell: formatCoin,
      },
      {
        title: "Ngày Giao Dịch",
        dataKey: "createdAt",
        sortable: true,
        renderCell: formatDate,
      },
    ],
    [currentPage, itemsPerPage]
  );

  // --- Reset State ---
  const resetState = useCallback(() => {
    setSearchInput("");
    setSelectedSearchField(searchableTutorPaymentColumnOptions[0].value);
    setAppliedSearchInput("");
    setAppliedSearchField(searchableTutorPaymentColumnOptions[0].value);
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
        finalFilterConditions.push({
          key: appliedSearchField,
          operator:
            appliedSearchField.toLowerCase().includes("coin") ||
            appliedSearchField.toLowerCase().includes("id")
              ? "equal"
              : "like",
          value: appliedSearchInput,
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
        endpoint: `manage-payment/search`, // Đảm bảo endpoint này đúng
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
        errorCatch.message ||
        "Có lỗi xảy ra khi tải dữ liệu thanh toán gia sư.";
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

  const handleApplySearch = () => {
    // Đổi tên hàm cho nhất quán, không cần "AndFilters" vì không có filter khác
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
    if (e.key === "Enter") handleApplySearch();
  };

  // --- JSX Render ---
  const currentSearchFieldConfig = useMemo(
    () =>
      searchableTutorPaymentColumnOptions.find(
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
        <h2 className="admin-list-title">Quản Lý Thanh Toán Gia Sư</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            <div className="filter-control">
              <select
                id="searchFieldSelectTutorPayment"
                value={selectedSearchField}
                onChange={handleSearchFieldChange}
                className="status-filter-select"
                aria-label="Chọn trường để tìm kiếm"
              >
                {searchableTutorPaymentColumnOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {" "}
                    {option.label}{" "}
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
            <button
              className="refresh-button"
              onClick={handleApplySearch}
              title="Tìm kiếm"
              aria-label="Tìm kiếm"
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

const ListOfTutorPayments = React.memo(ListOfTutorPaymentsPage);
export default ListOfTutorPayments;
