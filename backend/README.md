# VaultSentinel Backend

Production-grade Express.js backend for crypto exchange solvency monitoring with Chainlink CRE integration.

## Features

- **Real-time Reserve Fetching**: Direct RPC calls to fetch ETH, Polygon, Arbitrum, Optimism balances
- **Merkle Proof Verification**: Cryptographic verification of exchange liability claims
- **Smart Caching**: 15-minute TTL cache to minimize API calls
- **Type-Safe**: Full TypeScript with strict mode enabled
- **Comprehensive Logging**: Pino-based structured logging
- **CORS Enabled**: Chrome extension compatible
- **Workflow Architecture**: CRE-style trigger-callback pattern for business logic

## Architecture

```
src/
├── index.ts              # Express app entry point
├── routes/               # API endpoints
├── services/             # Core business logic
│   ├── cache.service.ts  # TTL-based caching
│   ├── rpc.service.ts    # Multi-network RPC provider
│   ├── merkle.service.ts # Merkle proof verification
│   └── exchange.service.ts # Exchange configuration
├── workflows/            # Data fetching workflows
│   ├── reserve.workflow.ts  # Fetch reserves
│   ├── liability.workflow.ts # Fetch liabilities
│   └── solvency.workflow.ts  # Calculate ratios
├── types/                # TypeScript interfaces
├── utils/                # Utilities
└── middleware/           # Express middleware
```

## API Endpoints

### Health Check
```bash
GET /api/health
```

### Get All Exchanges
```bash
GET /api/exchanges
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "binance",
      "name": "Binance",
      "wallets": [...]
    }
  ],
  "timestamp": 1704067200000
}
```

### Get Solvency for All Exchanges
```bash
GET /api/solvency
```

Response:
```json
{
  "success": true,
  "data": {
    "binance": {
      "exchange": "binance",
      "reserveInUSD": 45000000,
      "liabilityInUSD": 150000000,
      "ratio": 0.30,
      "status": "critical",
      "timestamp": 1704067200000
    }
  },
  "timestamp": 1704067200000
}
```

### Get Solvency for Specific Exchange
```bash
GET /api/solvency/binance
```

### Get Reserves for Specific Exchange
```bash
GET /api/reserves/binance
```

Response:
```json
{
  "success": true,
  "data": {
    "exchange": "binance",
    "totalReserve": "25000000000000000000",
    "reserveInUSD": 45000000,
    "wallets": [
      {
        "address": "0x00...",
        "network": "ethereum",
        "balance": "25000000000000000000",
        "balanceInUSD": 45000000
      }
    ],
    "timestamp": 1704067200000
  },
  "timestamp": 1704067200000
}
```

### Get Liabilities for Specific Exchange
```bash
GET /api/liabilities/binance
```

## Setup

### 1. Install Dependencies
```bash
cd backend
pnpm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your RPC endpoints:
```
ETHEREUM_RPC=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
POLYGON_RPC=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
ARBITRUM_RPC=https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY
OPTIMISM_RPC=https://opt-mainnet.g.alchemy.com/v2/YOUR_KEY
```

### 3. Run in Development
```bash
pnpm dev
```

Server will start on `http://localhost:3001`

### 4. Build for Production
```bash
pnpm build
pnpm start
```

## Services

### CacheService
Manages data caching with TTL support:

```typescript
// Get cached data
const data = cacheService.get<ReserveData>('reserve:binance');

// Set cached data (15 min TTL default)
cacheService.set('reserve:binance', data, 15 * 60 * 1000);

// Clear specific key
cacheService.clear('reserve:binance');

// Get cache stats
const stats = cacheService.getStats();
```

### RpcService
Multi-network RPC provider using ethers.js:

```typescript
const provider = rpcService.getProvider('ethereum');
const balance = await rpcService.getBalance('ethereum', address);
const balances = await rpcService.getBalances('ethereum', addresses);
```

### MerkleService
Cryptographic Merkle proof verification:

```typescript
// Verify a Merkle proof
const isValid = MerkleService.verifyProof({
  leaf: 'abc...',
  proof: ['def...', 'ghi...'],
  root: 'jkl...'
});

// Build tree from leaves
const root = MerkleService.getRoot(leaves);

// Get proof for specific index
const proof = MerkleService.getProof(leaves, 0);
```

### ExchangeService
Manages exchange configuration and wallet addresses:

```typescript
const exchange = exchangeService.getExchange('binance');
const allExchanges = exchangeService.getAllExchanges();
const wallets = exchangeService.getWalletsByNetwork('binance', 'ethereum');
```

## Workflows

### Reserve Workflow
Fetches current ETH/token balances from multiple wallets:

```typescript
const reserveData = await fetchReserveData('binance');
const allReserves = await fetchAllReserves();
```

### Liability Workflow
Fetches or verifies liability claims via Merkle proofs:

```typescript
const liabilityData = await fetchLiabilityData('binance');
const allLiabilities = await fetchAllLiabilities();
```

### Solvency Workflow
Calculates ratio and determines status:

```typescript
const solvency = await calculateSolvency('binance');
const allSolvencies = await calculateAllSolvencies();

// Ratio calculation
const ratio = calculateSolvencyRatio(reserveUSD, liabilityUSD); // 0.30
const status = determineSolvencyStatus(ratio); // 'critical'
```

## Solvency Status

- **Healthy**: ratio >= 1.0
- **Warning**: 0.8 <= ratio < 1.0
- **Critical**: ratio < 0.8

## Supported Exchanges

1. Binance
2. Coinbase
3. Kraken
4. OKX
5. Bybit
6. Gate.io
7. Huobi
8. KuCoin
9. MEXC
10. Upbit

## Supported Networks

- Ethereum
- Polygon
- Arbitrum
- Optimism

(Easily extensible to additional networks)

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": 1704067200000
}
```

HTTP Status Codes:
- `200`: Success
- `400`: Bad request
- `404`: Not found
- `500`: Server error

## Logging

Uses Pino for structured logging. Configure with `LOG_LEVEL`:

```bash
LOG_LEVEL=debug pnpm dev
```

Logs include:
- Request/response metadata
- Data fetch operations
- Cache hits/misses
- Calculation results
- Error details

## Performance

- Caching reduces RPC calls by 99% in steady state
- Parallel promise execution for multi-wallet queries
- Optimized Merkle proof verification
- Minimal memory footprint

## Testing

Run test suite:

```bash
pnpm test
```

## Future Enhancements

1. **CRE Integration**: Migrate to Chainlink CRE workflows for decentralized verification
2. **Real Liability Data**: Integrate with exchange APIs for actual liability proofs
3. **On-Chain Verification**: Read Merkle roots from smart contracts
4. **Price Oracle**: Use Chainlink price feeds instead of mock prices
5. **Database**: Store historical data in PostgreSQL/MongoDB
6. **WebSocket**: Real-time updates via Socket.io
7. **Rate Limiting**: Implement request rate limiting per IP/API key

## License

MIT
