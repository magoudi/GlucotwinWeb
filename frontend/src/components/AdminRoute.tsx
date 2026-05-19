import { Navigate, Outlet } from 'react-router-dom'
import { useAccount, useIsBootstrapping } from '../lib/api'

export function AdminRoute() {
  const account = useAccount()
  const isBootstrapping = useIsBootstrapping()

  if (isBootstrapping) {
    return <div className="flex min-h-screen items-center justify-center text-white font-bold">Loading...</div>
  }

  if (!account || account.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
