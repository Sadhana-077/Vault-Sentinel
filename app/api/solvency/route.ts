import { NextResponse } from "next/server"
import {
  fetchExchangeSolvencyData,
  computeDashboardSummary,
  generateAlerts,
  generateHistoricalData,
} from "@/lib/solvency-service"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const exchanges = await fetchExchangeSolvencyData()
    const summary = computeDashboardSummary(exchanges)
    const alerts = generateAlerts(exchanges)
    const historical = exchanges.map((e) =>
      generateHistoricalData(e.exchangeId, 30)
    )

    return NextResponse.json({
      exchanges,
      summary,
      alerts,
      historical,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Solvency API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch solvency data" },
      { status: 500 }
    )
  }
}
