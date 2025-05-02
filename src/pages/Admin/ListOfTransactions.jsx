import React, { useCallback, useEffect, useState, useMemo } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css"; // Sử dụng lại CSS nếu phù hợp
import Table from "../../components/Table";
import SearchBar from "../../components/SearchBar";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { Alert } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import numeral from "numeral";
import "numeral/locales/vi";

// Helper định dạng tiền tệ VND
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "N/A";
  }
  numeral.locale("vi");
  return numeral(amount).format("0,0 đ");
};

// Helper lấy giá trị lồng nhau an toàn
const getSafeNestedValue = (obj, path, defaultValue = "N/A") => {
  const value = path.split(".").reduce((acc, part) => acc && acc[part], obj);
  return value !== undefined && value !== null ? value : defaultValue;
};

const ListOfTransactionsPage = () => {

  // --- States ---
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0); // State này đã có
  const [pageCount, setPageCount] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0); // currentPage là index (0-based)
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // State sortConfig đã có, dùng để truyền xuống Table
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
        sortable: true,
        renderCell: (v) => v || "...",
      },
      {
        title: "Email",
        dataKey: "customerEmail",
        sortable: true,
        renderCell: (v) => v || "...",
      },
      {
        title: "Số điện thoại",
        dataKey: "customerPhone",
        sortable: false,
        renderCell: (v) => v || "...",
      },
      {
        title: "Phương thức",
        dataKey: "payment.payType",
        sortKey: "payment.payType", // Backend cần hỗ trợ sort key này
        sortable: true,
        renderCell: (v, row) =>
          getSafeNestedValue(row, "payment.payType", "..."), // Truyền cả row vào getSafeNestedValue
      },
      {
        title: "Số tiền",
        dataKey: "items",
        sortKey: "items.valueConfig.price", // Key backend cần hỗ trợ để sort
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
        sortKey: "items.valueConfig.coinConfig", // Key backend cần hỗ trợ để sort
        sortable: true,
        renderCell: (items) => {
          if (Array.isArray(items) && items.length > 0) {
            return getSafeNestedValue(
              items[0],
              "valueConfig.coinConfig",
              "..."
            );
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
        renderCell: (v) => (v ? new Date(v).toLocaleString("vi-VN") : "N/A"), // Hiển thị cả giờ phút
      },
    ],
    [currentPage, itemsPerPage] // Phụ thuộc vào currentPage và itemsPerPage để tính STT
  );

  // --- Reset State ---
  const resetState = () => {
    setSearchInput("");
    setSearchQuery("");
    setSortConfig({ key: "createdAt", direction: "desc" });
    setCurrentPage(0);
  };

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const finalFilterConditions = [];
      if (searchQuery) {
        finalFilterConditions.push({
          key: "customerFullname,customerEmail,customerPhone,payment.payType,status", // Gộp các trường tìm kiếm
          operator: "like",
          value: searchQuery,
        });
      }

      const query = {
        rpp: itemsPerPage,
        page: currentPage + 1, // API thường dùng page 1-based
        ...(finalFilterConditions.length > 0 && {
          filter: JSON.stringify(finalFilterConditions),
        }),
        // Sử dụng key từ sortConfig (đã được cập nhật bởi handleSort)
        sort: JSON.stringify([
          { key: sortConfig.key, type: sortConfig.direction.toUpperCase() },
        ]),
      };

      console.log("--- Preparing to call API (Transaction List) ---");
      console.log("Query Object:", query);
      console.log("--------------------------------------------------");

      const responsePayload = await Api({
        endpoint: `payment/search`,
        method: METHOD_TYPE.GET,
        query: query,
      });
      console.log("API Response Payload (Processed):", responsePayload);

      if (responsePayload && responsePayload.success) {
        const responseInnerData = responsePayload.data;
        if (
          responseInnerData &&
          Array.isArray(responseInnerData.items) &&
          typeof responseInnerData.total === "number"
        ) {
          setData(responseInnerData.items);
          setTotalItems(responseInnerData.total); // Cập nhật totalItems từ API
          setPageCount(Math.ceil(responseInnerData.total / itemsPerPage));
        } else {
          console.error("Unexpected data structure:", responsePayload);
          throw new Error("Lỗi xử lý dữ liệu từ API.");
        }
      } else {
        throw new Error(
          responsePayload?.message || "Lỗi không xác định từ API."
        );
      }
    } catch (error) {
      console.error("Fetch data error caught:", error.message || error);
      setError(error.message || "Có lỗi xảy ra khi tải dữ liệu giao dịch.");
      setData([]);
      setTotalItems(0); // Reset totalItems khi có lỗi
      setPageCount(1);
      toast.error(error.message || "Tải dữ liệu thất bại!");
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    sortConfig, // fetchData phụ thuộc vào sortConfig
    searchQuery,
    // Bỏ columns dependency nếu không dùng sortKey trực tiếp ở đây nữa
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Dependencies đã được liệt kê trong useCallback

  // --- Handlers ---
  const handlePageClick = (event) => {
    // event từ ReactPaginate là { selected: pageIndex }
    if (typeof event.selected === "number") {
      setCurrentPage(event.selected); // Cập nhật currentPage (0-based index)
    }
  };

  // Handler cập nhật sortConfig state khi click vào header sortable
  const handleSort = (sortKey) => {
    setSortConfig((prev) => ({
      key: sortKey, // Key được truyền từ Table (đã ưu tiên sortKey)
      direction:
        prev.key === sortKey && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(0); // Reset về trang đầu khi sắp xếp
  };

  const handleItemsPerPageChange = (newPageSize) => {
    setItemsPerPage(newPageSize);
    setCurrentPage(0);
  };

  const handleSearchInputChange = (value) => {
    setSearchInput(value);
  };

  const handleApplySearch = () => {
    setCurrentPage(0);
    setSearchQuery(searchInput);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleApplySearch();
    }
  };

  // --- JSX Render ---
  const childrenMiddleContentLower = (
    <>
      <div className="admin-content">
        <h2 className="admin-list-title">Lịch sử giao dịch</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            <SearchBar
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchKeyPress}
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
              placeholder="Tìm kiếm tên, email, SĐT, phương thức, trạng thái..."
            />
            <button
              className="refresh-button"
              onClick={handleApplySearch}
              title="Tìm kiếm"
              aria-label="Tìm kiếm"
            >
              <i className="fa-solid fa-search"></i>
            </button>
            <button
              className="refresh-button"
              onClick={resetState}
              title="Làm mới"
              aria-label="Làm mới"
            >
              <i className="fa-solid fa-rotate-left"></i>
            </button>
          </div>
          {/* Không có nút Add */}
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Table
          columns={columns}
          data={data}
          totalItems={totalItems} // Truyền totalItems xuống Table
          pageCount={pageCount}
          onPageChange={handlePageClick}
          forcePage={currentPage} // forcePage là index (0-based)
          onSort={handleSort} // Truyền handler sort của cha
          currentSortConfig={sortConfig} // Truyền state sort hiện tại của cha
          loading={isLoading}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          statusKey="status"
          // Không cần các props action khác: onView, onEdit, onDelete, onLock, showLock
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
