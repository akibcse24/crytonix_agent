/**
 * Anthropic (Claude) Provider Adapter
 * Implements the unified LLM provider interface for Anthropic Claude models
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
    LLMProvider,
    LLMParams,
    LLMResponse,
    LLMStreamChunk,
    ModelInfo,
    TokenUsage,
    Message,
} from '@/lib/types/llm.types';

export class AnthropicProvider implements LLMProvider {
    name = 'anthropic' as const;
    private client: Anthropic;
    private apiKey: string;

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
        this.client = new Anthropic({ apiKey: this.apiKey });
    }

    /**
     * Generate completion (non-streaming)
     */
    async generate(params: LLMParams): Promise<LLMResponse> {
        const startTime = Date.now();

        try {
            // Extract system message
            const systemMessage = params.messages.find((m) => m.role === 'system')?.content || undefined;
            const messages = params.messages
                .filter((m) => m.role !== 'system')
                .map((msg) => ({
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content || '',
                }));

            const response = await this.client.messages.create({
                model: params.model || 'claude-3-5-sonnet-20241022',
                max_tokens: params.maxTokens || 4096,
                temperature: params.temperature,
                top_p: params.topP,
                system: systemMessage,
                messages,
                // Claude supports tools via a different format
                ...(params.tools && {
                    tools: params.tools.map((t) => ({
                        name: t.function.name,
                        description: t.function.description,
                        input_schema: t.function.parameters,
                    })),
                }),
            });

            const tokens: TokenUsage = {
                prompt: response.usage.input_tokens,
                completion: response.usage.output_tokens,
                total: response.usage.input_tokens + response.usage.output_tokens,
            };

            // Extract text content
            const textContent = response.content
                .filter((c) => c.type === 'text')
                .map((c: any) => c.text)
                .join('');

            // Extract tool calls
            const toolUse = response.content.filter((c) => c.type === 'tool_use');
            const toolCalls = toolUse.length
                ? toolUse.map((t: any) => ({
                    id: t.id,
                    type: 'function' as const,
                    function: {
                        name: t.name,
                        arguments: JSON.stringify(t.input),
                    },
                }))
                : undefined;

            return {
                id: response.id,
                content: textContent || null,
                toolCalls,
                tokens,
                cost: this.getCost(params.model || 'claude-3-5-sonnet-20241022', tokens),
                latency: Date.now() - startTime,
                finishReason: response.stop_reason === 'end_turn' ? 'stop' : 'tool_calls',
                model: response.model,
                provider: this.name,
            };
        } catch (error) {
            throw new Error(
                `Anthropic API error: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Generate streaming completion
     */
    async *stream(params: LLMParams): AsyncGenerator<LLMStreamChunk, void, unknown> {
        try {
            const systemMessage = params.messages.find((m) => m.role === 'system')?.content || undefined;
            const messages = params.messages
                .filter((m) => m.role !== 'system')
                .map((msg) => ({
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content || '',
                }));

            const stream = await this.client.messages.create({
                model: params.model || 'claude-3-5-sonnet-20241022',
                max_tokens: params.maxTokens || 4096,
                temperature: params.temperature,
                system: systemMessage,
                messages,
                stream: true,
            });

            for await (const event of stream) {
                if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                    yield {
                        id: 'stream',
                        delta: event.delta.text,
                    };
                }

                if (event.type === 'message_stop') {
                    yield {
                        id: 'stream',
                        delta: '',
                        finishReason: 'stop',
                    };
                }
            }
        } catch (error) {
            throw new Error(
                `Anthropic stream error: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Generate text embeddings
     * Note: Anthropic doesn't provide embeddings API, throw error
     */
    async embed(text: string): Promise<number[]> {
        throw new Error('Anthropic does not provide embeddings API. Use Voyage AI or OpenAI instead.');
    }

    /**
     * Calculate cost based on model and token usage
     */
    getCost(model: string, tokens: TokenUsage): number {
        const costs = this.getModelCosts(model);
        const inputCost = (tokens.prompt / 1_000_000) * costs.inputPer1M;
        const outputCost = (tokens.completion / 1_000_000) * costs.outputPer1M;
        return inputCost + outputCost;
    }

    /**
     * Check if provider is available
     */
    async isAvailable(): Promise<boolean> {
        if (!this.apiKey) return false;

        try {
            // Simple test request
            await this.client.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1,
                messages: [{ role: 'user', content: 'test' }],
            });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get available models
     */
    async getModels(): Promise<ModelInfo[]> {
        const models: ModelInfo[] = [
            {
                id: 'claude-3-5-sonnet-20241022',
                name: 'Claude 3.5 Sonnet',
                provider: this.name,
                contextWindow: 200000,
                maxOutput: 8192,
                supportsTools: true,
                supportsVision: true,
                costPer1MInput: 3.00,
                costPer1MOutput: 15.00,
            },
            {
                id: 'claude-3-5-haiku-20241022',
                name: 'Claude 3.5 Haiku',
                provider: this.name,
                contextWindow: 200000,
                maxOutput: 8192,
                supportsTools: true,
                supportsVision: false,
                costPer1MInput: 1.00,
                costPer1MOutput: 5.00,
            },
            {
                id: 'claude-3-opus-20240229',
                name: 'Claude 3 Opus',
                provider: this.name,
                contextWindow: 200000,
                maxOutput: 4096,
                supportsTools: true,
                supportsVision: true,
                costPer1MInput: 15.00,
                costPer1MOutput: 75.00,
            },
            {
                id: 'claude-3-sonnet-20240229',
                name: 'Claude 3 Sonnet',
                provider: this.name,
                contextWindow: 200000,
                maxOutput: 4096,
                supportsTools: true,
                supportsVision: true,
                costPer1MInput: 3.00,
                costPer1MOutput: 15.00,
            },
            {
                id: 'claude-3-haiku-20240307',
                name: 'Claude 3 Haiku',
                provider: this.name,
                contextWindow: 200000,
                maxOutput: 4096,
                supportsTools: true,
                supportsVision: true,
                costPer1MInput: 0.25,
                costPer1MOutput: 1.25,
            },
        ];

        return models;
    }

    /**
     * Get model pricing information
     */
    private getModelCosts(model: string): { inputPer1M: number; outputPer1M: number } {
        const costs: Record<string, { inputPer1M: number; outputPer1M: number }> = {
            'claude-3-5-sonnet-20241022': { inputPer1M: 3.00, outputPer1M: 15.00 },
            'claude-3-5-haiku-20241022': { inputPer1M: 1.00, outputPer1M: 5.00 },
            'claude-3-opus-20240229': { inputPer1M: 15.00, outputPer1M: 75.00 },
            'claude-3-sonnet-20240229': { inputPer1M: 3.00, outputPer1M: 15.00 },
            'claude-3-haiku-20240307': { inputPer1M: 0.25, outputPer1M: 1.25 },
        };

        return costs[model] || { inputPer1M: 3.00, outputPer1M: 15.00 }; // Default to Sonnet
    }
}
