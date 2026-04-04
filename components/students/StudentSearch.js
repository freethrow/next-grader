'use client'
import { useState, useCallback } from 'react'

export default function StudentSearch({ onSearch }) {
  const [value, setValue] = useState('')

  const handleChange = useCallback((e) => {
    setValue(e.target.value)
    onSearch(e.target.value)
  }, [onSearch])

  return (
    <div className="relative w-full max-w-sm">
      <input
        type="search"
        className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-surface text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        placeholder="Search students…"
        value={value}
        onChange={handleChange}
      />
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
      </svg>
    </div>
  )
}
