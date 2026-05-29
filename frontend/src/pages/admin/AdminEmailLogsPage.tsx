import { AdminLayout } from '../../layouts/AdminLayout'
import { AppPageHeader } from '../../components/AppPageHeader'
import { useApiData } from '../../lib/api'
import { ApiStatePanel } from '../../components/ApiStatePanel'

export function AdminEmailLogsPage() {
  const { data, error, loading } = useApiData<any>('/admin/email-logs')

  return (
    <AdminLayout>
      <AppPageHeader title="Email Delivery Logs" description="Monitor Resend email status and deliverability." />
      
      {loading ? (
         <div className="p-8 text-center text-slate-500">Loading email logs...</div>
      ) : error ? (
         <ApiStatePanel error={error} />
      ) : (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-md">
           <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-gray-50 text-xs uppercase text-slate-500 border-b border-gray-200">
                 <tr>
                    <th className="px-6 py-4 font-extrabold">Recipient</th>
                    <th className="px-6 py-4 font-extrabold">Subject</th>
                    <th className="px-6 py-4 font-extrabold">Provider</th>
                    <th className="px-6 py-4 font-extrabold">Status</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {data?.data?.length === 0 ? (
                    <tr>
                       <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No email logs found.</td>
                    </tr>
                 ) : data?.data?.map((log: any) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                       <td className="px-6 py-4 text-gray-900 font-bold">{log.to}</td>
                       <td className="px-6 py-4">{log.subject}</td>
                       <td className="px-6 py-4 capitalize">{log.provider}</td>
                       <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold uppercase tracking-widest text-emerald-700">
                            {log.status}
                          </span>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
    </AdminLayout>
  )
}
