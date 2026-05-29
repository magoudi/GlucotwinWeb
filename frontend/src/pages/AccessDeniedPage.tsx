import { AppLayout } from '../layouts/AppLayout'
import { useNavigate } from 'react-router-dom'

export function AccessDeniedPage() {
  const navigate = useNavigate()

  return (
    <AppLayout>
      <div className="flex h-[70vh] flex-col items-center justify-center text-center">
        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-red-50 text-red-500">
          <svg className="size-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-4xl font-black text-gray-900">Access Denied</h1>
        <p className="mt-4 max-w-md text-lg text-slate-500">
          You do not have permission to view this page. If you believe this is a mistake, please contact your administrator.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-8 rounded-xl bg-cyan-500 px-6 py-3 font-extrabold text-white transition-colors hover:bg-cyan-400 shadow-md"
        >
          Return to Dashboard
        </button>
      </div>
    </AppLayout>
  )
}
