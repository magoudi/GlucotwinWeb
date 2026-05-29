import { useEffect, useState, useCallback } from 'react'
import { AdminLayout } from '../../layouts/AdminLayout'
import { fetchAdminUsers, deleteAdminUser, resetAdminUserPassword, impersonateUser } from '../../lib/adminApi'
import { AdminUserEditModal } from './AdminUserEditModal'
import type { AccountUser } from '../../lib/api'

export function AdminUsersPage() {
  const [users, setUsers] = useState<AccountUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [editUser, setEditUser] = useState<AccountUser | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<AccountUser | null>(null)
  const [resetPwUser, setResetPwUser] = useState<AccountUser | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [actionMsg, setActionMsg] = useState('')

  const loadUsers = useCallback(async (q?: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchAdminUsers(q)
      setUsers(res.users)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    loadUsers(search)
  }

  async function handleDelete(user: AccountUser) {
    try {
      await deleteAdminUser(user.id)
      setConfirmDelete(null)
      setActionMsg(`Deleted "${user.fullName}" successfully`)
      setTimeout(() => setActionMsg(''), 4000)
      loadUsers(search || undefined)
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  async function handleResetPassword() {
    if (!resetPwUser) return
    try {
      await resetAdminUserPassword(resetPwUser.id, newPassword)
      setResetPwUser(null)
      setNewPassword('')
      setActionMsg(`Password reset for "${resetPwUser.fullName}"`)
      setTimeout(() => setActionMsg(''), 4000)
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : 'Reset failed')
    }
  }

  async function handleImpersonate(user: AccountUser) {
    try {
      const res = await impersonateUser(user.id)
      window.location.href = res.user.role === 'admin' ? '/admin' : res.user.role === 'doctor' ? '/doctor' : '/dashboard'
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : 'Impersonation failed')
    }
  }

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'border-violet-200 bg-violet-50 text-violet-700',
      doctor: 'border-blue-200 bg-blue-50 text-blue-700',
      patient: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    }
    return (
      <span className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-extrabold capitalize ${styles[role] || 'border-slate-200 bg-slate-50 text-slate-600'}`}>
        {role}
      </span>
    )
  }

  return (
    <AdminLayout>
      {/* Header */}
      <header className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white px-5 py-5 shadow-md sm:px-7 xl:px-8 xl:py-7">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-600" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-violet-500/30 bg-violet-50 px-3 py-1.5 text-sm font-extrabold text-violet-600">
              Admin Dashboard
            </div>
            <h1 className="text-[clamp(2rem,3.2vw,3.75rem)] leading-none font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-50 to-gray-500">
              User Management
            </h1>
            <p className="mt-4 text-[clamp(1rem,1.25vw,1.25rem)] leading-7 font-bold text-slate-600">
              View, edit, and manage all registered users on the platform.
            </p>
          </div>
        </div>
      </header>

      {/* Action Message Toast */}
      {actionMsg && (
        <div className="animate-[fadeIn_0.3s_ease] rounded-2xl border border-violet-200 bg-violet-50 px-5 py-3 text-sm font-bold text-violet-700 shadow-lg">
          {actionMsg}
        </div>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm font-bold text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-500 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(139,92,246,0.3)] transition-all hover:scale-105"
        >
          Search
        </button>
      </form>

      {/* Users Table */}
      <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent" />
        <div className="relative overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="size-10 animate-spin rounded-full border-4 border-violet-500/30 border-t-violet-500" />
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">{error}</div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No users found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Subscription</th>
                  <th className="px-5 py-4">Diabetes Type</th>
                  <th className="px-5 py-4">Joined</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 text-xs font-extrabold text-violet-700">
                          {u.initials}
                        </div>
                        <span className="font-bold text-gray-900">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{u.email}</td>
                    <td className="px-5 py-4">{roleBadge(u.role || 'patient')}</td>
                    <td className="px-5 py-4">
                      {u.role === 'patient' ? (
                        <div className="flex flex-col gap-1">
                          {u.isSubscribed ? (
                            <span className={`inline-flex w-fit rounded-lg border px-2 py-0.5 text-xs font-extrabold capitalize ${
                              u.subscriptionPlan === 'vip' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                              u.subscriptionPlan === 'premium' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                              'border-emerald-200 bg-emerald-50 text-emerald-700'
                            }`}>
                              {u.subscriptionPlan || 'Active'}
                            </span>
                          ) : (
                            <span className="inline-flex w-fit rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-extrabold text-slate-500">None</span>
                          )}
                          {u.subscriptionEndDate && (
                            <span className="text-[10px] font-bold text-slate-500">Exp: {new Date(u.subscriptionEndDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{u.diabetesType || '—'}</td>
                    <td className="px-5 py-4 text-slate-500">{u.createdAt ? new Date(u.createdAt as string).toLocaleDateString() : '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleImpersonate(u)}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700 transition-colors hover:bg-emerald-100"
                        >
                          Login As
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditUser(u)}
                          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-extrabold text-slate-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setResetPwUser(u)}
                          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-extrabold text-amber-700 transition-colors hover:bg-amber-100"
                        >
                          Reset PW
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(u)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-extrabold text-red-700 transition-colors hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Edit Modal */}
      {editUser && (
        <AdminUserEditModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={(updated) => {
            setEditUser(null)
            setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
            setActionMsg(`Updated "${updated.fullName}" successfully`)
            setTimeout(() => setActionMsg(''), 4000)
          }}
        />
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-xl xl:p-8">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 to-orange-500" />
            <h3 className="text-lg font-extrabold text-gray-900">Confirm Delete</h3>
            <p className="mt-2 text-sm text-slate-500">
              Are you sure you want to permanently delete <strong className="text-gray-900">{confirmDelete.fullName}</strong> ({confirmDelete.email})? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-extrabold text-slate-600 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDelete)}
                className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(239,68,68,0.3)] transition-all hover:scale-105"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPwUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setResetPwUser(null); setNewPassword('') }} />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-xl xl:p-8">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <h3 className="text-lg font-extrabold text-gray-900">Reset Password</h3>
            <p className="mt-2 text-sm text-slate-500">
              Set a new password for <strong className="text-gray-900">{resetPwUser.fullName}</strong>.
            </p>
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">New Password</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars, uppercase, lowercase, number"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 outline-none transition-colors placeholder:text-gray-500 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
              />
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => { setResetPwUser(null); setNewPassword('') }}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-extrabold text-slate-600 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={!newPassword}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(245,158,11,0.3)] transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
