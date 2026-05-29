import { useParams } from 'react-router-dom'
import { DoctorLayout } from '../../layouts/DoctorLayout'
import { AppPageHeader } from '../../components/AppPageHeader'
import { ApiStatePanel } from '../../components/ApiStatePanel'
import { useApiData } from '../../lib/api'

export function DoctorInsightsPage() {
  const { id } = useParams()
  const { data, error, loading } = useApiData<any>(`/doctor/patients/${id}/insights`)

  return (
    <DoctorLayout>
      <AppPageHeader title="Patient AI Insights" description="Automated analysis of patient trends and risk factors." />
      {loading ? (
         <div className="p-8 text-center text-slate-500">Loading insights...</div>
      ) : error ? (
         <ApiStatePanel error={error} />
      ) : (
        <div className="mt-8 grid gap-4">
           {data?.insights?.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center text-slate-500">No recent insights found.</div>
           ) : data?.insights?.map((insight: any) => (
              <div key={insight.id} className={`rounded-xl border p-5 shadow-sm ${insight.type === 'danger' ? 'bg-red-50 border-red-200' : insight.type === 'warning' ? 'bg-orange-50 border-orange-200' : 'bg-cyan-50 border-cyan-200'}`}>
                <h3 className={`text-lg font-extrabold ${insight.type === 'danger' ? 'text-red-700' : insight.type === 'warning' ? 'text-orange-700' : 'text-cyan-700'}`}>{insight.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{insight.description}</p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                 <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Suggested Action: </span>
                 <span className="text-sm font-extrabold text-gray-900">{insight.suggestedAction}</span>
               </div>
             </div>
           ))}
        </div>
      )}
    </DoctorLayout>
  )
}
