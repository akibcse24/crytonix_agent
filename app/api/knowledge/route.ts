/**
 * Knowledge Base API - Search and Management
 * GET/POST /api/knowledge
 */

import { NextRequest, NextResponse } from 'next/server';
import { knowledgeBase } from '@/lib/knowledge';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Search knowledge base
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query');
        const category = searchParams.get('category');
        const tag = searchParams.get('tag');
        const limit = parseInt(searchParams.get('limit') || '10');

        if (query) {
            const results = await knowledgeBase.search(query, limit);
            return NextResponse.json({ results, count: results.length });
        }

        if (category) {
            const results = knowledgeBase.getByCategory(category);
            return NextResponse.json({ results, count: results.length });
        }

        if (tag) {
            const results = knowledgeBase.getByTag(tag);
            return NextResponse.json({ results, count: results.length });
        }

        // Return all entries
        const results = knowledgeBase.getAllEntries();
        return NextResponse.json({ results, count: results.length });
    } catch (error) {
        console.error('Knowledge GET error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Add knowledge entry
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (!body.title || !body.content) {
            return NextResponse.json(
                { error: 'Title and content are required' },
                { status: 400 }
            );
        }

        const id = await knowledgeBase.addEntry({
            title: body.title,
            content: body.content,
            category: body.category,
            tags: body.tags,
            source: body.source,
            metadata: body.metadata,
        });

        return NextResponse.json({ id, success: true });
    } catch (error) {
        console.error('Knowledge POST error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT - Update knowledge entry
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();

        if (!body.id) {
            return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
        }

        const success = await knowledgeBase.updateEntry(body.id, {
            title: body.title,
            content: body.content,
            category: body.category,
            tags: body.tags,
            source: body.source,
            metadata: body.metadata,
        });

        if (!success) {
            return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Knowledge PUT error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Delete knowledge entry
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
        }

        const success = await knowledgeBase.deleteEntry(id);

        if (!success) {
            return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Knowledge DELETE error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
