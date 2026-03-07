import { ethers } from 'ethers';
import logger from '../utils/logger.js';

interface RpcConfig {
  ethereum?: string;
  polygon?: string;
  arbitrum?: string;
  optimism?: string;
}

class RpcService {
  private providers: Record<string, ethers.JsonRpcProvider>;

  constructor(config: RpcConfig) {
    this.providers = {};

    if (config.ethereum) {
      this.providers['ethereum'] = new ethers.JsonRpcProvider(config.ethereum);
      logger.info('Ethereum provider initialized');
    }
    if (config.polygon) {
      this.providers['polygon'] = new ethers.JsonRpcProvider(config.polygon);
      logger.info('Polygon provider initialized');
    }
    if (config.arbitrum) {
      this.providers['arbitrum'] = new ethers.JsonRpcProvider(config.arbitrum);
      logger.info('Arbitrum provider initialized');
    }
    if (config.optimism) {
      this.providers['optimism'] = new ethers.JsonRpcProvider(config.optimism);
      logger.info('Optimism provider initialized');
    }
  }

  getProvider(network: string): ethers.JsonRpcProvider {
    const provider = this.providers[network.toLowerCase()];
    if (!provider) {
      throw new Error(`RPC provider not configured for network: ${network}`);
    }
    return provider;
  }

  async getBalance(network: string, address: string): Promise<string> {
    try {
      const provider = this.getProvider(network);
      const balance = await provider.getBalance(address);
      logger.debug(`Fetched balance for ${address} on ${network}: ${balance}`);
      return balance.toString();
    } catch (error) {
      logger.error(
        { error, address, network },
        'Failed to fetch balance'
      );
      throw error;
    }
  }

  async getBalances(network: string, addresses: string[]): Promise<string[]> {
    try {
      const provider = this.getProvider(network);
      const balances = await Promise.all(
        addresses.map((addr) => provider.getBalance(addr))
      );
      logger.debug(
        `Fetched ${balances.length} balances from ${network}`
      );
      return balances.map((b) => b.toString());
    } catch (error) {
      logger.error(
        { error, network, addressCount: addresses.length },
        'Failed to fetch balances'
      );
      throw error;
    }
  }

  async getBlockNumber(network: string): Promise<number> {
    try {
      const provider = this.getProvider(network);
      const blockNumber = await provider.getBlockNumber();
      return blockNumber;
    } catch (error) {
      logger.error({ error, network }, 'Failed to fetch block number');
      throw error;
    }
  }
}

export function createRpcService(): RpcService {
  const config: RpcConfig = {
    ethereum: process.env.ETHEREUM_RPC,
    polygon: process.env.POLYGON_RPC,
    arbitrum: process.env.ARBITRUM_RPC,
    optimism: process.env.OPTIMISM_RPC,
  };

  return new RpcService(config);
}

export const rpcService = createRpcService();
