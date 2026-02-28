export interface Exchange {
  name: string
  logo: string
  color: string
  walletAddresses: string[]
  yearFounded: number
}

export const EXCHANGES: Exchange[] = [
  {
    name: 'Binance',
    logo: 'https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png',
    color: '#F3BA2F',
    walletAddresses: [
      '0x3333...', // Placeholder - real addresses would be here
    ],
    yearFounded: 2017,
  },
  {
    name: 'Coinbase',
    logo: 'https://assets.coingecko.com/coins/images/18/large/coinbase.png',
    color: '#0052FF',
    walletAddresses: ['0x5555...'],
    yearFounded: 2012,
  },
  {
    name: 'Kraken',
    logo: 'https://assets.coingecko.com/coins/images/558/large/kraken_logo.png',
    color: '#623582',
    walletAddresses: ['0x6666...'],
    yearFounded: 2011,
  },
  {
    name: 'OKX',
    logo: 'https://assets.coingecko.com/coins/images/18102/large/okx.png',
    color: '#000000',
    walletAddresses: ['0x7777...'],
    yearFounded: 2017,
  },
  {
    name: 'Bybit',
    logo: 'https://assets.coingecko.com/coins/images/17673/large/bybit_logo.png',
    color: '#F7931A',
    walletAddresses: ['0x8888...'],
    yearFounded: 2018,
  },
  {
    name: 'Huobi',
    logo: 'https://assets.coingecko.com/coins/images/9531/large/huobi.png',
    color: '#1890FF',
    walletAddresses: ['0x9999...'],
    yearFounded: 2013,
  },
  {
    name: 'Gate.io',
    logo: 'https://assets.coingecko.com/coins/images/8846/large/gate_logo.png',
    color: '#0066FF',
    walletAddresses: ['0xAAAA...'],
    yearFounded: 2013,
  },
  {
    name: 'Bitfinex',
    logo: 'https://assets.coingecko.com/coins/images/12124/large/bitfinex_logo.png',
    color: '#1FA573',
    walletAddresses: ['0xBBBB...'],
    yearFounded: 2012,
  },
  {
    name: 'Kucoin',
    logo: 'https://assets.coingecko.com/coins/images/10375/large/KCS.png',
    color: '#26A17B',
    walletAddresses: ['0xCCCC...'],
    yearFounded: 2017,
  },
  {
    name: 'Upbit',
    logo: 'https://assets.coingecko.com/coins/images/14621/large/upbit_logo.png',
    color: '#FF6B35',
    walletAddresses: ['0xDDDD...'],
    yearFounded: 2017,
  },
]

export function getExchangeByName(name: string): Exchange | undefined {
  return EXCHANGES.find(e => e.name.toLowerCase() === name.toLowerCase())
}
