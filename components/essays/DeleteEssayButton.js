'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteEssayButton({ essayId, studentId }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this essay? This cannot be undone.')) return
    setDeleting(true)
    const res = await fetch(`/api/essays/${essayId}`, { method: 'DELETE' })
    if (res.ok) router.push(studentId ? `/students/${studentId}` : '/students')
    else setDeleting(false)
  }

  return (
    <button
      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-light text-red hover:opacity-80 transition-opacity disabled:opacity-40 flex items-center gap-1.5"
      disabled={deleting}
      onClick={handleDelete}
    >
      {deleting && (
        <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      )}
      Delete
    </button>
  )
}
