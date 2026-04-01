export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'loading-sm', md: 'loading-md', lg: 'loading-lg' }
  return (
    <span className={`loading loading-spinner ${sizes[size] ?? sizes.md} ${className}`} />
  )
}
