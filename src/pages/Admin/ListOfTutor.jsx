/* eslint-disable no-undef */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css"; // Shared styles
import "../../assets/css/Modal.style.css"; // Modal styles
import "../../assets/css/FormDetail.style.css";
import Table from "../../components/Table";
import SearchBar from "../../components/SearchBar";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import FormDetail from "../../components/FormDetail";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
// qs không còn cần thiết nếu API không dùng nó trực tiếp ở FE nữa
import { Alert } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format, isValid, parseISO } from "date-fns";

// --- Helper Functions ---
const getSafeNestedValue = (obj, path, defaultValue = "N/A") => {
  if (!obj || !path) return defaultValue;
  const value = path
    .split(".")
    .reduce(
      (acc, part) => (acc && typeof acc === "object" ? acc[part] : undefined),
      obj
    );
  return value !== undefined && value !== null ? value : defaultValue;
};

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

const formatGender = (gender) => {
  if (gender === "MALE") return "Nam";
  if (gender === "FEMALE") return "Nữ";
  return "Chưa cập nhật";
};

const safeFormatDate = (dateInput, formatString = "dd/MM/yyyy") => {
  if (!dateInput) return "Chưa cập nhật";
  try {
    const date =
      typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    return isValid(date) ? format(date, formatString) : "Ngày không hợp lệ";
  } catch (e) {
    return "Lỗi định dạng ngày";
  }
};

const renderEvidenceLink = (url) => {
  if (!url || typeof url !== "string") return "Không có";
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return "Không có";
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
      .map((jsonString) => {
        if (typeof jsonString !== "string" || !jsonString.trim()) return null;
        try {
          return JSON.parse(jsonString);
        } catch (e) {
          return null;
        }
      })
      .filter((item) => item && item.day && Array.isArray(item.times));

    if (parsed.length === 0) return "Chưa cập nhật lịch rảnh hợp lệ";
    return (
      <ul style={{ paddingLeft: "1.2em", margin: 0, listStyleType: "none" }}>
        {parsed.map((item, index) => (
          <li key={index}>
            <strong>{daysOfWeekMap[item.day] || item.day}</strong>:{" "}
            {item.times.length > 0 ? item.times.join(", ") : "Chưa có giờ"}
          </li>
        ))}
      </ul>
    );
  } catch (e) {
    return "Lỗi định dạng lịch";
  }
};

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

// Định nghĩa các cột có thể tìm kiếm cho Gia sư
const searchableTutorColumnOptions = [
  { value: "userProfile.fullname", label: "Tên gia sư" },
  { value: "email", label: "Email" },
  { value: "phoneNumber", label: "Số điện thoại" },
  { value: "tutorProfile.tutorLevel.levelName", label: "Hạng" },
  {
    value: "createdAt",
    label: "Ngày tạo",
    placeholderSuffix: " (YYYY-MM-DD)",
  },
  { value: "userId", label: "Mã gia sư" }, // Thêm mã gia sư
];

const ListOfTutorPage = () => {
  const { t } = useTranslation();

  // --- State Variables ---
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [selectedSearchField, setSelectedSearchField] = useState(
    searchableTutorColumnOptions[0].value // Mặc định là cột đầu tiên
  );
  const [appliedSearchInput, setAppliedSearchInput] = useState("");
  const [appliedSearchField, setAppliedSearchField] = useState(
    searchableTutorColumnOptions[0].value
  );

  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isProcessingLock, setIsProcessingLock] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentPath = "/gia-su";

  // --- Reset State ---
  const resetState = useCallback(() => {
    setSearchInput("");
    setSelectedSearchField(searchableTutorColumnOptions[0].value);
    setAppliedSearchInput("");
    setAppliedSearchField(searchableTutorColumnOptions[0].value);
    setSortConfig({ key: "createdAt", direction: "desc" });
    setCurrentPage(0);
    setItemsPerPage(10);
  }, []);

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filterConditions = [
        { key: "roleId", operator: "equal", value: "TUTOR" },
      ];

      if (appliedSearchInput && appliedSearchField) {
        filterConditions.push({
          key: appliedSearchField,
          operator: "like", // Hoặc 'equal' cho ID/ngày nếu backend hỗ trợ chính xác
          value: appliedSearchInput,
        });
      }

      const query = {
        rpp: itemsPerPage,
        page: currentPage + 1,
        filter: JSON.stringify(filterConditions),
        sort: JSON.stringify([
          { key: sortConfig.key, type: sortConfig.direction.toUpperCase() },
        ]),
      };

      console.log("Fetching tutors with query:", query);
      const response = await Api({
        endpoint: `/user/search`, // Endpoint tìm user
        method: METHOD_TYPE.GET,
        query: query, // Truyền object query
      });
      console.log("API Response (Tutors):", response);

      if (
        response.success &&
        response.data &&
        Array.isArray(response.data.items)
      ) {
        setData(response.data.items);
        setTotalItems(response.data.total || 0);
        setPageCount(Math.ceil((response.data.total || 0) / itemsPerPage));
      } else {
        const errorMsg =
          response.message ||
          t("common.errorLoadingData") ||
          "Lỗi tải dữ liệu gia sư.";
        throw new Error(errorMsg);
      }
    } catch (errorCatch) {
      console.error("Fetch tutor error:", errorCatch);
      const errorMsg =
        errorCatch.message ||
        t("common.errorLoadingData") ||
        "Đã xảy ra lỗi không mong muốn.";
      setError(errorMsg);
      setData([]);
      setTotalItems(0);
      setPageCount(1);
      toast.error(`Tải danh sách gia sư thất bại: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    sortConfig,
    appliedSearchInput,
    appliedSearchField,
    t,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
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
    setSearchInput(value);
  };

  const handleSearchFieldChange = (event) => {
    setSelectedSearchField(event.target.value);
  };

  const handleApplySearch = () => {
    if (searchInput.trim() || selectedSearchField !== appliedSearchField) {
      if (searchInput.trim()) {
        setAppliedSearchField(selectedSearchField);
        setAppliedSearchInput(searchInput);
      } else {
        setAppliedSearchField(selectedSearchField);
        setAppliedSearchInput("");
      }
    } else if (!searchInput.trim() && appliedSearchInput) {
      setAppliedSearchInput("");
    }
    setCurrentPage(0);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleApplySearch();
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
  // --- End Event Handlers ---

  // --- Action Handlers (giữ nguyên các handler khác như handleDeleteClick, confirmDelete, handleViewClick, handleLockClick, handleCloseModal) ---
  const handleDeleteClick = (tutor) => {
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
    setIsDeleting(true);
    try {
      const response = await Api({
        endpoint: `user/delete-user-by-id/${deleteItemId}`,
        method: METHOD_TYPE.DELETE,
      });
      if (response.success) {
        toast.success("Xóa gia sư thành công!");
        if (data.length === 1 && currentPage > 0) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchData();
        }
      } else {
        throw new Error(response.message || "Xóa thất bại.");
      }
    } catch (errorCatch) {
      toast.error(`Xóa thất bại: ${errorCatch.message}`);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
      setDeleteMessage("");
      setIsDeleting(false);
    }
  };

  const handleViewClick = (tutor) => {
    if (!tutor) return;
    setModalData(tutor);
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

    setIsProcessingLock(true);
    try {
      const response = await Api({
        endpoint: `user/update-user-by-id/${tutor.userId}`,
        method: METHOD_TYPE.PUT,
        data: { checkActive: newCheckActive },
      });
      if (response.success) {
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
    } catch (errorCatch) {
      toast.error(`${actionText} thất bại: ${errorCatch.message}`);
    } finally {
      setIsProcessingLock(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setModalData(null);
      setModalMode(null);
    }, 300);
  };

  // --- Table Columns Definition ---
  const columns = useMemo(
    () => [
      { title: "Mã GS", dataKey: "userId", sortable: true }, // Thêm Mã GS
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
        sortKey: "email", // Thêm sortKey
        sortable: true,
        renderCell: (val) => val || "Chưa có email",
      },
      {
        title: t("admin.phone"),
        dataKey: "phoneNumber",
        sortKey: "phoneNumber", // Thêm sortKey
        sortable: true, // Cho phép sort SĐT
        renderCell: (val) => val || "Chưa có SĐT",
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
        dataKey: "checkActive", // checkActive là trạng thái khóa/mở
        sortable: true,
        renderCell: formatUserStatus,
      },
      {
        title: "Ngày tạo",
        dataKey: "createdAt",
        sortKey: "createdAt",
        sortable: true,
        renderCell: (v) => safeFormatDate(v, "dd/MM/yy HH:mm"), // Format chi tiết hơn
      },
    ],
    [t]
  );
  // --- End Table Columns Definition ---

  // --- Form Fields for Detail View (giữ nguyên hoặc tối ưu) ---
  const viewFields = useMemo(
    () => [
      // Section: Thông tin chung
      { key: "userId", label: "Mã Gia Sư", section: "Thông tin chung" },
      {
        key: "userProfile.fullname",
        label: "Họ và Tên",
        section: "Thông tin chung",
      },
      { key: "email", label: "Email đăng nhập", section: "Thông tin chung" },
      {
        key: "phoneNumber",
        label: "SĐT đăng nhập",
        section: "Thông tin chung",
      },
      {
        key: "checkActive",
        label: "Trạng thái tài khoản",
        renderValue: formatUserStatus,
        section: "Thông tin chung",
      },
      {
        key: "coin",
        label: "Số dư Xu",
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

      // Section: Hồ sơ người dùng (User Profile)
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
        label: "Chuyên ngành (User)",
        renderValue: (v, row) =>
          getSafeNestedValue(
            row,
            "userProfile.major.majorName",
            "Chưa cập nhật"
          ),
        section: "Hồ sơ người dùng (User Profile)",
      },

      // Section: Hồ sơ gia sư (Tutor Profile)
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
        label: "Xu/Giờ",
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
    []
  );
  // --- End Form Fields ---

  // --- JSX Rendering ---
  const currentSearchFieldConfig = useMemo(
    () =>
      searchableTutorColumnOptions.find(
        (opt) => opt.value === selectedSearchField
      ),
    [selectedSearchField]
  );
  const searchPlaceholder = currentSearchFieldConfig
    ? `Nhập ${currentSearchFieldConfig.label.toLowerCase()}${
        currentSearchFieldConfig.placeholderSuffix || ""
      }...`
    : "Nhập tìm kiếm...";

  const childrenMiddleContentLower = (
    <div className="admin-content">
      <h2 className="admin-list-title">Danh sách Gia sư</h2>
      <div className="search-bar-filter-container">
        <div className="search-bar-filter">
          {/* Select chọn cột tìm kiếm */}
          <div className="filter-control">
            <select
              id="searchFieldSelectTutor"
              value={selectedSearchField}
              onChange={handleSearchFieldChange}
              className="status-filter-select"
              aria-label="Chọn trường để tìm kiếm"
            >
              {searchableTutorColumnOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <SearchBar
            value={searchInput}
            onChange={handleSearchInputChange}
            onKeyPress={handleSearchKeyPress}
            searchBarClassName="admin-search"
            searchInputClassName="admin-search-input"
            placeholder={searchPlaceholder}
          />
          <button
            onClick={handleApplySearch}
            className="refresh-button"
            title="Tìm kiếm"
            disabled={isLoading || isProcessingLock || isDeleting}
          >
            <i className="fa-solid fa-search"></i>
          </button>
          <button
            className="refresh-button"
            onClick={resetState}
            title="Làm mới"
            disabled={isLoading || isProcessingLock || isDeleting}
          >
            <i className="fa-solid fa-rotate-left"></i>{" "}
            {/* Thay đổi icon nếu muốn */}
          </button>
        </div>
        <div className="filter-add-admin"></div> {/* Không có nút Add */}
      </div>

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      <Table
        columns={columns}
        data={data}
        totalItems={totalItems}
        onView={handleViewClick}
        onDelete={handleDeleteClick}
        onLock={handleLockClick}
        showLock={true}
        statusKey="checkActive"
        pageCount={pageCount}
        onPageChange={handlePageClick}
        forcePage={currentPage}
        onSort={handleSort}
        currentSortConfig={sortConfig}
        loading={isLoading || isProcessingLock || isDeleting}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {!isLoading && !error && data.length > 0 && (
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
      {!isLoading && !error && data.length === 0 && totalItems === 0 && (
        <p
          style={{
            textAlign: "center",
            marginTop: "2rem",
            fontSize: "1em",
            color: "#777",
          }}
        >
          Không có dữ liệu gia sư.
        </p>
      )}
    </div>
  );

  return (
    <AdminDashboardLayout
      currentPath={currentPath}
      childrenMiddleContentLower={childrenMiddleContentLower}
    >
      <Modal
        isOpen={isModalOpen && modalMode === "view"}
        onRequestClose={handleCloseModal}
        contentLabel="Chi tiết Gia sư"
        className="modal large"
        overlayClassName="overlay"
        closeTimeoutMS={300}
      >
        {modalData && modalMode === "view" && (
          <FormDetail
            formData={modalData}
            fields={viewFields}
            mode="view"
            title="Chi tiết Gia sư"
            onClose={handleCloseModal}
            avatarUrl={getSafeNestedValue(
              modalData,
              "tutorProfile.avatar",
              getSafeNestedValue(modalData, "userProfile.avatar", null)
            )}
          />
        )}
      </Modal>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message={deleteMessage}
        isDeleting={isDeleting}
      />

      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </AdminDashboardLayout>
  );
};

const ListOfTutor = React.memo(ListOfTutorPage);
export default ListOfTutor;
