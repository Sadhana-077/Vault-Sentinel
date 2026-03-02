import logger from '../utils/logger.js';
import { fetchReserveData } from '../workflows/reserve.workflow.js';
import { fetchLiabilityData } from '../workflows/liability.workflow.js';
import { calculateSolvency } from '../workflows/solvency.workflow.js';
import { exchangeService } from '../services/exchange.service.js';
import { ExchangeConfig } from '../types/index.js';

/**
 * CRE Workflow Handler
 * Executes reserve, liability, and solvency workflows for an exchange
 * Designed to be called from Chainlink CRE triggered endpoints
 */

export interface CREWorkflowInput {
  exchangeId: string;
  timestamp?: number;
  retryCount?: number;
}

export interface CREWorkflowResult {
  exchangeId: string;
  exchange: ExchangeConfig | null;
  timestamp: number;
  reserve: Awaited<ReturnType<typeof fetchReserveData>> | null;
  liability: Awaited<ReturnType<typeof fetchLiabilityData>> | null;
  solvency: Awaited<ReturnType<typeof calculateSolvency>> | null;
  status: 'success' | 'partial' | 'failed';
  errors: string[];
  executionTime: number;
}

/**
 * Execute complete workflow for a single exchange
 * @param input - Exchange ID and optional execution parameters
 * @returns Workflow result with all data and any errors encountered
 */
export async function executeCREWorkflow(
  input: CREWorkflowInput
): Promise<CREWorkflowResult> {
  const startTime = Date.now();
  const timestamp = input.timestamp || Date.now();
  const errors: string[] = [];

  logger.info('CRE Workflow started', {
    exchangeId: input.exchangeId,
    timestamp,
    retryCount: input.retryCount || 0,
  });

  let reserve = null;
  let liability = null;
  let solvency = null;
  let exchange = null;

  try {
    // Get exchange config
    exchange = exchangeService.getExchange(input.exchangeId) ?? null;
    if (!exchange) {
      throw new Error(`Exchange not found: ${input.exchangeId}`);
    }

    // Execute reserve workflow
    try {
      logger.debug('Fetching reserve data', { exchangeId: input.exchangeId });
      reserve = await fetchReserveData(input.exchangeId);
      logger.info('Reserve data fetched', {
        exchangeId: input.exchangeId,
        reserveUSD: reserve.reserveInUSD,
      });
    } catch (error) {
      const message = `Reserve fetch failed: ${error instanceof Error ? error.message : String(error)}`;
      logger.error('Reserve workflow error', { exchangeId: input.exchangeId, error: message });
      errors.push(message);
    }

    // Execute liability workflow
    try {
      logger.debug('Fetching liability data', { exchangeId: input.exchangeId });
      liability = await fetchLiabilityData(input.exchangeId);
      logger.info('Liability data fetched', {
        exchangeId: input.exchangeId,
        liabilityUSD: liability.liabilityInUSD,
      });
    } catch (error) {
      const message = `Liability fetch failed: ${error instanceof Error ? error.message : String(error)}`;
      logger.error('Liability workflow error', { exchangeId: input.exchangeId, error: message });
      errors.push(message);
    }

    // Execute solvency calculation
    try {
      logger.debug('Calculating solvency', { exchangeId: input.exchangeId });
      solvency = await calculateSolvency(input.exchangeId);
      logger.info('Solvency calculated', {
        exchangeId: input.exchangeId,
        ratio: solvency.ratio,
        status: solvency.status,
      });
    } catch (error) {
      const message = `Solvency calculation failed: ${error instanceof Error ? error.message : String(error)}`;
      logger.error('Solvency workflow error', { exchangeId: input.exchangeId, error: message });
      errors.push(message);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('CRE Workflow critical error', {
      exchangeId: input.exchangeId,
      error: message,
    });
    errors.push(`Critical error: ${message}`);
  }

  const executionTime = Date.now() - startTime;
  const status = errors.length === 0 ? 'success' : errors.length >= 2 ? 'failed' : 'partial';

  const result: CREWorkflowResult = {
    exchangeId: input.exchangeId,
    exchange,
    timestamp,
    reserve,
    liability,
    solvency,
    status,
    errors,
    executionTime,
  };

  logger.info('CRE Workflow completed', {
    exchangeId: input.exchangeId,
    status,
    executionTime,
    errorCount: errors.length,
  });

  return result;
}

/**
 * Execute workflows for multiple exchanges in parallel
 * @param exchangeIds - Array of exchange IDs to process
 * @param concurrency - Number of parallel executions (default: 3)
 * @returns Array of workflow results
 */
export async function executeBatchCREWorkflow(
  exchangeIds: string[],
  concurrency: number = 3
): Promise<CREWorkflowResult[]> {
  logger.info('Batch CRE Workflow started', {
    count: exchangeIds.length,
    concurrency,
  });

  const results: CREWorkflowResult[] = [];
  const queue = [...exchangeIds];

  while (queue.length > 0) {
    const batch = queue.splice(0, concurrency);
    const batchResults = await Promise.all(
      batch.map((exchangeId) =>
        executeCREWorkflow({ exchangeId }).catch((error) => {
          logger.error('Batch execution error', {
            exchangeId,
            error: error instanceof Error ? error.message : String(error),
          });
          return {
            exchangeId,
            exchange: null,
            timestamp: Date.now(),
            reserve: null,
            liability: null,
            solvency: null,
            status: 'failed' as const,
            errors: [error instanceof Error ? error.message : String(error)],
            executionTime: 0,
          };
        })
      )
    );
    results.push(...batchResults);
  }

  logger.info('Batch CRE Workflow completed', {
    total: exchangeIds.length,
    successful: results.filter((r) => r.status === 'success').length,
    failed: results.filter((r) => r.status === 'failed').length,
  });

  return results;
}

/**
 * Store workflow results (for CRE integration)
 * In production, this would publish to CRE for on-chain verification
 * @param result - Workflow result to store
 */
export async function storeWorkflowResult(result: CREWorkflowResult): Promise<void> {
  try {
    logger.info('Storing workflow result', {
      exchangeId: result.exchangeId,
      status: result.status,
    });

    // TODO: Integrate with CRE SDK to publish results
    // Example: await creClient.publishResult({
    //   exchangeId: result.exchangeId,
    //   solvencyRatio: result.solvency?.ratio,
    //   status: result.solvency?.status,
    //   timestamp: result.timestamp,
    //   verified: true,
    // });

    logger.debug('Workflow result stored', {
      exchangeId: result.exchangeId,
    });
  } catch (error) {
    logger.error('Failed to store workflow result', {
      exchangeId: result.exchangeId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
