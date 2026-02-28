"use client"

import type { ExchangeSolvencyData, ExchangeHistoricalData } from "@/lib/types"
import { formatUsd, formatRatio } from "@/lib/exchanges"
import { X, ExternalLink, Copy, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
} from "recharts"

interface ExchangeDetailProps {
  exchange: ExchangeSolvencyData
  historical: ExchangeHistoricalData | undefined
  onClose: () => void
}

export function ExchangeDetail({
  exchange,
  historical,
  onClose,
}: ExchangeDetailProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const chartData = historical?.snapshots.map((s) => ({
    date: new Date(s.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    ratio: Number((s.ratio * 100).toFixed(1)),
  }))

  const reserveData = exchange.reserves.map((r) => ({
    asset: r.asset,
    reserve: r.reserveValueUsd,
    liability: r.liabilityValueUsd,
  }))

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {exchange.exchangeName} — Detail View
          </h2>
          <p className="text-xs text-muted-foreground">
            Last updated:{" "}
            {new Date(exchange.lastUpdated).toLocaleString()}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Close detail view"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
        {/* Solvency Ratio Chart */}
        <div className="rounded-lg border border-border bg-background p-4">
          <h3 className="mb-3 text-xs font-medium text-muted-foreground">
            30-Day Solvency Ratio
          </h3>
          <div className="h-48">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    interval={6}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    domain={["auto", "auto"]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "var(--foreground)",
                    }}
                    formatter={(value: number) => [`${value}%`, "Ratio"]}
                  />
                  <ReferenceLine
                    y={105}
                    stroke="var(--primary)"
                    strokeDasharray="3 3"
                    strokeOpacity={0.5}
                  />
                  <ReferenceLine
                    y={100}
                    stroke="var(--chart-3)"
                    strokeDasharray="3 3"
                    strokeOpacity={0.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="ratio"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "var(--primary)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No historical data available
              </div>
            )}
          </div>
        </div>

        {/* Reserve vs Liability Bar Chart */}
        <div className="rounded-lg border border-border bg-background p-4">
          <h3 className="mb-3 text-xs font-medium text-muted-foreground">
            Reserves vs Liabilities
          </h3>
          <div className="h-48">
            {reserveData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reserveData}>
                  <XAxis
                    dataKey="asset"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) =>
                      v >= 1e9
                        ? `$${(v / 1e9).toFixed(0)}B`
                        : v >= 1e6
                          ? `$${(v / 1e6).toFixed(0)}M`
                          : `$${(v / 1e3).toFixed(0)}K`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "var(--foreground)",
                    }}
                    formatter={(value: number) => [formatUsd(value)]}
                  />
                  <Bar dataKey="reserve" name="Reserve" radius={[4, 4, 0, 0]}>
                    {reserveData.map((_, i) => (
                      <Cell key={`res-${i}`} fill="var(--primary)" />
                    ))}
                  </Bar>
                  <Bar
                    dataKey="liability"
                    name="Liability"
                    radius={[4, 4, 0, 0]}
                  >
                    {reserveData.map((_, i) => (
                      <Cell key={`lia-${i}`} fill="var(--chart-2)" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No reserve data tracked
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wallet Addresses */}
      <div className="border-t border-border p-4">
        <h3 className="mb-3 text-xs font-medium text-muted-foreground">
          Tracked Wallet Addresses
        </h3>
        {exchange.walletAddresses.length > 0 ? (
          <div className="flex flex-col gap-2">
            {exchange.walletAddresses.map((wallet) => (
              <div
                key={wallet.address}
                className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                    {wallet.chain}
                  </span>
                  <code className="text-xs text-foreground font-mono">
                    {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                  </code>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-foreground">
                    {wallet.balance.toFixed(4)} {wallet.asset}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatUsd(wallet.balanceUsd)}
                  </span>
                  <button
                    onClick={() => copyAddress(wallet.address)}
                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label={`Copy address ${wallet.address}`}
                  >
                    {copiedAddress === wallet.address ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No wallet addresses currently tracked for this exchange.
          </p>
        )}
      </div>

      {/* Links */}
      <div className="flex items-center gap-3 border-t border-border px-4 py-3">
        {exchange.proofOfReserveUrl && (
          <a
            href={exchange.proofOfReserveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80"
          >
            <ExternalLink className="h-3 w-3" />
            Proof of Reserves
          </a>
        )}
        {exchange.auditProvider && (
          <span className="text-xs text-muted-foreground">
            Audited by: {exchange.auditProvider}
          </span>
        )}
      </div>
    </div>
  )
}
