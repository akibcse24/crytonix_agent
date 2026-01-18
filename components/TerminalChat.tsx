'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProviderSelector } from './ProviderSelector';
import { OllamaModelManager } from './OllamaModelManager';
import { useTheme } from './ThemeProvider';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

export function TerminalChat() {
    const { theme } = useTheme();
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'system',
            content: 'Crytonix AI Agent System initialized. Type your command...',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCursor, setShowCursor] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState({ provider: 'openai', model: 'gpt-4o-mini' });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isCyberpunk = theme === 'cyberpunk';

    // Blinking cursor effect
    useEffect(() => {
        const interval = setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/agent/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    agentConfig: {
                        provider: selectedProvider.provider,
                        model: selectedProvider.model,
                    },
                    tools: ['calculator', 'get_current_time'],
                }),
            });

            const data = await response.json();

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.response || data.error || 'No response',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: Message = {
                role: 'system',
                content: `[ERROR] ${error instanceof Error ? error.message : 'Unknown error'}`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div
            className={`flex flex-col h-full rounded-lg overflow-hidden ${isCyberpunk
                    ? 'bg-black border border-cyan-500/30 font-mono'
                    : 'bg-white border border-purple-200 glass'
                }`}
        >
            {/* Header */}
            <div
                className={`flex items-center justify-between px-4 py-2 border-b ${isCyberpunk
                        ? 'bg-cyan-950/20 border-cyan-500/30'
                        : 'bg-purple-50 border-purple-200'
                    }`}
            >
                <div className="flex items-center gap-2">
                    <Terminal className={`w-4 h-4 ${isCyberpunk ? 'text-cyan-400' : 'text-purple-600'}`} />
                    <span className={`text-xs ${isCyberpunk ? 'text-cyan-400' : 'text-purple-600'}`}>
                        {isCyberpunk ? 'CRYTONIX TERMINAL' : 'Crytonix Chat'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <ProviderSelector
                        selected={selectedProvider}
                        onChange={(provider, model) => setSelectedProvider({ provider, model })}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowSettings(!showSettings)}
                        className={isCyberpunk ? 'hover:bg-cyan-950/50 text-cyan-400' : 'hover:bg-purple-100 text-purple-600'}
                    >
                        <Settings className="w-4 h-4" />
                    </Button>
                    {!isCyberpunk && (
                        <>
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </>
                    )}
                </div>
            </div>

            {/* Ollama Manager (collapsible) */}
            {showSettings && selectedProvider.provider === 'ollama' && (
                <div className={`p-4 border-b ${isCyberpunk ? 'border-cyan-500/30' : 'border-purple-200'}`}>
                    <OllamaModelManager />
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-track-black scrollbar-thumb-cyan-900">
                {messages.map((message, i) => (
                    <div key={i} className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                            <span
                                className={
                                    message.role === 'user'
                                        ? isCyberpunk
                                            ? 'text-green-400'
                                            : 'text-green-600'
                                        : message.role === 'assistant'
                                            ? isCyberpunk
                                                ? 'text-cyan-400'
                                                : 'text-purple-600'
                                            : isCyberpunk
                                                ? 'text-yellow-400'
                                                : 'text-orange-500'
                                }
                            >
                                {message.role === 'user'
                                    ? isCyberpunk
                                        ? '> user@crytonix:~$'
                                        : '👤 You'
                                    : message.role === 'assistant'
                                        ? isCyberpunk
                                            ? '[AGENT]'
                                            : '🤖 Crytonix'
                                        : isCyberpunk
                                            ? '[SYSTEM]'
                                            : '⚙️ System'}
                            </span>
                            <span className={isCyberpunk ? 'text-cyan-700' : 'text-gray-400'}>
                                {message.timestamp.toLocaleTimeString()}
                            </span>
                        </div>
                        <div
                            className={`pl-4 text-sm ${message.role === 'user'
                                    ? isCyberpunk
                                        ? 'text-green-300'
                                        : 'text-gray-700'
                                    : message.role === 'assistant'
                                        ? isCyberpunk
                                            ? 'text-cyan-100'
                                            : 'text-gray-900'
                                        : isCyberpunk
                                            ? 'text-yellow-300'
                                            : 'text-orange-600'
                                }`}
                        >
                            {message.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className={`flex items-center gap-2 text-sm ${isCyberpunk ? 'text-cyan-400' : 'text-purple-600'}`}>
                        <span>{isCyberpunk ? '[PROCESSING]' : '💭 Thinking'}</span>
                        <span className="animate-pulse">...</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
                className={`p-4 border-t ${isCyberpunk
                        ? 'border-cyan-500/30 bg-cyan-950/10'
                        : 'border-purple-200 bg-purple-50/50'
                    }`}
            >
                <div className="flex items-center gap-2">
                    <span className={`text-sm ${isCyberpunk ? 'text-green-400' : 'text-purple-600'}`}>
                        {isCyberpunk ? '>' : '✍️'}
                    </span>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isCyberpunk ? 'Enter command...' : 'Type your message...'}
                        disabled={isLoading}
                        className={`flex-1 bg-transparent border-none outline-none text-sm ${isCyberpunk
                                ? 'text-cyan-100 placeholder-cyan-700 font-mono'
                                : 'text-gray-900 placeholder-gray-400'
                            }`}
                    />
                    <span
                        className={`${isCyberpunk ? 'text-cyan-400' : 'text-purple-400'} ${showCursor ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        {isCyberpunk ? '█' : '|'}
                    </span>
                    <Button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        size="sm"
                        className={
                            isCyberpunk
                                ? 'bg-cyan-600 hover:bg-cyan-500 text-black font-mono text-xs'
                                : 'bg-purple-600 hover:bg-purple-500 text-white'
                        }
                    >
                        <Send className="w-3 h-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
