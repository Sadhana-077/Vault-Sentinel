# VaultSentinel — CRE Backend

This is the **unified backend** for VaultSentinel. It combines the **Express.js REST API** and the **Chainlink CRE Workflow** into a single folder.

---

## 📁 Folder Structure

```
cre-backend/
├── backend-contract/            ← Smart contract artifacts & ABIs
│   └── abi/                      ← AggregatorV3Interface ABI
├── cre/                         ← Core backend logic & CRE workflow
│   ├── src/                     ← Express API server & services
│   │   ├── index.ts             ← Entry point (Express app)
│   │   ├── routes/              ← REST route definitions
│   │   ├── services/            ← Cache, RPC, Merkle, exchange logic
│   │   ├── workflows/           ← Reserve/liability/solvency orchestration
│   │   ├── cre/                 ← CRE scheduler & HTTP trigger code
│   │   ├── types/               ← Shared TypeScript types
│   │   ├── middleware/          ← Express middleware
│   │   └── utils/               ← Logger, helpers
│   └── vault-sentinel-workflow/ ← Chainlink CRE on-chain workflow (Bun)
│       ├── main.ts              ← CRE workflow entry point
│       ├── config.staging.json
│       ├── config.production.json
│       ├── workflow.yaml
│       └── package.json         ← Bun-based CRE SDK deps
├── package.json                 ← Main Node.js dependencies (root)
├── tsconfig.json                ← TypeScript config (updated rootDir)
├── .env                         ← Environment variables
├── project.yaml                 ← Chainlink CRE project config
└── secrets.yaml                 ← CRE secrets (do not commit)
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- npm or pnpm

### Install & Start

```bash
cd cre-backend
npm install
npm run dev
```

Server starts on: **http://localhost:3001**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/exchanges` | List all 10 exchanges |
| `GET` | `/api/solvency` | Solvency for all exchanges |
| `GET` | `/api/solvency/:exchange` | Solvency for specific exchange |
| `GET` | `/api/reserves/:exchange` | Reserve data |
| `GET` | `/api/liabilities/:exchange` | Liability data |
| `POST` | `/api/cre/trigger/:exchangeId` | Trigger CRE check |
| `POST` | `/api/cre/trigger-batch` | Batch CRE check |
| `POST` | `/api/cre/trigger-all` | Trigger all exchanges |
| `GET` | `/api/cre/status` | CRE scheduler status |

---

## 🔗 Chainlink CRE Workflow

The `vault-sentinel-workflow/` subfolder contains the actual Chainlink CRE workflow that runs on the Decentralized Oracle Network (DON).

### Deploy to CRE (production)

```bash
cd vault-sentinel-workflow
bun install
# Then deploy via Chainlink CRE CLI:
cre workflow deploy --env staging
```

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Express server port |
| `ETHEREUM_RPC` | — | Ethereum RPC URL |
| `POLYGON_RPC` | — | Polygon RPC URL |
| `ARBITRUM_RPC` | — | Arbitrum RPC URL |
| `OPTIMISM_RPC` | — | Optimism RPC URL |
| `CACHE_TTL` | `15` | Cache TTL in minutes |
| `LOG_LEVEL` | `info` | Pino log level |
| `CORS_ORIGIN` | `*` | CORS allowed origin |
| `CRE_SCHEDULER_ENABLED` | `true` | Enable auto scheduler |
| `CRE_CRON_EXPRESSION` | `*/5 * * * *` | Cron schedule |
| `CRE_CONCURRENCY` | `3` | Parallel executions |
