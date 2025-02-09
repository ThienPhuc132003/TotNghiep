// src/components/Table.jsx
import React, { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import ReactPaginate from "react-paginate";
import { useTranslation } from "react-i18next";
import "../assets/css/Table.style.css";
import "../assets/css/Pagination.style.css";
import Spinner from "./Spinner"; // Assuming you have a Spinner component

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const TableComponent = ({ columns, data, onView, onEdit, onDelete, pageCount, onPageChange, forcePage }) => {
  const { t } = useTranslation();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sortedData = useMemo(() => {
    let sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.key);
        const bValue = getNestedValue(b, sortConfig.key);
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const requestSort = useCallback((key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

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
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.dataKey} onClick={() => requestSort(col.dataKey)} role="button" tabIndex={0} aria-sort={sortConfig.key === col.dataKey ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                {col.title}
                {sortConfig.key === col.dataKey && (
                  <span className="sort-indicator">
                    {sortConfig.direction === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
            ))}
            <th>{t("common.actions")}</th>
          </tr>
        </thead>
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
};

const Table = React.memo(TableComponent);
export default Table;