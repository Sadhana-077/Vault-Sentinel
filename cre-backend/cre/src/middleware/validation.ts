import { Request, Response, NextFunction } from 'express';
import { exchangeService } from '../services/exchange.service.js';
import logger from '../utils/logger.js';

export function validateExchangeParam(
  req: Request<{ exchange: string }>,
  res: Response,
  next: NextFunction
): void {
  const { exchange } = req.params;

  if (!exchange || exchange.trim() === '') {
    res.status(400).json({
      success: false,
      error: 'Exchange parameter is required',
      timestamp: Date.now(),
    });
    return;
  }

  if (!exchangeService.getExchange(exchange)) {
    res.status(404).json({
      success: false,
      error: `Exchange not found: ${exchange}`,
      timestamp: Date.now(),
    });
    return;
  }

  next();
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error({ error: err }, 'Unhandled error');

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: Date.now(),
  });
}
