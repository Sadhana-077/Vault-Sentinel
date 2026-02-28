"use client"

import type { ExchangeSolvencyData } from "@/lib/types"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { formatUsd } from "@/lib/exchanges"

interface SolvencyOverviewChartProps {
  exchanges: ExchangeSolvencyData[]
}

export function SolvencyOverviewChart({
  exchanges,
}: SolvencyOverviewChartProps) {
  const statusCounts = {
    healthy: exchanges.filter((e) => e.status === "healthy").length,
    warning: exchanges.filter((e) => e.status === "warning").length,
    critical: exchanges.filter((e) => e.status === "critical").length,
  }

  const pieData = [
    { name: "Healthy", value: statusCounts.healthy, color: "var(--primary)" },
    { name: "Warning", value: statusCounts.warning, color: "var(--chart-3)" },
    {
      name: "Critical",
      value: statusCounts.critical,
      color: "var(--destructive)",
    },
  ].filter((d) => d.value > 0)

  const topByReserve = [...exchanges]
    .sort((a, b) => b.totalReservesUsd - a.totalReservesUsd)
    .slice(0, 5)

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold text-foreground">
        Status Distribution
      </h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Pie Chart */}
        <div className="flex items-center justify-center">
          <div className="h-40 w-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "var(--foreground)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top exchanges by reserve */}
        <div>
          <h3 className="mb-2 text-xs font-medium text-muted-foreground">
            Top by Tracked Reserves
          </h3>
          <div className="flex flex-col gap-2">
            {topByReserve.map((exchange, i) => (
              <div key={exchange.exchangeId} className="flex items-center gap-2">
                <span className="w-4 text-right text-[10px] font-medium text-muted-foreground">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">
                      {exchange.exchangeName}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatUsd(exchange.totalReservesUsd)}
                    </span>
                  </div>
                  <div className="mt-1 h-1 rounded-full bg-secondary">
                    <div
                      className="h-1 rounded-full bg-primary"
                      style={{
                        width: `${Math.min(100, (exchange.totalReservesUsd / (topByReserve[0]?.totalReservesUsd || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4">
        {pieData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[10px] text-muted-foreground">
              {entry.name} ({entry.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
