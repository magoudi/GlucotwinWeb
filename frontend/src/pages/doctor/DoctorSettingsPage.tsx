import { DoctorLayout } from '../../layouts/DoctorLayout'
import { AppPageHeader } from '../../components/AppPageHeader'
import { useApiData } from '../../lib/api'
import { ApiStatePanel } from '../../components/ApiStatePanel'

export function DoctorSettingsPage() {
  const { data, error, loading } = useApiData<any>('/doctor/settings')

  return (
    <DoctorLayout>
      <AppPageHeader title="Doctor Settings" description="Manage your professional profile and notification preferences." />
      
      {loading ? (
         <div className="p-8 text-center text-slate-500">Loading settings...</div>
      ) : error ? (
         <ApiStatePanel error={error} />
      ) : (
        <div className="mt-8 max-w-2xl">
           <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-6 shadow-sm">
              
              <div className="flex items-center justify-between border-b border-gray-200 pb-6">
                 <div>
                    <h3 className="text-lg font-extrabold text-gray-900">Emergency Patient Alerts</h3>
                    <p className="mt-1 text-sm text-slate-500">Receive SMS or email when a patient logs critical hypoglycemia.</p>
                 </div>
                 <div className="relative inline-block w-12 h-6 rounded-full bg-cyan-500 cursor-pointer">
                    <span className="absolute left-[26px] top-1 w-4 h-4 rounded-full bg-white transition-all shadow"></span>
                 </div>
              </div>

              <div className="flex items-center justify-between">
                 <div>
                    <h3 className="text-lg font-extrabold text-gray-900">Interface Language</h3>
                    <p className="mt-1 text-sm text-slate-500">Preferred language for reports and clinical panel.</p>
                 </div>
                 <select className="rounded-lg bg-gray-50 border border-gray-200 text-gray-900 font-bold p-2 focus:outline-none focus:border-cyan-500" value={data?.data?.language || 'en'}>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                 </select>
              </div>

           </div>
        </div>
      )}
    </DoctorLayout>
  )
}
