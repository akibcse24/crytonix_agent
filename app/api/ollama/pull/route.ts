/**
 * Ollama Model Pull API
 * POST /api/ollama/pull
 */

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface PullRequest {
    model: string;
}

export async function POST(req: NextRequest) {
    try {
        const body: PullRequest = await req.json();

        if (!body.model) {
            return NextResponse.json({ error: 'Model name is required' }, { status: 400 });
        }

        // Validate model name (alphanumeric, dots, hyphens only)
        if (!/^[a-z0-9.-]+$/i.test(body.model)) {
            return NextResponse.json({ error: 'Invalid model name format' }, { status: 400 });
        }

        // Execute ollama pull command
        const { stdout, stderr } = await execAsync(`ollama pull ${body.model}`, {
            timeout: 300000, // 5 minutes
        });

        return NextResponse.json({
            success: true,
            model: body.model,
            output: stdout || stderr,
        });
    } catch (error) {
        console.error('Ollama pull error:', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to pull model',
            },
            { status: 500 }
        );
    }
}
