/**
 * Database Type Definitions
 * Extends Prisma generated types with custom utilities
 */

import { Prisma } from '@prisma/client';

// Export all Prisma types
export type {
    User,
    Account,
    Session,
    ProviderKey,
    Agent,
    Thread,
    Message,
    Task,
    TaskExecution,
    UsageLog,
} from '@prisma/client';

// Custom input types for creating entities
export type CreateAgentInput = Omit<
    Prisma.AgentCreateInput,
    'id' | 'createdAt' | 'updatedAt' | 'user'
> & {
    userId: string;
};

export type CreateThreadInput = Omit<
    Prisma.ThreadCreateInput,
    'id' | 'createdAt' | 'updatedAt' | 'user'
> & {
    userId: string;
};

export type CreateMessageInput = Omit<
    Prisma.MessageCreateInput,
    'id' | 'createdAt' | 'thread'
> & {
    threadId: string;
};

export type CreateProviderKeyInput = Omit<
    Prisma.ProviderKeyCreateInput,
    'id' | 'createdAt' | 'updatedAt' | 'user'
> & {
    userId: string;
};

// Query result types with relations
export type AgentWithThreads = Prisma.AgentGetPayload<{
    include: { threads: true };
}>;

export type ThreadWithMessages = Prisma.ThreadGetPayload<{
    include: { messages: true };
}>;

export type ThreadWithMessagesAndAgent = Prisma.ThreadGetPayload<{
    include: { messages: true; agent: true };
}>;

export type TaskWithExecutions = Prisma.TaskGetPayload<{
    include: { executions: { include: { agent: true } } };
}>;

// Pagination types
export interface PaginationParams {
    page?: number;
    pageSize?: number;
    cursor?: string;
}

export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

// Filter types
export interface ThreadFilters {
    userId: string;
    agentId?: string;
    isArchived?: boolean;
    startDate?: Date;
    endDate?: Date;
}

export interface UsageLogFilters {
    userId: string;
    provider?: string;
    startDate?: Date;
    endDate?: Date;
}
