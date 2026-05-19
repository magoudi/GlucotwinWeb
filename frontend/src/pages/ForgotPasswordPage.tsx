import { Formik } from 'formik'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
      heroTitle="Reset access without interrupting care."
      heroDescription="Password recovery is designed for protected health data: clear, calm, and secure."
      stats={[
        { value: 'Encrypted', label: 'Health data remains protected' },
        { value: 'Fast', label: 'Return to dashboard quickly' },
      ]}
    >
      <h1 className="max-w-[380px] text-[clamp(2.5rem,4vw,3.5rem)] leading-[1.08] font-extrabold text-white">Forgot password?</h1>
      <p className="mt-4 max-w-[420px] text-[clamp(1.125rem,1.6vw,1.5rem)] leading-[1.42] font-medium text-slate-300 2xl:mt-6">
        Enter your email and we&apos;ll send a secure reset link.
      </p>
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
            <button className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 text-base font-extrabold text-white shadow-md transition-all hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(37,194,160,0.4)] disabled:cursor-not-allowed disabled:opacity-60 2xl:h-[68px] 2xl:text-[20px]" type="submit" disabled={isSubmitting}>
              Send reset link
            </button>
          </form>
        )}
      </Formik>
      {message && <p className="mt-4 text-center text-base font-extrabold text-emerald-400">{message}</p>}
      {error && <p className="mt-4 text-center text-base font-extrabold text-rose-400">{error}</p>}
      <Link className="mt-6 block text-center text-base font-medium text-slate-300 hover:text-white 2xl:mt-9 2xl:text-[18px]" to="/login">
        Back to login
      </Link>
    </AuthLayout>
  )
}
