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
      className="sticky top-0 z-30 flex shrink-0 flex-col border-r border-black/8 bg-white px-4 py-4 md:fixed md:inset-y-0 md:left-0 md:h-screen md:w-[236px] md:overflow-y-auto md:px-5 md:py-6 xl:w-[260px] xl:px-6 xl:py-8"
      data-node-id="17:3"
    >
      <Link to="/dashboard" className="mb-4 md:mb-8 xl:mb-[40px]">
        <Logo />
      </Link>
      <nav className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
        {appNavGroups.map((group) => (
          <div key={group.title} className="mb-4">
            <h4 className="mb-1.5 px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#999999] xl:px-4">{group.title}</h4>
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    'group flex h-10 shrink-0 items-center rounded-xl px-3 text-sm leading-[1.3] font-semibold transition-all duration-200 xl:h-[38px] xl:px-4',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2455e8]',
                    isActive
                      ? 'bg-[#e8eeff] text-[#2455e8] shadow-[inset_3px_0_0_#2455e8]'
                      : 'text-[#555555] hover:bg-[#f5f4f0] hover:text-[#111111]',
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
                'group mt-2 flex h-10 shrink-0 items-center gap-2 rounded-xl border border-violet-200 px-3 text-sm leading-[1.3] font-semibold transition-all duration-200 xl:h-[42px] xl:px-4',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400',
                isActive
                  ? 'bg-violet-50 text-violet-700 shadow-[inset_3px_0_0_#7c3aed]'
                  : 'text-violet-600 hover:bg-violet-50 hover:text-violet-800',
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
                'group mt-2 flex h-10 shrink-0 items-center gap-2 rounded-xl border border-cyan-200 px-3 text-sm leading-[1.3] font-semibold transition-all duration-200 xl:h-[42px] xl:px-4',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400',
                isActive
                  ? 'bg-cyan-50 text-cyan-700 shadow-[inset_3px_0_0_#0891b2]'
                  : 'text-cyan-600 hover:bg-cyan-50 hover:text-cyan-800',
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
            'group mt-4 flex items-center gap-3 rounded-2xl border bg-white p-3 text-left shadow-[0_2px_8px_rgba(17,17,17,0.06)] transition-all md:mt-auto',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2455e8]',
            isActive
              ? 'border-[#2455e8]/30 bg-[#e8eeff]'
              : 'border-black/8 hover:-translate-y-0.5 hover:border-black/14 hover:shadow-[0_4px_16px_rgba(17,17,17,0.10)]',
          ].join(' ')
        }
        aria-label="Open account profile"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2455e8] to-[#4f7bff] text-[15px] font-extrabold text-white shadow-[0_4px_12px_rgba(36,85,232,0.28)]">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#2455e8]">Account</p>
          <p className="truncate text-[14px] font-extrabold text-[#111111]">{displayName}</p>
          <p className="truncate text-[12px] font-semibold text-[#666666]">@{username}</p>
        </div>
        <span className="text-[20px] font-bold text-[#aaaaaa] transition-transform group-hover:translate-x-0.5" aria-hidden="true">›</span>
      </NavLink>
      <button
        className="mt-3 rounded-xl border border-black/8 px-4 py-2.5 text-left text-[13px] font-semibold text-[#666666] transition-colors hover:bg-[#f5f4f0] hover:text-[#111111]"
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
