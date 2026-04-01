export default function Select({ label, options = [], error, hint, placeholder, className = '', id, ...props }) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <label className="label" htmlFor={selectId}>
          <span className="label-text font-medium">{label}</span>
        </label>
      )}
      <select
        id={selectId}
        className={`select select-bordered w-full ${error ? 'select-error' : ''}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      {(error || hint) && (
        <label className="label">
          <span className={`label-text-alt ${error ? 'text-error' : 'text-base-content/60'}`}>
            {error ?? hint}
          </span>
        </label>
      )}
    </div>
  )
}
