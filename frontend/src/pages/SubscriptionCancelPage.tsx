import { Link } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'

export function SubscriptionCancelPage() {
  return (
    <AppLayout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-lg">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent" />
          <div className="relative">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
              <svg className="size-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">Payment Cancelled</h1>
            <p className="mt-3 text-sm font-bold text-gray-500">
              Your payment was cancelled. No charges have been made.
              <br />
              You can try again anytime.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/subscription"
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-8 py-3 text-sm font-extrabold text-white shadow-md transition-all hover:-translate-y-0.5"
              >
                View Plans
              </Link>
              <Link
                to="/dashboard"
                className="rounded-xl border border-gray-200 bg-gray-50 px-8 py-3 text-sm font-extrabold text-gray-700 transition-colors hover:bg-gray-100"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
