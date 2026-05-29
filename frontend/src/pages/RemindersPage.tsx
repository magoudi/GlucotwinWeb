import { AppLayout } from '../layouts/AppLayout'
import { AppPageHeader } from '../components/AppPageHeader'
import { ApiStatePanel } from '../components/ApiStatePanel'
import { useApiData } from '../lib/api'

export function RemindersPage() {
  const { data, error, loading } = useApiData<any>('/patient/reminders')

  return (
    <AppLayout>
      <AppPageHeader title="Medication & Checks Reminders" description="Manage your schedules for insulin, glucose checks, and meals." action="Add Reminder" onAction={() => {}} />
      {loading ? (
         <div className="p-8 text-center text-slate-500">Loading reminders...</div>
      ) : error ? (
         <ApiStatePanel error={error} />
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
           {data?.data?.length === 0 ? (
             <div className="col-span-full rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center text-slate-500">No reminders setup yet.</div>
           ) : data?.data?.map((reminder: any) => (
             <div key={reminder._id} className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
               <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900 capitalize">{reminder.title}</h3>
                    <p className="mt-2 inline-block rounded border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-xs font-extrabold tracking-widest text-cyan-700 uppercase">
                      {reminder.type.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-gray-900">{new Date(reminder.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div className="mt-1 text-xs font-bold text-slate-500 capitalize text-right">{reminder.repeatRule || 'Once'}</div>
                  </div>
               </div>
             </div>
           ))}
        </div>
      )}
    </AppLayout>
  )
}
