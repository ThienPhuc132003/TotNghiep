// src/utils/excelExport.js
import ExcelJS from "exceljs";
import logo_vanlang from "../assets/images/logo.webp";

/**
 * Export data to Excel with Van Lang University logo and formatting
 * @param {Object} config - Configuration object
 * @param {Array} config.data - Data to export
 * @param {Array} config.columns - Column definitions
 * @param {string} config.title - Report title
 * @param {string} config.filename - Output filename
 * @param {Object} config.summaryStats - Summary statistics (optional)
 * @param {string} config.period - Period information (optional)
 * @param {number} config.currentPage - Current page number (optional)
 * @param {number} config.itemsPerPage - Items per page (optional)
 */
export const exportToExcel = async (config) => {
  const {
    data,
    columns,
    title,
    filename,
    summaryStats = {},
    period = "",
    currentPage = 0,
    itemsPerPage = 10,
  } = config;

  try {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Thống kê");

    // Set worksheet properties
    worksheet.pageSetup = {
      orientation: "landscape",
      fitToPage: true,
      fitToHeight: 1,
      fitToWidth: 1,
      margins: {
        left: 0.75,
        right: 0.75,
        top: 1,
        bottom: 1,
        header: 0.3,
        footer: 0.3,
      },
    };

    let currentRow = 1; // Add logo (if available)
    try {
      // Load the logo image
      const logoResponse = await fetch(logo_vanlang);
      const logoBlob = await logoResponse.blob();
      const logoBuffer = await logoBlob.arrayBuffer();

      // Add logo to workbook
      const logoId = workbook.addImage({
        buffer: logoBuffer,
        extension: "png",
      });

      // Add logo to worksheet
      worksheet.addImage(logoId, {
        tl: { col: 0, row: 0 }, // Top-left position
        ext: { width: 80, height: 80 }, // Size
      });
    } catch (logoError) {
      console.warn("Could not load logo:", logoError);
      // Continue without logo if it fails to load
    }

    // Add university header (next to logo)
    const universityCell = worksheet.getCell("B1");
    universityCell.value = "TRƯỜNG ĐẠI HỌC VĂN LANG";
    universityCell.font = { size: 14, bold: true, color: { argb: "FF000000" } };
    universityCell.alignment = { horizontal: "left", vertical: "middle" };

    const departmentCell = worksheet.getCell("B2");
    departmentCell.value = "KHOA CÔNG NGHỆ THÔNG TIN";
    departmentCell.font = { size: 12, bold: true, color: { argb: "FF000000" } };
    departmentCell.alignment = { horizontal: "left", vertical: "middle" };

    currentRow = 4;

    // Add title
    const titleCell = worksheet.getCell(`A${currentRow}`);
    titleCell.value = title.toUpperCase();
    titleCell.font = { size: 16, bold: true, color: { argb: "FF000000" } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    // Merge title across all columns
    const colCount = columns.length;
    worksheet.mergeCells(
      `A${currentRow}:${String.fromCharCode(64 + colCount)}${currentRow}`
    );

    currentRow += 2;

    // Add period information if provided
    if (period) {
      const periodCell = worksheet.getCell(`A${currentRow}`);
      periodCell.value = `Thời gian: ${period}`;
      periodCell.font = { size: 11, italic: true };
      periodCell.alignment = { horizontal: "center" };
      worksheet.mergeCells(
        `A${currentRow}:${String.fromCharCode(64 + colCount)}${currentRow}`
      );
      currentRow += 1;
    }

    // Add summary statistics if provided
    if (Object.keys(summaryStats).length > 0) {
      currentRow += 1;
      const statsKeys = Object.keys(summaryStats);

      statsKeys.forEach((key, index) => {
        const col = index + 1;
        const cell = worksheet.getCell(
          `${String.fromCharCode(64 + col)}${currentRow}`
        );
        cell.value = key;
        cell.font = { bold: true, size: 10 };
        cell.alignment = { horizontal: "center" };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE6F3FF" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        const valueCell = worksheet.getCell(
          `${String.fromCharCode(64 + col)}${currentRow + 1}`
        );
        valueCell.value = summaryStats[key];
        valueCell.font = { bold: true, size: 10 };
        valueCell.alignment = { horizontal: "center" };
        valueCell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      currentRow += 3;
    }

    // Add table headers
    columns.forEach((column, index) => {
      const cell = worksheet.getCell(
        `${String.fromCharCode(65 + index)}${currentRow}`
      );
      cell.value = column.title;
      cell.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      };
    });

    currentRow += 1;

    // Add data rows
    data.forEach((row, rowIndex) => {
      columns.forEach((column, colIndex) => {
        const cell = worksheet.getCell(
          `${String.fromCharCode(65 + colIndex)}${currentRow}`
        );

        let value;
        if (column.dataKey === "stt") {
          // Special handling for STT column
          value = currentPage * itemsPerPage + rowIndex + 1;
        } else if (column.dataKey.includes(".")) {
          // Handle nested properties
          value = column.dataKey
            .split(".")
            .reduce((obj, key) => obj && obj[key], row);
        } else {
          value = row[column.dataKey];
        }

        // Format value based on column type
        if (
          column.dataKey === "averageAssessmentWithTime" &&
          typeof value === "number"
        ) {
          value = value.toFixed(2);
        }

        cell.value = value || "";
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin", color: { argb: "FFD0D0D0" } },
          left: { style: "thin", color: { argb: "FFD0D0D0" } },
          bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
          right: { style: "thin", color: { argb: "FFD0D0D0" } },
        };

        // Alternate row colors
        if (rowIndex % 2 === 1) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8F9FA" },
          };
        }
      });
      currentRow += 1;
    }); // Add footer with current date and location
    currentRow += 2;
    const today = new Date();
    const footerCell = worksheet.getCell(
      `${String.fromCharCode(64 + colCount)}${currentRow}`
    );
    footerCell.value = `TP.Hồ Chí Minh, ngày ${today.getDate()} tháng ${
      today.getMonth() + 1
    } năm ${today.getFullYear()}`;
    footerCell.font = { size: 11, italic: true };
    footerCell.alignment = { horizontal: "right" };

    const creatorCell = worksheet.getCell(
      `${String.fromCharCode(64 + colCount)}${currentRow + 1}`
    );
    creatorCell.value = "Người lập danh sách";
    creatorCell.font = { size: 11, italic: true };
    creatorCell.alignment = { horizontal: "right" };

    // Auto-fit columns
    columns.forEach((column, index) => {
      const col = worksheet.getColumn(index + 1);
      let maxLength = column.title.length;

      data.forEach((row) => {
        let value;
        if (column.dataKey === "stt") {
          value = String(data.length);
        } else if (column.dataKey.includes(".")) {
          value = column.dataKey
            .split(".")
            .reduce((obj, key) => obj && obj[key], row);
        } else {
          value = row[column.dataKey];
        }

        const cellLength = String(value || "").length;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });

      col.width = Math.min(Math.max(maxLength + 2, 12), 30);
    });

    // Generate filename with timestamp if not provided
    const timestamp = new Date().toISOString().slice(0, 10);
    const finalFilename = filename || `thong-ke-${timestamp}.xlsx`;

    // Save the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Create download link
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", finalFilename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Excel export error:", error);
    throw error;
  }
};
