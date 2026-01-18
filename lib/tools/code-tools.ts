/**
 * Code Execution Tools
 * Sandboxed code execution for Python, JavaScript, and TypeScript
 */

import type { ToolDefinition } from '@/lib/types/tool.types';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Execute JavaScript/TypeScript Code Tool
 */
export const executeJavaScriptTool: ToolDefinition = {
    name: 'execute_javascript',
    description: 'Execute JavaScript or TypeScript code in a sandboxed environment',
    category: 'code',
    parameters: [
        {
            name: 'code',
            type: 'string',
            description: 'JavaScript/TypeScript code to execute',
            required: true,
        },
        {
            name: 'timeout',
            type: 'number',
            description: 'Execution timeout in milliseconds (default: 5000)',
            required: false,
            default: 5000,
        },
    ],
    execute: async (params) => {
        const startTime = Date.now();

        try {
            // Create a sandboxed function
            const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;

            // Limited global context
            const sandbox = {
                console: {
                    log: (...args: any[]) => args.join(' '),
                },
                setTimeout,
                setInterval,
                clearTimeout,
                clearInterval,
                Promise,
                Array,
                Object,
                String,
                Number,
                Boolean,
                Math,
                Date,
                JSON,
            };

            const fn = new AsyncFunction(...Object.keys(sandbox), params.code as string);

            // Execute with timeout
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Execution timeout')), (params.timeout as number) || 5000)
            );

            const result = await Promise.race([
                fn(...Object.values(sandbox)),
                timeoutPromise,
            ]);

            return {
                success: true,
                data: { result, output: String(result) },
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
 * Execute Python Code Tool
 */
export const executePythonTool: ToolDefinition = {
    name: 'execute_python',
    description: 'Execute Python code',
    category: 'code',
    parameters: [
        {
            name: 'code',
            type: 'string',
            description: 'Python code to execute',
            required: true,
        },
        {
            name: 'timeout',
            type: 'number',
            description: 'Execution timeout in milliseconds (default: 10000)',
            required: false,
            default: 10000,
        },
    ],
    execute: async (params) => {
        const startTime = Date.now();

        try {
            // Create temp file
            const tempDir = path.join(process.cwd(), 'temp');
            await fs.mkdir(tempDir, { recursive: true });

            const tempFile = path.join(tempDir, `script_${Date.now()}.py`);
            await fs.writeFile(tempFile, params.code as string);

            // Execute Python
            const { stdout, stderr } = await execAsync(`python ${tempFile}`, {
                timeout: (params.timeout as number) || 10000,
            });

            // Cleanup
            await fs.unlink(tempFile);

            return {
                success: true,
                data: { stdout, stderr, output: stdout || stderr },
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
 * Install NPM Package Tool
 */
export const installPackageTool: ToolDefinition = {
    name: 'install_package',
    description: 'Install an NPM package',
    category: 'code',
    parameters: [
        {
            name: 'package',
            type: 'string',
            description: 'Package name (e.g., lodash, axios)',
            required: true,
        },
        {
            name: 'version',
            type: 'string',
            description: 'Package version (optional)',
            required: false,
        },
    ],
    execute: async (params) => {
        const startTime = Date.now();

        try {
            const packageName = params.version
                ? `${params.package}@${params.version}`
                : (params.package as string);

            const { stdout, stderr } = await execAsync(`npm install ${packageName}`, {
                timeout: 60000, // 60 seconds
            });

            return {
                success: true,
                data: { package: packageName, output: stdout || stderr },
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
 * Run Shell Command Tool (Restricted)
 */
export const runCommandTool: ToolDefinition = {
    name: 'run_command',
    description: 'Run a shell command (restricted for security)',
    category: 'code',
    parameters: [
        {
            name: 'command',
            type: 'string',
            description: 'Command to run',
            required: true,
        },
        {
            name: 'timeout',
            type: 'number',
            description: 'Timeout in milliseconds (default: 10000)',
            required: false,
            default: 10000,
        },
    ],
    execute: async (params) => {
        const startTime = Date.now();

        try {
            // Blacklist dangerous commands
            const dangerousPatterns = [
                /rm\s+-rf/,
                /del\s+\/[sf]/i,
                /format/i,
                /mkfs/,
                /dd\s+if=/,
                />\s*\/dev\//,
            ];

            const command = params.command as string;

            if (dangerousPatterns.some((pattern) => pattern.test(command))) {
                return {
                    success: false,
                    error: 'Dangerous command blocked',
                    executionTime: Date.now() - startTime,
                };
            }

            const { stdout, stderr } = await execAsync(command, {
                timeout: (params.timeout as number) || 10000,
            });

            return {
                success: true,
                data: { stdout, stderr, output: stdout || stderr },
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
