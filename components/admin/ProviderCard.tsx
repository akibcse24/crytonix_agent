'use client';

import { CheckCircle, XCircle, Zap, Settings } from 'lucide-react';

interface Provider {
    id: string;
    name: string;
    icon: string;
    isConfigured: boolean;
    isActive: boolean;
    models: string[];
    defaultModel: string;
}

export default function ProviderCard({ provider }: { provider: Provider }) {
    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{provider.icon}</span>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {provider.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {provider.models.length} models available
                        </p>
                    </div>
                </div>

                {provider.isActive ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                    <XCircle className="h-6 w-6 text-gray-400" />
                )}
            </div>

            {/* Status */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                    {provider.isConfigured ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Configured
                        </span>
                    ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            Not Configured
                        </span>
                    )}
                </div>

                {provider.isConfigured && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Default Model</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {provider.defaultModel}
                        </span>
                    </div>
                )}
            </div>

            {/* Models */}
            {provider.models.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Available Models:</p>
                    <div className="flex flex-wrap gap-2">
                        {provider.models.slice(0, 3).map((model) => (
                            <span
                                key={model}
                                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                            >
                                {model.length > 30 ? model.substring(0, 30) + '...' : model}
                            </span>
                        ))}
                        {provider.models.length > 3 && (
                            <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                                +{provider.models.length - 3} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors">
                    <Zap className="h-4 w-4" />
                    Test Connection
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                    <Settings className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
