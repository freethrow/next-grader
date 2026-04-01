export default function Input({ label, error, hint, className = '', id, ...props }) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <label className="label" htmlFor={inputId}>
          <span className="label-text font-medium">{label}</span>
        </label>
      )}
      <input
        id={inputId}
        className={`input input-bordered w-full ${error ? 'input-error' : ''}`}
        {...props}
      />
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
