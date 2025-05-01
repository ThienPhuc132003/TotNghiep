import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import "../../assets/css/Admin/ListOfAdmin.style.css"; // Styles chung
import "../../assets/css/Modal.style.css"; // Styles modal
import "../../assets/css/FormDetail.style.css"; // Styles form chi tiết (quan trọng)
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
// import unidecode from "unidecode"; // <<< Bỏ import unidecode
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format, isValid, parseISO } from "date-fns";

// --- Helper Functions (Giữ nguyên) ---

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
const formatDate = (dateString) => {
  if (!dateString) return "Chưa cập nhật";
  try {
    const date = parseISO(dateString);
    if (isValid(date)) {
      return format(date, "dd/MM/yyyy");
    }
    const directDate = new Date(dateString);
    if (isValid(directDate)) {
      return format(directDate, "dd/MM/yyyy");
    }
    return "Ngày không hợp lệ";
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return "Lỗi định dạng ngày";
  }
};

// Render link cho file/URL (an toàn hơn)
const renderEvidenceLink = (url) => {
  if (!url || typeof url !== "string") return "Không có";
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return "Không có";
  const isExternalLink =
    trimmedUrl.startsWith("http://") ||
    trimmedUrl.startsWith("https://") ||
    trimmedUrl.startsWith("blob:");
  return (
    <a
      href={isExternalLink ? trimmedUrl : "#"}
      target={isExternalLink ? "_blank" : "_self"}
      rel="noopener noreferrer"
      className={`evidence-link ${!isExternalLink ? "disabled-link" : ""}`}
      onClick={(e) => !isExternalLink && e.preventDefault()}
      title={isExternalLink ? `Mở: ${trimmedUrl}` : "Không có link hợp lệ"}
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
      .filter((item) => item && item.day && Array.isArray(item.times));
    if (parsed.length === 0) return "Chưa cập nhật lịch rảnh hợp lệ";
    return (
      <ul className="datetime-list">
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
  // const [data, setData] = useState([]); // <<< Bỏ state data không dùng
  const [filteredData, setFilteredData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalMode, setModalMode] = useState(null); // <<< Khởi tạo là null
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);

  const currentPath = "/gia-su";

  // --- URL Synchronization (Giữ nguyên) ---
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    if (searchQuery) params.set("searchQuery", searchQuery);
    else params.delete("searchQuery");
    if (sortConfig.key) {
      params.set("sortKey", sortConfig.key);
      params.set("sortDirection", sortConfig.direction);
    } else {
      params.delete("sortKey");
      params.delete("sortDirection");
    }
    params.set("page", currentPage + 1);
    params.set("itemsPerPage", itemsPerPage);
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  }, [searchQuery, sortConfig, currentPage, itemsPerPage]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialSearchQuery = params.get("searchQuery") || "";
    const initialSortKey = params.get("sortKey") || "createdAt";
    const initialSortDirection = params.get("sortDirection") || "desc";
    const initialPage = parseInt(params.get("page") || "1", 10) - 1;
    const initialItemsPerPage = parseInt(
      params.get("itemsPerPage") || "10",
      10
    );
    setSearchInput(initialSearchQuery);
    setSearchQuery(initialSearchQuery);
    setSortConfig({ key: initialSortKey, direction: initialSortDirection });
    setCurrentPage(Math.max(0, initialPage));
    setItemsPerPage(initialItemsPerPage > 0 ? initialItemsPerPage : 10);
  }, []);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);
  // --- End URL Synchronization ---

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log(
      `Fetching data: page=${currentPage + 1}, rpp=${itemsPerPage}, sort=${
        sortConfig.key
      }(${sortConfig.direction}), search=${searchQuery}`
    );
    try {
      const filterConditions = [
        { key: "roleId", operator: "equal", value: "TUTOR" },
      ];
      if (searchQuery) {
        filterConditions.push({
          logic: "or",
          conditions: [
            {
              key: "userProfile.fullname",
              operator: "contains",
              value: searchQuery,
            },
            { key: "email", operator: "contains", value: searchQuery },
            { key: "phoneNumber", operator: "contains", value: searchQuery },
            { key: "userId", operator: "contains", value: searchQuery },
          ],
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
      const queryString = qs.stringify(query, {
        encodeValuesOnly: true,
        arrayFormat: "brackets",
      });
      console.log("API Request URL:", `/user/search?${queryString}`);
      const response = await Api({
        endpoint: `/user/search?${queryString}`,
        method: METHOD_TYPE.GET,
      });
      console.log("API Response:", response);
      if (
        response.success &&
        response.data &&
        Array.isArray(response.data.items)
      ) {
        // setData(response.data.items); // <<< Bỏ cập nhật state data không dùng
        setFilteredData(response.data.items); // Chỉ cập nhật filteredData
        setTotalItems(response.data.total);
        setPageCount(Math.ceil(response.data.total / itemsPerPage));
      } else {
        // Sử dụng t để dịch lỗi nếu cần, nhưng không cần đưa t vào dependency
        const errorMsg =
          response.message ||
          t("common.errorLoadingData") ||
          "Lỗi tải dữ liệu gia sư.";
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("Fetch data error:", error);
      // Sử dụng t để dịch lỗi nếu cần, nhưng không cần đưa t vào dependency
      const errorMsg =
        error.message ||
        t("common.errorLoadingData") ||
        "Đã xảy ra lỗi không mong muốn.";
      setError(errorMsg);
      // setData([]); // <<< Bỏ reset state data không dùng
      setFilteredData([]);
      setTotalItems(0);
      setPageCount(1);
    } finally {
      setIsLoading(false);
    }
    // <<< Bỏ 't' khỏi dependency list
  }, [
    currentPage,
    itemsPerPage,
    sortConfig.key,
    sortConfig.direction,
    searchQuery,
    t,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  // --- End Data Fetching ---

  // --- Event Handlers (Giữ nguyên phần lớn, chỉnh sửa lock/delete) ---
  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const handleItemsPerPageChange = (newPageSize) => {
    setItemsPerPage(newPageSize);
    setCurrentPage(0);
  };

  const handleSearchInputChange = (query) => {
    setSearchInput(query);
  };

  const handleSearchSubmit = () => {
    if (searchQuery !== searchInput) {
      setCurrentPage(0);
      setSearchQuery(searchInput);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
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

  const resetFiltersAndFetch = () => {
    setSearchInput("");
    setSearchQuery("");
    setSortConfig({ key: "createdAt", direction: "desc" });
    setCurrentPage(0);
    setItemsPerPage(10);
    // fetchData sẽ tự chạy lại do dependency thay đổi
  };

  const handleDeleteClick = (tutorId) => {
    if (!tutorId) return;
    setDeleteItemId(tutorId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;
    console.log(`Attempting to delete tutor: ${deleteItemId}`);
    try {
      const response = await Api({
        endpoint: `user/delete-user-by-id/${deleteItemId}`,
        method: METHOD_TYPE.DELETE,
      });
      if (response.success) {
        toast.success("Xóa gia sư thành công!");
        // Cập nhật lại UI sau khi xóa thành công
        const newTotalItems = totalItems - 1;
        const newPageCount = Math.ceil(newTotalItems / itemsPerPage);
        // Nếu trang hiện tại trống sau khi xóa và không phải trang đầu -> về trang trước
        if (filteredData.length === 1 && currentPage > 0 && newTotalItems > 0) {
          setCurrentPage(currentPage - 1); // Trigger fetchData cho trang trước
        } else {
          // Nếu không, fetch lại trang hiện tại (hoặc trang 0 nếu là trang đầu)
          // Cập nhật totalItems trước khi fetch lại để đảm bảo tính toán đúng
          setTotalItems(newTotalItems);
          setPageCount(newPageCount);
          // Gọi lại fetchData nếu cần (ví dụ nếu trang không bị đổi)
          // Hoặc chỉ cần cập nhật state nếu trang không đổi:
          if (!(filteredData.length === 1 && currentPage > 0)) {
            setFilteredData((prev) =>
              prev.filter((item) => item.userId !== deleteItemId)
            );
          }
          // Nếu muốn đảm bảo dữ liệu luôn mới nhất từ server sau khi xóa:
          // fetchData(); // Gọi lại fetchData - sẽ dùng currentPage đã được cập nhật (nếu có)
        }
        // Nếu không gọi fetchData() ở trên, cần cập nhật totalItems và pageCount ở đây
        setTotalItems(newTotalItems);
        setPageCount(newPageCount);
      } else {
        throw new Error(response.message || "Xóa thất bại.");
      }
    } catch (error) {
      console.error("Delete tutor error:", error);
      toast.error(`Xóa thất bại: ${error.message}`);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
    }
  };

  const handleViewClick = (tutor) => {
    if (!tutor) return;
    console.log("Viewing Tutor Data:", tutor);
    setModalData(tutor);
    setModalMode("view"); // <<< Vẫn set mode để dùng cho title, label modal
    setIsModalOpen(true);
  };

  const handleLockClick = async (tutor) => {
    if (!tutor || !tutor.userId) return;
    const newCheckActive =
      tutor.checkActive === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const actionText = newCheckActive === "ACTIVE" ? "Mở khóa" : "Khóa";
    const currentFullname = tutor.userProfile?.fullname || tutor.userId;
    if (
      !window.confirm(
        `Bạn có chắc muốn ${actionText} tài khoản "${currentFullname}"?`
      )
    )
      return;

    console.log(`Attempting to ${actionText} tutor: ${tutor.userId}`);
    try {
      const response = await Api({
        endpoint: `user/update-user-by-id/${tutor.userId}`,
        method: METHOD_TYPE.PUT,
        data: { checkActive: newCheckActive },
      });
      if (response.success) {
        // Chỉ cập nhật filteredData vì data không còn dùng
        setFilteredData((prevData) =>
          prevData.map((item) =>
            item.userId === tutor.userId
              ? { ...item, checkActive: newCheckActive }
              : item
          )
        );
        toast.success(
          `${actionText} tài khoản "${currentFullname}" thành công!`
        );
      } else {
        throw new Error(response.message || `${actionText} thất bại.`);
      }
    } catch (error) {
      console.error(`Error ${actionText} tutor:`, error);
      toast.error(`${actionText} thất bại: ${error.message}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Delay reset để tránh giật
    setTimeout(() => {
      setModalData(null);
      setModalMode(null); // <<< Sửa thành null khi đóng
    }, 300);
  };
  // --- End Event Handlers ---

  // --- Table Columns Definition (Giữ nguyên) ---
  const columns = useMemo(
    () => [
      {
        title: t("admin.name"),
        dataKey: "userProfile.fullname",
        sortable: true,
        renderCell: (val) => val || "Chưa có tên",
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
        sortable: false,
        renderCell: formatGender,
      },
      {
        title: "Hạng",
        dataKey: "tutorProfile.tutorLevel.levelName",
        sortable: true,
        renderCell: (val) => val || "Chưa hạng",
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
        renderCell: formatDate,
      },
    ],
    [t]
  );
  // --- End Table Columns Definition ---

  // --- Form Fields for Detail View (Giữ nguyên) ---
  const viewFields = useMemo(
    () => [
      // Thông tin cơ bản & UserProfile
      { key: "userProfile.fullname", label: "Họ và Tên (User)" },
      { key: "email", label: "Email đăng nhập" },
      { key: "phoneNumber", label: "SĐT đăng nhập" },
      { key: "userId", label: "User ID" },
      { key: "roleId", label: "Vai trò" },
      {
        key: "checkActive",
        label: "Trạng thái tài khoản",
        renderValue: formatUserStatus,
      },
      {
        key: "coin",
        label: "Số dư Coin",
        renderValue: (val) => (val ?? 0).toLocaleString(),
      },
      {
        key: "totalTestPoints",
        label: "Điểm Test tổng",
        renderValue: (val) => val ?? "Chưa có",
      },
      { key: "userProfile.userDisplayName", label: "Tên hiển thị" },
      { key: "userProfile.personalEmail", label: "Email cá nhân" },
      {
        key: "userProfile.homeAddress",
        label: "Địa chỉ nhà",
        renderValue: (val) => val || "Chưa cập nhật",
      },
      {
        key: "userProfile.birthday",
        label: "Ngày sinh (User)",
        renderValue: formatDate,
      },
      {
        key: "userProfile.gender",
        label: "Giới tính (User)",
        renderValue: formatGender,
      },
      {
        key: "userProfile.major.majorName",
        label: "Chuyên ngành (User)",
        renderValue: (val) => val || "Chưa cập nhật",
      },
      {
        key: "createdAt",
        label: "Ngày tạo tài khoản",
        renderValue: (d) =>
          d ? format(new Date(d), "dd/MM/yyyy HH:mm") : "Không có",
      },
      {
        key: "updatedAt",
        label: "Cập nhật lần cuối",
        renderValue: (d) =>
          d ? format(new Date(d), "dd/MM/yyyy HH:mm") : "Không có",
      },

      // Thông tin TutorProfile (hiển thị nếu có)
      {
        key: "tutorProfile.fullname",
        label: "Họ và Tên (Tutor)",
        renderValue: (val, data) =>
          data.tutorProfile ? val || "Chưa cập nhật" : "N/A",
      },
      {
        key: "tutorProfile.birthday",
        label: "Ngày sinh (Tutor)",
        renderValue: (val, data) =>
          data.tutorProfile ? formatDate(val) : "N/A",
      },
      {
        key: "tutorProfile.gender",
        label: "Giới tính (Tutor)",
        renderValue: (val, data) =>
          data.tutorProfile ? formatGender(val) : "N/A",
      },
      {
        key: "tutorProfile.univercity",
        label: "Trường Đại học",
        renderValue: (val, data) =>
          data.tutorProfile ? val || "Chưa cập nhật" : "N/A",
      },
      {
        key: "tutorProfile.major.majorName",
        label: "Chuyên ngành (Tutor)",
        renderValue: (val, data) =>
          data.tutorProfile ? val || "Chưa cập nhật" : "N/A",
      },
      {
        key: "tutorProfile.GPA",
        label: "Điểm GPA",
        renderValue: (val, data) =>
          data.tutorProfile ? val ?? "Chưa có" : "N/A",
      },
      {
        key: "tutorProfile.evidenceOfGPA",
        label: "Minh chứng GPA",
        renderValue: (val, data) =>
          data.tutorProfile ? renderEvidenceLink(val) : "N/A",
      },
      {
        key: "tutorProfile.description",
        label: "Giới thiệu bản thân",
        renderValue: (val, data) =>
          data.tutorProfile ? val || "Chưa có" : "N/A",
      },
      {
        key: "tutorProfile.subject.subjectName",
        label: "Môn học 1",
        renderValue: (val, data) =>
          data.tutorProfile ? val || "Chưa có" : "N/A",
      },
      {
        key: "tutorProfile.descriptionOfSubject",
        label: "Mô tả môn 1",
        renderValue: (val, data) =>
          data.tutorProfile ? val || "Chưa có" : "N/A",
      },
      {
        key: "tutorProfile.evidenceOfSubject",
        label: "Minh chứng môn 1",
        renderValue: (val, data) =>
          data.tutorProfile ? renderEvidenceLink(val) : "N/A",
      },
      {
        key: "tutorProfile.subject2.subjectName",
        label: "Môn học 2",
        renderValue: (val, data) =>
          data.tutorProfile ? val || "Không đăng ký" : "N/A",
      },
      {
        key: "tutorProfile.descriptionOfSubject2",
        label: "Mô tả môn 2",
        renderValue: (val, data) =>
          data.tutorProfile ? val || "Không đăng ký" : "N/A",
      },
      {
        key: "tutorProfile.evidenceOfSubject2",
        label: "Minh chứng môn 2",
        renderValue: (val, data) =>
          data.tutorProfile ? renderEvidenceLink(val) : "N/A",
      },
      {
        key: "tutorProfile.subject3.subjectName",
        label: "Môn học 3",
        renderValue: (val, data) =>
          data.tutorProfile ? val || "Không đăng ký" : "N/A",
      },
      {
        key: "tutorProfile.descriptionOfSubject3",
        label: "Mô tả môn 3",
        renderValue: (val, data) =>
          data.tutorProfile ? val || "Không đăng ký" : "N/A",
      },
      {
        key: "tutorProfile.evidenceOfSubject3",
        label: "Minh chứng môn 3",
        renderValue: (val, data) =>
          data.tutorProfile ? renderEvidenceLink(val) : "N/A",
      },
      {
        key: "tutorProfile.teachingTime",
        label: "Thời gian/tiết (giờ)",
        renderValue: (val, data) =>
          data.tutorProfile
            ? val
              ? `${parseFloat(val).toFixed(2)} giờ`
              : "Chưa có"
            : "N/A",
      },
      {
        key: "tutorProfile.teachingMethod",
        label: "Phương thức dạy",
        renderValue: (val, data) =>
          data.tutorProfile ? formatTeachingMethod(val) : "N/A",
      },
      {
        key: "tutorProfile.teachingPlace",
        label: "Khu vực dạy Offline",
        renderValue: (val, data) =>
          data.tutorProfile ? val || "Chưa có" : "N/A",
      },
      {
        key: "tutorProfile.isUseCurriculumn",
        label: "Sử dụng giáo trình riêng",
        renderValue: (val, data) =>
          data.tutorProfile
            ? typeof val === "boolean"
              ? val
                ? "Có"
                : "Không"
              : "Chưa có"
            : "N/A",
      },
      {
        key: "tutorProfile.videoUrl",
        label: "Video giới thiệu",
        renderValue: (val, data) =>
          data.tutorProfile ? renderEvidenceLink(val) : "N/A",
      },
      {
        key: "tutorProfile.bankName",
        label: "Ngân hàng",
        renderValue: (val, data) =>
          data.tutorProfile ? val || "Chưa có" : "N/A",
      },
      {
        key: "tutorProfile.bankNumber",
        label: "Số tài khoản",
        renderValue: (val, data) =>
          data.tutorProfile ? val || "Chưa có" : "N/A",
      },
      {
        key: "tutorProfile.tutorLevel.levelName",
        label: "Hạng Gia Sư",
        renderValue: (val, data) =>
          data.tutorProfile ? val || "Chưa có" : "N/A",
      },
      {
        key: "tutorProfile.tutorLevel.description",
        label: "Mô tả hạng",
        renderValue: (val, data) =>
          data.tutorProfile ? val || "Chưa có" : "N/A",
      },
      {
        key: "tutorProfile.coinPerHours",
        label: "Coin/Giờ",
        renderValue: (val, data) =>
          data.tutorProfile ? (val ?? "Chưa có").toLocaleString() : "N/A",
      },
      {
        key: "tutorProfile.isPublicProfile",
        label: "Công khai Profile",
        renderValue: (val, data) =>
          data.tutorProfile
            ? typeof val === "boolean"
              ? val
                ? "Có"
                : "Không"
              : "Chưa có"
            : "N/A",
      },
      {
        key: "tutorProfile.dateTimeLearn",
        label: "Lịch rảnh",
        renderValue: (val, data) =>
          data.tutorProfile ? formatDateTimeLearn(val) : "N/A",
      },
    ],
    []
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
            onKeyPress={handleSearchKeyPress}
            searchBarClassName="admin-search"
            searchInputClassName="admin-search-input"
            placeholder="Tìm tên, email, SĐT, ID..."
          />
          <button
            onClick={handleSearchSubmit}
            className="search-submit-button"
            title="Tìm kiếm"
          >
            <i className="fa-solid fa-search"></i>
          </button>
          <button
            className="refresh-button"
            onClick={resetFiltersAndFetch}
            title="Làm mới bộ lọc và tải lại"
          >
            <i className="fa-solid fa-rotate fa-lg"></i>
          </button>
        </div>
      </div>
      {error && (
        <Alert
          severity="error"
          style={{ marginTop: "1rem", marginBottom: "1rem" }}
        >
          {error}
        </Alert>
      )}
      <Table
        columns={columns}
        data={filteredData} // <<< Sử dụng filteredData
        onView={handleViewClick}
        onDelete={handleDeleteClick}
        onLock={handleLockClick}
        showLock={true}
        statusKey="checkActive"
        pageCount={pageCount}
        onPageChange={handlePageClick}
        forcePage={currentPage}
        onSort={handleSort}
        loading={isLoading}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        currentSortConfig={sortConfig}
      />
      {!isLoading && !error && totalItems > 0 && (
        <p
          style={{
            textAlign: "right",
            marginTop: "1rem",
            color: "#555",
            fontSize: "0.9em",
          }}
        >
          Hiển thị {filteredData.length} trên tổng số {totalItems} gia sư.
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
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        // <<< Sử dụng modalMode để xác định label
        contentLabel={modalMode === "view" ? "Chi tiết Gia sư" : "Modal"}
        className="modal large"
        overlayClassName="overlay"
        closeTimeoutMS={300}
      >
        {modalData && (
          <FormDetail
            formData={modalData}
            fields={viewFields}
            // <<< Sử dụng modalMode để xác định mode và title
            mode={modalMode || "view"}
            title={modalMode === "view" ? "Chi tiết Gia sư" : "Thông tin"}
            onClose={handleCloseModal}
            avatarUrl={
              modalData.tutorProfile?.avatar || modalData.userProfile?.avatar
            }
          />
        )}
      </Modal>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message="Bạn có chắc muốn xóa gia sư này? Hành động này sẽ xóa thông tin liên quan và không thể hoàn tác."
      />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AdminDashboardLayout>
  );
};

const ListOfTutor = React.memo(ListOfTutorPage);
export default ListOfTutor;
