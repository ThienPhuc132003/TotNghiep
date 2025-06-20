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
  AttachMoney,
  TrendingUp,
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
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "N/A";
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

const TutorRevenueStatistics = () => {
  const userProfile = useSelector((state) => state.user.userProfile);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  // State for revenue data
  const [revenueData, setRevenueData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");
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

  // Fetch revenue data
  const fetchRevenueData = useCallback(async () => {
    if (!isTutor || !userProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      const tutorId = userProfile.id || userProfile.userId;
      console.log("📊 Fetching revenue data for tutor:", tutorId);

      const params = { tutorId };

      // Add date filters if specified
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await Api({
        endpoint: "manage-payment/search-with-time-by-tutor",
        method: METHOD_TYPE.GET,
        params,
      });

      console.log("📊 Revenue API Response:", response);

      if (response?.success || response?.data) {
        const data = response.data || response;
        const items = data.items || [];
        const totalRevenue = data.totalRevenue || 0;

        // Transform data
        const transformedData = items.map((item, index) => ({
          id: item.managePaymentId || index,
          managePaymentId: item.managePaymentId,
          studentName:
            item.user?.userDisplayName || item.user?.fullname || "N/A",
          studentId: item.userId,
          tutorReceive: item.coinOfTutorReceive,
          userPayment: item.coinOfUserPayment,
          webReceive: item.coinOfWebReceive,
          status: "COMPLETED",
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          user: item.user,
          tutor: item.tutor,
        }));

        setRevenueData(transformedData);
        setTotalRevenue(totalRevenue);
        console.log("✅ Revenue data loaded:", {
          total: data.total,
          totalRevenue,
          itemsCount: transformedData.length,
        });
      } else {
        throw new Error(response?.message || "Không thể tải dữ liệu doanh thu");
      }
    } catch (error) {
      console.error("❌ Error fetching revenue data:", error);
      setError("Lỗi khi tải dữ liệu doanh thu: " + error.message);
      toast.error("Lỗi khi tải dữ liệu doanh thu");
    } finally {
      setIsLoading(false);
    }
  }, [isTutor, userProfile, startDate, endDate]);

  // Filter data based on search term and period
  const filteredData = useMemo(() => {
    let filtered = [...revenueData];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.managePaymentId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
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
  }, [revenueData, searchTerm, periodFilter]);

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
        "Mã giao dịch": row.managePaymentId || "",
        "Tên học viên": row.studentName || "",
        "Mã học viên": row.studentId || "",
        "Số tiền học viên trả": formatCurrency(row.userPayment),
        "Số tiền gia sư nhận": formatCurrency(row.tutorReceive),
        "Số tiền web nhận": formatCurrency(row.webReceive),
        "Ngày giao dịch": formatDate(row.createdAt),
        "Trạng thái": row.status,
      }));

      await exportToExcel(exportData, "Thong_ke_doanh_thu_gia_su");
      toast.success("Xuất dữ liệu thành công!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Lỗi khi xuất dữ liệu");
    }
  }, [filteredData]);

  // Load data on component mount
  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AttachMoney
                  sx={{ fontSize: 40, color: "primary.main", mr: 2 }}
                />
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Tổng doanh thu
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                    {formatCurrency(totalRevenue)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TrendingUp
                  sx={{ fontSize: 40, color: "success.main", mr: 2 }}
                />
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Số giao dịch
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "bold", color: "success.main" }}
                  >
                    {filteredData.length}
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
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Tìm kiếm"
                placeholder="Tìm theo tên, mã học viên hoặc mã giao dịch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Search sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
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
                onClick={fetchRevenueData}
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
      )}{" "}
      {/* Data Table */}
      <Paper elevation={0}>
        <TableContainer className="revenue-table">
          <Table>
            {" "}
            <TableHead>
              <TableRow>
                <TableCell>STT</TableCell>
                <TableCell>Tên học viên</TableCell>
                <TableCell align="right">Gia sư nhận</TableCell>
                <TableCell>Ngày giao dịch</TableCell>
                <TableCell>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {" "}
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="tutor-statistics-loading">
                      <CircularProgress />
                      <Typography>Đang tải dữ liệu...</Typography>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="tutor-statistics-empty-state">
                      <AttachMoney />
                      <Typography>Không có dữ liệu doanh thu</Typography>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow key={row.id || `revenue-${index}`}>
                      <TableCell>
                        <strong>{page * rowsPerPage + index + 1}</strong>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {row.studentName || row.userName || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#059669" }}
                        >
                          {formatCurrency(row.tutorReceive || row.tutorRevenue)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "0.85rem" }}
                        >
                          {formatDate(row.createdAt || row.paymentDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.status || "COMPLETED"}
                          color={
                            row.status === "SUCCESS" ||
                            row.status === "COMPLETED"
                              ? "success"
                              : row.status === "PENDING"
                              ? "warning"
                              : row.status === "FAILED"
                              ? "error"
                              : "default"
                          }
                          size="small"
                          variant="filled"
                        />
                      </TableCell>
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

export default TutorRevenueStatistics;
