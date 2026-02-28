# VaultSentinel - Quick Start Guide

Get VaultSentinel running in 5 minutes.

## Installation & Build

```bash
# 1. Install dependencies
cd extension
pnpm install

# 2. Build the extension
pnpm run build

# Output: dist/ folder with all files
```

## Load in Chrome

```
1. Open Chrome → chrome://extensions
2. Toggle "Developer mode" (top right)
3. Click "Load unpacked"
4. Select: /extension/dist
5. Done!
```

## Using VaultSentinel

### From the Popup (Click Extension Icon)
- See top 4 exchanges at a glance
- View active alerts
- Check last update time
- Click "Full Dashboard" for more

### From the Dashboard (Click Full Dashboard)
- View all 10 exchanges
- See solvency charts
- Check individual exchange details
- Manual refresh button
- Auto-refreshes every 15 minutes

### From Exchange Detail (Click Any Card)
- Full reserve breakdown
- Liability breakdown
- Merkle verification status
- On-chain validation info

## What You'll See

### Status Colors
- **Green (Healthy)**: Solvency ≥ 100%
- **Yellow (Warning)**: Solvency 95-100%
- **Red (Critical)**: Solvency < 95%

### Solvency Ratio
How many dollars of reserves for each dollar of liabilities:
- 1.05 = 105% backed (healthy)
- 0.98 = 98% backed (warning)
- 0.92 = 92% backed (critical)

## Key Features

✓ Real-time data from Chainlink CRE
✓ Cryptographic Merkle verification
✓ 10 major exchanges monitored
✓ Auto-refresh every 15 minutes
✓ Smart caching (no unnecessary API calls)
✓ Beautiful dark theme
✓ Fast load times

## Common Tasks

### Refresh Data Manually
- Click "Refresh Data" button in dashboard
- Takes 2-3 seconds for all 10 exchanges

### View Exchange Details
- Click any exchange card
- See reserves, liabilities, verification status

### Check Alerts
- Popup shows summary (Critical/Warning badges)
- Dashboard shows full alert list
- Background worker sends notifications

### Clear Cache
- Browser DevTools → Application → Storage
- Clear "vault_sentinel_cache"
- Refresh extension

## Troubleshooting

### Extension Won't Load
```
Error: "Pack extension must have manifest at app level"
Fix: Load the /extension folder, not /extension/dist
```

### No Data Shows
1. Check internet connection
2. Refresh extension (chrome://extensions)
3. Click "Refresh Data" button
4. Check browser console for errors

### Data Isn't Updating
1. Manual refresh works? → Auto-refresh may be disabled
2. Check background service worker logs
3. Check if 15 minutes have passed

### Popup is Blank
1. Reload extension from chrome://extensions
2. Right-click icon → Inspect popup
3. Check console for JS errors

## Keyboard Shortcuts

- `⟳` = Refresh (click button)
- `←` = Back to dashboard (from detail view)
- `×` = Dismiss alert

## File Locations

```
extension/              # All extension files
├── dist/               # Built extension (load this)
├── src/                # Source code
│   ├── components/     # React components
│   ├── services/       # API services
│   ├── store/          # State management
│   ├── popup.tsx       # Quick popup
│   ├── pages/          # Full dashboard
│   └── background.ts   # Auto-refresh
├── manifest.json       # Extension config
└── package.json        # Dependencies
```

## Performance Tips

- Data loads from cache (fast)
- Only refreshes every 15 minutes (saves bandwidth)
- Manual refresh clears cache first
- Charts load asynchronously
- Background worker runs even when closed

## Supported Exchanges

1. Binance
2. Coinbase
3. Kraken
4. OKX
5. Bybit
6. Huobi
7. Gate.io
8. Bitfinex
9. Kucoin
10. Upbit

## API Endpoints

VaultSentinel calls Chainlink CRE APIs:
- `https://api.chainlink.com/cre/reserves/{exchange}`
- `https://api.chainlink.com/cre/liabilities/{exchange}`
- `https://cre.chainlink.com/wasm/verify-merkle`

No authentication required!

## Next Steps

1. ✅ Install extension
2. ✅ Test basic functionality
3. Read detailed docs:
   - `README.md` - Full project overview
   - `EXTENSION_SETUP.md` - Detailed setup
   - `BUILD_SUMMARY.md` - Build details

## Getting Help

**Extension Won't Start?**
- Read: `EXTENSION_SETUP.md` → Troubleshooting

**Want to Customize?**
- Read: `EXTENSION_SETUP.md` → Advanced Customization

**Want to Deploy?**
- Read: `EXTENSION_SETUP.md` → Chrome Web Store Submission

**Technical Questions?**
- Read: `README.md` → Architecture
- Read: `BUILD_SUMMARY.md` → Technical Stack

## Need More Info?

Full documentation available in:
- `README.md` - Main project guide
- `EXTENSION_SETUP.md` - Extension details
- `BUILD_SUMMARY.md` - Build information

---

**VaultSentinel** - Real-time crypto exchange solvency monitoring.

Built with React, Zustand, Chainlink CRE, and ❤️
