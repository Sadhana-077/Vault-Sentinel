export interface Asset {
  symbol: string
  amount: number
  value: number
  verified: boolean
}

export interface ReserveData {
  exchange: string
  totalReserves: number
  assets: Asset[]
  lastUpdated: Date
  merkleRoot: string
  merkleProof: string[]
  signatureTimestamp: number
}

export interface LiabilityData {
  exchange: string
  totalLiabilities: number
  userBalances: Record<string, number>
  lastUpdated: Date
  merkleRoot: string
  merkleTreePath: string[]
}

export interface ExchangeData {
  name: string
  reserves: ReserveData
  liabilities: LiabilityData
  solvencyRatio: number
  isVerified: boolean
  status: 'healthy' | 'warning' | 'critical'
  lastUpdated: Date
}

export interface Alert {
  id: string
  exchange: string
  type: 'warning' | 'critical'
  message: string
  timestamp: Date
  resolved: boolean
}

export interface DashboardState {
  exchanges: ExchangeData[]
  alerts: Alert[]
  loading: boolean
  error: string | null
  lastRefresh: Date | null
  refreshing: boolean
}
