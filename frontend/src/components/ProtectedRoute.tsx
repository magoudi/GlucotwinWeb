import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAccount, useIsBootstrapping } from '../lib/api'

export function ProtectedRoute() {
  const account = useAccount()
  const isBootstrapping = useIsBootstrapping()
  const location = useLocation()

  if (isBootstrapping) {
    return <div className="flex min-h-screen items-center justify-center text-white font-bold">Loading...</div>
  }

  if (!account) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
