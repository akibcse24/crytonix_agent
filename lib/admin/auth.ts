/**
 * Admin authentication and authorization helpers
 */

import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
    const session = await auth();
    if (!session || !session.user) return false;

    // @ts-ignore - role will be added to session
    return session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';
}

/**
 * Require admin or redirect
 */
export async function requireAdmin(): Promise<void> {
    const admin = await isAdmin();

    if (!admin) {
        redirect('/auth/signin?callbackUrl=/admin');
    }
}

/**
 * Get current user with role
 */
export async function getCurrentUser() {
    const session = await auth();
    return session?.user || null;
}
