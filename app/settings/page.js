'use client'
import { useState, useEffect } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import { LEVELS, MODELS } from '@/data/levels'

const LEVEL_OPTIONS = Object.entries(LEVELS).map(([v, { label }]) => ({ value: v, label }))
const inputCls = 'w-full px-3 py-2 rounded-lg border border-border bg-surface text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm'
const labelCls = 'block text-sm font-medium text-ink mb-1'

export default function SettingsPage() {
  const [prefs, setPrefs] = useState({ default_model: '', default_level: 'c2', custom_models: [], max_gradings_per_day: 5 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newModel, setNewModel] = useState({ id: '', label: '' })
  const [addError, setAddError] = useState('')

  useEffect(() => {
    fetch('/api/settings').then(r => {
      if (r.status === 403) { setLoading('forbidden'); return }
      return r.json()
    }).then(d => {
      if (!d) return
      setPrefs({ default_model: d.default_model ?? '', default_level: d.default_level ?? 'c2', custom_models: d.custom_models ?? [], max_gradings_per_day: d.max_gradings_per_day ?? 2 })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const allModels = [...MODELS, ...prefs.custom_models.map(m => ({ id: m.id, label: m.label }))]

  function handleAddModel() {
    const id = newModel.id.trim(), label = newModel.label.trim()
    if (!id) { setAddError('Model ID is required.'); return }
    if (!label) { setAddError('Display name is required.'); return }
    if (allModels.some(m => m.id === id)) { setAddError('Model ID already exists.'); return }
    setPrefs(prev => ({ ...prev, custom_models: [...prev.custom_models, { id, label }] }))
    setNewModel({ id: '', label: '' }); setAddError('')
  }

  function handleRemoveModel(id) {
    setPrefs(prev => {
      const updated = prev.custom_models.filter(m => m.id !== id)
      const stillExists = [...MODELS, ...updated].some(m => m.id === prev.default_model)
      return { ...prev, custom_models: updated, default_model: stillExists ? prev.default_model : MODELS[0]?.id ?? '' }
    })
  }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true); setSaved(false)
    try {
      const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prefs) })
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    } catch {}
    setSaving(false)
  }

  if (loading === 'forbidden') return <div className="text-center py-16 text-muted">Access denied.</div>
  if (loading) return <div className="flex justify-center py-16"><svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg></div>

  return (
    <div className="max-w-xl">
      <PageHeader title="Settings" subtitle="Default preferences for grading." />
      <form onSubmit={handleSave} className="space-y-8">

        <section className="space-y-4">
          <h2 className="font-semibold text-ink">Defaults</h2>
          <div><label className={labelCls}>Default AI Model</label>
            <select className={inputCls} value={prefs.default_model} onChange={e => setPrefs({ ...prefs, default_model: e.target.value })}>
              {allModels.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Default Exam Level</label>
            <select className={inputCls} value={prefs.default_level} onChange={e => setPrefs({ ...prefs, default_level: e.target.value })}>
              {LEVEL_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Max gradings per day <span className="text-faint font-normal">(per user)</span></label>
            <input type="number" min="1" max="100" className={inputCls} value={prefs.max_gradings_per_day} onChange={e => setPrefs({ ...prefs, max_gradings_per_day: parseInt(e.target.value) || 5 })} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-semibold text-ink">Model Library</h2>
          <div className="space-y-2">
            <p className="text-xs text-faint uppercase tracking-wide font-semibold">Built-in</p>
            {MODELS.map(m => (
              <div key={m.id} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-raised">
                <div><p className="text-sm font-medium text-ink">{m.label}</p><p className="text-xs text-faint font-mono">{m.id}</p></div>
                <span className="text-xs text-faint bg-border px-2 py-0.5 rounded">built-in</span>
              </div>
            ))}
          </div>

          {prefs.custom_models.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-faint uppercase tracking-wide font-semibold">Custom</p>
              {prefs.custom_models.map(m => (
                <div key={m.id} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-surface border border-border">
                  <div><p className="text-sm font-medium text-ink">{m.label}</p><p className="text-xs text-faint font-mono">{m.id}</p></div>
                  <button type="button" className="text-xs text-red hover:opacity-70 transition-opacity" onClick={() => handleRemoveModel(m.id)}>Remove</button>
                </div>
              ))}
            </div>
          )}

          <div className="border border-border rounded-xl p-4 space-y-3 bg-surface">
            <p className="text-sm font-medium text-ink">Add custom model</p>
            <p className="text-xs text-muted">Any <a href="https://openrouter.ai/models" target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">OpenRouter model ID</a> — e.g. <span className="font-mono">anthropic/claude-sonnet-4</span></p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className={labelCls}>Model ID</label><input type="text" className={inputCls} placeholder="google/gemini-flash-3" value={newModel.id} onChange={e => { setNewModel({ ...newModel, id: e.target.value }); setAddError('') }} /></div>
              <div><label className={labelCls}>Display name</label><input type="text" className={inputCls} placeholder="Gemini Flash 3" value={newModel.label} onChange={e => { setNewModel({ ...newModel, label: e.target.value }); setAddError('') }} /></div>
            </div>
            {addError && <p className="text-xs text-red">{addError}</p>}
            <button type="button" className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-ink hover:bg-raised transition-colors" onClick={handleAddModel}>Add model</button>
          </div>
        </section>

        <button type="submit" disabled={saving} className="w-full py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2">
          {saving && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
          {saved ? '✓ Saved' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
