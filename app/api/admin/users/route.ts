import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { secureAdminAPI } from '@/lib/admin/secure-api';
import { adminSchemas } from '@/lib/admin/sanitize';

/**
 * GET /api/admin/users - List all users
 */
export const GET = secureAdminAPI(
    async (request: NextRequest) => {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role') || 'all';

        const where: any = {};

        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (role && role !== 'all') {
            where.role = role;
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    emailVerified: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            threads: true,
                            agents: true,
                        },
                    },
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where }),
        ]);

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    },
    {
        action: 'user.list',
        resource: 'users',
        requireCSRF: false, // GET request
    }
);

/**
 * PATCH /api/admin/users/[id] - Update user
 */
export const PATCH = secureAdminAPI(
    async (request: NextRequest) => {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('id');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const body = await request.json();
        const validated = adminSchemas.updateUser.parse(body);

        const user = await prisma.user.update({
            where: { id: userId },
            data: validated,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });

        return NextResponse.json({ user });
    },
    {
        requiredRole: 'ADMIN',
        action: 'user.update',
        resource: 'users',
    }
);

/**
 * DELETE /api/admin/users/[id] - Delete user
 */
export const DELETE = secureAdminAPI(
    async (request: NextRequest) => {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('id');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        return NextResponse.json({ success: true });
    },
    {
        requiredRole: 'SUPER_ADMIN',
        action: 'user.delete',
        resource: 'users',
    }
);
