import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import "../assets/css/FormDetail.style.css"; // Import the CSS file

const FormDetailComponent = ({ formData, fields, mode, onChange, onSubmit, onClose }) => {
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
      <h2>
        {mode === "add"
          ? t("admin.addTitle")
          : mode === "edit"
          ? t("admin.editTitle")
          : t("admin.viewTitle")}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {fields.map((field) => (
            <div className="form-group" key={field.key}>
              <label>{t(field.label)}</label>
              {field.type === "select" ? (
                <select
                  name={field.key}
                  value={formData[field.key] || ""}
                  onChange={handleChange}
                  readOnly={mode === "view" || field.readOnly}
                  className={mode === "view" || field.readOnly ? "non-fillable" : "fillable"}
                >
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {t(`admin.${option.toLowerCase()}`)}
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
                  className={mode === "view" || field.readOnly ? "non-fillable" : "fillable"}
                />
              )}
            </div>
          ))}
        </div>
        <div className="form-actions">
          {mode !== "view" && (
            <button type="submit" className="save-button">
              {t("common.save")}
            </button>
          )}
          <button type="button" className="close-button" onClick={onClose}>
            {t("common.close")}
          </button>
        </div>
      </form>
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
      options: PropTypes.arrayOf(PropTypes.string),
      readOnly: PropTypes.bool,
    })
  ).isRequired,
  mode: PropTypes.oneOf(["add", "edit", "view"]).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

const FormDetail = React.memo(FormDetailComponent);
export default FormDetail;