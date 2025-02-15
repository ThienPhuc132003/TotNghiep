// src/components/Table.jsx
import React, { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import ReactPaginate from "react-paginate";
import { useTranslation } from "react-i18next";
import "../assets/css/Table.style.css";
import "../assets/css/Pagination.style.css";
import Spinner from "./Spinner";

const getNestedValue = (obj, path) => {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
};

const TableHeader = React.memo(({ columns, requestSort, sortKey, sortDirection }) => {
  return (
    <thead>
      <tr>
        {columns.map((col) => (
          <th
            key={col.dataKey}
            onClick={() => requestSort(col.dataKey)}
            role="button"
            tabIndex={0}
            aria-sort={
              sortKey === col.dataKey
                ? sortDirection === "asc"
                  ? "ascending"
                  : "descending"
                : "none"
            }
          >
            {col.title}
            {sortKey === col.dataKey && (
              <span className="sort-indicator">
                {sortDirection === "asc" ? "▲" : "▼"}
              </span>
            )}
          </th>
        ))}
        <th>Actions</th>
      </tr>
    </thead>
  );
});

TableHeader.displayName = "TableHeader";

TableHeader.propTypes = {
  columns: PropTypes.array.isRequired,
  requestSort: PropTypes.func.isRequired,
  sortKey: PropTypes.string,
  sortDirection: PropTypes.string,
};

const TableComponent = ({ columns, data, onView, onEdit, onDelete, pageCount, onPageChange, forcePage, onSort }) => {
  const { t } = useTranslation();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestSort = useCallback((key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }));
    onSort(key);
  }, [onSort]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'desc' ? -1 : 1;
      return 0;
    });
  }, [data, sortConfig]);

  const handlePageChange = useCallback(async (selectedPage) => {
    setLoading(true);
    setError(null);
    try {
      await onPageChange(selectedPage);
    } catch (err) {
      setError(t("common.errorLoadingData"));
    } finally {
      setLoading(false);
    }
  }, [onPageChange, t]);

  return (
    <div className="table-container">
      <table className="custom-table" aria-label={t("common.table")}>
        <TableHeader 
          columns={columns} 
          requestSort={requestSort} 
          sortKey={sortConfig.key} 
          sortDirection={sortConfig.direction} 
        />
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + 1} className="loading">
                <Spinner /> {t("common.loading")}
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={columns.length + 1} className="error">
                {error}
              </td>
            </tr>
          ) : sortedData.length > 0 ? (
            sortedData.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? "row-even" : "row-odd"} onDoubleClick={() => onView(row)}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {col.renderCell ? col.renderCell(getNestedValue(row, col.dataKey), row) : getNestedValue(row, col.dataKey)}
                  </td>
                ))}
                <td className="action-buttons">
                  <button onClick={() => onView(row)} title={t("common.view")} className="action-button view" aria-label={t("common.view")}>
                    <i className="fa-regular fa-eye"></i>
                  </button>
                  <button onClick={() => onEdit(row)} title={t("common.edit")} className="action-button edit" aria-label={t("common.edit")}>
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button onClick={() => onDelete(row)} title={t("common.delete")} className="action-button delete" aria-label={t("common.delete")}>
                    <i className="fa-regular fa-trash-can"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 1} className="no-data">
                {t("common.noDataFound")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {pageCount > 1 && (
        <div className="pagination-container">
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
        </div>
      )}
    </div>
  );
};

const Table = React.memo(TableComponent);

TableComponent.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      dataKey: PropTypes.string.isRequired,
      renderCell: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  pageCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  forcePage: PropTypes.number,
  onSort: PropTypes.func.isRequired,
};

export default Table;