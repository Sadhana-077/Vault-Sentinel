"use client"

import type { SolvencyAlert } from "@/lib/types"
import { AlertTriangle, XOctagon, Info, Clock } from "lucide-react"

interface AlertsPanelProps {
  alerts: SolvencyAlert[]
}

function AlertIcon({ severity }: { severity: string }) {
  switch (severity) {
    case "critical":
      return <XOctagon className="h-4 w-4 text-destructive" />
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-chart-3" />
    default:
      return <Info className="h-4 w-4 text-chart-2" />
  }
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Alerts</h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">
            All Clear
          </p>
          <p className="text-xs text-muted-foreground">
            No active alerts at this time
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          Active Alerts ({alerts.length})
        </h2>
        <span className="text-xs text-muted-foreground">
          {alerts.filter((a) => a.severity === "critical").length} critical
        </span>
      </div>
      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-lg border p-3 ${
              alert.severity === "critical"
                ? "border-destructive/30 bg-destructive/5"
                : alert.severity === "warning"
                  ? "border-chart-3/30 bg-chart-3/5"
                  : "border-border bg-background"
            }`}
          >
            <div className="flex items-start gap-2">
              <AlertIcon severity={alert.severity} />
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">
                  {alert.exchangeName}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {alert.message}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </div>
              </div>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                  alert.severity === "critical"
                    ? "bg-destructive/20 text-destructive"
                    : "bg-chart-3/20 text-chart-3"
                }`}
              >
                {alert.severity}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
