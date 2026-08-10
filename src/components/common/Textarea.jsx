import { forwardRef } from "react";

const Textarea = forwardRef(function Textarea(
  {
    label,
    name,
    placeholder = "",
    rows = 4,
    ...rest
  },
  ref
) {
  return (
    <div>
      {label && <label htmlFor={name}>{label}</label>}

      <textarea
        ref={ref}
        id={name}
        name={name}
        placeholder={placeholder}
        rows={rows}
        className="form-control"
        {...rest}
      />
    </div>
  );
});

export default Textarea;