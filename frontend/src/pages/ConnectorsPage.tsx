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
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm font-bold text-red-200">
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
            <h2 className="text-[26px] font-extrabold text-white">Connector Setup Queue</h2>
            <p className="mt-2 text-[15px] text-slate-300">Choose which streams should shape predictions, timeline context, and clinician review.</p>
          </div>
          <StatusBadge status={connectors.some(c => c.status === 'connected') ? 'Safe' : 'Needs More Data'} />
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">Loading connectors...</div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {connectors.map((connector) => (
              <div key={connector.type} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">{connector.provider}</p>
                    <h3 className="mt-2 text-lg font-extrabold text-white">{connector.name}</h3>
                  </div>
                  <span className={`rounded-lg border px-3 py-1 text-xs font-bold ${connector.status === 'connected' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-[#0B1120]/50 text-slate-300'}`}>
                    {connector.status === 'connected' ? '● Connected' : 'Ready for setup'}
                  </span>
                </div>
                {connector.lastSync && (
                  <p className="mt-2 text-xs text-slate-500">Last sync: {new Date(connector.lastSync).toLocaleString()}</p>
                )}
                <div className="mt-4 flex gap-2">
                  {connector.status === 'connected' ? (
                    <button
                      type="button"
                      onClick={() => handleDisconnect(connector.type)}
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-extrabold text-red-300 transition-colors hover:bg-red-500/20"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConnect(connector.type)}
                      className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2.5 text-sm font-extrabold text-cyan-300 transition-colors hover:bg-cyan-500/20"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardPanel>
    </AppLayout>
  )
}
