'use client';

import { Database, Trash2, Key, Wrench, Settings, AlertTriangle } from 'lucide-react';

export default function ToolsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    System Tools
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Utilities and maintenance tools
                </p>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Caution: Administrative Tools
                        </h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            These tools perform critical system operations. Use with care and ensure you have backups.
                        </p>
                    </div>
                </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Database Tools */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Database className="h-6 w-6 text-cyan-600" />
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                            Database
                        </h2>
                    </div>

                    <div className="space-y-3">
                        <button className="w-full px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 text-left">
                            Backup Database
                        </button>
                        <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-left">
                            Restore from Backup
                        </button>
                        <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-left">
                            Run Migrations
                        </button>
                    </div>
                </div>

                {/* Cache Management */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Trash2 className="h-6 w-6 text-orange-600" />
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                            Cache
                        </h2>
                    </div>

                    <div className="space-y-3">
                        <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-left">
                            Clear All Caches
                        </button>
                        <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-left">
                            Clear LLM Cache
                        </button>
                        <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-left">
                            Clear User Sessions
                        </button>
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Key className="h-6 w-6 text-purple-600" />
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                            Security
                        </h2>
                    </div>

                    <div className="space-y-3">
                        <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-left">
                            Regenerate CSRF Tokens
                        </button>
                        <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-left">
                            Rotate API Keys
                        </button>
                        <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-left">
                            View Security Events
                        </button>
                    </div>
                </div>

                {/* System Maintenance */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Wrench className="h-6 w-6 text-red-600" />
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                            Maintenance
                        </h2>
                    </div>

                    <div className="space-y-3">
                        <button className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-left">
                            Enable Maintenance Mode
                        </button>
                        <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-left">
                            Restart Services
                        </button>
                        <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-left">
                            Check System Health
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Actions Log */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Recent Tool Actions
                </h2>

                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No recent actions
                </div>
            </div>
        </div>
    );
}
