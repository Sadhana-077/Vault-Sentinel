// ============================================================
// VaultSentinel - Shared Types
// ============================================================

export type SolvencyStatus = "healthy" | "warning" | "critical" | "unknown"

export interface ExchangeReserve {
  asset: string
  reserveAmount: number
  reserveValueUsd: number
  liabilityAmount: number
  liabilityValueUsd: number
}

export interface ExchangeSolvencyData {
  exchangeId: string
  exchangeName: string
  solvencyRatio: number
  totalReservesUsd: number
  totalLiabilitiesUsd: number
  status: SolvencyStatus
  reserves: ExchangeReserve[]
  lastUpdated: string
  proofOfReserveUrl: string | null
  auditProvider: string | null
  walletAddresses: WalletAddress[]
}

export interface WalletAddress {
  chain: string
  address: string
  asset: string
  balance: number
  balanceUsd: number
  lastVerified: string
}

export interface SolvencyAlert {
  id: string
  exchangeId: string
  exchangeName: string
  type: "threshold_breach" | "ratio_drop" | "data_stale" | "anomaly"
  severity: "info" | "warning" | "critical"
  message: string
  timestamp: string
  currentRatio: number
  previousRatio: number | null
}

export interface SolvencySnapshot {
  timestamp: string
  ratio: number
}

export interface ExchangeHistoricalData {
  exchangeId: string
  snapshots: SolvencySnapshot[]
}

export interface DashboardSummary {
  totalExchangesMonitored: number
  healthyCount: number
  warningCount: number
  criticalCount: number
  averageSolvencyRatio: number
  totalReservesUsd: number
  totalLiabilitiesUsd: number
  lastGlobalUpdate: string
}

// CRE Workflow types
export interface CREWorkflowConfig {
  schedule: string
  exchanges: ExchangeEndpointConfig[]
}

export interface ExchangeEndpointConfig {
  exchangeId: string
  exchangeName: string
  proofOfReserveApiUrl: string
  walletExplorerUrls: string[]
  chainNames: string[]
}

// Chainlink Proof of Reserve feed addresses
export interface PoRFeedConfig {
  exchangeId: string
  exchangeName: string
  feedAddress: string
  chainName: string
  chainSelector: string
}
