import  { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { useTranslation } from "react-i18next";
import "../../assets/css/Admin/AdminForm.style.css";

const AdminFormComponent = ({ mode, adminId, onClose, onSave }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    fullName: "",
    birthday: "",
    gender: "",
    homeAddress: "",
    roleId: "BEST_ADMIN",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data in "view" or "edit" mode
  useEffect(() => {
    if ((mode === "view" || mode === "edit") && adminId) {
      setLoading(true);
      Api({
        endpoint: `admin-service/admin/${adminId}`,
        method: METHOD_TYPE.GET,
      })
        .then((response) => {
          const data = response.data;
          setFormData({
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            fullName: data.adminProfile?.fullname || "",
            birthday: data.adminProfile?.birthday || "",
            gender: data.adminProfile?.gender,
            homeAddress: data.adminProfile?.homeAddress || "",
            roleId: data.roleId || "",
          });
        })
        .catch((error) => {
          console.error("Error fetching admin data:", error);
          setError(t("admin.fetchError"));
        })
        .finally(() => setLoading(false));
    }
  }, [mode, adminId, t]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = () => {
    setLoading(true);
    console.log("Data to be sent:", formData); // Log the data before sending

    const updatedData = {
      roleId: formData.roleId,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      fullname: formData.fullName,
      homeAddress: formData.homeAddress,
      birthday: formData.birthday,
      gender: formData.gender,
    };

    if (mode === "add") {
      // Call API to create a new admin
      Api({
        endpoint: "admin-service/admin",
        method: METHOD_TYPE.POST,
        data: updatedData,
      })
        .then(() => {
          onSave();
          onClose();
        })
        .catch(() => {
          setError(t("admin.addError"));
        })
        .finally(() => setLoading(false));
    } else if (mode === "edit") {
      Api({
        endpoint: `admin-service/admin/${adminId}`,
        method: METHOD_TYPE.PUT,
        data: updatedData,
      })
        .then(() => {
          onSave();
          onClose();
        })
        .catch(() => {
          setError(t("admin.updateError"));
        })
        .finally(() => setLoading(false));
    }
  };

  if (loading) {
    return <div className="loading">{t("admin.loading")}</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="admin-form-container">
      <h2>
        {mode === "add"
          ? t("admin.addTitle")
          : mode === "edit"
          ? t("admin.editTitle")
          : t("admin.viewTitle")}
      </h2>
      <div className="form-grid">
        <div className="form-group">
          <label>{t("admin.email")}</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={mode === "view"}
          />
        </div>
        <div className="form-group">
          <label>{t("admin.phoneNumber")}</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            disabled={mode === "view"}
          />
        </div>
        <div className="form-group">
          <label>{t("admin.fullName")}</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            disabled={mode === "view"}
          />
        </div>
        <div className="form-group">
          <label>{t("admin.birthday")}</label>
          <input
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            disabled={mode === "view"}
          />
        </div>
        <div className="form-group">
          <label>{t("admin.homeAddress")}</label>
          <input
            type="text"
            name="homeAddress"
            value={formData.homeAddress}
            onChange={handleChange}
            disabled={mode === "view"}
          />
        </div>
        <div className="form-group">
          <label>{t("admin.gender")}</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            disabled={mode === "view"}
          >
            <option value="MALE">{t("admin.male")}</option>
            <option value="FEMALE">{t("admin.female")}</option>
          </select>
        </div>
        <div className="form-group">
          <label>{t("admin.role")}</label>
          <select
            name="roleId"
            value={formData.roleId}
            onChange={handleChange}
            disabled={mode === "view"}
          >
            <option value="BEST_ADMIN">{t("admin.bestAdmin")}</option>
            <option value="OTHER_ROLE">{t("admin.otherRole")}</option>
          </select>
        </div>
        {mode === "view" && (
          <div className="form-group">
            <label>{t("admin.createdDate")}</label>
            <input type="text" value={formData.createdDate} readOnly />
          </div>
        )}
      </div>
      <div className="form-actions">
        {mode !== "view" && (
          <button className="save-button" onClick={handleSubmit}>
            {t("common.save")}
          </button>
        )}
        <button className="close-button" onClick={onClose}>
          {t("common.close")}
        </button>
      </div>
    </div>
  );
};

AdminFormComponent.propTypes = {
  mode: PropTypes.oneOf(["add", "edit", "view"]).isRequired,
  adminId: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default AdminFormComponent;