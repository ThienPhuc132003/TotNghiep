import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import UserDashboardLayout from "../../components/User/layout/UserDashboardLayout";
import InputField from "../../components/InputField";
import TextareaField from "../../components/TextareaField";
import UploadFile from "../../components/UploadFile";
import CheckboxField from "../../components/CheckboxField";
import DateTimeSelector from "../../components/DateTimeSelector";
import SelectField from "../../components/SelectField";
import "../../assets/css/RegisterTutor.style.css";

const RegisterTutorPage = () => {
  const [formData, setFormData] = useState({
    avatar: "",
    majorName: "",
    teachingCetification: "",
    degree: "",
    university: "",
    GPA: "",
    educationalCertification: null,
    dateTimeLearn: [
      { day: "Monday", times: [""] },
      { day: "Tuesday", times: [""] },
      { day: "Wednesday", times: [""] },
      { day: "Thursday", times: [""] },
      { day: "Friday", times: [""] },
      { day: "Saturday", times: [""] },
      { day: "Sunday", times: [""] },
    ],
    teachingTime: "",
    amount: "",
    teachingRoadMap: "",
    description: "",
    videoUrl: "",
    teachingMethod: "ONLINE",
    curriculum: {
      curriculumName: "",
      curriculumMajor: "",
      curriculumUrl: "",
      description: "",
    },
    workAddress: "",
    isUseCurriculum: false,
  });

  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.majorName)
      errors.majorName = "Chuyên ngành không được để trống.";
    if (!formData.university)
      errors.university = "Trường đại học không được để trống.";
    if (!formData.GPA) errors.GPA = "GPA không được để trống.";
    return errors;
  }, [formData.majorName, formData.university, formData.GPA]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  }, []);

  const handleCurriculumChange = useCallback((name, value) => {
    setFormData((prev) => ({
      ...prev,
      curriculum: {
        ...prev.curriculum,
        [name]: value,
      },
    }));
  }, []);

  const handleFileChange = useCallback((e) => {
    setFormData((prev) => ({
      ...prev,
      educationalCertification: e.target.files[0],
    }));
  }, []);

  const handleDateTimeLearnChange = useCallback((newDateTimeLearn) => {
    setFormData((prev) => ({
      ...prev,
      dateTimeLearn: newDateTimeLearn,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const errors = validateForm();
      setFormErrors(errors);
      if (Object.keys(errors).length > 0) {
        console.error("Validation errors:", errors);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("avatar", formData.avatar);
      formDataToSend.append("majorName", formData.majorName);
      formDataToSend.append(
        "teachingCetification",
        formData.teachingCetification
      );
      formDataToSend.append("degree", formData.degree);
      formDataToSend.append("university", formData.university);
      formDataToSend.append("GPA", formData.GPA);
      formDataToSend.append(
        "educationalCertification",
        formData.educationalCertification
      );
      formDataToSend.append(
        "dateTimeLearn",
        JSON.stringify(formData.dateTimeLearn)
      );
      formDataToSend.append("teachingTime", formData.teachingTime);
      formDataToSend.append("amount", formData.amount);
      formDataToSend.append("teachingRoadMap", formData.teachingRoadMap);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("videoUrl", formData.videoUrl);
      formDataToSend.append("teachingMethod", formData.teachingMethod);
      formDataToSend.append(
        "curriculumName",
        formData.curriculum.curriculumName
      );
      formDataToSend.append(
        "curriculumMajor",
        formData.curriculum.curriculumMajor
      );
      formDataToSend.append("curriculumUrl", formData.curriculum.curriculumUrl);
      formDataToSend.append("description", formData.curriculum.description);
      formDataToSend.append("workAddress", formData.workAddress);
      formDataToSend.append("isUseCurriculum", formData.isUseCurriculum);

      try {
        const response = await Api({
          endpoint: "tutor/register",
          method: METHOD_TYPE.POST,
          data: formDataToSend,
          isFormData: true,
        });

        if (response.success) {
          console.log("Tutor registered successfully:", response.data);
          navigate("/dashboard");
        } else {
          console.error("Tutor registration failed:", response.message);
        }
      } catch (apiError) {
        console.error("Error during tutor registration:", apiError);
      }
    },
    [validateForm, navigate, formData]
  );

  return (
    <UserDashboardLayout>
      <div className="registerForm">
        <h1>Register as a Tutor</h1>
        <form onSubmit={handleSubmit}>
          <InputField
            label="Avatar URL"
            type="text"
            id="avatar"
            name="avatar"
            value={formData.avatar}
            onChange={handleChange}
            error={formErrors.avatar}
          />
          <InputField
            label="Chuyên ngành"
            type="text"
            id="majorName"
            name="majorName"
            value={formData.majorName}
            onChange={handleChange}
            error={formErrors.majorName}
          />
          <InputField
            label="Chứng chỉ giảng dạy"
            type="text"
            id="teachingCetification"
            name="teachingCetification"
            value={formData.teachingCetification}
            onChange={handleChange}
            error={formErrors.teachingCetification}
          />
          <SelectField
            label="Trình độ"
            id="degree"
            name="degree"
            value={formData.degree}
            onChange={handleChange}
            options={[
              { value: "BACHELOR", label: "Cử nhân" },
              { value: "MASTER", label: "Thạc sĩ" },
              { value: "DOCTOR", label: "Tiến sĩ" },
            ]}
            error={formErrors.degree}
          />
          <InputField
            label="Trường đại học"
            type="text"
            id="university"
            name="university"
            value={formData.university}
            onChange={handleChange}
            error={formErrors.university}
          />
          <InputField
            label="GPA"
            type="number"
            id="GPA"
            name="GPA"
            value={formData.GPA}
            onChange={handleChange}
            error={formErrors.GPA}
          />
          <UploadFile
            label="Chứng chỉ Giáo dục"
            id="educationalCertification"
            name="educationalCertification"
            onChange={handleFileChange}
            error={formErrors.educationalCertification}
          />

          <DateTimeSelector
            selectedDates={formData.dateTimeLearn}
            onChange={handleDateTimeLearnChange}
          />
          {formData.isUseCurriculum && (
            <>
              <InputField
                label="Curriculum Name"
                type="text"
                id="curriculumName"
                name="curriculumName"
                value={formData.curriculum.curriculumName}
                onChange={(e) =>
                  handleCurriculumChange("curriculumName", e.target.value)
                }
                required
              />
              <InputField
                label="Curriculum Major"
                type="text"
                id="curriculumMajor"
                name="curriculumMajor"
                value={formData.curriculum.curriculumMajor}
                onChange={(e) =>
                  handleCurriculumChange("curriculumMajor", e.target.value)
                }
                required
              />
              <InputField
                label="Curriculum URL"
                type="url"
                id="curriculumUrl"
                name="curriculumUrl"
                value={formData.curriculum.curriculumUrl}
                onChange={(e) =>
                  handleCurriculumChange("curriculumUrl", e.target.value)
                }
                required
              />
              <TextareaField
                label="Curriculum Description"
                id="curriculumDescription"
                name="curriculumDescription"
                value={formData.curriculum.description}
                onChange={(e) =>
                  handleCurriculumChange("description", e.target.value)
                }
                required
              />
            </>
          )}

          <InputField
            label="Work Address"
            type="text"
            id="workAddress"
            name="workAddress"
            value={formData.workAddress}
            onChange={handleChange}
            required
          />
          <CheckboxField
            label="Use Curriculum"
            id="isUseCurriculum"
            name="isUseCurriculum"
            checked={formData.isUseCurriculum}
            onChange={handleChange}
          />

          <button type="submit" className="submitButton">
            Register
          </button>
        </form>
      </div>
    </UserDashboardLayout>
  );
};

export default RegisterTutorPage;