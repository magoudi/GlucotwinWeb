import { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { fetchMySubscription, activateMockSubscription } from '../lib/subscriptionApi'

export function SubscriptionSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'activated' | 'pending' | 'error'>('loading')
  const [countdown, setCountdown] = useState(5)

  const sessionId = searchParams.get('session_id') || ''
  const isMock = searchParams.get('mock') === 'true'

  useEffect(() => {
    let cancelled = false

    async function activate() {
      try {
        // If mock mode, call activate-mock endpoint first
        if (isMock && sessionId) {
          await activateMockSubscription(sessionId)
        }

        // Poll for subscription status
        let attempts = 0
        const maxAttempts = 10
        while (attempts < maxAttempts && !cancelled) {
          const res = await fetchMySubscription()
          if (res.data.isSubscribed && res.data.subscriptionStatus === 'active') {
            setStatus('activated')
            return
          }
          attempts++
          await new Promise((r) => setTimeout(r, 2000))
        }

        if (!cancelled) {
          setStatus('pending')
        }
      } catch {
        if (!cancelled) {
          setStatus('error')
        }
      }
    }

    activate()

    return () => {
      cancelled = true
    }
  }, [sessionId, isMock])

  // Countdown redirect when activated
  useEffect(() => {
    if (status !== 'activated') return
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [status, navigate])

  return (
    <AppLayout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-lg">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent" />
          <div className="relative">
            {status === 'loading' && (
              <>
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50">
                  <div className="size-8 animate-spin rounded-full border-4 border-cyan-500/30 border-t-cyan-500" />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900">Activating Your Subscription</h1>
                <p className="mt-3 text-sm font-bold text-gray-500">Please wait while we confirm your payment...</p>
              </>
            )}

            {status === 'activated' && (
              <>
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50">
                  <svg className="size-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900">Payment Successful!</h1>
                <p className="mt-3 text-sm font-bold text-emerald-600">Your subscription is now active.</p>
                <p className="mt-4 text-xs font-bold text-slate-500">Redirecting to dashboard in {countdown}s...</p>
                <Link
                  to="/dashboard"
                  className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-8 py-3 text-sm font-extrabold text-white shadow-md transition-all hover:-translate-y-0.5"
                >
                  Go to Dashboard Now
                </Link>
              </>
            )}

            {status === 'pending' && (
              <>
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50">
                  <svg className="size-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900">Payment Processing</h1>
                <p className="mt-3 text-sm font-bold text-gray-500">Your payment is being processed. Your subscription will be activated shortly.</p>
                <Link
                  to="/subscription"
                  className="mt-6 inline-flex rounded-xl border border-gray-200 bg-gray-50 px-8 py-3 text-sm font-extrabold text-gray-700 transition-colors hover:bg-gray-100"
                >
                  Check Subscription Status
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border border-red-200 bg-red-50">
                  <svg className="size-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900">Something Went Wrong</h1>
                <p className="mt-3 text-sm font-bold text-gray-500">We couldn't confirm your payment. Please check your subscription status.</p>
                <Link
                  to="/subscription"
                  className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-8 py-3 text-sm font-extrabold text-white shadow-md transition-all hover:-translate-y-0.5"
                >
                  Try Again
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
