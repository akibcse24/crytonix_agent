/**
 * Ollama Model Manager
 * Pull/install models directly from UI
 */

'use client';

import { useState, useEffect } from 'react';
import { Download, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from './ThemeProvider';

export function OllamaModelManager() {
    const { theme } = useTheme();
    const [modelName, setModelName] = useState('');
    const [status, setStatus] = useState<'idle' | 'pulling' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [customUrl, setCustomUrl] = useState('');
    const [currentUrl, setCurrentUrl] = useState('http://localhost:11434');

    useEffect(() => {
        // Load custom URL from localStorage
        const savedUrl = localStorage.getItem('crytonix-ollama-url');
        if (savedUrl) {
            setCustomUrl(savedUrl);
            setCurrentUrl(savedUrl);
        } else {
            const envUrl = process.env.NEXT_PUBLIC_OLLAMA_HOST || 'http://localhost:11434';
            setCurrentUrl(envUrl);
        }
    }, []);

    const saveCustomUrl = () => {
        if (customUrl.trim()) {
            localStorage.setItem('crytonix-ollama-url', customUrl);
            setCurrentUrl(customUrl);
            setMessage('✓ Custom Ollama URL saved!');
            setStatus('success');
            setTimeout(() => {
                setStatus('idle');
                setMessage('');
            }, 2000);
        }
    };

    const clearCustomUrl = () => {
        localStorage.removeItem('crytonix-ollama-url');
        const envUrl = process.env.NEXT_PUBLIC_OLLAMA_HOST || 'http://localhost:11434';
        setCustomUrl('');
        setCurrentUrl(envUrl);
        setMessage('✓ Reset to environment URL');
        setStatus('success');
        setTimeout(() => {
            setStatus('idle');
            setMessage('');
        }, 2000);
    };

    const pullModel = async () => {
        if (!modelName.trim()) return;

        setStatus('pulling');
        setMessage(`Pulling ${modelName}...`);

        try {
            const res = await fetch('/api/ollama/pull', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: modelName }),
            });

            const data = await res.json();

            if (data.success) {
                setStatus('success');
                setMessage(`✓ ${modelName} installed successfully!`);
                setModelName('');
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to pull model');
            }
        } catch (error) {
            setStatus('error');
            setMessage(error instanceof Error ? error.message : 'Network error');
        }

        // Reset after 3 seconds
        setTimeout(() => {
            setStatus('idle');
            setMessage('');
        }, 3000);
    };

    const isCyberpunk = theme === 'cyberpunk';

    return (
        <div
            className={`p-4 rounded-lg border ${isCyberpunk
                ? 'bg-black border-cyan-500/30'
                : 'bg-white border-purple-200 glass'
                }`}
        >
            <div className="flex items-center gap-2 mb-3">
                <Download className={`w-4 h-4 ${isCyberpunk ? 'text-cyan-400' : 'text-purple-600'}`} />
                <h3
                    className={`text-sm font-bold ${isCyberpunk ? 'text-cyan-400 font-mono' : 'text-purple-600'
                        }`}
                >
                    {isCyberpunk ? 'OLLAMA MODEL INSTALLER' : 'Ollama Model Installer'}
                </h3>
            </div>

            {/* Custom URL Configuration */}
            <div className="mb-4 p-3 rounded border border-opacity-50 space-y-2" style={{ borderColor: isCyberpunk ? '#0e7490' : '#d8b4fe' }}>
                <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isCyberpunk ? 'text-cyan-500 font-mono' : 'text-purple-600'}`}>
                        {isCyberpunk ? 'OLLAMA SERVER URL' : 'Ollama Server URL'}
                    </span>
                    <span className={`text-xs ${isCyberpunk ? 'text-cyan-700 font-mono' : 'text-gray-500'}`}>
                        Current: {currentUrl}
                    </span>
                </div>

                <div className="flex gap-2">
                    <Input
                        placeholder="http://localhost:11434"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        className={`flex-1 text-xs ${isCyberpunk
                            ? 'bg-cyan-950/20 border-cyan-500/50 text-cyan-100 placeholder-cyan-700 font-mono'
                            : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400'
                            }`}
                    />
                    <Button
                        onClick={saveCustomUrl}
                        disabled={!customUrl.trim()}
                        size="sm"
                        className={`text-xs ${isCyberpunk
                            ? 'bg-cyan-600 hover:bg-cyan-500 text-black font-mono'
                            : 'bg-purple-600 hover:bg-purple-500 text-white'
                            }`}
                    >
                        Save
                    </Button>
                    <Button
                        onClick={clearCustomUrl}
                        size="sm"
                        variant="outline"
                        className={`text-xs ${isCyberpunk
                            ? 'border-cyan-500/50 text-cyan-400 hover:bg-cyan-950/20'
                            : 'border-purple-200 text-purple-600 hover:bg-purple-50'
                            }`}
                    >
                        Reset
                    </Button>
                </div>

                <p className={`text-xs ${isCyberpunk ? 'text-cyan-700 font-mono' : 'text-gray-500'}`}>
                    {isCyberpunk
                        ? '> Custom URL overrides env OLLAMA_HOST'
                        : 'Custom URL overrides environment variable'}
                </p>
            </div>

            {/* Model Installer */}
            <div className="flex gap-2">
                <Input
                    placeholder="Model name (e.g., llama3.2, mistral, qwen2.5)"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    disabled={status === 'pulling'}
                    onKeyDown={(e) => e.key === 'Enter' && pullModel()}
                    className={`${isCyberpunk
                        ? 'bg-cyan-950/20 border-cyan-500/50 text-cyan-100 placeholder-cyan-700 font-mono'
                        : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400'
                        }`}
                />
                <Button
                    onClick={pullModel}
                    disabled={!modelName.trim() || status === 'pulling'}
                    className={
                        isCyberpunk
                            ? 'bg-cyan-600 hover:bg-cyan-500 text-black font-mono'
                            : 'bg-purple-600 hover:bg-purple-500 text-white'
                    }
                >
                    {status === 'pulling' ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Pulling...
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4 mr-2" />
                            Pull
                        </>
                    )}
                </Button>
            </div>

            {/* Status Message */}
            {message && (
                <div
                    className={`mt-3 text-sm flex items-center gap-2 ${isCyberpunk ? 'font-mono' : ''
                        }`}
                >
                    {status === 'pulling' && (
                        <Loader2
                            className={`w-4 h-4 animate-spin ${isCyberpunk ? 'text-cyan-400' : 'text-purple-600'
                                }`}
                        />
                    )}
                    {status === 'success' && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                    <span
                        className={
                            status === 'success'
                                ? 'text-green-500'
                                : status === 'error'
                                    ? 'text-red-500'
                                    : isCyberpunk
                                        ? 'text-cyan-400'
                                        : 'text-purple-600'
                        }
                    >
                        {message}
                    </span>
                </div>
            )}

            {/* Popular Models */}
            <div className="mt-4">
                <p
                    className={`text-xs mb-2 ${isCyberpunk ? 'text-cyan-600 font-mono' : 'text-gray-500'
                        }`}
                >
                    Popular models:
                </p>
                <div className="flex flex-wrap gap-2">
                    {['llama3.2', 'qwen2.5', 'mistral', 'phi3', 'gemma2'].map((model) => (
                        <button
                            key={model}
                            onClick={() => setModelName(model)}
                            className={`text-xs px-2 py-1 rounded transition-colors ${isCyberpunk
                                ? 'bg-cyan-950/30 text-cyan-400 hover:bg-cyan-950/50 border border-cyan-500/30 font-mono'
                                : 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200'
                                }`}
                        >
                            {model}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
