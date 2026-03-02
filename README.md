Vault Sentinel
Real-Time Crypto Exchange Solvency Monitoring Platform
Overview
Vault Sentinel is a Web3 transparency and risk monitoring platform designed to evaluate the solvency of centralized cryptocurrency exchanges in near real-time.
The system tracks on-chain reserve wallets, verifies off-chain liabilities using Merkle proofs, computes solvency ratios, and exposes results through a backend API and browser extension interface. The architecture supports automated execution via Chainlink CRE-based workflows.

Problem Statement
Users cannot independently verify whether a centralized exchange holds sufficient reserves to cover customer liabilities. Historical exchange failures have demonstrated the need for transparent, automated, and verifiable solvency monitoring.

Solution
Vault Sentinel provides:
On-chain reserve tracking through RPC-based wallet balance monitoring
Off-chain liability verification using Merkle tree proofs
Solvency ratio computation and classification

Automated CRE-triggered backend workflows
Chrome extension interface for user-facing monitoring

System Architecture
Components
Backend (Node.js + TypeScript)

Reserve fetching via blockchain RPC endpoints

Liability verification via Merkle tree validation

Solvency ratio computation

REST API endpoints

CRE trigger and scheduler module

Chrome Extension

Displays exchange solvency status

Fetches backend results

Real-time monitoring interface

CRE Workflow Layer

Automated solvency checks

Batch execution across exchanges

Scheduled verification logic

Core Features
Multi-network RPC support

Configurable exchange wallet tracking

Merkle proof validation

Automated CRE-based execution

REST endpoints for integration

Modular backend architecture

Production-ready TypeScript structure

Technology Stack
Backend:

Node.js

Express

TypeScript

Ethers.js

node-cron

Pino (logging)

Extension:

Chrome Manifest V3

React / TypeScript (if applicable)

Infrastructure:

Blockchain RPC providers
Chainlink CRE integration-ready structure

Repository Structure

Vault-Sentinel/
 ├── backend/
 │    ├── src/
 │    │    ├── cre/
 │    │    ├── services/
 │    │    ├── routes/
 │    │    └── index.ts
 │    └── package.json
 │
 ├── extension/
 │    ├── manifest.json
 │    ├── popup/
 │    └── background/
 │
 ├── README.md
 └── package.json

Setup Instructions

1. Clone the repository
git clone https://github.com/Sadhana-077/Vault-Sentinel.git
cd Vault-Sentinel

2. Install backend dependencies
cd backend
pnpm install

3. Configure environment variables
Create a .env file inside backend/:

PORT=3001
CRE_SCHEDULER_ENABLED=true
CRE_CRON_EXPRESSION=*/5 * * * *
CRE_CONCURRENCY=3
CRE_TIMEZONE=UTC
Add RPC URLs and exchange configuration as required.

4. Start backend
pnpm dev
or
pnpm start
CRE Endpoints
POST /api/cre/trigger/:exchangeId
POST /api/cre/trigger-batch
POST /api/cre/trigger-all
GET  /api/cre/status
Solvency Calculation Logic
Solvency Ratio:

Solvency Ratio = Total On-Chain Reserves / Verified Liabilities
Classification:

Ratio > 1.0 → Solvent

Ratio = 1.0 → Fully Backed

Ratio < 1.0 → Insolvent

Security Considerations
No private keys stored
RPC read-only interaction
Merkle proof verification ensures liability integrity
Environment variables excluded via .gitignore

Versioning
Current stable release:

v1.0.0 – CRE Integrated Solvency Monitoring System

Future Improvements
AI-based anomaly detection

Historical solvency trend analysis

Exchange risk scoring system

Multi-chain expansion

Alert notification system

License
This project is for academic and research purposes.
