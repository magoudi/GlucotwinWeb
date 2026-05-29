import { AdminLayout } from '../../layouts/AdminLayout'
import { AppPageHeader } from '../../components/AppPageHeader'
import { useApiData } from '../../lib/api'
import { ApiStatePanel } from '../../components/ApiStatePanel'

export function AdminPaymentsPage() {
  const { data, error, loading } = useApiData<any>('/admin/payments')

  return (
    <AdminLayout>
      <AppPageHeader title="Payment History" description="Audit log of Stripe and manual transactions." />
      
      {loading ? (
         <div className="p-8 text-center text-slate-500">Loading payments...</div>
      ) : error ? (
         <ApiStatePanel error={error} />
      ) : (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-md">
           <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-gray-50 text-xs uppercase text-slate-500 border-b border-gray-200">
                 <tr>
                    <th className="px-6 py-4 font-extrabold">Txn ID</th>
                    <th className="px-6 py-4 font-extrabold">Amount</th>
                    <th className="px-6 py-4 font-extrabold">Status</th>
                    <th className="px-6 py-4 font-extrabold">Date</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {data?.data?.length === 0 ? (
                    <tr>
                       <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No payment records found.</td>
                    </tr>
                 ) : data?.data?.map((payment: any) => (
                    <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                       <td className="px-6 py-4 font-mono text-xs">{payment.stripePaymentId}</td>
                       <td className="px-6 py-4 font-bold text-emerald-600">${(payment.amount / 100).toFixed(2)}</td>
                       <td className="px-6 py-4 capitalize font-bold text-gray-900">{payment.status}</td>
                       <td className="px-6 py-4">{new Date(payment.createdAt).toLocaleString()}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
    </AdminLayout>
  )
}
