import { Activity, DollarSign, Users, Zap } from 'lucide-react';
import DashboardCard from '@/components/admin/DashboardCard';
import { getCostSummary, getPerformanceSummary } from '@/lib/monitoring/metrics';

export default async function AdminDashboard() {
    // Get metrics (last 24 hours)
    const timeWindow = 24 * 60 * 60 * 1000; // 24 hours
    const costSummary = getCostSummary(timeWindow);
    const perfSummary = getPerformanceSummary(timeWindow);

    const totalCost = costSummary.total?.sum || 0;
    const apiCalls = perfSummary.api?.latency?.count || 0;
    const avgLatency = perfSummary.api?.latency?.avg || 0;

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Overview of your Crytonix system
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <DashboardCard
                    title="Total Cost"
                    value={`$${totalCost.toFixed(4)}`}
                    change="+12.5%"
                    icon={DollarSign}
                    trend="up"
                />

                <DashboardCard
                    title="API Calls"
                    value={apiCalls.toLocaleString()}
                    change="+5.2%"
                    icon={Activity}
                    trend="up"
                />

                <DashboardCard
                    title="Active Users"
                    value="24"
                    change="+3"
                    icon={Users}
                    trend="up"
                />

                <DashboardCard
                    title="Avg Latency"
                    value={`${Math.round(avgLatency)}ms`}
                    change="-8.1%"
                    icon={Zap}
                    trend="down"
                />
            </div>

            {/* Charts and Tables */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Cost Breakdown */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Cost by Provider
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(costSummary).map(([provider, data]: [string, any]) => {
                            if (provider === 'total' || !data) return null;

                            return (
                                <div key={provider} className="flex justify-between items-center">
                                    <span className="text-sm capitalize text-gray-600 dark:text-gray-400">
                                        {provider}
                                    </span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        ${(data.sum || 0).toFixed(4)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        System Status
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                System Health
                            </span>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                Healthy
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Database
                            </span>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                Connected
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Cache
                            </span>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                Active
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                LLM Providers
                            </span>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                6 Active
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Quick Actions
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <button className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors">
                        View Logs
                    </button>
                    <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                        Manage Users
                    </button>
                    <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                        Configure Providers
                    </button>
                    <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                        Export Data
                    </button>
                </div>
            </div>
        </div>
    );
}
