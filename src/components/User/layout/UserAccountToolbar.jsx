// src/components/User/layout/UserAccountToolbar.jsx
import React from "react";
import PropTypes from "prop-types";
import User from "../User"; // Đảm bảo đường dẫn đúng
import SettingButton from "../../SettingButton"; // Đảm bảo đường dẫn đúng
import NotifiButton from "../../NotifiButton"; // Đảm bảo đường dẫn đúng
import HelpButton from "../../HelpButton"; // Đảm bảo đường dẫn đúng

// UserAccountToolbarComponent giờ đây nhận thêm các props từ HomePageLayout
const UserAccountToolbarComponent = ({
  onEditProfile, // Prop này có thể vẫn dùng cho User component
  // onLogout,      // Prop này từ HomePageLayout, không cần truyền xuống SettingButton nữa
  // vì SettingButton tự xử lý logout và HomePageLayout sẽ phản ứng với việc token mất
  currentUserRole, // Prop mới từ HomePageLayout
  isAuthenticated, // Prop mới từ HomePageLayout
}) => {
  return (
    <>
      {" "}
      {/* Bạn có thể bỏ Fragment <> </> nếu div.user-account-toolbar là phần tử gốc duy nhất */}
      <div className="user-account-toolbar">
        <NotifiButton />
        <HelpButton />
        {/* 
          Component User có thể cần userProfile để hiển thị tên, avatar, etc.
          Nếu User component cần userProfile, bạn sẽ truyền nó vào đây:
          <User onEditProfile={onEditProfile} userProfile={userProfile} /> 
          Hiện tại, tôi giữ nguyên theo code gốc của bạn cho User.
        */}
        <User onEditProfile={onEditProfile} />

        <SettingButton
          endpoint="user/logout" // Giữ nguyên hoặc nhận từ props nếu cần linh hoạt
          pathLogout="/login" // Giữ nguyên hoặc nhận từ props
          currentUserRole={currentUserRole} // <<--- TRUYỀN XUỐNG
          isAuthenticated={isAuthenticated} // <<--- TRUYỀN XUỐNG
          // userProfile={userProfile}      // Truyền nếu SettingButton cần (hiện tại không)
        />
      </div>
    </>
  );
};

// Cập nhật PropTypes để bao gồm các props mới
UserAccountToolbarComponent.propTypes = {
  onEditProfile: PropTypes.func,
  // onLogout: PropTypes.func.isRequired, // Không cần thiết nếu không truyền xuống SettingButton nữa
  currentUserRole: PropTypes.string.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  userProfile: PropTypes.object, // userProfile có thể là null ban đầu
};

const UserAccountToolbar = React.memo(UserAccountToolbarComponent);
export default UserAccountToolbar;
