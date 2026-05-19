import { Formik } from 'formik'
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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
      // It's helpful but not strictly required to redirect. They can manually enter it.
      // We will leave the email input accessible if they landed here manually.
    }
  }, [initialEmail, step])

  return (
    <AuthLayout
      heroTitle="Set your new password."
      heroDescription="Password recovery is designed for protected health data: clear, calm, and secure."
      stats={[
        { value: 'Encrypted', label: 'Health data remains protected' },
        { value: 'Fast', label: 'Return to dashboard quickly' },
      ]}
    >
      <h1 className="max-w-[380px] text-[clamp(2.5rem,4vw,3.5rem)] leading-[1.08] font-extrabold text-white">
        {step === 'VERIFY_CODE' ? 'Verify Code' : 'Reset password'}
      </h1>
      <p className="mt-4 max-w-[420px] text-[clamp(1.125rem,1.6vw,1.5rem)] leading-[1.42] font-medium text-slate-300 2xl:mt-6">
        {step === 'VERIFY_CODE' 
          ? 'Enter the 6-digit code sent to your email.' 
          : 'Enter a strong new password to regain access to your account.'}
      </p>

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
                setMessage('Code verified successfully. Please enter your new password.')
              }
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Could not verify code')
            } finally {
              helpers.setSubmitting(false)
            }
          }}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
            <form className="mt-6 space-y-5 2xl:mt-7 2xl:space-y-7" onSubmit={handleSubmit}>
              <FormInput
                label="Email"
                name="email"
                type="email"
                placeholder="glucotwin@example.com"
                value={values.email}
                onChange={(value) => handleChange({ target: { name: 'email', value } })}
                onBlur={handleBlur}
                error={errors.email}
                touched={touched.email}
              />
              <FormInput
                label="Verification Code"
                name="code"
                type="text"
                placeholder="123456"
                value={values.code}
                onChange={(value) => handleChange({ target: { name: 'code', value } })}
                onBlur={handleBlur}
                error={errors.code}
                touched={touched.code}
              />
              <button 
                className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 text-base font-extrabold text-white shadow-md transition-all hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(37,194,160,0.4)] disabled:cursor-not-allowed disabled:opacity-60 2xl:h-[68px] 2xl:text-[20px]" 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verifying...' : 'Verify Code'}
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
              }, 3000)
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Could not reset password')
            } finally {
              helpers.setSubmitting(false)
            }
          }}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
            <form className="mt-6 space-y-5 2xl:mt-7 2xl:space-y-7" onSubmit={handleSubmit}>
              <FormInput
                label="New Password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={values.password}
                onChange={(value) => handleChange({ target: { name: 'password', value } })}
                onBlur={handleBlur}
                error={errors.password}
                touched={touched.password}
              />
              <FormInput
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={values.confirmPassword}
                onChange={(value) => handleChange({ target: { name: 'confirmPassword', value } })}
                onBlur={handleBlur}
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
              />
              <button 
                className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 text-base font-extrabold text-white shadow-md transition-all hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(37,194,160,0.4)] disabled:cursor-not-allowed disabled:opacity-60 2xl:h-[68px] 2xl:text-[20px]" 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Resetting...' : 'Set new password'}
              </button>
            </form>
          )}
        </Formik>
      )}

      {message && <p className="mt-4 text-center text-base font-extrabold text-emerald-400">{message}</p>}
      {error && <p className="mt-4 text-center text-base font-extrabold text-rose-400">{error}</p>}
      
      <div className="mt-6 text-center 2xl:mt-9">
        <Link className="block text-base font-medium text-slate-300 hover:text-white 2xl:text-[18px]" to="/login">
          Back to login
        </Link>
        {step === 'VERIFY_CODE' && (
          <Link className="mt-2 block text-sm font-medium text-slate-400 hover:text-white" to="/forgot-password">
            Request a new code
          </Link>
        )}
      </div>
    </AuthLayout>
  )
}
