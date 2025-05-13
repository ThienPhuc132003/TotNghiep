/* eslint-disable no-undef */
import React, { useCallback, useEffect, useState, useMemo } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css"; // Sử dụng lại CSS chung nếu phù hợp
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

// Helper định dạng ngày (tương tự ListOfAdminPage)
const formatDate = (dateString, formatString = "dd/MM/yyyy HH:mm") => {
  if (!dateString) return "N/A";
  try {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, formatString) : "Ngày không hợp lệ";
  } catch (e) {
    return "Lỗi ngày";
  }
};

// Helper định dạng tiền tệ/coin (tương tự ListOfTransactionsPage)
const formatCoin = (amount) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "N/A";
  }
  numeral.locale("vi"); // Đảm bảo locale được set
  // Bạn có thể tùy chỉnh format "0,0" nếu không muốn hiển thị chữ "đ" cho coin
  return numeral(amount).format("0,0"); // Ví dụ: 1,234
};

// Helper lấy giá trị lồng nhau an toàn (tương tự ListOfAdminPage)
const getSafeNestedValue = (obj, path, defaultValue = "N/A") => {
  const value = path.split(".").reduce((acc, part) => acc && acc[part], obj);
  return value !== undefined && value !== null ? value : defaultValue;
};

const ListOfTutorPaymentsPage = () => {
  // --- States ---
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt", // Sắp xếp mặc định theo ngày tạo
    direction: "desc",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentPath = "/quan-ly-thanh-toan-gia-su"; // Cập nhật đường dẫn

  // --- Columns Definition ---
  const columns = useMemo(
    () => [
      {
        title: "STT",
        dataKey: "stt", // Không phải key từ data, chỉ để định danh cột
        sortable: false,
        renderCell: (_, __, rowIndex) =>
          currentPage * itemsPerPage + rowIndex + 1,
      },
      {
        title: "Tên Gia Sư",
        dataKey: "tutor.fullname", // dataKey để truy cập, sortKey cho API
        sortKey: "tutor.fullname", // Backend cần hỗ trợ sort bằng key này
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
        sortKey: "user.phoneNumber", // Backend có thể cần hỗ trợ sort này
        sortable: true, // Đặt là true nếu backend hỗ trợ sort
        renderCell: (_, row) =>
          getSafeNestedValue(row, "user.phoneNumber", "..."),
      },
      {
        title: "Coin Thanh Toán",
        dataKey: "coinOfUserPayment",
        sortable: true,
        renderCell: (value) => formatCoin(value),
      },
      {
        title: "Coin Gia Sư Nhận",
        dataKey: "coinOfTutorReceive",
        sortable: true,
        renderCell: (value) => formatCoin(value),
      },
      {
        title: "Coin Web Nhận",
        dataKey: "coinOfWebReceive",
        sortable: true,
        renderCell: (value) => formatCoin(value),
      },
      {
        title: "Ngày Giao Dịch",
        dataKey: "createdAt",
        sortable: true,
        renderCell: (value) => formatDate(value), // Sử dụng formatDate đã định nghĩa
      },
    ],
    [currentPage, itemsPerPage] // Dependencies cho STT
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
          // Cập nhật các key tìm kiếm, backend cần hỗ trợ tìm kiếm trên các trường lồng nhau này
          key: "tutor.fullname,user.personalEmail,user.phoneNumber",
          operator: "like",
          value: searchQuery,
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
        endpoint: `manage-payment/search`, // Cập nhật endpoint
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
      setError(
        error.message || "Có lỗi xảy ra khi tải dữ liệu thanh toán gia sư."
      );
      setData([]);
      setTotalItems(0);
      setPageCount(1);
      toast.error(error.message || "Tải dữ liệu thất bại!");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, sortConfig, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    numeral.locale("vi"); // Set locale khi component mount cho numeral
  }, []);

  // --- Handlers ---
  const handlePageClick = (event) => {
    if (typeof event.selected === "number") {
      setCurrentPage(event.selected);
    }
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
        <h2 className="admin-list-title">Quản Lý Thanh Toán Gia Sư</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            <SearchBar
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchKeyPress}
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
              placeholder="Tìm tên gia sư, email/SĐT người dùng..." // Cập nhật placeholder
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
          {/* Không có nút Add cho trang này */}
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
          // Không có các action như view, edit, delete, lock cho trang này theo yêu cầu hiện tại
          // Nếu cần xem chi tiết, bạn có thể thêm prop `onView` và xử lý modal tương ứng
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

const ListOfTutorPayments = React.memo(ListOfTutorPaymentsPage);
export default ListOfTutorPayments;