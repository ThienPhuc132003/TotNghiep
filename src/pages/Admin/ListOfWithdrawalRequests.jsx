/* eslint-disable no-undef */
import React, { useCallback, useEffect, useState, useMemo } from "react";
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
    case "PENDING":
      return <span className="status status-pending">Chờ duyệt</span>;
    case "APPROVED":
      return <span className="status status-active">Đã duyệt</span>;
    case "REJECTED":
      return <span className="status status-failed">Từ chối</span>;
    case "PROCESSED":
      return <span className="status status-success">Đã xử lý</span>;
    case "CANCELLED":
      return <span className="status status-inactive">Đã hủy</span>;
    default:
      return (
        <span className="status status-unknown">{status || "Không rõ"}</span>
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
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "0 Xu";
  }
  return numeral(amount).format("0,0") + " Xu";
};

const formatBankInfo = (bankInfo) => {
  if (!bankInfo) return "Chưa cập nhật";
  const { bankName, accountNumber, accountHolderName } = bankInfo;
  return (
    <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
      <div>
        <strong>Ngân hàng:</strong> {bankName || "N/A"}
      </div>
      <div>
        <strong>STK:</strong> {accountNumber || "N/A"}
      </div>
      <div>
        <strong>Chủ TK:</strong> {accountHolderName || "N/A"}
      </div>
    </div>
  );
};

// --- End Helper Functions ---

// Status Filter Options
const statusFilterOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "PROCESSED", label: "Đã xử lý" },
  { value: "CANCELLED", label: "Đã hủy" },
];

// Searchable Columns for Withdrawal Requests
const searchableWithdrawalColumnOptions = [
  { value: "withdrawalRequestId", label: "ID Yêu cầu" },
  { value: "tutorId", label: "Mã Gia sư" },
  { value: "tutorName", label: "Tên Gia sư" },
  { value: "amount", label: "Số tiền" },
  { value: "bankName", label: "Ngân hàng" },
  { value: "accountNumber", label: "Số tài khoản" },
  { value: "createdAt", label: "Ngày tạo", placeholderSuffix: " (YYYY-MM-DD)" },
];

const ListOfWithdrawalRequestsPage = () => {
  // --- States ---
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [searchInput, setSearchInput] = useState("");
  const [selectedSearchField, setSelectedSearchField] = useState(
    searchableWithdrawalColumnOptions[0].value // Mặc định cột đầu tiên
  );
  const [appliedSearchInput, setAppliedSearchInput] = useState("");
  const [appliedSearchField, setAppliedSearchField] = useState(
    searchableWithdrawalColumnOptions[0].value
  );

  const [selectedStatusFilter, setSelectedStatusFilter] = useState("PENDING");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [requestToAction, setRequestToAction] = useState(null);
  const [actionType, setActionType] = useState(""); // "APPROVE" | "REJECT"
  const [actionNote, setActionNote] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [error, setError] = useState(null);

  const currentPath = "/quan-ly-yeu-cau-rut-tien";

  // --- Reset State ---
  const resetState = useCallback(() => {
    setSearchInput("");
    setSelectedSearchField(searchableWithdrawalColumnOptions[0].value);
    setAppliedSearchInput("");
    setAppliedSearchField(searchableWithdrawalColumnOptions[0].value);
    setSelectedStatusFilter("PENDING");
    setSortConfig({ key: "createdAt", direction: "desc" });
    setCurrentPage(0);
  }, []);

  // --- Table Columns ---
  const columns = useMemo(
    () => [
      {
        title: "STT",
        dataKey: "index",
        renderCell: (_, __, index) => currentPage * itemsPerPage + index + 1,
      },
      { title: "ID Yêu cầu", dataKey: "withdrawalRequestId", sortable: true },
      { title: "Mã Gia sư", dataKey: "tutorId", sortable: true },
      { title: "Tên Gia sư", dataKey: "tutorName", sortable: true },
      {
        title: "Số tiền",
        dataKey: "amount",
        sortable: true,
        renderCell: formatCurrency,
      },
      {
        title: "Thông tin NH",
        dataKey: "bankInfo",
        renderCell: formatBankInfo,
      },
      {
        title: "Trạng thái",
        dataKey: "status",
        renderCell: formatStatus,
      },
      {
        title: "Ngày tạo",
        dataKey: "createdAt",
        sortable: true,
        renderCell: (value) => safeFormatDate(value),
      },
      {
        title: "Hành động",
        dataKey: "actions",
        renderCell: (_, rowData) => (
          <div className="action-buttons">
            <button
              className="btn-detail"
              onClick={() => openDetailModal(rowData)}
              title="Xem chi tiết"
            >
              <i className="fa-solid fa-eye"></i>
            </button>
            {rowData.status === "PENDING" && (
              <>
                <button
                  className="btn-success"
                  onClick={() => openActionModal(rowData, "APPROVE")}
                  title="Duyệt yêu cầu"
                  disabled={isProcessingAction}
                >
                  <i className="fa-solid fa-check"></i>
                </button>
                <button
                  className="btn-danger"
                  onClick={() => openActionModal(rowData, "REJECT")}
                  title="Từ chối yêu cầu"
                  disabled={isProcessingAction}
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    [currentPage, itemsPerPage, isProcessingAction]
  ); // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const finalFilterConditions = [];

      // Search filter
      if (appliedSearchInput && appliedSearchField) {
        const isNumericSearch = appliedSearchField === "amount";
        finalFilterConditions.push({
          key: appliedSearchField,
          operator: isNumericSearch ? "equal" : "like",
          value: appliedSearchInput,
        });
      }

      // Status filter
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

      const response = await Api({
        endpoint: `manage-banking/search`,
        method: METHOD_TYPE.GET,
        query: query,
      });

      if (response.success && response.data) {
        // Transform data based on the provided API response format
        const transformedData = (response.data.items || []).map(
          (item, index) => {
            return {
              withdrawalRequestId:
                item.manageBankingId ||
                item.id ||
                item.withdrawalRequestId ||
                `REQ-${index}`,
              tutorId:
                item.tutorId ||
                getSafeNestedValue(item, "tutor.userId") ||
                "N/A",
              tutorName:
                getSafeNestedValue(item, "tutor.fullname") ||
                getSafeNestedValue(item, "tutor.tutorProfile.fullname") ||
                item.tutorName ||
                item.fullname ||
                "N/A",
              amount:
                item.coinWithdraw || item.amount || item.withdrawalAmount || 0,
              bankInfo: {
                bankName:
                  getSafeNestedValue(item, "tutor.bankName") ||
                  getSafeNestedValue(item, "tutor.tutorProfile.bankName") ||
                  item.bankName ||
                  "N/A",
                accountNumber:
                  getSafeNestedValue(item, "tutor.bankNumber") ||
                  getSafeNestedValue(item, "tutor.tutorProfile.bankNumber") ||
                  item.accountNumber ||
                  "N/A",
                accountHolderName:
                  getSafeNestedValue(item, "tutor.fullname") ||
                  getSafeNestedValue(item, "tutor.tutorProfile.fullname") ||
                  item.accountHolderName ||
                  item.fullname ||
                  "N/A",
              },
              status: item.status || "PENDING",
              createdAt: item.createdAt || new Date().toISOString(),
              note: item.description || item.note || item.adminNote || "",
              gotValue: item.gotValue || 0,
              // Keep original data for detail view
              originalData: item,
            };
          }
        );

        setData(transformedData);
        setTotalItems(response.data.total || 0);
        setPageCount(Math.ceil((response.data.total || 0) / itemsPerPage));
      } else {
        // Set empty data but don't throw error to prevent white screen
        setData([]);
        setTotalItems(0);
        setPageCount(1);
      }
    } catch (errorCatch) {
      const errorMessage =
        errorCatch.message || "Lỗi tải dữ liệu yêu cầu rút tiền.";
      setError(errorMessage);
      setData([]);
      setTotalItems(0);
      setPageCount(1); // Don't show toast error immediately to avoid blocking UI
      setTimeout(() => {
        toast.error(`Tải dữ liệu thất bại: ${errorMessage}`);
      }, 100);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    sortConfig,
    selectedStatusFilter,
    appliedSearchInput,
    appliedSearchField,
  ]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    numeral.locale("vi");
  }, []);

  // --- Modal Handlers ---
  const openDetailModal = (rowData) => {
    setModalData(rowData);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setModalData(null);
  };

  const openActionModal = (rowData, type) => {
    setRequestToAction(rowData);
    setActionType(type);
    setActionNote("");
    setIsActionModalOpen(true);
  };

  const closeActionModal = () => {
    setIsActionModalOpen(false);
    setRequestToAction(null);
    setActionType("");
    setActionNote("");
  };

  // --- Action Handlers ---
  const handleAction = async () => {
    if (!requestToAction || !actionType) return;

    setIsProcessingAction(true);
    try {
      const endpoint =
        actionType === "APPROVE"
          ? `manage-banking/approve/${requestToAction.withdrawalRequestId}`
          : `manage-banking/reject/${requestToAction.withdrawalRequestId}`;

      const payload = {
        note:
          actionNote ||
          (actionType === "APPROVE" ? "Đã duyệt yêu cầu" : "Từ chối yêu cầu"),
      };

      const response = await Api({
        endpoint: endpoint,
        method: METHOD_TYPE.PUT,
        data: payload,
      });

      if (response.success) {
        toast.success(
          `${
            actionType === "APPROVE" ? "Duyệt" : "Từ chối"
          } yêu cầu thành công!`
        );
        closeActionModal();
        fetchData(); // Refresh data
      } else {
        throw new Error(response.message || "Không thể xử lý yêu cầu.");
      }
    } catch (error) {
      toast.error(`Lỗi: ${error.message}`);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // --- Event Handlers ---
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
  const handleApplySearch = () => {
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
  // --- JSX Render ---
  const childrenMiddleContentLower = (
    <>
      {" "}
      <div className="admin-content">
        <h2 className="admin-list-title">Quản lý Yêu cầu Rút tiền</h2>
        <div className="search-bar-filter-container">
          <div className="search-bar-filter">
            {/* Search Field Dropdown */}
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
            {/* Search Input */}
            <SearchBar
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchKeyPress}
              searchBarClassName="admin-search"
              searchInputClassName="admin-search-input"
              placeholder={searchPlaceholder}
            />
            {/* Status Filter */}
            <div className="filter-control">
              <select
                id="statusFilterWithdrawal"
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
            {/* Action Buttons */}{" "}
            <button
              className="refresh-button"
              onClick={handleApplySearch}
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
        )}{" "}
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
          loading={isLoading || isProcessingAction}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
        {!isLoading && totalItems > 0 && (
          <p
            style={{
              textAlign: "center",
              marginTop: "1rem",
              fontSize: "0.9em",
              color: "#555",
            }}
          >
            Tổng số yêu cầu: {totalItems}
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
            Không có dữ liệu yêu cầu rút tiền.
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
      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onRequestClose={closeDetailModal}
        contentLabel="Chi tiết Yêu cầu Rút tiền"
        className="modal large"
        overlayClassName="overlay"
        closeTimeoutMS={300}
      >
        {modalData && (
          <FormDetail
            formData={modalData}
            fields={
              modalData && [
                { key: "withdrawalRequestId", label: "ID Yêu cầu" },
                { key: "tutorId", label: "Mã Gia sư" },
                { key: "tutorName", label: "Tên Gia sư" },
                {
                  key: "amount",
                  label: "Số tiền",
                  value: formatCurrency(modalData.amount),
                },
                {
                  key: "bankName",
                  label: "Ngân hàng",
                  value: modalData.bankInfo?.bankName,
                },
                {
                  key: "accountNumber",
                  label: "Số tài khoản",
                  value: modalData.bankInfo?.accountNumber,
                },
                {
                  key: "accountHolderName",
                  label: "Chủ tài khoản",
                  value: modalData.bankInfo?.accountHolderName,
                },
                { key: "status", label: "Trạng thái" },
                {
                  key: "createdAt",
                  label: "Ngày tạo",
                  value: safeFormatDate(modalData.createdAt),
                },
                {
                  key: "note",
                  label: "Ghi chú",
                  value: modalData.note || "Không có",
                },
              ]
            }
            mode="view"
            title="Chi tiết Yêu cầu Rút tiền"
            onClose={closeDetailModal}
          />
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        isOpen={isActionModalOpen}
        onRequestClose={closeActionModal}
        contentLabel="Xử lý Yêu cầu"
        className="modal medium"
        overlayClassName="overlay"
        closeTimeoutMS={300}
      >
        {requestToAction && (
          <div className="approval-modal-content">
            <div className="form-detail-header">
              <h2>
                {actionType === "APPROVE" ? "Duyệt" : "Từ chối"} Yêu cầu:{" "}
                {requestToAction.withdrawalRequestId}
              </h2>
              <button
                className="form-detail-close-button"
                onClick={closeActionModal}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>
            <div className="form-content" style={{ padding: "20px" }}>
              <p>
                <strong>Gia sư:</strong> {requestToAction.tutorName} (
                {requestToAction.tutorId})
              </p>
              <p>
                <strong>Số tiền:</strong>{" "}
                {formatCurrency(requestToAction.amount)}
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
                    actionType === "APPROVE" ? "duyệt" : "từ chối"
                  }...`}
                  rows={4}
                  className="form-detail-input"
                  style={{ resize: "vertical" }}
                />
              </div>
              <div
                className="form-detail-actions"
                style={{ marginTop: "25px" }}
              >
                <button
                  className="form-detail-cancel-button"
                  onClick={closeActionModal}
                  disabled={isProcessingAction}
                >
                  Hủy
                </button>
                <button
                  className="form-detail-save-button"
                  onClick={handleAction}
                  disabled={isProcessingAction}
                >
                  {isProcessingAction ? (
                    <>
                      <FontAwesomeIcon
                        icon={faSpinner}
                        spin
                        style={{ marginRight: "8px" }}
                      />{" "}
                      Đang xử lý...
                    </>
                  ) : actionType === "APPROVE" ? (
                    "Xác nhận Duyệt"
                  ) : (
                    "Xác nhận Từ chối"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </AdminDashboardLayout>
  );
};

const ListOfWithdrawalRequests = React.memo(ListOfWithdrawalRequestsPage);
export default ListOfWithdrawalRequests;
