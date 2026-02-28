# VaultSentinel Backend Deployment Guide

Complete guide for deploying the VaultSentinel backend to production.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] RPC endpoints tested and working
- [ ] TypeScript builds without errors
- [ ] All tests passing
- [ ] Logs are readable and informative
- [ ] CORS configuration for your domain
- [ ] Error handling in place
- [ ] Rate limiting configured (optional)

## Environment Setup

### Development (.env.example)

```env
NODE_ENV=development
PORT=3001
LOG_LEVEL=debug

ETHEREUM_RPC=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
POLYGON_RPC=https://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
ARBITRUM_RPC=https://arb-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
OPTIMISM_RPC=https://opt-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

CACHE_TTL=15
CORS_ORIGIN=*
```

### Production

```env
NODE_ENV=production
PORT=3001
LOG_LEVEL=info

ETHEREUM_RPC=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
POLYGON_RPC=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
ARBITRUM_RPC=https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY
OPTIMISM_RPC=https://opt-mainnet.g.alchemy.com/v2/YOUR_KEY

CACHE_TTL=15
CORS_ORIGIN=https://your-domain.com,chrome-extension://*
```

## Local Deployment

### 1. Install Dependencies
```bash
cd backend
pnpm install
```

### 2. Build
```bash
pnpm build
```

### 3. Run
```bash
NODE_ENV=production pnpm start
```

Server runs on `http://localhost:3001`

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --prod

# Copy source code
COPY dist ./dist

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start server
CMD ["node", "dist/index.js"]
```

### Build and Run

```bash
# Build image
docker build -t vaultssentinel-backend:latest .

# Run container
docker run -d \
  --name vaultssentinel-backend \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e ETHEREUM_RPC="https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY" \
  -e POLYGON_RPC="https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY" \
  -e ARBITRUM_RPC="https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY" \
  -e OPTIMISM_RPC="https://opt-mainnet.g.alchemy.com/v2/YOUR_KEY" \
  vaultssentinel-backend:latest

# View logs
docker logs -f vaultssentinel-backend
```

## Kubernetes Deployment

### deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vaultssentinel-backend
  labels:
    app: vaultssentinel-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vaultssentinel-backend
  template:
    metadata:
      labels:
        app: vaultssentinel-backend
    spec:
      containers:
      - name: backend
        image: vaultssentinel-backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: LOG_LEVEL
          value: "info"
        - name: PORT
          value: "3001"
        - name: ETHEREUM_RPC
          valueFrom:
            secretKeyRef:
              name: rpc-secrets
              key: ethereum-rpc
        - name: POLYGON_RPC
          valueFrom:
            secretKeyRef:
              name: rpc-secrets
              key: polygon-rpc
        - name: ARBITRUM_RPC
          valueFrom:
            secretKeyRef:
              name: rpc-secrets
              key: arbitrum-rpc
        - name: OPTIMISM_RPC
          valueFrom:
            secretKeyRef:
              name: rpc-secrets
              key: optimism-rpc
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: vaultssentinel-backend
spec:
  selector:
    app: vaultssentinel-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3001
  type: LoadBalancer
```

### Deploy to Kubernetes

```bash
# Create secrets
kubectl create secret generic rpc-secrets \
  --from-literal=ethereum-rpc=$ETHEREUM_RPC \
  --from-literal=polygon-rpc=$POLYGON_RPC \
  --from-literal=arbitrum-rpc=$ARBITRUM_RPC \
  --from-literal=optimism-rpc=$OPTIMISM_RPC

# Deploy
kubectl apply -f deployment.yaml

# Check status
kubectl get deployments
kubectl get pods
kubectl logs deployment/vaultssentinel-backend
```

## Vercel Deployment

### vercel.json

```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "outputDirectory": "dist",
  "framework": "nodejs",
  "nodeVersion": "20.x"
}
```

### Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables
vercel env add ETHEREUM_RPC
vercel env add POLYGON_RPC
vercel env add ARBITRUM_RPC
vercel env add OPTIMISM_RPC

# Redeploy with env vars
vercel --prod
```

## AWS Deployment (Elastic Beanstalk)

### .ebextensions/nodecommand.config

```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "node dist/index.js"
```

### Deploy

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js-20 vaultssentinel-backend

# Create environment
eb create vaultssentinel-prod

# Set environment variables
eb setenv NODE_ENV=production \
  ETHEREUM_RPC=$ETHEREUM_RPC \
  POLYGON_RPC=$POLYGON_RPC \
  ARBITRUM_RPC=$ARBITRUM_RPC \
  OPTIMISM_RPC=$OPTIMISM_RPC

# Deploy
eb deploy

# Monitor
eb logs
```

## Cloud Run (Google Cloud)

### Dockerfile (see Docker section above)

### Deploy

```bash
# Build
gcloud builds submit --tag gcr.io/YOUR_PROJECT/vaultssentinel-backend

# Deploy
gcloud run deploy vaultssentinel-backend \
  --image gcr.io/YOUR_PROJECT/vaultssentinel-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars NODE_ENV=production,ETHEREUM_RPC=$ETHEREUM_RPC,POLYGON_RPC=$POLYGON_RPC,ARBITRUM_RPC=$ARBITRUM_RPC,OPTIMISM_RPC=$OPTIMISM_RPC
```

## Heroku Deployment

### Procfile

```
web: node dist/index.js
```

### Deploy

```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create app
heroku create vaultssentinel-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set ETHEREUM_RPC=$ETHEREUM_RPC
heroku config:set POLYGON_RPC=$POLYGON_RPC
heroku config:set ARBITRUM_RPC=$ARBITRUM_RPC
heroku config:set OPTIMISM_RPC=$OPTIMISM_RPC

# Deploy
git push heroku main

# Monitor
heroku logs --tail
```

## Monitoring & Maintenance

### Health Checks

```bash
# Check server is up
curl https://your-domain.com/api/health

# Monitor logs
tail -f logs/production.log

# Check performance
curl https://your-domain.com/api/solvency | jq '.data | keys | length'
```

### Performance Tuning

1. **Increase Node.js Memory**
   ```bash
   NODE_OPTIONS="--max-old-space-size=2048" node dist/index.js
   ```

2. **Enable Compression**
   - Add gzip middleware for responses > 1KB

3. **Optimize RPC Calls**
   - Use batch requests when possible
   - Consider RPC load balancing

4. **Cache Management**
   - Monitor cache hit rates
   - Adjust TTL based on data freshness needs

### Security Hardening

1. **CORS Configuration**
   ```env
   CORS_ORIGIN=https://your-domain.com,chrome-extension://*
   ```

2. **Rate Limiting** (future)
   ```typescript
   import rateLimit from 'express-rate-limit';
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   app.use('/api/', limiter);
   ```

3. **HTTPS Only**
   - Use SSL/TLS certificates
   - Redirect HTTP to HTTPS

4. **Request Validation**
   - Already implemented with exchange ID validation
   - Add input sanitization if needed

5. **API Keys** (future)
   - Implement API key middleware
   - Track usage per key

## Troubleshooting

### Issue: RPC Connection Fails
```bash
# Test RPC endpoint directly
curl https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Issue: High Memory Usage
```bash
# Check cache stats
curl http://localhost:3001/api/cache/stats

# Clear cache
docker exec vaultssentinel-backend node -e "require('./src/services/cache.service').cacheService.clear()"
```

### Issue: Slow Response Times
1. Check RPC endpoint latency
2. Monitor cache hit rates
3. Review logs for slow queries
4. Consider database for historical data

### Issue: CORS Errors
```bash
# Verify CORS header in response
curl -I http://localhost:3001/api/solvency
# Should see: Access-Control-Allow-Origin: ...
```

## Rollback Procedure

```bash
# If using Docker
docker stop vaultssentinel-backend
docker rm vaultssentinel-backend
docker run -d --name vaultssentinel-backend <previous-image-id>

# If using Kubernetes
kubectl rollout history deployment/vaultssentinel-backend
kubectl rollout undo deployment/vaultssentinel-backend

# If using Vercel
vercel rollback
```

## Backup & Recovery

Currently stateless - no data to backup. If adding database:
1. Schedule daily automated backups
2. Store backups in separate region
3. Test recovery monthly
4. Document recovery procedure

## Support & Updates

- Monitor Chainlink CRE for updates
- Update dependencies regularly: `pnpm update`
- Review security advisories: `pnpm audit`
- Keep Node.js version current
