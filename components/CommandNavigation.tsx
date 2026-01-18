'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Terminal, Bot, Database, Wrench, Activity, FileText } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from './ThemeProvider';

export function CommandNavigation() {
    const pathname = usePathname();
    const { theme } = useTheme();
    const [time, setTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const links = [
        { href: '/dashboard', label: theme === 'cyberpunk' ? 'TERMINAL' : 'Chat', icon: Terminal },
        { href: '/agents', label: theme === 'cyberpunk' ? 'AGENTS' : 'Agents', icon: Bot },
        { href: '/knowledge', label: theme === 'cyberpunk' ? 'KNOWLEDGE' : 'Knowledge', icon: Database },
        { href: '/tools', label: theme === 'cyberpunk' ? 'TOOLS' : 'Tools', icon: Wrench },
        { href: '/status', label: theme === 'cyberpunk' ? 'STATUS' : 'Status', icon: Activity },
        { href: '/logs', label: theme === 'cyberpunk' ? 'LOGS' : 'Logs', icon: FileText },
    ];

    const isCyberpunk = theme === 'cyberpunk';

    return (
        <nav className={`border-b ${isCyberpunk
                ? 'border-cyan-500/30 bg-black/50'
                : 'border-purple-200 bg-white/70 glass'
            } backdrop-blur-sm`}>
            <div className="max-w-screen-2xl mx-auto px-4">
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <Terminal className={`w-5 h-5 ${isCyberpunk ? 'text-cyan-400' : 'text-purple-600'
                            } group-hover:scale-110 transition-transform`} />
                        <span className={`${isCyberpunk ? 'font-mono font-bold text-cyan-400' : 'font-semibold text-purple-600'
                            } group-hover:scale-105 transition-transform`}>
                            {isCyberpunk ? 'CRYTONIX' : 'Crytonix'}
                        </span>
                        <span className={`text-xs ${isCyberpunk ? 'font-mono text-cyan-600' : 'text-purple-400'
                            }`}>v0.1.0</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-1">
                        {links.map((link) => {
                            const isActive = pathname === link.href;
                            const Icon = link.icon;

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`
                    flex items-center gap-2 px-3 py-2 text-xs transition-all duration-200 rounded
                    ${isCyberpunk ? 'font-mono' : 'font-medium'}
                    ${isActive
                                            ? isCyberpunk
                                                ? 'text-cyan-400 bg-cyan-500/10 border-b-2 border-cyan-400'
                                                : 'text-purple-600 bg-purple-100'
                                            : isCyberpunk
                                                ? 'text-cyan-600 hover:text-cyan-400 hover:bg-cyan-500/5'
                                                : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                                        }
                  `}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* System Time & Theme Toggle */}
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-4 text-xs ${isCyberpunk ? 'font-mono' : ''}`}>
                            <div className={isCyberpunk ? 'text-cyan-600' : 'text-gray-500'}>
                                <span className={isCyberpunk ? 'text-green-400' : 'text-green-500'}>◉</span> SYSTEM ONLINE
                            </div>
                            <div className={isCyberpunk ? 'text-cyan-500' : 'text-purple-600 font-medium'}>{time}</div>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </nav>
    );
}
