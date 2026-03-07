import axios from 'axios';
import { cacheService } from '../services/cache.service.js';
import { exchangeService } from '../services/exchange.service.js';
import MerkleService from '../services/merkle.service.js';
import { LiabilityData } from '../types/index.js';
import logger from '../utils/logger.js';

// Mock liability data - in production, fetch from exchange APIs or CRE
const mockLiabilities: Record<string, { liability: number; proof: string }> = {
  binance: { liability: 150000000, proof: 'QmXxxx...' },
  coinbase: { liability: 45000000, proof: 'QmYyyy...' },
  kraken: { liability: 28000000, proof: 'QmZzzz...' },
  okx: { liability: 35000000, proof: 'QmAaaa...' },
  bybit: { liability: 20000000, proof: 'QmBbbb...' },
  gate: { liability: 18000000, proof: 'QmCccc...' },
  huobi: { liability: 15000000, proof: 'QmDddd...' },
  kucoin: { liability: 22000000, proof: 'QmEeee...' },
  mexc: { liability: 12000000, proof: 'QmFfff...' },
  upbit: { liability: 8000000, proof: 'QmGggg...' },
};

export async function fetchLiabilityData(exchangeId: string): Promise<LiabilityData> {
  const cacheKey = `liability:${exchangeId}`;
  const cached = cacheService.get<LiabilityData>(cacheKey);
  if (cached) {
    return cached;
  }

  const exchange = exchangeService.getExchange(exchangeId);
  if (!exchange) {
    throw new Error(`Exchange not found: ${exchangeId}`);
  }

  try {
    const mockData = mockLiabilities[exchangeId.toLowerCase()];
    if (!mockData) {
      throw new Error(`No liability data for ${exchangeId}`);
    }

    // In production, would fetch actual Merkle root from on-chain or API
    const merkleRoot = MerkleService.getRoot([
      exchangeId,
      mockData.liability.toString(),
    ]);

    const liabilityData: LiabilityData = {
      exchange: exchangeId,
      totalLiability: mockData.liability.toString(),
      liabilityInUSD: mockData.liability,
      merkleRoot,
      merkleProofUrl: mockData.proof,
      verified: true, // Would be verified via Merkle proof in production
      timestamp: Date.now(),
    };

    cacheService.set(cacheKey, liabilityData, 15 * 60 * 1000); // 15 minute cache

    logger.info(
      {
        exchange: exchangeId,
        liability: mockData.liability,
        merkleRoot,
      },
      'Liability data fetched successfully'
    );

    return liabilityData;
  } catch (error) {
    logger.error(
      { error, exchangeId },
      'Failed to fetch liability data'
    );
    throw error;
  }
}

export async function fetchAllLiabilities(): Promise<Map<string, LiabilityData>> {
  const liabilities = new Map<string, LiabilityData>();
  const exchanges = exchangeService.getAllExchanges();

  const promises = exchanges.map(async (exchange) => {
    try {
      const data = await fetchLiabilityData(exchange.id);
      liabilities.set(exchange.id, data);
    } catch (error) {
      logger.error(
        { error, exchange: exchange.id },
        'Failed to fetch liability'
      );
    }
  });

  await Promise.all(promises);
  return liabilities;
}
