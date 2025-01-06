import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Api from "../../network/Api";
import LoginLayout from "../../components/User/layout/LoginLayout";
import { METHOD_TYPE } from "../../network/methodType";
import Cookies from "js-cookie";
import "../../assets/css/Admin/AdminLogin.style.css";

const AdminLoginPage = () => {
  const [emailOrPhoneNumber, setEmailOrPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await Api({
        endpoint: "admin/login",
        method: METHOD_TYPE.POST,
        data: {
          emailOrPhoneNumber,
          password,
        },
      });
      const token = response.data.token;

      if (token) {
        Cookies.set("token", token);
        Cookies.set("role", "admin");
        navigate("/admin/dashboard");
      } else {
        setErrorMessage("Login failed: No token received");
      }
    } catch (error) {
      setErrorMessage("Login failed: Invalid credentials");
    }
  };

  return (
    <LoginLayout>
      <div className="admin-form">
        <h1>Admin Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
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
          <div className="admin-form-group">
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
          {errorMessage && <p className="admin-error-message">{errorMessage}</p>}
          <button type="submit" className="admin-login-button">
            Login
          </button>
        </form>
        <div className="admin-register-link">
          <p>
            Dont have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </LoginLayout>
  );
};

const AdminLogin = React.memo(AdminLoginPage);
export default AdminLogin;