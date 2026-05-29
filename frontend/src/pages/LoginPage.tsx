import { Formik } from 'formik'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as Yup from 'yup'
import { FormInput } from '../components/FormInput'
import { AuthLayout } from '../layouts/AuthLayout'
import { login } from '../lib/api'

type LoginLocationState = {
  from?: string
}

const loginSchema = Yup.object({
  identifier: Yup.string().trim().required('Email or username is required'),
  password: Yup.string().required('Password is required'),
})

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as LoginLocationState | null)?.from
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const loginFailureText =
    error || 'Enter your secure GlucoTwin credentials to continue.'

  return (
    <AuthLayout
      heroTitle="Secure access for healthcare teams and patients"
      heroDescription="Log in to your GlucoTwin workspace with premium privacy, smart alerts, and clinical-grade forecasting."
      stats={[
        { value: 'HIPAA-ready', label: 'Protected healthcare data' },
        { value: '24/7', label: 'Continuous care availability' },
      ]}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -24 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="space-y-6"
      >
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Welcome back</p>
          <h1 className="text-[clamp(2.5rem,4vw,3.5rem)] leading-tight font-extrabold text-white">
            Log in to GlucoTwin
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-300">
            Access treatment simulation, glucose forecasts, and care communication with your trusted AI companion.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-slate-700 bg-slate-950/80 p-4 text-sm text-slate-300 shadow-sm">
          <p className="font-semibold text-white">Quick access</p>
          <p className="mt-2">{loginFailureText}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="inline-flex h-12 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50"
            onClick={() => setError('Google sign-in is not configured yet.')}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">G</span>
            Continue with Google
          </button>
          <button
            type="button"
            className="inline-flex h-12 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
            onClick={() => setError('Apple sign-in is not configured yet.')}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-950 text-white"></span>
            Continue with Apple
          </button>
        </div>

        <div className="relative text-center text-xs uppercase tracking-[0.32em] text-slate-400 after:absolute after:left-1/2 after:top-1/2 after:h-px after:w-24 after:-translate-x-1/2 after:bg-slate-300">
          <span className="relative bg-white px-3">Or sign in with email</span>
        </div>

        <Formik
          initialValues={{ identifier: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={async (values, helpers) => {
            setError('')

            try {
              const user = await login(values)
              const fallbackDestination =
                user.role === 'admin'
                  ? '/admin'
                  : user.role === 'doctor'
                    ? '/doctor'
                    : '/dashboard'

              const shouldUseFrom =
                from &&
                from !== '/login' &&
                !(user.role === 'admin' && !from.startsWith('/admin')) &&
                !(user.role === 'doctor' && !from.startsWith('/doctor'))

              navigate(shouldUseFrom ? from : fallbackDestination, { replace: true })
            } catch (error) {
              setError(error instanceof Error ? error.message : 'Could not log in')
            } finally {
              helpers.setSubmitting(false)
            }
          }}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <FormInput
                label="Email or username"
                name="identifier"
                type="text"
                placeholder="example@glucotwin.com"
                value={values.identifier}
                onChange={(value) => handleChange({ target: { name: 'identifier', value } })}
                onBlur={handleBlur}
                error={errors.identifier}
                touched={touched.identifier}
              />
              <FormInput
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={values.password}
                onChange={(value) => handleChange({ target: { name: 'password', value } })}
                onBlur={handleBlur}
                error={errors.password}
                touched={touched.password}
                showPasswordToggle
                isPasswordVisible={showPassword}
                onTogglePassword={() => setShowPassword((visible) => !visible)}
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe((checked) => !checked)}
                    className="h-4 w-4 rounded border border-slate-300 text-cyan-500 focus:ring-cyan-400"
                  />
                  Remember me
                </label>
                <Link className="text-sm font-semibold text-cyan-600 transition hover:text-cyan-800" to="/forgot-password">
                  Forgot password?
                </Link>
              </div>
              {error && (
                <p className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-14 w-full items-center justify-center rounded-3xl bg-gradient-to-r from-cyan-500 to-sky-600 px-5 text-base font-extrabold text-white shadow-[0_18px_40px_rgba(37,194,255,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(37,194,255,0.32)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Signing in…' : 'Sign in securely'}
              </button>
            </form>
          )}
        </Formik>

        <p className="text-center text-sm font-medium text-slate-600">
          New to GlucoTwin?{' '}
          <Link className="text-cyan-600 font-bold hover:text-cyan-800" to="/create-account">
            Create an account
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}
