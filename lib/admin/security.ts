/**
 * Admin Security Middleware
 * Comprehensive security layer for admin routes
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/security/rate-limit';
import { logSecurityEvent } from '@/lib/monitoring/logger';

// Admin rate limiter - stricter limits
const adminLimiter = rateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 500,
});

/**
 * Admin security middleware
 */
export async function adminSecurityMiddleware(request: NextRequest) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const { pathname } = request.nextUrl;

    // 1. Rate Limiting - Admin routes are strictly rate limited
    try {
        await adminLimiter.check(request, 20); // 20 requests per minute for admin
    } catch (error) {
        logSecurityEvent({
            event: 'admin_rate_limit_exceeded',
            ipAddress: ip,
            details: { pathname },
            severity: 'high',
        });

        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429 }
        );
    }

    // 2. IP Whitelist (optional - if configured)
    const allowedIPs = process.env.ADMIN_ALLOWED_IPS?.split(',') || [];
    if (allowedIPs.length > 0 && !allowedIPs.includes(ip)) {
        logSecurityEvent({
            event: 'admin_ip_blocked',
            ipAddress: ip,
            details: { pathname },
            severity: 'critical',
        });

        return NextResponse.json(
            { error: 'Access denied from this IP address.' },
            { status: 403 }
        );
    }

    // 3. Time-based access (optional - restrict admin access to business hours)
    if (process.env.ADMIN_TIME_RESTRICTION === 'true') {
        const hour = new Date().getUTCHours();
        const allowedHours = process.env.ADMIN_ALLOWED_HOURS?.split('-').map(Number) || [0, 24];

        if (hour < allowedHours[0] || hour >= allowedHours[1]) {
            logSecurityEvent({
                event: 'admin_access_outside_hours',
                ipAddress: ip,
                details: { pathname, hour },
                severity: 'medium',
            });

            return NextResponse.json(
                { error: 'Admin access is restricted to business hours.' },
                { status: 403 }
            );
        }
    }

    // 4. Enhanced Security Headers for Admin
    const response = NextResponse.next();

    // Content Security Policy
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' data:; " +
        "connect-src 'self'; " +
        "frame-ancestors 'none';"
    );

    // Additional security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    // Prevent caching of admin pages
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
}

/**
 * CSRF Token validation
 */
export function validateCSRFToken(request: NextRequest): boolean {
    const token = request.headers.get('x-csrf-token');
    const cookie = request.cookies.get('csrf-token')?.value;

    return token === cookie && !!token;
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}
