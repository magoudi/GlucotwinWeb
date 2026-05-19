import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { AppPageHeader } from '../components/AppPageHeader'
import {
  fetchSubscriptionPlans,
  fetchMySubscription,
  cancelSubscription,
  type SubscriptionPlan,
  type MySubscription,
} from '../lib/subscriptionApi'

const BILLING_OPTIONS = [
  { key: 'monthly', label: 'Monthly' },
  { key: 'six_months', label: '6 Months' },
  { key: 'yearly', label: 'Yearly' },
]

const PLAN_ACCENTS: Record<string, { border: string; gradient: string; badge: string; button: string; glow: string }> = {
  standard: {
    border: 'border-emerald-500/30',
    gradient: 'from-emerald-500 to-teal-500',
    badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    button: 'from-emerald-500 to-teal-500 shadow-[0_8px_20px_rgba(16,185,129,0.3)]',
    glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
  },
  premium: {
    border: 'border-blue-500/30',
    gradient: 'from-blue-500 to-indigo-500',
    badge: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    button: 'from-blue-500 to-indigo-500 shadow-[0_8px_20px_rgba(59,130,246,0.3)]',
    glow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]',
  },
  vip: {
    border: 'border-amber-500/30',
    gradient: 'from-amber-500 to-orange-500',
    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    button: 'from-amber-500 to-orange-500 shadow-[0_8px_20px_rgba(245,158,11,0.3)]',
    glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]',
  },
}

export function SubscriptionPage() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [mySub, setMySub] = useState<MySubscription | null>(null)
  const [billingPeriod, setBillingPeriod] = useState('monthly')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [subscribingId, setSubscribingId] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [actionMsg, setActionMsg] = useState('')

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [plansRes, subRes] = await Promise.all([
        fetchSubscriptionPlans(),
        fetchMySubscription().catch(() => null),
      ])
      setPlans(plansRes.data || [])
      if (subRes) setMySub(subRes.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load subscription data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function handleSubscribe(packageId: string) {
    navigate(`/payment/${packageId}`)
  }

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel your subscription?')) return
    setCancelling(true)
    try {
      await cancelSubscription()
      setActionMsg('Subscription cancelled successfully.')
      setTimeout(() => setActionMsg(''), 4000)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not cancel subscription')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <AppLayout>
      <AppPageHeader
        title="Choose Your GlucoTwin Plan"
        description="Unlock advanced diabetes management features with the plan that fits your needs."
      />

      {actionMsg && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-300 shadow-lg">
          {actionMsg}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-center text-sm font-bold text-red-300">
          {error}
        </div>
      )}

      {/* Current Subscription Status */}
      {mySub && mySub.subscriptionStatus !== 'none' && (
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1120]/40 p-6 shadow-[0_18px_46px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-white">Current Subscription</h3>
              <div className="mt-2 flex flex-wrap gap-3">
                <span className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-extrabold capitalize ${
                  mySub.subscriptionStatus === 'active' ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400' :
                  mySub.subscriptionStatus === 'cancelled' ? 'border-red-500/30 bg-red-500/15 text-red-400' :
                  'border-slate-500/30 bg-slate-500/15 text-slate-400'
                }`}>
                  {mySub.subscriptionStatus}
                </span>
                {mySub.subscriptionPlan && (
                  <span className="inline-flex rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-extrabold capitalize text-white">
                    {mySub.subscriptionPlan} Plan
                  </span>
                )}
                {mySub.subscriptionBillingPeriod && (
                  <span className="inline-flex rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-400">
                    {mySub.subscriptionBillingPeriod === 'six_months' ? '6 Months' : mySub.subscriptionBillingPeriod}
                  </span>
                )}
              </div>
              {mySub.subscriptionEndDate && (
                <p className="mt-2 text-sm font-bold text-slate-400">
                  {mySub.subscriptionStatus === 'active' ? 'Renews' : 'Expired'}: {new Date(mySub.subscriptionEndDate).toLocaleDateString()}
                </p>
              )}
            </div>
            {mySub.subscriptionStatus === 'active' && (
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancel}
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-2.5 text-sm font-extrabold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            )}
          </div>
        </section>
      )}

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="size-10 animate-spin rounded-full border-4 border-cyan-500/30 border-t-cyan-500" />
        </div>
      ) : (
        <>
          {/* Billing Period Toggle */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-2xl border border-white/10 bg-[#0B1120]/60 p-1.5 backdrop-blur-xl">
              {BILLING_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setBillingPeriod(opt.key)}
                  className={`rounded-xl px-5 py-2.5 text-sm font-extrabold transition-all duration-200 ${
                    billingPeriod === opt.key
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Plan Cards */}
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => {
              const accent = PLAN_ACCENTS[plan.plan] || PLAN_ACCENTS.standard
              const price = plan.prices.find((p) => p.billingPeriod === billingPeriod)
              const isCurrentPlan = mySub?.subscriptionPlan === plan.plan && mySub?.subscriptionStatus === 'active'
              const packageId = price?.packageId || ''

              return (
                <div
                  key={plan.plan}
                  className={`relative overflow-hidden rounded-3xl border ${accent.border} bg-[#0B1120]/40 p-7 shadow-[0_18px_46px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-all duration-300 ${accent.glow} ${
                    plan.plan === 'premium' ? 'lg:scale-105 lg:z-10' : ''
                  }`}
                >
                  <div className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent.gradient}`} />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />

                  <div className="relative">
                    {/* Badge */}
                    {plan.plan === 'premium' && (
                      <div className="mb-4 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-extrabold text-blue-400">
                        Most Popular
                      </div>
                    )}
                    {plan.plan === 'vip' && (
                      <div className="mb-4 inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-extrabold text-amber-400">
                        Best Value
                      </div>
                    )}

                    {/* Plan Name & Description */}
                    <h2 className="text-2xl font-extrabold text-white">{plan.name}</h2>
                    <p className="mt-2 text-sm font-bold text-slate-400 leading-relaxed">{plan.description}</p>

                    {/* Price */}
                    {price && (
                      <div className="mt-6 flex items-baseline gap-1">
                        {price.displayAmount === 0 ? (
                          <span className="text-4xl font-extrabold text-white">Free</span>
                        ) : (
                          <>
                            <span className="text-4xl font-extrabold text-white">{price.displayAmount}</span>
                            <span className="text-lg font-bold text-slate-400">EGP</span>
                            <span className="ml-1 text-sm font-bold text-slate-500">/ {price.label.toLowerCase()}</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Features */}
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm font-bold text-slate-300">
                          <svg className={`mt-0.5 size-4 shrink-0 ${plan.plan === 'standard' ? 'text-emerald-400' : plan.plan === 'premium' ? 'text-blue-400' : 'text-amber-400'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feat}
                        </li>
                      ))}
                    </ul>

                    {/* Subscribe Button */}
                    <div className="mt-8">
                      {isCurrentPlan ? (
                        <div className="flex items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-3 text-sm font-extrabold text-emerald-400">
                          ✓ Current Plan
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={subscribingId === packageId}
                          onClick={() => handleSubscribe(packageId)}
                          className={`w-full rounded-xl bg-gradient-to-r ${accent.button} py-3.5 text-sm font-extrabold text-white transition-all hover:-translate-y-0.5 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {subscribingId === packageId ? 'Redirecting to payment...' : `Subscribe to ${plan.name}`}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </AppLayout>
  )
}
