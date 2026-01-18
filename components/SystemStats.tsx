'use client';

import { useEffect, useState } from 'react';
import { Activity, Cpu, Database, Zap } from 'lucide-react';

interface SystemStatus {
    system: {
        status: string;
        uptime: number;
        memory: {
            used: number;
            total: number;
            rss: number;
        };
    };
    providers: Record<string, boolean>;
    tools: {
        total: number;
    };
    knowledge: {
        entries: number;
    };
}

export function SystemStats() {
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                setStatus(data);
            } catch (error) {
                console.error('Failed to fetch status:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 5000); // Refresh every 5s
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="bg-black border border-cyan-500/30 rounded-lg p-4 font-mono">
                <div className="text-cyan-400 text-xs animate-pulse">[LOADING SYSTEM STATUS...]</div>
            </div>
        );
    }

    if (!status) {
        return null;
    }

    const memoryPercent = (status.system.memory.used / status.system.memory.total) * 100;
    const uptimeHours = Math.floor(status.system.uptime / 3600);
    const uptimeMinutes = Math.floor((status.system.uptime % 3600) / 60);

    return (
        <div className="space-y-4">
            {/* System Status */}
            <div className="bg-black border border-cyan-500/30 rounded-lg p-4 font-mono">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-cyan-400">SYSTEM STATUS</span>
                </div>

                <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                        <span className="text-cyan-600">STATUS</span>
                        <span className="text-green-400 uppercase">{status.system.status}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-cyan-600">UPTIME</span>
                        <span className="text-cyan-100">{uptimeHours}h {uptimeMinutes}m</span>
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-cyan-600">MEMORY</span>
                            <span className="text-cyan-100">{memoryPercent.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-cyan-950/30 h-2 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500"
                                style={{ width: `${memoryPercent}%` }}
                            />
                        </div>
                        <div className="text-cyan-700 text-[10px] mt-1">
                            {(status.system.memory.used / 1024 / 1024).toFixed(0)}MB / {(status.system.memory.total / 1024 / 1024).toFixed(0)}MB
                        </div>
                    </div>
                </div>
            </div>

            {/* Providers */}
            <div className="bg-black border border-cyan-500/30 rounded-lg p-4 font-mono">
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-cyan-400">LLM PROVIDERS</span>
                </div>

                <div className="space-y-2">
                    {Object.entries(status.providers).map(([name, available]) => (
                        <div key={name} className="flex items-center justify-between text-xs">
                            <span className="text-cyan-600 uppercase">{name}</span>
                            <span className={available ? 'text-green-400' : 'text-red-400'}>
                                {available ? '● ONLINE' : '○ OFFLINE'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tools & Knowledge */}
            <div className="bg-black border border-cyan-500/30 rounded-lg p-4 font-mono">
                <div className="flex items-center gap-2 mb-4">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-cyan-400">RESOURCES</span>
                </div>

                <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-cyan-600">TOOLS LOADED</span>
                        <span className="text-cyan-100">{status.tools.total}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-cyan-600">KNOWLEDGE ENTRIES</span>
                        <span className="text-cyan-100">{status.knowledge.entries}</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-black border border-cyan-500/30 rounded-lg p-4 font-mono">
                <div className="flex items-center gap-2 mb-4">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-cyan-400">QUICK ACTIONS</span>
                </div>

                <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-xs bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-300 border border-cyan-700/30 rounded transition-colors">
                        &gt; CLEAR MEMORY
                    </button>
                    <button className="w-full text-left px-3 py-2 text-xs bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-300 border border-cyan-700/30 rounded transition-colors">
                        &gt; VIEW LOGS
                    </button>
                    <button className="w-full text-left px-3 py-2 text-xs bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-300 border border-cyan-700/30 rounded transition-colors">
                        &gt; RUN DIAGNOSTICS
                    </button>
                </div>
            </div>
        </div>
    );
}
