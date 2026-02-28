# VaultSentinel Chrome Extension Setup Guide

Complete guide for building, testing, and deploying the VaultSentinel Chrome extension.

## Quick Start

### 1. Build the Extension

```bash
cd extension
pnpm install
pnpm run build
```

### 2. Load in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension/dist` folder
5. Extension appears in your toolbar!

### 3. Start Using

- Click the VaultSentinel icon in your toolbar
- See a popup with top 4 exchanges and alerts
- Click "Full Dashboard" for complete monitoring
- Data auto-refreshes every 15 minutes

## File Structure

```
extension/
├── manifest.json          # Manifest V3 configuration
├── package.json           # Dependencies
├── vite.config.ts         # Build config
├── tailwind.config.js     # Tailwind setup
├── tsconfig.json          # TypeScript config
│
├── src/
│   ├── background.ts      # Service worker (auto-refresh, notifications)
│   ├── popup.tsx          # Popup UI entry
│   ├── popup.html         # Popup HTML shell
│   ├── popup.css          # Popup styles
│   │
│   ├── types.ts           # TypeScript definitions
│   │
│   ├── components/
│   │   ├── exchange-card.tsx           # Basic card display
│   │   ├── animated-exchange-card.tsx  # Animated variant
│   │   ├── solvency-indicator.tsx      # Status bar
│   │   ├── alerts-section.tsx          # Alert display
│   │   ├── exchange-detail.tsx         # Detail page
│   │   └── solvency-chart.tsx          # Recharts visualization
│   │
│   ├── pages/
│   │   ├── dashboard.tsx   # Full dashboard page
│   │   ├── dashboard.html  # Dashboard HTML
│   │   └── dashboard.css   # Dashboard styles
│   │
│   ├── services/
│   │   ├── cre-service.ts         # Chainlink CRE API integration
│   │   └── storage-service.ts     # Chrome storage wrapper
│   │
│   ├── store/
│   │   └── dashboard-store.ts     # Zustand state management
│   │
│   └── lib/
│       └── exchanges.ts            # Exchange config
│
└── dist/                   # Build output (generated)
    ├── manifest.json
    ├── popup.html
    ├── dashboard.html
    ├── popup.js/css
    ├── dashboard.js/css
    └── background.js
```

## Development Workflow

### Running in Dev Mode

For Vite hot reload (development):

```bash
cd extension
pnpm run dev
```

Then load unpacked from `dist/` folder. Note: Hot reload doesn't work perfectly with extensions - reload manually when needed.

### Building for Production

```bash
cd extension
pnpm run build
```

Creates optimized bundle in `dist/` ready for:
- Local testing
- Chrome Web Store submission
- Distribution to team

## Configuration

### Manifest V3 Permissions

The extension declares minimal necessary permissions:

```json
{
  "permissions": [
    "storage",        // Local and sync storage for data caching
    "alarms"          // Periodic background refresh
  ],
  "host_permissions": [
    "https://*.chainlink.com/*",
    "https://api.coingecko.com/*",
    "https://api.etherscan.io/*"
  ]
}
```

### Environment Variables

No environment variables required! The extension works with public CRE APIs.

Optional advanced configuration (edit in `background.ts`):
- `REFRESH_INTERVAL_MINUTES` - Change auto-refresh interval (default: 15)
- `ALARM_NAME` - Internal alarm identifier

## How It Works

### Data Flow Architecture

```
┌─────────────────────────────────────────┐
│        Chrome Extension Popup           │
│   (Quick view of top 4 exchanges)       │
└────────────────┬────────────────────────┘
                 │ Click "Full Dashboard"
                 ↓
    ┌────────────────────────────┐
    │  Chrome Extension Dashboard │
    │  (Full monitoring view)     │
    └────────────┬───────────────┘
                 │
        ┌────────┴────────┐
        ↓                  ↓
┌──────────────┐   ┌─────────────────┐
│ Zustand      │   │ Chrome Storage  │
│ Store        │←→ │ (Cache, TTL)    │
└──────────────┘   └─────────────────┘
        │
        ├─→ [Manual Refresh Button]
        │
        └─→ [Background Service Worker]
               ↓ (Every 15 minutes)
             [CRE API]
               ↓
        [Chainlink Oracles]
```

### Key Components

**Background Service Worker** (`background.ts`)
- Runs in background even when extension UI closed
- Triggers refresh every 15 minutes
- Updates extension badge with alert count
- Shows notifications for critical events

**Popup** (`popup.tsx`)
- Quick overview of exchange status
- 4 key exchanges displayed
- Active alerts summarized
- Link to full dashboard

**Dashboard** (`dashboard.tsx`)
- Comprehensive monitoring view
- Charts and visualizations
- Individual exchange details
- Alert management

**Store** (`dashboard-store.ts`)
- Global state with Zustand
- Manages all exchange data
- Alert tracking
- Loading/error states

**CREService** (`cre-service.ts`)
- Fetches data from Chainlink CRE
- Verifies Merkle proofs
- Parallel requests for efficiency
- Error handling with retries

**StorageService** (`storage-service.ts`)
- Wraps Chrome storage APIs
- Implements TTL-based cache
- Handles preferences
- Promise-based interface

## API Integration Points

### Chainlink CRE Endpoints

The extension calls these CRE APIs:

```bash
# Get reserves for one exchange
GET https://api.chainlink.com/cre/reserves/binance
Response:
{
  "totalReserves": 45000000000,
  "assets": [...],
  "merkleRoot": "0x...",
  "merkleProof": ["0x...", "0x..."],
  "lastUpdated": "2024-02-28T10:30:00Z"
}

# Get liabilities for one exchange  
GET https://api.chainlink.com/cre/liabilities/binance
Response:
{
  "totalLiabilities": 43900000000,
  "merkleRoot": "0x...",
  "merkleTreePath": ["0x...", "0x..."],
  "lastUpdated": "2024-02-28T10:30:00Z"
}

# Verify Merkle proof
POST https://cre.chainlink.com/wasm/verify-merkle
Body:
{
  "exchange": "binance",
  "merkleRoot": "0x...",
  "merkleProof": ["0x...", "0x..."],
  "data": 45000000000
}
Response:
{
  "verified": true
}

# Get all exchanges at once
GET https://api.chainlink.com/cre/all-exchanges
Response:
{
  "exchanges": [...],
  "alerts": [...]
}
```

## Testing

### Local Testing Checklist

- [ ] Extension loads without errors (`chrome://extensions`)
- [ ] Popup shows exchange cards
- [ ] "Full Dashboard" button opens new window
- [ ] Data loads and displays correctly
- [ ] Status indicators show correct colors
- [ ] Alerts display when appropriate
- [ ] Manual refresh works
- [ ] Background refresh works (check logs)
- [ ] Exchange detail view works
- [ ] Charts render without errors

### Chrome DevTools

View extension logs:
1. Go to `chrome://extensions`
2. Click "Details" on VaultSentinel
3. Click "Inspect views" on "service worker"
4. Use Console tab to see logs

View popup logs:
1. Right-click extension icon
2. Click "Inspect popup"
3. Use Console tab

## Performance Tips

### Reduce API Calls
- Caching with TTL prevents redundant calls
- Default 15-minute refresh is optimal
- Manual refresh only when needed

### Improve Load Times
- Code is already split (popup vs dashboard)
- Lazy loading on exchange detail view
- Parallel requests for multiple exchanges

### Chrome Storage Quota
- Used for cache and preferences
- Limit: ~10MB per extension
- Stores 15 days of data (with cleanup)

## Troubleshooting

### Extension Won't Load
**Error**: "Pack extension must have a manifest file at app level"

**Solution**: Make sure you're pointing to the `extension` folder, not the project root.

### No Data Showing
**Check**:
1. Internet connection working?
2. CRE API accessible? (curl https://api.chainlink.com/cre/all-exchanges)
3. Check extension logs for errors
4. Try manual refresh

**Clear cache**:
```javascript
// In DevTools console of extension popup:
localStorage.clear()
chrome.storage.local.clear()
location.reload()
```

### Popup Blank/White
- Reload extension from `chrome://extensions`
- Check console for JS errors
- Try incognito mode (bypasses some extensions)

### Data Not Auto-Refreshing
1. Check if background service worker is running
2. Verify alarm is set: `chrome.alarms.getAll()`
3. Check storage for cache data
4. Manual refresh confirms API connectivity

### Merkle Verification Shows "Pending"
- Network request might be slow
- CRE API might be temporarily unavailable
- Exchange data not yet published

## Manifest V3 Best Practices

Our extension follows MV3 standards:

✅ **Done**
- No inline scripts
- All JS in separate files
- Service worker for background tasks
- Minimal permissions declared
- HTTPS-only for external requests

⚠️ **Considerations**
- Service worker terminates after 30 seconds inactivity (alarms handle this)
- No localStorage (use chrome.storage)
- CSS injection restricted (not needed)

## Chrome Web Store Submission

When ready to publish:

1. **Create package**:
   ```bash
   cd extension
   pnpm run build
   # Zip the dist/ folder
   ```

2. **Create developer account**:
   - Go to https://chrome.google.com/webstore/devconsole
   - Register as Chrome Web Store developer

3. **Upload extension**:
   - Click "New Item"
   - Upload zip file
   - Fill store listing details
   - Submit for review

4. **Store listing must include**:
   - Clear description of what extension does
   - Screenshots showing popup and dashboard
   - How it uses Chainlink CRE
   - Privacy policy (no data collected)

## Performance Monitoring

Monitor extension performance:

```javascript
// Check storage usage
chrome.storage.local.getBytesInUse(null, (bytes) => {
  console.log(`Storage used: ${bytes / 1024}KB`)
})

// Check alarm status
chrome.alarms.getAll((alarms) => {
  console.log('Active alarms:', alarms)
})

// Measure API response time
const start = performance.now()
const response = await fetch('...')
const duration = performance.now() - start
console.log(`API call took ${duration}ms`)
```

## Updating the Extension

When updating:

1. Make changes to source files
2. Run `pnpm run build`
3. Reload extension in `chrome://extensions`
4. Increment version in `manifest.json`
5. Test all features
6. Build final package

## Advanced Customization

### Changing Refresh Interval

In `background.ts`:
```typescript
const REFRESH_INTERVAL_MINUTES = 15  // Change this
```

### Adding Custom Alerts

In `store/dashboard-store.ts`:
```typescript
const customThreshold = 0.95  // Modify threshold
if (solvencyRatio < customThreshold) {
  // Custom alert logic
}
```

### Custom Styling

Edit `popup.css` and `dashboard.css`:
```css
:root {
  --primary: #color;  /* Change primary color */
  --background: #color;
}
```

## Support & Resources

- **Chainlink Docs**: https://docs.chain.link/
- **Chrome Extension Docs**: https://developer.chrome.com/docs/extensions/
- **Manifest V3 Guide**: https://developer.chrome.com/docs/extensions/mv3/
- **Vite Docs**: https://vitejs.dev/

---

**VaultSentinel Extension** - Built with modern web technologies and Chainlink CRE.

Questions? Check the main README.md or raise an issue.
