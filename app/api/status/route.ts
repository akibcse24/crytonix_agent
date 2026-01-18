/**
 * System Status API
 * GET /api/status
 */

import { NextRequest, NextResponse } from 'next/server';
import { llmRouter } from '@/lib/llm';
import { toolRegistry } from '@/lib/tools';
import { knowledgeBase, vectorStore } from '@/lib/knowledge';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        // Get provider availability
        const providers = ['openai', 'anthropic', 'groq', 'google', 'ollama'] as const;
        const providerStatus: Record<string, boolean> = {};

        for (const providerName of providers) {
            const provider = llmRouter.getProvider(providerName);
            if (provider) {
                providerStatus[providerName] = await provider.isAvailable();
            } else {
                providerStatus[providerName] = false;
            }
        }

        // Get tool statistics
        const allTools = toolRegistry.list();
        const toolCategories = allTools.reduce((acc, tool) => {
            acc[tool.category] = (acc[tool.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Get knowledge base statistics
        const kbStats = knowledgeBase.getStats();
        const vectorStats = vectorStore.getStats();

        return NextResponse.json({
            system: {
                name: 'Crytonix',
                version: '0.1.0',
                status: 'operational',
                uptime: process.uptime(),
                memory: {
                    used: process.memoryUsage().heapUsed,
                    total: process.memoryUsage().heapTotal,
                    rss: process.memoryUsage().rss,
                },
            },
            providers: providerStatus,
            tools: {
                total: allTools.length,
                categories: toolCategories,
            },
            knowledge: {
                entries: kbStats.totalEntries,
                categories: kbStats.categories,
                tags: kbStats.tags,
                vectorStore: {
                    documents: vectorStats.documentCount,
                    enabled: vectorStats.usingVectorDB,
                },
            },
        });
    } catch (error) {
        console.error('Status API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
