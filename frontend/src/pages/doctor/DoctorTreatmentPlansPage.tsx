import { useParams } from 'react-router-dom'
import { DoctorLayout } from '../../layouts/DoctorLayout'
import { AppPageHeader } from '../../components/AppPageHeader'
import { ApiStatePanel } from '../../components/ApiStatePanel'
import { useApiData, apiRequest } from '../../lib/api'
import { useState } from 'react'

export function DoctorTreatmentPlansPage() {
  const { id } = useParams()
  const { data, error, loading } = useApiData<any>(`/doctor/patients/${id}/treatment-plans`)
  const [description, setDescription] = useState('')

  const handleCreate = async () => {
    try {
      await apiRequest(`/doctor/patients/${id}/treatment-plans`, {
        method: 'POST',
        body: JSON.stringify({ description })
      })
      setDescription('')
      window.location.reload()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <DoctorLayout>
      <AppPageHeader title="Treatment Plans" description="Manage and send electronic treatment recommendations." />
      
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
         <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Plan (Draft)</h3>
         <textarea 
           value={description}
           onChange={(e) => setDescription(e.target.value)}
           className="w-full rounded-xl bg-gray-50 border border-gray-200 p-3 text-gray-900 focus:outline-none focus:border-cyan-500" 
           placeholder="Describe the clinical recommendation..."
           rows={3}
         />
         <div className="mt-4 flex justify-end">
           <button onClick={handleCreate} className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-400 transition-colors">Save Draft</button>
         </div>
      </div>

      {loading ? (
         <div className="p-8 text-center text-slate-500">Loading plans...</div>
      ) : error ? (
         <ApiStatePanel error={error} />
      ) : (
        <div className="mt-8 grid gap-4">
           <h3 className="text-lg font-bold text-gray-900">History</h3>
           {data?.plans?.length === 0 ? (
             <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-slate-500">No treatment plans found.</div>
           ) : data?.plans?.map((plan: any) => (
             <div key={plan.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
               <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-md font-bold text-gray-900">{plan.description}</h4>
                    <p className="mt-1 text-xs text-slate-500">Status: <span className="uppercase text-cyan-600 font-bold">{plan.status}</span></p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">{new Date(plan.createdAt).toLocaleDateString()}</div>
                  </div>
               </div>
               {plan.status === 'draft' && (
                  <button className="mt-4 text-sm font-bold text-emerald-600 hover:text-emerald-500">Sign & Send ➔</button>
               )}
             </div>
           ))}
        </div>
      )}
    </DoctorLayout>
  )
}
