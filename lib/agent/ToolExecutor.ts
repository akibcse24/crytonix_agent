/**
 * ToolExecutor - Execute tools in a controlled environment
 * Provides sandboxed execution for agent tools
 */

import type { ToolResult, ToolExecutionContext } from '@/lib/types/tool.types';

export class ToolExecutor {
    private tools: Map<string, Function>;
    private executionHistory: Array<{ tool: string; result: ToolResult; timestamp: number }> = [];

    constructor() {
        this.tools = new Map();
    }

    /**
     * Register a tool
     */
    registerTool(name: string, executor: Function): void {
        this.tools.set(name, executor);
    }

    /**
     * Execute a tool with parameters
     */
    async execute(
        toolName: string,
        params: Record<string, any>,
        context?: ToolExecutionContext
    ): Promise<ToolResult> {
        const startTime = Date.now();

        try {
            const tool = this.tools.get(toolName);

            if (!tool) {
                return {
                    success: false,
                    error: `Tool '${toolName}' not found`,
                    executionTime: Date.now() - startTime,
                };
            }

            // Apply timeout if specified
            const timeout = context?.timeout || 30000; // 30 seconds default
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Tool execution timeout')), timeout)
            );

            // Execute tool with timeout
            const resultPromise = tool(params, context);
            const data = await Promise.race([resultPromise, timeoutPromise]);

            const result: ToolResult = {
                success: true,
                data,
                executionTime: Date.now() - startTime,
            };

            // Record execution
            this.executionHistory.push({
                tool: toolName,
                result,
                timestamp: Date.now(),
            });

            return result;
        } catch (error) {
            const result: ToolResult = {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                executionTime: Date.now() - startTime,
            };

            // Record failed execution
            this.executionHistory.push({
                tool: toolName,
                result,
                timestamp: Date.now(),
            });

            return result;
        }
    }

    /**
     * Execute multiple tools in sequence
     */
    async executeSequence(
        tools: Array<{ name: string; params: Record<string, any> }>,
        context?: ToolExecutionContext
    ): Promise<ToolResult[]> {
        const results: ToolResult[] = [];

        for (const { name, params } of tools) {
            const result = await this.execute(name, params, context);
            results.push(result);

            // Stop on first failure
            if (!result.success) {
                break;
            }
        }

        return results;
    }

    /**
     * Execute multiple tools in parallel
     */
    async executeParallel(
        tools: Array<{ name: string; params: Record<string, any> }>,
        context?: ToolExecutionContext
    ): Promise<ToolResult[]> {
        const promises = tools.map(({ name, params }) => this.execute(name, params, context));
        return Promise.all(promises);
    }

    /**
     * Get execution history
     */
    getHistory(limit: number = 10): Array<{ tool: string; result: ToolResult; timestamp: number }> {
        return this.executionHistory.slice(-limit);
    }

    /**
     * Clear execution history
     */
    clearHistory(): void {
        this.executionHistory = [];
    }

    /**
     * Get list of registered tools
     */
    getRegisteredTools(): string[] {
        return Array.from(this.tools.keys());
    }

    /**
     * Check if tool exists
     */
    hasTool(name: string): boolean {
        return this.tools.has(name);
    }

    /**
     * Unregister a tool
     */
    unregisterTool(name: string): boolean {
        return this.tools.delete(name);
    }
}
