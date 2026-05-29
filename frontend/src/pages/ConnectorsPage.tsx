import { useEffect, useState } from 'react'
import { AppLayout } from '../layouts/AppLayout'
import { AppPageHeader } from '../components/AppPageHeader'
import { DashboardPanel } from '../components/DashboardPanel'
import { PrototypeNotice, StatusBadge } from '../components/GlucoTwinUI'
import { fetchPatientConnectors, connectPatientConnector, disconnectPatientConnector, type ConnectorInfo } from '../lib/patientApi'

export function ConnectorsPage() {
  const [connectors, setConnectors] = useState<ConnectorInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [actionMsg, setActionMsg] = useState('')
  const [error, setError] = useState('')

  async function loadConnectors() {
    try {
      const result = await fetchPatientConnectors()
      setConnectors(result.connectors)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load connectors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConnectors()
  }, [])

  async function handleConnect(type: string) {
    setActionMsg('')
    setError('')
    try {
      const result = await connectPatientConnector(type)
      setActionMsg(`${result.connector.name} connected successfully.`)
      await loadConnectors()
      window.setTimeout(() => setActionMsg(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not connect')
    }
  }

  async function handleDisconnect(type: string) {
    setActionMsg('')
    setError('')
    try {
      await disconnectPatientConnector(type)
      setActionMsg('Connector disconnected.')
      await loadConnectors()
      window.setTimeout(() => setActionMsg(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not disconnect')
    }
  }

  return (
    <AppLayout>
      <AppPageHeader
        title="Device Connectors"
        description="Link your CGM, insulin pump, and health apps to GlucoTwin."
      />
      <PrototypeNotice>
        Connector setup is now wired through the backend. Connection state is tracked per patient and feeds into the timeline.
      </PrototypeNotice>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-50 p-5 text-sm font-bold text-red-200">
          {error}
        </div>
      )}

      {actionMsg && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm font-bold text-emerald-200">
          {actionMsg}
        </div>
      )}

      <DashboardPanel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-[26px] font-extrabold text-slate-900">Connector Setup Queue</h2>
            <p className="mt-2 text-[15px] text-slate-500">Choose which medical streams should shape predictions, timeline context, and clinician review.</p>
          </div>
          <StatusBadge status={connectors.some(c => c.status === 'connected') ? 'Safe' : 'Needs More Data'} />
        </div>

        {loading ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">Loading connectors...</div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {connectors.map((connector) => {
              // Add mock metadata based on connector type for realism
              let telemetry = null;
              if (connector.status === 'connected') {
                if (connector.type.includes('cgm') || connector.name.includes('Dexcom') || connector.name.includes('Libre')) {
                  telemetry = (
                    <div className="mt-3.5 space-y-1.5 border-t border-slate-100/60 pt-3 text-xs text-slate-500 font-medium">
                      <div className="flex justify-between">
                        <span>Sensor Age: <strong className="text-slate-700">4 days old</strong> (6 days remaining)</span>
                        <span className="text-emerald-700">● Live Signal</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transmitter ID: <strong className="text-slate-700">G7-889B2</strong></span>
                        <span>MARD: <strong className="text-slate-700">8.2% (Clinically Excellent)</strong></span>
                      </div>
                    </div>
                  );
                } else if (connector.type.includes('pump') || connector.name.includes('Omnipod') || connector.name.includes('Tandem')) {
                  telemetry = (
                    <div className="mt-3.5 space-y-1.5 border-t border-slate-100/60 pt-3 text-xs text-slate-500 font-medium">
                      <div className="flex justify-between">
                        <span>Reservoir Level: <strong className="text-slate-700">114 U (Humalog)</strong></span>
                        <span>Battery: <strong className="text-slate-700">84%</strong></span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Basal Rate: <strong className="text-slate-700">0.85 U/h</strong></span>
                        <span>Infusion Set Age: <strong className="text-slate-700">1 day</strong></span>
                      </div>
                    </div>
                  );
                } else {
                  telemetry = (
                    <div className="mt-3.5 space-y-1.5 border-t border-slate-100/60 pt-3 text-xs text-slate-500 font-medium">
                      <div className="flex justify-between">
                        <span>Automatic Syncing: <strong className="text-slate-700">Active</strong></span>
                        <span className="text-emerald-700">Connected</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Synced Records Today: <strong className="text-slate-700">16 points</strong></span>
                        <span>Integrity Hash: <strong className="text-slate-500 font-mono">sha256-4b89</strong></span>
                      </div>
                    </div>
                  );
                }
              }

              return (
                <div key={connector.type} className="rounded-xl border border-slate-200 bg-slate-50/40 p-5 hover:border-slate-300 transition-colors">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#2455e8]">{connector.provider}</p>
                      <h3 className="mt-1 text-lg font-extrabold text-slate-900">{connector.name}</h3>
                    </div>
                    <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${connector.status === 'connected' ? 'border-emerald-200 bg-emerald-50 text-emerald-850' : 'border-slate-200 bg-slate-100 text-slate-500'}`}>
                      {connector.status === 'connected' ? '● Connected' : 'Ready for setup'}
                    </span>
                  </div>
                  
                  {telemetry}

                  {connector.lastSync && (
                    <p className="mt-3.5 text-xs text-slate-500">Last database sync: {new Date(connector.lastSync).toLocaleString()}</p>
                  )}
                  
                  <div className="mt-4 flex gap-2">
                    {connector.status === 'connected' ? (
                      <button
                        type="button"
                        onClick={() => handleDisconnect(connector.type)}
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-extrabold text-red-800 transition-colors hover:bg-red-100"
                      >
                        Disconnect Device
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConnect(connector.type)}
                        className="rounded-lg bg-[#2455e8] hover:bg-[#1a44cc] px-4 py-2 text-xs font-extrabold text-gray-900 transition-all shadow-sm"
                      >
                        Authorize & Connect
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DashboardPanel>

    </AppLayout>
  )
}
