/**
 * Agent - Base AI Agent with ReAct Pattern
 * Implements Thought → Action → Observation loop with chain-of-thought reasoning
 */

import type {
    AgentConfig,
    AgentState,
    ReActStep,
    Message,
} from '@/lib/types/agent.types';
import type {
    LLMParams,
    LLMResponse,
    ProviderName,
} from '@/lib/types/llm.types';
import { llmRouter } from '@/lib/llm';
import { MemoryManager } from './MemoryManager';
import { ToolExecutor } from './ToolExecutor';

export class Agent {
    private config: AgentConfig;
    private memory: MemoryManager;
    private toolExecutor: ToolExecutor;
    private reactSteps: ReActStep[] = [];
    private isRunning: boolean = false;

    constructor(config: AgentConfig) {
        this.config = config;
        this.memory = new MemoryManager(config.id);
        this.toolExecutor = new ToolExecutor();
    }

    /**
     * Run the agent with a task
     */
    async run(task: string, maxIterations: number = 10): Promise<string> {
        this.isRunning = true;
        this.reactSteps = [];

        // Add user message to memory
        this.memory.addMessage({
            role: 'user',
            content: task,
        });

        let iteration = 0;
        let finalAnswer = '';

        try {
            while (iteration < maxIterations && this.isRunning) {
                iteration++;

                // ReAct Step 1: Thought
                const thought = await this.think();

                // ReAct Step 2: Action (if needed)
                const action = this.decideAction(thought);

                if (action) {
                    // Execute action
                    const observation = await this.act(action);

                    // ReAct Step 3: Observation
                    this.reactSteps.push({
                        thought,
                        action,
                        observation,
                    });

                    // Check if we have final answer
                    if (observation.includes('[FINAL_ANSWER]')) {
                        finalAnswer = observation.replace('[FINAL_ANSWER]', '').trim();
                        break;
                    }
                } else {
                    // No action needed, agent has final answer
                    this.reactSteps.push({
                        thought,
                    });
                    finalAnswer = thought;
                    break;
                }
            }

            // Store result in memory
            this.memory.addMessage({
                role: 'assistant',
                content: finalAnswer,
            });

            return finalAnswer;
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Think: Generate next thought using LLM with chain-of-thought
     */
    private async think(): Promise<string> {
        const messages = this.buildPrompt();

        const response = await this.generateCompletion(messages);

        return response.content || '';
    }

    /**
     * Decide action based on thought
     */
    private decideAction(thought: string): { tool: string; input: Record<string, any> } | null {
        // Extract tool call from thought using markers
        const actionMatch = thought.match(/ACTION:\s*(\w+)\s*\((.*)\)/);

        if (!actionMatch) {
            return null;
        }

        const [, tool, paramsStr] = actionMatch;

        try {
            const input = JSON.parse(paramsStr || '{}');
            return { tool, input };
        } catch {
            return null;
        }
    }

    /**
     * Act: Execute tool and return observation
     */
    private async act(action: { tool: string; input: Record<string, any> }): Promise<string> {
        const result = await this.toolExecutor.execute(action.tool, action.input, {
            agentId: this.config.id,
            sandbox: true,
            timeout: 30000,
        });

        if (result.success) {
            return `OBSERVATION: ${JSON.stringify(result.data)}`;
        } else {
            return `ERROR: ${result.error}`;
        }
    }

    /**
     * Build prompt with ReAct pattern instructions
     */
    private buildPrompt(): Message[] {
        const systemPrompt = `${this.config.systemPrompt}

You are an AI agent using the ReAct (Reasoning and Acting) pattern. For each step:

1. THOUGHT: Think about what to do next
2. ACTION: If you need to use a tool, specify it as: ACTION: tool_name({"param": "value"})
3. OBSERVATION: The result of your action will be provided

Available tools: ${this.config.tools.join(', ')}

When you have the final answer, include [FINAL_ANSWER] before your response.

Think step-by-step and show your reasoning.`;

        const messages: Message[] = [
            { role: 'system', content: systemPrompt },
            ...this.memory.getRecentMessages(10),
        ];

        // Add ReAct steps as context
        if (this.reactSteps.length > 0) {
            const reactContext = this.reactSteps
                .map((step, i) => {
                    let text = `Step ${i + 1}:\nTHOUGHT: ${step.thought}`;
                    if (step.action) {
                        text += `\nACTION: ${step.action.tool}(${JSON.stringify(step.action.input)})`;
                    }
                    if (step.observation) {
                        text += `\n${step.observation}`;
                    }
                    return text;
                })
                .join('\n\n');

            messages.push({
                role: 'assistant',
                content: reactContext,
            });

            messages.push({
                role: 'user',
                content: 'Continue reasoning. What is your next thought?',
            });
        }

        return messages;
    }

    /**
     * Generate LLM completion
     */
    private async generateCompletion(messages: Message[]): Promise<LLMResponse> {
        const params: LLMParams = {
            messages,
            model: this.config.model,
            temperature: this.config.temperature || 0.7,
            maxTokens: this.config.maxTokens || 2000,
        };

        // Use provider from config or auto-select
        if (this.config.provider) {
            const provider = llmRouter.getProvider(this.config.provider as ProviderName);
            if (provider) {
                return provider.generate(params);
            }
        }

        // Fallback to smart routing
        return llmRouter.generate(params, {
            primary: 'openai',
            fallbacks: ['anthropic', 'google'],
            criteria: 'quality'
        });
    }

    /**
     * Stream response (for interactive use)
     */
    async *stream(task: string): AsyncGenerator<string, void, unknown> {
        this.memory.addMessage({
            role: 'user',
            content: task,
        });

        const messages = this.buildPrompt();
        const params: LLMParams = {
            messages,
            model: this.config.model,
            temperature: this.config.temperature || 0.7,
            maxTokens: this.config.maxTokens || 2000,
        };

        const provider = llmRouter.getProvider((this.config.provider as ProviderName) || 'openai');

        if (!provider) {
            yield 'Error: No provider available';
            return;
        }

        for await (const chunk of provider.stream(params)) {
            yield chunk.delta;
        }
    }

    /**
     * Register a tool for this agent
     */
    registerTool(name: string, executor: Function): void {
        this.toolExecutor.registerTool(name, executor);

        // Add to config if not already there
        if (!this.config.tools.includes(name)) {
            this.config.tools.push(name);
        }
    }

    /**
     * Get agent state
     */
    getState(): AgentState {
        return {
            agentId: this.config.id,
            currentTask: this.isRunning ? this.memory.getRecentMessages(1)[0]?.content || undefined : undefined,
            reactSteps: this.reactSteps,
            memory: this.memory.getState(),
            conversationHistory: this.memory.getAllMessages(),
            toolResults: this.toolExecutor.getHistory().reduce((acc, item) => {
                acc[item.tool] = item.result;
                return acc;
            }, {} as Record<string, any>),
        };
    }

    /**
     * Stop agent execution
     */
    stop(): void {
        this.isRunning = false;
    }

    /**
     * Get agent configuration
     */
    getConfig(): AgentConfig {
        return { ...this.config };
    }

    /**
     * Update agent configuration
     */
    updateConfig(updates: Partial<AgentConfig>): void {
        this.config = { ...this.config, ...updates };
    }

    /**
     * Clear agent memory
     */
    clearMemory(): void {
        this.memory.clearShortTerm();
        this.reactSteps = [];
    }

    /**
     * Get ReAct steps for debugging
     */
    getReActSteps(): ReActStep[] {
        return [...this.reactSteps];
    }
}
