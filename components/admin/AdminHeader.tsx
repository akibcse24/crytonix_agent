'use client';

import { Bell, LogOut, Menu } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function AdminHeader() {
    return (
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 shadow">
            {/* Mobile menu button */}
            <button
                type="button"
                className="px-4 border-r border-gray-200 dark:border-gray-700 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 lg:hidden"
            >
                <Menu className="h-6 w-6" />
            </button>

            <div className="flex-1 px-4 flex justify-between">
                {/* Search or breadcrumbs can go here */}
                <div className="flex-1 flex items-center">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Admin Dashboard
                    </h2>
                </div>

                {/* Right side actions */}
                <div className="ml-4 flex items-center md:ml-6 space-x-4">
                    {/* Notifications */}
                    <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
                        <Bell className="h-6 w-6" />
                    </button>

                    {/* Logout */}
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
