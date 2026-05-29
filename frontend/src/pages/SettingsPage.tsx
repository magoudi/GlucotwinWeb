import { AppLayout } from '../layouts/AppLayout'
import { AppPageHeader } from '../components/AppPageHeader'
import { useApiData } from '../lib/api'
import { ApiStatePanel } from '../components/ApiStatePanel'

export function SettingsPage() {
  const { data, error, loading } = useApiData<any>('/patient/settings')

  return (
    <AppLayout>
      <AppPageHeader title="App Settings" description="Manage your notification preferences, language, and display units." />
      {loading ? (
         <div className="p-8 text-center text-slate-500">Loading settings...</div>
      ) : error ? (
         <ApiStatePanel error={error} />
      ) : (
        <div className="mt-8 max-w-2xl">
           <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-6 shadow-md">
              
              <div className="flex items-center justify-between border-b border-gray-200 pb-6">
                 <div>
                    <h3 className="text-lg font-extrabold text-gray-900">Push Notifications</h3>
                    <p className="mt-1 text-sm text-slate-500">Receive alerts for important predictions and doctor messages.</p>
                 </div>
                 <div className="relative inline-block w-12 h-6 rounded-full bg-cyan-500 cursor-pointer">
                    <span className="absolute left-[26px] top-1 w-4 h-4 rounded-full bg-white transition-all shadow"></span>
                 </div>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200 pb-6">
                 <div>
                    <h3 className="text-lg font-extrabold text-gray-900">Glucose Units</h3>
                    <p className="mt-1 text-sm text-slate-500">Current display unit for all charts and readings.</p>
                 </div>
                 <select className="rounded-lg bg-gray-50 border border-gray-200 text-gray-900 font-bold p-2 focus:outline-none focus:border-cyan-500" value={data?.data?.units}>
                    <option value="mg/dL">mg/dL</option>
                    <option value="mmol/L">mmol/L</option>
                 </select>
              </div>

              <div className="flex items-center justify-between">
                 <div>
                    <h3 className="text-lg font-extrabold text-gray-900">Language</h3>
                    <p className="mt-1 text-sm text-slate-500">Interface language.</p>
                 </div>
                 <select className="rounded-lg bg-gray-50 border border-gray-200 text-gray-900 font-bold p-2 focus:outline-none focus:border-cyan-500" value={data?.data?.language}>
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                 </select>
              </div>

           </div>
        </div>
      )}
    </AppLayout>
  )
}
