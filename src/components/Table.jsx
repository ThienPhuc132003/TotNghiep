// src/components/Table.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import ReactPaginate from "react-paginate";
import { useTranslation } from "react-i18next";
import "../assets/css/Table.style.css";
import "../assets/css/Pagination.style.css";

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const TableComponent = ({ columns, data, onView, onEdit, onDelete, pageCount, onPageChange }) => {
  const { t } = useTranslation();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedData = React.useMemo(() => {
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

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.dataKey} onClick={() => requestSort(col.dataKey)}>
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
          {sortedData.length > 0 ? (
            sortedData.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? "row-even" : "row-odd"} onDoubleClick={() => onView(row)}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {col.renderCell ? col.renderCell(getNestedValue(row, col.dataKey), row) : getNestedValue(row, col.dataKey)}
                  </td>
                ))}
                <td className="action-buttons">
                  <button onClick={() => onView(row)} title={t("common.view")} className="action-button view">
                    <i className="fa-regular fa-eye"></i>
                  </button>
                  <button onClick={() => onEdit(row)} title={t("common.edit")} className="action-button edit">
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button onClick={() => onDelete(row)} title={t("common.delete")} className="action-button delete">
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
            onPageChange={onPageChange}
            containerClassName={"pagination"}
            activeClassName={"active"}
            disabledClassName={"disabled"}
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
};

const Table = React.memo(TableComponent);
export default Table;