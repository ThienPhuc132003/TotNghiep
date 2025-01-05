import React from "react";
import { Link } from "react-router-dom";
import LoginLayout from "../../components/User/layout/LoginLayout";

const LoginPage = () => {
  return (
    <LoginLayout>
      <div className="login-form">
        <h1>Login</h1>
        <form>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        <div className="register-link">
          <p>
            Dont have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </LoginLayout>
  );
};

const Login = React.memo(LoginPage);
export default Login;
