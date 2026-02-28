import React from 'react'

interface SolvencyIndicatorProps {
  ratio: number
  showLabel?: boolean
}

export const SolvencyIndicator: React.FC<SolvencyIndicatorProps> = ({ ratio, showLabel = true }) => {
  const percentage = Math.min(Math.max(ratio * 100, 0), 150)
  
  const getColor = () => {
    if (ratio >= 1.0) return 'from-emerald-500 to-emerald-600'
    if (ratio >= 0.95) return 'from-yellow-500 to-yellow-600'
    return 'from-red-500 to-red-600'
  }

  const getText = () => {
    if (ratio >= 1.0) return 'Healthy'
    if (ratio >= 0.95) return 'Warning'
    return 'Critical'
  }

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Solvency Ratio</span>
          <span className="text-sm font-semibold text-white">{ratio.toFixed(3)}</span>
        </div>
      )}
      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getColor()} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className={`text-xs font-semibold ${
          ratio >= 1.0 ? 'text-emerald-400' :
          ratio >= 0.95 ? 'text-yellow-400' :
          'text-red-400'
        }`}>
          {getText()}
        </span>
      )}
    </div>
  )
}
