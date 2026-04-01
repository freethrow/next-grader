'use client'
import { useState } from 'react'

export default function Textarea({
  label,
  error,
  hint,
  showWordCount = false,
  wordCountRange,
  className = '',
  id,
  onChange,
  value,
  ...props
}) {
  const [wordCount, setWordCount] = useState(
    value ? value.trim().split(/\s+/).filter(Boolean).length : 0
  )
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  function handleChange(e) {
    const words = e.target.value.trim().split(/\s+/).filter(Boolean).length
    setWordCount(words)
    onChange?.(e)
  }

  let wordCountColor = 'text-base-content/60'
  if (showWordCount && wordCountRange) {
    if (wordCount < wordCountRange.min || wordCount > wordCountRange.max) {
      wordCountColor = 'text-warning'
    } else {
      wordCountColor = 'text-success'
    }
  }

  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <label className="label" htmlFor={textareaId}>
          <span className="label-text font-medium">{label}</span>
          {showWordCount && (
            <span className={`label-text-alt font-mono ${wordCountColor}`}>
              {wordCount} words
              {wordCountRange && ` · target ${wordCountRange.min}–${wordCountRange.max}`}
            </span>
          )}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`textarea textarea-bordered w-full resize-y min-h-48 ${error ? 'textarea-error' : ''}`}
        value={value}
        onChange={handleChange}
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
