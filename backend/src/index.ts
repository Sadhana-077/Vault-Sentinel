import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import router from './routes/index.js';
import creTriggersRouter from './cre/creTrigger.js';
import { initializeCREScheduler } from './cre/creScheduler.js';
import logger from './utils/logger.js';

const app = express();
const port = process.env.PORT || 3001;

// RPC service is imported as a singleton

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, _res, next) => {
  logger.info(
    {
      method: req.method,
      path: req.path,
      ip: req.ip,
    },
    'Incoming request'
  );
  next();
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ error: err }, 'Unhandled error');
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: Date.now(),
  });
});

// Routes
app.use('/api', router);
app.use('/api/cre', creTriggersRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    timestamp: Date.now(),
  });
});

// Start server
app.listen(port, () => {
  logger.info(`Server started on http://localhost:${port}`);
  logger.info('Available endpoints:');
  logger.info('  GET /api/health - Health check');
  logger.info('  GET /api/exchanges - List all exchanges');
  logger.info('  GET /api/solvency - Solvency for all exchanges');
  logger.info('  GET /api/solvency/:exchange - Solvency for specific exchange');
  logger.info('  GET /api/reserves/:exchange - Reserves for specific exchange');
  logger.info('  GET /api/liabilities/:exchange - Liabilities for specific exchange');
  logger.info('CRE Trigger endpoints:');
  logger.info('  POST /api/cre/trigger/:exchangeId - Trigger solvency check for exchange');
  logger.info('  POST /api/cre/trigger-batch - Trigger checks for multiple exchanges');
  logger.info('  POST /api/cre/trigger-all - Trigger checks for all exchanges');
  logger.info('  GET /api/cre/status - CRE scheduler status');

  // Initialize CRE scheduler
  initializeCREScheduler();
});
