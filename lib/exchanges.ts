// ============================================================
// VaultSentinel - Exchange Configuration
// Real production data sources for the top 10+ crypto exchanges
// ============================================================

import type { ExchangeSolvencyData, SolvencyStatus } from "./types"

// Known public wallet addresses for exchange cold/hot wallets
// Sources: On-chain analysis, exchange disclosures, Arkham Intelligence, Nansen
export const EXCHANGE_WALLET_REGISTRY: Record<
  string,
  { chain: string; address: string; asset: string; label: string }[]
> = {
  binance: [
    { chain: "ethereum", address: "0x28C6c06298d514Db089934071355E5743bf21d60", asset: "ETH", label: "Binance Hot Wallet" },
    { chain: "ethereum", address: "0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549", asset: "ETH", label: "Binance Cold Wallet" },
    { chain: "bitcoin", address: "34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo", asset: "BTC", label: "Binance Cold Wallet" },
    { chain: "bitcoin", address: "bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h", asset: "BTC", label: "Binance BTC Reserve" },
  ],
  coinbase: [
    { chain: "ethereum", address: "0x71660c4005BA85c37ccec55d0C4493E66Fe775d3", asset: "ETH", label: "Coinbase Commerce" },
    { chain: "ethereum", address: "0x503828976D22510aad0201ac7EC88293211D23Da", asset: "ETH", label: "Coinbase Cold Wallet" },
    { chain: "bitcoin", address: "3Kzh9qAqVWQhEsfQz7zEQL1EuSx5tyNLNS", asset: "BTC", label: "Coinbase Cold Wallet" },
  ],
  kraken: [
    { chain: "ethereum", address: "0x267be1C1D684F78cb4F6a176C4911b741E4Ffdc0", asset: "ETH", label: "Kraken Hot Wallet" },
    { chain: "bitcoin", address: "3AfP4kDSxFHHeVpNiB4jREREBb5JhGNSUo", asset: "BTC", label: "Kraken Cold Wallet" },
  ],
  okx: [
    { chain: "ethereum", address: "0x6cC5F688a315f3dC28A7781717a9A798a59fDA7b", asset: "ETH", label: "OKX Hot Wallet" },
    { chain: "bitcoin", address: "3LYJfcfHPXYJreMsASk2jkn69LWEYKzexb", asset: "BTC", label: "OKX Cold Wallet" },
  ],
  bybit: [
    { chain: "ethereum", address: "0xf89d7b9c864f589bbF53a82105107622B35EaA40", asset: "ETH", label: "Bybit Hot Wallet" },
  ],
  "gate.io": [
    { chain: "ethereum", address: "0x0D0707963952f2fBA59dD06f2b425ace40b492Fe", asset: "ETH", label: "Gate.io Hot Wallet" },
  ],
  kucoin: [
    { chain: "ethereum", address: "0x2B5634C42055806a59e9107ED44D43c426E58258", asset: "ETH", label: "KuCoin Hot Wallet" },
  ],
  "crypto.com": [
    { chain: "ethereum", address: "0x6262998Ced04146fA42253a5C0AF90CA02dfd2A3", asset: "ETH", label: "Crypto.com Cold Wallet" },
  ],
  bitget: [
    { chain: "ethereum", address: "0x97b9D2102A9a65A26E1EE82D59e42d1B73B68689", asset: "ETH", label: "Bitget Hot Wallet" },
  ],
  mexc: [
    { chain: "ethereum", address: "0x75e89d5979E4f6Fba9F97c104c2F0AFB3F1dcB88", asset: "ETH", label: "MEXC Hot Wallet" },
  ],
}

// API endpoints for exchange Proof of Reserve data
export const EXCHANGE_POR_ENDPOINTS: Record<string, string> = {
  binance: "https://www.binance.com/bapi/composite/v1/public/cms/article/catalog/list/query?catalogId=48&pageNo=1&pageSize=1",
  okx: "https://www.okx.com/api/v5/public/reserve",
  bybit: "https://api2.bybit.com/v3/public/deposit/coin/reserve",
  "gate.io": "https://www.gate.io/api/v4/wallet/total_balance",
  bitget: "https://api.bitget.com/api/v2/spot/public/coins",
}

// Chainlink Proof of Reserve feeds (on-chain verified reserve data)
export const CHAINLINK_POR_FEEDS = [
  {
    exchangeId: "binance",
    feedName: "BNB Proof of Reserve",
    feedAddress: "0x8350b7De6a6a2C1368E7fc58F77e0F0B3e35b3aC",
    chainName: "ethereum-mainnet",
  },
]

// Exchange display metadata
export const EXCHANGE_METADATA: Record<
  string,
  {
    name: string
    shortName: string
    founded: number
    headquarters: string
    porAuditProvider: string | null
    porPageUrl: string | null
  }
> = {
  binance: {
    name: "Binance",
    shortName: "BNB",
    founded: 2017,
    headquarters: "Dubai, UAE",
    porAuditProvider: "Mazars (historical), Self-published",
    porPageUrl: "https://www.binance.com/en/proof-of-reserves",
  },
  coinbase: {
    name: "Coinbase",
    shortName: "CB",
    founded: 2012,
    headquarters: "San Francisco, USA",
    porAuditProvider: "Deloitte (SEC Filings)",
    porPageUrl: "https://www.coinbase.com/blog",
  },
  kraken: {
    name: "Kraken",
    shortName: "KRK",
    founded: 2011,
    headquarters: "San Francisco, USA",
    porAuditProvider: "Armanino LLP",
    porPageUrl: "https://proof-of-reserves.trustexplorer.io/clients/kraken",
  },
  okx: {
    name: "OKX",
    shortName: "OKX",
    founded: 2017,
    headquarters: "Seychelles",
    porAuditProvider: "Self-published (Merkle Tree)",
    porPageUrl: "https://www.okx.com/proof-of-reserves",
  },
  bybit: {
    name: "Bybit",
    shortName: "BB",
    founded: 2018,
    headquarters: "Dubai, UAE",
    porAuditProvider: "Hacken",
    porPageUrl: "https://www.bybit.com/app/user/asset-data",
  },
  "gate.io": {
    name: "Gate.io",
    shortName: "GT",
    founded: 2013,
    headquarters: "Cayman Islands",
    porAuditProvider: "Armanino LLP (historical)",
    porPageUrl: "https://www.gate.io/proof-of-reserves",
  },
  kucoin: {
    name: "KuCoin",
    shortName: "KC",
    founded: 2017,
    headquarters: "Seychelles",
    porAuditProvider: "Mazars (historical)",
    porPageUrl: "https://www.kucoin.com/proof-of-reserves",
  },
  "crypto.com": {
    name: "Crypto.com",
    shortName: "CRO",
    founded: 2016,
    headquarters: "Singapore",
    porAuditProvider: "Mazars (historical)",
    porPageUrl: "https://crypto.com/proof-of-reserves",
  },
  bitget: {
    name: "Bitget",
    shortName: "BG",
    founded: 2018,
    headquarters: "Seychelles",
    porAuditProvider: "Self-published (Merkle Tree)",
    porPageUrl: "https://www.bitget.com/proof-of-reserves",
  },
  mexc: {
    name: "MEXC",
    shortName: "MX",
    founded: 2018,
    headquarters: "Seychelles",
    porAuditProvider: null,
    porPageUrl: "https://www.mexc.com/proof-of-reserves",
  },
}

// Solvency threshold configurations
export const SOLVENCY_THRESHOLDS = {
  HEALTHY_MIN: 1.05, // 105% reserve ratio = healthy
  WARNING_MIN: 1.0,  // 100% reserve ratio = warning
  CRITICAL_MIN: 0.95, // 95% reserve ratio = critical
} as const

export function getSolvencyStatus(ratio: number): SolvencyStatus {
  if (ratio >= SOLVENCY_THRESHOLDS.HEALTHY_MIN) return "healthy"
  if (ratio >= SOLVENCY_THRESHOLDS.WARNING_MIN) return "warning"
  if (ratio >= SOLVENCY_THRESHOLDS.CRITICAL_MIN) return "critical"
  return "critical"
}

export function formatUsd(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

export function formatRatio(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`
}
