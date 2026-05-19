import { Formik } from 'formik'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import { FormInput } from '../components/FormInput'
import { AuthLayout } from '../layouts/AuthLayout'
import { createAccount } from '../lib/api'

const createAccountSchema = Yup.object({
  fullName: Yup.string().trim().min(2, 'Enter at least 2 characters').required('Full name is required'),
  email: Yup.string().trim().email('Enter a valid email').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must include a capital letter')
    .matches(/[a-z]/, 'Password must include a small letter')
    .matches(/[0-9]/, 'Password must include a number')
    .required('Password is required'),
  role: Yup.string().oneOf(['patient', 'doctor'], 'Select a valid role').required('Account type is required'),
  // Patient fields (conditional)
  diabetesType: Yup.string().when('role', { is: 'patient', then: (s) => s.optional(), otherwise: (s) => s.strip() }),
  managementType: Yup.string().when('role', { is: 'patient', then: (s) => s.optional(), otherwise: (s) => s.strip() }),
  glucoseUnit: Yup.string().when('role', { is: 'patient', then: (s) => s.optional(), otherwise: (s) => s.strip() }),
  // Doctor fields (conditional)
  specialty: Yup.string().when('role', { is: 'doctor', then: (s) => s.optional(), otherwise: (s) => s.strip() }),
  clinicName: Yup.string().when('role', { is: 'doctor', then: (s) => s.optional(), otherwise: (s) => s.strip() }),
  licenseNumber: Yup.string().when('role', { is: 'doctor', then: (s) => s.optional(), otherwise: (s) => s.strip() }),
})

export function CreateAccountPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  return (
    <AuthLayout
      heroTitle="Start with the data you already collect."
      heroDescription="Connect CGM, pump, and health data to create a personalized twin that learns safely over time."
      stats={[
        { value: 'CGM', label: 'Dexcom, Libre, Nightscout' },
        { value: 'Pump', label: 'Insulin logs and basal profile' },
      ]}
    >
      <h1 className="text-[clamp(2.5rem,4vw,3.5rem)] leading-none font-extrabold text-white">Create account</h1>
      <p className="mt-4 text-[clamp(1.125rem,1.6vw,1.5rem)] leading-8 font-medium text-slate-300 2xl:mt-8">Build your first GlucoTwin profile.</p>
      <Formik
        initialValues={{
          fullName: '',
          email: '',
          password: '',
          role: '' as 'patient' | 'doctor' | '',
          diabetesType: '',
          managementType: 'unknown',
          glucoseUnit: 'mg/dL',
          specialty: '',
          clinicName: '',
          licenseNumber: '',
        }}
        validationSchema={createAccountSchema}
        onSubmit={async (values, helpers) => {
          setError('')
          try {
            const user = await createAccount({
              fullName: values.fullName,
              email: values.email,
              password: values.password,
              role: values.role as 'patient' | 'doctor',
              ...(values.role === 'patient' ? {
                diabetesType: values.diabetesType,
                managementType: values.managementType,
                glucoseUnit: values.glucoseUnit,
              } : {}),
              ...(values.role === 'doctor' ? {
                specialty: values.specialty,
                clinicName: values.clinicName,
                licenseNumber: values.licenseNumber,
              } : {}),
            })
            // Task 3: Redirect by role
            if (user.role === 'doctor') {
              navigate('/doctor')
            } else {
              navigate('/dashboard')
            }
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Could not create account')
          } finally {
            helpers.setSubmitting(false)
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form className="mt-6 space-y-5 2xl:mt-8 2xl:space-y-6" onSubmit={handleSubmit}>
            <FormInput label="Full name" name="fullName" type="text" placeholder="Gluco Twin" value={values.fullName} onChange={(value) => handleChange({ target: { name: 'fullName', value } })} onBlur={handleBlur} error={errors.fullName} touched={touched.fullName} />
            <FormInput label="Email" name="email" type="email" placeholder="glucotwin@example.com" value={values.email} onChange={(value) => handleChange({ target: { name: 'email', value } })} onBlur={handleBlur} error={errors.email} touched={touched.email} />
            <FormInput label="Password" name="password" type="password" placeholder="Password" value={values.password} onChange={(value) => handleChange({ target: { name: 'password', value } })} onBlur={handleBlur} error={errors.password} touched={touched.password} />

            {/* Role Dropdown */}
            <div>
              <label className="mb-1.5 block text-sm font-extrabold text-slate-300" htmlFor="role">Account Type <span className="text-rose-400">*</span></label>
              <select
                id="role"
                name="role"
                value={values.role}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full rounded-xl border border-white/10 bg-[#0e1525] px-4 py-3 text-sm font-bold text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 appearance-none"
              >
                <option value="" disabled>Select your account type…</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
              {touched.role && errors.role && <p className="mt-1 text-xs font-bold text-rose-400">{errors.role}</p>}
            </div>

            {/* Patient-specific fields */}
            {values.role === 'patient' && (
              <div className="space-y-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">Clinical Profile (Optional)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-400" htmlFor="diabetesType">Diabetes Type</label>
                    <select id="diabetesType" name="diabetesType" value={values.diabetesType} onChange={handleChange} className="w-full rounded-lg border border-white/10 bg-[#0e1525] px-3 py-2 text-sm font-bold text-white outline-none focus:border-cyan-500/50 appearance-none">
                      <option value="">Not specified</option>
                      <option value="Type 1 Diabetes">Type 1</option>
                      <option value="Type 2 Diabetes">Type 2</option>
                      <option value="Gestational">Gestational</option>
                      <option value="LADA">LADA</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-400" htmlFor="managementType">Management</label>
                    <select id="managementType" name="managementType" value={values.managementType} onChange={handleChange} className="w-full rounded-lg border border-white/10 bg-[#0e1525] px-3 py-2 text-sm font-bold text-white outline-none focus:border-cyan-500/50 appearance-none">
                      <option value="unknown">Not specified</option>
                      <option value="pump">Insulin Pump</option>
                      <option value="injections">Injections</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-400" htmlFor="glucoseUnit">Glucose Unit</label>
                  <select id="glucoseUnit" name="glucoseUnit" value={values.glucoseUnit} onChange={handleChange} className="w-full rounded-lg border border-white/10 bg-[#0e1525] px-3 py-2 text-sm font-bold text-white outline-none focus:border-cyan-500/50 appearance-none">
                    <option value="mg/dL">mg/dL</option>
                    <option value="mmol/L">mmol/L</option>
                  </select>
                </div>
              </div>
            )}

            {/* Doctor-specific fields */}
            {values.role === 'doctor' && (
              <div className="space-y-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-blue-400">Doctor Profile (Optional)</p>
                <FormInput label="Specialty" name="specialty" type="text" placeholder="e.g. Endocrinology" value={values.specialty} onChange={(value) => handleChange({ target: { name: 'specialty', value } })} onBlur={handleBlur} error={errors.specialty} touched={touched.specialty} />
                <FormInput label="Clinic Name" name="clinicName" type="text" placeholder="e.g. GlucoTwin Clinic" value={values.clinicName} onChange={(value) => handleChange({ target: { name: 'clinicName', value } })} onBlur={handleBlur} error={errors.clinicName} touched={touched.clinicName} />
                <FormInput label="License Number" name="licenseNumber" type="text" placeholder="e.g. DOC-12345" value={values.licenseNumber} onChange={(value) => handleChange({ target: { name: 'licenseNumber', value } })} onBlur={handleBlur} error={errors.licenseNumber} touched={touched.licenseNumber} />
              </div>
            )}

            {error && <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-base font-bold text-rose-400">{error}</p>}
            <button className="mt-2 h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 text-base font-extrabold text-white shadow-md transition-all hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(37,194,160,0.4)] disabled:cursor-not-allowed disabled:opacity-60 2xl:h-[68px] 2xl:text-[20px]" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create secure account'}
            </button>
          </form>
        )}
      </Formik>
      <p className="mt-6 text-center text-base font-medium text-slate-400 2xl:mt-9 2xl:text-[18px]">
        Already have an account?{' '}
        <Link className="text-slate-300 hover:text-white" to="/login">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}
