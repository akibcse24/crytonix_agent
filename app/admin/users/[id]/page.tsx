import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { format } from 'date-fns';
import { Mail, Calendar, Shield, Activity, MessageSquare, Bot } from 'lucide-react';

async function getUser(id: string) {
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            threads: {
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    totalCost: true,
                    totalTokens: true,
                },
            },
            agents: {
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    role: true,
                    createdAt: true,
                },
            },
            _count: {
                select: {
                    threads: true,
                    agents: true,
                    sessions: true,
                },
            },
        },
    });

    if (!user) {
        notFound();
    }

    return user;
}

export default async function UserDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const user = await getUser(params.id);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        User Details
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {user.email}
                    </p>
                </div>

                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                        Change Role
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                        Ban User
                    </button>
                </div>
            </div>

            {/* User Info Cards */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Profile Card */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Profile Information
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user.role}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Joined</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {format(new Date(user.createdAt), 'PPP')}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Activity className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Email Verified</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user.emailVerified ? format(new Date(user.emailVerified), 'PPP') : 'Not verified'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Activity Statistics
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="h-4 w-4 text-cyan-600" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">Conversations</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {user._count.threads}
                            </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Bot className="h-4 w-4 text-purple-600" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">Agents</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {user._count.agents}
                            </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="h-4 w-4 text-green-600" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">Sessions</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {user._count.sessions}
                            </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4 text-orange-600" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">Days Active</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Conversations */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Recent Conversations
                </h2>

                {user.threads.length > 0 ? (
                    <div className="space-y-3">
                        {user.threads.map((thread) => (
                            <div
                                key={thread.id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {thread.title}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {format(new Date(thread.createdAt), 'PPP')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {thread.totalTokens.toLocaleString()} tokens
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        ${thread.totalCost.toFixed(4)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No conversations yet</p>
                )}
            </div>

            {/* Recent Agents */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    User's Agents
                </h2>

                {user.agents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {user.agents.map((agent) => (
                            <div
                                key={agent.id}
                                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {agent.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                    {agent.role}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                    Created {format(new Date(agent.createdAt), 'PP')}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No agents created</p>
                )}
            </div>
        </div>
    );
}
