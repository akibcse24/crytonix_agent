/**
 * File System Tools
 * Secure file operations with path validation
 */

import fs from 'fs/promises';
import path from 'path';
import type { ToolDefinition } from '@/lib/types/tool.types';

const ALLOWED_DIRECTORIES = [
    process.cwd(),
    path.join(process.cwd(), 'uploads'),
    path.join(process.cwd(), 'temp'),
];

/**
 * Validate file path is within allowed directories
 */
function validatePath(filePath: string): boolean {
    const absolutePath = path.resolve(filePath);
    return ALLOWED_DIRECTORIES.some((dir) => absolutePath.startsWith(dir));
}

/**
 * Read File Tool
 */
export const readFileTool: ToolDefinition = {
    name: 'read_file',
    description: 'Read contents of a file',
    category: 'file',
    parameters: [
        {
            name: 'path',
            type: 'string',
            description: 'Path to the file',
            required: true,
        },
        {
            name: 'encoding',
            type: 'string',
            description: 'File encoding (default: utf-8)',
            required: false,
            default: 'utf-8',
        },
    ],
    execute: async (params) => {
        const startTime = Date.now();

        try {
            if (!validatePath(params.path as string)) {
                return {
                    success: false,
                    error: 'Access to this path is not allowed',
                    executionTime: Date.now() - startTime,
                };
            }

            const content = await fs.readFile(
                params.path as string,
                (params.encoding as BufferEncoding) || 'utf-8'
            );

            return {
                success: true,
                data: { content: content.toString(), path: params.path },
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
 * Write File Tool
 */
export const writeFileTool: ToolDefinition = {
    name: 'write_file',
    description: 'Write content to a file',
    category: 'file',
    parameters: [
        {
            name: 'path',
            type: 'string',
            description: 'Path to the file',
            required: true,
        },
        {
            name: 'content',
            type: 'string',
            description: 'Content to write',
            required: true,
        },
        {
            name: 'encoding',
            type: 'string',
            description: 'File encoding (default: utf-8)',
            required: false,
            default: 'utf-8',
        },
    ],
    execute: async (params) => {
        const startTime = Date.now();

        try {
            if (!validatePath(params.path as string)) {
                return {
                    success: false,
                    error: 'Access to this path is not allowed',
                    executionTime: Date.now() - startTime,
                };
            }

            // Create directory if it doesn't exist
            const dir = path.dirname(params.path as string);
            await fs.mkdir(dir, { recursive: true });

            await fs.writeFile(
                params.path as string,
                params.content as string,
                (params.encoding as BufferEncoding) || 'utf-8'
            );

            return {
                success: true,
                data: { path: params.path, bytesWritten: (params.content as string).length },
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
 * List Directory Tool
 */
export const listDirectoryTool: ToolDefinition = {
    name: 'list_directory',
    description: 'List files and directories',
    category: 'file',
    parameters: [
        {
            name: 'path',
            type: 'string',
            description: 'Directory path',
            required: true,
        },
    ],
    execute: async (params) => {
        const startTime = Date.now();

        try {
            if (!validatePath(params.path as string)) {
                return {
                    success: false,
                    error: 'Access to this path is not allowed',
                    executionTime: Date.now() - startTime,
                };
            }

            const entries = await fs.readdir(params.path as string, { withFileTypes: true });

            const files = await Promise.all(
                entries.map(async (entry) => {
                    const fullPath = path.join(params.path as string, entry.name);
                    const stats = await fs.stat(fullPath);

                    return {
                        name: entry.name,
                        isDirectory: entry.isDirectory(),
                        isFile: entry.isFile(),
                        size: stats.size,
                        modified: stats.mtime.toISOString(),
                    };
                })
            );

            return {
                success: true,
                data: { files, count: files.length },
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
 * Delete File Tool
 */
export const deleteFileTool: ToolDefinition = {
    name: 'delete_file',
    description: 'Delete a file or directory',
    category: 'file',
    parameters: [
        {
            name: 'path',
            type: 'string',
            description: 'Path to delete',
            required: true,
        },
        {
            name: 'recursive',
            type: 'boolean',
            description: 'Delete recursively (for directories)',
            required: false,
            default: false,
        },
    ],
    execute: async (params) => {
        const startTime = Date.now();

        try {
            if (!validatePath(params.path as string)) {
                return {
                    success: false,
                    error: 'Access to this path is not allowed',
                    executionTime: Date.now() - startTime,
                };
            }

            const stats = await fs.stat(params.path as string);

            if (stats.isDirectory()) {
                await fs.rm(params.path as string, { recursive: params.recursive as boolean });
            } else {
                await fs.unlink(params.path as string);
            }

            return {
                success: true,
                data: { deleted: params.path },
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
 * Create Directory Tool
 */
export const createDirectoryTool: ToolDefinition = {
    name: 'create_directory',
    description: 'Create a directory',
    category: 'file',
    parameters: [
        {
            name: 'path',
            type: 'string',
            description: 'Directory path to create',
            required: true,
        },
    ],
    execute: async (params) => {
        const startTime = Date.now();

        try {
            if (!validatePath(params.path as string)) {
                return {
                    success: false,
                    error: 'Access to this path is not allowed',
                    executionTime: Date.now() - startTime,
                };
            }

            await fs.mkdir(params.path as string, { recursive: true });

            return {
                success: true,
                data: { created: params.path },
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
