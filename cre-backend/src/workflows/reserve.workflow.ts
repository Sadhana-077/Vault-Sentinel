import { ethers } from 'ethers';
import { rpcService } from '../services/rpc.service.js';
import { cacheService } from '../services/cache.service.js';
import { exchangeService } from '../services/exchange.service.js';
import { ReserveData } from '../types/index.js';
import logger from '../utils/logger.js';

// Simple price feed - in production, use Chainlink CRE or similar
const ETH_PRICE_USD = 2400;
const MATIC_PRICE_USD = 0.85;
const ARB_PRICE_USD = 1.2;
const OP_PRICE_USD = 2.1;

const networkPrices: Record<string, number> = {
  ethereum: ETH_PRICE_USD,
  polygon: MATIC_PRICE_USD,
  arbitrum: ARB_PRICE_USD,
  optimism: OP_PRICE_USD,
};

export async function fetchReserveData(exchangeId: string): Promise<ReserveData> {
  const cacheKey = `reserve:${exchangeId}`;
  const cached = cacheService.get<ReserveData>(cacheKey);
  if (cached) {
    return cached;
  }

  const exchange = exchangeService.getExchange(exchangeId);
  if (!exchange) {
    throw new Error(`Exchange not found: ${exchangeId}`);
  }

  const walletData: ReserveData['wallets'] = [];
  let totalReserveWei = ethers.parseEther('0');

  try {
    for (const wallet of exchange.wallets) {
      const balance = await rpcService.getBalance(
        wallet.network,
        wallet.address
      );
      const balanceWei = ethers.getBigInt(balance);
      totalReserveWei = totalReserveWei + balanceWei;

      const balanceEther = ethers.formatEther(balanceWei);
      const priceUSD = networkPrices[wallet.network] || 1;
      const balanceInUSD = parseFloat(balanceEther) * priceUSD;

      walletData.push({
        address: wallet.address,
        network: wallet.network,
        balance: balance,
        balanceInUSD,
      });

      logger.debug(
        {
          exchange: exchangeId,
          wallet: wallet.address,
          network: wallet.network,
          balance: balanceEther,
          balanceInUSD,
        },
        'Fetched wallet balance'
      );
    }

    const totalReserveEther = ethers.formatEther(totalReserveWei);
    const totalReserveUSD = walletData.reduce(
      (sum, w) => sum + w.balanceInUSD,
      0
    );

    const reserveData: ReserveData = {
      exchange: exchangeId,
      totalReserve: totalReserveWei.toString(),
      reserveInUSD: totalReserveUSD,
      wallets: walletData,
      timestamp: Date.now(),
    };

    cacheService.set(cacheKey, reserveData, 15 * 60 * 1000); // 15 minute cache

    logger.info(
      {
        exchange: exchangeId,
        totalReserveEther,
        totalReserveUSD,
        walletCount: walletData.length,
      },
      'Reserve data fetched successfully'
    );

    return reserveData;
  } catch (error) {
    logger.error(
      { error, exchangeId },
      'Failed to fetch reserve data'
    );
    throw error;
  }
}

export async function fetchAllReserves(): Promise<Map<string, ReserveData>> {
  const reserves = new Map<string, ReserveData>();
  const exchanges = exchangeService.getAllExchanges();

  const promises = exchanges.map(async (exchange) => {
    try {
      const data = await fetchReserveData(exchange.id);
      reserves.set(exchange.id, data);
    } catch (error) {
      logger.error({ error, exchange: exchange.id }, 'Failed to fetch reserve');
    }
  });

  await Promise.all(promises);
  return reserves;
}
