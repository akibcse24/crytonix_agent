import { DollarSign, TrendingUp, Download } from 'lucide-react';
import { getCostSummary } from '@/lib/monitoring/metrics';
import CostChart from '@/components/admin/CostChart';

export default async function AnalyticsPage() {
    // Get cost data for last 30 days
    const timeWindow = 30 * 24 * 60 * 60 * 1000;
    const costSummary = getCostSummary(timeWindow);

    const totalCost = costSummary.total?.sum || 0;
    const avgCost = costSummary.total?.avg || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Cost Analytics
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Track and analyze LLM usage costs
                    </p>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700">
                    <Download className="h-4 w-4" />
                    Export Report
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <DollarSign className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Cost (30d)
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                ${totalCost.toFixed(4)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-cyan-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Avg per Call
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                ${avgCost.toFixed(6)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <DollarSign className="h-8 w-8 text-purple-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                API Calls
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {costSummary.total?.count || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cost by Provider */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Cost by Provider
                </h2>

                <div className="space-y-4">
                    {Object.entries(costSummary).map(([provider, data]: [string, any]) => {
                        if (provider === 'total' || !data) return null;

                        const percentage = totalCost > 0 ? (data.sum / totalCost) * 100 : 0;

                        return (
                            <div key={provider}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm capitalize font-medium text-gray-900 dark:text-white">
                                        {provider}
                                    </span>
                                    <div className="text-right">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            ${(data.sum || 0).toFixed(4)}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                            ({percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-cyan-600 h-2 rounded-full"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    <span>{data.count} calls</span>
                                    <span>Avg: ${(data.avg || 0).toFixed(6)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Cost Trend Chart */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Cost Trend (Last 7 Days)
                </h2>
                <CostChart />
            </div>

            {/* Top Spending Users (Placeholder) */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Top Spending Users
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                    User-specific cost tracking coming soon...
                </p>
            </div>
        </div>
    );
}
