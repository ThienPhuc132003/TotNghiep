// src/App.jsx
import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "./redux/Store"; // Đảm bảo đường dẫn đúng
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layouts
import HomePageLayout from "./components/User/layout/HomePageLayout"; // Đảm bảo đường dẫn đúng
import AccountPageLayout from "./components/User/layout/AccountPageLayout"; // Đảm bảo đường dẫn đúng

// Guards & Utils
import AdminPrivateRoutes from "./route/AdminPrivateRoutes"; // Đảm bảo đường dẫn đúng
import OtpProtectedRoute from "./route/OtpProtectedRoute"; // Đảm bảo đường dẫn đúng
import TutorRegistrationGuard from "./route/TutorRegistrationGuard "; // Đảm bảo đường dẫn đúng
import ProtectRoute from "./route/ProtectRoute"; // Chỉ import default

// User Pages
const HomePage = lazy(() => import("./pages/User/HomePage"));
const UserLogin = lazy(() => import("./pages/User/Login"));
const Register = lazy(() => import("./pages/User/Register"));
const TutorQualificationTestPage = lazy(() =>
  import("./pages/User/TutorQualificationTestPage")
);
const Profile = lazy(() => import("./pages/User/Profile"));
const ForgotPassword = lazy(() => import("./pages/User/ForgotPassword"));
const OtpVerify = lazy(() => import("./pages/User/OtpVerify"));
const OtpVerifyRegister = lazy(() => import("./pages/User/OtpVerifyRegister"));
const ChangePassword = lazy(() => import("./pages/User/ChangePassword"));
const AboutUs = lazy(() => import("./pages/User/AboutUs"));
const TutorSearch = lazy(() => import("./pages/User/TutorSearch"));
const TutorDetailPage = lazy(() => import("./pages/User/TutorDetailPage"));
const TutorRegister = lazy(() => import("./pages/User/TutorRegister"));
const MicrosoftCallback = lazy(() => import("./pages/MicrosoftCallback"));
const RulesRegulationsPage = lazy(() =>
  import("./pages/User/RulesRegulationsPage")
);
const Wallet = lazy(() => import("./pages/User/WalletPage"));
const PaymentSuccess = lazy(() => import("./pages/User/PaymentSuccess"));
const PaymentFailed = lazy(() => import("./pages/User/PaymentFailed"));
const FavoriteTutorsPage = lazy(() =>
  import("./pages/User/FavoriteTutorsPage")
);
const CurriculumPage = lazy(() =>
  import("./pages/User/CurriculumManagementPage")
);
const TutorBookingRequestsPage = lazy(() =>
  import("./pages/User/TutorBookingRequestsPage")
);
const TutorClassroomPage = lazy(() =>
  import("./pages/User/TutorClassroomPage")
);
const StudentClassroomPage = lazy(() =>
  import("./pages/User/StudentClassroomPage")
);
const TutorPersonalRevenueStatistics = lazy(() =>
  import("./pages/User/TutorPersonalRevenueStatisticsFixed")
);

// Zoom related pages
const ZoomCallback = lazy(() => import("./pages/User/ZoomCallback"));
const TutorMeetingRoomPage = lazy(() =>
  import("./pages/User/TutorMeetingRoomPage")
);

// Zoom Test Components for debugging
const ZoomDebugComponent = lazy(() =>
  import("./components/User/Zoom/ZoomDebugComponent")
);
const QuickZoomTest = lazy(() =>
  import("./components/User/Zoom/QuickZoomTest")
);
const SimpleZoomTest = lazy(() =>
  import("./components/User/Zoom/SimpleZoomTest")
);
const SmartZoomLoader = lazy(() =>
  import("./components/User/Zoom/SmartZoomLoader")
);

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const AdminLogin = lazy(() => import("./pages/Admin/AdminLogin"));
const ListOfAdmin = lazy(() => import("./pages/Admin/ListOfAdmin"));
const ListOfMajor = lazy(() => import("./pages/Admin/ListOfMajor"));
const ListOfRequest = lazy(() => import("./pages/Admin/ListOfRequest"));
const ListOfStudent = lazy(() => import("./pages/Admin/ListOfStudent"));
const ListOfTutor = lazy(() => import("./pages/Admin/ListOfTutor"));
const ListOfTutorLevel = lazy(() => import("./pages/Admin/ListOfTutorLevel"));
const ListOfSubject = lazy(() => import("./pages/Admin/ListOfSubject"));
const ListOfCurriculumn = lazy(() => import("./pages/Admin/ListOfCurriculumn"));
const ListOfValueConfigs = lazy(() =>
  import("./pages/Admin/ListOfValueConfigs")
);
const ListOfTransactions = lazy(() =>
  import("./pages/Admin/ListOfTransactions")
);
const ListOfTutorPayments = lazy(() =>
  import("./pages/Admin/ListOfTutorPayments")
);
const RevenueStatistics = lazy(() => import("./pages/Admin/RevenueStatistics"));
const TutorHireStatistics = lazy(() =>
  import("./pages/Admin/TutorHireStatistics")
);
const TutorRevenueStatistics = lazy(() =>
  import("./pages/Admin/TutorRevenueStatistics")
);
const TutorAssessmentStatistics = lazy(() =>
  import("./pages/Admin/TutorAssessmentStatistics")
);
const AdminProfile = lazy(() => import("./pages/Admin/AdminProfile"));

function App() {
  return (
    <Router>
      <Suspense
        fallback={
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
              fontSize: "1.5rem",
              fontFamily: "Arial, sans-serif",
              color: "#333",
            }}
          >
            Đang tải trang...
          </div>
        }
      >
        <PersistGate loading={null} persistor={persistor}>
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
          <Routes>
            {/* --- CÁC ROUTE SỬ DỤNG HomePageLayout --- */}
            <Route element={<HomePageLayout />}>
              <Route index element={<Navigate to="/trang-chu" replace />} />
              <Route path="/trang-chu" element={<HomePage />} />
              <Route path="/tim-kiem-gia-su" element={<TutorSearch />} />
              <Route path="/gia-su/:userId" element={<TutorDetailPage />} />
              <Route path="/about" element={<AboutUs />} />
              <Route
                path="/quy-dinh-noi-quy-huong-dan"
                element={<RulesRegulationsPage />}
              />
              <Route
                path="/trac-nghiem-gia-su"
                element={<TutorQualificationTestPage />}
              />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/login" element={<UserLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route element={<TutorRegistrationGuard />}>
                <Route path="/dang-ky-gia-su" element={<TutorRegister />} />
              </Route>

              {/* --- ROUTE QUẢN LÝ TÀI KHOẢN (USER & TUTOR) - CẦN ĐĂNG NHẬP --- */}
              <Route element={<ProtectRoute />}>
                <Route path="/tai-khoan/ho-so" element={<AccountPageLayout />}>
                  {/* USER specific routes */}
                  <Route path="thong-tin-ca-nhan" element={<Profile />} />
                  <Route
                    path="gia-su-yeu-thich"
                    element={<FavoriteTutorsPage />}
                  />
                  <Route
                    path="giao-trinh-ca-nhan"
                    element={<CurriculumPage />}
                  />
                  <Route
                    path="lop-hoc-cua-toi"
                    element={<StudentClassroomPage />}
                  />{" "}
                  {/* TUTOR specific routes - được bảo vệ thêm bởi role="TUTOR" */}{" "}
                  <Route element={<ProtectRoute role="TUTOR" />}>
                    <Route path="ho-so-gia-su" element={<TutorRegister />} />
                    <Route
                      path="quan-ly-lop-hoc"
                      element={<TutorClassroomPage />}
                    />
                    <Route
                      path="yeu-cau-day"
                      element={<TutorBookingRequestsPage />}
                    />
                    <Route
                      path="thong-ke-doanh-thu"
                      element={<TutorPersonalRevenueStatistics />}
                    />
                  </Route>{" "}
                  {/* SHARED routes for both USER and TUTOR */}
                  <Route path="vi-ca-nhan" element={<Wallet />} />
                  <Route path="phong-hoc" element={<TutorMeetingRoomPage />} />
                </Route>

                {/* Route Đổi Mật Khẩu - Cần đăng nhập và OTP */}
                <Route element={<OtpProtectedRoute />}></Route>

                {/* Payment Routes - Cần đăng nhập */}
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/failed" element={<PaymentFailed />} />
              </Route>
            </Route>{" "}
            {/* Các route không dùng HomePageLayout (standalone) */}
            <Route path="/otp-verify" element={<OtpVerify />} />
            <Route
              path="/otp-verify-register"
              element={<OtpVerifyRegister />}
            />
            <Route path="/user/auth/callback" element={<MicrosoftCallback />} />
            <Route
              path="/admin/auth/callback"
              element={<MicrosoftCallback />}
            />
            <Route path="/meeting/callback" element={<ZoomCallback />} />
            {/* Zoom SDK Testing Routes */}{" "}
            <Route path="/zoom-debug" element={<ZoomDebugComponent />} />
            <Route path="/zoom-quick-test" element={<QuickZoomTest />} />
            <Route path="/zoom-simple-test" element={<SimpleZoomTest />} />
            <Route
              path="/zoom-production-test"
              element={
                <SmartZoomLoader
                  meetingConfig={{
                    apiKey: "test-key",
                    signature: "test-signature",
                    meetingNumber: "123456789",
                    passWord: "test123",
                    userName: "Production Test User",
                    userEmail: "test@example.com",
                    leaveUrl: "/",
                  }}
                />
              }
            />
            {/* ADMIN ROUTES */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<AdminPrivateRoutes />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/admin/nhan-vien" element={<ListOfAdmin />} />
              <Route path="/admin/nganh" element={<ListOfMajor />} />
              <Route path="/admin/yeu-cau" element={<ListOfRequest />} />
              <Route path="/admin/nguoi-hoc" element={<ListOfStudent />} />
              <Route path="/admin/gia-su" element={<ListOfTutor />} />
              <Route path="/admin/hang-gia-su" element={<ListOfTutorLevel />} />
              <Route path="/admin/mon-hoc" element={<ListOfSubject />} />
              <Route path="/admin/giao-trinh" element={<ListOfCurriculumn />} />
              <Route
                path="/admin/goi-thanh-toan"
                element={<ListOfValueConfigs />}
              />{" "}
              <Route
                path="/admin/thanh-toan-cho-gia-su"
                element={<ListOfTutorPayments />}
              />{" "}
              <Route path="/admin/doanh-thu" element={<RevenueStatistics />} />
              <Route
                path="/admin/luot-thue-gia-su"
                element={<TutorHireStatistics />}
              />{" "}
              <Route
                path="/admin/doanh-thu-gia-su"
                element={<TutorRevenueStatistics />}
              />
              <Route
                path="/admin/danh-gia-gia-su"
                element={<TutorAssessmentStatistics />}
              />
              <Route
                path="/admin/nap-vi-nguoi-dung"
                element={<ListOfTransactions />}
              />
            </Route>
          </Routes>
        </PersistGate>
      </Suspense>
    </Router>
  );
}

export default App;
