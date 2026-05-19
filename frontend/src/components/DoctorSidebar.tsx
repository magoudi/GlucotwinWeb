import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { logout, useAccount } from '../lib/api'

const doctorNavItems = [
  { label: 'Clinic Overview', path: '/doctor' },
  { label: 'Patient Directory', path: '/doctor/patients' },
  { label: 'Supervision Requests', path: '/doctor/requests' },
]

export function DoctorSidebar() {
  const account = useAccount()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Mobile Header & Toggle */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-white/5 bg-[#0B1120]/80 px-4 backdrop-blur-md md:hidden">
        <Link to="/doctor" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 font-bold text-white shadow-lg">C</div>
          <span className="text-lg font-extrabold tracking-tight text-white">ClinicalPanel</span>
        </Link>
        <button onClick={toggle} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white">
          <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={toggle} />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/5 bg-[#0B1120] transition-transform duration-300 ease-in-out md:w-[236px] md:translate-x-0 xl:w-[260px] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center px-6 xl:px-8">
          <Link to="/doctor" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-lg font-extrabold text-white shadow-[0_4px_12px_rgba(34,211,238,0.3)]">
              C
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">Clinical<span className="text-cyan-400">Panel</span></span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 xl:px-6">
          <nav className="flex flex-col gap-1.5">
            {doctorNavItems.map((item) => {
              const active = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`relative flex items-center rounded-xl px-4 py-3 text-sm font-extrabold transition-all duration-200 ${
                    active
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                  )}
                  {item.label}
                </Link>
              )
            })}
            
          </nav>
        </div>

        <div className="border-t border-white/5 p-4 xl:p-6">
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 font-bold text-cyan-400 border border-cyan-500/20">
              {account?.initials || 'DR'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-extrabold text-white">{account?.fullName}</div>
              <div className="truncate text-xs font-bold text-slate-500">@{account?.username}</div>
            </div>
          </div>

          <button
            onClick={async () => {
              setIsOpen(false)
              await logout()
            }}
            className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-extrabold text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  )
}
