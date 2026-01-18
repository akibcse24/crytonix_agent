/**
 * Agent Chat API - Streaming endpoint
 * POST /api/agent/chat
 */

import { NextRequest, NextResponse } from 'next/server';
import { Agent } from '@/lib/agent';
import { toolRegistry } from '@/lib/tools';
import type { AgentConfig } from '@/lib/types/agent.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatRequest {
    message: string;
    agentConfig?: Partial<AgentConfig>;
    tools?: string[];
    stream?: boolean;
}

export async function POST(req: NextRequest) {
    try {
        const body: ChatRequest = await req.json();

        if (!body.message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Create agent with config
        const agentConfig: AgentConfig = {
            id: crypto.randomUUID(),
            name: body.agentConfig?.name || 'Crytonix Assistant',
            role: body.agentConfig?.role || 'custom',
            systemPrompt:
                body.agentConfig?.systemPrompt ||
                'You are Crytonix, a helpful AI assistant with access to various tools and knowledge.',
            provider: body.agentConfig?.provider || 'openai',
            model: body.agentConfig?.model || 'gpt-4o-mini',
            tools: body.tools || ['calculator', 'get_current_time'],
            isActive: true,
            temperature: body.agentConfig?.temperature || 0.7,
            maxTokens: body.agentConfig?.maxTokens || 2000,
        };

        const agent = new Agent(agentConfig);

        // Register tools
        if (body.tools) {
            for (const toolName of body.tools) {
                const tool = toolRegistry.get(toolName);
                if (tool) {
                    agent.registerTool(toolName, tool.execute);
                }
            }
        }

        // Handle streaming
        if (body.stream) {
            const encoder = new TextEncoder();

            const stream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of agent.stream(body.message)) {
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
                        }

                        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                        controller.close();
                    } catch (error) {
                        controller.enqueue(
                            encoder.encode(
                                `data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })}\n\n`
                            )
                        );
                        controller.close();
                    }
                },
            });

            return new Response(stream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    Connection: 'keep-alive',
                },
            });
        }

        // Non-streaming response
        const response = await agent.run(body.message);
        const state = agent.getState();

        return NextResponse.json({
            response,
            reactSteps: state.reactSteps,
            conversationHistory: state.conversationHistory,
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
