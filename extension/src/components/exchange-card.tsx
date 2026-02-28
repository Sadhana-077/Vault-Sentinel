import React from 'react'
import { ExchangeData } from '../types'
import { SolvencyIndicator } from './solvency-indicator'

interface ExchangeCardProps {
  exchange: ExchangeData
  onClick?: () => void
}

export const ExchangeCard: React.FC<ExchangeCardProps> = ({ exchange, onClick }) => {
  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    return `$${num.toFixed(2)}`
  }

  const statusColors = {
    healthy: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30',
    warning: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    critical: 'from-red-500/20 to-red-600/20 border-red-500/30',
  }

  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br ${statusColors[exchange.status]} border backdrop-blur-sm rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-200`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
            {exchange.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">{exchange.name}</h3>
            <p className="text-xs text-slate-400">
              {exchange.lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {exchange.isVerified && (
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Reserves</span>
          <span className="text-sm font-semibold text-white">
            {formatNumber(exchange.reserves.totalReserves)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Liabilities</span>
          <span className="text-sm font-semibold text-white">
            {formatNumber(exchange.liabilities.totalLiabilities)}
          </span>
        </div>
      </div>

      <SolvencyIndicator ratio={exchange.solvencyRatio} />
    </div>
  )
}
