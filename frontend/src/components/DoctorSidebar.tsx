import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { logout, useAccount } from '../lib/api'

const doctorNavItems = [
  { label: 'Clinic Overview', path: '/doctor' },
  { label: 'Patient Directory', path: '/doctor/patients' },
  { label: 'Supervision Requests', path: '/doctor/requests' },
  { label: 'Appointments', path: '/doctor/appointments' },
  { label: 'Messages', path: '/doctor/messages' },
  { label: 'Reports', path: '/doctor/reports' },
  { label: 'Settings', path: '/doctor/settings' },
]

export function DoctorSidebar() {
  const account = useAccount()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Mobile Header & Toggle */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-black/8 bg-white/90 px-4 backdrop-blur-md md:hidden">
        <Link to="/doctor" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#2455e8] to-[#4f7bff] font-bold text-white shadow-md">C</div>
          <span className="text-lg font-extrabold tracking-tight text-[#111111]">ClinicalPanel</span>
        </Link>
        <button onClick={toggle} className="rounded-lg p-2 text-[#666666] hover:bg-[#f5f4f0] hover:text-[#111111]">
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
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden" onClick={toggle} />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-black/8 bg-white transition-transform duration-300 ease-in-out md:w-[236px] md:translate-x-0 xl:w-[260px] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center px-6 xl:px-8">
          <Link to="/doctor" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2455e8] to-[#4f7bff] text-lg font-extrabold text-white shadow-[0_4px_12px_rgba(36,85,232,0.28)]">
              C
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#111111]">Clinical<span className="text-[#2455e8]">Panel</span></span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 xl:px-6">
          <nav className="flex flex-col gap-1">
            {doctorNavItems.map((item) => {
              const active = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`relative flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-[#e8eeff] text-[#2455e8] shadow-[inset_3px_0_0_#2455e8]'
                      : 'text-[#555555] hover:bg-[#f5f4f0] hover:text-[#111111]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="border-t border-black/8 p-4 xl:p-6">
          <div className="mb-3 flex items-center gap-3 rounded-2xl border border-black/8 bg-[#f5f4f0] p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2455e8] to-[#4f7bff] font-bold text-white shadow-md">
              {account?.initials || 'DR'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-extrabold text-[#111111]">{account?.fullName}</div>
              <div className="truncate text-xs font-semibold text-[#666666]">@{account?.username}</div>
            </div>
          </div>

          <button
            onClick={async () => {
              setIsOpen(false)
              await logout()
            }}
            className="flex w-full items-center justify-center rounded-xl border border-black/8 bg-white py-2.5 text-sm font-semibold text-[#555555] transition-colors hover:bg-[#f5f4f0] hover:text-[#111111]"
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  )
}
