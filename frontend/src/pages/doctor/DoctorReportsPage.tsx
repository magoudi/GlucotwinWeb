import { DoctorLayout } from '../../layouts/DoctorLayout'
import { AppPageHeader } from '../../components/AppPageHeader'

export function DoctorReportsPage() {
  return (
    <DoctorLayout>
      <AppPageHeader title="Clinical Reports Generator" description="Generate bulk or individual patient status reports." />
      
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm max-w-2xl">
         <h3 className="text-lg font-bold text-gray-900 mb-6">Generate New Report</h3>
         
         <div className="space-y-4">
           <div>
             <label className="block text-sm font-bold text-slate-600 mb-2">Select Patient</label>
             <select className="w-full rounded-lg bg-white border border-gray-200 p-3 text-gray-900 focus:outline-none focus:border-cyan-500">
                <option value="">-- All Patients --</option>
             </select>
           </div>
           
           <div>
             <label className="block text-sm font-bold text-slate-600 mb-2">Report Type</label>
             <select className="w-full rounded-lg bg-white border border-gray-200 p-3 text-gray-900 focus:outline-none focus:border-cyan-500">
                <option value="clinical">Clinical Summary</option>
                <option value="analytics">Prediction Analytics</option>
                <option value="billing">Billing Summary</option>
             </select>
           </div>
           
           <button className="mt-4 w-full rounded-lg bg-cyan-600 py-3 text-sm font-extrabold text-white hover:bg-cyan-500 transition-colors shadow-sm">
              Generate PDF
           </button>
         </div>
      </div>
    </DoctorLayout>
  )
}
