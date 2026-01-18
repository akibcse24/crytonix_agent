import { Cloud, CheckCircle, XCircle, Settings as SettingsIcon } from 'lucide-react';
import ProviderCard from '@/components/admin/ProviderCard';

const providers = [
    {
        id: 'openai',
        name: 'OpenAI',
        icon: '🤖',
        isConfigured: !!process.env.OPENAI_API_KEY,
        isActive: !!process.env.OPENAI_API_KEY,
        models: process.env.OPENAI_MODELS?.split(',') || [],
        defaultModel: process.env.DEFAULT_OPENAI_MODEL || 'gpt-4o-mini',
    },
    {
        id: 'anthropic',
        name: 'Anthropic',
        icon: '🧠',
        isConfigured: !!process.env.ANTHROPIC_API_KEY,
        isActive: !!process.env.ANTHROPIC_API_KEY,
        models: process.env.ANTHROPIC_MODELS?.split(',') || [],
        defaultModel: process.env.DEFAULT_ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022',
    },
    {
        id: 'groq',
        name: 'Groq',
        icon: '⚡',
        isConfigured: !!process.env.GROQ_API_KEY,
        isActive: !!process.env.GROQ_API_KEY,
        models: process.env.GROQ_MODELS?.split(',') || [],
        defaultModel: process.env.DEFAULT_GROQ_MODEL || 'llama-3.3-70b-versatile',
    },
    {
        id: 'google',
        name: 'Google AI',
        icon: '🔷',
        isConfigured: !!process.env.GOOGLE_API_KEY,
        isActive: !!process.env.GOOGLE_API_KEY,
        models: process.env.GOOGLE_MODELS?.split(',') || [],
        defaultModel: process.env.DEFAULT_GOOGLE_MODEL || 'gemini-2.0-flash-exp',
    },
    {
        id: 'ollama',
        name: 'Ollama',
        icon: '🦙',
        isConfigured: process.env.ENABLE_OLLAMA === 'true',
        isActive: process.env.ENABLE_OLLAMA === 'true',
        models: process.env.OLLAMA_MODELS?.split(',') || [],
        defaultModel: process.env.DEFAULT_OLLAMA_MODEL || 'llama3.2',
    },
    {
        id: 'openrouter',
        name: 'OpenRouter',
        icon: '🌐',
        isConfigured: !!process.env.OPENROUTER_API_KEY,
        isActive: !!process.env.OPENROUTER_API_KEY,
        models: process.env.OPENROUTER_MODELS?.split(',') || [],
        defaultModel: process.env.DEFAULT_OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free',
    },
];

export default function ProvidersPage() {
    const activeCount = providers.filter((p) => p.isActive).length;
    const configuredCount = providers.filter((p) => p.isConfigured).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    LLM Providers
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Manage API keys and configure language model providers
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <Cloud className="h-8 w-8 text-cyan-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Providers
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {providers.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Active
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {activeCount}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <SettingsIcon className="h-8 w-8 text-purple-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Configured
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {configuredCount}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Provider Cards */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {providers.map((provider) => (
                    <ProviderCard key={provider.id} provider={provider} />
                ))}
            </div>
        </div>
    );
}
