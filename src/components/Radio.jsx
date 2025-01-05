import React, { useState } from "react";
import PropTypes from "prop-types";

const RadioGroupComponent = ({ options, name, onChange }) => {
  const [selectedOption, setSelectedOption] = useState("");

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="radio-group">
      {options.map((option) => (
        <label key={option} className="radio-option">
          <input
            type="radio"
            name={name}
            value={option}
            checked={selectedOption === option}
            onChange={handleOptionChange}
          />
          {option}
        </label>
      ))}
    </div>
  );
};

RadioGroupComponent.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
const RadioGroup = React.memo(RadioGroupComponent);
export default RadioGroup;
