import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthLayout } from '../layouts/AuthLayout'

type LocationState = {
  email?: string
}

export function EmailVerificationPage() {
  const location = useLocation()
  const state = location.state as LocationState | null
  const email = state?.email ?? 'your email address'
  const [resendStatus, setResendStatus] = useState('')

  return (
    <AuthLayout
      heroTitle="Verify your inbox"
      heroDescription="A secure verification link has been sent to your email. Confirm your account to continue with GlucoTwin." 
      stats={[
        { value: 'Verified', label: 'Email confirmation required' },
        { value: 'Protected', label: 'Secure account activation' },
      ]}
    >
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -26 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="space-y-6"
      >
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-500">Email verification</p>
          <h1 className="text-[clamp(2.5rem,4vw,3.5rem)] leading-tight font-extrabold text-[#111111]">
            Verify your GlucoTwin account
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[#555555]">
            We sent a verification link to <span className="font-semibold text-slate-900">{email}</span>. Open your inbox and follow the instructions.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-[#f8fbff] p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-100 text-cyan-700">✓</div>
            <div>
              <p className="font-semibold text-slate-900">Why verification matters</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                It ensures your account is protected and your healthcare data remains confidential while you onboard the GlucoTwin experience.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">
          <p className="font-semibold text-slate-900">Still waiting?</p>
          <p>If you didn’t receive the email, tap the button below and we’ll resend a fresh verification link.</p>
          <button
            type="button"
            onClick={() => setResendStatus('A new verification link has been sent.')}
            className="inline-flex h-14 w-full items-center justify-center rounded-3xl bg-gradient-to-r from-cyan-500 to-sky-600 px-5 text-base font-extrabold text-white shadow-[0_18px_40px_rgba(37,194,255,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(37,194,255,0.32)]"
          >
            Resend verification email
          </button>
          {resendStatus && <p className="text-sm font-semibold text-cyan-700">{resendStatus}</p>}
        </div>

        <Link className="block text-sm font-bold text-cyan-600 hover:text-cyan-800" to="/login">
          Back to login
        </Link>
      </motion.div>
    </AuthLayout>
  )
}
