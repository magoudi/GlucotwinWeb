import { useParams } from 'react-router-dom'
import { DoctorLayout } from '../../layouts/DoctorLayout'
import { AppPageHeader } from '../../components/AppPageHeader'
import { ApiStatePanel } from '../../components/ApiStatePanel'
import { useApiData, apiRequest } from '../../lib/api'
import { useState } from 'react'

export function DoctorNotesPage() {
  const { id } = useParams()
  const { data, error, loading } = useApiData<any>(`/doctor/patients/${id}/notes`)
  const [content, setContent] = useState('')

  const handleAddNote = async () => {
    if (!content.trim()) return
    try {
      await apiRequest(`/doctor/patients/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content })
      })
      setContent('')
      window.location.reload()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <DoctorLayout>
      <AppPageHeader title="Clinical Notes" description="Private observations and progress notes." />
      
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
         <textarea 
           value={content}
           onChange={(e) => setContent(e.target.value)}
           className="w-full rounded-xl bg-gray-50 border border-gray-200 p-3 text-gray-900 focus:outline-none focus:border-cyan-500" 
           placeholder="Add a new clinical note..."
           rows={4}
         />
         <div className="mt-4 flex justify-end">
           <button onClick={handleAddNote} className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-400 transition-colors">Save Note</button>
         </div>
      </div>

      {loading ? (
         <div className="p-8 text-center text-slate-500">Loading notes...</div>
      ) : error ? (
         <ApiStatePanel error={error} />
      ) : (
        <div className="mt-8 space-y-4">
           {data?.notes?.length === 0 ? (
             <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-slate-500">No clinical notes recorded.</div>
           ) : data?.notes?.map((note: any) => (
             <div key={note.id} className="rounded-xl border border-gray-200 bg-white p-5 hover:bg-gray-50 transition-colors shadow-sm">
               <p className="text-sm text-slate-600">{note.content}</p>
               <div className="mt-3 text-xs font-bold text-slate-500">{new Date(note.createdAt).toLocaleString()}</div>
             </div>
           ))}
        </div>
      )}
    </DoctorLayout>
  )
}
