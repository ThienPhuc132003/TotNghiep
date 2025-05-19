// src/components/User/layout/AccountPageLayout.jsx
import { Link, Outlet, useLocation, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "../../../assets/css/AccountPageLayout.style.css"; // Đảm bảo đường dẫn đúng
import dfMale from "../../../assets/images/df-male.png"; // Đảm bảo đường dẫn đúng
import dfFemale from "../../../assets/images/df-female.png"; // Đảm bảo đường dẫn đúng

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
// Không cần PropTypes cho SidebarUserInfo nếu nó không nhận props trực tiếp

const AccountPageLayout = () => {
  const location = useLocation();
  const user = useSelector((state) => state.user.userProfile);

  if (!user || !user.userProfile) {
    // ProtectRoute nên xử lý việc này trước, nhưng đây là fallback
    return <Navigate to="/login" replace />;
  }

  const isTutor = !!user.tutorProfile;

  const getSidebarMenuItems = () => {
    if (isTutor) {
      return [
        {
          id: "tutorProfile",
          label: "Hồ Sơ Gia Sư",
          pathBase: "thong-tin-gia-su",
          icon: "fas fa-id-badge",
        },
        {
          id: "tutorWallet",
          label: "Ví Cá Nhân",
          pathBase: "vi-ca-nhan",
          icon: "fas fa-wallet",
        },
        // { id: 'rentalRequests', label: 'Yêu Cầu Thuê', pathBase: 'yeu-cau-thue', icon: 'fas fa-clipboard-list' },
        {
          id: "personalSyllabus",
          label: "Giáo Trình",
          pathBase: "giao-trinh",
          icon: "fas fa-book-open",
        },
      ];
    } else {
      return [
        {
          id: "userProfile",
          label: "Thông Tin Người Học",
          pathBase: "thong-tin-nguoi-hoc",
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
          pathBase: "vi-ca-nhan",
          icon: "fas fa-wallet",
        },
      ];
    }
  };

  const sidebarMenuItems = getSidebarMenuItems();
  // basePathForLinks giờ đây chính là path của Route chứa AccountPageLayout
  const basePathForLinks = isTutor
    ? "/gia-su/quan-ly/ho-so"
    : "/tai-khoan/ho-so";

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

// AccountPageLayout không nhận props trực tiếp, không cần PropTypes ở đây
// AccountPageLayout.propTypes = {};

export default AccountPageLayout;
