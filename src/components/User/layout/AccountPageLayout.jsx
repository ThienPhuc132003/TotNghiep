// src/components/User/layout/AccountPageLayout.jsx
import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import Api from "../../../network/Api";
import { METHOD_TYPE } from "../../../network/methodType";
import { clearUserProfile } from "../../../redux/userSlice";
import "../../../assets/css/AccountPageLayout.style.css"; // Đảm bảo file CSS này tồn tại
import dfMale from "../../../assets/images/df-male.png";
import dfFemale from "../../../assets/images/df-female.png";

// Giả sử SidebarUserInfo không đổi
const SidebarUserInfo = () => {
  const user = useSelector((state) => state.user.userProfile);
  if (!user || !user.userProfile) {
    return (
      <div className="sidebar-user-info">
        <img
          src={dfMale}
          alt="User Avatar Placeholder"
          className="sidebar-avatar"
        />
        <div className="sidebar-user-details">
          <span className="sidebar-user-fullname">Người dùng</span>
        </div>
      </div>
    );
  }
  const getAvatar = () =>
    user.avatar ? user.avatar : user.gender === "FEMALE" ? dfFemale : dfMale;

  return (
    <div className="sidebar-user-info">
      <img
        src={getAvatar()}
        alt={user.userProfile.fullname || "User Avatar"}
        className="sidebar-avatar"
      />
      <div className="sidebar-user-details">
        <span
          className="sidebar-user-fullname"
          title={user.userProfile.fullname || "Người dùng"}
        >
          {user.userProfile.fullname || "Người dùng"}
        </span>
      </div>
    </div>
  );
};

const AccountPageLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userProfile);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true, state: { from: location } });
    } else if (isAuthenticated && (!user || !user.userProfile)) {
      // Xử lý trường hợp hiếm: đã xác thực nhưng thiếu profile
    }
  }, [isAuthenticated, user, navigate, location]);

  const isTutor =
    isAuthenticated &&
    user?.userProfile &&
    String(user.roleId).toUpperCase() === "TUTOR";
  const defaultUserPath = "thong-tin-ca-nhan";
  const defaultTutorPath = "ho-so-gia-su";

  useEffect(() => {
    if (isAuthenticated && user && user.userProfile) {
      const baseAccountPath = "/tai-khoan/ho-so";
      if (
        location.pathname === baseAccountPath ||
        location.pathname === `${baseAccountPath}/`
      ) {
        const targetPath = isTutor ? defaultTutorPath : defaultUserPath;
        navigate(`${baseAccountPath}/${targetPath}`, { replace: true });
      }
    }
  }, [
    location.pathname,
    navigate,
    isAuthenticated,
    user,
    isTutor,
    defaultUserPath,
    defaultTutorPath,
  ]);

  if (!isAuthenticated || !user || !user.userProfile) {
    return null; // Hoặc một component loading
  }

  const getSidebarMenuItems = () => {
    if (isTutor) {
      return [
        {
          id: "tutorProfile",
          label: "Hồ Sơ Gia Sư",
          pathBase: "ho-so-gia-su",
          icon: "fas fa-id-badge",
        },
        {
          id: "tutorBookingRequests",
          label: "Yêu Cầu Thuê",
          pathBase: "yeu-cau-day",
          icon: "fas fa-calendar-check",
        },
        {
          id: "tutorWallet",
          label: "Ví Cá Nhân",
          pathBase: "vi-ca-nhan",
          icon: "fas fa-wallet",
        },
        {
          id: "personalSyllabus",
          label: "Giáo Trình Cá Nhân",
          pathBase: "giao-trinh-ca-nhan",
          icon: "fas fa-book-open", // Or another suitable icon
        }, // <<< THÊM MỚI >>>
        {
          id: "tutorClassroom",
          label: "Quản lý lớp học",
          pathBase: "quan-ly-lop-hoc",
          icon: "fas fa-chalkboard-teacher", // Example icon
        },
        // <<< KẾT THÚC THÊM MỚI >>>
      ];
    } else {
      return [
        {
          id: "userProfile",
          label: "Hồ Sơ Học Viên",
          pathBase: "thong-tin-ca-nhan",
          icon: "fas fa-user-circle",
        },
        {
          id: "favoriteTutors",
          label: "Gia Sư Yêu Thích",
          pathBase: "gia-su-yeu-thich",
          icon: "fas fa-heart",
        },
        {
          id: "studentClassroom",
          label: "Lớp học của tôi",
          pathBase: "lop-hoc-cua-toi",
          icon: "fas fa-chalkboard-teacher",
        },
        {
          id: "userWallet",
          label: "Ví Cá Nhân",
          pathBase: "vi-ca-nhan",
          icon: "fas fa-wallet",
        },
      ];
    }
  };

  const sidebarMenuItems = getSidebarMenuItems();
  const basePathForLinks = "/tai-khoan/ho-so";

  const handleLogout = async () => {
    try {
      await Api({ endpoint: "user/logout", method: METHOD_TYPE.POST });
    } catch (error) {
      // Không cần báo lỗi, chỉ log nếu cần
      console.error("Lỗi API đăng xuất (tiếp tục logout client):", error);
    } finally {
      Cookies.remove("token");
      Cookies.remove("role");
      dispatch(clearUserProfile());
      navigate("/login");
    }
  };

  return (
    <div className="account-page-container">
      <div className="account-page-layout-grid">
        <aside className="account-sidebar">
          <SidebarUserInfo />
          <nav className="account-menu-nav">
            <ul>
              {sidebarMenuItems.map((item) => (
                <li
                  key={item.id}
                  className={
                    location.pathname ===
                      `${basePathForLinks}/${item.pathBase}` ||
                    location.pathname.startsWith(
                      `${basePathForLinks}/${item.pathBase}/`
                    )
                      ? "active"
                      : ""
                  }
                >
                  <Link to={`${basePathForLinks}/${item.pathBase}`}>
                    {item.icon && <i className={item.icon}></i>}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <button
              className="account-logout-btn"
              onClick={handleLogout}
              style={{
                marginTop: "auto",
                width: "100%",
                padding: "10px 0",
                background: "#fff",
                border: "none",
                borderTop: "1px solid #eee",
                color: "#d9534f",
                fontWeight: 600,
                fontSize: "16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                justifyContent: "center",
              }}
            >
              <i className="fas fa-sign-out-alt"></i>
              Đăng xuất
            </button>
          </nav>
        </aside>
        <main className="account-content-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AccountPageLayout;
