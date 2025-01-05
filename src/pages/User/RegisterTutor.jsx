import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import "../../assets/css/Register.style.css";
import UserDashboardLayout from "../../components/User/layout/UserDashboardLayout";

const RegisterTutorPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    profilePicture: null,
    subjects: "",
    teachingLevels: "",
    languages: "",
    experience: "",
    hourlyRate: "",
    degree: null,
    university: "",
    achievements: "",
    preferredSchedule: "",
    teachingMode: "",
    preferredStudents: "",
    selfIntroductionVideo: null,
    reasonToTeach: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    try {
      await Api({
        endpoint: "tutor/register",
        method: METHOD_TYPE.POST,
        data: formDataToSend,
        isFormData: true,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <UserDashboardLayout>
      <div className="register-form">
        <h1>Register as a Tutor</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
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
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="profilePicture">Profile Picture</label>
            <input
              type="file"
              id="profilePicture"
              name="profilePicture"
              onChange={handleFileChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="subjects">Subjects</label>
            <input
              type="text"
              id="subjects"
              name="subjects"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="teachingLevels">Teaching Levels</label>
            <input
              type="text"
              id="teachingLevels"
              name="teachingLevels"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="languages">Languages</label>
            <input
              type="text"
              id="languages"
              name="languages"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="experience">Experience</label>
            <input
              type="text"
              id="experience"
              name="experience"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="hourlyRate">Hourly Rate</label>
            <input
              type="text"
              id="hourlyRate"
              name="hourlyRate"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="degree">Degree</label>
            <input
              type="file"
              id="degree"
              name="degree"
              onChange={handleFileChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="university">University</label>
            <input
              type="text"
              id="university"
              name="university"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="achievements">Achievements</label>
            <input
              type="text"
              id="achievements"
              name="achievements"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="preferredSchedule">Preferred Schedule</label>
            <input
              type="text"
              id="preferredSchedule"
              name="preferredSchedule"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="teachingMode">Teaching Mode</label>
            <input
              type="text"
              id="teachingMode"
              name="teachingMode"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="preferredStudents">Preferred Students</label>
            <input
              type="text"
              id="preferredStudents"
              name="preferredStudents"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="selfIntroductionVideo">Self Introduction Video</label>
            <input
              type="file"
              id="selfIntroductionVideo"
              name="selfIntroductionVideo"
              onChange={handleFileChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="reasonToTeach">Reason to Teach</label>
            <input
              type="text"
              id="reasonToTeach"
              name="reasonToTeach"
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="register-button">
            Register
          </button>
        </form>
      </div>
    </UserDashboardLayout>
  );
};

const RegisterTutor = React.memo(RegisterTutorPage);
export default RegisterTutor;