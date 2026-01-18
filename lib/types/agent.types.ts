/**
 * Agent System Types
 * Multi-agent orchestration and task management
 */

import type { ProviderName, Message as LLMMessage, ToolCall } from './llm.types';

// Re-export for convenience
export type { LLMMessage as Message };
export type { ToolCall };

export type AgentRole =
    | 'researcher'
    | 'coder'
    | 'analyst'
    | 'planner'
    | 'critic'
    | 'executor'
    | 'manager'
    | 'custom';

export type OrchestrationMode =
    | 'sequential'   // Agent A → Agent B → Agent C
    | 'parallel'     // Agents run simultaneously, aggregator combines
    | 'hierarchical' // Manager agent delegates to workers
    | 'consensus';   // Multiple agents vote on output

export interface AgentConfig {
    id: string;
    name: string;
    role: AgentRole;
    systemPrompt: string;
    provider: ProviderName;
    model?: string;
    tools: string[];
    isActive: boolean;
    temperature?: number;
    maxTokens?: number;
    metadata?: Record<string, any>;
}

export interface AgentTask {
    id: string;
    task: string;
    strategy: OrchestrationMode;
    agents: string[]; // Array of agent IDs
    maxIterations: number;
    timeout: number; // milliseconds
    context?: Record<string, any>;
    parentTaskId?: string;
}

export interface AgentTaskResult {
    taskId: string;
    success: boolean;
    output: string;
    agentExecutions: AgentExecution[];
    totalCost: number;
    totalTokens: number;
    executionTime: number;
    error?: string;
}

export interface AgentExecution {
    agentId: string;
    agentName: string;
    startTime: number;
    endTime: number;
    messages: LLMMessage[];
    toolCalls: ToolCall[];
    tokens: number;
    cost: number;
    success: boolean;
    output?: string; // Final output from the agent
    error?: string;
}

/**
 * ReAct Pattern: Thought → Action → Observation
 */
export interface ReActStep {
    thought: string;
    action?: {
        tool: string;
        input: Record<string, any>;
    };
    observation?: string;
    reflection?: string;
}

export interface AgentState {
    agentId: string;
    currentTask?: string;
    reactSteps: ReActStep[];
    memory: AgentMemory;
    conversationHistory: LLMMessage[];
    toolResults: Record<string, any>;
}

export interface AgentMemory {
    shortTerm: LLMMessage[]; // Recent conversation
    longTerm: MemoryEntry[]; // Persistent knowledge
    entityGraph: EntityRelation[];
}

export interface MemoryEntry {
    id: string;
    content: string;
    embedding?: number[];
    metadata: {
        source: string;
        timestamp: number;
        relevance?: number;
    };
}

export interface EntityRelation {
    source: string;
    relation: string;
    target: string;
    confidence: number;
}

/**
 * Multi-agent communication
 */
export interface AgentMessage {
    from: string;
    to: string;
    type: 'request' | 'response' | 'update' | 'error';
    content: string;
    timestamp: number;
    metadata?: Record<string, any>;
}

/**
 * Plan generation and execution
 */
export interface Plan {
    id: string;
    goal: string;
    steps: PlanStep[];
    createdBy: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface PlanStep {
    id: string;
    description: string;
    agent: string;
    dependencies: string[]; // IDs of steps that must complete first
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
    result?: string;
    error?: string;
}
