import { useEffect, useState, useCallback } from 'react'
import { AdminLayout } from '../../layouts/AdminLayout'
import { fetchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, type Announcement } from '../../lib/adminApi'

export function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [isEditing, setIsEditing] = useState<Announcement | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  
  const [form, setForm] = useState<Partial<Announcement>>({
    title: '',
    message: '',
    type: 'info',
    active: true,
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchAnnouncements()
      setAnnouncements(res.announcements)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleSave() {
    try {
      if (isEditing) {
        await updateAnnouncement(isEditing.id, form)
      } else {
        await createAnnouncement(form)
      }
      setIsEditing(null)
      setIsCreating(false)
      load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to save')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this announcement?')) return
    try {
      await deleteAnnouncement(id)
      load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete')
    }
  }

  async function toggleActive(a: Announcement) {
    try {
      await updateAnnouncement(a.id, { active: !a.active })
      load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to toggle')
    }
  }

  function openCreate() {
    setForm({ title: '', message: '', type: 'info', active: true })
    setIsCreating(true)
  }

  function openEdit(a: Announcement) {
    setForm({ title: a.title, message: a.message, type: a.type, active: a.active })
    setIsEditing(a)
  }

  if (loading && announcements.length === 0) return <AdminLayout><div className="flex min-h-[60vh] items-center justify-center"><div className="size-10 animate-spin rounded-full border-4 border-violet-500/30 border-t-violet-500" /></div></AdminLayout>

  return (
    <AdminLayout>
      <header className="relative mb-6 overflow-hidden rounded-3xl border border-gray-200 bg-gray-50/40 px-5 py-5 shadow-[0_18px_48px_rgba(0,0,0,0.4)] backdrop-blur-3xl sm:px-7 xl:px-8 xl:py-7">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-600" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-sm font-extrabold text-violet-400">Admin Dashboard</div>
            <h1 className="text-[clamp(2rem,3.2vw,3.75rem)] leading-none font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">Global Announcements</h1>
            <p className="mt-4 text-[clamp(1rem,1.25vw,1.25rem)] leading-7 font-bold text-slate-600">Broadcast messages to all users on the platform.</p>
          </div>
          <button onClick={openCreate} className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(139,92,246,0.3)] transition-all hover:scale-105">
            + New Announcement
          </button>
        </div>
      </header>

      {error && <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-50 p-6 text-center text-red-600">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {announcements.map((a) => (
          <div key={a.id} className={`relative flex flex-col overflow-hidden rounded-2xl border ${a.active ? 'border-violet-500/40 shadow-[0_14px_34px_rgba(139,92,246,0.1)]' : 'border-white/5 opacity-75'} bg-gray-50/40 p-5 backdrop-blur-2xl transition-all`}>
            <div className="mb-3 flex items-center justify-between">
              <span className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-extrabold capitalize ${
                a.type === 'info' ? 'border-blue-500/30 bg-blue-500/15 text-blue-600' :
                a.type === 'warning' ? 'border-amber-500/30 bg-amber-500/15 text-amber-400' :
                a.type === 'error' ? 'border-red-500/30 bg-red-500/15 text-red-600' :
                'border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
              }`}>
                {a.type}
              </span>
              <button onClick={() => toggleActive(a)} className={`text-xs font-bold ${a.active ? 'text-emerald-400' : 'text-slate-500'}`}>
                {a.active ? '● Active' : '○ Inactive'}
              </button>
            </div>
            <h3 className="mb-2 text-lg font-extrabold text-gray-900">{a.title}</h3>
            <p className="mb-4 flex-1 text-sm text-slate-500">{a.message}</p>
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <span className="text-xs text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</span>
              <div className="flex gap-2">
                <button onClick={() => openEdit(a)} className="text-xs font-bold text-violet-400 hover:text-violet-300">Edit</button>
                <button onClick={() => handleDelete(a.id)} className="text-xs font-bold text-red-600 hover:text-red-600">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(isCreating || isEditing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setIsCreating(false); setIsEditing(null) }} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gray-200 bg-[#0f1729] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.6)] xl:p-8">
            <h2 className="mb-6 text-xl font-extrabold text-gray-900">{isCreating ? 'New Announcement' : 'Edit Announcement'}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-violet-500/50"
                />
              </div>
              
              <div>
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-violet-500/50"
                />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-violet-500/50"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Status</label>
                  <label className="flex h-[46px] cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                      className="size-4 rounded border-gray-200 bg-gray-50 text-violet-500"
                    />
                    <span className="text-sm font-bold text-gray-900">Active</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => { setIsCreating(false); setIsEditing(null) }} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-extrabold text-slate-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-extrabold text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
