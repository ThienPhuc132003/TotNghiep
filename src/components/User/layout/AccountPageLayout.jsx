import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "../../../assets/css/AccountPageLayout.style.css";
import dfMale from "../../../assets/images/df-male.png";
import dfFemale from "../../../assets/images/df-female.png";

// Component SidebarUserInfo
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
  const user = useSelector((state) => state.user.userProfile); // Lấy toàn bộ user object từ Redux
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  // useEffect để kiểm tra xác thực và điều hướng nếu cần
  useEffect(() => {
    // Chỉ kiểm tra !isAuthenticated là đủ, vì nếu không xác thực thì user.userProfile cũng không nên tồn tại
    if (!isAuthenticated) {
      // console.warn("AccountPageLayout: User not authenticated, redirecting to login.");
      navigate("/login", { replace: true, state: { from: location } });
    }
    // Nếu đã xác thực nhưng không có user.userProfile (trường hợp hiếm), có thể log lỗi hoặc xử lý thêm
    else if (isAuthenticated && (!user || !user.userProfile)) {
      // console.warn("AccountPageLayout: User authenticated but profile missing. Potential data issue.");
      // Bạn có thể chọn ở lại trang (return;) hoặc redirect về login/trang lỗi
      // navigate("/login", { replace: true, state: { from: location } }); // Hoặc 1 trang báo lỗi
    }
  }, [isAuthenticated, user, navigate, location]);

  // Xác định isTutor và các path mặc định
  // Đảm bảo user và user.userProfile có giá trị trước khi truy cập user.roleId
  const isTutor =
    isAuthenticated &&
    user?.userProfile &&
    String(user.roleId).toUpperCase() === "TUTOR";
  const defaultUserPath = "thong-tin-ca-nhan";
  const defaultTutorPath = "ho-so-gia-su"; // ĐÃ CẬP NHẬT

  // useEffect để điều hướng đến trang con mặc định
  useEffect(() => {
    // Chỉ chạy logic này nếu user đã được xác thực và có profile đầy đủ
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
    user, // Quan trọng: user là dependency
    isTutor, // isTutor phụ thuộc vào user
    defaultUserPath,
    defaultTutorPath,
  ]);

  // Điều kiện return sớm nếu chưa xác thực hoặc thiếu thông tin user cơ bản
  if (!isAuthenticated || !user || !user.userProfile) {
    // Hooks đã chạy, giờ có thể return null hoặc component loading
    // trong khi chờ navigate từ useEffect kiểm tra xác thực
    return null;
  }

  const getSidebarMenuItems = () => {
    // isTutor đã được tính toán chính xác ở trên
    if (isTutor) {
      return [
        {
          id: "tutorProfile",
          label: "Hồ Sơ Gia Sư",
          pathBase: "ho-so-gia-su", // ĐÃ CẬP NHẬT
          icon: "fas fa-id-badge",
        },
        {
          id: "tutorWallet",
          label: "Ví Cá Nhân",
          pathBase: "vi-cua-toi",
          icon: "fas fa-wallet",
        },
        {
          id: "personalSyllabus",
          label: "Giáo Trình Cá Nhân",
          pathBase: "giao-trinh-ca-nhan",
          icon: "fas fa-book-open",
        },
      ];
    } else {
      // USER (Người học)
      return [
        {
          id: "userProfile",
          label: "Hồ Sơ Học Viên",
          pathBase: "thong-tin-ca-nhan", // Giữ nguyên cho User
          icon: "fas fa-user-circle",
        },
        {
          id: "favoriteTutors",
          label: "Gia Sư Yêu Thích",
          pathBase: "gia-su-yeu-thich",
          icon: "fas fa-heart",
        },
        {
          id: "userWallet",
          label: "Ví Cá Nhân",
          pathBase: "vi-cua-toi",
          icon: "fas fa-wallet",
        },
      ];
    }
  };

  const sidebarMenuItems = getSidebarMenuItems();
  const basePathForLinks = "/tai-khoan/ho-so";

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
                    location.pathname === `${basePathForLinks}/${item.pathBase}`
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
