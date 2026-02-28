import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useDashboardStore } from './store/dashboard-store'
import { ExchangeCard } from './components/exchange-card'
import { AlertsSection } from './components/alerts-section'
import { ExchangeData } from './types'

const PopupApp: React.FC = () => {
  const { exchanges, alerts, loading, error, lastRefresh, refreshing, fetchExchanges, dismissAlert } = useDashboardStore()
  const [selectedExchange, setSelectedExchange] = useState<ExchangeData | null>(null)

  useEffect(() => {
    fetchExchanges()
  }, [fetchExchanges])

  const criticalCount = alerts.filter(a => a.type === 'critical').length
  const warningCount = alerts.filter(a => a.type === 'warning').length
  const topExchanges = exchanges.slice(0, 4) // Show top 4 in popup

  const handleOpenDashboard = () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/pages/dashboard.html'),
    })
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-900 to-slate-800 text-slate-50">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <span className="text-emerald-400">⚔️</span> VaultSentinel
          </h1>
          <button
            onClick={handleOpenDashboard}
            className="px-3 py-1 text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded transition-colors"
          >
            Full Dashboard
          </button>
        </div>

        {/* Status Summary */}
        <div className="flex gap-2 text-xs">
          {criticalCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded">
              <span className="font-semibold">{criticalCount}</span>
              <span>Critical</span>
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded">
              <span className="font-semibold">{warningCount}</span>
              <span>Warning</span>
            </div>
          )}
          {criticalCount === 0 && warningCount === 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-xs">
              ✓ All Good
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(600px - 120px)' }}>
        {error && (
          <div className="m-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
            {error}
          </div>
        )}

        {loading && !exchanges.length ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin">⟳</div>
            <p className="mt-2 text-sm text-slate-400">Loading exchange data...</p>
          </div>
        ) : (
          <>
            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="px-4 pt-4 pb-2">
                <AlertsSection alerts={alerts} onDismiss={dismissAlert} />
              </div>
            )}

            {/* Exchange Cards */}
            <div className="p-4 space-y-3">
              {topExchanges.length > 0 ? (
                topExchanges.map(exchange => (
                  <ExchangeCard
                    key={exchange.name}
                    exchange={exchange}
                    onClick={() => setSelectedExchange(exchange)}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm">No exchange data available</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      {lastRefresh && (
        <div className="border-t border-slate-700/50 px-4 py-2 text-xs text-slate-400 text-center">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<PopupApp />)
