import { AppLayout } from '../layouts/AppLayout'
import { AppPageHeader } from '../components/AppPageHeader'
import { ApiStatePanel } from '../components/ApiStatePanel'
import { useApiData, apiRequest } from '../lib/api'
import { useState } from 'react'

export function ReportsPage() {
  const { data, error, loading } = useApiData<any>('/patient/reports')
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await apiRequest('/patient/reports/generate', { method: 'POST' })
      window.location.reload()
    } catch (e) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <AppLayout>
      <AppPageHeader title="Clinical Reports" description="Generate and download comprehensive summaries for your care team." action={generating ? "Generating..." : "Generate New Report"} onAction={handleGenerate} />
      {loading ? (
         <div className="p-8 text-center text-slate-500">Loading reports...</div>
      ) : error ? (
         <ApiStatePanel error={error} />
      ) : (
        <div className="mt-8 grid gap-4">
           {data?.data?.length === 0 ? (
             <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center text-slate-500 shadow-sm">No reports generated yet.</div>
           ) : data?.data?.map((report: any) => (
              <div key={report._id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 hover:bg-gray-50 transition-colors shadow-sm">
                <div>
                 <h3 className="text-lg font-extrabold text-gray-900 uppercase tracking-wider">{report.reportType} Report</h3>
                  <p className="mt-1 text-sm text-slate-500">Generated on {new Date(report.generatedAt).toLocaleDateString()}</p>
                </div>
                <button className="rounded-lg bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-600 hover:bg-cyan-100 transition-colors">Download PDF</button>
             </div>
           ))}
        </div>
      )}
    </AppLayout>
  )
}
