"use client"

import { Loader2 } from "lucide-react"

export function LoadingState() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            Fetching solvency data...
          </p>
          <p className="text-xs text-muted-foreground">
            Querying exchange wallets and oracle feeds
          </p>
        </div>
      </div>
    </div>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <span className="text-2xl text-destructive">!</span>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            Failed to load data
          </p>
          <p className="text-xs text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  )
}
