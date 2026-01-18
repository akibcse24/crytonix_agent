/**
 * Multi-Agent Task Execution API
 * POST /api/agent/task
 */

import { NextRequest, NextResponse } from 'next/server';
import { AgentManager } from '@/lib/agent';
import type { AgentTask, OrchestrationMode } from '@/lib/types/agent.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TaskRequest {
    task: string;
    agents: Array<{
        id: string;
        name: string;
        role: string;
        provider?: string;
        model?: string;
        tools?: string[];
    }>;
    strategy: OrchestrationMode;
    maxIterations?: number;
    timeout?: number;
}

export async function POST(req: NextRequest) {
    try {
        const body: TaskRequest = await req.json();

        if (!body.task || !body.agents || body.agents.length === 0) {
            return NextResponse.json(
                { error: 'Task and agents are required' },
                { status: 400 }
            );
        }

        const manager = new AgentManager();

        // Register all agents
        const agentIds: string[] = [];
        for (const agentConfig of body.agents) {
            const agent = manager.registerAgent({
                id: agentConfig.id,
                name: agentConfig.name,
                role: agentConfig.role as any,
                systemPrompt: `You are ${agentConfig.name}, a ${agentConfig.role} agent.`,
                provider: agentConfig.provider || 'openai',
                model: agentConfig.model || 'gpt-4o-mini',
                tools: agentConfig.tools || [],
                isActive: true,
            });

            agentIds.push(agentConfig.id);
        }

        // Execute task
        const agentTask: AgentTask = {
            id: crypto.randomUUID(),
            task: body.task,
            strategy: body.strategy,
            agents: agentIds,
            maxIterations: body.maxIterations || 10,
            timeout: body.timeout || 60000,
        };

        const result = await manager.executeTask(agentTask);

        return NextResponse.json({
            success: result.success,
            output: result.output,
            executions: result.agentExecutions,
            totalCost: result.totalCost,
            totalTokens: result.totalTokens,
            executionTime: result.executionTime,
        });
    } catch (error) {
        console.error('Task API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
