"use client"

import { Shield, Activity } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground font-sans">
            VaultSentinel
          </h1>
          <p className="text-xs text-muted-foreground">
            Exchange Solvency Monitor
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5">
          <Activity className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">
            Powered by Chainlink CRE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>
    </header>
  )
}
