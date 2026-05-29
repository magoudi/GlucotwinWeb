import { Navigate, Outlet } from 'react-router-dom'
import { useAccount, useIsBootstrapping } from '../lib/api'

export function DoctorRoute() {
  const account = useAccount()
  const isBootstrapping = useIsBootstrapping()

  if (isBootstrapping) {
    return <div className="flex min-h-screen items-center justify-center text-gray-900 font-bold">Loading...</div>
  }

  if (!account || (account.role !== 'doctor' && account.role !== 'admin')) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
