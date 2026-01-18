/**
 * Tools API - List and Execute Tools
 * GET/POST /api/tools
 */

import { NextRequest, NextResponse } from 'next/server';
import { toolRegistry } from '@/lib/tools';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - List all tools
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');

        let tools;
        if (category) {
            tools = toolRegistry.listByCategory(category);
        } else {
            tools = toolRegistry.list();
        }

        return NextResponse.json({
            tools: tools.map((tool) => ({
                name: tool.name,
                description: tool.description,
                category: tool.category,
                parameters: tool.parameters,
            })),
            count: tools.length,
        });
    } catch (error) {
        console.error('Tools GET error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Execute a tool
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (!body.toolName) {
            return NextResponse.json({ error: 'Tool name is required' }, { status: 400 });
        }

        const tool = toolRegistry.get(body.toolName);

        if (!tool) {
            return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
        }

        const result = await tool.execute(body.params || {});

        return NextResponse.json({
            ...result,
            toolName: body.toolName,
        });
    } catch (error) {
        console.error('Tools POST error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
