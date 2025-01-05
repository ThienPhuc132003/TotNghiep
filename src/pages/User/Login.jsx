import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Api from "../../network/Api";
import LoginLayout from "../../components/User/layout/LoginLayout";
import { METHOD_TYPE } from "../../network/methodType";
import Cookies from "js-cookie";
import { setUserProfile } from "../../redux/userSlice";
import { useDispatch } from "react-redux";

const LoginPage = () => {
  const [emailOrPhoneNumber, setEmailOrPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const responseLogin = await Api({
        endpoint: "user/login",
        method: METHOD_TYPE.POST,
        data: {
          emailOrPhoneNumber,
          password,
        },
      });
      const token = responseLogin.data.token;

      if (token) {
        Cookies.set("token", token);
        Cookies.set("role", "user");
        try {
          const responseGetProfile = await Api({
            endpoint: "user/get-profile",
            method: METHOD_TYPE.GET,
          });
          if (responseGetProfile.success === true) {
            dispatch(setUserProfile(responseGetProfile.data));
            console.log("Login successful:", responseGetProfile.data);
          }
        } catch (error) {
          console.error("Login failed:", error);
        }
        navigate("/dashboard");
      } else {
        console.error("Login failed: No token received");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <LoginLayout>
      <div className="login-form">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="emailOrPhoneNumber">Email or Phone Number</label>
            <input
              type="text"
              id="emailOrPhoneNumber"
              name="emailOrPhoneNumber"
              value={emailOrPhoneNumber}
              onChange={(e) => setEmailOrPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        <div className="register-link">
          <p>
            Dont have an account? <Link to="/register">Register</Link>
          </p>
          <p>
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>
        </div>
      </div>
    </LoginLayout>
  );
};

const Login = React.memo(LoginPage);
export default Login;