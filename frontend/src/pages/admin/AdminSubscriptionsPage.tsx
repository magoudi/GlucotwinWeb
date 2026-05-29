import { AdminLayout } from '../../layouts/AdminLayout'
import { AppPageHeader } from '../../components/AppPageHeader'
import { useApiData } from '../../lib/api'
import { ApiStatePanel } from '../../components/ApiStatePanel'

export function AdminSubscriptionsPage() {
  const { data, error, loading } = useApiData<any>('/admin/subscriptions')

  return (
    <AdminLayout>
      <AppPageHeader title="Subscriptions" description="Manage patient and clinic subscriptions." />
      
      {loading ? (
         <div className="p-8 text-center text-slate-500">Loading subscriptions...</div>
      ) : error ? (
         <ApiStatePanel error={error} />
      ) : (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-md">
           <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-gray-50 text-xs uppercase text-slate-500 border-b border-gray-200">
                 <tr>
                    <th className="px-6 py-4 font-extrabold">User ID</th>
                    <th className="px-6 py-4 font-extrabold">Plan</th>
                    <th className="px-6 py-4 font-extrabold">Status</th>
                    <th className="px-6 py-4 font-extrabold">Renews At</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {data?.data?.length === 0 ? (
                    <tr>
                       <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No subscriptions found.</td>
                    </tr>
                 ) : data?.data?.map((sub: any) => (
                    <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                       <td className="px-6 py-4 font-mono text-xs">{sub.userId}</td>
                       <td className="px-6 py-4 font-bold text-gray-900 capitalize">{sub.planId}</td>
                       <td className="px-6 py-4">
                         <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold uppercase tracking-widest ${sub.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                           {sub.status}
                         </span>
                       </td>
                       <td className="px-6 py-4">{new Date(sub.currentPeriodEnd).toLocaleDateString()}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
    </AdminLayout>
  )
}
