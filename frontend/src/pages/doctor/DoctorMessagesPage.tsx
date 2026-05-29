import { DoctorLayout } from '../../layouts/DoctorLayout'
import { AppPageHeader } from '../../components/AppPageHeader'
import { ApiStatePanel } from '../../components/ApiStatePanel'
import { useApiData } from '../../lib/api'

export function DoctorMessagesPage() {
  const { data, error, loading } = useApiData<any>('/doctor/messages')

  return (
    <DoctorLayout>
      <AppPageHeader title="Secure Messages" description="Communicate with your assigned patients directly." action="New Message" onAction={() => {}} />
      
      {loading ? (
         <div className="p-8 text-center text-slate-500">Loading messages...</div>
      ) : error ? (
         <ApiStatePanel error={error} />
      ) : (
        <div className="mt-8 grid gap-4">
           {data?.data?.length === 0 ? (
             <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-slate-500">No messages in your inbox.</div>
           ) : data?.data?.map((msg: any) => (
             <div key={msg._id} className="rounded-xl border border-gray-200 bg-gray-50/40 p-5 shadow-lg">
               <p className="text-sm text-slate-600">{msg.body}</p>
               <div className="mt-3 text-xs font-bold text-slate-500">{new Date(msg.createdAt).toLocaleString()}</div>
             </div>
           ))}
        </div>
      )}
    </DoctorLayout>
  )
}
