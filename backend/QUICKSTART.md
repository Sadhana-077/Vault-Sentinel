# VaultSentinel Backend - Quick Start Guide

Get the VaultSentinel backend running in 5 minutes.

## Prerequisites

- Node.js 20+
- pnpm (or npm/yarn)
- Internet connection (for RPC endpoints)

## 1. Install Dependencies

```bash
cd backend
pnpm install
```

## 2. Configure Environment

```bash
# Copy example config
cp .env.example .env

# Edit .env with your RPC endpoints
# You can get free RPC keys from Alchemy, Infura, or QuickNode
ETHEREUM_RPC=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
POLYGON_RPC=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
ARBITRUM_RPC=https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY
OPTIMISM_RPC=https://opt-mainnet.g.alchemy.com/v2/YOUR_KEY
```

### Getting Free RPC Keys

1. **Alchemy** (Recommended)
   - Go to https://www.alchemy.com/
   - Sign up for free
   - Create app for each network
   - Copy API keys to .env

2. **Infura**
   - https://infura.io/
   - Free tier available

3. **QuickNode**
   - https://www.quicknode.com/
   - Free tier with multiple networks

## 3. Start Development Server

```bash
pnpm dev
```

Server starts on `http://localhost:3001`

You should see:
```
[12:34:56] INFO: Server started on http://localhost:3001
[12:34:56] INFO: Available endpoints:
[12:34:56] INFO:   GET /api/health - Health check
[12:34:56] INFO:   GET /api/exchanges - List all exchanges
[12:34:56] INFO:   GET /api/solvency - Solvency for all exchanges
...
```

## 4. Test the API

### In your browser or curl:

```bash
# Health check
curl http://localhost:3001/api/health

# List exchanges
curl http://localhost:3001/api/exchanges

# Get all solvency data
curl http://localhost:3001/api/solvency

# Get specific exchange solvency
curl http://localhost:3001/api/solvency/binance

# Get reserves
curl http://localhost:3001/api/reserves/binance

# Get liabilities
curl http://localhost:3001/api/liabilities/binance
```

### In JavaScript:

```javascript
// Fetch all solvency data
fetch('http://localhost:3001/api/solvency')
  .then(r => r.json())
  .then(data => {
    console.log('Binance solvency:', data.data.binance);
    console.log('Status:', data.data.binance.status); // 'healthy', 'warning', or 'critical'
  });
```

## Common Tasks

### View Logs

Development mode shows detailed logs:
```bash
LOG_LEVEL=debug pnpm dev
```

### Build for Production

```bash
pnpm build
```

Creates `dist/` folder with compiled code.

### Run Production Build

```bash
pnpm build
NODE_ENV=production pnpm start
```

### Clear Cache

Cache is automatically cleared on server restart. To manually clear:

```typescript
// In src/index.ts, add temporarily:
import { cacheService } from './services/cache.service.js';
cacheService.clear(); // Clear all
```

### Check RPC Connection

```bash
# Test if RPC endpoint is working
curl https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

## Troubleshooting

### "Cannot find module" errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### RPC connection fails

1. Check your API keys in `.env`
2. Verify they're for the correct network
3. Test RPC endpoint directly (see above)
4. Try different RPC provider

### Port already in use

```bash
# Use different port
PORT=3002 pnpm dev

# Or kill process using 3001
lsof -i :3001
kill -9 <PID>
```

### No data returned

1. Ensure RPC endpoints are configured
2. Check logs for errors: `LOG_LEVEL=debug pnpm dev`
3. Verify exchange exists: `curl http://localhost:3001/api/exchanges`

### Slow response times

1. First request is slow (fetches from blockchain) - normal
2. Subsequent requests should be <50ms (cached)
3. Check RPC endpoint latency
4. Try premium RPC tier for production

## Next Steps

1. **Test with Extension**: Connect the Chrome extension to this backend
2. **Read Full Docs**: See README.md for comprehensive documentation
3. **Review API**: See API.md for all endpoints
4. **Deploy**: See DEPLOYMENT.md for production setup
5. **Customize**: Modify exchange list in `src/services/exchange.service.ts`

## Architecture Overview

```
HTTP Request
    ↓
Express Route (/api/solvency/:exchange)
    ↓
Workflow (calculateSolvency)
    ↓
Check Cache ← Hit: Return cached data
    ↓
Not cached: Fetch data
    ↓
RPC Service (ethers.js)
    ↓
Blockchain RPC (Alchemy, etc.)
    ↓
Cache result (15 minutes)
    ↓
HTTP Response
```

## File Structure

```
backend/
├── src/
│   ├── index.ts                 # Express app
│   ├── routes/
│   │   └── index.ts            # API endpoints
│   ├── services/
│   │   ├── cache.service.ts
│   │   ├── rpc.service.ts
│   │   ├── merkle.service.ts
│   │   └── exchange.service.ts
│   ├── workflows/
│   │   ├── reserve.workflow.ts
│   │   ├── liability.workflow.ts
│   │   └── solvency.workflow.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── logger.ts
│   └── middleware/
│       └── validation.ts
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Key Services Explained

### Cache Service
Stores data in memory with TTL to reduce RPC calls:
- First request: 2-3 seconds (fetches from blockchain)
- Subsequent: <50ms (from cache)
- TTL: 15 minutes (configurable)

### RPC Service
Manages connections to blockchain networks:
- Supports: Ethereum, Polygon, Arbitrum, Optimism
- Uses ethers.js library
- Fetches wallet balances

### Exchange Service
Stores wallet addresses for each exchange:
- 10 major exchanges pre-configured
- Easy to add more
- Network-aware filtering

### Merkle Service
Verifies cryptographic proofs:
- Validates liability claims
- Builds Merkle trees
- Calculates roots and proofs

## Environment Variables Reference

```env
# Server
NODE_ENV=development|production
PORT=3001
LOG_LEVEL=debug|info|warn|error

# RPC Endpoints
ETHEREUM_RPC=https://...
POLYGON_RPC=https://...
ARBITRUM_RPC=https://...
OPTIMISM_RPC=https://...

# Cache
CACHE_TTL=15  # minutes

# CORS
CORS_ORIGIN=*|http://localhost:3000|chrome-extension://*
```

## Development Commands

```bash
# Start dev server with hot reload
pnpm dev

# Build TypeScript to JavaScript
pnpm build

# Run compiled version
pnpm start

# Run tests
pnpm test

# Run linter
pnpm lint

# Build and run (production mode)
pnpm build && NODE_ENV=production pnpm start
```

## Support

- Full API documentation: See API.md
- Architecture guide: See ARCHITECTURE.md
- Deployment guide: See DEPLOYMENT.md
- General info: See README.md

For issues, enable debug logging:
```bash
LOG_LEVEL=debug pnpm dev
```
