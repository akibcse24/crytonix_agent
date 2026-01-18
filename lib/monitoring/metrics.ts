/**
 * Metrics Collection for Monitoring
 * Track LLM costs, API performance, and system health
 */

interface Metric {
    timestamp: Date;
    value: number;
    tags?: Record<string, string>;
}

class MetricsCollector {
    private metrics: Map<string, Metric[]> = new Map();
    private readonly MAX_METRICS_PER_KEY = 1000;

    /**
     * Record a metric
     */
    record(name: string, value: number, tags?: Record<string, string>): void {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }

        const metricsList = this.metrics.get(name)!;
        metricsList.push({
            timestamp: new Date(),
            value,
            tags,
        });

        // Keep only recent metrics
        if (metricsList.length > this.MAX_METRICS_PER_KEY) {
            metricsList.shift();
        }
    }

    /**
     * Get metrics summary
     */
    getSummary(name: string, timeWindow?: number): {
        count: number;
        sum: number;
        avg: number;
        min: number;
        max: number;
        latest: number;
    } | null {
        const metricsList = this.metrics.get(name);
        if (!metricsList || metricsList.length === 0) {
            return null;
        }

        let filteredMetrics = metricsList;

        // Filter by time window if specified (in milliseconds)
        if (timeWindow) {
            const cutoff = Date.now() - timeWindow;
            filteredMetrics = metricsList.filter((m) => m.timestamp.getTime() >= cutoff);
        }

        if (filteredMetrics.length === 0) {
            return null;
        }

        const values = filteredMetrics.map((m) => m.value);
        const sum = values.reduce((a, b) => a + b, 0);

        return {
            count: filteredMetrics.length,
            sum,
            avg: sum / filteredMetrics.length,
            min: Math.min(...values),
            max: Math.max(...values),
            latest: values[values.length - 1],
        };
    }

    /**
     * Get all metrics
     */
    getAllMetrics(): Record<string, Metric[]> {
        const result: Record<string, Metric[]> = {};
        this.metrics.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }

    /**
     * Clear old metrics
     */
    clear(name?: string): void {
        if (name) {
            this.metrics.delete(name);
        } else {
            this.metrics.clear();
        }
    }
}

// Singleton instance
export const metrics = new MetricsCollector();

/**
 * Track LLM costs
 */
export function trackLLMCost(provider: string, model: string, cost: number): void {
    metrics.record('llm.cost', cost, { provider, model });
    metrics.record(`llm.cost.${provider}`, cost, { model });
}

/**
 * Track LLM tokens
 */
export function trackLLMTokens(
    provider: string,
    model: string,
    promptTokens: number,
    completionTokens: number
): void {
    metrics.record('llm.tokens.prompt', promptTokens, { provider, model });
    metrics.record('llm.tokens.completion', completionTokens, { provider, model });
    metrics.record('llm.tokens.total', promptTokens + completionTokens, { provider, model });
}

/**
 * Track API latency
 */
export function trackAPILatency(endpoint: string, duration: number): void {
    metrics.record('api.latency', duration, { endpoint });
}

/**
 * Track API errors
 */
export function trackAPIError(endpoint: string, statusCode: number, errorType: string): void {
    metrics.record('api.errors', 1, { endpoint, statusCode: statusCode.toString(), errorType });
}

/**
 * Track agent execution time
 */
export function trackAgentExecution(agentName: string, duration: number, success: boolean): void {
    metrics.record('agent.execution_time', duration, { agentName, success: success.toString() });
    metrics.record('agent.executions', 1, { agentName, success: success.toString() });
}

/**
 * Track tool usage
 */
export function trackToolUsage(toolName: string, duration: number, success: boolean): void {
    metrics.record('tool.usage', 1, { toolName, success: success.toString() });
    metrics.record('tool.duration', duration, { toolName });
}

/**
 * Get cost summary for all providers
 */
export function getCostSummary(timeWindow?: number): Record<string, any> {
    const providers = ['openai', 'anthropic', 'groq', 'google', 'ollama', 'openrouter'];
    const summary: Record<string, any> = {};

    providers.forEach((provider) => {
        const providerMetrics = metrics.getSummary(`llm.cost.${provider}`, timeWindow);
        if (providerMetrics) {
            summary[provider] = providerMetrics;
        }
    });

    const totalMetrics = metrics.getSummary('llm.cost', timeWindow);
    if (totalMetrics) {
        summary.total = totalMetrics;
    }

    return summary;
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(timeWindow?: number): Record<string, any> {
    return {
        api: {
            latency: metrics.getSummary('api.latency', timeWindow),
            errors: metrics.getSummary('api.errors', timeWindow),
        },
        agent: {
            executionTime: metrics.getSummary('agent.execution_time', timeWindow),
            executions: metrics.getSummary('agent.executions', timeWindow),
        },
        tool: {
            usage: metrics.getSummary('tool.usage', timeWindow),
            duration: metrics.getSummary('tool.duration', timeWindow),
        },
    };
}
