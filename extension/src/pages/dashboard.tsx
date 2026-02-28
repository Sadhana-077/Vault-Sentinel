import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useDashboardStore } from '../store/dashboard-store'
import { ExchangeCard } from '../components/exchange-card'
import { AlertsSection } from '../components/alerts-section'
import { ExchangeDetail } from '../components/exchange-detail'
import { SolvencyChart } from '../components/solvency-chart'
import { ExchangeData } from '../types'

const DashboardPage: React.FC = () => {
  const { 
    exchanges, 
    alerts, 
    loading, 
    error, 
    lastRefresh, 
    refreshing,
    fetchExchanges, 
    refreshData,
    dismissAlert 
  } = useDashboardStore()

  const [selectedExchange, setSelectedExchange] = useState<ExchangeData | null>(null)
  const [view, setView] = useState<'grid' | 'detail'>('grid')

  useEffect(() => {
    fetchExchanges()
    // Auto-refresh every 15 minutes
    const interval = setInterval(() => {
      refreshData()
    }, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchExchanges, refreshData])

  const handleExchangeClick = (exchange: ExchangeData) => {
    setSelectedExchange(exchange)
    setView('detail')
  }

  const handleBack = () => {
    setView('grid')
    setSelectedExchange(null)
  }

  const criticalCount = alerts.filter(a => a.type === 'critical').length
  const warningCount = alerts.filter(a => a.type === 'warning').length
  const healthyCount = exchanges.filter(e => e.status === 'healthy').length

  const healthyExchanges = exchanges.filter(e => e.status === 'healthy')
  const avgSolvency = healthyExchanges.length > 0
    ? healthyExchanges.reduce((sum, e) => sum + e.solvencyRatio, 0) / healthyExchanges.length
    : 0

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <span className="text-3xl">⚔️</span> 
                <span>VaultSentinel</span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">Real-time Crypto Exchange Solvency Monitor</p>
            </div>
            <button
              onClick={() => refreshData()}
              disabled={refreshing}
              className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg font-semibold transition-all disabled:opacity-50"
            >
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Healthy Exchanges" value={`${healthyCount}/${exchanges.length}`} color="emerald" />
            <StatCard label="Critical Alerts" value={criticalCount} color={criticalCount > 0 ? 'red' : 'emerald'} />
            <StatCard label="Warnings" value={warningCount} color={warningCount > 0 ? 'yellow' : 'emerald'} />
            <StatCard label="Avg Solvency" value={`${(avgSolvency * 100).toFixed(1)}%`} color="blue" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-8 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {view === 'detail' && selectedExchange ? (
          <ExchangeDetail exchange={selectedExchange} onBack={handleBack} />
        ) : (
          <>
            {/* Charts */}
            {exchanges.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Solvency Overview</h2>
                <SolvencyChart exchanges={exchanges} />
              </div>
            )}

            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Active Alerts</h2>
                <AlertsSection alerts={alerts} onDismiss={dismissAlert} />
              </div>
            )}

            {/* Exchanges Grid */}
            <div>
              <h2 className="text-xl font-semibold mb-4">All Exchanges</h2>
              {loading && !exchanges.length ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin text-3xl mb-4">⟳</div>
                  <p className="text-slate-400">Loading exchange data...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exchanges.map(exchange => (
                    <div key={exchange.name} onClick={() => handleExchangeClick(exchange)}>
                      <ExchangeCard exchange={exchange} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      {lastRefresh && (
        <footer className="border-t border-slate-700/50 px-8 py-3 text-center text-xs text-slate-500">
          Last updated: {lastRefresh.toLocaleString()}
        </footer>
      )}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  color: 'emerald' | 'red' | 'yellow' | 'blue'
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => {
  const colors = {
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    red: 'bg-red-500/10 border-red-500/30 text-red-400',
    yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  }

  return (
    <div className={`border rounded-lg p-4 ${colors[color]}`}>
      <p className="text-xs font-semibold opacity-75 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<DashboardPage />)
