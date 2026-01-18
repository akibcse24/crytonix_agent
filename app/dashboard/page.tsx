'use client';

import { CommandNavigation } from '@/components/CommandNavigation';
import { TerminalChat } from '@/components/TerminalChat';
import { SystemStats } from '@/components/SystemStats';

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black">
            <CommandNavigation />

            <main className="max-w-screen-2xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Chat Terminal */}
                    <div className="lg:col-span-2 h-[calc(100vh-200px)]">
                        <TerminalChat />
                    </div>

                    {/* System Stats Sidebar */}
                    <div className="space-y-6">
                        <SystemStats />
                    </div>
                </div>
            </main>

            {/* Scan Lines Effect */}
            <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(transparent_50%,rgba(0,217,255,0.02)_50%)] bg-[length:100%_4px] opacity-20"></div>
        </div>
    );
}
