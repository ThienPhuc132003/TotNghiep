import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminPrivateRoutes from "./route/AdminPrivateRoutes";
import UserPrivateRoutes from "./route/UserPrivateRoutes";
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
const MicrosoftCallback = lazy(() => import("./pages/User/MicrosoftCallback"));
import PaymentPage from "./pages/User/PaymentPage";
import PaymentSuccess from "./pages/User/PaymentSuccess";
import PaymentFailed from "./pages/User/PaymentFailed";



// Admin
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const AdminLogin = lazy(() => import("./pages/Admin/AdminLogin"));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/otp-verify" element={<OtpVerify />} />
          <Route path="/auth/callback" element={<MicrosoftCallback />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="payment/success" element={<PaymentSuccess />} />
          <Route path="payment/failed" element={<PaymentFailed />} /> 

          
          {/* Add this route */}
          <Route path="user/profile" element={<Profile />} />
          <Route path="register-tutor" element={<RegisterTutor />} />
          <Route element={<OtpProtectedRoute />}>
            <Route path="/change-password" element={<ChangePassword />} />
          </Route>
          {/* user pages */}
          <Route path="/" element={<UserPrivateRoutes />}>
            <Route index element={<Navigate to="/dashboard" />} />
          </Route>
          <Route path="/" element={<AdminPrivateRoutes />}>
            <Route path="admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
