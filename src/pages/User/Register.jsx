import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginLayout from "../../components/User/layout/LoginLayout";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import "../../assets/css/Register.style.css";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    birthday: "",
    email: "",
    phoneNumber: "",
    homeAddress: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      fullName,
      birthday,
      email,
      phoneNumber,
      homeAddress,
      gender,
      password,
      confirmPassword,
    } = formData;

    const data = {
      fullname: fullName,
      birthday: birthday,
      email: email,
      phoneNumber: phoneNumber,
      homeAddress: homeAddress,
      gender: gender.toUpperCase(),
      password: password,
      confirmPassword: confirmPassword,
    };
    try {
      const response = await Api({
        endpoint: "user/register",
        method: METHOD_TYPE.POST,
        data: data,
      });
      if (response.success === true) {
        navigate("/login");
      } else {
        console.error("Registration failed:", response.message);
      }
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <LoginLayout>
      <div className="register-form">
        <h1>Register</h1>
        <div className="social-login">
          <p>Or register with:</p>
          <button className="social-button facebook">Facebook</button>
          <button className="social-button google">Google</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="birthday">Birthday</label>
              <input
                type="date"
                id="birthday"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="homeAddress">Home Address</label>
              <input
                type="text"
                id="homeAddress"
                name="homeAddress"
                value={formData.homeAddress}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <div className="gender-group">
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="MALE"
                    checked={formData.gender === "MALE"}
                    onChange={handleChange}
                    required
                  />
                  Male
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="FEMALE"
                    checked={formData.gender === "FEMALE"}
                    onChange={handleChange}
                    required
                  />
                  Female
                </label>
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <button type="submit" className="register-button">
            Register
          </button>
        </form>
        <div className="login-link">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </LoginLayout>
  );
};

const Register = React.memo(RegisterPage);
export default Register;
