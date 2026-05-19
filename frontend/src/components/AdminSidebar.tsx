import { Link, NavLink } from 'react-router-dom'
import { logout, useAccount } from '../lib/api'
import { Logo } from './Logo'

const adminNavItems = [
  { label: 'Overview', path: '/admin' },
  { label: 'User Management', path: '/admin/users' },
  { label: 'Announcements', path: '/admin/announcements' },
  { label: 'Settings', path: '/admin/settings' },
  { label: 'System', path: '/admin/system' },
  { label: 'Audit Log', path: '/admin/audit' },
]

export function AdminSidebar() {
  const account = useAccount()
  const displayName = account?.fullName ?? 'Admin'
  const username = account?.username ?? 'admin'
  const initials = account?.initials ?? 'A'

  return (
    <aside
      className="sticky top-0 z-30 flex shrink-0 flex-col border-r border-white/5 bg-[#0B1120]/60 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.12),transparent_40%),linear-gradient(180deg,rgba(11,17,32,0.6)_0%,rgba(6,9,16,0.9)_100%)] px-4 py-4 text-white backdrop-blur-2xl md:fixed md:inset-y-0 md:left-0 md:h-screen md:w-[236px] md:overflow-y-auto md:px-5 md:py-6 xl:w-[260px] xl:px-6 xl:py-8"
    >
      <Link to="/admin" className="mb-2 md:mb-4 xl:mb-6">
        <Logo />
      </Link>

      <div className="mb-4 inline-flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-violet-400 md:mb-6">
        <svg className="size-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
        Admin Panel
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
        {adminNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              [
                'group flex h-11 shrink-0 items-center rounded-xl px-3 text-sm leading-[1.3] font-semibold transition-all duration-300 xl:h-[46px] xl:px-4 xl:text-base',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400',
                isActive
                  ? 'bg-gradient-to-r from-violet-500/20 to-transparent text-white shadow-[inset_3px_0_0_#8b5cf6]'
                  : 'text-slate-400 hover:translate-x-1 hover:bg-white/[0.04] hover:text-white',
              ].join(' ')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 md:mt-auto">
        <NavLink
          to="/dashboard"
          className="group mb-3 flex h-11 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm font-semibold text-slate-400 transition-all hover:bg-white/[0.04] hover:text-white xl:h-[46px] xl:px-4 xl:text-base"
        >
          <svg className="size-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to App
        </NavLink>

        <div
          className="group flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.07] p-3 text-left shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[16px] font-extrabold text-white shadow-[0_10px_24px_rgba(139,92,246,0.22)]">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-violet-400">Admin</p>
            <p className="truncate text-[15px] font-extrabold text-white">{displayName}</p>
            <p className="truncate text-[13px] font-semibold text-[#c7dada]">@{username}</p>
          </div>
        </div>

        <button
          className="mt-3 w-full rounded-xl border border-white/10 px-4 py-3 text-left text-[14px] font-extrabold text-[#c7dada] transition-colors hover:bg-white/[0.08] hover:text-white"
          type="button"
          onClick={async () => {
            await logout()
          }}
        >
          Log out
        </button>
      </div>
    </aside>
  )
}
