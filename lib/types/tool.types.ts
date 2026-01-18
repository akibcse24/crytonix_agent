/**
 * Tool System Types
 * Dynamic tool registration and execution with sandboxing
 */

export type ToolParameterType =
    | 'string'
    | 'number'
    | 'boolean'
    | 'object'
    | 'array';

export interface ToolParameter {
    name: string;
    type: ToolParameterType;
    description: string;
    required: boolean;
    default?: any;
    enum?: string[];
    items?: ToolParameter; // For array types
    properties?: Record<string, ToolParameter>; // For object types
}

export interface ToolDefinition {
    name: string;
    description: string;
    category: 'web' | 'code' | 'file' | 'data' | 'api' | 'utility';
    parameters: ToolParameter[];
    execute: (params: Record<string, any>) => Promise<ToolResult>;
    validateInput?: (params: Record<string, any>) => boolean;
    requiresAuth?: boolean;
    rateLimit?: {
        maxCalls: number;
        windowMs: number;
    };
}

export interface ToolResult {
    success: boolean;
    data?: any;
    error?: string;
    executionTime: number;
    metadata?: {
        fromCache?: boolean;
        retryCount?: number;
        tokensUsed?: number;
    };
}

export interface ToolExecutionContext {
    userId?: string;
    sessionId?: string;
    agentId?: string;
    sandbox: boolean;
    timeout: number;
    maxMemory?: number;
}

/**
 * Tool registry for dynamic registration
 */
export interface ToolRegistry {
    register(tool: ToolDefinition): void;
    unregister(name: string): void;
    get(name: string): ToolDefinition | undefined;
    list(): ToolDefinition[];
    listByCategory(category: string): ToolDefinition[];
}

/**
 * Built-in tool categories
 */
export interface WebSearchParams {
    query: string;
    maxResults?: number;
    searchEngine?: 'google' | 'bing' | 'duckduckgo';
}

export interface CodeExecutionParams {
    code: string;
    language: 'javascript' | 'python' | 'typescript';
    timeout?: number;
    dependencies?: string[];
}

export interface FileOperationParams {
    operation: 'read' | 'write' | 'delete' | 'list';
    path: string;
    content?: string;
    encoding?: 'utf-8' | 'base64';
}

export interface ApiCallParams {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
}

export interface CalculatorParams {
    expression: string;
}

/**
 * Tool execution chunking for large results
 */
export interface ChunkedToolResult extends ToolResult {
    chunks: ToolResultChunk[];
    totalChunks: number;
}

export interface ToolResultChunk {
    index: number;
    data: any;
    hasMore: boolean;
}
