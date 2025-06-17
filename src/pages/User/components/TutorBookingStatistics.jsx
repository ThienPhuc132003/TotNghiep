import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import {
  FileDownload,
  Search,
  Refresh,
  BookOnline,
  TrendingUp,
  Schedule,
  Money,
} from "@mui/icons-material";
import Api from "../../../network/Api";
import { METHOD_TYPE } from "../../../network/methodType";
import { toast } from "react-toastify";
import { exportToExcel } from "../../../utils/excelExport";
import numeral from "numeral";
import "numeral/locales/vi";

// Set Vietnamese locale for numeral
numeral.locale("vi");

// Helper function to format currency (compact format)
const formatCurrency = (amount) => {
  const num = amount || 0;
  if (num >= 1000000) {
    return numeral(num).format("0.0a") + " Xu";
  } else if (num >= 1000) {
    return numeral(num).format("0,0") + " Xu";
  } else {
    return numeral(num).format("0") + " Xu";
  }
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (error) {
    return "N/A";
  }
};

// Helper function to format booking status
const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case "ACCEPT":
      return "success";
    case "PENDING":
      return "warning";
    case "REJECT":
      return "error";
    default:
      return "default";
  }
};

const getStatusText = (status) => {
  switch (status?.toUpperCase()) {
    case "ACCEPT":
      return "Đã chấp nhận";
    case "PENDING":
      return "Đang chờ";
    case "REJECT":
      return "Đã từ chối";
    default:
      return status || "N/A";
  }
};

// Period options for filtering
const periodOptions = [
  { value: "all", label: "Tất cả" },
  { value: "today", label: "Hôm nay" },
  { value: "week", label: "Tuần này" },
  { value: "month", label: "Tháng này" },
  { value: "year", label: "Năm này" },
];

// Status options for filtering
const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "ACCEPT", label: "Đã chấp nhận" },
  { value: "PENDING", label: "Đang chờ" },
  { value: "REJECT", label: "Đã từ chối" },
];

const TutorBookingStatistics = () => {
  const userProfile = useSelector((state) => state.user.userProfile);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  // State for booking data
  const [bookingData, setBookingData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Check if user is tutor
  const isTutor = useMemo(() => {
    if (!isAuthenticated || !userProfile) return false;
    if (userProfile.roles && Array.isArray(userProfile.roles)) {
      return userProfile.roles.some(
        (role) =>
          role.name === "TUTOR" ||
          role.name === "Tutor" ||
          role.name?.toLowerCase() === "tutor"
      );
    }
    if (userProfile.roleId) {
      return String(userProfile.roleId).toUpperCase() === "TUTOR";
    }
    return false;
  }, [isAuthenticated, userProfile]);

  // Fetch booking data
  const fetchBookingData = useCallback(async () => {
    if (!isTutor || !userProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      const tutorId = userProfile.id || userProfile.userId;
      console.log("📊 Fetching booking data for tutor:", tutorId);

      const params = { tutorId };

      // Add date filters if specified
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await Api({
        endpoint: "booking-request/search-with-time-for-tutor",
        method: METHOD_TYPE.GET,
        params,
      });

      console.log("📊 Booking API Response:", response);

      if (response?.success || response?.data) {
        const data = response.data || response;
        const items = data.items || [];
        const total = data.total || items.length;

        // Transform data
        const transformedData = items.map((item, index) => ({
          id: item.bookingRequestId || index,
          bookingRequestId: item.bookingRequestId,
          userId: item.userId,
          tutorId: item.tutorId,
          dateTimeLearn: item.dateTimeLearn,
          lessonsPerWeek: item.lessonsPerWeek,
          totalLessons: item.totalLessons,
          hoursPerLesson: item.hoursPerLesson,
          totalcoins: item.totalcoins,
          startDay: item.startDay,
          status: item.status,
          noteOfTutor: item.noteOfTutor,
          isHire: item.isHire,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }));
        setBookingData(transformedData);
        console.log("✅ Booking data loaded:", {
          total,
          itemsCount: transformedData.length,
        });
      } else {
        throw new Error(response?.message || "Không thể tải dữ liệu đặt lịch");
      }
    } catch (error) {
      console.error("❌ Error fetching booking data:", error);
      setError("Lỗi khi tải dữ liệu đặt lịch: " + error.message);
      toast.error("Lỗi khi tải dữ liệu đặt lịch");
    } finally {
      setIsLoading(false);
    }
  }, [isTutor, userProfile, startDate, endDate]);

  // Filter data based on search term, period, and status
  const filteredData = useMemo(() => {
    let filtered = [...bookingData];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.bookingRequestId
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.noteOfTutor?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Apply period filter
    if (periodFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.createdAt);

        switch (periodFilter) {
          case "today":
            return itemDate >= today;
          case "week": {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            return itemDate >= weekStart;
          }
          case "month": {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            return itemDate >= monthStart;
          }
          case "year": {
            const yearStart = new Date(now.getFullYear(), 0, 1);
            return itemDate >= yearStart;
          }
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [bookingData, searchTerm, statusFilter, periodFilter]);

  // Calculate statistics from filtered data
  const stats = useMemo(() => {
    const accepted = filteredData.filter(
      (item) => item.status === "ACCEPT"
    ).length;
    const pending = filteredData.filter(
      (item) => item.status === "PENDING"
    ).length;
    const rejected = filteredData.filter(
      (item) => item.status === "REJECT"
    ).length;
    const totalRevenue = filteredData.reduce(
      (sum, item) => sum + (item.totalcoins || 0),
      0
    );

    return {
      total: filteredData.length,
      accepted,
      pending,
      rejected,
      totalRevenue,
    };
  }, [filteredData]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle export to Excel
  const handleExportData = useCallback(async () => {
    if (!filteredData || filteredData.length === 0) {
      toast.warning("Không có dữ liệu để xuất");
      return;
    }

    try {
      const exportData = filteredData.map((row, index) => ({
        STT: index + 1,
        "Mã yêu cầu": row.bookingRequestId || "",
        "Mã học viên": row.userId || "",
        "Số buổi/tuần": row.lessonsPerWeek || "",
        "Tổng số buổi": row.totalLessons || "",
        "Giờ/buổi": row.hoursPerLesson || "",
        "Tổng chi phí": formatCurrency(row.totalcoins),
        "Ngày bắt đầu": formatDate(row.startDay),
        "Trạng thái": getStatusText(row.status),
        "Ghi chú": row.noteOfTutor || "",
        "Ngày tạo": formatDate(row.createdAt),
      }));

      await exportToExcel(exportData, "Thong_ke_luot_thue_gia_su");
      toast.success("Xuất dữ liệu thành công!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Lỗi khi xuất dữ liệu");
    }
  }, [filteredData]);

  // Load data on component mount
  useEffect(() => {
    fetchBookingData();
  }, [fetchBookingData]);

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <BookOnline
                  sx={{ fontSize: 40, color: "primary.main", mr: 2 }}
                />
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Tổng yêu cầu
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                    {stats.total}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TrendingUp
                  sx={{ fontSize: 40, color: "success.main", mr: 2 }}
                />
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Đã chấp nhận
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "bold", color: "success.main" }}
                  >
                    {stats.accepted}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Schedule sx={{ fontSize: 40, color: "warning.main", mr: 2 }} />
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Đang chờ
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "bold", color: "warning.main" }}
                  >
                    {stats.pending}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Money sx={{ fontSize: 40, color: "info.main", mr: 2 }} />
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Tổng giá trị
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "bold", color: "info.main" }}
                  >
                    {formatCurrency(stats.totalRevenue)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Tìm kiếm"
                placeholder="Tìm theo mã yêu cầu, mã học viên hoặc ghi chú..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Search sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Khoảng thời gian</InputLabel>
                <Select
                  value={periodFilter}
                  label="Khoảng thời gian"
                  onChange={(e) => setPeriodFilter(e.target.value)}
                >
                  {periodOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  label="Trạng thái"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="date"
                label="Từ ngày"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="date"
                label="Đến ngày"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchBookingData}
                disabled={isLoading}
              >
                Làm mới
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Export Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<FileDownload />}
          onClick={handleExportData}
          disabled={filteredData.length === 0}
        >
          Xuất Excel
        </Button>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Data Table */}
      <Paper>
        <TableContainer>
          <Table>
            {" "}
            <TableHead>
              {" "}
              <TableRow>
                <TableCell>STT</TableCell>
                <TableCell>Mã booking</TableCell>
                <TableCell>Mã học viên</TableCell>
                <TableCell align="center">Buổi/tuần</TableCell>
                <TableCell align="center">Tổng buổi</TableCell>
                <TableCell align="center">Giờ/buổi</TableCell>
                <TableCell align="right">Tổng chi phí</TableCell>
                <TableCell>Ngày bắt đầu</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography variant="body1" color="text.secondary">
                      Không có dữ liệu
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow key={row.id || `booking-${index}`}>
                      <TableCell>
                        <strong>{page * rowsPerPage + index + 1}</strong>
                      </TableCell>
                      <TableCell>
                        {row.bookingId || row.bookingCode || "N/A"}
                      </TableCell>
                      <TableCell>
                        {row.userId || row.studentId || "N/A"}
                      </TableCell>
                      <TableCell align="center">
                        {row.lessonsPerWeek || 0}
                      </TableCell>
                      <TableCell align="center">
                        {row.totalLessons || 0}
                      </TableCell>
                      <TableCell align="center">
                        {row.hoursPerLesson || 0} giờ
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(row.totalcoins || row.totalCost)}
                      </TableCell>
                      <TableCell>
                        {formatDate(row.startDay || row.startDate)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(row.status)}
                          color={getStatusColor(row.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(row.createdAt)}</TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
        />
      </Paper>
    </Box>
  );
};

export default TutorBookingStatistics;
