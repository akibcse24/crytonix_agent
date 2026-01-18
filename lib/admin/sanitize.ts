/**
 * Input Sanitization for Admin Panel
 * Prevent XSS, SQL Injection, and other injection attacks
 */

import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHTML(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
        ALLOWED_ATTR: ['href'],
    });
}

/**
 * Sanitize file name to prevent path traversal
 */
export function sanitizeFileName(fileName: string): string {
    return fileName
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe chars
        .replace(/\.{2,}/g, '_') // Prevent ../
        .substring(0, 255); // Limit length
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
    const schema = z.string().email();
    const result = schema.safeParse(email.toLowerCase().trim());

    if (!result.success) {
        throw new Error('Invalid email format');
    }

    return result.data;
}

/**
 * Sanitize URL to prevent open redirect
 */
export function sanitizeURL(url: string): string {
    try {
        const parsed = new URL(url);

        // Only allow http and https
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new Error('Invalid protocol');
        }

        return parsed.toString();
    } catch {
        throw new Error('Invalid URL');
    }
}

/**
 * Validate admin input schemas
 */
export const adminSchemas = {
    // User management
    updateUser: z.object({
        name: z.string().min(1).max(100).optional(),
        email: z.string().email().optional(),
        role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).optional(),
    }),

    // Provider management
    updateProvider: z.object({
        apiKey: z.string().min(10).max(500).optional(),
        isActive: z.boolean().optional(),
        defaultModel: z.string().min(1).max(100).optional(),
    }),

    // Knowledge management
    createKnowledge: z.object({
        title: z.string().min(1).max(200),
        content: z.string().min(1).max(10000),
        category: z.string().min(1).max(50),
        tags: z.array(z.string().max(30)).max(10),
    }),

    // Settings
    updateSettings: z.object({
        key: z.string().regex(/^[a-z_]+$/),
        value: z.union([z.string(), z.number(), z.boolean()]),
    }),
};

/**
 * Escape special characters for regex
 */
export function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Prevent timing attacks on string comparison
 */
export function secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
}

/**
 * Validate JSON safely
 */
export function parseJSONSafely<T>(json: string): T | null {
    try {
        return JSON.parse(json) as T;
    } catch {
        return null;
    }
}

/**
 * Remove null bytes (potential injection)
 */
export function removeNullBytes(str: string): string {
    return str.replace(/\0/g, '');
}

/**
 * Limit string length safely
 */
export function truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
}
