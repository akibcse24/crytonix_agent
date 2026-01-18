/**
 * OpenAI Provider Adapter
 * Implements the unified LLM provider interface for OpenAI GPT models
 */

import OpenAI from 'openai';
import type {
    LLMProvider,
    LLMParams,
    LLMResponse,
    LLMStreamChunk,
    ModelInfo,
    TokenUsage,
} from '@/lib/types/llm.types';

export class OpenAIProvider implements LLMProvider {
    name = 'openai' as const;
    private client: OpenAI;
    private apiKey: string;

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
        this.client = new OpenAI({ apiKey: this.apiKey });
    }

    /**
     * Generate completion (non-streaming)
     */
    async generate(params: LLMParams): Promise<LLMResponse> {
        const startTime = Date.now();

        try {
            const response = await this.client.chat.completions.create({
                model: params.model || 'gpt-4o-mini',
                messages: params.messages.map((msg) => ({
                    role: msg.role as 'system' | 'user' | 'assistant',
                    content: msg.content || '',
                    ...(msg.toolCalls && { tool_calls: msg.toolCalls }),
                    ...(msg.toolCallId && { tool_call_id: msg.toolCallId }),
                })),
                temperature: params.temperature,
                max_tokens: params.maxTokens,
                top_p: params.topP,
                frequency_penalty: params.frequencyPenalty,
                presence_penalty: params.presencePenalty,
                tools: params.tools,
                tool_choice: params.toolChoice,
                user: params.user,
            });

            const choice = response.choices[0];
            const tokens: TokenUsage = {
                prompt: response.usage?.prompt_tokens || 0,
                completion: response.usage?.completion_tokens || 0,
                total: response.usage?.total_tokens || 0,
            };

            return {
                id: response.id,
                content: choice.message.content,
                toolCalls: choice.message.tool_calls?.map((tc: any) => ({
                    id: tc.id,
                    type: 'function',
                    function: {
                        name: tc.function.name,
                        arguments: tc.function.arguments,
                    },
                })),
                tokens,
                cost: this.getCost(params.model || 'gpt-4o-mini', tokens),
                latency: Date.now() - startTime,
                finishReason: (choice.finish_reason as any) || 'stop',
                model: response.model,
                provider: this.name,
            };
        } catch (error) {
            throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Generate streaming completion
     */
    async *stream(params: LLMParams): AsyncGenerator<LLMStreamChunk, void, unknown> {
        try {
            const stream = await this.client.chat.completions.create({
                model: params.model || 'gpt-4o-mini',
                messages: params.messages.map((msg) => ({
                    role: msg.role as 'system' | 'user' | 'assistant',
                    content: msg.content || '',
                })),
                temperature: params.temperature,
                max_tokens: params.maxTokens,
                top_p: params.topP,
                stream: true,
                tools: params.tools,
            });

            for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta;

                yield {
                    id: chunk.id,
                    delta: delta?.content || '',
                    toolCalls: delta?.tool_calls?.map((tc) => ({
                        id: tc.id,
                        type: 'function' as const,
                        function: {
                            name: tc.function?.name || '',
                            arguments: tc.function?.arguments || '',
                        },
                    })),
                    finishReason: chunk.choices[0]?.finish_reason as any,
                };
            }
        } catch (error) {
            throw new Error(`OpenAI stream error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Generate text embeddings
     */
    async embed(text: string): Promise<number[]> {
        try {
            const response = await this.client.embeddings.create({
                model: 'text-embedding-3-small',
                input: text,
            });

            return response.data[0].embedding;
        } catch (error) {
            throw new Error(`OpenAI embeddings error: ${error instanceof Error ? error.message : String(error)}`);
        }
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
            await this.client.models.list();
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
                id: 'gpt-4o',
                name: 'GPT-4o',
                provider: this.name,
                contextWindow: 128000,
                maxOutput: 16384,
                supportsTools: true,
                supportsVision: true,
                costPer1MInput: 2.50,
                costPer1MOutput: 10.00,
            },
            {
                id: 'gpt-4o-mini',
                name: 'GPT-4o Mini',
                provider: this.name,
                contextWindow: 128000,
                maxOutput: 16384,
                supportsTools: true,
                supportsVision: true,
                costPer1MInput: 0.15,
                costPer1MOutput: 0.60,
            },
            {
                id: 'gpt-4-turbo',
                name: 'GPT-4 Turbo',
                provider: this.name,
                contextWindow: 128000,
                maxOutput: 4096,
                supportsTools: true,
                supportsVision: true,
                costPer1MInput: 10.00,
                costPer1MOutput: 30.00,
            },
            {
                id: 'gpt-3.5-turbo',
                name: 'GPT-3.5 Turbo',
                provider: this.name,
                contextWindow: 16385,
                maxOutput: 4096,
                supportsTools: true,
                supportsVision: false,
                costPer1MInput: 0.50,
                costPer1MOutput: 1.50,
            },
        ];

        return models;
    }

    /**
     * Get model pricing information
     */
    private getModelCosts(model: string): { inputPer1M: number; outputPer1M: number } {
        const costs: Record<string, { inputPer1M: number; outputPer1M: number }> = {
            'gpt-4o': { inputPer1M: 2.50, outputPer1M: 10.00 },
            'gpt-4o-mini': { inputPer1M: 0.15, outputPer1M: 0.60 },
            'gpt-4-turbo': { inputPer1M: 10.00, outputPer1M: 30.00 },
            'gpt-4-turbo-preview': { inputPer1M: 10.00, outputPer1M: 30.00 },
            'gpt-4': { inputPer1M: 30.00, outputPer1M: 60.00 },
            'gpt-3.5-turbo': { inputPer1M: 0.50, outputPer1M: 1.50 },
            'gpt-3.5-turbo-0125': { inputPer1M: 0.50, outputPer1M: 1.50 },
        };

        return costs[model] || { inputPer1M: 0.50, outputPer1M: 1.50 }; // Default to cheapest
    }
}
