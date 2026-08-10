import { forwardRef } from "react";

const Input = forwardRef(function Input(
  {
    label,
    name,
    type = "text",
    placeholder = "",
    ...rest
  },
  ref
) {
  return (
    <div>
      {label && <label htmlFor={name}>{label}</label>}

      <input
        ref={ref}
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className="form-control"
        {...rest}
      />
    </div>
  );
});

export default Input;