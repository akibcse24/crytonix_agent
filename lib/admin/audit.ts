/**
 * Admin Audit Logger
 * Track all admin actions for security and compliance
 */

import { logger } from '@/lib/monitoring/logger';

export interface AdminAction {
    userId: string;
    userEmail: string;
    action: string;
    resource: string;
    resourceId?: string;
    changes?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    error?: string;
}

/**
 * Log admin action to database and file
 */
export async function logAdminAction(action: AdminAction) {
    // Log to Winston
    logger.info('Admin Action', {
        type: 'admin_action',
        ...action,
        timestamp: new Date().toISOString(),
    });

    // Optionally store in database for compliance
    // await prisma.adminAuditLog.create({ data: action });
}

/**
 * Common admin actions
 */
export const AdminActions = {
    // User Management
    USER_VIEW: 'user.view',
    USER_CREATE: 'user.create',
    USER_UPDATE: 'user.update',
    USER_DELETE: 'user.delete',
    USER_BAN: 'user.ban',
    USER_UNBAN: 'user.unban',
    USER_ROLE_CHANGE: 'user.role_change',

    // Provider Management
    PROVIDER_VIEW: 'provider.view',
    PROVIDER_UPDATE: 'provider.update',
    PROVIDER_TEST: 'provider.test',
    PROVIDER_TOGGLE: 'provider.toggle',

    // Knowledge Management
    KNOWLEDGE_CREATE: 'knowledge.create',
    KNOWLEDGE_UPDATE: 'knowledge.update',
    KNOWLEDGE_DELETE: 'knowledge.delete',
    KNOWLEDGE_BULK_IMPORT: 'knowledge.bulk_import',
    KNOWLEDGE_BULK_DELETE: 'knowledge.bulk_delete',

    // Agent Management
    AGENT_CREATE: 'agent.create',
    AGENT_UPDATE: 'agent.update',
    AGENT_DELETE: 'agent.delete',

    // System Actions
    SYSTEM_SETTINGS_UPDATE: 'system.settings_update',
    SYSTEM_CACHE_CLEAR: 'system.cache_clear',
    SYSTEM_BACKUP: 'system.backup',
    SYSTEM_RESTORE: 'system.restore',
    SYSTEM_MAINTENANCE_MODE: 'system.maintenance_mode',

    // Security Actions
    SECURITY_IP_WHITELIST: 'security.ip_whitelist',
    SECURITY_RATE_LIMIT: 'security.rate_limit',
    SECURITY_API_KEY_REGENERATE: 'security.api_key_regenerate',

    // Logs
    LOGS_VIEW: 'logs.view',
    LOGS_EXPORT: 'logs.export',
    LOGS_DELETE: 'logs.delete',
};

/**
 * Audit decorator for admin functions
 */
export function auditAdmin(action: string, resource: string) {
    return function (
        target: any,
        propertyName: string,
        descriptor: PropertyDescriptor
    ) {
        const method = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const startTime = Date.now();
            let success = true;
            let error: string | undefined;

            try {
                const result = await method.apply(this, args);
                return result;
            } catch (err) {
                success = false;
                error = err instanceof Error ? err.message : 'Unknown error';
                throw err;
            } finally {
                // Log action (extract user info from context)
                await logAdminAction({
                    userId: 'EXTRACT_FROM_SESSION',
                    userEmail: 'EXTRACT_FROM_SESSION',
                    action,
                    resource,
                    success,
                    error,
                });
            }
        };

        return descriptor;
    };
}
