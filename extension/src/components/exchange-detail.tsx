import React from 'react'
import { ExchangeData } from '../types'
import { SolvencyIndicator } from './solvency-indicator'

interface ExchangeDetailProps {
  exchange: ExchangeData
  onBack: () => void
}

export const ExchangeDetail: React.FC<ExchangeDetailProps> = ({ exchange, onBack }) => {
  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    return `$${num.toFixed(2)}`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    }).format(date)
  }

  return (
    <div className="max-w-4xl">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">{exchange.name}</h1>
        {exchange.isVerified && (
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
            <span className="text-emerald-400 text-sm font-semibold">✓ Verified</span>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Reserves Section */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-300">Reserve Data</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Reserves</p>
              <p className="text-2xl font-bold text-emerald-400">
                {formatNumber(exchange.reserves.totalReserves)}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-2">Top Assets</p>
              <div className="space-y-2">
                {exchange.reserves.assets.slice(0, 3).map((asset, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                    <div>
                      <p className="font-semibold">{asset.symbol}</p>
                      <p className="text-xs text-slate-400">{asset.amount.toFixed(0)}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-300">
                      {formatNumber(asset.value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700/30">
              <p className="text-xs text-slate-500">
                Last Updated: {formatDate(exchange.reserves.lastUpdated)}
              </p>
            </div>
          </div>
        </div>

        {/* Liabilities Section */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-300">Liability Data</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Liabilities</p>
              <p className="text-2xl font-bold text-yellow-400">
                {formatNumber(exchange.liabilities.totalLiabilities)}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-2">Coverage Ratio</p>
              <p className="text-2xl font-bold mb-2">
                {(exchange.solvencyRatio * 100).toFixed(1)}%
              </p>
              <SolvencyIndicator ratio={exchange.solvencyRatio} showLabel={false} />
            </div>

            <div className="pt-2 border-t border-slate-700/30">
              <p className="text-xs text-slate-500">
                Last Updated: {formatDate(exchange.liabilities.lastUpdated)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Merkle Verification Section */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-slate-300">Merkle Tree Verification</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-400 mb-2">Reserve Root Hash</p>
            <div className="bg-slate-700/50 rounded p-3 font-mono text-xs text-slate-300 break-all">
              {exchange.reserves.merkleRoot.slice(0, 20)}...
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-400 mb-2">Liability Root Hash</p>
            <div className="bg-slate-700/50 rounded p-3 font-mono text-xs text-slate-300 break-all">
              {exchange.liabilities.merkleRoot.slice(0, 20)}...
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${exchange.isVerified ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <p className={`text-sm font-semibold ${exchange.isVerified ? 'text-emerald-400' : 'text-red-400'}`}>
            {exchange.isVerified ? 'Merkle proof verified on-chain' : 'Verification pending'}
          </p>
        </div>
      </div>

      {/* Status Info */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-300">Status Summary</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Solvency Status</span>
            <span className={`font-semibold ${
              exchange.status === 'healthy' ? 'text-emerald-400' :
              exchange.status === 'warning' ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {exchange.status.charAt(0).toUpperCase() + exchange.status.slice(1)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Coverage</span>
            <span className="font-semibold">
              {exchange.reserves.totalReserves > 0
                ? `${(exchange.liabilities.totalLiabilities / exchange.reserves.totalReserves * 100).toFixed(1)}%`
                : 'N/A'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Last Verified</span>
            <span className="font-semibold">
              {formatDate(exchange.lastUpdated)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
