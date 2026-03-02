"use client"

import type { DashboardSummary } from "@/lib/types"
import { formatUsd, formatRatio } from "@/lib/exchanges"
import { TrendingUp, AlertTriangle, XOctagon, Database } from "lucide-react"

interface SummaryCardsProps {
  summary: DashboardSummary
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      label: "Avg Solvency Ratio",
      value: formatRatio(summary.averageSolvencyRatio),
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total Reserves",
      value: formatUsd(summary.totalReservesUsd),
      icon: Database,
      color: "text-chart-5",
      bgColor: "bg-chart-5/10",
    },
    {
      label: "Healthy Exchanges",
      value: `${summary.healthyCount}/${summary.totalExchangesMonitored}`,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Alerts Active",
      value: `${summary.warningCount + summary.criticalCount}`,
      icon: summary.criticalCount > 0 ? XOctagon : AlertTriangle,
      color:
        summary.criticalCount > 0
          ? "text-destructive"
          : summary.warningCount > 0
            ? "text-chart-3"
            : "text-muted-foreground",
      bgColor:
        summary.criticalCount > 0
          ? "bg-destructive/10"
          : summary.warningCount > 0
            ? "bg-chart-3/10"
            : "bg-secondary",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {card.label}
              </span>
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-md ${card.bgColor}`}
              >
                <Icon className={`h-3.5 w-3.5 ${card.color}`} />
              </div>
            </div>
            <p className={`mt-2 text-2xl font-bold font-mono ${card.color}`}>
              {card.value}
            </p>
          </div>
        )
      })}
    </div>
  )
}
