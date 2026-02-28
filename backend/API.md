# VaultSentinel Backend API Documentation

Complete API reference for the VaultSentinel backend service.

## Base URL

```
http://localhost:3001/api
```

## Authentication

Currently no authentication required. In production, add:
- API Key validation
- Rate limiting per key
- JWT tokens

## Response Format

All responses follow this structure:

```json
{
  "success": true|false,
  "data": {...},
  "error": "error message",
  "timestamp": 1704067200000
}
```

## Endpoints

### 1. Health Check

**Endpoint:** `GET /health`

**Purpose:** Verify backend is running

**Response:**
```json
{
  "status": "ok",
  "timestamp": 1704067200000
}
```

---

### 2. List All Exchanges

**Endpoint:** `GET /exchanges`

**Purpose:** Get configuration for all supported exchanges

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "binance",
      "name": "Binance",
      "wallets": [
        {
          "address": "0x00000000219ab540356cbb839cbe05303d7705fa",
          "network": "ethereum",
          "description": "Binance Deposit Address 1"
        }
      ],
      "liabilityProofUrl": null,
      "merkleRootContract": null
    },
    ...
  ],
  "timestamp": 1704067200000
}
```

---

### 3. Get All Solvency Data

**Endpoint:** `GET /solvency`

**Purpose:** Get solvency ratios for all exchanges

**Response:**
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
    },
    "coinbase": {
      "exchange": "coinbase",
      "reserveInUSD": 15000000,
      "liabilityInUSD": 45000000,
      "ratio": 0.33,
      "status": "critical",
      "timestamp": 1704067200000
    },
    ...
  },
  "timestamp": 1704067200000
}
```

**Status Values:**
- `healthy`: ratio >= 1.0
- `warning`: 0.8 <= ratio < 1.0
- `critical`: ratio < 0.8

---

### 4. Get Single Exchange Solvency

**Endpoint:** `GET /solvency/:exchange`

**Parameters:**
- `exchange` (string, path): Exchange ID (e.g., "binance", "coinbase")

**Example:** `GET /solvency/binance`

**Response:**
```json
{
  "success": true,
  "data": {
    "exchange": "binance",
    "reserveInUSD": 45000000,
    "liabilityInUSD": 150000000,
    "ratio": 0.30,
    "status": "critical",
    "timestamp": 1704067200000
  },
  "timestamp": 1704067200000
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Exchange not found: invalid",
  "timestamp": 1704067200000
}
```

---

### 5. Get Exchange Reserves

**Endpoint:** `GET /reserves/:exchange`

**Parameters:**
- `exchange` (string, path): Exchange ID

**Example:** `GET /reserves/binance`

**Response:**
```json
{
  "success": true,
  "data": {
    "exchange": "binance",
    "totalReserve": "18750000000000000000",
    "reserveInUSD": 45000000,
    "wallets": [
      {
        "address": "0x00000000219ab540356cbb839cbe05303d7705fa",
        "network": "ethereum",
        "balance": "18750000000000000000",
        "balanceInUSD": 45000000
      }
    ],
    "timestamp": 1704067200000
  },
  "timestamp": 1704067200000
}
```

**Notes:**
- `balance` is in Wei (smallest unit)
- `balanceInUSD` is calculated using current network prices
- Data is cached for 15 minutes

---

### 6. Get Exchange Liabilities

**Endpoint:** `GET /liabilities/:exchange`

**Parameters:**
- `exchange` (string, path): Exchange ID

**Example:** `GET /liabilities/binance`

**Response:**
```json
{
  "success": true,
  "data": {
    "exchange": "binance",
    "totalLiability": "150000000",
    "liabilityInUSD": 150000000,
    "merkleRoot": "0x1234...abcd",
    "merkleProofUrl": "QmXxxx...",
    "verified": true,
    "timestamp": 1704067200000
  },
  "timestamp": 1704067200000
}
```

**Fields:**
- `totalLiability`: User account balances (in USD or token amount)
- `merkleRoot`: Keccak-256 hash of liability Merkle tree
- `merkleProofUrl`: IPFS/URL to full Merkle proof
- `verified`: Whether liability has been cryptographically verified

---

## Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | Bad request | Invalid parameters |
| 404 | Exchange not found | Unknown exchange ID |
| 500 | Internal server error | Server/RPC error |

---

## Rate Limiting

Currently unlimited. Future versions will implement:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1704067200
```

---

## Caching

All data endpoints implement 15-minute caching:

```
Cache-Control: public, max-age=900
```

Clear cache by:
1. Waiting 15 minutes
2. Restarting server
3. (Future) API endpoint for cache invalidation

---

## Example Requests

### Using curl

```bash
# Health check
curl http://localhost:3001/api/health

# Get all solvency data
curl http://localhost:3001/api/solvency

# Get Binance solvency
curl http://localhost:3001/api/solvency/binance

# Get Binance reserves
curl http://localhost:3001/api/reserves/binance
```

### Using JavaScript/Fetch

```javascript
// Get solvency for all exchanges
const response = await fetch('http://localhost:3001/api/solvency');
const { data } = await response.json();

// Get specific exchange solvency
const binanceResponse = await fetch('http://localhost:3001/api/solvency/binance');
const binanceData = await binanceResponse.json();

console.log(binanceData.data.status); // 'critical' | 'warning' | 'healthy'
```

### Using Python

```python
import requests

url = 'http://localhost:3001/api/solvency'
response = requests.get(url)
data = response.json()

for exchange, solvency in data['data'].items():
    print(f"{exchange}: {solvency['status']}")
```

---

## Data Types

### ExchangeConfig
```typescript
{
  id: string;                  // 'binance'
  name: string;                // 'Binance'
  wallets: ExchangeWallet[];
  liabilityProofUrl?: string;
  merkleRootContract?: string;
}
```

### ExchangeWallet
```typescript
{
  address: string;        // '0x...'
  network: string;        // 'ethereum' | 'polygon' | 'arbitrum' | 'optimism'
  description?: string;
}
```

### ReserveData
```typescript
{
  exchange: string;
  totalReserve: string;   // Wei amount
  reserveInUSD: number;
  wallets: {
    address: string;
    network: string;
    balance: string;      // Wei amount
    balanceInUSD: number;
  }[];
  timestamp: number;
}
```

### LiabilityData
```typescript
{
  exchange: string;
  totalLiability: string;
  liabilityInUSD: number;
  merkleRoot?: string;
  merkleProofUrl?: string;
  verified: boolean;
  timestamp: number;
}
```

### SolvencyData
```typescript
{
  exchange: string;
  reserveInUSD: number;
  liabilityInUSD: number;
  ratio: number;          // 0.0 - 1.0+
  status: 'healthy' | 'warning' | 'critical';
  timestamp: number;
}
```

---

## Performance Tips

1. **Batch Requests**: Call `/api/solvency` once instead of multiple `/api/solvency/:exchange`
2. **Cache Aware**: Data is cached 15 minutes - plan refresh frequency accordingly
3. **Async Calls**: Use Promise.all() to parallelize multiple requests
4. **Error Handling**: Implement retry logic with exponential backoff

---

## Future Endpoints

Planned additions:

```
GET /health/detailed          # Detailed diagnostics
GET /cache/stats              # Cache performance metrics
POST /cache/clear/:key        # Clear specific cache entry
GET /prices/:network          # Current network prices
GET /history/:exchange        # Historical solvency data
WS /updates                   # WebSocket real-time updates
```

---

## Support

For issues or questions:
1. Check logs: `LOG_LEVEL=debug pnpm dev`
2. Verify RPC endpoints in `.env`
3. Check exchange IDs are valid
4. Review error response details
