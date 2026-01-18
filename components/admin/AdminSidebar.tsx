'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Database,
    DollarSign,
    FileText,
    Bot,
    Settings,
    Activity,
    Wrench,
    Cloud
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Providers', href: '/admin/providers', icon: Cloud },
    { name: 'Analytics', href: '/admin/analytics', icon: DollarSign },
    { name: 'Knowledge', href: '/admin/knowledge', icon: Database },
    { name: 'Agents', href: '/admin/agents', icon: Bot },
    { name: 'Logs', href: '/admin/logs', icon: FileText },
    { name: 'Monitoring', href: '/admin/monitoring', icon: Activity },
    { name: 'Tools', href: '/admin/tools', icon: Wrench },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
            <div className="flex flex-col flex-grow bg-gray-900 pt-5 pb-4 overflow-y-auto">
                {/* Logo */}
                <div className="flex items-center flex-shrink-0 px-4">
                    <h1 className="text-2xl font-bold text-cyan-400">Crytonix Admin</h1>
                </div>

                {/* Navigation */}
                <nav className="mt-8 flex-1 flex flex-col px-2 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                        ? 'bg-gray-800 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                            >
                                <Icon
                                    className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-gray-300'
                                        }`}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
                    <div className="flex-shrink-0 w-full group block">
                        <div className="flex items-center">
                            <div className="ml-3">
                                <p className="text-xs font-medium text-gray-400">
                                    Admin System
                                </p>
                                <p className="text-xs font-medium text-gray-500">
                                    v1.0.0
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
