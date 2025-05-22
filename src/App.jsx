import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "./redux/Store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layouts
import HomePageLayout from "./components/User/layout/HomePageLayout";
import AccountPageLayout from "./components/User/layout/AccountPageLayout";

// Guards & Utils
import AdminPrivateRoutes from "./route/AdminPrivateRoutes";
import OtpProtectedRoute from "./route/OtpProtectedRoute";
import TutorRegistrationGuard from "./route/TutorRegistrationGuard ";
import ProtectRoute from "./route/ProtectRoute";

// User Pages
const HomePage = lazy(() => import("./pages/User/HomePage"));
const UserLogin = lazy(() => import("./pages/User/Login"));
const Register = lazy(() => import("./pages/User/Register"));
const TutorQualificationTestPage = lazy(() =>
  import("./pages/User/TutorQualificationTestPage")
);
const Profile = lazy(() => import("./pages/User/Profile")); // Trang hồ sơ cho USER
const ForgotPassword = lazy(() => import("./pages/User/ForgotPassword"));
const OtpVerify = lazy(() => import("./pages/User/OtpVerify"));
const OtpVerifyRegister = lazy(() => import("./pages/User/OtpVerifyRegister"));
const ChangePassword = lazy(() => import("./pages/User/ChangePassword"));
const AboutUs = lazy(() => import("./pages/User/AboutUs"));
const TutorSearch = lazy(() => import("./pages/User/TutorSearch"));
const TutorDetailPage = lazy(() => import("./pages/User/TutorDetailPage"));
const TutorRegister = lazy(() => import("./pages/User/TutorRegister")); // Dùng cho trang đăng ký VÀ hồ sơ Gia sư
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
import ZoomCallback from "./pages/User/ZoomCallback";
import CreateMeeting from "./pages/User/CreateMeeting";

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
            }}
          >
            Loading...
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
              <Route path="/login" element={<UserLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route element={<TutorRegistrationGuard />}>
                <Route path="/dang-ky-gia-su" element={<TutorRegister />} />
              </Route>

              {/* --- ROUTE QUẢN LÝ TÀI KHOẢN CHUNG (USER & TUTOR) --- */}
              <Route element={<ProtectRoute />}>
                {" "}
                {/* Chỉ cần đăng nhập */}
                <Route
                  path="/tai-khoan/ho-so" // BASE PATH CHUNG
                  element={<AccountPageLayout />}
                >
                  {/* AccountPageLayout sẽ tự điều hướng đến trang con mặc định dựa trên role */}

                  {/* === USER (Người học) specific routes === */}
                  <Route path="thong-tin-ca-nhan" element={<Profile />} />
                  <Route
                    path="gia-su-yeu-thich"
                    element={<FavoriteTutorsPage />}
                  />

                  {/* === TUTOR (Gia sư) specific routes === */}
                  <Route path="ho-so-gia-su" element={<TutorRegister />} />
                  <Route
                    path="giao-trinh-ca-nhan"
                    element={<CurriculumPage />}
                  />

                  {/* === SHARED routes for both USER and TUTOR under AccountPageLayout === */}
                  <Route path="vi-cua-toi" element={<Wallet />} />
                </Route>
              </Route>

              {/* Route Đổi Mật Khẩu */}
              <Route element={<ProtectRoute />}>
                <Route element={<OtpProtectedRoute />}>
                  <Route path="/change-password" element={<ChangePassword />} />
                </Route>
              </Route>

              {/* Payment Routes */}
              <Route element={<ProtectRoute />}>
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/failed" element={<PaymentFailed />} />
              </Route>
            </Route>{" "}
            {/* Kết thúc các Route sử dụng HomePageLayout */}
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
            <Route path="/api/meeting/callback" element={<ZoomCallback />} />
            <Route path="/create-meeting" element={<CreateMeeting />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            {/* ADMIN ROUTES */}
            <Route path="/admin/*" element={<AdminPrivateRoutes />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="nhan-vien" element={<ListOfAdmin />} />
              <Route path="nganh" element={<ListOfMajor />} />
              <Route path="yeu-cau" element={<ListOfRequest />} />
              <Route path="nguoi-hoc" element={<ListOfStudent />} />
              <Route path="gia-su" element={<ListOfTutor />} />
              <Route path="hang-gia-su" element={<ListOfTutorLevel />} />
              <Route path="mon-hoc" element={<ListOfSubject />} />
              <Route path="giao-trinh" element={<ListOfCurriculumn />} />
              <Route path="goi-thanh-toan" element={<ListOfValueConfigs />} />
              <Route
                path="thanh-toan-cho-gia-su"
                element={<ListOfTutorPayments />}
              />
              <Route
                path="nap-vi-nguoi-dung"
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
