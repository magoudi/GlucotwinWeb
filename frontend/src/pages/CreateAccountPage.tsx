import { useState } from 'react'
import { Formik } from 'formik'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as Yup from 'yup'
import { FormInput } from '../components/FormInput'
import { AuthLayout } from '../layouts/AuthLayout'
import { createAccount } from '../lib/api'

type CreateAccountValues = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  role: 'patient' | 'doctor' | 'researcher' | ''
  diabetesType: string
  managementType: 'unknown' | 'pump' | 'injections'
  glucoseUnit: 'mg/dL' | 'mmol/L'
  specialty: string
  clinicName: string
  licenseNumber: string
  agreeToTerms: boolean
}

const createAccountSchema = (currentStep: number) => {
  const stepOne = Yup.object({
    fullName: Yup.string().trim().min(2, 'Enter at least 2 characters').required('Full name is required'),
    email: Yup.string().trim().email('Enter a valid email').required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/[A-Z]/, 'Password must include a capital letter')
      .matches(/[a-z]/, 'Password must include a small letter')
      .matches(/[0-9]/, 'Password must include a number')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
  })

  if (currentStep === 1) {
    return stepOne
  }

  const stepTwo = stepOne.shape({
    role: Yup.string().oneOf(['patient', 'doctor', 'researcher'], 'Select a valid role').required('Account type is required'),
  })

  if (currentStep === 2) {
    return stepTwo
  }

  return stepTwo.shape({
    agreeToTerms: Yup.boolean().oneOf([true], 'You must agree to the terms and privacy policy'),
    diabetesType: Yup.string().when('role', {
      is: 'patient',
      then: (s) => s.optional(),
      otherwise: (s) => s.strip(),
    }),
    managementType: Yup.string().when('role', {
      is: 'patient',
      then: (s) => s.optional(),
      otherwise: (s) => s.strip(),
    }),
    glucoseUnit: Yup.string().when('role', {
      is: 'patient',
      then: (s) => s.optional(),
      otherwise: (s) => s.strip(),
    }),
    specialty: Yup.string().when('role', {
      is: 'doctor',
      then: (s) => s.optional(),
      otherwise: (s) => s.strip(),
    }),
    clinicName: Yup.string().when('role', {
      is: 'doctor',
      then: (s) => s.optional(),
      otherwise: (s) => s.strip(),
    }),
    licenseNumber: Yup.string().when('role', {
      is: 'doctor',
      then: (s) => s.optional(),
      otherwise: (s) => s.strip(),
    }),
  })
}

const roleCards = [
  {
    value: 'patient',
    title: 'Patient',
    description: 'Personalized glucose digital twin for daily care and meal planning.',
  },
  {
    value: 'doctor',
    title: 'Doctor',
    description: 'Clinical oversight with AI-assisted treatment review and patient collaboration.',
  },
  {
    value: 'researcher',
    title: 'Researcher',
    description: 'Secure research access to simulated healthcare forecasts and analysis.',
  },
] as const

function scorePassword(password: string) {
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  if (score <= 2) return { label: 'Weak', color: 'bg-rose-400', width: 'w-1/4' }
  if (score === 3) return { label: 'Fair', color: 'bg-amber-400', width: 'w-1/2' }
  if (score === 4) return { label: 'Strong', color: 'bg-cyan-400', width: 'w-3/4' }
  return { label: 'Excellent', color: 'bg-cyan-600', width: 'w-full' }
}

export function CreateAccountPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <AuthLayout
      heroTitle="Launch your premium GlucoTwin access"
      heroDescription="Create a protected account with role-based onboarding for patients, doctors and researchers."
      stats={[
        { value: 'Secure', label: 'HIPAA-style data protection' },
        { value: 'Intelligent', label: 'Clinical AI assistance' },
      ]}
    >
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -26 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="space-y-7"
      >
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-500">Create account</p>
          <h1 className="text-[clamp(2.5rem,4vw,3.5rem)] leading-tight font-extrabold text-[#111111]">
            Build your GlucoTwin identity
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[#555555]">
            Secure login, role-based onboarding, and fast startup for the care workflows that matter.
          </p>
        </div>

        <div className="grid gap-3 rounded-[1.75rem] border border-slate-200/80 bg-[#f8fbff] p-5 text-sm text-slate-600 shadow-sm sm:grid-cols-2">
          <div>
            <p className="font-semibold text-slate-900">Step {currentStep} of 3</p>
            <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-400">Progress</p>
          </div>
          <div className="rounded-3xl border border-slate-300/80 bg-white p-4">
            <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              <span>Account readiness</span>
              <span>{currentStep * 33}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div className={`h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 ${currentStep === 1 ? 'w-1/3' : currentStep === 2 ? 'w-2/3' : 'w-full'}`} />
            </div>
          </div>
        </div>

        <Formik
          initialValues={{
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: '' as CreateAccountValues['role'],
            diabetesType: '',
            managementType: 'unknown',
            glucoseUnit: 'mg/dL',
            specialty: '',
            clinicName: '',
            licenseNumber: '',
            agreeToTerms: false,
          }}
          validationSchema={createAccountSchema(currentStep)}
          enableReinitialize
          onSubmit={async (values, helpers) => {
            setError('')
            if (currentStep < 3) {
              setCurrentStep((step) => step + 1)
              helpers.setTouched({})
              helpers.setSubmitting(false)
              return
            }

            try {
              const role = values.role as 'patient' | 'doctor' | 'researcher'

              await createAccount({
                fullName: values.fullName,
                email: values.email,
                password: values.password,
                role,
                diabetesType: values.role === 'patient' ? values.diabetesType : undefined,
                managementType: values.role === 'patient' ? values.managementType : undefined,
                glucoseUnit: values.role === 'patient' ? values.glucoseUnit : undefined,
                specialty: values.role === 'doctor' ? values.specialty : undefined,
                clinicName: values.role === 'doctor' ? values.clinicName : undefined,
                licenseNumber: values.role === 'doctor' ? values.licenseNumber : undefined,
              })
              navigate('/verify-email', { state: { email: values.email } })
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Could not create account')
            } finally {
              helpers.setSubmitting(false)
            }
          }}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => {
            const passwordMeta = scorePassword(values.password)
            return (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <FormInput
                      label="Full name"
                      name="fullName"
                      type="text"
                      placeholder="Jamie Adams"
                      value={values.fullName}
                      onChange={(value) => handleChange({ target: { name: 'fullName', value } })}
                      onBlur={handleBlur}
                      error={errors.fullName}
                      touched={touched.fullName}
                    />
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
                    <FormInput
                      label="Password"
                      name="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={values.password}
                      onChange={(value) => handleChange({ target: { name: 'password', value } })}
                      onBlur={handleBlur}
                      error={errors.password}
                      touched={touched.password}
                      showPasswordToggle
                      isPasswordVisible={showPassword}
                      onTogglePassword={() => setShowPassword((visible) => !visible)}
                    />
                    <FormInput
                      label="Confirm password"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={values.confirmPassword}
                      onChange={(value) => handleChange({ target: { name: 'confirmPassword', value } })}
                      onBlur={handleBlur}
                      error={errors.confirmPassword}
                      touched={touched.confirmPassword}
                      showPasswordToggle
                      isPasswordVisible={showPassword}
                      onTogglePassword={() => setShowPassword((visible) => !visible)}
                    />
                    <div className="rounded-3xl border border-slate-200 bg-white p-4">
                      <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-600">
                        <span>Password strength</span>
                        <span className="text-slate-500">{passwordMeta.label}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200">
                        <div className={`${passwordMeta.width} h-full rounded-full ${passwordMeta.color}`} />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-500">Select your role</p>
                      <p className="text-base leading-7 text-[#555555]">
                        Choose the role that fits your care and research workflow.
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {roleCards.map((card) => {
                        const selected = values.role === card.value
                        return (
                          <button
                            key={card.value}
                            type="button"
                            onClick={() => handleChange({ target: { name: 'role', value: card.value } })}
                            className={`group flex h-full flex-col justify-between rounded-[1.75rem] border p-5 text-left transition-shadow ${
                              selected
                                ? 'border-cyan-500 bg-cyan-50 shadow-[0_20px_50px_rgba(37,194,255,0.15)]'
                                : 'border-slate-200 bg-white hover:border-cyan-300 hover:shadow-sm'
                            }`}
                          >
                            <div>
                              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-100 text-cyan-700">
                                {card.title.charAt(0)}
                              </div>
                              <h2 className="text-lg font-bold text-slate-900">{card.title}</h2>
                              <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
                            </div>
                            {selected && <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-cyan-600 px-3 py-2 text-sm font-bold text-white">Selected</span>}
                          </button>
                        )
                      })}
                    </div>
                    {touched.role && errors.role && <p className="text-sm font-semibold text-rose-500">{errors.role}</p>}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-5">
                    <div className="rounded-[2rem] border border-slate-200/80 bg-[#f8fbff] p-5">
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-500">Terms & trust</p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        I agree to the GlucoTwin privacy policy and terms of service.
                      </p>
                      <label className="mt-5 flex items-center gap-3 text-sm font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          name="agreeToTerms"
                          checked={values.agreeToTerms}
                          onChange={(event) => handleChange({ target: { name: 'agreeToTerms', value: event.target.checked } })}
                          className="h-5 w-5 rounded border border-slate-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        I agree to terms and privacy policy
                      </label>
                      {touched.agreeToTerms && errors.agreeToTerms && (
                        <p className="mt-3 text-sm font-semibold text-rose-500">{errors.agreeToTerms}</p>
                      )}
                    </div>
                    <div className="grid gap-3 rounded-[1.75rem] border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">
                      <div className="flex items-start gap-3">
                        <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">✓</span>
                        <div>
                          <p className="font-semibold text-slate-900">Clinically safe AI assistance</p>
                          <p>Every recommendation is backed by a simulated safety check before it reaches you.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">🔒</span>
                        <div>
                          <p className="font-semibold text-slate-900">Protected healthcare data</p>
                          <p>End-to-end encrypted storage and access for sensitive medical signals.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <p className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {error}
                  </p>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    className="inline-flex h-14 items-center justify-center rounded-3xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-slate-900"
                    onClick={() => setCurrentStep((step) => Math.max(1, step - 1))}
                    disabled={currentStep === 1}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="inline-flex h-14 items-center justify-center rounded-3xl bg-gradient-to-r from-cyan-500 to-sky-600 px-5 text-sm font-extrabold text-white shadow-[0_18px_40px_rgba(37,194,255,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(37,194,255,0.32)] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isSubmitting}
                  >
                    {currentStep < 3 ? 'Continue' : isSubmitting ? 'Creating…' : 'Create account'}
                  </button>
                </div>
              </form>
            )
          }}
        </Formik>

        <p className="text-center text-sm font-medium text-slate-600">
          Already registered?{' '}
          <Link className="text-cyan-600 font-bold hover:text-cyan-800" to="/login">
            Log in instead
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}
