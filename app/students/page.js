'use client'
import { useState, useEffect, useCallback } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import StudentList from '@/components/students/StudentList'
import StudentSearch from '@/components/students/StudentSearch'
import { LEVELS } from '@/data/levels'

const LEVEL_OPTIONS = Object.entries(LEVELS).map(([value, { label }]) => ({ value, label }))

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', notes: '', level: 'c2' })
  const [saving, setSaving] = useState(false)

  const fetchStudents = useCallback(async (q = '') => {
    setLoading(true)
    try {
      const url = q ? `/api/students?search=${encodeURIComponent(q)}` : '/api/students'
      const res = await fetch(url)
      const data = await res.json()
      setStudents(Array.isArray(data) ? data : [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setShowAdd(false)
        setForm({ name: '', email: '', notes: '', level: 'c2' })
        fetchStudents(search)
      }
    } catch {}
    setSaving(false)
  }

  function handleSearch(q) {
    setSearch(q)
    fetchStudents(q)
  }

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${students.length} student${students.length !== 1 ? 's' : ''}`}
        action={
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Student</button>
        }
      />

      <div className="mb-5">
        <StudentSearch onSearch={handleSearch} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : (
        <StudentList students={students} />
      )}

      <dialog className={`modal ${showAdd ? 'modal-open' : ''}`}>
        <div className="modal-box max-w-md">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" type="button" onClick={() => setShowAdd(false)}>✕</button>
          <h3 className="font-bold text-lg mb-4 pr-8">Add Student</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="form-control w-full">
              <label className="label"><span className="label-text font-medium">Name</span></label>
              <input type="text" className="input input-bordered w-full" placeholder="Student's full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-control w-full">
              <label className="label"><span className="label-text font-medium">Email (optional)</span></label>
              <input type="email" className="input input-bordered w-full" placeholder="student@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-control w-full">
              <label className="label"><span className="label-text font-medium">Notes (optional)</span></label>
              <input type="text" className="input input-bordered w-full" placeholder="Preparing for June exam…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="form-control w-full">
              <label className="label"><span className="label-text font-medium">Target Level</span></label>
              <select className="select select-bordered w-full" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                {LEVEL_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving && <span className="loading loading-spinner loading-sm" />}
                Add Student
              </button>
            </div>
          </form>
        </div>
        <div className="modal-backdrop" onClick={() => setShowAdd(false)} />
      </dialog>
    </div>
  )
}
