import { Router, Request, Response } from 'express';
import { executeCREWorkflow, executeBatchCREWorkflow, storeWorkflowResult } from './creWorkflow.js';
import { exchangeService } from '../services/exchange.service.js';
import logger from '../utils/logger.js';

/**
 * CRE HTTP Trigger Handler
 * Provides endpoints for Chainlink CRE to trigger solvency checks
 */

const router = Router();

/**
 * POST /api/cre/trigger/:exchangeId
 * Manually trigger solvency check for a specific exchange
 */
router.post('/trigger/:exchangeId', async (req: Request, res: Response) => {
  try {
    const { exchangeId } = req.params;
    const { retryCount = 0 } = req.body || {};

    logger.info('CRE trigger received', { exchangeId, retryCount });

    // Validate exchange exists
    const exchange = exchangeService.getExchange(exchangeId);
    if (!exchange) {
      logger.warn('Invalid exchange ID', { exchangeId });
      return res.status(404).json({
        error: 'Exchange not found',
        exchangeId,
      });
    }

    // Execute workflow
    const result = await executeCREWorkflow({
      exchangeId,
      timestamp: Date.now(),
      retryCount,
    });

    // Store result
    if (result.status === 'success' || result.status === 'partial') {
      await storeWorkflowResult(result);
    }

    logger.info('CRE trigger completed', {
      exchangeId,
      status: result.status,
      executionTime: result.executionTime,
    });

    return res.status(result.status === 'success' ? 200 : 202).json({
      success: result.status !== 'failed',
      result,
    });
  } catch (error) {
    logger.error('CRE trigger error', {
      error: error instanceof Error ? error.message : String(error),
    });

    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/cre/trigger-batch
 * Trigger solvency checks for multiple exchanges
 */
router.post('/trigger-batch', async (req: Request, res: Response) => {
  try {
    const { exchangeIds, concurrency = 3 } = req.body || {};

    if (!Array.isArray(exchangeIds) || exchangeIds.length === 0) {
      return res.status(400).json({
        error: 'Invalid input: exchangeIds must be a non-empty array',
      });
    }

    logger.info('CRE batch trigger received', {
      count: exchangeIds.length,
      concurrency,
    });

    // Validate all exchanges exist
    const validIds = exchangeIds.filter((id: string) => exchangeService.getExchange(id));
    if (validIds.length < exchangeIds.length) {
      logger.warn('Some invalid exchange IDs filtered', {
        requested: exchangeIds.length,
        valid: validIds.length,
      });
    }

    // Execute batch workflow
    const results = await executeBatchCREWorkflow(validIds, concurrency);

    // Store all results
    for (const result of results) {
      if (result.status === 'success' || result.status === 'partial') {
        await storeWorkflowResult(result);
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const failedCount = results.filter((r) => r.status === 'failed').length;

    logger.info('CRE batch trigger completed', {
      total: results.length,
      successful: successCount,
      failed: failedCount,
    });

    return res.status(200).json({
      success: failedCount === 0,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failedCount,
      },
      results,
    });
  } catch (error) {
    logger.error('CRE batch trigger error', {
      error: error instanceof Error ? error.message : String(error),
    });

    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/cre/trigger-all
 * Trigger solvency checks for all exchanges
 */
router.post('/trigger-all', async (req: Request, res: Response) => {
  try {
    const { concurrency = 3 } = req.body || {};

    const allExchanges = exchangeService.getAllExchanges();
    const exchangeIds = allExchanges.map((e) => e.id);

    logger.info('CRE trigger-all received', {
      count: exchangeIds.length,
      concurrency,
    });

    // Execute batch workflow for all exchanges
    const results = await executeBatchCREWorkflow(exchangeIds, concurrency);

    // Store all results
    for (const result of results) {
      if (result.status === 'success' || result.status === 'partial') {
        await storeWorkflowResult(result);
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const failedCount = results.filter((r) => r.status === 'failed').length;

    logger.info('CRE trigger-all completed', {
      total: results.length,
      successful: successCount,
      failed: failedCount,
    });

    return res.status(200).json({
      success: failedCount === 0,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failedCount,
      },
      results,
    });
  } catch (error) {
    logger.error('CRE trigger-all error', {
      error: error instanceof Error ? error.message : String(error),
    });

    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/cre/status
 * Health check endpoint for CRE scheduler
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    const allExchanges = exchangeService.getAllExchanges();

    return res.status(200).json({
      status: 'operational',
      timestamp: Date.now(),
      exchanges: {
        total: allExchanges.length,
        ids: allExchanges.map((e) => e.id),
      },
    });
  } catch (error) {
    logger.error('CRE status check error', {
      error: error instanceof Error ? error.message : String(error),
    });

    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
