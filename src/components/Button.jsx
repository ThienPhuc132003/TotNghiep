import React from "react";
import Proptypes from "prop-types";
const ButtonComponent = (props) => {
  const {
    onClick = () => {},
    children = null,
    onChange = () => {},
    ...rest
  } = props;
  return (
    <div onClick={onClick} onChange={onChange} {...rest}>
      {children}
    </div>
  );
};
const Button = React.memo(ButtonComponent);
export default Button;

ButtonComponent.propTypes = {
  onClick: Proptypes.func,
  onChange: Proptypes.func,
  children: Proptypes.node,
};
