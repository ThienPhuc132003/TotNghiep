import React, { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import ReactPaginate from "react-paginate";
import { useTranslation } from "react-i18next";
import "../assets/css/Table.style.css";
import "../assets/css/Pagination.style.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const getNestedValue = (obj, path) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
};

const TableHeader = React.memo(
    ({ columns, requestSort, sortKey, sortDirection }) => {
        return (
            <thead role="rowgroup">
                <tr role="row">
                    {columns.map((col) => (
                        <th
                            key={col.dataKey}
                            onClick={() => requestSort(col.dataKey)}
                            role="columnheader"
                            tabIndex={0}
                            aria-sort={
                                sortKey === col.dataKey
                                    ? sortDirection === "asc"
                                        ? "ascending"
                                        : "descending"
                                    : "none"
                            }
                            className="table-cell"
                        >
                            {col.title}
                            {sortKey === col.dataKey && (
                                <span className="sort-indicator">
                                    {sortDirection === "asc" ? "▲" : "▼"}
                                </span>
                            )}
                        </th>
                    ))}
                    <th role="columnheader">Actions</th>
                </tr>
            </thead>
        );
    }
);

TableHeader.displayName = "TableHeader";

TableHeader.propTypes = {
    columns: PropTypes.array.isRequired,
    requestSort: PropTypes.func.isRequired,
    sortKey: PropTypes.string,
    sortDirection: PropTypes.string,
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
    loading, // Nhận prop loading từ bên ngoài
    error,   // Nhận prop error từ bên ngoài
}) => {
    const { t } = useTranslation();
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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

    return (
        <div className="main-table-container">
            <div className="table-scrollable-container">
                <table
                    className="custom-table"
                    aria-label={t("common.table")}
                    role="grid"
                >
                    <TableHeader
                        columns={columns}
                        requestSort={requestSort}
                        sortKey={sortConfig.key}
                        sortDirection={sortConfig.direction}
                    />
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
                                        <td
                                            key={colIndex}
                                            className={`table-cell ${col.dataKey === "email" ? "table-cell-email" : ""
                                                }`}
                                            role="gridcell"
                                        >
                                            {col.renderCell
                                                ? col.renderCell(getNestedValue(row, col.dataKey), row)
                                                : getNestedValue(row, col.dataKey)}
                                        </td>
                                    ))}
                                    <td className="action-buttons" role="gridcell">
                                        <button
                                            onClick={() => onView(row)}
                                            title={t("common.view")}
                                            className="action-button view"
                                            aria-label={t("common.view")}
                                        >
                                            <i className="fa-regular fa-eye"></i>
                                        </button>
                                        <button
                                            onClick={() => onEdit(row)}
                                            title={t("common.edit")}
                                            className="action-button edit"
                                            aria-label={t("common.edit")}
                                        >
                                            <i className="fa-solid fa-pen"></i>
                                        </button>
                                        <button
                                            onClick={() => onDelete(row)}
                                            title={t("common.delete")}
                                            className="action-button delete"
                                            aria-label={t("common.delete")}
                                        >
                                            <i className="fa-regular fa-trash-can"></i>
                                        </button>
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
    onSort: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired, // Thêm prop loading
    error: PropTypes.string,             // Thêm prop error
};

export default React.memo(TableComponent);