"use client"

import { useState } from "react"
import useSWR from "swr"
import type {
  ExchangeSolvencyData,
  DashboardSummary,
  SolvencyAlert,
  ExchangeHistoricalData,
} from "@/lib/types"
import { DashboardHeader } from "./dashboard-header"
import { SummaryCards } from "./summary-cards"
import { ExchangeTable } from "./exchange-table"
import { ExchangeDetail } from "./exchange-detail"
import { AlertsPanel } from "./alerts-panel"
import { SolvencyOverviewChart } from "./solvency-overview-chart"
import { LoadingState, ErrorState } from "./loading-states"

interface SolvencyResponse {
  exchanges: ExchangeSolvencyData[]
  summary: DashboardSummary
  alerts: SolvencyAlert[]
  historical: ExchangeHistoricalData[]
  timestamp: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function Dashboard() {
  const [selectedExchangeId, setSelectedExchangeId] = useState<string | null>(null)

  const { data, error, isLoading } = useSWR<SolvencyResponse>(
    "/api/solvency",
    fetcher,
    {
      refreshInterval: 60_000, // Refresh every 60s
      revalidateOnFocus: true,
    }
  )

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState message="Unable to connect to solvency oracle" />

  const selectedExchange = data.exchanges.find(
    (e) => e.exchangeId === selectedExchangeId
  )
  const selectedHistorical = data.historical.find(
    (h) => h.exchangeId === selectedExchangeId
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-[1400px]">
          {/* Summary Cards */}
          <SummaryCards summary={data.summary} />

          {/* Main Grid */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Exchange Table — Full Width or 2/3 */}
            <div className={selectedExchange ? "lg:col-span-2" : "lg:col-span-3"}>
              <ExchangeTable
                exchanges={data.exchanges}
                onSelectExchange={setSelectedExchangeId}
                selectedExchangeId={selectedExchangeId}
              />
            </div>

            {/* Detail Panel (right side) */}
            {selectedExchange && (
              <div className="lg:col-span-1">
                <ExchangeDetail
                  exchange={selectedExchange}
                  historical={selectedHistorical}
                  onClose={() => setSelectedExchangeId(null)}
                />
              </div>
            )}
          </div>

          {/* Bottom Row */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SolvencyOverviewChart exchanges={data.exchanges} />
            <AlertsPanel alerts={data.alerts} />
          </div>

          {/* Footer */}
          <footer className="mt-8 flex items-center justify-between border-t border-border pt-4 pb-6">
            <p className="text-xs text-muted-foreground">
              Data sourced from on-chain wallet balances and exchange Proof of
              Reserve APIs. Powered by Chainlink CRE oracles.
            </p>
            <p className="text-xs text-muted-foreground">
              Last refresh:{" "}
              {new Date(data.timestamp).toLocaleTimeString()}
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}
