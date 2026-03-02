# VaultSentinel - Crypto Exchange Solvency Monitor

Production-grade monitoring platform for cryptocurrency exchange solvency, powered by **Chainlink Cryptographic Proof of Reserve (CRE)** oracle technology.

## 🎯 Project Overview

VaultSentinel is a comprehensive suite of monitoring tools that tracks the solvency and reserve adequacy of major cryptocurrency exchanges in real-time. Using Chainlink's CRE oracles, the platform cryptographically verifies reserve and liability data, calculating solvency ratios with Merkle proof verification.

### Key Components

1. **CRE Backend** (`cre-backend/`) - Chainlink CRE workflow for data aggregation
2. **Next.js Dashboard** (`app/`) - Web-based solvency monitoring dashboard  
3. **Chrome Extension** (`extension/`) - Browser extension for real-time monitoring

## 📊 Features

### Real-Time Monitoring
- Track solvency ratios for 10+ major exchanges
- Merkle tree verification for all reserve claims
- Live status indicators (Healthy/Warning/Critical)
- Automatic alert generation for solvency risks

### Data Verification
- Chainlink CRE integration for trusted data sources
- Cryptographic Merkle proof verification
- On-chain validation badges
- Transparent audit trails

### Multi-Platform Access
- **Web Dashboard**: Full analytics and historical data
- **Chrome Extension**: Quick access popup and detailed dashboard
- **API Layer**: RESTful endpoints for programmatic access

## 🏗️ Architecture

### Directory Structure

```
vault-sentinel/
├── app/                           # Next.js web dashboard
│   ├── api/
│   │   ├── solvency/             # Main solvency endpoint
│   │   └── ...
│   ├── page.tsx                   # Homepage
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles
│
├── components/                    # React components
│   ├── dashboard.tsx              # Main dashboard component
│   ├── exchange-table.tsx         # Exchange data table
│   ├── exchange-detail.tsx        # Detailed view
│   ├── solvency-overview-chart.tsx # Charts
│   └── ...
│
├── lib/                           # Utilities & services
│   ├── types.ts                   # Shared type definitions
│   ├── exchanges.ts               # Exchange configuration
│   ├── solvency-service.ts        # Data fetching logic
│   └── utils.ts                   # Helper functions
│
├── cre-backend/                   # Chainlink CRE workflows
│   ├── vault-sentinel-workflow/   # Main CRE workflow
│   │   ├── main.ts                # Workflow entry point
│   │   ├── config.staging.json    # Staging config
│   │   ├── config.production.json # Production config
│   │   └── package.json           # Dependencies
│   ├── contracts/                 # Smart contract ABIs
│   ├── project.yaml               # CRE project config
│   └── ...
│
├── extension/                     # Chrome extension
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── services/              # API & storage services
│   │   ├── store/                 # Zustand state management
│   │   ├── popup.tsx              # Popup UI
│   │   ├── background.ts          # Service worker
│   │   └── types.ts               # Type definitions
│   ├── manifest.json              # Manifest V3 config
│   ├── vite.config.ts             # Build configuration
│   └── tailwind.config.js         # Tailwind styles
│
├── package.json                   # Main dependencies
├── tsconfig.json                  # TypeScript config
├── tailwind.config.js             # Global Tailwind config
└── README.md                      # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Chrome/Chromium for extension testing

### Installation

```bash
# Install main project dependencies
pnpm install

# Install extension dependencies
cd extension
pnpm install
cd ..

# Install CRE backend dependencies (if using local CRE)
cd cre-backend/vault-sentinel-workflow
pnpm install
cd ../../
```

### Development

#### Web Dashboard
```bash
pnpm run dev
# Opens http://localhost:3000
```

#### Chrome Extension
```bash
cd extension
pnpm run dev
# Build to dist/ directory
```

Load the extension in Chrome:
1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `extension/dist` folder

## 📡 API Reference

### Solvency Endpoint

```bash
GET /api/solvency
```

Returns real-time solvency data for all exchanges:

```json
{
  "exchanges": [
    {
      "name": "Binance",
      "solvencyRatio": 1.025,
      "status": "healthy",
      "reserves": {
        "totalReserves": 45000000000,
        "assets": [
          {
            "symbol": "BTC",
            "amount": 600000,
            "value": 27000000000,
            "verified": true
          }
        ],
        "merkleRoot": "0x...",
        "lastUpdated": "2024-02-28T10:30:00Z"
      },
      "liabilities": {
        "totalLiabilities": 43900000000,
        "merkleRoot": "0x...",
        "lastUpdated": "2024-02-28T10:30:00Z"
      },
      "isVerified": true,
      "lastUpdated": "2024-02-28T10:30:00Z"
    }
  ]
}
```

## 🔗 Chainlink CRE Integration

### Supported Exchanges
- Binance
- Coinbase
- Kraken
- OKX
- Bybit
- Huobi
- Gate.io
- Bitfinex
- Kucoin
- Upbit

### Data Types
- **Reserves**: Verified asset holdings with Merkle proofs
- **Liabilities**: User account balances with tree verification
- **Merkle Root**: Cryptographic commitment to data
- **Signature Timestamp**: When exchange signed the claim

### Verification Process
1. Fetch reserve data with Merkle proof from CRE
2. Fetch liability data with tree path from CRE
3. Verify Merkle proofs against on-chain roots
4. Calculate solvency ratio (reserves / liabilities)
5. Generate status badge (Healthy/Warning/Critical)

## 🎨 Design System

### Colors
- **Primary (Healthy)**: Emerald (#10b981)
- **Warning**: Amber (#eab308)
- **Critical**: Red (#ef4444)
- **Background**: Slate-900 (#0f172a)
- **Card**: Slate-800 (#1e293b)

### Typography
- **Headings**: Inter Bold
- **Body**: Inter Regular
- **Monospace**: JetBrains Mono

### Components
- Tailwind CSS v4 for utilities
- shadcn/ui for advanced components
- Framer Motion for animations
- Recharts for data visualization

## 📈 Performance

### Optimization Strategies
- **Smart Caching**: 15-minute TTL with automatic refresh
- **Parallel Requests**: Concurrent API calls for all exchanges
- **Code Splitting**: Dashboard components lazy-loaded
- **Image Optimization**: Compressed logos and icons
- **Service Worker**: Background refresh in Chrome extension

### Metrics
- First load: <1.5s
- Time to interactive: <2s
- Data refresh: 15 minutes automatic, <3s manual
- Cache hit rate: 80%+ during peak usage

## 🔐 Security

### Best Practices
- HTTPS-only for all external requests
- Cryptographic Merkle proof verification
- Content Security Policy (CSP) compliant
- No sensitive data in localStorage
- Manifest V3 compliance (extension)

### Data Integrity
- All reserve claims verified via Merkle proofs
- On-chain validation for solvency data
- Signed timestamps from exchanges
- Transparent audit trails

## 📦 Deployment

### Web Dashboard (Vercel)
```bash
pnpm run build
vercel deploy
```

### Chrome Extension
```bash
cd extension
pnpm run build
# Upload dist/ to Chrome Web Store
```

### CRE Backend (Chainlink)
```bash
cd cre-backend
cre workflow deploy --env production
```

## 🛠️ Development Workflow

### Adding a New Exchange
1. Add exchange to `lib/exchanges.ts`
2. Configure CRE oracle for the exchange
3. Add entry in `config.staging.json` / `config.production.json`
4. Test in dashboard and extension

### Customizing Alerts
Edit `store/dashboard-store.ts`:
- Modify `calculateStatus()` thresholds
- Add custom alert types
- Configure notification behavior

### Styling Changes
- Global styles: `app/globals.css`
- Extension styles: `extension/src/popup.css`, `dashboard.css`
- Tailwind config: `tailwind.config.js`

## 📝 Environment Variables

Main dashboard:
```
# Optional - defaults to production CRE
NEXT_PUBLIC_CRE_API_URL=https://api.chainlink.com/cre
```

CRE Backend:
```
# Configure in secrets.yaml
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/...
EXCHANGE_SIGNER_KEY=<private-key>
```

Chrome Extension: No configuration required

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and test locally
3. Build both dashboard and extension
4. Submit pull request with description

## 📚 Documentation

- **API Docs**: See `API_REFERENCE.md`
- **Extension Guide**: See `extension/README.md`
- **CRE Integration**: See `cre-backend/README.md`
- **Type Reference**: See `lib/types.ts`

## 🐛 Troubleshooting

### Dashboard Not Loading
- Check if dev server is running: `pnpm run dev`
- Clear browser cache
- Verify all dependencies installed

### Extension Not Showing Data
- Check Chrome console for errors
- Verify CRE API is accessible
- Reload extension (chrome://extensions)

### Solvency Data Outdated
- Manual refresh via dashboard button
- Check if 15-minute auto-refresh is working
- Verify API connectivity

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- **Chainlink**: Cryptographic Proof of Reserve oracle
- **Next.js**: Web framework
- **React**: UI library
- **Tailwind CSS**: Styling
- **Recharts**: Data visualization

---

**VaultSentinel** - Real-time monitoring for crypto exchange solvency. Built with precision, powered by Chainlink CRE.

*Last updated: February 2024*
