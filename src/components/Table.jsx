// TableComponent.jsx
import React, { useMemo, useCallback, useState, useRef } from "react";
import PropTypes from "prop-types";
import ReactPaginate from "react-paginate";
import { useTranslation } from "react-i18next";
import "../assets/css/Table.style.css";
import "../assets/css/Pagination.style.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const getNestedValue = (obj, path) => {
  const value = path.split(".").reduce((acc, part) => acc && acc[part], obj);
  return value;
};

const TableComponent = ({
  columns,
  data,
  onView,
  onEdit,
  onDelete,
  pageCount,
  onPageChange,
  forcePage,
  onSort,
  loading,
  error,
  itemsPerPage,
  onItemsPerPageChange,
  onLock,
  showLock = false,
  statusKey = "status",
}) => {
  const { t } = useTranslation();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const tableContainerRef = useRef(null);

  const requestSort = useCallback(
    (key) => {
      setSortConfig((prevConfig) => ({
        key,
        direction:
          prevConfig.key === key && prevConfig.direction === "asc"
            ? "desc"
            : "asc",
      }));
      onSort(key);
    },
    [onSort]
  );

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "desc" ? -1 : 1;
      return 0;
    });
  }, [data, sortConfig]);

  const handlePageChange = useCallback(
    async (selectedPage) => {
      await onPageChange(selectedPage);
    },
    [onPageChange]
  );

  const skeletonRows = useMemo(() => {
    return Array(5).fill(null);
  }, []);

  const handleItemsPerPageChange = (e) => {
    const newPageSize = Number(e.target.value);
    onItemsPerPageChange(newPageSize);
  };

  return (
    <div className="main-table-container">
      <div className="table-scrollable-container" ref={tableContainerRef}>
        <table
          className="custom-table"
          aria-label={t("common.table")}
          role="grid"
        >
          <thead className="custom-table-header">
            <tr role="row">
              {columns.map((col) => (
                <th
                  key={col.dataKey}
                  className="sortable-header"
                  onClick={() => requestSort(col.dataKey)}
                  role="columnheader"
                  tabIndex={0}
                >
                  {col.title}
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
                </th>
              ))}
              <th role="columnheader"></th>
            </tr>
          </thead>
          <tbody role="rowgroup">
            {loading ? (
              skeletonRows.map((_, index) => (
                <tr key={index} role="row">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} role="gridcell" className="table-cell">
                      <Skeleton height={20} />
                    </td>
                  ))}
                  <td role="gridcell" className="action-buttons">
                    <Skeleton circle width={30} height={30} />
                    <Skeleton circle width={30} height={30} />
                    <Skeleton circle width={30} height={30} />
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="error"
                  role="gridcell"
                >
                  {error}
                </td>
              </tr>
            ) : sortedData.length > 0 ? (
              sortedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={rowIndex % 2 === 0 ? "row-even" : "row-odd"}
                  onDoubleClick={() => onView(row)}
                  role="row"
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} role="gridcell" className="table-cell">
                      {col.renderCell
                        ? col.renderCell(getNestedValue(row, col.dataKey), row)
                        : getNestedValue(row, col.dataKey)}
                    </td>
                  ))}
                  <td className="action-buttons" role="gridcell">
                    {onView && (
                      <button
                        onClick={() => onView(row)}
                        title={t("common.view")}
                        className="action-button view"
                        aria-label={t("common.view")}
                      >
                        <i className="fa-regular fa-eye"></i>
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        title={t("common.edit")}
                        className="action-button edit"
                        aria-label={t("common.edit")}
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        title={t("common.delete")}
                        className="action-button delete"
                        aria-label={t("common.delete")}
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    )}
                    {showLock && (
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
                        <i
                          className={
                            row[statusKey] === "ACTIVE"
                              ? "fa-solid fa-lock-open"
                              : "fa-solid fa-lock"
                          }
                        />
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
                  {t("common.noDataFound")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="pagination-container">
        <div className="total-item-show">
          <label>
            Số dữ liệu mỗi trang:
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="item-per-page-select"
            >
              {[5, 20, 50, 100].map((size) => (
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
  pageCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  forcePage: PropTypes.number,
  onSort: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  itemsPerPage: PropTypes.number.isRequired,
  onItemsPerPageChange: PropTypes.func.isRequired,
  onLock: PropTypes.func,
  showLock: PropTypes.bool,
  statusKey: PropTypes.string,
};

export default React.memo(TableComponent);
