'use client'
import { useState, useEffect } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import { LEVELS, MODELS } from '@/data/levels'

const LEVEL_OPTIONS = Object.entries(LEVELS).map(([v, { label }]) => ({ value: v, label }))

export default function SettingsPage() {
  const [prefs, setPrefs] = useState({ default_model: '', default_level: 'c2', custom_models: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newModel, setNewModel] = useState({ id: '', label: '' })
  const [addError, setAddError] = useState('')

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        setPrefs({
          default_model: d.default_model ?? '',
          default_level: d.default_level ?? 'c2',
          custom_models: d.custom_models ?? [],
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const allModels = [...MODELS, ...prefs.custom_models.map((m) => ({ id: m.id, label: m.label }))]

  function handleAddModel() {
    const id = newModel.id.trim()
    const label = newModel.label.trim()
    if (!id) { setAddError('Model ID is required.'); return }
    if (!label) { setAddError('Display name is required.'); return }
    if (allModels.some((m) => m.id === id)) { setAddError('Model ID already exists.'); return }
    setPrefs((prev) => ({ ...prev, custom_models: [...prev.custom_models, { id, label }] }))
    setNewModel({ id: '', label: '' })
    setAddError('')
  }

  function handleRemoveModel(id) {
    setPrefs((prev) => {
      const updated = prev.custom_models.filter((m) => m.id !== id)
      const stillExists = [...MODELS, ...updated].some((m) => m.id === prev.default_model)
      return { ...prev, custom_models: updated, default_model: stillExists ? prev.default_model : MODELS[0]?.id ?? '' }
    })
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      })
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    } catch {}
    setSaving(false)
  }

  if (loading) return <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg" /></div>

  return (
    <div className="max-w-xl">
      <PageHeader title="Settings" subtitle="Default preferences for grading." />

      <form onSubmit={handleSave} className="space-y-8">
        <section className="space-y-4">
          <h2 className="font-semibold text-base">Defaults</h2>
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium">Default AI Model</span></label>
            <select className="select select-bordered w-full" value={prefs.default_model} onChange={(e) => setPrefs({ ...prefs, default_model: e.target.value })}>
              {allModels.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
            </select>
          </div>
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium">Default Exam Level</span></label>
            <select className="select select-bordered w-full" value={prefs.default_level} onChange={(e) => setPrefs({ ...prefs, default_level: e.target.value })}>
              {LEVEL_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-semibold text-base">Model Library</h2>

          <div className="space-y-2">
            <p className="text-xs text-base-content/50 uppercase tracking-wide font-semibold">Built-in</p>
            {MODELS.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-base-200">
                <div>
                  <p className="text-sm font-medium">{m.label}</p>
                  <p className="text-xs text-base-content/50 font-mono">{m.id}</p>
                </div>
                <span className="badge badge-ghost badge-sm">built-in</span>
              </div>
            ))}
          </div>

          {prefs.custom_models.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-base-content/50 uppercase tracking-wide font-semibold">Custom</p>
              {prefs.custom_models.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-base-100 border border-base-200">
                  <div>
                    <p className="text-sm font-medium">{m.label}</p>
                    <p className="text-xs text-base-content/50 font-mono">{m.id}</p>
                  </div>
                  <button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => handleRemoveModel(m.id)}>Remove</button>
                </div>
              ))}
            </div>
          )}

          <div className="border border-base-200 rounded-xl p-4 space-y-3 bg-base-100">
            <p className="text-sm font-medium">Add custom model</p>
            <p className="text-xs text-base-content/50">
              Enter any <a href="https://openrouter.ai/models" target="_blank" rel="noreferrer" className="link link-primary">OpenRouter model ID</a> — e.g. <span className="font-mono">anthropic/claude-sonnet-4</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="form-control w-full">
                <label className="label"><span className="label-text font-medium">Model ID</span></label>
                <input type="text" className="input input-bordered w-full" placeholder="google/gemini-flash-3" value={newModel.id} onChange={(e) => { setNewModel({ ...newModel, id: e.target.value }); setAddError('') }} />
              </div>
              <div className="form-control w-full">
                <label className="label"><span className="label-text font-medium">Display name</span></label>
                <input type="text" className="input input-bordered w-full" placeholder="Gemini Flash 3" value={newModel.label} onChange={(e) => { setNewModel({ ...newModel, label: e.target.value }); setAddError('') }} />
              </div>
            </div>
            {addError && <p className="text-xs text-error">{addError}</p>}
            <button type="button" className="btn btn-outline btn-sm" onClick={handleAddModel}>Add model</button>
          </div>
        </section>

        <button type="submit" className="btn btn-primary w-full" disabled={saving}>
          {saving && <span className="loading loading-spinner loading-sm" />}
          {saved ? '✓ Saved' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
