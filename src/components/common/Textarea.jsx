function Textarea({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  rows = 4,
}) {
  return (
    <div className="form-group">
      {label && <label htmlFor={name}>{label}</label>}

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="form-control"
      />
    </div>
  );
}

export default Textarea;