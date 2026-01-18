/**
 * Database Tools
 * Query and interact with databases
 */

import type { ToolDefinition } from '@/lib/types/tool.types';
import { prisma } from '@/lib/db';

/**
 * Query Database Tool (Prisma)
 */
export const queryDatabaseTool: ToolDefinition = {
    name: 'query_database',
    description: 'Query the database using Prisma',
    category: 'data',
    parameters: [
        {
            name: 'model',
            type: 'string',
            description: 'Model name (e.g., User, Agent, Thread)',
            required: true,
        },
        {
            name: 'operation',
            type: 'string',
            description: 'Operation (findMany, findFirst, count)',
            required: true,
            enum: ['findMany', 'findFirst', 'count', 'findUnique'],
        },
        {
            name: 'where',
            type: 'object',
            description: 'Filter conditions',
            required: false,
        },
        {
            name: 'take',
            type: 'number',
            description: 'Limit results',
            required: false,
            default: 10,
        },
    ],
    execute: async (params) => {
        const startTime = Date.now();

        try {
            const model = params.model as string;
            const operation = params.operation as string;

            // @ts-ignore - Dynamic Prisma access
            const modelAccess = prisma[model.toLowerCase()];

            if (!modelAccess) {
                return {
                    success: false,
                    error: `Model '${model}' not found`,
                    executionTime: Date.now() - startTime,
                };
            }

            const result = await modelAccess[operation]({
                where: params.where,
                take: params.take,
            });

            return {
                success: true,
                data: { model, operation, result, count: Array.isArray(result) ? result.length : 1 },
                executionTime: Date.now() - startTime,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                executionTime: Date.now() - startTime,
            };
        }
    },
};

/**
 * Create Database Record Tool
 */
export const createRecordTool: ToolDefinition = {
    name: 'create_record',
    description: 'Create a new database record',
    category: 'data',
    parameters: [
        {
            name: 'model',
            type: 'string',
            description: 'Model name',
            required: true,
        },
        {
            name: 'data',
            type: 'object',
            description: 'Record data',
            required: true,
        },
    ],
    execute: async (params) => {
        const startTime = Date.now();

        try {
            const model = params.model as string;

            // @ts-ignore
            const result = await prisma[model.toLowerCase()].create({
                data: params.data,
            });

            return {
                success: true,
                data: { model, result },
                executionTime: Date.now() - startTime,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                executionTime: Date.now() - startTime,
            };
        }
    },
};

/**
 * Update Database Record Tool
 */
export const updateRecordTool: ToolDefinition = {
    name: 'update_record',
    description: 'Update a database record',
    category: 'data',
    parameters: [
        {
            name: 'model',
            type: 'string',
            description: 'Model name',
            required: true,
        },
        {
            name: 'where',
            type: 'object',
            description: 'Filter to find record',
            required: true,
        },
        {
            name: 'data',
            type: 'object',
            description: 'Updated data',
            required: true,
        },
    ],
    execute: async (params) => {
        const startTime = Date.now();

        try {
            const model = params.model as string;

            // @ts-ignore
            const result = await prisma[model.toLowerCase()].update({
                where: params.where,
                data: params.data,
            });

            return {
                success: true,
                data: { model, result },
                executionTime: Date.now() - startTime,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                executionTime: Date.now() - startTime,
            };
        }
    },
};

/**
 * Delete Database Record Tool
 */
export const deleteRecordTool: ToolDefinition = {
    name: 'delete_record',
    description: 'Delete a database record',
    category: 'data',
    parameters: [
        {
            name: 'model',
            type: 'string',
            description: 'Model name',
            required: true,
        },
        {
            name: 'where',
            type: 'object',
            description: 'Filter to find record',
            required: true,
        },
    ],
    execute: async (params) => {
        const startTime = Date.now();

        try {
            const model = params.model as string;

            // @ts-ignore
            const result = await prisma[model.toLowerCase()].delete({
                where: params.where,
            });

            return {
                success: true,
                data: { model, deleted: true, result },
                executionTime: Date.now() - startTime,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                executionTime: Date.now() - startTime,
            };
        }
    },
};
