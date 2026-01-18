/**
 * AgentManager - Multi-Agent Orchestration
 * Manages multiple agents and coordinates their execution
 */

import type {
    AgentTask,
    AgentTaskResult,
    AgentExecution,
    OrchestrationMode,
    AgentMessage,
} from '@/lib/types/agent.types';
import { Agent } from './Agent';
import type { AgentConfig } from '@/lib/types/agent.types';

export class AgentManager {
    private agents: Map<string, Agent>;
    private messageQueue: AgentMessage[] = [];

    constructor() {
        this.agents = new Map();
    }

    /**
     * Register an agent
     */
    registerAgent(config: AgentConfig): Agent {
        const agent = new Agent(config);
        this.agents.set(config.id, agent);
        return agent;
    }

    /**
     * Get an agent by ID
     */
    getAgent(id: string): Agent | undefined {
        return this.agents.get(id);
    }

    /**
     * Execute a multi-agent task
     */
    async executeTask(task: AgentTask): Promise<AgentTaskResult> {
        const startTime = Date.now();

        try {
            let executions: AgentExecution[] = [];

            switch (task.strategy) {
                case 'sequential':
                    executions = await this.executeSequential(task);
                    break;
                case 'parallel':
                    executions = await this.executeParallel(task);
                    break;
                case 'hierarchical':
                    executions = await this.executeHierarchical(task);
                    break;
                case 'consensus':
                    executions = await this.executeConsensus(task);
                    break;
            }

            // Aggregate results
            const totalTokens = executions.reduce((sum, exec) => sum + exec.tokens, 0);
            const totalCost = executions.reduce((sum, exec) => sum + exec.cost, 0);
            const allSuccessful = executions.every((exec) => exec.success);
            const output = executions.map((exec) => exec.output).join('\n\n');

            return {
                taskId: task.id,
                success: allSuccessful,
                output,
                agentExecutions: executions,
                totalCost,
                totalTokens,
                executionTime: Date.now() - startTime,
            };
        } catch (error) {
            return {
                taskId: task.id,
                success: false,
                output: '',
                agentExecutions: [],
                totalCost: 0,
                totalTokens: 0,
                executionTime: Date.now() - startTime,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }

    /**
     * Sequential execution: Agent A → Agent B → Agent C
     */
    private async executeSequential(task: AgentTask): Promise<AgentExecution[]> {
        const executions: AgentExecution[] = [];
        let currentInput = task.task;

        for (const agentId of task.agents) {
            const agent = this.agents.get(agentId);
            if (!agent) continue;

            const execution = await this.executeAgent(agent, currentInput);
            executions.push(execution);

            if (!execution.success) break;

            // Use output as input for next agent
            currentInput = execution.output || currentInput;
        }

        return executions;
    }

    /**
     * Parallel execution: Agents run simultaneously
     */
    private async executeParallel(task: AgentTask): Promise<AgentExecution[]> {
        const promises = task.agents.map(async (agentId) => {
            const agent = this.agents.get(agentId);
            if (!agent) {
                return this.createFailedExecution(agentId, 'Agent not found');
            }
            return this.executeAgent(agent, task.task);
        });

        return Promise.all(promises);
    }

    /**
     * Hierarchical execution: Manager delegates to workers
     */
    private async executeHierarchical(task: AgentTask): Promise<AgentExecution[]> {
        const executions: AgentExecution[] = [];

        // First agent is the manager
        const managerId = task.agents[0];
        const manager = this.agents.get(managerId);

        if (!manager) {
            return [this.createFailedExecution(managerId, 'Manager agent not found')];
        }

        // Manager creates plan
        const managerExecution = await this.executeAgent(
            manager,
            `Create a plan to: ${task.task}\nDelegate to workers: ${task.agents.slice(1).join(', ')}`
        );
        executions.push(managerExecution);

        // Workers execute in parallel
        const workerPromises = task.agents.slice(1).map(async (agentId) => {
            const agent = this.agents.get(agentId);
            if (!agent) {
                return this.createFailedExecution(agentId, 'Worker agent not found');
            }
            return this.executeAgent(agent, managerExecution.output || task.task);
        });

        const workerExecutions = await Promise.all(workerPromises);
        executions.push(...workerExecutions);

        return executions;
    }

    /**
     * Consensus execution: Multiple agents vote on output
     */
    private async executeConsensus(task: AgentTask): Promise<AgentExecution[]> {
        // All agents work on same task
        const executions = await this.executeParallel(task);

        // Find most common output (simple consensus)
        const outputs = executions
            .filter((exec) => exec.success)
            .map((exec) => exec.output);

        const outputCounts = outputs.reduce((acc, output) => {
            acc[output || ''] = (acc[output || ''] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const consensusOutput = Object.entries(outputCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

        // Add consensus result
        executions.push({
            agentId: 'consensus',
            agentName: 'Consensus',
            startTime: Date.now(),
            endTime: Date.now(),
            messages: [],
            toolCalls: [],
            tokens: 0,
            cost: 0,
            success: true,
            output: consensusOutput,
        });

        return executions;
    }

    /**
     * Execute single agent
     */
    private async executeAgent(agent: Agent, input: string): Promise<AgentExecution> {
        const startTime = Date.now();

        try {
            const output = await agent.run(input);
            const state = agent.getState();

            return {
                agentId: agent.getConfig().id,
                agentName: agent.getConfig().name,
                startTime,
                endTime: Date.now(),
                messages: state.conversationHistory,
                toolCalls: [], // TODO: Extract from state
                tokens: 0, // TODO: Track tokens
                cost: 0, // TODO: Track cost
                success: true,
                output,
            };
        } catch (error) {
            return this.createFailedExecution(
                agent.getConfig().id,
                error instanceof Error ? error.message : String(error)
            );
        }
    }

    /**
     * Create failed execution record
     */
    private createFailedExecution(agentId: string, error: string): AgentExecution {
        return {
            agentId,
            agentName: agentId,
            startTime: Date.now(),
            endTime: Date.now(),
            messages: [],
            toolCalls: [],
            tokens: 0,
            cost: 0,
            success: false,
            error,
        };
    }

    /**
     * Send message between agents
     */
    sendMessage(message: AgentMessage): void {
        this.messageQueue.push(message);

        // Process message
        const targetAgent = this.agents.get(message.to);
        if (targetAgent && message.type === 'request') {
            // Agent can handle message asynchronously
            targetAgent.run(message.content).then((response) => {
                this.sendMessage({
                    from: message.to,
                    to: message.from,
                    type: 'response',
                    content: response,
                    timestamp: Date.now(),
                });
            });
        }
    }

    /**
     * Get message history
     */
    getMessages(agentId?: string): AgentMessage[] {
        if (agentId) {
            return this.messageQueue.filter((m) => m.from === agentId || m.to === agentId);
        }
        return [...this.messageQueue];
    }

    /**
     * List all agents
     */
    listAgents(): AgentConfig[] {
        return Array.from(this.agents.values()).map((agent) => agent.getConfig());
    }

    /**
     * Remove an agent
     */
    removeAgent(id: string): boolean {
        return this.agents.delete(id);
    }

    /**
     * Clear all agents
     */
    clearAgents(): void {
        this.agents.clear();
    }
}
