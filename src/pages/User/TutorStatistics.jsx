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

  // Debug: Log summaryStats whenever it changes
  useEffect(() => {
    console.log("🔍 SummaryStats updated:", summaryStats);
  }, [summaryStats]);

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
      />{" "}
      {/* Header */}
      <Box
        className="tutor-statistics-header"
        sx={{ textAlign: "center", mb: 4 }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 2,
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
          }}
        >
          Thống Kê Tổng Hợp
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "rgba(255, 255, 255, 0.9)",
            fontWeight: 400,
            fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          Theo dõi hiệu suất giảng dạy và doanh thu của bạn một cách chi tiết và
          trực quan
        </Typography>
      </Box>
      {/* Summary Cards - 2x2 Layout */}
      <Grid
        container
        spacing={3}
        sx={{
          mb: 4,
          maxWidth: "800px", // Increased width for better proportion
          margin: "0 auto 32px auto", // Center the grid
          justifyContent: "center",
          "& .MuiGrid-item": {
            display: "flex",
            alignItems: "stretch",
          },
        }}
      >
        {" "}
        {/* Card 1: Tổng doanh thu */}
        <Grid item xs={12} sm={6} md={6} lg={3}>
          {" "}
          <Card
            className="tutor-statistics-summary-card"
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              width: "100%",
              height: "160px",
              display: "flex",
              flexDirection: "column",
              borderRadius: "20px",
              boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: "0 16px 48px rgba(102, 126, 234, 0.4)",
              },
            }}
          >
            {" "}
            <CardContent
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <AttachMoney
                sx={{
                  fontSize: 40,
                  mb: 1,
                  opacity: 0.9,
                }}
              />{" "}
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  opacity: 0.8,
                }}
              >
                Tổng doanh thu
              </Typography>{" "}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  fontSize: "1.5rem",
                  lineHeight: 1,
                }}
              >
                {formatCurrency(summaryStats.totalRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* Card 2: Tổng lượt thuê */}
        <Grid item xs={12} sm={6} md={6} lg={3}>
          <Card
            className="tutor-statistics-summary-card"
            sx={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              width: "100%",
              height: "160px",
              display: "flex",
              flexDirection: "column",
              borderRadius: "20px",
              boxShadow: "0 8px 32px rgba(240, 147, 251, 0.3)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: "0 16px 48px rgba(240, 147, 251, 0.4)",
              },
            }}
          >
            {" "}
            <CardContent
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <BookOnline
                sx={{
                  fontSize: 40,
                  mb: 1,
                  opacity: 0.9,
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  opacity: 0.8,
                }}
              >
                Tổng lượt thuê
              </Typography>{" "}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  fontSize: "1.5rem",
                  lineHeight: 1,
                }}
              >
                {summaryStats.totalBookings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>{" "}
        {/* Card 3: Đánh giá trung bình */}
        <Grid item xs={12} sm={6} md={6} lg={3}>
          <Card
            className="tutor-statistics-summary-card"
            sx={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "white",
              width: "100%",
              height: "160px",
              display: "flex",
              flexDirection: "column",
              borderRadius: "20px",
              boxShadow: "0 8px 32px rgba(79, 172, 254, 0.3)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: "0 16px 48px rgba(79, 172, 254, 0.4)",
              },
            }}
          >
            {" "}
            <CardContent
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Star
                sx={{
                  fontSize: 40,
                  mb: 1,
                  opacity: 0.9,
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  opacity: 0.8,
                }}
              >
                Đánh giá trung bình
              </Typography>{" "}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  fontSize: "1.5rem",
                  lineHeight: 1,
                }}
              >
                {summaryStats.averageRating.toFixed(1)} ★
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* Card 4: Số đánh giá */}
        <Grid item xs={12} sm={6} md={6} lg={3}>
          <Card
            className="tutor-statistics-summary-card"
            sx={{
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              color: "white",
              width: "100%",
              height: "160px",
              display: "flex",
              flexDirection: "column",
              borderRadius: "20px",
              boxShadow: "0 8px 32px rgba(67, 233, 123, 0.3)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: "0 16px 48px rgba(67, 233, 123, 0.4)",
              },
            }}
          >
            <CardContent
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              {" "}
              <People
                sx={{
                  fontSize: 40,
                  mb: 1,
                  opacity: 0.9,
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  opacity: 0.8,
                }}
              >
                Số đánh giá
              </Typography>{" "}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  fontSize: "1.5rem",
                  lineHeight: 1,
                }}
              >
                {summaryStats.totalRatings}
              </Typography>
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
        </Box>{" "}
        {/* Tab Panels */}
        <Box
          className="tutor-statistics-tab-panel tutor-statistics-tab-content"
          sx={{ p: 3, minHeight: 600 }}
        >
          {currentTab === 0 && (
            <Box className="tutor-statistics-tab-content">
              <TutorRevenueStatistics />
            </Box>
          )}
          {currentTab === 1 && (
            <Box className="tutor-statistics-tab-content">
              <TutorBookingStatistics />
            </Box>
          )}
          {currentTab === 2 && (
            <Box className="tutor-statistics-tab-content">
              <TutorRatingStatistics />
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default TutorStatistics;
