// src/components/Table.jsx
import React, { useMemo, useCallback, useState, useRef } from "react";
import PropTypes from "prop-types";
import ReactPaginate from "react-paginate";
import "../assets/css/Table.style.css";
import "../assets/css/Pagination.style.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Helper to get nested values like 'major.majorName'
const getNestedValue = (obj, path) => {
  if (!path) return undefined;
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
};

const TableComponent = ({
  columns,
  data,
  // --- Action Handlers (Optional Props) ---
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onLock,
  // --- Other Props ---
  pageCount,
  onPageChange,
  forcePage,
  onSort, // Allow parent to control sorting state update
  loading,
  itemsPerPage,
  onItemsPerPageChange,
  showLock = false,
  statusKey = "status",
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const tableContainerRef = useRef(null);

  // Handle internal sort state update and call parent onSort
  const requestSort = useCallback(
    (key) => {
      const newDirection =
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc";
      const newSortConfig = { key, direction: newDirection };
      setSortConfig(newSortConfig);
      // If onSort prop is provided, call it (for parent-controlled fetching)
      if (onSort) {
        onSort(key); // Or pass the full newSortConfig if needed by parent
      }
    },
    [onSort, sortConfig.direction, sortConfig.key] // Include onSort in dependencies
  );

  // Memoize sorted data - Sort locally if onSort prop is NOT provided
  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    // Only sort internally if onSort is NOT provided (parent handles sorting otherwise)
    if (!onSort && sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.key);
        const bValue = getNestedValue(b, sortConfig.key);
        // Basic comparison, can be improved for different data types
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
    // Dependency on `data` and `sortConfig` if sorting internally,
    // Dependency only on `data` if parent handles sorting via `onSort` prop.
  }, [data, sortConfig, onSort]); // Added onSort dependency

  const handlePageChange = useCallback(
    async (selectedPage) => {
      await onPageChange(selectedPage);
    },
    [onPageChange]
  );
  const skeletonRows = useMemo(
    () => Array(itemsPerPage || 5).fill(null),
    [itemsPerPage]
  );
  const handleItemsPerPageChange = (e) => {
    onItemsPerPageChange(Number(e.target.value));
  };

  return (
    <div className="main-table-container">
      <div className="table-scrollable-container" ref={tableContainerRef}>
        <table className="custom-table" aria-label="Bảng dữ liệu" role="grid">
          <thead className="custom-table-header">
            <tr role="row">
              {columns.map((col) => (
                <th
                  key={col.dataKey}
                  className={`sortable-header ${
                    col.sortable === false ? "not-sortable" : ""
                  }`}
                  onClick={() =>
                    col.sortable !== false && requestSort(col.dataKey)
                  }
                  role="columnheader"
                  tabIndex={col.sortable !== false ? 0 : -1}
                  aria-sort={
                    col.sortable !== false && sortConfig.key === col.dataKey
                      ? sortConfig.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  {col.title}
                  {col.sortable !== false && (
                    <div className="sort-arrows">
                      <span
                        className={
                          sortConfig.key === col.dataKey &&
                          sortConfig.direction === "asc"
                            ? "active"
                            : ""
                        }
                      >
                        ▲
                      </span>
                      <span
                        className={
                          sortConfig.key === col.dataKey &&
                          sortConfig.direction === "desc"
                            ? "active"
                            : ""
                        }
                      >
                        ▼
                      </span>
                    </div>
                  )}
                </th>
              ))}
              <th role="columnheader" className="action-column-header">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody role="rowgroup">
            {loading ? (
              skeletonRows.map((_, index) => (
                <tr key={`skeleton-${index}`} role="row">
                  {columns.map((col) => (
                    <td
                      key={`${col.dataKey}-skeleton-${index}`}
                      role="gridcell"
                      className="table-cell"
                    >
                      <Skeleton height={20} />
                    </td>
                  ))}
                  <td role="gridcell" className="action-buttons">
                    {/* Adjust skeleton count based on typical visible buttons */}
                    <Skeleton
                      circle
                      width={30}
                      height={30}
                      inline={true}
                      style={{ marginRight: "5px" }}
                    />
                    <Skeleton circle width={30} height={30} inline={true} />
                  </td>
                </tr>
              ))
            ) : sortedData.length > 0 ? (
              sortedData.map((row, rowIndex) => (
                <tr
                  key={row.id || row.tutorRequestId || rowIndex}
                  className={rowIndex % 2 === 0 ? "row-even" : "row-odd"}
                  role="row"
                >
                  {columns.map((col) => (
                    <td
                      key={`${col.dataKey}-${rowIndex}`}
                      role="gridcell"
                      className="table-cell"
                    >
                      {col.renderCell
                        ? col.renderCell(getNestedValue(row, col.dataKey), row)
                        : getNestedValue(row, col.dataKey)}
                    </td>
                  ))}
                  {/* --- Action Buttons Cell with Conditional Rendering --- */}
                  <td className="action-buttons" role="gridcell">
                    {/* Render button ONLY if corresponding prop exists */}
                    {onView && (
                      <button
                        onClick={() => onView(row)}
                        title="Xem chi tiết"
                        className="action-button view"
                        aria-label="Xem chi tiết"
                      >
                        {" "}
                        <i className="fa-regular fa-eye"></i>{" "}
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        title="Chỉnh sửa"
                        className="action-button edit"
                        aria-label="Chỉnh sửa"
                      >
                        {" "}
                        <i className="fa-solid fa-pen"></i>{" "}
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        title="Xóa"
                        className="action-button delete"
                        aria-label="Xóa"
                      >
                        {" "}
                        <i className="fa-regular fa-trash-can"></i>{" "}
                      </button>
                    )}

                    {/* Approve/Reject Buttons */}
                    {row[statusKey] === "REQUEST" && (
                      <>
                        {onApprove && (
                          <button
                            onClick={() => onApprove(row)}
                            title="Duyệt yêu cầu"
                            className="action-button approve"
                            aria-label="Duyệt"
                          >
                            {" "}
                            <i className="fa-solid fa-check"></i>{" "}
                          </button>
                        )}
                        {onReject && (
                          <button
                            onClick={() => onReject(row)}
                            title="Từ chối yêu cầu"
                            className="action-button reject"
                            aria-label="Từ chối"
                          >
                            {" "}
                            <i className="fa-solid fa-times"></i>{" "}
                          </button>
                        )}
                      </>
                    )}

                    {/* Lock Button */}
                    {showLock && onLock && (
                      <button
                        onClick={() => onLock(row)}
                        title={row[statusKey] === "ACTIVE" ? "Khóa" : "Mở khóa"}
                        className={`action-button lock ${
                          row[statusKey] === "ACTIVE" ? "unlocked" : "locked"
                        }`}
                        aria-label={
                          row[statusKey] === "ACTIVE" ? "Khóa" : "Mở khóa"
                        }
                      >
                        {" "}
                        <i
                          className={
                            row[statusKey] === "ACTIVE"
                              ? "fa-solid fa-lock-open"
                              : "fa-solid fa-lock"
                          }
                        />{" "}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
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
      {/* Pagination */}
      <div className="pagination-container">
        <div className="total-item-show">
          <label>
            Số dòng/trang:
            <select
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
          </label>
        </div>
        {pageCount > 1 && (
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
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  onView: PropTypes.func, // Optional
  onEdit: PropTypes.func, // Optional
  onDelete: PropTypes.func, // Optional
  onApprove: PropTypes.func, // Optional
  onReject: PropTypes.func, // Optional
  onLock: PropTypes.func, // Optional
  pageCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  forcePage: PropTypes.number,
  onSort: PropTypes.func, // Optional
  loading: PropTypes.bool.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  onItemsPerPageChange: PropTypes.func.isRequired,
  showLock: PropTypes.bool,
  statusKey: PropTypes.string,
};

export default React.memo(TableComponent);
