import cron from 'node-cron';
import { executeBatchCREWorkflow, storeWorkflowResult } from './creWorkflow.js';
import { exchangeService } from '../services/exchange.service.js';
import logger from '../utils/logger.js';

/**
 * CRE Scheduler
 * Automatically triggers solvency workflows on a schedule
 */

interface ScheduleConfig {
  enabled: boolean;
  cronExpression: string;
  concurrency: number;
  timezone?: string;
}

interface SchedulerState {
  isRunning: boolean;
  lastExecution?: {
    timestamp: number;
    duration: number;
    successCount: number;
    failedCount: number;
  };
  nextExecution?: Date;
  totalExecutions: number;
  totalErrors: number;
}

class CREScheduler {
  private task: cron.ScheduledTask | null = null;
  private state: SchedulerState = {
    isRunning: false,
    totalExecutions: 0,
    totalErrors: 0,
  };
  private config: ScheduleConfig = {
    enabled: false,
    cronExpression: '*/5 * * * *', // Every 5 minutes
    concurrency: 3,
    timezone: 'UTC',
  };

  constructor(config?: Partial<ScheduleConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Start the CRE scheduler
   */
  public start(): void {
    if (this.task || this.state.isRunning) {
      logger.warn('CRE scheduler is already running');
      return;
    }

    if (!this.config.enabled) {
      logger.info('CRE scheduler is disabled in configuration');
      return;
    }

    logger.info('Starting CRE scheduler', {
      cronExpression: this.config.cronExpression,
      concurrency: this.config.concurrency,
      timezone: this.config.timezone,
    });

    try {
      this.task = cron.schedule(
        this.config.cronExpression,
        () => this.executeScheduledWorkflow(),
        {
          timezone: this.config.timezone || 'UTC',
        }
      );

      this.state.isRunning = true;
      logger.info('CRE scheduler started successfully');
    } catch (error) {
      logger.error('Failed to start CRE scheduler', {
        error: error instanceof Error ? error.message : String(error),
      });
      this.state.isRunning = false;
    }
  }

  /**
   * Stop the CRE scheduler
   */
  public stop(): void {
    if (!this.task) {
      logger.warn('CRE scheduler is not running');
      return;
    }

    logger.info('Stopping CRE scheduler');
    this.task.stop();
    this.task = null;
    this.state.isRunning = false;
    logger.info('CRE scheduler stopped');
  }

  /**
   * Execute the scheduled workflow
   */
  private async executeScheduledWorkflow(): Promise<void> {
    const executionStart = Date.now();

    try {
      logger.info('CRE scheduled workflow execution started', {
        executionNumber: this.state.totalExecutions + 1,
      });

      // Get all exchanges
      const allExchanges = exchangeService.getAllExchanges();
      const exchangeIds = allExchanges.map((e) => e.id);

      // Execute batch workflow
      const results = await executeBatchCREWorkflow(exchangeIds, this.config.concurrency);

      // Store all results
      const storePromises = results.map(async (result) => {
        if (result.status === 'success' || result.status === 'partial') {
          try {
            await storeWorkflowResult(result);
          } catch (error) {
            logger.error('Failed to store workflow result', {
              exchangeId: result.exchangeId,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      });

      await Promise.all(storePromises);

      // Update state
      const successCount = results.filter((r) => r.status === 'success').length;
      const failedCount = results.filter((r) => r.status === 'failed').length;
      const executionTime = Date.now() - executionStart;

      this.state.lastExecution = {
        timestamp: Date.now(),
        duration: executionTime,
        successCount,
        failedCount,
      };

      this.state.totalExecutions++;
      if (failedCount > 0) {
        this.state.totalErrors += failedCount;
      }

      // Schedule next execution
      if (this.task) {
        const nextDate = this.getNextExecutionDate();
        this.state.nextExecution = nextDate;
      }

      logger.info('CRE scheduled workflow execution completed', {
        executionNumber: this.state.totalExecutions,
        duration: executionTime,
        successCount,
        failedCount,
        nextExecution: this.state.nextExecution?.toISOString(),
      });
    } catch (error) {
      logger.error('CRE scheduled workflow execution error', {
        executionNumber: this.state.totalExecutions + 1,
        error: error instanceof Error ? error.message : String(error),
      });

      this.state.totalErrors++;
    }
  }

  /**
   * Get the next execution date
   */
  private getNextExecutionDate(): Date {
    // Parse cron expression to get next run
    // For simplicity, add 5 minutes if standard 5-minute schedule
    if (this.config.cronExpression === '*/5 * * * *') {
      const next = new Date();
      next.setMinutes(next.getMinutes() + 5);
      return next;
    }
    return new Date();
  }

  /**
   * Get current scheduler state
   */
  public getState(): SchedulerState {
    return { ...this.state };
  }

  /**
   * Get scheduler configuration
   */
  public getConfig(): ScheduleConfig {
    return { ...this.config };
  }

  /**
   * Update scheduler configuration
   * Note: Changes only take effect after stop/start
   */
  public updateConfig(config: Partial<ScheduleConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('CRE scheduler configuration updated', this.config);
  }

  /**
   * Check if scheduler is running
   */
  public isRunning(): boolean {
    return this.state.isRunning;
  }
}

// Create global instance
export const creScheduler = new CREScheduler({
  enabled: process.env.CRE_SCHEDULER_ENABLED === 'true',
  cronExpression: process.env.CRE_CRON_EXPRESSION || '*/5 * * * *',
  concurrency: parseInt(process.env.CRE_CONCURRENCY || '3', 10),
  timezone: process.env.CRE_TIMEZONE || 'UTC',
});

/**
 * Initialize CRE scheduler on application startup
 */
export function initializeCREScheduler(): void {
  logger.info('Initializing CRE scheduler');

  // Start scheduler if enabled
  if (process.env.CRE_SCHEDULER_ENABLED === 'true') {
    creScheduler.start();
  } else {
    logger.info('CRE scheduler is disabled (set CRE_SCHEDULER_ENABLED=true to enable)');
  }

  // Log state periodically
  setInterval(() => {
    const state = creScheduler.getState();
    logger.debug('CRE scheduler state', state);
  }, 60000); // Every minute
}

export default CREScheduler;
