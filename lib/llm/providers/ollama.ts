/**
 * Ollama Provider Adapter
 * Implements the unified LLM provider interface for Ollama (local models)
 * Requires Ollama running locally or accessible via network
 */

import type {
    LLMProvider,
    LLMParams,
    LLMResponse,
    LLMStreamChunk,
    ModelInfo,
    TokenUsage,
} from '@/lib/types/llm.types';

interface OllamaMessage {
    role: string;
    content: string;
}

interface OllamaResponse {
    model: string;
    created_at: string;
    message: {
        role: string;
        content: string;
    };
    done: boolean;
    total_duration?: number;
    load_duration?: number;
    prompt_eval_count?: number;
    eval_count?: number;
}

export class OllamaProvider implements LLMProvider {
    name = 'ollama' as const;
    private baseURL: string;
    private availableModels: string[] = [];

    constructor() {
        // Check localStorage for custom Ollama URL (browser only)
        if (typeof window !== 'undefined') {
            const customUrl = localStorage.getItem('crytonix-ollama-url');
            this.baseURL = customUrl || process.env.OLLAMA_HOST || 'http://localhost:11434';
        } else {
            this.baseURL = process.env.OLLAMA_HOST || 'http://localhost:11434';
        }
        // Remove trailing slash if present
        this.baseURL = this.baseURL.replace(/\/$/, '');
    }

    /**
     * Set custom Ollama URL (overrides env variable)
     */
    setCustomUrl(url: string): void {
        this.baseURL = url.replace(/\/$/, '');
        if (typeof window !== 'undefined') {
            localStorage.setItem('crytonix-ollama-url', url);
        }
    }

    /**
     * Clear custom URL (revert to env variable)
     */
    clearCustomUrl(): void {
        this.baseURL = (process.env.OLLAMA_HOST || 'http://localhost:11434').replace(/\/$/, '');
        if (typeof window !== 'undefined') {
            localStorage.removeItem('crytonix-ollama-url');
        }
    }

    /**
     * Get current Ollama URL
     */
    getCurrentUrl(): string {
        return this.baseURL;
    }

    /**
     * Generate completion (non-streaming)
     */
    async generate(params: LLMParams): Promise<LLMResponse> {
        const startTime = Date.now();

        try {
            const messages: OllamaMessage[] = params.messages.map((msg) => ({
                role: msg.role,
                content: msg.content || '',
            }));

            const response = await fetch(`${this.baseURL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: params.model || 'llama3.1',
                    messages,
                    stream: false,
                    options: {
                        temperature: params.temperature,
                        num_predict: params.maxTokens,
                        top_p: params.topP,
                    },
                }),
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.statusText}`);
            }

            const data: OllamaResponse = await response.json();

            const tokens: TokenUsage = {
                prompt: data.prompt_eval_count || 0,
                completion: data.eval_count || 0,
                total: (data.prompt_eval_count || 0) + (data.eval_count || 0),
            };

            return {
                id: crypto.randomUUID(),
                content: data.message.content,
                tokens,
                cost: this.getCost(params.model || 'llama3.1', tokens), // Free for local
                latency: Date.now() - startTime,
                finishReason: 'stop',
                model: params.model || 'llama3.1',
                provider: this.name,
            };
        } catch (error) {
            throw new Error(
                `Ollama error: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Generate streaming completion
     */
    async *stream(params: LLMParams): AsyncGenerator<LLMStreamChunk, void, unknown> {
        try {
            const messages: OllamaMessage[] = params.messages.map((msg) => ({
                role: msg.role,
                content: msg.content || '',
            }));

            const response = await fetch(`${this.baseURL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: params.model || 'llama3.1',
                    messages,
                    stream: true,
                    options: {
                        temperature: params.temperature,
                        num_predict: params.maxTokens,
                    },
                }),
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.statusText}`);
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
                    if (line.trim()) {
                        try {
                            const data: OllamaResponse = JSON.parse(line);

                            yield {
                                id: 'stream',
                                delta: data.message?.content || '',
                                finishReason: data.done ? 'stop' : undefined,
                            };
                        } catch (e) {
                            // Ignore parse errors
                        }
                    }
                }
            }
        } catch (error) {
            throw new Error(
                `Ollama stream error: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Generate text embeddings
     */
    async embed(text: string): Promise<number[]> {
        try {
            const response = await fetch(`${this.baseURL}/api/embeddings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'nomic-embed-text',
                    prompt: text,
                }),
            });

            if (!response.ok) {
                throw new Error(`Ollama embeddings error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.embedding;
        } catch (error) {
            throw new Error(
                `Ollama embeddings error: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Calculate cost (free for local Ollama)
     */
    getCost(_model: string, _tokens: TokenUsage): number {
        return 0.0; // Ollama is free (local hosting)
    }

    /**
     * Check if provider is available
     */
    async isAvailable(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseURL}/api/tags`, {
                method: 'GET',
                signal: AbortSignal.timeout(3000), // 3 second timeout
            });

            return response.ok;
        } catch {
            return false;
        }
    }

    /**
     * Get available models from Ollama instance
     */
    async getModels(): Promise<ModelInfo[]> {
        try {
            const response = await fetch(`${this.baseURL}/api/tags`);

            if (!response.ok) {
                return this.getDefaultModels();
            }

            const data = await response.json();
            const models: ModelInfo[] = data.models?.map((model: any) => ({
                id: model.name,
                name: model.name,
                provider: this.name,
                contextWindow: 4096, // Default, varies by model
                maxOutput: 2048,
                supportsTools: false,
                supportsVision: false,
                costPer1MInput: 0.0,
                costPer1MOutput: 0.0,
            })) || this.getDefaultModels();

            return models;
        } catch {
            return this.getDefaultModels();
        }
    }

    /**
     * Get default models (if Ollama is not reachable)
     */
    private getDefaultModels(): ModelInfo[] {
        return [
            {
                id: 'llama3.1',
                name: 'Llama 3.1',
                provider: this.name,
                contextWindow: 128000,
                maxOutput: 2048,
                supportsTools: false,
                supportsVision: false,
                costPer1MInput: 0.0,
                costPer1MOutput: 0.0,
            },
            {
                id: 'llama3.2',
                name: 'Llama 3.2',
                provider: this.name,
                contextWindow: 128000,
                maxOutput: 2048,
                supportsTools: false,
                supportsVision: false,
                costPer1MInput: 0.0,
                costPer1MOutput: 0.0,
            },
            {
                id: 'mistral',
                name: 'Mistral',
                provider: this.name,
                contextWindow: 8192,
                maxOutput: 2048,
                supportsTools: false,
                supportsVision: false,
                costPer1MInput: 0.0,
                costPer1MOutput: 0.0,
            },
            {
                id: 'codellama',
                name: 'Code Llama',
                provider: this.name,
                contextWindow: 16384,
                maxOutput: 2048,
                supportsTools: false,
                supportsVision: false,
                costPer1MInput: 0.0,
                costPer1MOutput: 0.0,
            },
            {
                id: 'nomic-embed-text',
                name: 'Nomic Embed Text (Embeddings)',
                provider: this.name,
                contextWindow: 8192,
                maxOutput: 0,
                supportsTools: false,
                supportsVision: false,
                costPer1MInput: 0.0,
                costPer1MOutput: 0.0,
            },
        ];
    }
}
