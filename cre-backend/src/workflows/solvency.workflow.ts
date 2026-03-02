import { SolvencyData } from '../types/index.js';
import { fetchReserveData } from './reserve.workflow.js';
import { fetchLiabilityData } from './liability.workflow.js';
import { cacheService } from '../services/cache.service.js';
import { exchangeService } from '../services/exchange.service.js';
import logger from '../utils/logger.js';

const THRESHOLDS = {
  healthy: 1.0, // >= 1.0
  warning: 0.8, // 0.8 - 0.99
  critical: 0.0, // < 0.8
};

export function calculateSolvencyRatio(
  reserveUSD: number,
  liabilityUSD: number
): number {
  if (liabilityUSD === 0) return 1.0;
  return reserveUSD / liabilityUSD;
}

export function determineSolvencyStatus(
  ratio: number
): 'healthy' | 'warning' | 'critical' {
  if (ratio >= THRESHOLDS.healthy) return 'healthy';
  if (ratio >= THRESHOLDS.warning) return 'warning';
  return 'critical';
}

export async function calculateSolvency(
  exchangeId: string
): Promise<SolvencyData> {
  const cacheKey = `solvency:${exchangeId}`;
  const cached = cacheService.get<SolvencyData>(cacheKey);
  if (cached) {
    return cached;
  }

  const exchange = exchangeService.getExchange(exchangeId);
  if (!exchange) {
    throw new Error(`Exchange not found: ${exchangeId}`);
  }

  try {
    const [reserve, liability] = await Promise.all([
      fetchReserveData(exchangeId),
      fetchLiabilityData(exchangeId),
    ]);

    const ratio = calculateSolvencyRatio(
      reserve.reserveInUSD,
      liability.liabilityInUSD
    );
    const status = determineSolvencyStatus(ratio);

    const solvencyData: SolvencyData = {
      exchange: exchangeId,
      reserveInUSD: reserve.reserveInUSD,
      liabilityInUSD: liability.liabilityInUSD,
      ratio,
      status,
      timestamp: Date.now(),
    };

    cacheService.set(cacheKey, solvencyData, 15 * 60 * 1000); // 15 minute cache

    logger.info(
      {
        exchange: exchangeId,
        reserveUSD: reserve.reserveInUSD,
        liabilityUSD: liability.liabilityInUSD,
        ratio: ratio.toFixed(4),
        status,
      },
      'Solvency calculated'
    );

    return solvencyData;
  } catch (error) {
    logger.error(
      { error, exchangeId },
      'Failed to calculate solvency'
    );
    throw error;
  }
}

export async function calculateAllSolvencies(): Promise<Map<string, SolvencyData>> {
  const solvencies = new Map<string, SolvencyData>();
  const exchanges = exchangeService.getAllExchanges();

  const promises = exchanges.map(async (exchange) => {
    try {
      const data = await calculateSolvency(exchange.id);
      solvencies.set(exchange.id, data);
    } catch (error) {
      logger.error(
        { error, exchange: exchange.id },
        'Failed to calculate solvency'
      );
    }
  });

  await Promise.all(promises);
  return solvencies;
}
