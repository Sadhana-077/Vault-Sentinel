import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ExchangeData } from '../types'

interface SolvencyChartProps {
  exchanges: ExchangeData[]
}

export const SolvencyChart: React.FC<SolvencyChartProps> = ({ exchanges }) => {
  const data = exchanges.map(e => ({
    name: e.name.slice(0, 8),
    reserves: Math.round(e.reserves.totalReserves / 1e6),
    liabilities: Math.round(e.liabilities.totalLiabilities / 1e6),
    ratio: parseFloat((e.solvencyRatio * 100).toFixed(1)),
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-slate-900 border border-slate-700 rounded p-3">
          <p className="font-semibold text-slate-100">{data.name}</p>
          <p className="text-xs text-emerald-400">Reserves: ${data.reserves}M</p>
          <p className="text-xs text-yellow-400">Liabilities: ${data.liabilities}M</p>
          <p className="text-xs text-blue-400">Ratio: {data.ratio}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-80 bg-slate-800/30 border border-slate-700/30 rounded-lg p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
          <XAxis dataKey="name" stroke="rgba(100,116,139,0.6)" style={{ fontSize: '12px' }} />
          <YAxis stroke="rgba(100,116,139,0.6)" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="reserves" stackId="a" fill="#16b34a" name="Reserves ($M)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="liabilities" stackId="a" fill="#eab308" name="Liabilities ($M)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
