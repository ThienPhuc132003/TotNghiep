import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import "../assets/css/FormDetail.style.css";
import CertificateList from "../components/User/CertificateList"; 

const FormDetailComponent = ({
  formData,
  fields,
  mode,
  onChange,
  onSubmit,
  title,
  onClose,
  errors,
  showFileManagement = false, // Thêm prop showFileManagement, mặc định là false
}) => {
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {};
    fields.forEach((field) => {
      submitData[field.key] = field.getValue
        ? field.getValue(formData[field.key])
        : formData[field.key];
    });
    onSubmit(submitData);
  };

  // Hàm hiển thị CertificateList
  const renderCertificateList = () => {
    if (mode === "view" && showFileManagement) {
      return (
        <div className="form-group">
          <label>Chứng chỉ:</label>
          <CertificateList certificates={formData.certificates} />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="form-detail-container">
      <div className="form-header">
        <h2>{title}</h2>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="form-grid">
        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div className="form-group" key={field.key}>
              <label>{t(field.label)}</label>
              {field.type === "select" ? (
                // Hiển thị select box, nhưng disable nếu là chế độ view
                <select
                  name={field.key}
                  value={formData[field.key] || ""}
                  onChange={handleChange}
                  disabled={mode === "view" || field.readOnly}
                  className={
                    mode === "view" || field.readOnly ? "non-fillable" : ""
                  }
                >
                  {field.options &&
                    field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  name={field.key}
                  value={formData[field.key] || ""}
                  onChange={handleChange}
                  readOnly={mode === "view" || field.readOnly}
                  className={
                    mode === "view" || field.readOnly ? "non-fillable" : ""
                  }
                />
              )}
              {errors && errors[field.key] && (
                <p className="error-message">{errors[field.key]}</p>
              )}
            </div>
          ))}
          {renderCertificateList()} {/* Gọi hàm hiển thị CertificateList */}
          <div className="form-actions">
            {mode !== "view" && (
              <button
                type="submit"
                className="save-button"
                onClick={handleSubmit}
              >
                {t("common.save")}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

FormDetailComponent.propTypes = {
  formData: PropTypes.object.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          value: PropTypes.string.isRequired,
        })
      ),
      readOnly: PropTypes.bool,
      required: PropTypes.bool,
      getValue: PropTypes.func,
      renderOption: PropTypes.func,
    })
  ).isRequired,
  mode: PropTypes.oneOf(["add", "edit", "view"]).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  errors: PropTypes.object,
  showFileManagement: PropTypes.bool, // Thêm propType cho showFileManagement
};

export default React.memo(FormDetailComponent);
