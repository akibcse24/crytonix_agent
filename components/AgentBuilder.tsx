'use client';

import { useState } from 'react';
import { Bot, Save, Play, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTheme } from './ThemeProvider';
import { ProviderSelector } from './ProviderSelector';

interface AgentConfig {
    id: string;
    name: string;
    description: string;
    systemPrompt: string;
    provider: string;
    model: string;
    temperature: number;
    maxTokens: number;
    tools: string[];
}

const PROMPT_TEMPLATES = [
    {
        name: 'General Assistant',
        description: 'Helpful, friendly AI assistant',
        prompt: 'You are a helpful, friendly AI assistant. Provide clear, accurate, and concise responses to user questions.',
    },
    {
        name: 'Code Expert',
        description: 'Expert programmer and debugger',
        prompt: 'You are an expert programmer specializing in multiple languages. Provide clean, well-documented code with explanations. Debug issues systematically and suggest best practices.',
    },
    {
        name: 'Research Analyst',
        description: 'Deep research and analysis',
        prompt: 'You are a research analyst who provides thorough, well-sourced analysis. Break down complex topics, cite sources, and present balanced perspectives.',
    },
    {
        name: 'Creative Writer',
        description: 'Creative storytelling and content',
        prompt: 'You are a creative writer skilled in storytelling, content creation, and engaging narratives. Use vivid descriptions and compelling language.',
    },
];

export function AgentBuilder() {
    const { theme } = useTheme();
    const isCyberpunk = theme === 'cyberpunk';

    const [config, setConfig] = useState<AgentConfig>({
        id: crypto.randomUUID(),
        name: 'My Agent',
        description: '',
        systemPrompt: '',
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 2000,
        tools: [],
    });

    const [savedAgents, setSavedAgents] = useState<AgentConfig[]>([]);
    const [testInput, setTestInput] = useState('');
    const [testOutput, setTestOutput] = useState('');
    const [isTesting, setIsTesting] = useState(false);

    const saveAgent = () => {
        const updated = [...savedAgents.filter((a) => a.id !== config.id), config];
        setSavedAgents(updated);
        localStorage.setItem('crytonix-agents', JSON.stringify(updated));
    };

    const loadAgent = (agent: AgentConfig) => {
        setConfig({ ...agent });
    };

    const deleteAgent = (id: string) => {
        const updated = savedAgents.filter((a) => a.id !== id);
        setSavedAgents(updated);
        localStorage.setItem('crytonix-agents', JSON.stringify(updated));
    };

    const testAgent = async () => {
        if (!testInput.trim()) return;

        setIsTesting(true);
        setTestOutput('Testing agent...');

        try {
            const res = await fetch('/api/agent/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: testInput,
                    agentConfig: {
                        name: config.name,
                        systemPrompt: config.systemPrompt,
                        provider: config.provider,
                        model: config.model,
                        temperature: config.temperature,
                        maxTokens: config.maxTokens,
                    },
                    tools: config.tools,
                }),
            });

            const data = await res.json();
            setTestOutput(data.response || data.error || 'No response');
        } catch (error) {
            setTestOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Bot className={`w-8 h-8 ${isCyberpunk ? 'text-cyan-400' : 'text-purple-600'}`} />
                    <div>
                        <h1
                            className={`text-2xl font-bold ${isCyberpunk ? 'text-cyan-400 font-mono' : 'text-purple-600'
                                }`}
                        >
                            {isCyberpunk ? 'AGENT BUILDER' : 'Agent Builder'}
                        </h1>
                        <p className={`text-sm ${isCyberpunk ? 'text-cyan-700 font-mono' : 'text-gray-500'}`}>
                            Create and configure custom AI agents
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Configuration Panel */}
                <div
                    className={`p-6 rounded-lg border ${isCyberpunk
                            ? 'bg-black border-cyan-500/30'
                            : 'bg-white border-purple-200 glass'
                        }`}
                >
                    <h2
                        className={`text-lg font-bold mb-4 ${isCyberpunk ? 'text-cyan-400 font-mono' : 'text-purple-600'
                            }`}
                    >
                        {isCyberpunk ? 'CONFIGURATION' : 'Configuration'}
                    </h2>

                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <Label className={isCyberpunk ? 'text-cyan-500 font-mono' : 'text-gray-700'}>
                                Agent Name
                            </Label>
                            <Input
                                value={config.name}
                                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                                placeholder="My Custom Agent"
                                className={
                                    isCyberpunk
                                        ? 'bg-cyan-950/20 border-cyan-500/50 text-cyan-100 font-mono'
                                        : 'bg-white border-purple-200'
                                }
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <Label className={isCyberpunk ? 'text-cyan-500 font-mono' : 'text-gray-700'}>
                                Description
                            </Label>
                            <Input
                                value={config.description}
                                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                                placeholder="What does this agent do?"
                                className={
                                    isCyberpunk
                                        ? 'bg-cyan-950/20 border-cyan-500/50 text-cyan-100 font-mono'
                                        : 'bg-white border-purple-200'
                                }
                            />
                        </div>

                        {/* Provider & Model */}
                        <div>
                            <Label className={isCyberpunk ? 'text-cyan-500 font-mono' : 'text-gray-700'}>
                                Provider & Model
                            </Label>
                            <ProviderSelector
                                selected={{ provider: config.provider, model: config.model }}
                                onChange={(provider, model) => setConfig({ ...config, provider, model })}
                            />
                        </div>

                        {/* Temperature */}
                        <div>
                            <Label className={isCyberpunk ? 'text-cyan-500 font-mono' : 'text-gray-700'}>
                                Temperature: {config.temperature}
                            </Label>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={config.temperature}
                                onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                                className="w-full"
                            />
                            <p className={`text-xs mt-1 ${isCyberpunk ? 'text-cyan-700' : 'text-gray-500'}`}>
                                Lower = focused, Higher = creative
                            </p>
                        </div>

                        {/* System Prompt */}
                        <div>
                            <Label className={isCyberpunk ? 'text-cyan-500 font-mono' : 'text-gray-700'}>
                                System Prompt
                            </Label>
                            <Textarea
                                value={config.systemPrompt}
                                onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                                placeholder="You are a helpful AI assistant..."
                                rows={6}
                                className={
                                    isCyberpunk
                                        ? 'bg-cyan-950/20 border-cyan-500/50 text-cyan-100 font-mono text-sm'
                                        : 'bg-white border-purple-200'
                                }
                            />
                        </div>

                        {/* Templates */}
                        <div>
                            <Label className={isCyberpunk ? 'text-cyan-500 font-mono' : 'text-gray-700'}>
                                Quick Templates
                            </Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {PROMPT_TEMPLATES.map((template) => (
                                    <button
                                        key={template.name}
                                        onClick={() => setConfig({ ...config, systemPrompt: template.prompt })}
                                        className={`text-xs px-3 py-1.5 rounded transition-colors ${isCyberpunk
                                                ? 'bg-cyan-950/30 text-cyan-400 hover:bg-cyan-950/50 border border-cyan-500/30 font-mono'
                                                : 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200'
                                            }`}
                                        title={template.description}
                                    >
                                        {template.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4">
                            <Button
                                onClick={saveAgent}
                                className={
                                    isCyberpunk
                                        ? 'bg-cyan-600 hover:bg-cyan-500 text-black font-mono flex-1'
                                        : 'bg-purple-600 hover:bg-purple-500 text-white flex-1'
                                }
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Agent
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Test Playground */}
                <div
                    className={`p-6 rounded-lg border ${isCyberpunk
                            ? 'bg-black border-cyan-500/30'
                            : 'bg-white border-purple-200 glass'
                        }`}
                >
                    <h2
                        className={`text-lg font-bold mb-4 ${isCyberpunk ? 'text-cyan-400 font-mono' : 'text-purple-600'
                            }`}
                    >
                        {isCyberpunk ? 'TEST PLAYGROUND' : 'Test Playground'}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <Label className={isCyberpunk ? 'text-cyan-500 font-mono' : 'text-gray-700'}>
                                Test Input
                            </Label>
                            <Textarea
                                value={testInput}
                                onChange={(e) => setTestInput(e.target.value)}
                                placeholder="Type a message to test your agent..."
                                rows={4}
                                className={
                                    isCyberpunk
                                        ? 'bg-cyan-950/20 border-cyan-500/50 text-cyan-100 font-mono'
                                        : 'bg-white border-purple-200'
                                }
                            />
                        </div>

                        <Button
                            onClick={testAgent}
                            disabled={isTesting || !testInput.trim()}
                            className={
                                isCyberpunk
                                    ? 'bg-cyan-600 hover:bg-cyan-500 text-black font-mono w-full'
                                    : 'bg-purple-600 hover:bg-purple-500 text-white w-full'
                            }
                        >
                            <Play className="w-4 h-4 mr-2" />
                            {isTesting ? 'Testing...' : 'Test Agent'}
                        </Button>

                        {testOutput && (
                            <div>
                                <Label className={isCyberpunk ? 'text-cyan-500 font-mono' : 'text-gray-700'}>
                                    Response
                                </Label>
                                <div
                                    className={`p-4 rounded border mt-2 ${isCyberpunk
                                            ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-100 font-mono text-sm'
                                            : 'bg-gray-50 border-gray-200 text-gray-900'
                                        }`}
                                >
                                    {testOutput}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Saved Agents */}
            {savedAgents.length > 0 && (
                <div
                    className={`p-6 rounded-lg border ${isCyberpunk
                            ? 'bg-black border-cyan-500/30'
                            : 'bg-white border-purple-200 glass'
                        }`}
                >
                    <h2
                        className={`text-lg font-bold mb-4 ${isCyberpunk ? 'text-cyan-400 font-mono' : 'text-purple-600'
                            }`}
                    >
                        {isCyberpunk ? 'SAVED AGENTS' : 'Saved Agents'}
                    </h2>

                    <div className="grid md:grid-cols-3 gap-4">
                        {savedAgents.map((agent) => (
                            <div
                                key={agent.id}
                                className={`p-4 rounded border ${isCyberpunk
                                        ? 'bg-cyan-950/20 border-cyan-500/30'
                                        : 'bg-purple-50 border-purple-200'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3
                                            className={`font-bold ${isCyberpunk ? 'text-cyan-400 font-mono' : 'text-purple-600'
                                                }`}
                                        >
                                            {agent.name}
                                        </h3>
                                        <p className={`text-xs ${isCyberpunk ? 'text-cyan-700' : 'text-gray-500'}`}>
                                            {agent.description || 'No description'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <Button
                                        onClick={() => loadAgent(agent)}
                                        size="sm"
                                        className={
                                            isCyberpunk
                                                ? 'bg-cyan-600 hover:bg-cyan-500 text-black font-mono text-xs flex-1'
                                                : 'bg-purple-600 hover:bg-purple-500 text-white flex-1'
                                        }
                                    >
                                        <FileText className="w-3 h-3 mr-1" />
                                        Load
                                    </Button>
                                    <Button
                                        onClick={() => deleteAgent(agent.id)}
                                        size="sm"
                                        variant="outline"
                                        className={
                                            isCyberpunk
                                                ? 'border-red-500/50 text-red-400 hover:bg-red-950/20'
                                                : 'border-red-200 text-red-600 hover:bg-red-50'
                                        }
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
