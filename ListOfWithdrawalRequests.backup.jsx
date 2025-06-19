/* eslint-disable no-undef */
import { useCallback, useEffect, useState, useMemo } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css"; // Shared styles
import "../../assets/css/Modal.style.css"; // Modal styles
import Table from "../../components/Table";
import SearchBar from "../../components/SearchBar";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import FormDetail from "../../components/FormDetail";
import Modal from "react-modal";
import { Alert } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format, parseISO, isValid } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import numeral from "numeral";

Modal.setAppElement("#root");

// --- Helper Functions ---
const getSafeNestedValue = (obj, path, defaultValue = "N/A") => {
  if (!obj || !path) return defaultValue;
  const value = path
    .split(".")
    .reduce(
      (acc, part) => (acc && typeof acc === "object" ? acc[part] : undefined),
      obj
    );
  return value !== undefined && value !== null ? value : defaultValue;
};

const formatStatus = (status) => {
  switch (status) {
    case "REQUEST":
      return <span className="status status-request">Yêu cầu</span>;
    case "PENDING":
      return <span className="status status-pending">Chờ duyệt</span>;
    case "APPROVED":
      return <span className="status status-approved">Đã duyệt</span>;
    case "REJECTED":
      return <span className="status status-rejected">Từ chối</span>;
    case "PROCESSED":
      return <span className="status status-processed">Đã xử lý</span>;
    case "CANCEL":
      return <span className="status status-cancel">Đã hủy</span>;
    default:
      return (
        <span className="status status-unknown">{status || "REQUEST"}</span>
      );
  }
};

const safeFormatDate = (dateInput, formatString = "dd/MM/yyyy HH:mm") => {
  if (!dateInput) return "Không có";
  try {
    const date =
      typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    return isValid(date) ? format(date, formatString) : "Ngày không hợp lệ";
  } catch (e) {
    return "Lỗi ngày";
  }
};

const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return "0 Coin";
  return `${numeral(amount).format("0,0")} Coin`;
};

const formatVND = (amount) => {
  if (!amount || isNaN(amount)) return "0 VNĐ";
  return `${numeral(amount).format("0,0")} VNĐ`;
};

// --- Searchable columns for withdrawal requests ---
const searchableWithdrawalColumnOptions = [
  { value: "tutorId", label: "ID Gia sư" },
  { value: "tutor.fullname", label: "Tên gia sư" },
  { value: "tutor.bankNumber", label: "Số tài khoản" },
  { value: "coinWithdraw", label: "Coin rút" },
  { value: "gotValue", label: "Tiền quy đổi", placeholderSuffix: " (VNĐ)" },
  { value: "createdAt", label: "Ngày tạo", placeholderSuffix: " (YYYY-MM-DD)" },
];

// Status filter options (separate from search fields)
const statusFilterOptions = [
  { value: "", label: "Tất cả" },
  { value: "REQUEST", label: "Yêu cầu" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "PROCESSED", label: "Đã xử lý" },
  { value: "CANCEL", label: "Đã hủy" },
];

const ListOfWithdrawalRequestsPage = () => {
  console.log("🔍 DEBUG: ListOfWithdrawalRequestsPage rendering...");

  // --- State Variables ---
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [searchInput, setSearchInput] = useState("");
  const [selectedSearchField, setSelectedSearchField] = useState(
    searchableWithdrawalColumnOptions[0].value
  );
  const [appliedSearchInput, setAppliedSearchInput] = useState("");
  const [appliedSearchField, setAppliedSearchField] = useState(
    searchableWithdrawalColumnOptions[0].value
  );

  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [requestToAction, setRequestToAction] = useState(null);
  const [actionType, setActionType] = useState(""); // "approve" or "reject"
  const [actionNote, setActionNote] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [error, setError] = useState(null);

  const currentPath = "/admin/rut-tien";

  console.log("🔍 DEBUG: Component state:", {
    dataLength: data.length,
    totalItems,
    currentPage,
    itemsPerPage,
    isLoading,
    error,
    selectedStatusFilter,
    appliedSearchInput,
    appliedSearchField,
  });
  // --- Reset State (available for future use) ---
  const resetState = useCallback(() => {
    console.log("🔍 DEBUG: Resetting state...");
    try {
      setSearchInput("");
      setSelectedSearchField(searchableWithdrawalColumnOptions[0].value);
      setAppliedSearchInput("");
      setAppliedSearchField(searchableWithdrawalColumnOptions[0].value);
      setSelectedStatusFilter("");
      setSortConfig({ key: "createdAt", direction: "desc" });
      setCurrentPage(0);
      console.log("🔍 DEBUG: resetState completed successfully");
    } catch (error) {
      console.error("🔍 DEBUG: Error in resetState:", error);
    }
  }, []);

  // Expose resetState for potential external use
  window.withdrawalPageReset = resetState;

  // --- Table Columns ---
  const columns = useMemo(
    () => [
      {
        title: "STT",
        dataKey: "index",
        renderCell: (_, __, index) => currentPage * itemsPerPage + index + 1,
      },
      {
        title: "ID Gia sư",
        dataKey: "tutorId",
        sortable: true,
      },
      {
        title: "Tên Gia sư",
        dataKey: "tutor.fullname",
        sortable: false,
        renderCell: (_, rowData) =>
          getSafeNestedValue(rowData, "tutor.fullname", "N/A"),
      },
      {
        title: "Coin rút",
        dataKey: "coinWithdraw",
        sortable: true,
        renderCell: (_, rowData) => formatCurrency(rowData.coinWithdraw),
      },
      {
        title: "Tiền quy đổi",
        dataKey: "gotValue",
        sortable: true,
        renderCell: (_, rowData) => formatVND(rowData.gotValue),
      },
      {
        title: "Tên ngân hàng",
        dataKey: "tutor.bankName",
        sortable: false,
        renderCell: (_, rowData) =>
          getSafeNestedValue(rowData, "tutor.bankName", "") ||
          getSafeNestedValue(rowData, "tutor.tutorProfile.bankName", "N/A"),
      },
      {
        title: "STK",
        dataKey: "tutor.bankNumber",
        sortable: false,
        renderCell: (_, rowData) =>
          getSafeNestedValue(rowData, "tutor.bankNumber", "") ||
          getSafeNestedValue(rowData, "tutor.tutorProfile.bankNumber", "N/A"),
      },
      {
        title: "Trạng thái",
        dataKey: "status",
        sortable: true,
        renderCell: (_, rowData) => formatStatus(rowData.status),
      },
      {
        title: "Ngày tạo",
        dataKey: "createdAt",
        sortable: true,
        renderCell: (_, rowData) => safeFormatDate(rowData.createdAt),
      },
      {
        title: "Thao tác",
        dataKey: "actions",
        renderCell: (_, rowData) => (
          <div className="action-buttons">
            <button
              className="action-button view"
              onClick={() => handleView(rowData)}
              title="Xem chi tiết"
            >
              <i className="fas fa-eye"></i>
            </button>
            {(rowData.status === "REQUEST" || rowData.status === "PENDING") && (
              <>
                <button
                  className="action-button approve"
                  onClick={() => handleActionClick(rowData, "approve")}
                  title="Duyệt yêu cầu"
                >
                  <i className="fas fa-check"></i>
                </button>
                <button
                  className="action-button delete"
                  onClick={() => handleActionClick(rowData, "reject")}
                  title="Từ chối yêu cầu"
                >
                  <i className="fas fa-times"></i>
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    [currentPage, itemsPerPage]
  );

  console.log("🔍 DEBUG: Columns configured:", columns.length);

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    console.log("🔍 DEBUG: fetchData called");
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔍 DEBUG: Preparing API call parameters...");
      const finalFilterConditions = [];

      // Search filter
      if (appliedSearchInput && appliedSearchField) {
        const isNumericSearch = ["coinWithdraw", "gotValue"].includes(
          appliedSearchField
        );
        finalFilterConditions.push({
          key: appliedSearchField,
          operator: isNumericSearch ? "equal" : "like",
          value: appliedSearchInput,
        });
        console.log(
          "🔍 DEBUG: Added search filter:",
          finalFilterConditions[finalFilterConditions.length - 1]
        );
      }

      // Status filter
      if (selectedStatusFilter) {
        finalFilterConditions.push({
          key: "status",
          operator: "equal",
          value: selectedStatusFilter,
        });
        console.log(
          "🔍 DEBUG: Added status filter:",
          finalFilterConditions[finalFilterConditions.length - 1]
        );
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

      console.log("📋 DEBUG: Query parameters:", query);

      const response = await Api({
        endpoint: `manage-banking/search`,
        method: METHOD_TYPE.GET,
        query: query,
      });

      console.log("📥 DEBUG: API Response received:", response);

      if (response.success && response.data) {
        console.log("🔍 DEBUG: Processing API response data...");
        const items = response.data.items || [];
        console.log("🔍 DEBUG: Raw items:", items.length);

        const transformedData = items.map((item, index) => {
          console.log(`🔍 DEBUG: Transforming item ${index}:`, item);
          return {
            manageBankingId: item.manageBankingId || item.id,
            tutorId: item.tutorId,
            coinWithdraw: item.coinWithdraw || 0,
            gotValue: item.gotValue || 0,
            status: item.status || "REQUEST",
            createdAt: item.createdAt,
            description: item.description || "",
            tutor: {
              fullname: getSafeNestedValue(item, "tutor.fullname", "N/A"),
              bankName:
                getSafeNestedValue(item, "tutor.bankName", "") ||
                getSafeNestedValue(item, "tutor.tutorProfile.bankName", "N/A"),
              bankNumber:
                getSafeNestedValue(item, "tutor.bankNumber", "") ||
                getSafeNestedValue(
                  item,
                  "tutor.tutorProfile.bankNumber",
                  "N/A"
                ),
            },
            originalData: item, // Keep original for modal
          };
        });

        console.log("🔍 DEBUG: Transformed data:", transformedData);

        setData(transformedData);
        setTotalItems(response.data.total || 0);
        setPageCount(Math.ceil((response.data.total || 0) / itemsPerPage));

        console.log("🔍 DEBUG: Data set successfully:", {
          transformedCount: transformedData.length,
          totalItems: response.data.total || 0,
          pageCount: Math.ceil((response.data.total || 0) / itemsPerPage),
        });
      } else {
        throw new Error(
          response.message || "Lỗi tải dữ liệu yêu cầu rút tiền."
        );
      }
    } catch (errorCatch) {
      console.error("🔍 DEBUG: Fetch data error:", errorCatch);
      const errorMessage =
        errorCatch.message || "Lỗi tải dữ liệu yêu cầu rút tiền.";
      setError(errorMessage);
      setData([]);
      setTotalItems(0);
      setPageCount(1);
      toast.error(`Tải dữ liệu thất bại: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      console.log("🔍 DEBUG: fetchData completed");
    }
  }, [
    currentPage,
    itemsPerPage,
    sortConfig,
    selectedStatusFilter,
    appliedSearchInput,
    appliedSearchField,
  ]);

  // --- useEffect for mounting and data fetching ---
  useEffect(() => {
    console.log("🔍 DEBUG: useEffect[fetchData] triggered");
    fetchData();
  }, [fetchData]);

  console.log("🔍 DEBUG: About to render, final state:", {
    dataLength: data.length,
    isLoading,
    error,
  });

  // --- Handlers ---
  const handlePageClick = (event) => {
    console.log("🔍 DEBUG: handlePageClick:", event.selected);
    if (typeof event.selected === "number") setCurrentPage(event.selected);
  };

  const handleSort = (sortKey) => {
    console.log("🔍 DEBUG: handleSort:", sortKey);
    setSortConfig((prev) => ({
      key: sortKey,
      direction:
        prev.key === sortKey && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(0);
  };

  const handleItemsPerPageChange = (newPageSize) => {
    console.log("🔍 DEBUG: handleItemsPerPageChange:", newPageSize);
    setItemsPerPage(newPageSize);
    setCurrentPage(0);
  };
  const handleSearchInputChange = (event) => {
    const value = event.target.value;
    console.log("🔍 DEBUG: handleSearchInputChange:", value);
    setSearchInput(value);
  };

  const handleSearchFieldChange = (event) => {
    console.log("🔍 DEBUG: handleSearchFieldChange:", event.target.value);
    setSelectedSearchField(event.target.value);
  };

  const handleApplySearch = () => {
    console.log("🔍 DEBUG: handleApplySearch");
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

  const handleStatusFilterChange = (event) => {
    console.log("🔍 DEBUG: handleStatusFilterChange:", event.target.value);
    setSelectedStatusFilter(event.target.value);
    setCurrentPage(0);
  };

  // --- Modal Handlers ---
  const handleView = (request) => {
    console.log("🔍 DEBUG: handleView:", request);
    setModalData(request);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    console.log("🔍 DEBUG: handleCloseDetailModal");
    setIsDetailModalOpen(false);
    setModalData(null);
  };

  const handleActionClick = (request, type) => {
    console.log("🔍 DEBUG: handleActionClick:", request, type);
    setRequestToAction(request);
    setActionType(type);
    setActionNote("");
    setIsActionModalOpen(true);
  };

  const handleCloseActionModal = () => {
    console.log("🔍 DEBUG: handleCloseActionModal");
    setIsActionModalOpen(false);
    setRequestToAction(null);
    setActionType("");
    setActionNote("");
  };

  const handleConfirmAction = async () => {
    if (!requestToAction || !actionType) return;

    console.log("🔍 DEBUG: handleConfirmAction:", {
      requestToAction,
      actionType,
      actionNote,
    });
    setIsProcessingAction(true);
    try {
      const endpoint =
        actionType === "approve"
          ? `manage-banking/approve/${requestToAction.manageBankingId}`
          : `manage-banking/reject/${requestToAction.manageBankingId}`;

      const payload = actionNote.trim() ? { note: actionNote.trim() } : {};

      console.log("🔍 DEBUG: API call:", { endpoint, payload });

      const response = await Api({
        endpoint: endpoint,
        method: METHOD_TYPE.POST,
        data: payload,
      });

      console.log("🔍 DEBUG: Action response:", response);

      if (response.success) {
        toast.success(
          `${
            actionType === "approve" ? "Duyệt" : "Từ chối"
          } yêu cầu thành công!`
        );
        handleCloseActionModal();
        fetchData(); // Refresh data
      } else {
        throw new Error(response.message || `Lỗi ${actionType} yêu cầu.`);
      }
    } catch (error) {
      console.error(`🔍 DEBUG: ${actionType} error:`, error);
      toast.error(
        `${actionType === "approve" ? "Duyệt" : "Từ chối"} yêu cầu thất bại: ${
          error.message
        }`
      );
    } finally {
      setIsProcessingAction(false);
    }
  };
  // --- JSX Render ---
  const currentSearchFieldConfig = useMemo(
    () =>
      searchableWithdrawalColumnOptions.find(
        (opt) => opt.value === selectedSearchField
      ),
    [selectedSearchField]
  );
  const searchPlaceholder = currentSearchFieldConfig
    ? `Nhập ${currentSearchFieldConfig.label.toLowerCase()}${
        currentSearchFieldConfig.placeholderSuffix || ""
      }...`
    : "Nhập tìm kiếm...";

  console.log("🔍 DEBUG: Rendering JSX...");
  return (
    <AdminDashboardLayout currentPath={currentPath}>
      <div className="list-of-admin-page">
        <h2 className="admin-list-title">Danh sách Yêu cầu Rút tiền</h2>
        
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            {/* Select chọn cột tìm kiếm */}
            <div className="filter-control">
              <select
                id="searchFieldSelectWithdrawal"
                value={selectedSearchField}
                onChange={handleSearchFieldChange}
                className="status-filter-select"
                aria-label="Chọn trường để tìm kiếm"
              >
                {searchableWithdrawalColumnOptions.map((option) => (
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
            
            <button
              onClick={handleApplySearch}
              className="refresh-button"
              title="Tìm kiếm"
              aria-label="Tìm kiếm"
              disabled={isLoading}
            >
              <i className="fa-solid fa-search"></i>
            </button>
            
            <button
              className="refresh-button"
              onClick={resetState}
              title="Làm mới bộ lọc"
              aria-label="Làm mới bộ lọc"
              disabled={isLoading}
            >
              <i className="fa-solid fa-rotate-left"></i>
            </button>

            {/* Filter trạng thái - riêng biệt */}
            <div className="filter-control">
              <label htmlFor="status-filter" className="filter-label">
                Trạng thái:
              </label>
              <select
                id="status-filter"
                value={selectedStatusFilter}
                onChange={handleStatusFilterChange}
                className="status-filter-select"
                aria-label="Lọc theo trạng thái"
              >
                {statusFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>        {error && (
          <Alert severity="error" className="error-alert">
            {error}
          </Alert>
        )}

        <div className="table-section">
          <Table
            columns={columns}
            data={data}
            pageCount={pageCount}
            currentPage={currentPage}
            onPageChange={handlePageClick}
            onSort={handleSort}
            sortConfig={sortConfig}
            loading={isLoading}
            noDataMessage="Không có yêu cầu rút tiền nào."
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            totalItems={totalItems}
          />
        </div>

        {/* Detail Modal */}
        <Modal
          isOpen={isDetailModalOpen}
          onRequestClose={handleCloseDetailModal}
          contentLabel="Chi tiết Yêu cầu Rút tiền"
          className="modal large"
          overlayClassName="overlay"
          closeTimeoutMS={300}
        >
          {modalData && (
            <FormDetail
              formData={modalData}
              fields={[
                { key: "manageBankingId", label: "ID Yêu cầu" },
                { key: "tutorId", label: "ID Gia sư" },
                {
                  key: "tutorName",
                  label: "Tên Gia sư",
                  value: getSafeNestedValue(modalData, "tutor.fullname", "N/A"),
                },
                {
                  key: "coinWithdraw",
                  label: "Coin rút",
                  value: formatCurrency(modalData.coinWithdraw),
                },
                {
                  key: "gotValue",
                  label: "Tiền quy đổi",
                  value: formatVND(modalData.gotValue),
                },
                {
                  key: "bankName",
                  label: "Tên ngân hàng",
                  value: getSafeNestedValue(modalData, "tutor.bankName", "N/A"),
                },
                {
                  key: "bankNumber",
                  label: "Tài khoản ngân hàng",
                  value: getSafeNestedValue(
                    modalData,
                    "tutor.bankNumber",
                    "N/A"
                  ),
                },
                {
                  key: "status",
                  label: "Trạng thái",
                  value: formatStatus(modalData.status),
                },
                {
                  key: "createdAt",
                  label: "Ngày tạo",
                  value: safeFormatDate(modalData.createdAt),
                },
                {
                  key: "note",
                  label: "Ghi chú",
                  value: modalData.description || "Không có",
                },
              ]}
              mode="view"
              onClose={handleCloseDetailModal}
            />
          )}
        </Modal>

        {/* Action Modal */}
        <Modal
          isOpen={isActionModalOpen}
          onRequestClose={handleCloseActionModal}
          contentLabel={`${
            actionType === "approve" ? "Duyệt" : "Từ chối"
          } Yêu cầu`}
          className="modal medium"
          overlayClassName="overlay"
          closeTimeoutMS={300}
        >
          <div className="modal-header">
            <h2>
              {actionType === "approve" ? "Duyệt" : "Từ chối"} Yêu cầu Rút tiền
            </h2>
            <button
              className="close-button"
              onClick={handleCloseActionModal}
              disabled={isProcessingAction}
            >
              ×
            </button>
          </div>
          <div className="modal-content">
            {requestToAction && (
              <div className="form-content" style={{ padding: "20px" }}>
                <p>
                  <strong>ID Gia sư:</strong> {requestToAction.tutorId}
                </p>
                <p>
                  <strong>Tên Gia sư:</strong>{" "}
                  {getSafeNestedValue(requestToAction, "tutor.fullname", "N/A")}
                </p>
                <p>
                  <strong>Coin rút:</strong>{" "}
                  {formatCurrency(requestToAction.coinWithdraw)}
                </p>
                <p>
                  <strong>Tiền quy đổi:</strong>{" "}
                  {formatVND(requestToAction.gotValue)}
                </p>
                <div className="form-detail-group">
                  <label
                    htmlFor="actionNote"
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "500",
                    }}
                  >
                    Ghi chú:
                  </label>
                  <textarea
                    id="actionNote"
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder={`Nhập ghi chú cho việc ${
                      actionType === "approve" ? "duyệt" : "từ chối"
                    } yêu cầu...`}
                    style={{
                      width: "100%",
                      minHeight: "80px",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                      resize: "vertical",
                    }}
                    disabled={isProcessingAction}
                  />
                </div>
              </div>
            )}
          </div>{" "}
          <div className="modal-buttons">
            <button
              type="button"
              className="cancel-button"
              onClick={handleCloseActionModal}
              disabled={isProcessingAction}
            >
              Hủy
            </button>{" "}
            <button
              type="button"
              className={`${
                actionType === "approve" ? "approve-button" : "delete-button"
              }`}
              onClick={handleConfirmAction}
              disabled={isProcessingAction}
            >
              {isProcessingAction ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : actionType === "approve" ? (
                "Duyệt"
              ) : (
                "Từ chối"
              )}
            </button>
          </div>
        </Modal>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </AdminDashboardLayout>
  );
};

export default ListOfWithdrawalRequestsPage;
