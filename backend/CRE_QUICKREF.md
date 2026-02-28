# CRE Trigger System - Quick Reference

## Quick Start

### Enable the Scheduler

```bash
# .env
CRE_SCHEDULER_ENABLED=true
CRE_CRON_EXPRESSION=*/5 * * * *
```

### Start the Backend

```bash
cd backend
pnpm install
pnpm dev
```

The scheduler will automatically start and execute every 5 minutes.

## API Endpoints

### Trigger Single Exchange
```bash
curl -X POST http://localhost:3001/api/cre/trigger/binance
```

### Trigger Multiple Exchanges
```bash
curl -X POST http://localhost:3001/api/cre/trigger-batch \
  -H "Content-Type: application/json" \
  -d '{"exchangeIds": ["binance", "coinbase", "kraken"]}'
```

### Trigger All Exchanges
```bash
curl -X POST http://localhost:3001/api/cre/trigger-all
```

### Check Status
```bash
curl http://localhost:3001/api/cre/status
```

## Configuration

### Cron Expressions

```
*/5 * * * *    Every 5 minutes
0 * * * *      Every hour
0 0 * * *      Daily (midnight UTC)
0 */6 * * *    Every 6 hours
0 0 * * MON    Weekly (Monday midnight)
```

### Concurrency

Controls how many exchanges run in parallel:
- Low (1-2): Less resource usage, slower overall
- Medium (3-5): Balanced, recommended
- High (6+): More resources, faster for many exchanges

## Workflow Status

### Success
All three steps completed:
- ✓ Reserve data fetched
- ✓ Liability data fetched
- ✓ Solvency calculated

### Partial
One step failed, two succeeded:
- ✓ Reserve data fetched
- ✗ Liability data failed
- ✓ Solvency calculated

### Failed
Critical error, no data returned:
- ✗ Exchange not found
- ✗ Invalid configuration

## Response Codes

| Code | Meaning | Details |
|------|---------|---------|
| 200 | Success | All workflows succeeded |
| 202 | Accepted | Partial success, check `errors` |
| 400 | Bad Request | Invalid input |
| 404 | Not Found | Exchange doesn't exist |
| 500 | Server Error | Unrecoverable error |

## Logging

Watch logs in real-time:

```bash
# With pnpm dev (tsx watch)
# Logs appear directly in console

# Example output:
# [2024-01-01T12:00:00.000Z] info: CRE Workflow started
# [2024-01-01T12:00:02.345Z] info: Reserve data fetched { reserveUSD: 50000000 }
# [2024-01-01T12:00:02.500Z] info: Solvency calculated { ratio: 1.25 }
```

## Debugging

### Check Scheduler State

```typescript
import { creScheduler } from './cre/creScheduler';

const state = creScheduler.getState();
console.log(state);
// {
//   isRunning: true,
//   lastExecution: { timestamp, duration, successCount, failedCount },
//   nextExecution: Date,
//   totalExecutions: 42,
//   totalErrors: 0
// }
```

### Enable Debug Logging

```env
LOG_LEVEL=debug
```

## Common Issues

### Scheduler Not Starting
- Check: `CRE_SCHEDULER_ENABLED=true`
- Check: Environment variables loaded correctly
- Check: No startup errors in logs

### Slow Execution
- Increase `CRE_CONCURRENCY` (2 → 3 → 5)
- Check RPC endpoint health
- Monitor cache hit rates (should be 90%+)

### Failed Triggers
- Check RPC endpoints in `.env`
- Verify exchange IDs: `/api/cre/status`
- Check wallet addresses in exchange config

## Files

| File | Purpose |
|------|---------|
| `src/cre/creWorkflow.ts` | Core orchestration |
| `src/cre/creTrigger.ts` | HTTP endpoints |
| `src/cre/creScheduler.ts` | Cron scheduling |
| `src/index.ts` | App integration |
| `.env` | Configuration |

## Testing

### Test Single Exchange
```bash
curl -X POST http://localhost:3001/api/cre/trigger/binance | jq
```

### Test Batch
```bash
curl -X POST http://localhost:3001/api/cre/trigger-batch \
  -H "Content-Type: application/json" \
  -d '{"exchangeIds": ["binance", "coinbase"]}' | jq
```

### Monitor Execution
```bash
watch -n 1 'curl -s http://localhost:3001/api/cre/status | jq'
```

## Metrics to Track

- **Execution Time**: Time per exchange (target: <3 sec)
- **Success Rate**: Should be 95%+ with good RPC endpoints
- **Cache Hit Rate**: Should be 80-90% after warmup
- **Frequency**: Actual executions match cron schedule

## Integration Checklist

- [ ] CRE_SCHEDULER_ENABLED=true in .env
- [ ] RPC endpoints configured
- [ ] Exchange wallets verified
- [ ] Cron expression set
- [ ] Concurrency level adjusted for scale
- [ ] Monitoring/logging configured
- [ ] Error handling integrated
- [ ] Results storage implemented

## Next Steps

1. Read [CRE_TRIGGER.md](./CRE_TRIGGER.md) for full documentation
2. Check [API.md](./API.md) for endpoint reference
3. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
4. Follow [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
