/* eslint-disable no-undef */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css"; // Shared styles
import "../../assets/css/Modal.style.css"; // Modal styles
import "../../assets/css/FormDetail.style.css"; // Ensure FormDetail styles are imported
import Table from "../../components/Table";
import SearchBar from "../../components/SearchBar";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import FormDetail from "../../components/FormDetail";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import qs from "qs";
import { Alert } from "@mui/material";
// Removed unidecode import
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format, isValid, parseISO } from "date-fns";
// --- Helper Functions ---

// Helper lấy giá trị lồng nhau an toàn
const getSafeNestedValue = (obj, path, defaultValue = "N/A") => {
  if (!obj || !path) return defaultValue;
  // Improved check for intermediate properties being objects
  const value = path
    .split(".")
    .reduce(
      (acc, part) => (acc && typeof acc === "object" ? acc[part] : undefined),
      obj
    );
  return value !== undefined && value !== null ? value : defaultValue;
};

// Định dạng trạng thái user (checkActive)
const formatUserStatus = (status) => {
  switch (status) {
    case "ACTIVE":
      return <span className="status status-active">Hoạt động</span>;
    case "BLOCKED":
      return <span className="status status-blocked">Đã khóa</span>;
    default:
      return (
        <span className="status status-unknown">{status || "Không rõ"}</span>
      );
  }
};

// Định dạng giới tính
const formatGender = (gender) => {
  if (gender === "MALE") return "Nam";
  if (gender === "FEMALE") return "Nữ";
  return "Chưa cập nhật";
};

// Định dạng ngày tháng (an toàn hơn)
const safeFormatDate = (dateInput, formatString = "dd/MM/yyyy") => {
  if (!dateInput) return "Chưa cập nhật";
  try {
    // Handle both string and Date objects
    const date =
      typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    return isValid(date) ? format(date, formatString) : "Ngày không hợp lệ";
  } catch (e) {
    console.error("Error formatting date:", dateInput, e);
    return "Lỗi định dạng ngày";
  }
};

// Render link cho file/URL (an toàn hơn)
const renderEvidenceLink = (url) => {
  if (!url || typeof url !== "string") return "Không có";
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return "Không có";
  // More robust check for external links
  const isExternalLink = /^(https?:\/\/|blob:)/i.test(trimmedUrl);
  return (
    <a
      href={isExternalLink ? trimmedUrl : "#"}
      target={isExternalLink ? "_blank" : "_self"}
      rel="noopener noreferrer"
      className={`evidence-link ${!isExternalLink ? "disabled-link" : ""}`}
      onClick={(e) => !isExternalLink && e.preventDefault()}
      title={isExternalLink ? `Mở: ${trimmedUrl}` : "Không có link hợp lệ"}
      style={{
        color: isExternalLink ? "#007bff" : "#6c757d",
        textDecoration: isExternalLink ? "underline" : "none",
        cursor: isExternalLink ? "pointer" : "default",
      }}
    >
      {isExternalLink ? "Xem Link/File" : "Không có"}
    </a>
  );
};

// Định dạng lịch dạy (dateTimeLearn) - xử lý lỗi tốt hơn
const daysOfWeekMap = {
  Monday: "Thứ 2",
  Tuesday: "Thứ 3",
  Wednesday: "Thứ 4",
  Thursday: "Thứ 5",
  Friday: "Thứ 6",
  Saturday: "Thứ 7",
  Sunday: "Chủ Nhật",
};
const formatDateTimeLearn = (dateTimeLearnArray) => {
  if (!Array.isArray(dateTimeLearnArray) || dateTimeLearnArray.length === 0) {
    return "Chưa cập nhật lịch rảnh";
  }
  try {
    const parsed = dateTimeLearnArray
      .map((jsonString, index) => {
        if (typeof jsonString !== "string" || !jsonString.trim()) return null;
        try {
          return JSON.parse(jsonString);
        } catch (e) {
          console.error(
            `Error parsing JSON string at index ${index}:`,
            jsonString,
            e
          );
          return null;
        }
      })
      .filter((item) => item && item.day && Array.isArray(item.times)); // Filter valid entries

    if (parsed.length === 0) return "Chưa cập nhật lịch rảnh hợp lệ";

    return (
      <ul
        className="datetime-list"
        style={{ paddingLeft: "1.2em", margin: 0, listStyleType: "none" }}
      >
        {parsed.map((item, index) => (
          <li key={index}>
            <strong>{daysOfWeekMap[item.day] || item.day}</strong>:{" "}
            {item.times.length > 0 ? item.times.join(", ") : "Chưa có giờ"}
          </li>
        ))}
      </ul>
    );
  } catch (e) {
    console.error("Unexpected error parsing dateTimeLearn:", e);
    return "Lỗi định dạng lịch";
  }
};

// Định dạng phương thức dạy
const formatTeachingMethod = (method) => {
  switch (method) {
    case "ONLINE":
      return "Trực tuyến";
    case "OFFLINE":
      return "Tại nhà";
    case "BOTH":
      return "Cả hai";
    default:
      return "Chưa cập nhật";
  }
};
// --- End Helper Functions ---

Modal.setAppElement("#root");

const ListOfTutorPage = () => {
  const { t } = useTranslation();

  // --- State Variables ---
  const [data, setData] = useState([]); // State chính chứa dữ liệu từ API
  // Bỏ filteredData
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(0); // 0-based index
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default 10
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false); // Loading cho bảng
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Query tìm kiếm thực tế
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  }); // Sắp xếp mặc định
  const [isModalOpen, setIsModalOpen] = useState(false); // Chỉ dùng cho View
  const [modalData, setModalData] = useState(null);
  const [modalMode, setModalMode] = useState(null); // Chỉ là 'view'
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(""); // Message động cho modal xóa
  const [isProcessingLock, setIsProcessingLock] = useState(false); // Loading riêng cho lock/unlock
  const [isDeleting, setIsDeleting] = useState(false); // Loading riêng cho delete

  const currentPath = "/gia-su";

  // Bỏ URL Synchronization

  // --- Reset State ---
  const resetState = () => {
    setSearchInput("");
    setSearchQuery("");
    setSortConfig({ key: "createdAt", direction: "desc" });
    setCurrentPage(0);
    setItemsPerPage(10); // Reset itemsPerPage về default
    // fetchData sẽ tự chạy lại
  };

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log(
      `Fetching tutors: page=${currentPage + 1}, rpp=${itemsPerPage}, sort=${
        sortConfig.key
      }(${sortConfig.direction}), search=${searchQuery}`
    );
    try {
      // Luôn filter roleId=TUTOR
      const filterConditions = [
        { key: "roleId", operator: "equal", value: "TUTOR" },
      ];

      // Thêm điều kiện tìm kiếm nếu có searchQuery
      if (searchQuery) {
        filterConditions.push({
          // Giả định backend hỗ trợ tìm kiếm 'like' trên các trường này
          key: "userId,userProfile.fullname,email,phoneNumber,tutorProfile.tutorLevel.levelName", // Thêm tìm theo hạng?
          operator: "like", // hoặc 'search'
          value: searchQuery,
        });
      }

      // Xây dựng query object
      const query = {
        rpp: itemsPerPage,
        page: currentPage + 1,
        filter: JSON.stringify(filterConditions), // Gửi filter kết hợp
        sort: JSON.stringify([
          { key: sortConfig.key, type: sortConfig.direction.toUpperCase() },
        ]),
      };

      const queryString = qs.stringify(query, {
        encodeValuesOnly: true,
        arrayFormat: "brackets",
      });
      console.log("API Request URL:", `/user/search?${queryString}`);

      const response = await Api({
        endpoint: `/user/search?${queryString}`, // Endpoint tìm user
        method: METHOD_TYPE.GET,
      });
      console.log("API Response (Tutors):", response);

      if (
        response.success &&
        response.data &&
        Array.isArray(response.data.items)
      ) {
        setData(response.data.items); // Cập nhật state data chính
        setTotalItems(response.data.total || 0);
        setPageCount(Math.ceil((response.data.total || 0) / itemsPerPage));
      } else {
        const errorMsg =
          response.message ||
          t("common.errorLoadingData") ||
          "Lỗi tải dữ liệu gia sư.";
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("Fetch tutor error:", error);
      const errorMsg =
        error.message ||
        t("common.errorLoadingData") ||
        "Đã xảy ra lỗi không mong muốn.";
      setError(errorMsg);
      setData([]); // Reset data khi lỗi
      setTotalItems(0);
      setPageCount(1);
      toast.error(`Tải danh sách gia sư thất bại: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, sortConfig, searchQuery, t]); // Phụ thuộc vào các state điều khiển fetch

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Gọi fetchData khi dependencies thay đổi
  // --- End Data Fetching ---

  // --- Event Handlers ---
  const handlePageClick = (event) => {
    if (typeof event.selected === "number") {
      setCurrentPage(event.selected);
    }
  };

  const handleItemsPerPageChange = (newPageSize) => {
    setItemsPerPage(newPageSize);
    setCurrentPage(0);
  };

  const handleSearchInputChange = (value) => {
    // Đổi tên tham số cho rõ ràng
    setSearchInput(value);
  };

  const handleApplySearch = () => {
    // Đổi tên hàm
    if (searchQuery !== searchInput) {
      setCurrentPage(0);
      setSearchQuery(searchInput); // Chỉ cập nhật searchQuery ở đây
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleApplySearch(); // Gọi hàm mới
    }
  };

  const handleSort = (sortKey) => {
    if (!sortKey) return;
    setSortConfig((prev) => ({
      key: sortKey,
      direction:
        prev.key === sortKey && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(0);
  };

  // --- Action Handlers ---
  const handleDeleteClick = (tutor) => {
    // Nhận cả object
    if (!tutor || !tutor.userId) return;
    const tutorName = getSafeNestedValue(
      tutor,
      "userProfile.fullname",
      tutor.userId
    );
    setDeleteItemId(tutor.userId);
    setDeleteMessage(
      `Bạn có chắc muốn xóa gia sư "${tutorName}"? Hành động này sẽ xóa thông tin liên quan và không thể hoàn tác.`
    );
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;
    setIsDeleting(true); // Bắt đầu loading xóa
    console.log(`Attempting to delete tutor: ${deleteItemId}`);
    try {
      const response = await Api({
        endpoint: `user/delete-user-by-id/${deleteItemId}`,
        method: METHOD_TYPE.DELETE,
      });
      if (response.success) {
        toast.success("Xóa gia sư thành công!");
        if (data.length === 1 && currentPage > 0) {
          // Nếu xóa item cuối cùng của trang và không phải trang đầu -> lùi trang
          setCurrentPage(currentPage - 1); // Trigger fetchData ở trang trước
        } else {
          // Nếu không, fetch lại trang hiện tại
          fetchData();
        }
      } else {
        throw new Error(response.message || "Xóa thất bại.");
      }
    } catch (error) {
      console.error("Delete tutor error:", error);
      toast.error(`Xóa thất bại: ${error.message}`);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
      setDeleteMessage("");
      setIsDeleting(false); // Kết thúc loading xóa
    }
  };

  const handleViewClick = (tutor) => {
    if (!tutor) return;
    console.log("Viewing Tutor Data:", tutor);
    // Chuẩn bị dữ liệu đầy đủ hơn cho modal view nếu cần
    setModalData(tutor); // Truyền nguyên object tutor
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleLockClick = async (tutor) => {
    if (!tutor || !tutor.userId) return;
    const newCheckActive =
      tutor.checkActive === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const actionText = newCheckActive === "ACTIVE" ? "Mở khóa" : "Khóa";
    const tutorName = getSafeNestedValue(
      tutor,
      "userProfile.fullname",
      tutor.userId
    );

    if (
      !window.confirm(
        `Bạn có chắc muốn ${actionText} tài khoản "${tutorName}"?`
      )
    )
      return;

    setIsProcessingLock(true); // Bắt đầu loading lock
    console.log(`Attempting to ${actionText} tutor: ${tutor.userId}`);
    try {
      const response = await Api({
        endpoint: `user/update-user-by-id/${tutor.userId}`,
        method: METHOD_TYPE.PUT,
        data: { checkActive: newCheckActive },
      });
      if (response.success) {
        // Cập nhật state data để UI thay đổi ngay
        setData((prevData) =>
          prevData.map((item) =>
            item.userId === tutor.userId
              ? { ...item, checkActive: newCheckActive }
              : item
          )
        );
        toast.success(`${actionText} tài khoản "${tutorName}" thành công!`);
      } else {
        throw new Error(response.message || `${actionText} thất bại.`);
      }
    } catch (error) {
      console.error(`Error ${actionText} tutor:`, error);
      toast.error(`${actionText} thất bại: ${error.message}`);
    } finally {
      setIsProcessingLock(false); // Kết thúc loading lock
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setModalData(null);
      setModalMode(null);
    }, 300); // Giữ delay nếu muốn animation
  };
  // --- End Action Handlers ---

  // --- Table Columns Definition ---
  const columns = useMemo(
    () => [
      // Sử dụng getSafeNestedValue để render an toàn hơn
      {
        title: t("admin.name"),
        dataKey: "userProfile.fullname",
        sortKey: "userProfile.fullname",
        sortable: true,
        renderCell: (_, row) =>
          getSafeNestedValue(row, "userProfile.fullname", "Chưa có tên"),
      },
      {
        title: t("admin.email"),
        dataKey: "email",
        sortable: true,
        renderCell: (val) => val || "Chưa có email",
      },
      {
        title: t("admin.phone"),
        dataKey: "phoneNumber",
        sortable: false,
        renderCell: (val) => val || "Chưa có SĐT",
      },
      {
        title: "Giới tính",
        dataKey: "userProfile.gender",
        sortKey: "userProfile.gender",
        sortable: true,
        renderCell: (v, row) =>
          formatGender(getSafeNestedValue(row, "userProfile.gender", null)),
      },
      {
        title: "Hạng",
        dataKey: "tutorProfile.tutorLevel.levelName",
        sortKey: "tutorProfile.tutorLevel.levelName",
        sortable: true,
        renderCell: (_, row) =>
          getSafeNestedValue(
            row,
            "tutorProfile.tutorLevel.levelName",
            "Chưa hạng"
          ),
      },
      {
        title: t("admin.status"),
        dataKey: "checkActive",
        sortable: true,
        renderCell: formatUserStatus,
      },
      {
        title: "Ngày tạo",
        dataKey: "createdAt",
        sortable: true,
        renderCell: (v) => safeFormatDate(v, "dd/MM/yyyy"),
      }, // Format ngắn gọn hơn
    ],
    [t]
  );
  // --- End Table Columns Definition ---

  // --- Form Fields for Detail View ---
  // Giữ nguyên hoặc tối ưu viewFields nếu cần
  const viewFields = useMemo(
    () => [
      // Phần User
      {
        key: "userProfile.fullname",
        label: "Họ và Tên",
        section: "Thông tin chung",
      }, // Thêm section
      { key: "email", label: "Email đăng nhập", section: "Thông tin chung" },
      {
        key: "phoneNumber",
        label: "SĐT đăng nhập",
        section: "Thông tin chung",
      },
      { key: "userId", label: "User ID", section: "Thông tin chung" },
      {
        key: "checkActive",
        label: "Trạng thái tài khoản",
        renderValue: formatUserStatus,
        section: "Thông tin chung",
      },
      {
        key: "coin",
        label: "Số dư Coin",
        renderValue: (val) => (val ?? 0).toLocaleString(),
        section: "Thông tin chung",
      },
      {
        key: "createdAt",
        label: "Ngày tạo tài khoản",
        renderValue: (d) => safeFormatDate(d, "dd/MM/yyyy HH:mm"),
        section: "Thông tin chung",
      },
      {
        key: "updatedAt",
        label: "Cập nhật lần cuối",
        renderValue: (d) =>
          d ? safeFormatDate(d, "dd/MM/yyyy HH:mm") : "Chưa cập nhật",
        section: "Thông tin chung",
      },

      // Phần User Profile
      {
        key: "userProfile.userDisplayName",
        label: "Tên hiển thị",
        section: "Hồ sơ người dùng (User Profile)",
      },
      {
        key: "userProfile.personalEmail",
        label: "Email cá nhân",
        section: "Hồ sơ người dùng (User Profile)",
      },
      {
        key: "userProfile.homeAddress",
        label: "Địa chỉ nhà",
        renderValue: (val) => val || "Chưa cập nhật",
        section: "Hồ sơ người dùng (User Profile)",
      },
      {
        key: "userProfile.birthday",
        label: "Ngày sinh",
        renderValue: (v, row) =>
          safeFormatDate(
            getSafeNestedValue(row, "userProfile.birthday", null),
            "dd/MM/yyyy"
          ),
        section: "Hồ sơ người dùng (User Profile)",
      },
      {
        key: "userProfile.gender",
        label: "Giới tính",
        renderValue: (v, row) =>
          formatGender(getSafeNestedValue(row, "userProfile.gender", null)),
        section: "Hồ sơ người dùng (User Profile)",
      },
      {
        key: "userProfile.major.majorName",
        label: "Chuyên ngành",
        renderValue: (v, row) =>
          getSafeNestedValue(
            row,
            "userProfile.major.majorName",
            "Chưa cập nhật"
          ),
        section: "Hồ sơ người dùng (User Profile)",
      },

      // Phần Tutor Profile
      {
        key: "tutorProfile.tutorLevel.levelName",
        label: "Hạng Gia Sư",
        renderValue: (v, row) =>
          getSafeNestedValue(
            row,
            "tutorProfile.tutorLevel.levelName",
            "Chưa có"
          ),
        section: "Hồ sơ gia sư (Tutor Profile)",
      },
      {
        key: "tutorProfile.tutorLevel.description",
        label: "Mô tả hạng",
        renderValue: (v, row) =>
          getSafeNestedValue(
            row,
            "tutorProfile.tutorLevel.description",
            "Chưa có"
          ),
        section: "Hồ sơ gia sư (Tutor Profile)",
      },
      {
        key: "tutorProfile.coinPerHours",
        label: "Coin/Giờ",
        renderValue: (v, row) =>
          getSafeNestedValue(
            row,
            "tutorProfile.coinPerHours",
            0
          ).toLocaleString(),
        section: "Hồ sơ gia sư (Tutor Profile)",
      },
      {
        key: "totalTestPoints",
        label: "Điểm Test tổng",
        renderValue: (val) => val ?? "Chưa có",
        section: "Hồ sơ gia sư (Tutor Profile)",
      },
      {
        key: "tutorProfile.univercity",
        label: "Trường Đại học",
        renderValue: (v, row) =>
          getSafeNestedValue(row, "tutorProfile.univercity", "Chưa cập nhật"),
        section: "Hồ sơ gia sư (Tutor Profile)",
      },
      {
        key: "tutorProfile.major.majorName",
        label: "Chuyên ngành (Tutor)",
        renderValue: (v, row) =>
          getSafeNestedValue(
            row,
            "tutorProfile.major.majorName",
            "Chưa cập nhật"
          ),
        section: "Hồ sơ gia sư (Tutor Profile)",
      },
      {
        key: "tutorProfile.GPA",
        label: "Điểm GPA",
        renderValue: (v, row) =>
          getSafeNestedValue(row, "tutorProfile.GPA", "Chưa có"),
        section: "Hồ sơ gia sư (Tutor Profile)",
      },
      {
        key: "tutorProfile.evidenceOfGPA",
        label: "Minh chứng GPA",
        renderValue: (v, row) =>
          renderEvidenceLink(
            getSafeNestedValue(row, "tutorProfile.evidenceOfGPA", null)
          ),
        section: "Hồ sơ gia sư (Tutor Profile)",
      },
      {
        key: "tutorProfile.description",
        label: "Giới thiệu bản thân",
        renderValue: (v, row) =>
          getSafeNestedValue(row, "tutorProfile.description", "Chưa có"),
        section: "Hồ sơ gia sư (Tutor Profile)",
      },
      {
        key: "tutorProfile.subject.subjectName",
        label: "Môn học 1",
        renderValue: (v, row) =>
          getSafeNestedValue(
            row,
            "tutorProfile.subject.subjectName",
            "Chưa có"
          ),
        section: "Hồ sơ gia sư (Tutor Profile)",
      },
      {
        key: "tutorProfile.evidenceOfSubject",
        label: "Minh chứng môn 1",
        renderValue: (v, row) =>
          renderEvidenceLink(
            getSafeNestedValue(row, "tutorProfile.evidenceOfSubject", null)
          ),
        section: "Hồ sơ gia sư (Tutor Profile)",
      },
      // ... (Thêm các môn 2, 3 tương tự nếu cần)
      {
        key: "tutorProfile.teachingTime",
        label: "Thời gian/tiết (giờ)",
        renderValue: (v, row) => {
          const val = getSafeNestedValue(
            row,
            "tutorProfile.teachingTime",
            null
          );
          return val ? `${parseFloat(val).toFixed(1)} giờ` : "Chưa có";
        },
        section: "Hồ sơ gia sư (Tutor Profile)",
      },
      {
        key: "tutorProfile.teachingMethod",
        label: "Phương thức dạy",
        renderValue: (v, row) =>
          formatTeachingMethod(
            getSafeNestedValue(row, "tutorProfile.teachingMethod", null)
          ),
        section: "Hồ sơ gia sư (Tutor Profile)",
      },
      {
        key: "tutorProfile.teachingPlace",
        label: "Khu vực dạy Offline",
        renderValue: (v, row) =>
          getSafeNestedValue(row, "tutorProfile.teachingPlace", "Chưa có"),
        section: "Hồ sơ gia sư (Tutor Profile)",
      },
      {
        key: "tutorProfile.isUseCurriculumn",
        label: "Sử dụng giáo trình riêng",
        renderValue: (v, row) => {
          const val = getSafeNestedValue(
            row,
            "tutorProfile.isUseCurriculumn",
            null
          );
          return typeof val === "boolean" ? (val ? "Có" : "Không") : "Chưa có";
        },
        section: "Hồ sơ gia sư (Tutor Profile)",
      },
      {
        key: "tutorProfile.videoUrl",
        label: "Video giới thiệu",
        renderValue: (v, row) =>
          renderEvidenceLink(
            getSafeNestedValue(row, "tutorProfile.videoUrl", null)
          ),
        section: "Hồ sơ gia sư (Tutor Profile)",
      },
      {
        key: "tutorProfile.bankName",
        label: "Ngân hàng",
        renderValue: (v, row) =>
          getSafeNestedValue(row, "tutorProfile.bankName", "Chưa có"),
        section: "Hồ sơ gia sư (Tutor Profile)",
      },
      {
        key: "tutorProfile.bankNumber",
        label: "Số tài khoản",
        renderValue: (v, row) =>
          getSafeNestedValue(row, "tutorProfile.bankNumber", "Chưa có"),
        section: "Hồ sơ gia sư (Tutor Profile)",
      },
      {
        key: "tutorProfile.dateTimeLearn",
        label: "Lịch rảnh",
        renderValue: (v, row) =>
          formatDateTimeLearn(
            getSafeNestedValue(row, "tutorProfile.dateTimeLearn", [])
          ),
        section: "Hồ sơ gia sư (Tutor Profile)",
      },
      {
        key: "tutorProfile.isPublicProfile",
        label: "Công khai Profile",
        renderValue: (v, row) => {
          const val = getSafeNestedValue(
            row,
            "tutorProfile.isPublicProfile",
            null
          );
          return typeof val === "boolean" ? (val ? "Có" : "Không") : "Chưa có";
        },
        section: "Hồ sơ gia sư (Tutor Profile)",
      },
    ],
    [] // Thêm dependencies nếu có dùng biến ngoài (ví dụ: t)
  );
  // --- End Form Fields ---

  // --- JSX Rendering ---
  const childrenMiddleContentLower = (
    <div className="admin-content">
      <h2 className="admin-list-title">Danh sách Gia sư</h2>
      <div className="search-bar-filter-container">
        <div className="search-bar-filter">
          <SearchBar
            value={searchInput}
            onChange={handleSearchInputChange}
            onKeyPress={handleSearchKeyPress} // Add Enter key press handler
            searchBarClassName="admin-search"
            searchInputClassName="admin-search-input"
            placeholder="Tìm tên, email, SĐT, ID, hạng..." // Update placeholder
          />
          {/* Search button */}
          <button
            onClick={handleApplySearch}
            className="refresh-button"
            title="Tìm kiếm"
          >
            <i className="fa-solid fa-search"></i>
          </button>
          {/* Reset button */}
          <button
            className="refresh-button"
            onClick={resetState}
            title="Làm mới"
          >
            <i className="fa-solid fa-rotate fa-lg"></i>
          </button>
        </div>
        {/* No Add button */}
        <div className="filter-add-admin"></div>
      </div>

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <Table
        columns={columns}
        data={data} // Use 'data' state directly
        totalItems={totalItems} // Pass total items for pagination logic
        // Actions
        onView={handleViewClick}
        onDelete={handleDeleteClick} // Pass the student object
        onLock={handleLockClick} // Pass the lock handler
        showLock={true} // Enable lock button
        statusKey="checkActive" // Use 'checkActive' for lock status
        // Pagination & Sort
        pageCount={pageCount}
        onPageChange={handlePageClick}
        forcePage={currentPage}
        onSort={handleSort}
        currentSortConfig={sortConfig} // Pass current sort state
        // Loading & Items per page
        loading={isLoading || isProcessingLock} // Combine loading states
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Total count display */}
      {!isLoading && !error && totalItems > 0 && (
        <p
          style={{
            textAlign: "right",
            marginTop: "1rem",
            color: "#555",
            fontSize: "0.9em",
          }}
        >
          Tổng số gia sư: {totalItems}
        </p>
      )}
    </div>
  );

  return (
    <AdminDashboardLayout
      currentPath={currentPath}
      childrenMiddleContentLower={childrenMiddleContentLower}
    >
      {/* View Modal */}
      <Modal
        isOpen={isModalOpen && modalMode === "view"} // Ensure modal opens only in view mode
        onRequestClose={handleCloseModal}
        contentLabel="Chi tiết Gia sư"
        className="modal large" // Use 'large' class for potentially more content
        overlayClassName="overlay"
        closeTimeoutMS={300}
      >
        {/* Conditionally render FormDetail only when modalData is available */}
        {modalData && (
          <FormDetail
            formData={modalData}
            fields={viewFields}
            mode="view" // Explicitly set mode to view
            title="Chi tiết Gia sư"
            onClose={handleCloseModal}
            // Attempt to get avatar from tutorProfile first, then userProfile
            avatarUrl={getSafeNestedValue(
              modalData,
              "tutorProfile.avatar",
              getSafeNestedValue(modalData, "userProfile.avatar", null)
            )}
            // Pass section definitions if FormDetail supports them
            // sections={[{key: 'general', title: 'Thông tin chung'}, {key: 'user_profile', title: 'Hồ sơ người dùng'}, {key: 'tutor_profile', title: 'Hồ sơ gia sư'}]}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message={deleteMessage} // Use dynamic message
        isDeleting={isDeleting} // Pass deleting state
      />

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </AdminDashboardLayout>
  );
};

const ListOfTutor = React.memo(ListOfTutorPage);
export default ListOfTutor;
