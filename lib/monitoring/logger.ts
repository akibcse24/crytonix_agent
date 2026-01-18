/**
 * Winston Logger Configuration
 * Structured logging with different levels and transports
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

winston.addColors(colors);

// Custom format for console output
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf((info) => {
        const { timestamp, level, message, ...meta } = info;
        let metaString = '';

        if (Object.keys(meta).length > 0) {
            metaString = `\n${JSON.stringify(meta, null, 2)}`;
        }

        return `${timestamp} [${level}]: ${message}${metaString}`;
    })
);

// JSON format for file output
const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Create transports
const transports: winston.transport[] = [];

// Console transport (only in development)
if (process.env.NODE_ENV !== 'production') {
    transports.push(
        new winston.transports.Console({
            format: consoleFormat,
        })
    );
}

// File transport - Error logs
transports.push(
    new DailyRotateFile({
        filename: path.join(process.cwd(), 'logs', 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        format: fileFormat,
        maxSize: '20m',
        maxFiles: '14d',
        zippedArchive: true,
    })
);

// File transport - Combined logs
transports.push(
    new DailyRotateFile({
        filename: path.join(process.cwd(), 'logs', 'combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        format: fileFormat,
        maxSize: '20m',
        maxFiles: '30d',
        zippedArchive: true,
    })
);

// File transport - LLM-specific logs (cost, performance)
transports.push(
    new DailyRotateFile({
        filename: path.join(process.cwd(), 'logs', 'llm-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'info',
        format: fileFormat,
        maxSize: '20m',
        maxFiles: '30d',
        zippedArchive: true,
    })
);

// Create logger instance
export const logger = winston.createLogger({
    levels,
    level: process.env.LOG_LEVEL || 'info',
    transports,
    exitOnError: false,
});

/**
 * Log LLM API call
 */
export function logLLMCall(data: {
    provider: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
    latency: number;
    success: boolean;
    error?: string;
}) {
    logger.info('LLM API Call', {
        type: 'llm_call',
        ...data,
        timestamp: new Date().toISOString(),
    });
}

/**
 * Log agent execution
 */
export function logAgentExecution(data: {
    agentId: string;
    agentName: string;
    taskType: string;
    duration: number;
    toolsUsed: string[];
    success: boolean;
    error?: string;
}) {
    logger.info('Agent Execution', {
        type: 'agent_execution',
        ...data,
        timestamp: new Date().toISOString(),
    });
}

/**
 * Log API request
 */
export function logAPIRequest(data: {
    method: string;
    path: string;
    statusCode: number;
    duration: number;
    userId?: string;
    error?: string;
}) {
    const level = data.statusCode >= 500 ? 'error' : data.statusCode >= 400 ? 'warn' : 'http';

    logger.log(level, 'API Request', {
        type: 'api_request',
        ...data,
        timestamp: new Date().toISOString(),
    });
}

/**
 * Log security event
 */
export function logSecurityEvent(data: {
    event: string;
    userId?: string;
    ipAddress?: string;
    details?: Record<string, any>;
    severity: 'low' | 'medium' | 'high' | 'critical';
}) {
    const level = data.severity === 'critical' || data.severity === 'high' ? 'error' : 'warn';

    logger.log(level, 'Security Event', {
        type: 'security',
        ...data,
        timestamp: new Date().toISOString(),
    });
}

/**
 * Log cost tracking
 */
export function logCost(data: {
    provider: string;
    model: string;
    cost: number;
    userId?: string;
    requestId?: string;
}) {
    logger.info('Cost Tracking', {
        type: 'cost',
        ...data,
        timestamp: new Date().toISOString(),
    });
}

// Export logger as default
export default logger;
