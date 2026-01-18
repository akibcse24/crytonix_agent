import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import UserTable from '@/components/admin/UserTable';
import { Search, UserPlus } from 'lucide-react';

async function getUsers() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: {
                    threads: true,
                    agents: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return users;
}

export default async function UsersPage() {
    const users = await getUsers();

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Users
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Manage user accounts and permissions
                    </p>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors">
                    <UserPlus className="h-4 w-4" />
                    Add User
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Users
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {users.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Admins
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {users.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Verified
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {users.filter((u) => u.emailVerified).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Table */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <UserTable users={users} />
            </div>
        </div>
    );
}
