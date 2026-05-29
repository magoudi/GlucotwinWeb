import { Navigate, Outlet } from 'react-router-dom'
import { useAccount, useIsBootstrapping } from '../lib/api'

export function PublicOnlyRoute() {
  const account = useAccount()
  const isBootstrapping = useIsBootstrapping()

  if (isBootstrapping) {
    return <div className="flex min-h-screen items-center justify-center text-gray-900 font-bold">Loading...</div>
  }

  if (account) {
    if (account.role === 'admin') {
      return <Navigate to="/admin" replace />
    }
    if (account.role === 'doctor') {
      return <Navigate to="/doctor" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
