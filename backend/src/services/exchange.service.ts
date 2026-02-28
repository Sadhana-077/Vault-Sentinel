import { ExchangeConfig, ExchangeWallet } from '../types/index.js';
import logger from '../utils/logger.js';

class ExchangeService {
  private exchanges: Map<string, ExchangeConfig>;

  constructor() {
    this.exchanges = new Map();
    this.initializeExchanges();
  }

  private initializeExchanges(): void {
    const exchangeConfigs: ExchangeConfig[] = [
      {
        id: 'binance',
        name: 'Binance',
        wallets: [
          {
            address: '0x00000000219ab540356cbb839cbe05303d7705fa',
            network: 'ethereum',
            description: 'Binance Deposit Address 1',
          },
          {
            address: '0x28c6c06298d161e40a5a40a8c8391d3824ffc2c6',
            network: 'ethereum',
            description: 'Binance Deposit Address 2',
          },
        ],
      },
      {
        id: 'coinbase',
        name: 'Coinbase',
        wallets: [
          {
            address: '0xddfabcdc4d8ffc6d5beaf154f447c27871f4a27b',
            network: 'ethereum',
            description: 'Coinbase Commerce',
          },
        ],
      },
      {
        id: 'kraken',
        name: 'Kraken',
        wallets: [
          {
            address: '0x2910543af39aba0cd09dbb2d50200b3e800a74d2',
            network: 'ethereum',
            description: 'Kraken Deposit Address',
          },
        ],
      },
      {
        id: 'okx',
        name: 'OKX',
        wallets: [
          {
            address: '0x6cc5f688917b1da659af69b4b36f83e4c0f7e1e4',
            network: 'ethereum',
            description: 'OKX Deposit Address',
          },
        ],
      },
      {
        id: 'bybit',
        name: 'Bybit',
        wallets: [
          {
            address: '0xf89d7b9c864f589bbf53a82ff36ac9e4abff5f4c',
            network: 'ethereum',
            description: 'Bybit Wallet',
          },
        ],
      },
      {
        id: 'gate',
        name: 'Gate.io',
        wallets: [
          {
            address: '0x0d0707963952f2fba59dd06f2b425ace40b492fe',
            network: 'ethereum',
            description: 'Gate.io Deposit Address',
          },
        ],
      },
      {
        id: 'huobi',
        name: 'Huobi',
        wallets: [
          {
            address: '0x5754284f67d7567f72ce28e21418f3d6f95f17d9',
            network: 'ethereum',
            description: 'Huobi Deposit Address',
          },
        ],
      },
      {
        id: 'kucoin',
        name: 'KuCoin',
        wallets: [
          {
            address: '0x2b5634c42104b9f0732ec6fb1166fd5ebf832f37',
            network: 'ethereum',
            description: 'KuCoin Deposit Address',
          },
        ],
      },
      {
        id: 'mexc',
        name: 'MEXC',
        wallets: [
          {
            address: '0xc944e90b900c64c2ccf912220d83b61c76b41eca',
            network: 'ethereum',
            description: 'MEXC Deposit Address',
          },
        ],
      },
      {
        id: 'upbit',
        name: 'Upbit',
        wallets: [
          {
            address: '0x390de26d772d2e2005c6d1d24adc34e3cbead4a2',
            network: 'ethereum',
            description: 'Upbit Deposit Address',
          },
        ],
      },
    ];

    exchangeConfigs.forEach((config) => {
      this.exchanges.set(config.id, config);
    });

    logger.info(`Initialized ${exchangeConfigs.length} exchanges`);
  }

  getExchange(id: string): ExchangeConfig | undefined {
    return this.exchanges.get(id.toLowerCase());
  }

  getAllExchanges(): ExchangeConfig[] {
    return Array.from(this.exchanges.values());
  }

  getWalletsByNetwork(
    exchangeId: string,
    network: string
  ): ExchangeWallet[] {
    const exchange = this.getExchange(exchangeId);
    if (!exchange) return [];

    return exchange.wallets.filter(
      (w) => w.network.toLowerCase() === network.toLowerCase()
    );
  }

  getAllWalletsByNetwork(network: string): Map<string, ExchangeWallet[]> {
    const result = new Map<string, ExchangeWallet[]>();

    this.exchanges.forEach((exchange, id) => {
      const wallets = this.getWalletsByNetwork(id, network);
      if (wallets.length > 0) {
        result.set(id, wallets);
      }
    });

    return result;
  }

  /**
   * Get all exchanges
   */
  getAllExchanges(): ExchangeConfig[] {
    return Array.from(this.exchanges.values());
  }
}

export const exchangeService = new ExchangeService();
