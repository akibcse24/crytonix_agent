/**
 * LLM Router - Smart Provider Selection and Fallback
 * Automatically selects the best provider based on criteria: cost, speed, quality, capability
 */

import type {
    LLMProvider,
    LLMParams,
    LLMResponse,
    ProviderName,
    RoutingStrategy,
} from '@/lib/types/llm.types';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { GroqProvider } from './providers/groq';
import { GoogleProvider } from './providers/google';
import { OllamaProvider } from './providers/ollama';
import { OpenRouterProvider } from './providers/openrouter';
import { cache } from '@/lib/cache';

export class LLMRouter {
    private providers: Map<ProviderName, LLMProvider>;
    private fallbackChain: ProviderName[] = [];

    constructor() {
        this.providers = new Map();
        this.initializeProviders();
    }

    /**
     * Initialize all available providers
     */
    private initializeProviders() {
        if (process.env.OPENAI_API_KEY) {
            this.providers.set('openai', new OpenAIProvider());
        }

        if (process.env.ANTHROPIC_API_KEY) {
            this.providers.set('anthropic', new AnthropicProvider());
        }

        if (process.env.GROQ_API_KEY) {
            this.providers.set('groq', new GroqProvider());
        }

        if (process.env.GOOGLE_API_KEY) {
            this.providers.set('google', new GoogleProvider());
        }

        if (process.env.OLLAMA_HOST || process.env.ENABLE_OLLAMA === 'true') {
            this.providers.set('ollama', new OllamaProvider());
        }

        if (process.env.OPENROUTER_API_KEY) {
            this.providers.set('openrouter', new OpenRouterProvider());
        }
    }

    /**
     * Get a specific provider
     */
    getProvider(name: ProviderName): LLMProvider | undefined {
        return this.providers.get(name);
    }

    /**
     * Get all available providers
     */
    getAvailableProviders(): ProviderName[] {
        return Array.from(this.providers.keys());
    }

    /**
     * Check which providers are currently available
     */
    async checkProviderAvailability(): Promise<Record<ProviderName, boolean>> {
        const cacheKey = 'provider-availability';
        const cached = cache.get<Record<ProviderName, boolean>>(cacheKey);

        if (cached) {
            return cached;
        }

        const availability: Record<string, boolean> = {};

        await Promise.all(
            Array.from(this.providers.entries()).map(async ([name, provider]) => {
                try {
                    availability[name] = await provider.isAvailable();
                } catch {
                    availability[name] = false;
                }
            })
        );

        // Cache for 5 minutes
        cache.set(cacheKey, availability as Record<ProviderName, boolean>, 300);

        return availability as Record<ProviderName, boolean>;
    }

    /**
     * Smart provider selection based on routing strategy
     */
    async selectProvider(
        params: LLMParams,
        strategy: RoutingStrategy['criteria'] = 'quality'
    ): Promise<ProviderName | null> {
        const availability = await this.checkProviderAvailability();
        const availableProviders = Object.entries(availability)
            .filter(([_, isAvailable]) => isAvailable)
            .map(([name]) => name as ProviderName);

        if (availableProviders.length === 0) {
            return null;
        }

        switch (strategy) {
            case 'cost':
                return this.selectByCost(availableProviders, params);

            case 'speed':
                return this.selectBySpeed(availableProviders);

            case 'quality':
                return this.selectByQuality(availableProviders, params);

            case 'capability':
                return this.selectByCapability(availableProviders, params);

            default:
                return availableProviders[0];
        }
    }

    /**
     * Generate completion with automatic provider selection and fallback
     */
    async generate(
        params: LLMParams,
        strategy?: RoutingStrategy
    ): Promise<LLMResponse> {
        // Use specified provider if provided
        if (params.model && this.getProviderFromModel(params.model)) {
            const providerName = this.getProviderFromModel(params.model);
            const provider = this.providers.get(providerName!);

            if (provider) {
                try {
                    return await provider.generate(params);
                } catch (error) {
                    console.error(`Provider ${providerName} failed:`, error);
                    // Fall through to fallback logic
                }
            }
        }

        // Smart provider selection
        const selectedProvider = await this.selectProvider(
            params,
            strategy?.criteria || 'quality'
        );

        if (!selectedProvider) {
            throw new Error('No LLM providers available');
        }

        // Try primary provider
        const provider = this.providers.get(selectedProvider);
        if (!provider) {
            throw new Error(`Provider ${selectedProvider} not found`);
        }

        try {
            return await provider.generate(params);
        } catch (error) {
            console.error(`Primary provider ${selectedProvider} failed:`, error);

            // Try fallback chain
            const fallbacks = strategy?.fallbacks || this.getDefaultFallbacks(selectedProvider);

            for (const fallbackName of fallbacks) {
                const fallbackProvider = this.providers.get(fallbackName);

                if (fallbackProvider) {
                    try {
                        console.log(`Trying fallback provider: ${fallbackName}`);
                        return await fallbackProvider.generate(params);
                    } catch (fallbackError) {
                        console.error(`Fallback provider ${fallbackName} failed:`, fallbackError);
                        continue;
                    }
                }
            }

            throw new Error(`All providers failed. Last error: ${error}`);
        }
    }

    /**
     * Select provider by cost (cheapest)
     */
    private selectByCost(
        providers: ProviderName[],
        _params: LLMParams
    ): ProviderName {
        // Cost ranking: Google (free) > Groq > OpenAI > Anthropic
        const costRanking: ProviderName[] = ['google', 'groq', 'openai', 'anthropic'];

        for (const preferred of costRanking) {
            if (providers.includes(preferred)) {
                return preferred;
            }
        }

        return providers[0];
    }

    /**
     * Select provider by speed (fastest inference)
     */
    private selectBySpeed(providers: ProviderName[]): ProviderName {
        // Speed ranking: Groq (fastest) > Google > OpenAI > Anthropic
        const speedRanking: ProviderName[] = ['groq', 'google', 'openai', 'anthropic'];

        for (const preferred of speedRanking) {
            if (providers.includes(preferred)) {
                return preferred;
            }
        }

        return providers[0];
    }

    /**
     * Select provider by quality (best reasoning)
     */
    private selectByQuality(
        providers: ProviderName[],
        params: LLMParams
    ): ProviderName {
        // Quality ranking: OpenAI (GPT-4) > Anthropic (Claude) > Google > Groq
        // But for code, prefer Claude
        const isCodeTask =
            params.messages.some((m) => m.content?.includes('code')) ||
            params.tools?.some((t) => t.function.name.includes('code'));

        if (isCodeTask && providers.includes('anthropic')) {
            return 'anthropic';
        }

        const qualityRanking: ProviderName[] = ['openai', 'anthropic', 'google', 'groq'];

        for (const preferred of qualityRanking) {
            if (providers.includes(preferred)) {
                return preferred;
            }
        }

        return providers[0];
    }

    /**
     * Select provider by capability (e.g., tool calling, vision)
     */
    private selectByCapability(
        providers: ProviderName[],
        params: LLMParams
    ): ProviderName {
        const needsTools = params.tools && params.tools.length > 0;

        if (needsTools) {
            // All providers support tools, prefer fastest with tools
            const toolProviders: ProviderName[] = ['groq', 'openai', 'anthropic', 'google'];

            for (const preferred of toolProviders) {
                if (providers.includes(preferred)) {
                    return preferred;
                }
            }
        }

        return providers[0];
    }

    /**
     * Get provider name from model ID
     */
    private getProviderFromModel(model: string): ProviderName | null {
        if (model.startsWith('gpt-')) return 'openai';
        if (model.startsWith('claude-')) return 'anthropic';
        if (model.startsWith('llama-') || model.startsWith('mixtral-') || model.startsWith('gemma'))
            return 'groq';
        if (model.startsWith('gemini-')) return 'google';

        return null;
    }

    /**
     * Get default fallback chain for a provider
     */
    private getDefaultFallbacks(primary: ProviderName): ProviderName[] {
        const fallbacks: Record<ProviderName, ProviderName[]> = {
            openai: ['anthropic', 'groq', 'google'],
            anthropic: ['openai', 'groq', 'google'],
            groq: ['openai', 'anthropic', 'google'],
            google: ['groq', 'openai', 'anthropic'],
            ollama: ['openai', 'groq', 'google'],
            openrouter: ['openai', 'anthropic', 'google'],
            'azure-openai': ['openai', 'anthropic', 'google'],
            perplexity: ['openai', 'google', 'groq'],
        };

        return fallbacks[primary] || [];
    }

    /**
     * Get cost estimate for a request
     */
    async estimateCost(
        params: LLMParams,
        providerName?: ProviderName
    ): Promise<number> {
        if (providerName) {
            const provider = this.providers.get(providerName);
            if (provider) {
                // Estimate tokens (rough approximation)
                const estimatedPromptTokens = params.messages.reduce(
                    (sum, msg) => sum + (msg.content?.length || 0) / 4,
                    0
                );
                const estimatedCompletionTokens = params.maxTokens || 1000;

                return provider.getCost(params.model || '', {
                    prompt: Math.ceil(estimatedPromptTokens),
                    completion: Math.ceil(estimatedCompletionTokens),
                    total: Math.ceil(estimatedPromptTokens + estimatedCompletionTokens),
                });
            }
        }

        // Return average cost estimate
        return 0.01; // $0.01 average per request
    }
}

// Export singleton instance
export const llmRouter = new LLMRouter();
