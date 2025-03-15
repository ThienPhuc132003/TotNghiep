import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import "../assets/css/FormDetail.style.css"; // Import the CSS file

const FormDetailComponent = ({
  formData,
  fields,
  mode,
  onChange,
  onSubmit,
  title,
  onClose,
  errors,
  majors = [], // Add a default value for majors
}) => {
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
                <select
                  name={field.key}
                  value={formData[field.key] || ""}
                  onChange={handleChange}
                  disabled={mode === "view" || field.readOnly}
                  className={
                    mode === "view" || field.readOnly ? "non-fillable" : ""
                  }
                >
                  <option value="">Chọn ngành</option>
                  {majors.map((major) => (
                    <option key={major.majorId} value={major.majorId}>
                      {major.majorName}
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
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
        })
      ),
      readOnly: PropTypes.bool,
      required: PropTypes.bool, // Add required field
    })
  ).isRequired,
  mode: PropTypes.oneOf(["add", "edit", "view"]).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  errors: PropTypes.object,
  majors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default React.memo(FormDetailComponent);
