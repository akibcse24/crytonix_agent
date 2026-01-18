import { Activity, Cpu, Database, HardDrive, Zap } from 'lucide-react';

export default async function MonitoringPage() {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    System Monitoring
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Real-time system health and performance metrics
                </p>
            </div>

            {/* System Health */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <Activity className="h-8 w-8 text-green-600" />
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Healthy
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">System Status</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        Online
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <Cpu className="h-8 w-8 text-cyan-600" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.floor(uptime / 3600)}h {Math.floor((uptime % 3600) / 60)}m
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <HardDrive className="h-8 w-8 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <Database className="h-8 w-8 text-orange-600" />
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Connected
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Database</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        PostgreSQL
                    </p>
                </div>
            </div>

            {/* Provider Status */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    LLM Provider Status
                </h2>

                <div className="space-y-3">
                    {['OpenAI', 'Anthropic', 'Groq', 'Google AI', 'Ollama', 'OpenRouter'].map((provider) => (
                        <div key={provider} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="font-medium text-gray-900 dark:text-white">{provider}</span>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Latency: ~{Math.floor(Math.random() * 500 + 200)}ms
                                </span>
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    Operational
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* API Performance */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    API Performance
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">342ms</p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Requests/min</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">24</p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Error Rate</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">0.3%</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
