// src/components/Table.jsx
import React, { useMemo, useCallback, useState, useRef } from "react";
import PropTypes from "prop-types";
import ReactPaginate from "react-paginate";
import "../assets/css/Table.style.css";
import "../assets/css/Pagination.style.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const getNestedValue = (obj, path) => {
  if (!path) return undefined;
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
};

const TableComponent = ({
  columns,
  data,
  totalItems,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onLock,
  pageCount,
  onPageChange,
  forcePage = 0,
  onSort,
  // ****** BỔ SUNG PROP: Nhận trạng thái sort hiện tại từ cha ******
  currentSortConfig, // Ví dụ: { key: 'createdAt', direction: 'desc' }
  loading,
  itemsPerPage,
  onItemsPerPageChange,
  showLock = false,
  statusKey = "status",
}) => {
  // State sort nội bộ chỉ dùng khi KHÔNG có onSort (cha không quản lý)
  const [internalSortConfig, setInternalSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const tableContainerRef = useRef(null);

  const showActionsColumn = useMemo(() => {
    return Boolean(
      onView ||
        onEdit ||
        onDelete ||
        onApprove ||
        onReject ||
        (showLock && onLock)
    );
  }, [onView, onEdit, onDelete, onApprove, onReject, showLock, onLock]);

  // Hàm requestSort không thay đổi, nó chỉ gọi onSort nếu có
  const requestSort = useCallback(
    (key) => {
      if (onSort) {
        onSort(key); // Gọi handler của cha
      } else {
        // Xử lý sort nội bộ nếu cha không quản lý
        const newDirection =
          internalSortConfig.key === key &&
          internalSortConfig.direction === "asc"
            ? "desc"
            : "asc";
        setInternalSortConfig({ key, direction: newDirection });
      }
    },
    [onSort, internalSortConfig] // Thêm internalSortConfig dependency
  );

  // Dữ liệu sort nội bộ chỉ thực hiện khi không có onSort
  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (!onSort && internalSortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = getNestedValue(a, internalSortConfig.key);
        const bValue = getNestedValue(b, internalSortConfig.key);
        if (aValue < bValue)
          return internalSortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue)
          return internalSortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [data, internalSortConfig, onSort]); // Thêm onSort dependency

  const handlePageChange = useCallback(
    (event) => {
      if (onPageChange && typeof event.selected === "number") {
        onPageChange(event);
      }
    },
    [onPageChange]
  );

  const skeletonRows = useMemo(
    () => Array(itemsPerPage || 5).fill(null),
    [itemsPerPage]
  );

  const handleItemsPerPageChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    if (!isNaN(newSize) && newSize > 0) {
      onItemsPerPageChange(newSize);
    }
  };

  // ****** CẬP NHẬT getSortDirection ******
  // Ưu tiên trạng thái từ cha (currentSortConfig), sau đó mới đến internalSortConfig
  const getSortDirection = (keyToCheck) => {
    // 1. Kiểm tra trạng thái từ cha trước
    if (currentSortConfig && currentSortConfig.key === keyToCheck) {
      return currentSortConfig.direction;
    }
    // 2. Nếu không có onSort (cha không quản lý), kiểm tra state nội bộ
    if (!onSort && internalSortConfig.key === keyToCheck) {
      return internalSortConfig.direction;
    }
    // 3. Mặc định là không có sort cho key này
    return null;
  };

  const generateKey = (prefix, colIndex, suffix = "") => {
    return `${prefix}-col${colIndex}${suffix ? `-${suffix}` : ""}`;
  };

  return (
    <div className="main-table-container">
      <div className="table-scrollable-container" ref={tableContainerRef}>
        <table className="custom-table" aria-label="Bảng dữ liệu" role="grid">
          <thead className="custom-table-header">
            <tr role="row">
              {columns.map((col, columnIndex) => {
                // Xác định key thực tế để kiểm tra sort (ưu tiên sortKey)
                const sortableKey = col.sortKey || col.dataKey;
                // Lấy direction hiện tại cho key này
                const currentDirection = getSortDirection(sortableKey);
                return (
                  <th
                    key={generateKey("header", columnIndex)}
                    className={`sortable-header ${
                      col.sortable === false ? "not-sortable" : ""
                    }`}
                    onClick={() =>
                      col.sortable !== false && requestSort(sortableKey)
                    }
                    role="columnheader"
                    tabIndex={col.sortable !== false ? 0 : -1}
                    // Cập nhật aria-sort dựa trên currentDirection
                    aria-sort={
                      col.sortable !== false && currentDirection
                        ? currentDirection === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    {col.title}
                    {col.sortable !== false && (
                      <div className="sort-arrows">
                        {/* Hiển thị mũi tên active dựa trên currentDirection */}
                        <span
                          className={currentDirection === "asc" ? "active" : ""}
                        >
                          ▲
                        </span>
                        <span
                          className={
                            currentDirection === "desc" ? "active" : ""
                          }
                        >
                          ▼
                        </span>
                      </div>
                    )}
                  </th>
                );
              })}
              {showActionsColumn && (
                <th role="columnheader" className="action-column-header">
                  Hành động
                </th>
              )}
            </tr>
          </thead>
          {/* Phần tbody không thay đổi logic sort */}
          <tbody role="rowgroup">
            {loading ? (
              skeletonRows.map((_, skelIndex) => (
                <tr key={`table-skeleton-row-${skelIndex}`} role="row">
                  {columns.map((col, columnIndex) => (
                    <td
                      key={generateKey(
                        "skel-cell",
                        columnIndex,
                        `row${skelIndex}`
                      )}
                      role="gridcell"
                      className="table-cell"
                    >
                      <Skeleton height={20} />
                    </td>
                  ))}
                  {showActionsColumn && (
                    <td
                      key={generateKey(
                        "skel-action",
                        columns.length,
                        `row${skelIndex}`
                      )}
                      role="gridcell"
                      className="action-buttons"
                    >
                      <Skeleton
                        key={`action-skel-1-${skelIndex}`}
                        circle
                        width={30}
                        height={30}
                        inline={true}
                        style={{ marginRight: "5px" }}
                      />
                      <Skeleton
                        key={`action-skel-2-${skelIndex}`}
                        circle
                        width={30}
                        height={30}
                        inline={true}
                      />
                    </td>
                  )}
                </tr>
              ))
            ) : sortedData.length > 0 ? (
              sortedData.map((row, rowIndex) => (
                <tr
                  key={
                    row.id ||
                    row.tutorRequestId ||
                    row.paymentId ||
                    `data-row-${rowIndex}`
                  }
                  className={rowIndex % 2 === 0 ? "row-even" : "row-odd"}
                  role="row"
                >
                  {columns.map((col, columnIndex) => {
                    let cellValue = getNestedValue(row, col.dataKey);
                    if (col.renderCell) {
                      cellValue = col.renderCell(cellValue, row, rowIndex);
                    } else if (cellValue === null || cellValue === undefined) {
                      cellValue = "...";
                    }
                    const rowKeySuffix =
                      row.id ||
                      row.tutorRequestId ||
                      row.paymentId ||
                      `idx${rowIndex}`;
                    return (
                      <td
                        key={generateKey("cell", columnIndex, rowKeySuffix)}
                        role="gridcell"
                        className="table-cell"
                        title={
                          typeof cellValue === "string" ||
                          typeof cellValue === "number"
                            ? String(cellValue)
                            : ""
                        }
                      >
                        {cellValue}
                      </td>
                    );
                  })}
                  {showActionsColumn && (
                    <td
                      key={generateKey(
                        "action",
                        columns.length,
                        row.id ||
                          row.tutorRequestId ||
                          row.paymentId ||
                          `idx${rowIndex}`
                      )}
                      className="action-buttons"
                      role="gridcell"
                    >
                      {onView && (
                        <button
                          onClick={() => onView(row)}
                          title="Xem chi tiết"
                          className="action-button view"
                          aria-label="Xem chi tiết"
                        >
                          <i className="fa-regular fa-eye"></i>
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          title="Chỉnh sửa"
                          className="action-button edit"
                          aria-label="Chỉnh sửa"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          title="Xóa"
                          className="action-button delete"
                          aria-label="Xóa"
                        >
                          <i className="fa-regular fa-trash-can"></i>
                        </button>
                      )}
                      {getNestedValue(row, statusKey) === "REQUEST" && (
                        <>
                          {onApprove && (
                            <button
                              onClick={() => onApprove(row)}
                              title="Duyệt yêu cầu"
                              className="action-button approve"
                              aria-label="Duyệt"
                            >
                              <i className="fa-solid fa-check"></i>
                            </button>
                          )}
                          {onReject && (
                            <button
                              onClick={() => onReject(row)}
                              title="Từ chối yêu cầu"
                              className="action-button reject"
                              aria-label="Từ chối"
                            >
                              <i className="fa-solid fa-times"></i>
                            </button>
                          )}
                        </>
                      )}
                      {showLock && onLock && (
                        <button
                          onClick={() => onLock(row)}
                          title={
                            getNestedValue(row, statusKey) === "ACTIVE"
                              ? "Khóa"
                              : "Mở khóa"
                          }
                          className={`action-button lock ${
                            getNestedValue(row, statusKey) === "ACTIVE"
                              ? "unlocked"
                              : "locked"
                          }`}
                          aria-label={
                            getNestedValue(row, statusKey) === "ACTIVE"
                              ? "Khóa"
                              : "Mở khóa"
                          }
                        >
                          <i
                            className={
                              getNestedValue(row, statusKey) === "ACTIVE"
                                ? "fa-solid fa-lock-open"
                                : "fa-solid fa-lock"
                            }
                          />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={
                    showActionsColumn ? columns.length + 1 : columns.length
                  }
                  className="no-data"
                  role="gridcell"
                >
                  Không tìm thấy dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {(pageCount > 1 ||
        (totalItems !== undefined && totalItems > itemsPerPage)) && (
        <div className="pagination-container">
          <div className="total-item-show">
            <label htmlFor="itemsPerPageSelect">Số dòng/trang:</label>
            <select
              id="itemsPerPageSelect"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="item-per-page-select"
            >
              {[5, 10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          {pageCount > 0 && (
            <ReactPaginate
              previousLabel={"<"}
              nextLabel={">"}
              breakLabel={"..."}
              pageCount={pageCount}
              marginPagesDisplayed={1}
              pageRangeDisplayed={2}
              onPageChange={handlePageChange}
              containerClassName={"pagination"}
              activeClassName={"active"}
              disabledClassName={"disabled"}
              forcePage={forcePage}
            />
          )}
        </div>
      )}
    </div>
  );
};

TableComponent.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      dataKey: PropTypes.string.isRequired,
      renderCell: PropTypes.func,
      sortable: PropTypes.bool,
      sortKey: PropTypes.string,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  totalItems: PropTypes.number,
  onView: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
  onLock: PropTypes.func,
  pageCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  forcePage: PropTypes.number,
  onSort: PropTypes.func,
  // ****** BỔ SUNG PROP TYPE ******
  currentSortConfig: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.oneOf(["asc", "desc"]),
  }), // Có thể là null hoặc object
  loading: PropTypes.bool.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  onItemsPerPageChange: PropTypes.func.isRequired,
  showLock: PropTypes.bool,
  statusKey: PropTypes.string,
};

export default React.memo(TableComponent);
