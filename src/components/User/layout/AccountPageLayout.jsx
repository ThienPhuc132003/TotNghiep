// src/components/User/layout/AccountPageLayout.jsx
import React, { useEffect, useCallback, useMemo } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import Api from "../../../network/Api";
import { METHOD_TYPE } from "../../../network/methodType";
import { clearUserProfile } from "../../../redux/userSlice";
import "../../../assets/css/AccountPageLayout.style.css";
import dfMale from "../../../assets/images/df-male.png";
import dfFemale from "../../../assets/images/df-female.png";

// Optimized SidebarUserInfo component
const SidebarUserInfo = React.memo(() => {
  const user = useSelector((state) => state.user.userProfile);

  const userDisplayData = useMemo(() => {
    if (!user || !user.userProfile) {
      return {
        avatar: dfMale,
        fullname: "Người dùng",
        altText: "User Avatar Placeholder",
      };
    }
    const getAvatar = () => {
      // Check if user is TUTOR and has tutorProfile.avatar
      if (user.roleId === "TUTOR" && user.tutorProfile?.avatar) {
        return user.tutorProfile.avatar;
      }

      // For regular users or if tutor doesn't have avatar, use userProfile.avatar
      if (user.userProfile?.avatar) {
        return user.userProfile.avatar;
      }

      // Fallback to default avatar based on gender
      const gender = user.userProfile?.gender || user.gender;
      return gender === "FEMALE" ? dfFemale : dfMale;
    };

    return {
      avatar: getAvatar(),
      fullname: user.userProfile.fullname || "Người dùng",
      altText: user.userProfile.fullname || "User Avatar",
    };
  }, [user]);

  return (
    <div className="sidebar-user-info">
      <img
        src={userDisplayData.avatar}
        alt={userDisplayData.altText}
        className="sidebar-avatar"
      />
      <div className="sidebar-user-details">
        <span
          className="sidebar-user-fullname"
          title={userDisplayData.fullname}
        >
          {userDisplayData.fullname}
        </span>
      </div>
    </div>
  );
});

SidebarUserInfo.displayName = "SidebarUserInfo";

const AccountPageLayoutComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userProfile);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const dispatch = useDispatch();

  // Memoize user role calculation
  const isTutor = useMemo(() => {
    return (
      isAuthenticated &&
      user?.userProfile &&
      String(user.roleId).toUpperCase() === "TUTOR"
    );
  }, [isAuthenticated, user?.userProfile, user?.roleId]);

  // Memoize default paths
  const defaultPaths = useMemo(
    () => ({
      user: "thong-tin-ca-nhan",
      tutor: "ho-so-gia-su",
    }),
    []
  );

  // Memoize sidebar menu items
  const sidebarMenuItems = useMemo(() => {
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
          icon: "fas fa-book-open",
        },
        {
          id: "tutorClassroom",
          label: "Quản lý lớp học",
          pathBase: "quan-ly-lop-hoc",
          icon: "fas fa-chalkboard-teacher",
        },
        {
          id: "tutorRevenueStats",
          label: "Quản lý doanh thu",
          pathBase: "thong-ke-doanh-thu",
          icon: "fas fa-coins",
        },
        {
          id: "tutorHireAndRatingStats",
          label: "Thống kê gia sư",
          pathBase: "thong-ke-tong-hop",
          icon: "fas fa-chart-bar",
        },
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
  }, [isTutor]);

  // Memoize logout handler
  const handleLogout = useCallback(async () => {
    try {
      await Api({ endpoint: "user/logout", method: METHOD_TYPE.POST });
    } catch (error) {
      console.error("Lỗi API đăng xuất (tiếp tục logout client):", error);
    } finally {
      Cookies.remove("token");
      Cookies.remove("role");
      dispatch(clearUserProfile());
      navigate("/login");
    }
  }, [dispatch, navigate]);

  // Memoize base path
  const basePathForLinks = useMemo(() => "/tai-khoan/ho-so", []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true, state: { from: location } });
    } else if (isAuthenticated && (!user || !user.userProfile)) {
      // Xử lý trường hợp hiếm: đã xác thực nhưng thiếu profile
    }
  }, [isAuthenticated, user, navigate, location]);

  useEffect(() => {
    if (isAuthenticated && user && user.userProfile) {
      const baseAccountPath = "/tai-khoan/ho-so";
      if (
        location.pathname === baseAccountPath ||
        location.pathname === `${baseAccountPath}/`
      ) {
        const targetPath = isTutor ? defaultPaths.tutor : defaultPaths.user;
        navigate(`${baseAccountPath}/${targetPath}`, { replace: true });
      }
    }
  }, [
    location.pathname,
    navigate,
    isAuthenticated,
    user,
    isTutor,
    defaultPaths.user,
    defaultPaths.tutor,
  ]);

  if (!isAuthenticated || !user || !user.userProfile) {
    return null; // Hoặc một component loading
  }

  return (
    <div className="account-page-container">
      <div className="account-page-layout-grid">
        <aside className="account-sidebar">
          <SidebarUserInfo />{" "}
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

AccountPageLayoutComponent.displayName = "AccountPageLayout";

// Export the component with explicit naming
const AccountPageLayout = AccountPageLayoutComponent;
export { AccountPageLayout as default };
