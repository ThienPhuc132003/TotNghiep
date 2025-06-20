// Helper functions for date formatting
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

export const formatDateForAPI = (dateString) => {
  if (!dateString) return "";

  // If already in DD/MM/YYYY format, return as is
  if (dateString.includes("/")) {
    return dateString;
  }

  // If in YYYY-MM-DD format, convert to DD/MM/YYYY
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Convert DD/MM/YYYY to Date object
export const parseVietnameseDate = (dateString) => {
  if (!dateString) return null;

  // If already a valid date string (YYYY-MM-DD), parse normally
  if (dateString.includes("-")) {
    return new Date(dateString);
  }

  // Parse DD/MM/YYYY format
  const parts = dateString.split("/");
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

  return new Date(year, month, day);
};

// Validate DD/MM/YYYY format
export const validateDateFormat = (dateString) => {
  if (!dateString || dateString.trim() === "") {
    return "Vui lòng nhập ngày";
  }

  const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = dateString.match(dateRegex);

  if (!match) {
    return "Định dạng ngày không hợp lệ. Vui lòng nhập theo định dạng DD/MM/YYYY";
  }

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (month < 1 || month > 12) {
    return "Tháng không hợp lệ (1-12)";
  }

  if (day < 1 || day > 31) {
    return "Ngày không hợp lệ (1-31)";
  }

  // Check if date is valid
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "Ngày không tồn tại";
  }

  return null; // Valid
};

export const validateDateRange = (startDateStr, endDateStr) => {
  // Validate format first
  const startFormatError = validateDateFormat(startDateStr);
  if (startFormatError) return startFormatError;

  const endFormatError = validateDateFormat(endDateStr);
  if (endFormatError) return endFormatError;

  // Parse dates
  const startDate = parseVietnameseDate(startDateStr);
  const endDate = parseVietnameseDate(endDateStr);
  const today = new Date();

  // Remove time part for accurate comparison
  today.setHours(23, 59, 59, 999);

  if (startDate > endDate) {
    return "Ngày bắt đầu không được lớn hơn ngày kết thúc";
  }

  if (endDate > today) {
    return "Ngày kết thúc không được lớn hơn ngày hiện tại";
  }

  return null; // Valid
};

export const getDefaultDateRange = () => {
  const today = new Date();
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

  return {
    startDate: formatDateForAPI(firstDayOfYear.toISOString().split("T")[0]),
    endDate: formatDateForAPI(today.toISOString().split("T")[0]),
  };
};
