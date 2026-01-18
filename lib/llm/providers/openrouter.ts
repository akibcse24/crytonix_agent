/**
 * OpenRouter LLM Provider
 * Access to 100+ models through a single API
 * https://openrouter.ai/
 */

import type {
    LLMProvider,
    LLMParams,
    LLMResponse,
    LLMStreamChunk,
    ModelInfo,
    TokenUsage,
} from '@/lib/types/llm.types';

export class OpenRouterProvider implements LLMProvider {
    name = 'openrouter' as const;
    private apiKey: string;
    private baseURL = 'https://openrouter.ai/api/v1';
    private availableModels: string[] = [];

    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY || '';

        // Read models from env variable
        const modelList = process.env.OPENROUTER_MODELS ||
            'google/gemini-2.0-flash-exp:free,anthropic/claude-3.5-sonnet,openai/gpt-4o,meta-llama/llama-3.3-70b-instruct,qwen/qwen-2.5-72b-instruct';

        this.availableModels = modelList.split(',').map((m) => m.trim());
    }

    async generate(params: LLMParams): Promise<LLMResponse> {
        if (!this.apiKey) {
            throw new Error('OpenRouter API key not configured');
        }

        const model = params.model || process.env.DEFAULT_OPENROUTER_MODEL || this.availableModels[0];
        const startTime = Date.now();

        try {
            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://crytonix.ai',
                    'X-Title': 'Crytonix AI Agent',
                },
                body: JSON.stringify({
                    model,
                    messages: params.messages.map((msg) => ({
                        role: msg.role,
                        content: msg.content,
                    })),
                    temperature: params.temperature ?? 0.7,
                    max_tokens: params.maxTokens ?? 2000,
                    ...(params.tools && {
                        tools: params.tools.map((tool) => ({
                            type: 'function',
                            function: {
                                name: tool.function.name,
                                description: tool.function.description,
                                parameters: tool.function.parameters,
                            },
                        })),
                    }),
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const choice = data.choices[0];

            const promptTokens = data.usage?.prompt_tokens || 0;
            const completionTokens = data.usage?.completion_tokens || 0;
            const tokens: TokenUsage = {
                prompt: promptTokens,
                completion: completionTokens,
                total: data.usage?.total_tokens || promptTokens + completionTokens,
            };

            return {
                id: data.id || crypto.randomUUID(),
                content: choice.message.content,
                toolCalls: choice.message.tool_calls,
                tokens,
                cost: 0, // OpenRouter doesn't provide cost in response
                latency: Date.now() - startTime,
                finishReason: choice.finish_reason as any,
                model: data.model || model,
                provider: this.name,
            };
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to generate response from OpenRouter');
        }
    }

    async *stream(params: LLMParams): AsyncGenerator<LLMStreamChunk, void, unknown> {
        if (!this.apiKey) {
            throw new Error('OpenRouter API key not configured');
        }

        const model = params.model || process.env.DEFAULT_OPENROUTER_MODEL || this.availableModels[0];

        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://crytonix.ai',
                'X-Title': 'Crytonix AI Agent',
            },
            body: JSON.stringify({
                model,
                messages: params.messages.map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                })),
                temperature: params.temperature ?? 0.7,
                max_tokens: params.maxTokens ?? 2000,
                stream: true,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(data);
                        const delta = parsed.choices?.[0]?.delta;

                        if (delta?.content) {
                            yield {
                                id: parsed.id || 'stream',
                                delta: delta.content,
                                finishReason: parsed.choices[0]?.finish_reason,
                            };
                        }
                    } catch (e) {
                        // Ignore parse errors
                    }
                }
            }
        }
    }

    async embed(text: string): Promise<number[]> {
        throw new Error('OpenRouter does not support embeddings - use OpenAI provider instead');
    }

    getCost(_model: string, _tokens: TokenUsage): number {
        return 0; // OpenRouter doesn't provide pricing info
    }

    async isAvailable(): Promise<boolean> {
        return !!this.apiKey;
    }

    async getModels(): Promise<ModelInfo[]> {
        return this.availableModels.map((model) => ({
            id: model,
            name: model,
            provider: this.name,
            contextWindow: 128000,
            maxOutput: 4096,
            supportsTools: true,
            supportsVision: false,
            costPer1MInput: 0,
            costPer1MOutput: 0,
        }));
    }
}
