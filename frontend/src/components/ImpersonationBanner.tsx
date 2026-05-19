import { stopImpersonating, useSession } from '../lib/api'

function homePathForRole(role?: string) {
  if (role === 'admin') {
    return '/admin'
  }

  if (role === 'doctor') {
    return '/doctor'
  }

  return '/dashboard'
}

export function ImpersonationBanner() {
  const session = useSession()

  if (!session.isImpersonating || !session.impersonator) {
    return null
  }

  async function handleReturn() {
    const payload = await stopImpersonating()
    const nextPath = homePathForRole(payload.user?.role || session.impersonator?.role)
    window.location.href = nextPath
  }

  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-red-600 to-orange-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg md:px-8">
      <div className="flex items-center gap-2">
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Viewing this account on behalf of {session.impersonator.fullName}.
      </div>
      <button onClick={handleReturn} className="rounded-lg bg-white/20 px-3 py-1.5 transition-colors hover:bg-white/30">
        Return to {session.impersonator.role === 'doctor' ? 'Doctor' : 'Admin'}
      </button>
    </div>
  )
}
