/**
 * Zod Validation Schemas for API endpoints
 */

import { z } from 'zod';

// Agent Chat Request Schema
export const chatRequestSchema = z.object({
    message: z.string().min(1, 'Message cannot be empty').max(10000, 'Message too long'),
    agentConfig: z
        .object({
            name: z.string().optional(),
            systemPrompt: z.string().optional(),
            provider: z.enum(['openai', 'anthropic', 'groq', 'google', 'ollama']).optional(),
            model: z.string().optional(),
            temperature: z.number().min(0).max(2).optional(),
            maxTokens: z.number().min(1).max(100000).optional(),
        })
        .optional(),
    tools: z.array(z.string()).optional(),
    stream: z.boolean().optional(),
});

// Multi-Agent Task Request Schema
export const taskRequestSchema = z.object({
    task: z.string().min(1, 'Task cannot be empty'),
    agents: z
        .array(
            z.object({
                id: z.string(),
                name: z.string(),
                role: z.string(),
                provider: z.enum(['openai', 'anthropic', 'groq', 'google', 'ollama']).optional(),
                model: z.string().optional(),
                tools: z.array(z.string()).optional(),
            })
        )
        .min(1, 'At least one agent required'),
    strategy: z.enum(['sequential', 'parallel', 'hierarchical', 'consensus']),
    maxIterations: z.number().min(1).max(50).optional(),
    timeout: z.number().min(1000).max(300000).optional(),
});

// Knowledge Entry Schema
export const knowledgeEntrySchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    content: z.string().min(1, 'Content is required').max(50000),
    category: z.string().max(50).optional(),
    tags: z.array(z.string().max(30)).max(20).optional(),
    source: z.string().max(200).optional(),
    metadata: z.record(z.any()).optional(),
});

// Knowledge Update Schema
export const knowledgeUpdateSchema = z.object({
    id: z.string().min(1, 'ID is required'),
    title: z.string().min(1).max(200).optional(),
    content: z.string().min(1).max(50000).optional(),
    category: z.string().max(50).optional(),
    tags: z.array(z.string().max(30)).max(20).optional(),
    source: z.string().max(200).optional(),
    metadata: z.record(z.any()).optional(),
});

// RAG Query Schema
export const ragQuerySchema = z.object({
    query: z.string().min(1, 'Query cannot be empty').max(5000),
    topK: z.number().min(1).max(20).optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().min(1).max(100000).optional(),
});

// Ollama Pull Request Schema
export const ollamaPullSchema = z.object({
    model: z
        .string()
        .min(1, 'Model name is required')
        .max(100)
        .regex(/^[a-z0-9.-]+$/i, 'Invalid model name format'),
});

// Tool Execution Schema
export const toolExecutionSchema = z.object({
    toolName: z.string().min(1, 'Tool name is required'),
    params: z.record(z.any()).optional(),
});

/**
 * Validate request body against schema
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    errors?: z.ZodError;
} {
    try {
        const validated = schema.parse(data);
        return { success: true, data: validated };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, errors: error };
        }
        throw error;
    }
}

/**
 * Format Zod errors for API response
 */
export function formatZodErrors(errors: z.ZodError): string[] {
    return errors.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
}
