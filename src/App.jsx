// App.jsx
import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "./redux/Store"; // Import persistor
import AdminPrivateRoutes from "./route/AdminPrivateRoutes";
// import UserPrivateRoutes from "./route/UserPrivateRoutes";
import OtpProtectedRoute from "./route/OtpProtectedRoute";
// User
const HomePage = lazy(() => import("./pages/User/HomePage"));
const UserDashboard = lazy(() => import("./pages/User/Dashboard"));
const UserLogin = lazy(() => import("./pages/User/Login"));
const Register = lazy(() => import("./pages/User/Register"));
const RegisterTutor = lazy(() => import("./pages/User/RegisterTutor"));
const Profile = lazy(() => import("./pages/User/Profile"));
const ForgotPassword = lazy(() => import("./pages/User/ForgotPassword"));
const OtpVerify = lazy(() => import("./pages/User/OtpVerify"));
const OtpVerifyRegister = lazy(() => import("./pages/User/OtpVerifyRegister"));
const ChangePassword = lazy(() => import("./pages/User/ChangePassword"));
const MicrosoftCallback = lazy(() => import("./pages/MicrosoftCallback"));

import ZoomCallback from "./pages/User/ZoomCallback";
import CreateMeeting from "./pages/User/CreateMeeting";
import PaymentPage from "./pages/User/PaymentPage";
import PaymentSuccess from "./pages/User/PaymentSuccess";
import PaymentFailed from "./pages/User/PaymentFailed";

// Admin
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const AdminLogin = lazy(() => import("./pages/Admin/AdminLogin"));
const ListOfAdmin = lazy(() => import("./pages/Admin/ListOfAdmin"));
const ListOfMajor = lazy(() => import("./pages/Admin/ListOfMajor"));
const ListOfRequest = lazy(() => import("./pages/Admin/ListOfRequest"));
const ListOfStudent = lazy(() => import("./pages/Admin/ListOfStudent"));
const ListOfTutor = lazy(() => import("./pages/Admin/ListOfTutor"));
const ListOfTutorLevel = lazy(() => import("./pages/Admin/ListOfTutorLevel"));
const ListOfSubject = lazy(() => import("./pages/Admin/ListOfSubject"));
const AdminProfile = lazy(() => import("./pages/Admin/AdminProfile"));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <PersistGate loading={null} persistor={persistor}>
          <Routes>
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp-verify" element={<OtpVerify />} />
            <Route
              path="/otp-verify-register"
              element={<OtpVerifyRegister />}
            />
            <Route path="/api/meeting/callback" element={<ZoomCallback />} />

            <Route path="/create-meeting" element={<CreateMeeting />} />

            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="payment" element={<PaymentPage />} />
            <Route path="payment/success" element={<PaymentSuccess />} />
            <Route path="payment/failed" element={<PaymentFailed />} />

            <Route path="user/profile" element={<Profile />} />
            <Route path="register-tutor" element={<RegisterTutor />} />

            {/* call back */}
            <Route
              path="/admin/auth/callback"
              element={<MicrosoftCallback />}
            />
            <Route path="/user/auth/callback" element={<MicrosoftCallback />} />

            <Route element={<OtpProtectedRoute />}>
              <Route path="/change-password" element={<ChangePassword />} />
            </Route>
            {/* user pages */}
            <Route index element={<Navigate to="/home" />} />
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
            </Route>
          </Routes>
        </PersistGate>
      </Suspense>
    </Router>
  );
}

export default App;
