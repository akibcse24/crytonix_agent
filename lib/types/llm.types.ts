/**
 * Unified LLM Provider Types
 * Abstraction layer for multiple LLM providers (OpenAI, Anthropic, Groq, Google, Ollama)
 */

export type ProviderName =
    | 'openai'
    | 'anthropic'
    | 'groq'
    | 'google'
    | 'ollama'
    | 'openrouter'
    | 'azure-openai'
    | 'perplexity';

export interface Message {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string | null;
    name?: string;
    toolCalls?: ToolCall[];
    toolCallId?: string;
}

export interface ToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
}

export interface Tool {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: {
            type: 'object';
            properties: Record<string, any>;
            required?: string[];
        };
    };
}

export interface LLMParams {
    messages: Message[];
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    tools?: Tool[];
    toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
    stream?: boolean;
    user?: string;
}

export interface TokenUsage {
    prompt: number;
    completion: number;
    total: number;
}

export interface LLMResponse {
    id: string;
    content: string | null;
    toolCalls?: ToolCall[];
    tokens: TokenUsage;
    cost: number;
    latency: number;
    finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter';
    model: string;
    provider: ProviderName;
}

export interface LLMStreamChunk {
    id: string;
    delta: string;
    toolCalls?: Partial<ToolCall>[];
    finishReason?: 'stop' | 'length' | 'tool_calls' | 'content_filter';
}

/**
 * Core interface that all LLM providers must implement
 */
export interface LLMProvider {
    name: ProviderName;

    /**
     * Generate a completion (non-streaming)
     */
    generate(params: LLMParams): Promise<LLMResponse>;

    /**
     * Generate a streaming completion
     */
    stream(params: LLMParams): AsyncGenerator<LLMStreamChunk, void, unknown>;

    /**
     * Generate embeddings for text
     */
    embed(text: string): Promise<number[]>;

    /**
     * Get cost per million tokens
     */
    getCost(model: string, tokens: TokenUsage): number;

    /**
     * Check if provider is available (API key configured, service reachable)
     */
    isAvailable(): Promise<boolean>;

    /**
     * Get list of available models
     */
    getModels(): Promise<ModelInfo[]>;
}

export interface ModelInfo {
    id: string;
    name: string;
    provider: ProviderName;
    contextWindow: number;
    maxOutput: number;
    supportsTools: boolean;
    supportsVision: boolean;
    costPer1MInput: number;
    costPer1MOutput: number;
}

/**
 * Smart routing configuration
 */
export interface RoutingStrategy {
    primary: ProviderName;
    fallbacks: ProviderName[];
    criteria: 'cost' | 'speed' | 'quality' | 'capability';
}

export interface ProviderConfig {
    apiKey: string;
    baseUrl?: string;
    organization?: string;
    defaultModel?: string;
    timeout?: number;
    maxRetries?: number;
}
