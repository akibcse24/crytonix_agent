/**
 * RAG API - Retrieval-Augmented Generation
 * POST /api/rag
 */

import { NextRequest, NextResponse } from 'next/server';
import { rag } from '@/lib/knowledge';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RAGRequest {
    query: string;
    topK?: number;
    temperature?: number;
    maxTokens?: number;
}

export async function POST(req: NextRequest) {
    try {
        const body: RAGRequest = await req.json();

        if (!body.query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        // Update RAG config if provided
        if (body.topK) {
            rag.updateConfig({ topK: body.topK });
        }

        // Generate response using RAG
        const response = await rag.generate(body.query, {
            temperature: body.temperature,
            maxTokens: body.maxTokens,
        });

        return NextResponse.json({
            response: response.content,
            tokens: response.tokens,
            cost: response.cost,
            latency: response.latency,
        });
    } catch (error) {
        console.error('RAG API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
