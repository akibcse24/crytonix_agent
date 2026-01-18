import { NextResponse } from 'next/server';
import { generateCSRFToken } from '@/lib/admin/security';
import { auth } from '@/auth';

/**
 * GET /api/admin/csrf - Generate CSRF token
 */
export async function GET() {
    const session = await auth();

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // @ts-ignore
    const userRole = session.user.role;
    if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const token = generateCSRFToken();

    const response = NextResponse.json({ token });

    // Set cookie
    response.cookies.set('csrf-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60, // 1 hour
        path: '/',
    });

    return response;
}
