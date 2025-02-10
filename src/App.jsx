import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminPrivateRoutes from "./route/AdminPrivateRoutes";
// import UserPrivateRoutes from "./route/UserPrivateRoutes";
import OtpProtectedRoute from "./route/OtpProtectedRoute";
// User
const UserDashboard = lazy(() => import("./pages/User/Dashboard"));
const UserLogin = lazy(() => import("./pages/User/Login"));
const Register = lazy(() => import("./pages/User/Register"));
const RegisterTutor = lazy(() => import("./pages/User/RegisterTutor"));
const Profile = lazy(() => import("./pages/User/Profile"));
const ForgotPassword = lazy(() => import("./pages/User/ForgotPassword"));
const OtpVerify = lazy(() => import("./pages/User/OtpVerify"));
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
const AdminProfile = lazy(() => import("./pages/Admin/AdminProfile"));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/otp-verify" element={<OtpVerify />} />

          <Route path="/api/meeting/callback" element={<ZoomCallback />} />

          <Route path="/create-meeting" element={<CreateMeeting />} />

          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="payment/success" element={<PaymentSuccess />} />
          <Route path="payment/failed" element={<PaymentFailed />} />

          <Route path="user/profile" element={<Profile />} />
          <Route path="register-tutor" element={<RegisterTutor />} />

          {/* call back */}
          <Route path="/admin/auth/callback" element={<MicrosoftCallback />} />
          <Route path="/user/auth/callback" element={<MicrosoftCallback />} />
 

          <Route element={<OtpProtectedRoute />}>
            <Route path="/change-password" element={<ChangePassword />} />
          </Route>
          {/* user pages */}
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="/" element={<AdminPrivateRoutes />}>
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/profile" element={<AdminProfile />} />
            <Route path="quan-ly-admin" element={<ListOfAdmin />} />
            <Route path="quan-ly-nganh" element={<ListOfMajor />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
