import { Formik } from 'formik'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as Yup from 'yup'
import { FormInput } from '../components/FormInput'
import { AuthLayout } from '../layouts/AuthLayout'
import { requestPasswordResetCode } from '../lib/api'

const forgotPasswordSchema = Yup.object({
  email: Yup.string().trim().email('Enter a valid email').required('Email is required'),
})

export function ForgotPasswordPage() {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  return (
    <AuthLayout
      heroTitle="Recover access with secure reset"
      heroDescription="Password recovery is tailored for protected health journeys and AI-powered continuity."
      stats={[
        { value: 'Encrypted', label: 'Health data remains protected' },
        { value: 'Fast', label: 'Reset link in seconds' },
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
            Forgot password?
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[#555555]">
            Send a secure reset link to your email and regain access to your GlucoTwin account.
          </p>
        </div>

        <Formik
          initialValues={{ email: '' }}
          validationSchema={forgotPasswordSchema}
          onSubmit={async (values, helpers) => {
            setError('')
            setMessage('')
            try {
              await requestPasswordResetCode(values.email)
              navigate('/reset-password', { state: { email: values.email } })
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Could not process request')
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
                error={errors.email}
                touched={touched.email}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-14 w-full items-center justify-center rounded-3xl bg-gradient-to-r from-cyan-500 to-sky-600 px-5 text-base font-extrabold text-white shadow-[0_18px_40px_rgba(37,194,255,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(37,194,255,0.32)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}
        </Formik>

        {message && <p className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p>}
        {error && <p className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}

        <div className="grid gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">🔒</span>
            <div>
              <p className="font-semibold text-slate-900">Protected reset flow</p>
              <p>All email reset operations are handled within a secure healthcare workflow.</p>
            </div>
          </div>
        </div>

        <Link className="block text-center text-sm font-bold text-cyan-600 hover:text-cyan-800" to="/login">
          Back to login
        </Link>
      </motion.div>
    </AuthLayout>
  )
}
