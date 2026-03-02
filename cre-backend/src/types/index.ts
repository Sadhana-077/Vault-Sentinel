export interface ExchangeWallet {
  address: string;
  network: 'ethereum' | 'polygon' | 'arbitrum' | 'optimism';
  description?: string;
}

export interface ExchangeConfig {
  id: string;
  name: string;
  wallets: ExchangeWallet[];
  liabilityProofUrl?: string;
  merkleRootContract?: string;
}

export interface ReserveData {
  exchange: string;
  totalReserve: string;
  reserveInUSD: number;
  wallets: {
    address: string;
    network: string;
    balance: string;
    balanceInUSD: number;
  }[];
  timestamp: number;
}

export interface LiabilityData {
  exchange: string;
  totalLiability: string;
  liabilityInUSD: number;
  merkleRoot?: string;
  merkleProofUrl?: string;
  verified: boolean;
  timestamp: number;
}

export interface SolvencyData {
  exchange: string;
  reserveInUSD: number;
  liabilityInUSD: number;
  ratio: number;
  status: 'healthy' | 'warning' | 'critical';
  timestamp: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // in milliseconds
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}
