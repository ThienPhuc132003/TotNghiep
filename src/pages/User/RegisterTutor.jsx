import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import InputField from "../../components/InputField";
import TextareaField from "../../components/TextareaField";
import UploadFile from "../../components/UploadFile";
import CheckboxField from "../../components/CheckboxField";
import DateTimeSelector from "../../components/DateTimeSelector";
import SelectField from "../../components/SelectField";
import "../../assets/css/RegisterTutor.style.css";
import * as Yup from "yup";
import { useFormik } from "formik";

const RegisterTutorPage = () => {
  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    fullname: Yup.string()
      .required("Họ và tên không được để trống.")
      .max(200, "Họ và tên không được quá 200 ký tự."),
    majorId: Yup.string()
      .required("Chuyên ngành không được để trống.")
      .max(200, "Chuyên ngành không được quá 200 ký tự."),
    univercity: Yup.string()
      .required("Trường đại học không được để trống.")
      .max(200, "Trường đại học không được quá 200 ký tự."),
    GPA: Yup.number().required("GPA không được để trống."),
    gender: Yup.string()
      .oneOf(["MALE", "FEMALE"], "Giới tính không hợp lệ")
      .required("Giới tính không được để trống"),
    bankNumber: Yup.string()
      .required("Số tài khoản ngân hàng không được để trống")
      .max(200, "Số tài khoản không được quá 200 ký tự"),
    bankName: Yup.string()
      .required("Tên ngân hàng không được để trống")
      .max(200, "Tên ngân hàng không được quá 200 ký tự"),
    subjectId: Yup.string()
      .required("Môn học chính không được để trống")
      .max(200, "Môn học chính không được quá 200 ký tự"),
    teachingTime: Yup.string()
      .required("Thời gian giảng dạy không được để trống")
      .matches(
        /^([0-9]+):([0-5][0-9])$/,
        "Vui lòng nhập thời gian hợp lệ (ví dụ: 1:00, 1:30)"
      ),
    description: Yup.string()
      .required("Mô tả không được để trống")
      .max(200, "Mô tả không được quá 200 ký tự"),
    teachingMethod: Yup.string()
      .oneOf(
        ["ONLINE", "OFFLINE", "BOTH"],
        "Phương pháp giảng dạy không hợp lệ"
      )
      .required("Phương pháp giảng dạy không được để trống"),
    teachingPlace: Yup.string().when("teachingMethod", {
      is: (teachingMethod) => teachingMethod === "OFFLINE",
      then: Yup.string()
        .required("Địa điểm giảng dạy không được để trống khi chọn Offline")
        .max(200, "Địa điểm không được quá 200 ký tự"),
    }),
    evidenceOfSubject: Yup.mixed().test(
      "fileFormat",
      "Định dạng tệp không hợp lệ, chỉ chấp nhận hình ảnh, PDF hoặc Word",
      (value) => {
        if (!value) return true;
        return [
          "image/jpeg",
          "image/png",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(value.type);
      }
    ),
    evidenceOfSubject2: Yup.mixed().test(
      "fileFormat",
      "Định dạng tệp không hợp lệ, chỉ chấp nhận hình ảnh, PDF hoặc Word",
      (value) => {
        if (!value) return true;
        return [
          "image/jpeg",
          "image/png",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(value.type);
      }
    ),
    evidenceOfGPA: Yup.mixed().test(
      "fileFormat",
      "Định dạng tệp không hợp lệ, chỉ chấp nhận hình ảnh, PDF hoặc Word",
      (value) => {
        if (!value) return true;
        return [
          "image/jpeg",
          "image/png",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(value.type);
      }
    ),
  });

  const [localDateTimeLearn, setLocalDateTimeLearn] = useState([
    { day: "Monday", times: [] },
    { day: "Tuesday", times: [] },
    { day: "Wednesday", times: [] },
    { day: "Thursday", times: [] },
    { day: "Friday", times: [] },
    { day: "Saturday", times: [] },
    { day: "Sunday", times: [] },
  ]);

  const formik = useFormik({
    initialValues: {
      avatar: "",
      fullname: "",
      majorId: "",
      birthday: "",
      gender: "MALE",
      bankNumber: "",
      bankName: "",
      subjectId: "",
      evidenceOfSubject: null,
      descriptionOfSubject: "",
      subjectId2: "",
      evidenceOfSubject2: null,
      descriptionOfSubject2: "",
      univercity: "",
      GPA: 0,
      evidenceOfGPA: null,
      teachingTime: "1:00",
      description: "",
      videoUrl: "",
      teachingMethod: "ONLINE",
      teachingPlace: "",
      isUseCurriculumn: false,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const formDataToSend = new FormData();
      for (const key in values) {
        if (key === "dateTimeLearn") {
          formDataToSend.append(key, JSON.stringify(localDateTimeLearn));
        } else if (
          key === "evidenceOfSubject" ||
          key === "evidenceOfSubject2" ||
          key === "evidenceOfGPA"
        ) {
          if (values[key]) {
            formDataToSend.append(key, values[key]);
          }
        } else if (
          key === "teachingPlace" &&
          values.teachingMethod === "ONLINE"
        ) {
          // Skip the "teachingPlace" field if the teaching method is "ONLINE"
          continue;
        } else if (values[key] !== undefined && values[key] !== null) {
          formDataToSend.append(key, values[key]);
        }
      }

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
  });

  useEffect(() => {
    // Validate dateTimeLearn here
    const validateTimes = () => {
      const { teachingTime } = formik.values;

      if (teachingTime) {
        const [hours, minutes] = teachingTime.split(":");
        const sessionLengthMinutes =
          parseInt(hours, 10) * 60 + parseInt(minutes, 10);

        const newDateTimeLearn = localDateTimeLearn.map((daySchedule) => ({
          ...daySchedule,
          times: daySchedule.times.filter((time, index, array) => {
            if (index === 0) return true;

            const [prevHours, prevMinutes] = array[index - 1]
              .split(":")
              .map(Number);
            const [currHours, currMinutes] = time.split(":").map(Number);

            const prevTotalMinutes = prevHours * 60 + prevMinutes;
            const currTotalMinutes = currHours * 60 + currMinutes;

            const diffMinutes = currTotalMinutes - prevTotalMinutes;

            return diffMinutes >= sessionLengthMinutes;
          }),
        }));
        setLocalDateTimeLearn(newDateTimeLearn);
        formik.setFieldValue("dateTimeLearn", newDateTimeLearn);
      }
    };

    validateTimes();
  }, [formik.values.teachingTime, formik, localDateTimeLearn]);

  const handleDateTimeLearnChange = useCallback((newDateTimeLearn) => {
    setLocalDateTimeLearn(newDateTimeLearn);
  }, []);

  return (
      <div className="registerForm">
        <h1>Đăng ký làm gia sư2 </h1>
        <form onSubmit={formik.handleSubmit}>
          <InputField
            label="Avatar URL"
            type="text"
            id="avatar"
            name="avatar"
            value={formik.values.avatar}
            onChange={formik.handleChange}
            error={formik.errors.avatar}
            maxLength={200}
          />
          <InputField
            label="Họ và tên"
            type="text"
            id="fullname"
            name="fullname"
            value={formik.values.fullname}
            onChange={formik.handleChange}
            error={formik.errors.fullname}
            maxLength={200}
          />
          <InputField
            label="Chuyên ngành"
            type="text"
            id="majorId"
            name="majorId"
            value={formik.values.majorId}
            onChange={formik.handleChange}
            error={formik.errors.majorId}
            maxLength={200}
          />
          <InputField
            label="Ngày sinh"
            type="date"
            id="birthday"
            name="birthday"
            value={formik.values.birthday}
            onChange={formik.handleChange}
            error={formik.errors.birthday}
          />
          <SelectField
            label="Giới tính"
            id="gender"
            name="gender"
            value={formik.values.gender}
            onChange={formik.handleChange}
            options={[
              { value: "MALE", label: "Nam" },
              { value: "FEMALE", label: "Nữ" },
            ]}
            error={formik.errors.gender}
          />
          <InputField
            label="Số tài khoản ngân hàng"
            type="text"
            id="bankNumber"
            name="bankNumber"
            value={formik.values.bankNumber}
            onChange={formik.handleChange}
            error={formik.errors.bankNumber}
            maxLength={200}
          />
          <InputField
            label="Tên ngân hàng"
            type="text"
            id="bankName"
            name="bankName"
            value={formik.values.bankName}
            onChange={formik.handleChange}
            error={formik.errors.bankName}
            maxLength={200}
          />
          <InputField
            label="Môn học chính"
            type="text"
            id="subjectId"
            name="subjectId"
            value={formik.values.subjectId}
            onChange={formik.handleChange}
            error={formik.errors.subjectId}
            maxLength={200}
          />
          <UploadFile
            label="Chứng chỉ môn học chính"
            id="evidenceOfSubject"
            name="evidenceOfSubject"
            onChange={(e) =>
              formik.setFieldValue("evidenceOfSubject", e.target.files[0])
            }
            error={formik.errors.evidenceOfSubject}
          />
          <TextareaField
            label="Mô tả kinh nghiệm môn học chính"
            id="descriptionOfSubject"
            name="descriptionOfSubject"
            value={formik.values.descriptionOfSubject}
            onChange={formik.handleChange}
            error={formik.errors.descriptionOfSubject}
            maxLength={200}
          />
          <InputField
            label="Môn học phụ (tùy chọn)"
            type="text"
            id="subjectId2"
            name="subjectId2"
            value={formik.values.subjectId2}
            onChange={formik.handleChange}
            error={formik.errors.subjectId2}
            maxLength={200}
          />
          <UploadFile
            label="Chứng chỉ môn học phụ (tùy chọn)"
            id="evidenceOfSubject2"
            name="evidenceOfSubject2"
            onChange={(e) =>
              formik.setFieldValue("evidenceOfSubject2", e.target.files[0])
            }
            error={formik.errors.evidenceOfSubject2}
          />
          <TextareaField
            label="Mô tả kinh nghiệm môn học phụ (tùy chọn)"
            id="descriptionOfSubject2"
            name="descriptionOfSubject2"
            value={formik.values.descriptionOfSubject2}
            onChange={formik.handleChange}
            error={formik.errors.descriptionOfSubject2}
            maxLength={200}
          />
          <InputField
            label="Trường đại học"
            type="text"
            id="univercity"
            name="univercity"
            value={formik.values.univercity}
            onChange={formik.handleChange}
            error={formik.errors.univercity}
            maxLength={200}
          />
          <InputField
            label="GPA"
            type="number"
            id="GPA"
            name="GPA"
            value={formik.values.GPA}
            onChange={formik.handleChange}
            error={formik.errors.GPA}
          />
          <UploadFile
            label="Bảng điểm/chứng nhận GPA"
            id="evidenceOfGPA"
            name="evidenceOfGPA"
            onChange={(e) =>
              formik.setFieldValue("evidenceOfGPA", e.target.files[0])
            }
            error={formik.errors.evidenceOfGPA}
          />

          <DateTimeSelector
            selectedDates={localDateTimeLearn}
            onChange={handleDateTimeLearnChange}
          />

          <InputField
            label="Thời lượng tiết học (giờ:phút)"
            type="text"
            id="teachingTime"
            name="teachingTime"
            value={formik.values.teachingTime}
            onChange={formik.handleChange}
            error={formik.errors.teachingTime}
          />

          <TextareaField
            label="Mô tả bản thân/kinh nghiệm giảng dạy"
            id="description"
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            error={formik.errors.description}
            maxLength={200}
          />

          <InputField
            label="Video giới thiệu (URL)"
            type="url"
            id="videoUrl"
            name="videoUrl"
            value={formik.values.videoUrl}
            onChange={formik.handleChange}
            error={formik.errors.videoUrl}
            maxLength={200}
          />

          <SelectField
            label="Phương pháp giảng dạy"
            id="teachingMethod"
            name="teachingMethod"
            value={formik.values.teachingMethod}
            onChange={formik.handleChange}
            options={[
              { value: "ONLINE", label: "Online" },
              { value: "OFFLINE", label: "Offline" },
              { value: "BOTH", label: "Cả hai" },
            ]}
            error={formik.errors.teachingMethod}
          />

          {formik.values.teachingMethod !== "ONLINE" && (
            <InputField
              label="Địa điểm giảng dạy (nếu offline)"
              type="text"
              id="teachingPlace"
              name="teachingPlace"
              value={formik.values.teachingPlace}
              onChange={formik.handleChange}
              error={formik.errors.teachingPlace}
              maxLength={200}
            />
          )}
          <CheckboxField
            label="Sử dụng giáo trình"
            id="isUseCurriculumn"
            name="isUseCurriculumn"
            checked={formik.values.isUseCurriculumn}
            onChange={formik.handleChange}
          />

          <button type="submit" className="submitButton">
            Đăng ký
          </button>
        </form>
      </div>
  );
};

export default RegisterTutorPage;
