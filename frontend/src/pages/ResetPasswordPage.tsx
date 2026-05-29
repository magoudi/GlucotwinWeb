import { Formik } from 'formik'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as Yup from 'yup'
import { FormInput } from '../components/FormInput'
import { AuthLayout } from '../layouts/AuthLayout'
import { verifyPasswordResetCode, confirmPasswordReset } from '../lib/api'

const verifyCodeSchema = Yup.object({
  email: Yup.string().trim().email('Enter a valid email').required('Email is required'),
  code: Yup.string()
    .trim()
    .length(6, 'Verification code must be exactly 6 digits')
    .matches(/^[0-9]+$/, 'Verification code must contain only numbers')
    .required('Verification code is required'),
})

const newPasswordSchema = Yup.object({
  password: Yup.string()
    .trim()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
})

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialEmail = location.state?.email || ''
  const [step, setStep] = useState<'VERIFY_CODE' | 'NEW_PASSWORD'>('VERIFY_CODE')
  const [email, setEmail] = useState(initialEmail)
  const [resetToken, setResetToken] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!initialEmail && step === 'VERIFY_CODE') {
      setEmail('')
    }
  }, [initialEmail, step])

  return (
    <AuthLayout
      heroTitle="Reset access with secure verification"
      heroDescription="Confirm your identity and choose a strong new password for your healthcare AI account."
      stats={[
        { value: 'Verified', label: 'Email-based reset flow' },
        { value: 'Secure', label: 'Protected with token validation' },
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
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-500">Password recovery</p>
          <h1 className="text-[clamp(2.5rem,4vw,3.5rem)] leading-tight font-extrabold text-[#111111]">
            {step === 'VERIFY_CODE' ? 'Verify reset code' : 'Create a new password'}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[#555555]">
            {step === 'VERIFY_CODE'
              ? 'Enter the code sent to your email to validate account access.'
              : 'Choose a strong new password for your GlucoTwin account.'}
          </p>
        </div>

        {step === 'VERIFY_CODE' && (
          <Formik
            initialValues={{ email, code: '' }}
            validationSchema={verifyCodeSchema}
            onSubmit={async (values, helpers) => {
              setError('')
              setMessage('')
              try {
                const result = await verifyPasswordResetCode(values.email, values.code)
                if (result.resetToken) {
                  setResetToken(result.resetToken)
                  setEmail(values.email)
                  setStep('NEW_PASSWORD')
                  setMessage('Code verified successfully. Enter your new password below.')
                }
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Could not verify code')
              } finally {
                helpers.setSubmitting(false)
              }
            }}
          >
            {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <FormInput
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="jamie@glucotwin.com"
                  value={values.email}
                  onChange={(value) => handleChange({ target: { name: 'email', value } })}
                  onBlur={handleBlur}
                  error={errors.email ? String(errors.email) : undefined}
                  touched={!!touched.email}
                />
                <FormInput
                  label="Verification code"
                  name="code"
                  type="text"
                  placeholder="123456"
                  value={values.code}
                  onChange={(value) => handleChange({ target: { name: 'code', value } })}
                  onBlur={handleBlur}
                  error={errors.code ? String(errors.code) : undefined}
                  touched={!!touched.code}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-14 w-full items-center justify-center rounded-3xl bg-gradient-to-r from-cyan-500 to-sky-600 px-5 text-base font-extrabold text-white shadow-[0_18px_40px_rgba(37,194,255,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(37,194,255,0.32)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Verifying…' : 'Verify code'}
                </button>
              </form>
            )}
          </Formik>
        )}

        {step === 'NEW_PASSWORD' && (
          <Formik
            initialValues={{ password: '', confirmPassword: '' }}
            validationSchema={newPasswordSchema}
            onSubmit={async (values, helpers) => {
              setError('')
              setMessage('')
              try {
                const result = await confirmPasswordReset(email, resetToken, values.password)
                setMessage(result.message || 'Password successfully reset.')
                setTimeout(() => {
                  navigate('/login')
                }, 2200)
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Could not reset password')
              } finally {
                helpers.setSubmitting(false)
              }
            }}
          >
            {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <FormInput
                  label="New password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={values.password}
                  onChange={(value) => handleChange({ target: { name: 'password', value } })}
                  onBlur={handleBlur}
                  error={errors.password ? String(errors.password) : undefined}
                  touched={!!touched.password}
                  showPasswordToggle
                  isPasswordVisible={false}
                  onTogglePassword={() => {}}
                />
                <FormInput
                  label="Confirm new password"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={values.confirmPassword}
                  onChange={(value) => handleChange({ target: { name: 'confirmPassword', value } })}
                  onBlur={handleBlur}
                  error={errors.confirmPassword ? String(errors.confirmPassword) : undefined}
                  touched={!!touched.confirmPassword}
                  showPasswordToggle
                  isPasswordVisible={false}
                  onTogglePassword={() => {}}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-14 w-full items-center justify-center rounded-3xl bg-gradient-to-r from-cyan-500 to-sky-600 px-5 text-base font-extrabold text-white shadow-[0_18px_40px_rgba(37,194,255,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(37,194,255,0.32)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Resetting…' : 'Reset password'}
                </button>
              </form>
            )}
          </Formik>
        )}

        {message && <p className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p>}
        {error && <p className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}

        <div className="grid gap-3 rounded-[1.75rem] border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">🔐</span>
            <div>
              <p className="font-semibold text-slate-900">Token validated reset</p>
              <p>Only the email owner can complete the password recovery flow.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link className="text-sm font-bold text-cyan-600 hover:text-cyan-800" to="/forgot-password">
            Resend code
          </Link>
          <Link className="text-sm font-bold text-slate-700 hover:text-slate-900" to="/login">
            Back to login
          </Link>
        </div>
      </motion.div>
    </AuthLayout>
  )
}
