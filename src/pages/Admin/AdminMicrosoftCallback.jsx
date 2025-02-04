import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../network/Api";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { setAdminProfile } from "../../redux/adminSlice";
import { setUserProfile } from "../../redux/userSlice";
import { METHOD_TYPE } from "../../network/methodType";

const AdminMicrosoftCallbackPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleMicrosoftCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        const code = params.get("code");
        const sessionState = params.get("session_state");

        if (!code || !sessionState) {
          navigate("/login");
          return;
        }

        const response = await Api({
          endpoint: "user/auth/callback",
          method: METHOD_TYPE.POST,
          data: { code: code, sessionState: sessionState },
        });

        const { token, userId, adminId } = response.data;
        if (token) {
          Cookies.set("token", token);

          if (userId) {
            Cookies.set("role", "user");

            const responseGetProfile = await Api({
              endpoint: "user/get-profile",
              method: METHOD_TYPE.GET,
            });

            if (responseGetProfile.success === true) {
              dispatch(setUserProfile(responseGetProfile.data));
            }
            navigate("/dashboard");
          } else if (adminId) {
            Cookies.set("role", "admin");

            const responseGetProfile = await Api({
              endpoint: "admin/get-profile",
              method: METHOD_TYPE.GET,
            });

            if (responseGetProfile.success === true) {
              dispatch(setAdminProfile(responseGetProfile.data));
            }
            navigate("/admin/dashboard");
          } else {
            navigate("/login");
          }
        } else {
          navigate("/login");
        }
      } catch (error) {
        navigate("/login");
      }
    };

    handleMicrosoftCallback();
  }, [navigate, dispatch]);

  return <div>Processing your login...</div>;
};

const AdminMicrosoftCallback = React.memo(AdminMicrosoftCallbackPage);

export default AdminMicrosoftCallback;