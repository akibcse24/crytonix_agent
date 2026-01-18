/**
 * Provider/Model Selector Component
 * Shows only providers with API keys configured
 */

'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from './ThemeProvider';

interface Provider {
    id: string;
    name: string;
    models: string[];
    available: boolean;
}

interface ProviderSelectorProps {
    selected: { provider: string; model: string };
    onChange: (provider: string, model: string) => void;
}

export function ProviderSelector({ selected, onChange }: ProviderSelectorProps) {
    const { theme } = useTheme();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAvailableProviders();
    }, []);

    const fetchAvailableProviders = async () => {
        try {
            const res = await fetch('/api/status');
            const data = await res.json();

            // Map providers from status API
            const providerList: Provider[] = [
                {
                    id: 'openai',
                    name: 'OpenAI',
                    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
                    available: data.providers.openai || false,
                },
                {
                    id: 'anthropic',
                    name: 'Anthropic',
                    models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
                    available: data.providers.anthropic || false,
                },
                {
                    id: 'groq',
                    name: 'Groq',
                    models: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768'],
                    available: data.providers.groq || false,
                },
                {
                    id: 'google',
                    name: 'Google',
                    models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'],
                    available: data.providers.google || false,
                },
                {
                    id: 'ollama',
                    name: 'Ollama',
                    models: ['llama3.2', 'qwen2.5', 'mistral', 'phi3'],
                    available: data.providers.ollama || false,
                },
            ];

            // Filter to only available providers
            setProviders(providerList.filter((p) => p.available));
        } catch (error) {
            console.error('Error fetching providers:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectedProvider = providers.find((p) => p.id === selected.provider);
    const isCyberpunk = theme === 'cyberpunk';

    if (loading) {
        return (
            <div className={`text-xs ${isCyberpunk ? 'text-cyan-500 font-mono' : 'text-gray-500'}`}>
                Loading providers...
            </div>
        );
    }

    if (providers.length === 0) {
        return (
            <div className={`text-xs ${isCyberpunk ? 'text-yellow-500 font-mono' : 'text-orange-500'}`}>
                No providers configured. Add API keys to .env
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {/* Provider Selector */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className={`${isCyberpunk
                                ? 'border-cyan-500/50 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-950/40 font-mono'
                                : 'border-purple-200 bg-white text-purple-600 hover:bg-purple-50'
                            }`}
                    >
                        {selectedProvider?.name || 'Select Provider'}
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className={
                        isCyberpunk
                            ? 'bg-black border-cyan-500/50 text-cyan-100 font-mono'
                            : 'bg-white border-gray-200'
                    }
                >
                    <DropdownMenuLabel className={isCyberpunk ? 'text-cyan-400' : 'text-gray-700'}>
                        LLM Providers
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className={isCyberpunk ? 'bg-cyan-500/30' : 'bg-gray-200'} />
                    {providers.map((provider) => (
                        <DropdownMenuItem
                            key={provider.id}
                            onClick={() => onChange(provider.id, provider.models[0])}
                            className={`${isCyberpunk
                                    ? 'hover:bg-cyan-950/50 focus:bg-cyan-950/50'
                                    : 'hover:bg-purple-50 focus:bg-purple-50'
                                }`}
                        >
                            {selected.provider === provider.id && <Check className="mr-2 h-4 w-4" />}
                            {provider.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Model Selector */}
            {selectedProvider && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={`${isCyberpunk
                                    ? 'border-cyan-500/50 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-950/40 font-mono'
                                    : 'border-purple-200 bg-white text-purple-600 hover:bg-purple-50'
                                }`}
                        >
                            {selected.model}
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className={
                            isCyberpunk
                                ? 'bg-black border-cyan-500/50 text-cyan-100 font-mono'
                                : 'bg-white border-gray-200'
                        }
                    >
                        <DropdownMenuLabel className={isCyberpunk ? 'text-cyan-400' : 'text-gray-700'}>
                            Models
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className={isCyberpunk ? 'bg-cyan-500/30' : 'bg-gray-200'} />
                        {selectedProvider.models.map((model) => (
                            <DropdownMenuItem
                                key={model}
                                onClick={() => onChange(selected.provider, model)}
                                className={`${isCyberpunk
                                        ? 'hover:bg-cyan-950/50 focus:bg-cyan-950/50'
                                        : 'hover:bg-purple-50 focus:bg-purple-50'
                                    }`}
                            >
                                {selected.model === model && <Check className="mr-2 h-4 w-4" />}
                                {model}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}
