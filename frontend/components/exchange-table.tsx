"use client"

import type { ExchangeSolvencyData } from "@/lib/types"
import { formatUsd, formatRatio } from "@/lib/exchanges"
import {
  CheckCircle2,
  AlertTriangle,
  XOctagon,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useState } from "react"

interface ExchangeTableProps {
  exchanges: ExchangeSolvencyData[]
  onSelectExchange: (exchangeId: string) => void
  selectedExchangeId: string | null
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "healthy":
      return <CheckCircle2 className="h-4 w-4 text-primary" />
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-chart-3" />
    case "critical":
      return <XOctagon className="h-4 w-4 text-destructive" />
    default:
      return <div className="h-4 w-4 rounded-full bg-muted" />
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    healthy: "bg-primary/10 text-primary",
    warning: "bg-chart-3/10 text-chart-3",
    critical: "bg-destructive/10 text-destructive",
    unknown: "bg-muted text-muted-foreground",
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || styles.unknown}`}
    >
      <StatusIcon status={status} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export function ExchangeTable({
  exchanges,
  onSelectExchange,
  selectedExchangeId,
}: ExchangeTableProps) {
  const [sortBy, setSortBy] = useState<"ratio" | "reserves" | "name">("ratio")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const toggleSort = (field: "ratio" | "reserves" | "name") => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortDir("desc")
    }
  }

  const sorted = [...exchanges].sort((a, b) => {
    const mult = sortDir === "asc" ? 1 : -1
    switch (sortBy) {
      case "ratio":
        return (a.solvencyRatio - b.solvencyRatio) * mult
      case "reserves":
        return (a.totalReservesUsd - b.totalReservesUsd) * mult
      case "name":
        return a.exchangeName.localeCompare(b.exchangeName) * mult
      default:
        return 0
    }
  })

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return null
    return sortDir === "asc" ? (
      <ChevronUp className="ml-1 inline h-3 w-3" />
    ) : (
      <ChevronDown className="ml-1 inline h-3 w-3" />
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">
          Exchange Solvency Overview
        </h2>
        <p className="text-xs text-muted-foreground">
          Click an exchange for detailed breakdown
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3">Status</th>
              <th
                className="cursor-pointer px-4 py-3 hover:text-foreground"
                onClick={() => toggleSort("name")}
              >
                Exchange
                <SortIcon field="name" />
              </th>
              <th
                className="cursor-pointer px-4 py-3 hover:text-foreground"
                onClick={() => toggleSort("ratio")}
              >
                Solvency Ratio
                <SortIcon field="ratio" />
              </th>
              <th
                className="cursor-pointer px-4 py-3 hover:text-foreground"
                onClick={() => toggleSort("reserves")}
              >
                Reserves
                <SortIcon field="reserves" />
              </th>
              <th className="px-4 py-3">Liabilities</th>
              <th className="px-4 py-3">Audit</th>
              <th className="px-4 py-3">PoR</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((exchange) => (
              <tr
                key={exchange.exchangeId}
                className={`cursor-pointer border-b border-border transition-colors hover:bg-secondary/50 ${
                  selectedExchangeId === exchange.exchangeId
                    ? "bg-secondary/70"
                    : ""
                }`}
                onClick={() => onSelectExchange(exchange.exchangeId)}
              >
                <td className="px-4 py-3">
                  <StatusBadge status={exchange.status} />
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground">
                    {exchange.exchangeName}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`font-mono text-sm font-bold ${
                      exchange.status === "healthy"
                        ? "text-primary"
                        : exchange.status === "warning"
                          ? "text-chart-3"
                          : "text-destructive"
                    }`}
                  >
                    {formatRatio(exchange.solvencyRatio)}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-sm text-foreground">
                  {formatUsd(exchange.totalReservesUsd)}
                </td>
                <td className="px-4 py-3 font-mono text-sm text-muted-foreground">
                  {formatUsd(exchange.totalLiabilitiesUsd)}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {exchange.auditProvider
                    ? exchange.auditProvider.split(" ")[0]
                    : "None"}
                </td>
                <td className="px-4 py-3">
                  {exchange.proofOfReserveUrl ? (
                    <a
                      href={exchange.proofOfReserveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`View ${exchange.exchangeName} Proof of Reserves`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
