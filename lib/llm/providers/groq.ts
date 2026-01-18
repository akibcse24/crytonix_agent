/**
 * Groq Provider Adapter
 * Implements the unified LLM provider interface for Groq (ultra-fast inference)
 * Note: Groq uses OpenAI-compatible API
 */

import Groq from 'groq-sdk';
import type {
    LLMProvider,
    LLMParams,
    LLMResponse,
    LLMStreamChunk,
    ModelInfo,
    TokenUsage,
} from '@/lib/types/llm.types';

export class GroqProvider implements LLMProvider {
    name = 'groq' as const;
    private client: Groq;
    private apiKey: string;

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.GROQ_API_KEY || '';
        this.client = new Groq({ apiKey: this.apiKey });
    }

    /**
     * Generate completion (non-streaming)
     */
    async generate(params: LLMParams): Promise<LLMResponse> {
        const startTime = Date.now();

        try {
            const response = await this.client.chat.completions.create({
                model: params.model || 'llama-3.3-70b-versatile',
                messages: params.messages.map((msg) => ({
                    role: msg.role as 'system' | 'user' | 'assistant',
                    content: msg.content || '',
                })),
                temperature: params.temperature,
                max_tokens: params.maxTokens,
                top_p: params.topP,
                // Groq supports tools but with OpenAI format
                tools: params.tools as any,
                tool_choice: params.toolChoice as any,
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
                toolCalls: choice.message.tool_calls?.map((tc) => ({
                    id: tc.id,
                    type: 'function',
                    function: {
                        name: tc.function.name,
                        arguments: tc.function.arguments,
                    },
                })),
                tokens,
                cost: this.getCost(params.model || 'llama-3.3-70b-versatile', tokens),
                latency: Date.now() - startTime,
                finishReason: (choice.finish_reason as any) || 'stop',
                model: response.model,
                provider: this.name,
            };
        } catch (error) {
            throw new Error(`Groq API error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Generate streaming completion
     */
    async *stream(params: LLMParams): AsyncGenerator<LLMStreamChunk, void, unknown> {
        try {
            const stream = await this.client.chat.completions.create({
                model: params.model || 'llama-3.3-70b-versatile',
                messages: params.messages.map((msg) => ({
                    role: msg.role as 'system' | 'user' | 'assistant',
                    content: msg.content || '',
                })),
                temperature: params.temperature,
                max_tokens: params.maxTokens,
                stream: true,
            });

            for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta;

                yield {
                    id: chunk.id,
                    delta: delta?.content || '',
                    finishReason: chunk.choices[0]?.finish_reason as any,
                };
            }
        } catch (error) {
            throw new Error(`Groq stream error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Generate text embeddings
     * Note: Groq doesn't provide embeddings, use OpenAI or Voyage
     */
    async embed(text: string): Promise<number[]> {
        throw new Error('Groq does not provide embeddings API. Use OpenAI or Voyage AI instead.');
    }

    /**
     * Calculate cost based on model and token usage
     * Groq is extremely cheap (often free tier available)
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
                id: 'llama-3.3-70b-versatile',
                name: 'Llama 3.3 70B',
                provider: this.name,
                contextWindow: 128000,
                maxOutput: 32768,
                supportsTools: true,
                supportsVision: false,
                costPer1MInput: 0.59,
                costPer1MOutput: 0.79,
            },
            {
                id: 'llama-3.1-70b-versatile',
                name: 'Llama 3.1 70B',
                provider: this.name,
                contextWindow: 128000,
                maxOutput: 32768,
                supportsTools: true,
                supportsVision: false,
                costPer1MInput: 0.59,
                costPer1MOutput: 0.79,
            },
            {
                id: 'llama-3.1-8b-instant',
                name: 'Llama 3.1 8B',
                provider: this.name,
                contextWindow: 128000,
                maxOutput: 8192,
                supportsTools: true,
                supportsVision: false,
                costPer1MInput: 0.05,
                costPer1MOutput: 0.08,
            },
            {
                id: 'mixtral-8x7b-32768',
                name: 'Mixtral 8x7B',
                provider: this.name,
                contextWindow: 32768,
                maxOutput: 32768,
                supportsTools: true,
                supportsVision: false,
                costPer1MInput: 0.24,
                costPer1MOutput: 0.24,
            },
            {
                id: 'gemma2-9b-it',
                name: 'Gemma 2 9B',
                provider: this.name,
                contextWindow: 8192,
                maxOutput: 8192,
                supportsTools: false,
                supportsVision: false,
                costPer1MInput: 0.20,
                costPer1MOutput: 0.20,
            },
        ];

        return models;
    }

    /**
     * Get model pricing information  
     */
    private getModelCosts(model: string): { inputPer1M: number; outputPer1M: number } {
        const costs: Record<string, { inputPer1M: number; outputPer1M: number }> = {
            'llama-3.3-70b-versatile': { inputPer1M: 0.59, outputPer1M: 0.79 },
            'llama-3.1-70b-versatile': { inputPer1M: 0.59, outputPer1M: 0.79 },
            'llama-3.1-8b-instant': { inputPer1M: 0.05, outputPer1M: 0.08 },
            'mixtral-8x7b-32768': { inputPer1M: 0.24, outputPer1M: 0.24 },
            'gemma2-9b-it': { inputPer1M: 0.20, outputPer1M: 0.20 },
        };

        return costs[model] || { inputPer1M: 0.05, outputPer1M: 0.08 }; // Default to cheapest
    }
}
