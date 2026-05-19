import { Formik } from 'formik'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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

  return (
    <AuthLayout>
      <h1 className="text-[clamp(2.5rem,4vw,3.5rem)] leading-none font-extrabold text-white">
        Log in
      </h1>
      <p className="mt-4 text-[clamp(1.125rem,1.6vw,1.5rem)] leading-8 font-medium text-slate-300 2xl:mt-8">
        Access your GlucoTwin dashboard with your email or username.
      </p>
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

            // Only honour the saved `from` if it makes sense for the user's role.
            // e.g. an admin should never land on /dashboard after login.
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
          <form
            className="mt-6 space-y-5 2xl:mt-8 2xl:space-y-6"
            onSubmit={handleSubmit}
          >
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
              placeholder="Password"
              value={values.password}
              onChange={(value) => handleChange({ target: { name: 'password', value } })}
              onBlur={handleBlur}
              error={errors.password}
              touched={touched.password}
            />
            <div className="flex items-center justify-between gap-4 text-base font-extrabold text-emerald-400 2xl:text-[19px]">
              <label className="flex items-center gap-3">
                <input className="sr-only" type="checkbox" defaultChecked />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
            {error && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-base font-bold text-rose-400">
                {error}
              </p>
            )}
            <button
              className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 text-base font-extrabold text-white shadow-md transition-all hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(37,194,160,0.4)] disabled:cursor-not-allowed disabled:opacity-60 2xl:h-[68px] 2xl:text-[20px]"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>
        )}
      </Formik>
      <p className="mt-6 text-center text-base font-medium text-slate-400 2xl:mt-9 2xl:text-[18px]">
        New to GlucoTwin?{' '}
        <Link className="text-slate-300 hover:text-white" to="/create-account">
          Create account
        </Link>
      </p>
    </AuthLayout>
  )
}
