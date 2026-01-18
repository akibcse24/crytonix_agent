/**
 * Google (Gemini) Provider Adapter
 * Implements the unified LLM provider interface for Google Gemini models
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import type {
    LLMProvider,
    LLMParams,
    LLMResponse,
    LLMStreamChunk,
    ModelInfo,
    TokenUsage,
} from '@/lib/types/llm.types';

export class GoogleProvider implements LLMProvider {
    name = 'google' as const;
    private client: GoogleGenerativeAI;
    private apiKey: string;

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.GOOGLE_API_KEY || '';
        this.client = new GoogleGenerativeAI(this.apiKey);
    }

    /**
     * Generate completion (non-streaming)
     */
    async generate(params: LLMParams): Promise<LLMResponse> {
        const startTime = Date.now();

        try {
            const model = this.client.getGenerativeModel({
                model: params.model || 'gemini-2.0-flash-exp',
            });

            // Convert messages to Gemini format
            const systemInstruction = params.messages.find((m) => m.role === 'system')?.content;
            const history = params.messages
                .filter((m) => m.role !== 'system')
                .map((msg) => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content || '' }],
                }));

            // Get the last user message
            const lastMessage = history.pop();
            if (!lastMessage) {
                throw new Error('No user message found');
            }

            const chat = model.startChat({
                history: history.slice(0, -1),
                ...(systemInstruction && {
                    systemInstruction: systemInstruction, // SDK handles string or Content
                }),
            });

            const result = await chat.sendMessage(lastMessage.parts[0].text);
            const response = result.response;

            // Extract token usage
            const usageMetadata = response.usageMetadata || {
                promptTokenCount: 0,
                candidatesTokenCount: 0,
                totalTokenCount: 0,
            };

            const tokens: TokenUsage = {
                prompt: usageMetadata.promptTokenCount || 0,
                completion: usageMetadata.candidatesTokenCount || 0,
                total: usageMetadata.totalTokenCount || 0,
            };

            const content = response.text();

            return {
                id: crypto.randomUUID(),
                content,
                tokens,
                cost: this.getCost(params.model || 'gemini-2.0-flash-exp', tokens),
                latency: Date.now() - startTime,
                finishReason: 'stop',
                model: params.model || 'gemini-2.0-flash-exp',
                provider: this.name,
            };
        } catch (error) {
            throw new Error(`Google API error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Generate streaming completion
     */
    async *stream(params: LLMParams): AsyncGenerator<LLMStreamChunk, void, unknown> {
        try {
            const model = this.client.getGenerativeModel({
                model: params.model || 'gemini-2.0-flash-exp',
            });

            const systemInstruction = params.messages.find((m) => m.role === 'system')?.content;
            const history = params.messages
                .filter((m) => m.role !== 'system')
                .map((msg) => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content || '' }],
                }));

            const lastMessage = history.pop();
            if (!lastMessage) {
                throw new Error('No user message found');
            }

            const chat = model.startChat({
                history: history.slice(0, -1),
                ...(systemInstruction && {
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                }),
            });

            const result = await chat.sendMessageStream(lastMessage.parts[0].text);

            for await (const chunk of result.stream) {
                const text = chunk.text();

                yield {
                    id: 'stream',
                    delta: text,
                };
            }

            // Final chunk
            yield {
                id: 'stream',
                delta: '',
                finishReason: 'stop',
            };
        } catch (error) {
            throw new Error(`Google stream error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Generate text embeddings
     */
    async embed(text: string): Promise<number[]> {
        try {
            const model = this.client.getGenerativeModel({ model: 'text-embedding-004' });
            const result = await model.embedContent(text);
            return result.embedding.values;
        } catch (error) {
            throw new Error(
                `Google embeddings error: ${error instanceof Error ? error.message : String(error)}`
            );
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
            const model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
            await model.generateContent('test');
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
                id: 'gemini-2.0-flash-exp',
                name: 'Gemini 2.0 Flash (Experimental)',
                provider: this.name,
                contextWindow: 1000000,
                maxOutput: 8192,
                supportsTools: true,
                supportsVision: true,
                costPer1MInput: 0.00, // Free during preview
                costPer1MOutput: 0.00,
            },
            {
                id: 'gemini-1.5-pro',
                name: 'Gemini 1.5 Pro',
                provider: this.name,
                contextWindow: 2000000,
                maxOutput: 8192,
                supportsTools: true,
                supportsVision: true,
                costPer1MInput: 1.25,
                costPer1MOutput: 5.00,
            },
            {
                id: 'gemini-1.5-flash',
                name: 'Gemini 1.5 Flash',
                provider: this.name,
                contextWindow: 1000000,
                maxOutput: 8192,
                supportsTools: true,
                supportsVision: true,
                costPer1MInput: 0.075,
                costPer1MOutput: 0.30,
            },
            {
                id: 'gemini-1.5-flash-8b',
                name: 'Gemini 1.5 Flash 8B',
                provider: this.name,
                contextWindow: 1000000,
                maxOutput: 8192,
                supportsTools: true,
                supportsVision: true,
                costPer1MInput: 0.0375,
                costPer1MOutput: 0.15,
            },
        ];

        return models;
    }

    /**
     * Get model pricing information
     */
    private getModelCosts(model: string): { inputPer1M: number; outputPer1M: number } {
        const costs: Record<string, { inputPer1M: number; outputPer1M: number }> = {
            'gemini-2.0-flash-exp': { inputPer1M: 0.00, outputPer1M: 0.00 }, // Free preview
            'gemini-1.5-pro': { inputPer1M: 1.25, outputPer1M: 5.00 },
            'gemini-1.5-flash': { inputPer1M: 0.075, outputPer1M: 0.30 },
            'gemini-1.5-flash-8b': { inputPer1M: 0.0375, outputPer1M: 0.15 },
        };

        return costs[model] || { inputPer1M: 0.075, outputPer1M: 0.30 }; // Default to Flash
    }
}
