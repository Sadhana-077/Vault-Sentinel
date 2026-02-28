import React from 'react'
import { motion } from 'framer-motion'
import { ExchangeData } from '../types'
import { SolvencyIndicator } from './solvency-indicator'

interface AnimatedExchangeCardProps {
  exchange: ExchangeData
  onClick?: () => void
  index?: number
}

export const AnimatedExchangeCard: React.FC<AnimatedExchangeCardProps> = ({ 
  exchange, 
  onClick, 
  index = 0 
}) => {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ scale: 1.02, translateY: -4 }}
      onClick={onClick}
      className={`bg-gradient-to-br ${statusColors[exchange.status]} border backdrop-blur-sm rounded-lg p-4 cursor-pointer transition-all duration-200`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div 
            className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold"
            whileHover={{ scale: 1.1 }}
          >
            {exchange.name.substring(0, 2).toUpperCase()}
          </motion.div>
          <div>
            <h3 className="font-semibold text-white text-sm">{exchange.name}</h3>
            <p className="text-xs text-slate-400">
              {exchange.lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>
        {exchange.isVerified && (
          <motion.div 
            className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <span className="text-white text-xs">✓</span>
          </motion.div>
        )}
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Reserves</span>
          <motion.span 
            className="text-sm font-semibold text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {formatNumber(exchange.reserves.totalReserves)}
          </motion.span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Liabilities</span>
          <motion.span 
            className="text-sm font-semibold text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {formatNumber(exchange.liabilities.totalLiabilities)}
          </motion.span>
        </div>
      </div>

      <SolvencyIndicator ratio={exchange.solvencyRatio} />
    </motion.div>
  )
}
