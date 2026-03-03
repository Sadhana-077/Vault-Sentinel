import express, { Request, Response } from 'express';
import { calculateSolvency, calculateAllSolvencies } from '../workflows/solvency.workflow.js';
import { fetchReserveData } from '../workflows/reserve.workflow.js';
import { fetchLiabilityData } from '../workflows/liability.workflow.js';
import { exchangeService } from '../services/exchange.service.js';
import { ApiResponse, SolvencyData, ReserveData, LiabilityData } from '../types/index.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Health check
router.get('/health', (_req: Request, res: Response) => {
  return res.json({ status: 'ok', timestamp: Date.now() });
});

// Get all exchanges
router.get(
  '/exchanges',
  (_req: Request, res: Response<ApiResponse<ReturnType<typeof exchangeService.getAllExchanges>>>) => {
    try {
      const exchanges = exchangeService.getAllExchanges();
      return res.json({
        success: true,
        data: exchanges,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error({ error }, 'Failed to fetch exchanges');
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch exchanges',
        timestamp: Date.now(),
      });
    }
  }
);

// Get solvency for all exchanges
router.get(
  '/solvency',
  async (_req: Request, res: Response<ApiResponse<Record<string, SolvencyData>>>) => {
    try {
      const solvencies = await calculateAllSolvencies();
      const data = Array.from(solvencies.entries()).reduce(
        (acc, [key, value]) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<string, SolvencyData>
      );
      return res.json({
        success: true,
        data,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error({ error }, 'Failed to fetch solvencies');
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch solvencies',
        timestamp: Date.now(),
      });
    }
  }
);

// Get solvency for specific exchange
router.get(
  '/solvency/:exchange',
  async (req: Request<{ exchange: string }>, res: Response<ApiResponse<SolvencyData>>) => {
    try {
      const { exchange } = req.params;

      if (!exchangeService.getExchange(exchange)) {
        return res.status(404).json({
          success: false,
          error: `Exchange not found: ${exchange}`,
          timestamp: Date.now(),
        });
      }

      const solvency = await calculateSolvency(exchange);
      return res.json({
        success: true,
        data: solvency,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error({ error, exchange: req.params.exchange }, 'Failed to fetch solvency');
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch solvency',
        timestamp: Date.now(),
      });
    }
  }
);

// Get reserves for specific exchange
router.get(
  '/reserves/:exchange',
  async (req: Request<{ exchange: string }>, res: Response<ApiResponse<ReserveData>>) => {
    try {
      const { exchange } = req.params;

      if (!exchangeService.getExchange(exchange)) {
        return res.status(404).json({
          success: false,
          error: `Exchange not found: ${exchange}`,
          timestamp: Date.now(),
        });
      }

      const reserves = await fetchReserveData(exchange);
      return res.json({
        success: true,
        data: reserves,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error({ error, exchange: req.params.exchange }, 'Failed to fetch reserves');
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch reserves',
        timestamp: Date.now(),
      });
    }
  }
);

// Get liabilities for specific exchange
router.get(
  '/liabilities/:exchange',
  async (req: Request<{ exchange: string }>, res: Response<ApiResponse<LiabilityData>>) => {
    try {
      const { exchange } = req.params;

      if (!exchangeService.getExchange(exchange)) {
        return res.status(404).json({
          success: false,
          error: `Exchange not found: ${exchange}`,
          timestamp: Date.now(),
        });
      }

      const liabilities = await fetchLiabilityData(exchange);
      return res.json({
        success: true,
        data: liabilities,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error({ error, exchange: req.params.exchange }, 'Failed to fetch liabilities');
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch liabilities',
        timestamp: Date.now(),
      });
    }
  }
);

export default router;