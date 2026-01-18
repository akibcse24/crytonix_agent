/**
 * Admin API Security Wrapper
 * Wrap admin API routes with security checks
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { logAdminAction, AdminAction } from './audit';
import { validateCSRFToken } from './security';
import { logSecurityEvent } from '@/lib/monitoring/logger';
import { rateLimit } from '@/lib/security/rate-limit';

type AdminHandler = (request: NextRequest, context?: any) => Promise<NextResponse>;

interface SecureAdminOptions {
    requiredRole?: 'ADMIN' | 'SUPER_ADMIN';
    requireCSRF?: boolean;
    action?: string;
    resource?: string;
}

/**
 * Secure admin API wrapper
 */
export function secureAdminAPI(
    handler: AdminHandler,
    options: SecureAdminOptions = {}
) {
    return async (request: NextRequest, context?: any) => {
        const {
            requiredRole = 'ADMIN',
            requireCSRF = true,
            action = 'unknown',
            resource = 'unknown',
        } = options;

        try {
            // 1. Authentication check
            const session = await auth();

            if (!session || !session.user) {
                logSecurityEvent({
                    event: 'admin_api_unauthorized',
                    details: { path: request.nextUrl.pathname },
                    severity: 'high',
                });

                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }

            // 2. Role check
            // @ts-ignore
            const userRole = session.user.role;

            if (requiredRole === 'SUPER_ADMIN' && userRole !== 'SUPER_ADMIN') {
                logSecurityEvent({
                    event: 'admin_api_insufficient_permissions',
                    userId: session.user.id,
                    details: { path: request.nextUrl.pathname, requiredRole, userRole },
                    severity: 'high',
                });

                return NextResponse.json(
                    { error: 'Insufficient permissions' },
                    { status: 403 }
                );
            }

            if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
                return NextResponse.json(
                    { error: 'Admin access required' },
                    { status: 403 }
                );
            }

            // 3. CSRF validation for state-changing operations
            if (requireCSRF && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
                if (!validateCSRFToken(request)) {
                    logSecurityEvent({
                        event: 'admin_api_csrf_invalid',
                        userId: session.user.id,
                        details: { path: request.nextUrl.pathname },
                        severity: 'critical',
                    });

                    return NextResponse.json(
                        { error: 'Invalid CSRF token' },
                        { status: 403 }
                    );
                }
            }

            // 4. Execute handler
            const rateLimitRes = await rateLimit(request);
            if (rateLimitRes) return rateLimitRes;

            const startTime = Date.now();
            const response = await handler(request, context);
            const duration = Date.now() - startTime;

            // 5. Audit log
            await logAdminAction({
                userId: session.user.id || 'unknown',
                userEmail: session.user.email || 'unknown',
                action,
                resource,
                ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                userAgent: request.headers.get('user-agent') || 'unknown',
                success: response.status < 400,
                error: response.status >= 400 ? `HTTP ${response.status}` : undefined,
            });

            // Log slow requests
            if (duration > 5000) {
                logSecurityEvent({
                    event: 'admin_api_slow_request',
                    userId: session.user.id,
                    details: { path: request.nextUrl.pathname, duration },
                    severity: 'low',
                });
            }

            return response;

        } catch (error) {
            // Log errors
            logSecurityEvent({
                event: 'admin_api_error',
                details: {
                    path: request.nextUrl.pathname,
                    error: error instanceof Error ? error.message : 'Unknown error',
                },
                severity: 'high',
            });

            return NextResponse.json(
                {
                    error: 'Internal server error',
                    message: process.env.NODE_ENV === 'development'
                        ? (error instanceof Error ? error.message : 'Unknown error')
                        : undefined,
                },
                { status: 500 }
            );
        }
    };
}

/**
 * Example usage:
 * 
 * export const POST = secureAdminAPI(
 *   async (request) => {
 *     // Your handler logic
 *     return NextResponse.json({ success: true });
 *   },
 *   {
 *     requiredRole: 'SUPER_ADMIN',
 *     action: 'user.delete',
 *     resource: 'users',
 *   }
 * );
 */
