import { Link, NavLink } from 'react-router-dom'
import { appNavGroups } from '../data/navigation'
import { logout, useAccount } from '../lib/api'
import { Logo } from './Logo'

export function Sidebar() {
  const account = useAccount()
  const displayName = account?.fullName ?? 'Gluco Twin'
  const username = account?.username ?? 'gluco'
  const initials = account?.initials ?? 'G'

  return (
    <aside
      className="sticky top-0 z-30 flex shrink-0 flex-col border-r border-white/5 bg-[#0B1120]/60 bg-[radial-gradient(circle_at_top_left,rgba(37,194,160,0.12),transparent_40%),linear-gradient(180deg,rgba(11,17,32,0.6)_0%,rgba(6,9,16,0.9)_100%)] px-4 py-4 text-white backdrop-blur-2xl md:fixed md:inset-y-0 md:left-0 md:h-screen md:w-[236px] md:overflow-y-auto md:px-5 md:py-6 xl:w-[260px] xl:px-6 xl:py-8"
      data-node-id="17:3"
    >
      <Link to="/dashboard" className="mb-4 md:mb-8 xl:mb-[56px]">
        <Logo dark/>
      </Link>
      <nav className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
        {appNavGroups.map((group) => (
          <div key={group.title} className="mb-4">
            <h4 className="mb-2 px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 xl:px-4">{group.title}</h4>
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    'group flex h-11 shrink-0 items-center rounded-xl px-3 text-sm leading-[1.3] font-semibold transition-all duration-300 xl:h-[40px] xl:px-4 xl:text-base',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25c2a0]',
                    isActive ? 'bg-gradient-to-r from-[#25c2a0]/20 to-transparent text-white shadow-[inset_3px_0_0_#25c2a0]' : 'text-slate-400 hover:translate-x-1 hover:bg-white/[0.04] hover:text-white',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
        {account?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              [
                'group mt-2 flex h-11 shrink-0 items-center gap-2 rounded-xl border border-violet-500/20 px-3 text-sm leading-[1.3] font-semibold transition-all duration-300 xl:h-[46px] xl:px-4 xl:text-base',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400',
                isActive ? 'bg-gradient-to-r from-violet-500/20 to-transparent text-violet-300 shadow-[inset_3px_0_0_#8b5cf6]' : 'text-violet-400 hover:translate-x-1 hover:bg-violet-500/[0.06] hover:text-violet-300',
              ].join(' ')
            }
          >
            <svg className="size-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            Admin Panel
          </NavLink>
        )}
        {(account?.role === 'doctor' || account?.role === 'admin') && (
          <NavLink
            to="/doctor"
            className={({ isActive }) =>
              [
                'group mt-2 flex h-11 shrink-0 items-center gap-2 rounded-xl border border-cyan-500/20 px-3 text-sm leading-[1.3] font-semibold transition-all duration-300 xl:h-[46px] xl:px-4 xl:text-base',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400',
                isActive ? 'bg-gradient-to-r from-cyan-500/20 to-transparent text-cyan-300 shadow-[inset_3px_0_0_#22d3ee]' : 'text-cyan-400 hover:translate-x-1 hover:bg-cyan-500/[0.06] hover:text-cyan-300',
              ].join(' ')
            }
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Clinical Panel
          </NavLink>
        )}
      </nav>
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          [
            'group mt-4 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.07] p-3 text-left shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition-all md:mt-auto',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25c2a0]',
            isActive ? 'border-[#25c2a0]/60 bg-white/[0.14]' : 'hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.12]',
          ].join(' ')
        }
        aria-label="Open account profile"
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#25c2a0] to-[#2f6fee] text-[16px] font-extrabold text-white shadow-[0_10px_24px_rgba(37,194,160,0.22)]">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#89dcca]">Account</p>
          <p className="truncate text-[15px] font-extrabold text-white">{displayName}</p>
          <p className="truncate text-[13px] font-semibold text-[#c7dada]">@{username}</p>
        </div>
        <span className="text-[22px] font-extrabold text-[#89dcca] transition-transform group-hover:translate-x-0.5" aria-hidden="true">›</span>
      </NavLink>
      <button
        className="mt-3 rounded-xl border border-white/10 px-4 py-3 text-left text-[14px] font-extrabold text-[#c7dada] transition-colors hover:bg-white/[0.08] hover:text-white"
        type="button"
        onClick={async () => {
          await logout()
        }}
      >
        Log out
      </button>
    </aside>
  )
}
