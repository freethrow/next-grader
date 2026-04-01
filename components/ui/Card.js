export default function Card({ children, className = '', onClick }) {
  return (
    <div
      className={`card bg-base-100 border border-base-200 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="card-body p-5">{children}</div>
    </div>
  )
}
