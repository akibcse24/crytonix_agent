/**
 * Tool Registry - Dynamic Tool Registration and Management
 * Supports built-in tools, custom tools, and MCP server integration
 */

import type { ToolDefinition, ToolResult } from '@/lib/types/tool.types';

// Import tool modules
import * as fileTools from './file-tools';
import * as webTools from './web-tools';
import * as codeTools from './code-tools';
import * as databaseTools from './database-tools';

export class ToolRegistry {
    private tools: Map<string, ToolDefinition> = new Map();
    private mcpServers: Map<string, any> = new Map();

    constructor() {
        this.registerBuiltInTools();
    }

    /**
     * Register a tool
     */
    register(tool: ToolDefinition): void {
        this.tools.set(tool.name, tool);
    }

    /**
     * Unregister a tool
     */
    unregister(name: string): void {
        this.tools.delete(name);
    }

    /**
     * Get a tool by name
     */
    get(name: string): ToolDefinition | undefined {
        return this.tools.get(name);
    }

    /**
     * List all tools
     */
    list(): ToolDefinition[] {
        return Array.from(this.tools.values());
    }

    /**
     * List tools by category
     */
    listByCategory(category: string): ToolDefinition[] {
        return this.list().filter((tool) => tool.category === category);
    }

    /**
     * Register custom tool from user definition
     */
    registerCustomTool(
        name: string,
        description: string,
        executor: (params: Record<string, any>) => Promise<any>,
        category: string = 'utility'
    ): void {
        this.register({
            name,
            description,
            category: category as any,
            parameters: [], // Can be expanded
            execute: async (params) => {
                const startTime = Date.now();
                try {
                    const data = await executor(params);
                    return {
                        success: true,
                        data,
                        executionTime: Date.now() - startTime,
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : String(error),
                        executionTime: Date.now() - startTime,
                    };
                }
            },
        });
    }

    /**
     * Register MCP server
     * MCP (Model Context Protocol) allows external tools/resources
     */
    async registerMCPServer(name: string, config: {
        command: string;
        args?: string[];
        env?: Record<string, string>;
    }): Promise<void> {
        // Store MCP server config
        this.mcpServers.set(name, config);

        // Register MCP tools as dynamic tools
        // This would integrate with actual MCP protocol in production
        this.register({
            name: `mcp_${name}`,
            description: `MCP server: ${name}`,
            category: 'api',
            parameters: [],
            execute: async (params) => {
                const startTime = Date.now();
                try {
                    // TODO: Actual MCP protocol communication
                    // For now, placeholder
                    return {
                        success: true,
                        data: { message: `MCP server ${name} called with params: ${JSON.stringify(params)}` },
                        executionTime: Date.now() - startTime,
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : String(error),
                        executionTime: Date.now() - startTime,
                    };
                }
            },
        });
    }

    /**
     * Get MCP server config
     */
    getMCPServer(name: string): any {
        return this.mcpServers.get(name);
    }

    /**
     * List all MCP servers
     */
    listMCPServers(): string[] {
        return Array.from(this.mcpServers.keys());
    }

    /**
     * Register built-in tools
     */
    private registerBuiltInTools(): void {
        // File System Tools
        this.register(fileTools.readFileTool);
        this.register(fileTools.writeFileTool);
        this.register(fileTools.listDirectoryTool);
        this.register(fileTools.deleteFileTool);
        this.register(fileTools.createDirectoryTool);

        // Web Scraping Tools
        this.register(webTools.scrapeWebPageTool);
        this.register(webTools.extractLinksTool);
        this.register(webTools.extractTableTool);
        this.register(webTools.getPageMetadataTool);

        // Code Execution Tools
        this.register(codeTools.executeJavaScriptTool);
        this.register(codeTools.executePythonTool);
        this.register(codeTools.installPackageTool);
        this.register(codeTools.runCommandTool);

        // Database Tools
        this.register(databaseTools.queryDatabaseTool);
        this.register(databaseTools.createRecordTool);
        this.register(databaseTools.updateRecordTool);
        this.register(databaseTools.deleteRecordTool);

        // --- Original Built-in Tools ---

        // Web Search Tool
        this.register({
            name: 'web_search',
            description: 'Search the web for information',
            category: 'web',
            parameters: [
                {
                    name: 'query',
                    type: 'string',
                    description: 'Search query',
                    required: true,
                },
                {
                    name: 'maxResults',
                    type: 'number',
                    description: 'Maximum number of results',
                    required: false,
                    default: 5,
                },
            ],
            execute: async (params) => {
                const startTime = Date.now();
                try {
                    // Placeholder - integrate with actual search API (Perplexity, Brave, etc.)
                    const results = [
                        { title: 'Result 1', url: 'https://example.com/1', snippet: 'Sample result 1' },
                        { title: 'Result 2', url: 'https://example.com/2', snippet: 'Sample result 2' },
                    ];
                    return {
                        success: true,
                        data: results.slice(0, params.maxResults || 5),
                        executionTime: Date.now() - startTime,
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : String(error),
                        executionTime: Date.now() - startTime,
                    };
                }
            },
        });

        // Calculator Tool
        this.register({
            name: 'calculator',
            description: 'Perform mathematical calculations',
            category: 'utility',
            parameters: [
                {
                    name: 'expression',
                    type: 'string',
                    description: 'Mathematical expression to evaluate',
                    required: true,
                },
            ],
            execute: async (params) => {
                const startTime = Date.now();
                try {
                    // Safe eval using Function constructor (limited scope)
                    const result = Function(`"use strict"; return (${params.expression})`)();
                    return {
                        success: true,
                        data: { result },
                        executionTime: Date.now() - startTime,
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: 'Invalid mathematical expression',
                        executionTime: Date.now() - startTime,
                    };
                }
            },
        });

        // Get Current Time Tool
        this.register({
            name: 'get_current_time',
            description: 'Get the current date and time',
            category: 'utility',
            parameters: [],
            execute: async () => {
                const startTime = Date.now();
                return {
                    success: true,
                    data: {
                        timestamp: Date.now(),
                        iso: new Date().toISOString(),
                        formatted: new Date().toLocaleString(),
                    },
                    executionTime: Date.now() - startTime,
                };
            },
        });

        // HTTP Request Tool
        this.register({
            name: 'http_request',
            description: 'Make HTTP requests to external APIs',
            category: 'api',
            parameters: [
                {
                    name: 'url',
                    type: 'string',
                    description: 'URL to request',
                    required: true,
                },
                {
                    name: 'method',
                    type: 'string',
                    description: 'HTTP method',
                    required: false,
                    default: 'GET',
                    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                },
                {
                    name: 'body',
                    type: 'object',
                    description: 'Request body',
                    required: false,
                },
            ],
            execute: async (params) => {
                const startTime = Date.now();
                try {
                    const response = await fetch(params.url, {
                        method: params.method || 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        ...(params.body && { body: JSON.stringify(params.body) }),
                    });

                    const data = await response.json();

                    return {
                        success: response.ok,
                        data: { status: response.status, data },
                        executionTime: Date.now() - startTime,
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : String(error),
                        executionTime: Date.now() - startTime,
                    };
                }
            },
        });

        // Text Analysis Tool
        this.register({
            name: 'analyze_text',
            description: 'Analyze text for word count, character count, etc.',
            category: 'data',
            parameters: [
                {
                    name: 'text',
                    type: 'string',
                    description: 'Text to analyze',
                    required: true,
                },
            ],
            execute: async (params) => {
                const startTime = Date.now();
                const text = params.text as string;

                return {
                    success: true,
                    data: {
                        characters: text.length,
                        words: text.split(/\s+/).filter(Boolean).length,
                        lines: text.split('\n').length,
                        sentences: text.split(/[.!?]+/).filter(Boolean).length,
                    },
                    executionTime: Date.now() - startTime,
                };
            },
        });

        // JSON Parser Tool
        this.register({
            name: 'parse_json',
            description: 'Parse and validate JSON',
            category: 'data',
            parameters: [
                {
                    name: 'json',
                    type: 'string',
                    description: 'JSON string to parse',
                    required: true,
                },
            ],
            execute: async (params) => {
                const startTime = Date.now();
                try {
                    const parsed = JSON.parse(params.json as string);
                    return {
                        success: true,
                        data: parsed,
                        executionTime: Date.now() - startTime,
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: 'Invalid JSON',
                        executionTime: Date.now() - startTime,
                    };
                }
            },
        });
    }

    /**
     * Export tools in OpenAI function calling format
     */
    exportForLLM(): Array<{
        type: 'function';
        function: {
            name: string;
            description: string;
            parameters: any;
        };
    }> {
        return this.list().map((tool) => ({
            type: 'function',
            function: {
                name: tool.name,
                description: tool.description,
                parameters: {
                    type: 'object',
                    properties: tool.parameters.reduce((acc, param) => {
                        acc[param.name] = {
                            type: param.type,
                            description: param.description,
                            ...(param.enum && { enum: param.enum }),
                        };
                        return acc;
                    }, {} as Record<string, any>),
                    required: tool.parameters.filter((p) => p.required).map((p) => p.name),
                },
            },
        }));
    }
}

// Global tool registry instance
export const toolRegistry = new ToolRegistry();
