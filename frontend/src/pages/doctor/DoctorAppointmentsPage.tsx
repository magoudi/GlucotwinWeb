import { DoctorLayout } from '../../layouts/DoctorLayout'
import { AppPageHeader } from '../../components/AppPageHeader'
import { ApiStatePanel } from '../../components/ApiStatePanel'
import { useApiData } from '../../lib/api'

export function DoctorAppointmentsPage() {
  const { data, error, loading } = useApiData<any>('/doctor/appointments')

  return (
    <DoctorLayout>
      <AppPageHeader title="Appointments" description="Manage patient consultations and follow-ups." action="Schedule New" onAction={() => {}} />
      
      {loading ? (
         <div className="p-8 text-center text-slate-500">Loading appointments...</div>
      ) : error ? (
         <ApiStatePanel error={error} />
      ) : (
        <div className="mt-8 grid gap-4">
           {data?.data?.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-slate-500">No upcoming appointments.</div>
           ) : data?.data?.map((apt: any) => (
              <div key={apt._id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex justify-between items-center">
               <div>
                 <p className="text-lg font-bold text-gray-900">{new Date(apt.scheduledAt).toLocaleDateString()} at {new Date(apt.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                 <p className="mt-1 text-sm text-cyan-600 font-bold uppercase tracking-widest">{apt.status}</p>
               </div>
                <button className="rounded-lg bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-700 hover:bg-cyan-100 border border-cyan-200">Edit</button>
             </div>
           ))}
        </div>
      )}
    </DoctorLayout>
  )
}
