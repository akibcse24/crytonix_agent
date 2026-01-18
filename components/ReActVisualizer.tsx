/**
 * ReAct Steps Visualizer
 * Display agent's reasoning process (Thought → Action → Observation)
 */

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Brain, Zap, Eye } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface ReActStep {
    type: 'thought' | 'action' | 'observation';
    content: string;
    timestamp?: Date;
}

interface ReActVisualizerProps {
    steps: ReActStep[];
}

export function ReActVisualizer({ steps }: ReActVisualizerProps) {
    const { theme } = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);
    const isCyberpunk = theme === 'cyberpunk';

    if (steps.length === 0) return null;

    const getStepIcon = (type: string) => {
        switch (type) {
            case 'thought':
                return <Brain className="w-4 h-4" />;
            case 'action':
                return <Zap className="w-4 h-4" />;
            case 'observation':
                return <Eye className="w-4 h-4" />;
            default:
                return null;
        }
    };

    const getStepColor = (type: string) => {
        if (isCyberpunk) {
            switch (type) {
                case 'thought':
                    return 'text-cyan-400';
                case 'action':
                    return 'text-yellow-400';
                case 'observation':
                    return 'text-green-400';
                default:
                    return 'text-cyan-100';
            }
        } else {
            switch (type) {
                case 'thought':
                    return 'text-purple-600';
                case 'action':
                    return 'text-orange-600';
                case 'observation':
                    return 'text-green-600';
                default:
                    return 'text-gray-700';
            }
        }
    };

    return (
        <div
            className={`mt-2 rounded-lg border ${isCyberpunk
                    ? 'bg-cyan-950/20 border-cyan-500/30'
                    : 'bg-purple-50 border-purple-200'
                }`}
        >
            {/* Toggle Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs ${isCyberpunk ? 'hover:bg-cyan-950/40' : 'hover:bg-purple-100'
                    } transition-colors`}
            >
                <div className="flex items-center gap-2">
                    {isExpanded ? (
                        <ChevronDown className="w-3 h-3" />
                    ) : (
                        <ChevronRight className="w-3 h-3" />
                    )}
                    <Brain className={`w-3 h-3 ${isCyberpunk ? 'text-cyan-400' : 'text-purple-600'}`} />
                    <span className={`font-bold ${isCyberpunk ? 'text-cyan-400 font-mono' : 'text-purple-600'}`}>
                        {isCyberpunk ? 'REASONING PROCESS' : 'Reasoning Process'}
                    </span>
                    <span className={`${isCyberpunk ? 'text-cyan-700' : 'text-gray-400'}`}>
                        ({steps.length} steps)
                    </span>
                </div>
            </button>

            {/* Steps Display */}
            {isExpanded && (
                <div className={`px-3 pb-3 space-y-2 ${isCyberpunk ? 'font-mono' : ''}`}>
                    {steps.map((step, i) => (
                        <div key={i} className="flex gap-2">
                            <div className={`${getStepColor(step.type)} mt-0.5`}>
                                {getStepIcon(step.type)}
                            </div>
                            <div className="flex-1">
                                <div className={`text-xs font-bold ${getStepColor(step.type)} capitalize`}>
                                    {isCyberpunk ? step.type.toUpperCase() : step.type}:
                                </div>
                                <div
                                    className={`text-xs mt-1 ${isCyberpunk ? 'text-cyan-100' : 'text-gray-700'
                                        }`}
                                >
                                    {step.content}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
