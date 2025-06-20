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
  Rating,
  LinearProgress,
} from "@mui/material";
import {
  FileDownload,
  Search,
  Refresh,
  Star,
  TrendingUp,
  Assessment,
  People,
} from "@mui/icons-material";
import Api from "../../../network/Api";
import { METHOD_TYPE } from "../../../network/methodType";
import { toast } from "react-toastify";
import { exportToExcel } from "../../../utils/excelExport";
import numeral from "numeral";
import "numeral/locales/vi";

// Set Vietnamese locale for numeral
numeral.locale("vi");

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

// Rating options for filtering
const ratingOptions = [
  { value: "all", label: "Tất cả đánh giá" },
  { value: "5", label: "5 sao" },
  { value: "4", label: "4 sao" },
  { value: "3", label: "3 sao" },
  { value: "2", label: "2 sao" },
  { value: "1", label: "1 sao" },
];

const TutorRatingStatistics = () => {
  const userProfile = useSelector((state) => state.user.userProfile);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  // State for rating data
  const [ratingData, setRatingData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
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

  // Fetch rating data
  const fetchRatingData = useCallback(async () => {
    if (!isTutor || !userProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      const tutorId = userProfile.id || userProfile.userId;
      console.log("📊 Fetching rating data for tutor:", tutorId);

      const params = { tutorId };

      // Add date filters if specified
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await Api({
        endpoint: "classroom-assessment/search-with-time-for-tutor",
        method: METHOD_TYPE.GET,
        params,
      });

      console.log("📊 Rating API Response:", response);

      if (response?.success || response?.data) {
        const data = response.data || response;
        const items = data.items || [];
        const total = data.total || items.length;
        const averageRating = data.averageRatingWithTime || 0;

        // Transform data
        const transformedData = items.map((item, index) => ({
          id: item.classroomAssessmentId || index,
          classroomAssessmentId: item.classroomAssessmentId,
          userId: item.userId,
          tutorId: item.tutorId,
          classroomId: item.classroomId,
          meetingId: item.meetingId,
          classroomEvaluation: parseFloat(item.classroomEvaluation) || 0,
          description: item.description,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }));
        setRatingData(transformedData);
        console.log("✅ Rating data loaded:", {
          total,
          averageRating,
          itemsCount: transformedData.length,
        });
      } else {
        throw new Error(response?.message || "Không thể tải dữ liệu đánh giá");
      }
    } catch (error) {
      console.error("❌ Error fetching rating data:", error);
      setError("Lỗi khi tải dữ liệu đánh giá: " + error.message);
      toast.error("Lỗi khi tải dữ liệu đánh giá");
    } finally {
      setIsLoading(false);
    }
  }, [isTutor, userProfile, startDate, endDate]);

  // Filter data based on search term, period, and rating
  const filteredData = useMemo(() => {
    let filtered = [...ratingData];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.classroomAssessmentId
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.classroomId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply rating filter
    if (ratingFilter !== "all") {
      const targetRating = parseInt(ratingFilter);
      filtered = filtered.filter((item) => {
        const rating = Math.floor(item.classroomEvaluation);
        return rating === targetRating;
      });
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
  }, [ratingData, searchTerm, ratingFilter, periodFilter]);

  // Calculate rating distribution from filtered data
  const ratingDistribution = useMemo(() => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    filteredData.forEach((item) => {
      const rating = Math.floor(item.classroomEvaluation);
      if (rating >= 1 && rating <= 5) {
        distribution[rating]++;
      }
    });

    const total = filteredData.length;
    return Object.entries(distribution).map(([rating, count]) => ({
      rating: parseInt(rating),
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }));
  }, [filteredData]);

  // Calculate statistics from filtered data
  const stats = useMemo(() => {
    const totalRatings = filteredData.length;
    const avgRating =
      totalRatings > 0
        ? filteredData.reduce(
            (sum, item) => sum + item.classroomEvaluation,
            0
          ) / totalRatings
        : 0;

    const highRatings = filteredData.filter(
      (item) => item.classroomEvaluation >= 4
    ).length;
    const lowRatings = filteredData.filter(
      (item) => item.classroomEvaluation < 3
    ).length;

    return {
      totalRatings,
      averageRating: avgRating,
      highRatings,
      lowRatings,
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
        "Mã đánh giá": row.classroomAssessmentId || "",
        "Mã học viên": row.userId || "",
        "Mã lớp học": row.classroomId || "",
        "Mã cuộc họp": row.meetingId || "",
        "Điểm đánh giá": row.classroomEvaluation,
        "Mô tả": row.description || "",
        "Ngày đánh giá": formatDate(row.createdAt),
      }));

      await exportToExcel(exportData, "Thong_ke_danh_gia_gia_su");
      toast.success("Xuất dữ liệu thành công!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Lỗi khi xuất dữ liệu");
    }
  }, [filteredData]);

  // Load data on component mount
  useEffect(() => {
    fetchRatingData();
  }, [fetchRatingData]);

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Star sx={{ fontSize: 40, color: "warning.main", mr: 2 }} />
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Đánh giá trung bình
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "bold", color: "warning.main" }}
                  >
                    {stats.averageRating.toFixed(1)} ★
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
                <People sx={{ fontSize: 40, color: "primary.main", mr: 2 }} />
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Tổng đánh giá
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                    {stats.totalRatings}
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
                    Đánh giá cao (≥4⭐)
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "bold", color: "success.main" }}
                  >
                    {stats.highRatings}
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
                <Assessment sx={{ fontSize: 40, color: "error.main", mr: 2 }} />
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Đánh giá thấp (&lt;3⭐)
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "bold", color: "error.main" }}
                  >
                    {stats.lowRatings}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Rating Distribution */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Phân bố đánh giá
          </Typography>
          <Grid container spacing={2}>
            {ratingDistribution.reverse().map((item) => (
              <Grid item xs={12} key={item.rating}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: 40 }}>
                    {item.rating} ⭐
                  </Typography>
                  <Box sx={{ width: "100%", mx: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={item.percentage}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ minWidth: 80 }}>
                    {item.count} ({item.percentage.toFixed(1)}%)
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Tìm kiếm"
                placeholder="Tìm theo mã đánh giá, mã học viên hoặc mô tả..."
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
                <InputLabel>Mức đánh giá</InputLabel>
                <Select
                  value={ratingFilter}
                  label="Mức đánh giá"
                  onChange={(e) => setRatingFilter(e.target.value)}
                >
                  {ratingOptions.map((option) => (
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
                onClick={fetchRatingData}
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
        <TableContainer className="rating-table">
          <Table>
            {" "}
            <TableHead>
              <TableRow>
                <TableCell>STT</TableCell>
                <TableCell>Tên học viên</TableCell>
                <TableCell align="center">Điểm đánh giá</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Ngày đánh giá</TableCell>
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
                      <Star />
                      <Typography>Không có dữ liệu đánh giá</Typography>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow key={row.id || `rating-${index}`}>
                      <TableCell>
                        <strong>{page * rowsPerPage + index + 1}</strong>
                      </TableCell>{" "}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {row.userId || row.studentId || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Rating
                            value={row.classroomEvaluation}
                            readOnly
                            precision={0.1}
                            size="small"
                          />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            ({row.classroomEvaluation})
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={row.description}
                        >
                          {row.description || "Không có mô tả"}
                        </Typography>
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

export default TutorRatingStatistics;
