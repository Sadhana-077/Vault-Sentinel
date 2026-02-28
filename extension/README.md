# VaultSentinel Chrome Extension

Real-time crypto exchange solvency monitoring powered by **Chainlink Cryptographic Proof of Reserve (CRE)** oracle.

## Overview

VaultSentinel is a production-grade Chrome extension that provides real-time monitoring of cryptocurrency exchange solvency ratios. It uses Chainlink's Cryptographic Proof of Reserve to fetch verified reserve and liability data from top exchanges, calculating solvency ratios and alerting users to potential risks.

## Features

### Core Monitoring
- **Real-time Solvency Tracking**: Monitor reserve-to-liability ratios for 10+ major exchanges (Binance, Coinbase, Kraken, OKX, Bybit, and more)
- **Merkle Tree Verification**: All reserve and liability data is cryptographically verified using Merkle proofs
- **Multi-Layer Status Indicators**: Healthy (≥100%), Warning (≥95%), Critical (<95%) status badges
- **Automatic Alerts**: Smart notifications for critical solvency events

### Dashboard Features
- **Popup View**: Quick overview with top 4 exchanges and active alerts
- **Full Dashboard**: Comprehensive view with charts, detailed exchange data, and historical trends
- **Exchange Details**: Deep dive into individual exchange reserves, liabilities, asset composition, and verification status
- **Visual Analytics**: Reserve vs. liability comparison charts with interactive tooltips
- **Real-time Updates**: 15-minute auto-refresh cycle with manual refresh capability

### Data Integrity
- **CRE Integration**: Fetches data directly from Chainlink CRE WASM backend
- **Merkle Proof Verification**: All data is cryptographically signed and verified
- **On-chain Validation**: Verification badges indicate confirmed on-chain data
- **Chrome Storage Cache**: 15-minute TTL cache to reduce API calls and improve performance

## Architecture

### File Structure

```
extension/
├── src/
│   ├── background.ts                # Service worker for periodic refresh
│   ├── popup.tsx                    # Popup UI entry point
│   ├── popup.css                    # Popup styles
│   ├── popup.html                   # Popup HTML
│   │
│   ├── components/
│   │   ├── exchange-card.tsx        # Exchange display card
│   │   ├── animated-exchange-card.tsx # Animated variant with Framer Motion
│   │   ├── solvency-indicator.tsx   # Status bar with ratio
│   │   ├── alerts-section.tsx       # Alert display component
│   │   ├── exchange-detail.tsx      # Detail page component
│   │   └── solvency-chart.tsx       # Recharts visualization
│   │
│   ├── pages/
│   │   ├── dashboard.tsx            # Full dashboard page
│   │   ├── dashboard.html           # Dashboard HTML
│   │   └── dashboard.css            # Dashboard styles
│   │
│   ├── services/
│   │   ├── cre-service.ts           # Chainlink CRE API integration
│   │   └── storage-service.ts       # Chrome storage wrapper with caching
│   │
│   ├── store/
│   │   └── dashboard-store.ts       # Zustand global state management
│   │
│   ├── lib/
│   │   └── exchanges.ts             # Exchange configuration and data
│   │
│   └── types.ts                     # TypeScript type definitions
│
├── manifest.json                    # Manifest V3 configuration
├── vite.config.ts                   # Vite build configuration
├── tsconfig.json                    # TypeScript configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── postcss.config.js                # PostCSS configuration
└── package.json                     # Dependencies
```

### Key Components

#### CREService
Handles all communication with Chainlink CRE oracles:
- `fetchExchangeReserve()` - Fetch reserve data with merkle proof
- `fetchExchangeLiabilities()` - Fetch liability data
- `verifyMerkleProof()` - Cryptographic verification
- `fetchAllExchanges()` - Parallel fetch for all exchanges
- `getOnChainVerification()` - Retrieve on-chain validation details

#### StorageService
Manages persistent data and caching:
- Local storage with TTL-based cache invalidation
- User preference storage (sync storage)
- Cache hit/miss management

#### Dashboard Store (Zustand)
Global state management:
- Exchange data and alert state
- Async data fetching with loading states
- Alert management and dismissal
- Manual and automatic refresh orchestration

## Installation & Development

### Prerequisites
- Node.js 18+ and pnpm
- Chrome/Chromium browser
- TypeScript knowledge

### Setup

```bash
cd extension
pnpm install
```

### Development Build

```bash
pnpm run dev
```

Build output goes to `dist/` directory.

### Production Build

```bash
pnpm run build
```

### Load Extension in Chrome

1. Open `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `dist/` folder
5. Extension appears in Chrome toolbar

## Configuration

### Manifest V3 Key Settings

```json
{
  "manifest_version": 3,
  "permissions": ["storage", "alarms"],
  "host_permissions": [
    "https://*.chainlink.com/*",
    "https://api.coingecko.com/*"
  ]
}
```

### Environment Variables

No API keys required - CRE data is public and requires no authentication.

Optional for advanced features:
- `CRE_STAGING_URL` - Override staging endpoint
- `CRE_PRODUCTION_URL` - Override production endpoint

## API Integration

### Chainlink CRE Endpoints

The extension integrates with:
- `/cre/reserves/{exchange}` - Reserve data with merkle proof
- `/cre/liabilities/{exchange}` - Liability data  
- `/cre/on-chain/{exchange}` - On-chain verification data
- `/wasm/verify-merkle` - Merkle proof verification

### Data Flow

```
Background Service → CRE API
        ↓
   Chrome Storage (Cache)
        ↓
Popup/Dashboard ← Zustand Store ← Fetch Latest
```

## Performance Optimizations

1. **Smart Caching**: 15-minute TTL with timestamp tracking
2. **Parallel Requests**: All exchanges fetched in parallel via Promise.all
3. **Code Splitting**: Dashboard lazy-loaded only when needed
4. **Memoization**: React memo on list items to prevent re-renders
5. **Animations**: GPU-accelerated Framer Motion transforms
6. **Data Compression**: Numbers formatted for readability

## Security Considerations

1. **CSP Compliance**: Manifest V3 compliant, no inline scripts
2. **Merkle Verification**: All data cryptographically verified
3. **HTTPS Only**: All external requests use HTTPS
4. **No Private Keys**: Extension never handles private keys
5. **Storage**: Local data cached only, no sensitive info stored
6. **Timeouts**: All API calls have 10-second timeouts

## Styling & Design

### Color System (Dark Theme)
- **Background**: `#0d1b2a` (rgb(13 27 42))
- **Card**: `#1e293b` (rgb(30 41 59))
- **Primary (Healthy)**: Emerald (`#10b981`)
- **Warning**: Yellow (`#eab308`)
- **Critical**: Red (`#ef4444`)
- **Text**: Slate 50 (`#f1f5f9`)

### UI Framework
- **Tailwind CSS v4**: Utility-first styling
- **Framer Motion**: Smooth animations and transitions
- **Recharts**: Data visualization for solvency charts
- **Lucide React**: Icon library (fallback to Unicode)

## Maintenance

### Dependency Updates
```bash
pnpm update
```

### Type Checking
```bash
npx tsc --noEmit
```

### Build Verification
```bash
pnpm run build
# Check dist/ contains all files
```

## Troubleshooting

### Extension Not Loading
- Check manifest.json syntax
- Verify all source files in build output
- Check Chrome console for errors (chrome://extensions)

### Data Not Updating
- Verify internet connection and API endpoint
- Check Chrome storage quota (usually 10MB+)
- Clear extension storage and restart

### Merkle Verification Failing
- Ensure CRE API is accessible
- Check if exchange is supported in CRE oracles
- Verify merkle root matches on-chain state

## Future Enhancements

- [ ] Historical solvency charts
- [ ] Email notifications for critical alerts
- [ ] Custom alert thresholds per exchange
- [ ] Multi-chain support (Ethereum, Arbitrum, etc.)
- [ ] Dark/light theme toggle
- [ ] Exchange filtering and sorting
- [ ] Webhook integration for custom alerts

## License

MIT

## Support

For issues, questions, or contributions, please refer to the main VaultSentinel repository documentation.

---

**VaultSentinel** - Keep your crypto safe with real-time exchange solvency monitoring.
