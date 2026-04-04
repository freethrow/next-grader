'use client'
import { useState, useEffect, useCallback } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import StudentList from '@/components/students/StudentList'
import StudentSearch from '@/components/students/StudentSearch'
import { LEVELS } from '@/data/levels'

const LEVEL_OPTIONS = Object.entries(LEVELS).map(([value, { label }]) => ({ value, label }))
const inputCls = 'w-full px-3 py-2 rounded-lg border border-border bg-surface text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm'
const labelCls = 'block text-sm font-medium text-ink mb-1'

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
      const data = await fetch(url).then(r => r.json())
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

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${students.length} student${students.length !== 1 ? 's' : ''}`}
        action={
          <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity" onClick={() => setShowAdd(true)}>
            + Add Student
          </button>
        }
      />

      <div className="mb-5">
        <StudentSearch onSearch={(q) => { setSearch(q); fetchStudents(q) }} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        </div>
      ) : (
        <StudentList students={students} />
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setShowAdd(false)} />
          <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-md p-6">
            <button className="absolute right-4 top-4 text-muted hover:text-ink transition-colors" onClick={() => setShowAdd(false)}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <h3 className="font-bold text-lg text-ink mb-4">Add Student</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><label className={labelCls}>Name</label><input type="text" className={inputCls} placeholder="Student's full name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className={labelCls}>Email <span className="text-faint font-normal">(optional)</span></label><input type="email" className={inputCls} placeholder="student@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className={labelCls}>Notes <span className="text-faint font-normal">(optional)</span></label><input type="text" className={inputCls} placeholder="Preparing for June exam…" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <div><label className={labelCls}>Target Level</label><select className={inputCls} value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>{LEVEL_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}</select></div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:bg-raised transition-colors" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 flex items-center gap-2">
                  {saving && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
