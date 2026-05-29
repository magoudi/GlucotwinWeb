import { AppLayout } from '../layouts/AppLayout'
import { useNavigate } from 'react-router-dom'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <AppLayout>
      <div className="flex h-[70vh] flex-col items-center justify-center text-center">
        <div className="text-[120px] font-black leading-none text-cyan-500/15">404</div>
        <h1 className="mt-2 text-4xl font-black text-gray-900">Page Not Found</h1>
        <p className="mt-4 max-w-md text-lg text-slate-500">
          The page you are looking for doesn't exist or has been moved.
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
