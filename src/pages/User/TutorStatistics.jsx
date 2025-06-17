import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Tab,
  Tabs,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  Assessment,
  AttachMoney,
  BookOnline,
  Star,
  People,
} from "@mui/icons-material";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/css/User/TutorStatistics.style.css";
import numeral from "numeral";
import "numeral/locales/vi";

// Import các component con cho từng tab
import TutorRevenueStatistics from "./components/TutorRevenueStatistics";
import TutorBookingStatistics from "./components/TutorBookingStatistics";
import TutorRatingStatistics from "./components/TutorRatingStatistics";

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

const TutorStatistics = () => {
  const userProfile = useSelector((state) => state.user.userProfile);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  // State for tabs
  const [currentTab, setCurrentTab] = useState(0);

  // States for summary statistics
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    averageRating: 0,
    totalRatings: 0,
  });

  // Check if user is tutor
  const isTutor = useMemo(() => {
    if (!isAuthenticated || !userProfile) return false;

    // Method 1: Check roles array
    if (userProfile.roles && Array.isArray(userProfile.roles)) {
      return userProfile.roles.some(
        (role) =>
          role.name === "TUTOR" ||
          role.name === "Tutor" ||
          role.name?.toLowerCase() === "tutor"
      );
    }

    // Method 2: Check roleId field
    if (userProfile.roleId) {
      return String(userProfile.roleId).toUpperCase() === "TUTOR";
    }

    return false;
  }, [isAuthenticated, userProfile]);

  // Fetch summary statistics
  const fetchSummaryStats = useCallback(async () => {
    if (!isTutor || !userProfile) return;

    const tutorId = userProfile.id || userProfile.userId;

    try {
      // Fetch all three statistics in parallel
      const [revenueResponse, bookingResponse, ratingResponse] =
        await Promise.all([
          Api({
            endpoint: "manage-payment/search-with-time-by-tutor",
            method: METHOD_TYPE.GET,
            params: { tutorId },
          }),
          Api({
            endpoint: "booking-request/search-with-time-for-tutor",
            method: METHOD_TYPE.GET,
            params: { tutorId },
          }),
          Api({
            endpoint: "classroom-assessment/search-with-time-for-tutor",
            method: METHOD_TYPE.GET,
            params: { tutorId },
          }),
        ]);

      // Process revenue data
      const totalRevenue = revenueResponse?.data?.totalRevenue || 0;

      // Process booking data
      const totalBookings = bookingResponse?.data?.total || 0;

      // Process rating data
      const averageRating = ratingResponse?.data?.averageRatingWithTime || 0;
      const totalRatings = ratingResponse?.data?.total || 0;

      setSummaryStats({
        totalRevenue,
        totalBookings,
        averageRating,
        totalRatings,
      });

      console.log("📊 Summary stats loaded:", {
        totalRevenue,
        totalBookings,
        averageRating,
        totalRatings,
      });
    } catch (error) {
      console.error("❌ Error fetching summary stats:", error);
      toast.error("Lỗi khi tải thống kê tổng quan");
    }
  }, [isTutor, userProfile]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Load summary statistics on component mount
  useEffect(() => {
    fetchSummaryStats();
  }, [fetchSummaryStats]);

  // If not a tutor, show access denied
  if (!isTutor) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
          flexDirection: "column",
        }}
      >
        <Assessment sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
        <Typography variant="h5" color="text.secondary" textAlign="center">
          Trang thống kê chỉ dành cho gia sư
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          mt={1}
        >
          Bạn cần có vai trò gia sư để truy cập trang này
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="tutor-statistics-container" sx={{ width: "100%", p: 3 }}>
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

      {/* Header */}
      <div className="tutor-statistics-header">
        <Typography variant="h4" component="h1" gutterBottom>
          Thống Kê Tổng Hợp
        </Typography>
        <Typography variant="body1">
          Theo dõi hiệu suất giảng dạy và doanh thu của bạn một cách chi tiết và
          trực quan
        </Typography>
      </div>

      {/* Summary Cards - 2x2 Layout */}
      <Grid
        container
        spacing={{ xs: 2, sm: 2, lg: 3 }}
        sx={{
          mb: 4,
          maxWidth: "600px", // Compact width for 2x2 layout
          margin: "0 auto 32px auto", // Center the grid
          "& .MuiGrid-item": {
            display: "flex",
            alignItems: "stretch",
          },
        }}
      >
        {/* Card 1: Tổng doanh thu */}
        <Grid item xs={12} sm={6}>
          <Card
            className="tutor-statistics-summary-card"
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              minHeight: { xs: 70, sm: 80, lg: 90 },
            }}
          >
            <CardContent
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                p: { xs: 1, sm: 1.5, lg: 2 },
                "&:last-child": { pb: { xs: 1, sm: 1.5, lg: 2 } },
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <AttachMoney
                  sx={{
                    fontSize: { xs: 24, sm: 28, lg: 32 },
                    mr: { xs: 1, sm: 1.5, lg: 2 },
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 0.2,
                      fontSize: { xs: "0.7rem", sm: "0.8rem", lg: "0.85rem" },
                      lineHeight: 1.2,
                      fontWeight: 600,
                    }}
                  >
                    Tổng doanh thu
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: "bold",
                      fontSize: { xs: "0.85rem", sm: "0.95rem", lg: "1rem" },
                      lineHeight: 1.1,
                      wordBreak: "break-word",
                    }}
                  >
                    {formatCurrency(summaryStats.totalRevenue)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 2: Tổng lượt thuê */}
        <Grid item xs={12} sm={6}>
          <Card
            className="tutor-statistics-summary-card"
            sx={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              minHeight: { xs: 70, sm: 80, lg: 90 },
            }}
          >
            <CardContent
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                p: { xs: 1, sm: 1.5, lg: 2 },
                "&:last-child": { pb: { xs: 1, sm: 1.5, lg: 2 } },
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <BookOnline
                  sx={{
                    fontSize: { xs: 24, sm: 28, lg: 32 },
                    mr: { xs: 1, sm: 1.5, lg: 2 },
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 0.2,
                      fontSize: { xs: "0.7rem", sm: "0.8rem", lg: "0.85rem" },
                      lineHeight: 1.2,
                      fontWeight: 600,
                    }}
                  >
                    Tổng lượt thuê
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: "bold",
                      fontSize: { xs: "0.85rem", sm: "0.95rem", lg: "1rem" },
                      lineHeight: 1.1,
                    }}
                  >
                    {summaryStats.totalBookings}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 3: Đánh giá trung bình */}
        <Grid item xs={12} sm={6}>
          <Card
            className="tutor-statistics-summary-card"
            sx={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "white",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              minHeight: { xs: 70, sm: 80, lg: 90 },
            }}
          >
            <CardContent
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                p: { xs: 1, sm: 1.5, lg: 2 },
                "&:last-child": { pb: { xs: 1, sm: 1.5, lg: 2 } },
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <Star
                  sx={{
                    fontSize: { xs: 24, sm: 28, lg: 32 },
                    mr: { xs: 1, sm: 1.5, lg: 2 },
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 0.2,
                      fontSize: { xs: "0.7rem", sm: "0.8rem", lg: "0.85rem" },
                      lineHeight: 1.2,
                      fontWeight: 600,
                    }}
                  >
                    Đánh giá trung bình
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: "bold",
                      fontSize: { xs: "0.85rem", sm: "0.95rem", lg: "1rem" },
                      lineHeight: 1.1,
                    }}
                  >
                    {summaryStats.averageRating.toFixed(1)} ★
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 4: Số đánh giá */}
        <Grid item xs={12} sm={6}>
          <Card
            className="tutor-statistics-summary-card"
            sx={{
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              color: "white",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              minHeight: { xs: 70, sm: 80, lg: 90 },
            }}
          >
            <CardContent
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                p: { xs: 1, sm: 1.5, lg: 2 },
                "&:last-child": { pb: { xs: 1, sm: 1.5, lg: 2 } },
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <People
                  sx={{
                    fontSize: { xs: 24, sm: 28, lg: 32 },
                    mr: { xs: 1, sm: 1.5, lg: 2 },
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 0.2,
                      fontSize: { xs: "0.7rem", sm: "0.8rem", lg: "0.85rem" },
                      lineHeight: 1.2,
                      fontWeight: 600,
                    }}
                  >
                    Số đánh giá
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: "bold",
                      fontSize: { xs: "0.85rem", sm: "0.95rem", lg: "1rem" },
                      lineHeight: 1.1,
                    }}
                  >
                    {summaryStats.totalRatings}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card className="tutor-statistics-tabs">
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                minHeight: 88,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "1.1rem",
              },
            }}
          >
            <Tab
              className="tutor-statistics-tab"
              icon={<AttachMoney />}
              label="Thống kê doanh thu"
              iconPosition="start"
            />
            <Tab
              className="tutor-statistics-tab"
              icon={<BookOnline />}
              label="Thống kê lượt thuê"
              iconPosition="start"
            />
            <Tab
              className="tutor-statistics-tab"
              icon={<Star />}
              label="Thống kê đánh giá"
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box
          className="tutor-statistics-tab-panel tutor-statistics-tab-content"
          sx={{ p: 3 }}
        >
          {currentTab === 0 && <TutorRevenueStatistics />}
          {currentTab === 1 && <TutorBookingStatistics />}
          {currentTab === 2 && <TutorRatingStatistics />}
        </Box>
      </Card>
    </Box>
  );
};

export default TutorStatistics;
