import { AdminLayout } from '../../layouts/AdminLayout'
import { AppPageHeader } from '../../components/AppPageHeader'
import { useApiData, apiRequest } from '../../lib/api'
import { ApiStatePanel } from '../../components/ApiStatePanel'
import { useState, useEffect } from 'react'

export function AdminFeatureFlagsPage() {
  const { data, error, loading } = useApiData<any>('/admin/feature-flags')
  const [flags, setFlags] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (data?.data) {
      setFlags(data.data)
    }
  }, [data])

  const handleToggle = (key: string) => {
    setFlags(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    try {
      await apiRequest('/admin/feature-flags', {
        method: 'PUT',
        body: JSON.stringify(flags)
      })
      alert('Feature flags saved successfully.')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <AdminLayout>
      <AppPageHeader title="Feature Flags" description="Toggle beta features and early access rollouts globally." action="Save Changes" onAction={handleSave} />
      
      {loading ? (
         <div className="p-8 text-center text-slate-500">Loading flags...</div>
      ) : error ? (
         <ApiStatePanel error={error} />
      ) : (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-md divide-y divide-gray-100">
           {Object.keys(flags).map(key => (
             <div key={key} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                <div>
                   <h3 className="text-lg font-extrabold text-gray-900 capitalize">{key.replace(/_/g, ' ')}</h3>
                   <p className="mt-1 text-sm text-slate-500 font-mono text-xs">{key}</p>
                </div>
                <div onClick={() => handleToggle(key)} className={`relative inline-block w-12 h-6 rounded-full cursor-pointer transition-colors ${flags[key] ? 'bg-cyan-500' : 'bg-gray-300'}`}>
                   <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow ${flags[key] ? 'left-[26px]' : 'left-1'}`}></span>
                </div>
             </div>
           ))}
        </div>
      )}
    </AdminLayout>
  )
}
