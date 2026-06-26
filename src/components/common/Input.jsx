function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) {
  return (
    <div className="form-group">
      {label && <label htmlFor={name}>{label}</label>}

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="form-control"
      />
    </div>
  );
}

export default Input;