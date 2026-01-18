'use client';

import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
    title: string;
    value: string;
    change: string;
    icon: LucideIcon;
    trend: 'up' | 'down';
}

export default function DashboardCard({ title, value, change, icon: Icon, trend }: DashboardCardProps) {
    const isPositive = trend === 'up';

    return (
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <Icon className={`h-6 w-6 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                {title}
                            </dt>
                            <dd className="flex items-baseline">
                                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {value}
                                </div>
                                <div className={`ml-2 flex items-baseline text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {change}
                                </div>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}
