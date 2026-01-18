/**
 * Web Scraping Tools
 * Extract content from web pages
 */

import * as cheerio from 'cheerio';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import type { ToolDefinition } from '@/lib/types/tool.types';

/**
 * Scrape Web Page Tool
 */
export const scrapeWebPageTool: ToolDefinition = {
    name: 'scrape_web_page',
    description: 'Extract content from a web page',
    category: 'web',
    parameters: [
        {
            name: 'url',
            type: 'string',
            description: 'URL to scrape',
            required: true,
        },
        {
            name: 'selector',
            type: 'string',
            description: 'CSS selector to extract specific elements (optional)',
            required: false,
        },
    ],
    execute: async (params) => {
        const startTime = Date.now();

        try {
            const response = await fetch(params.url as string);
            const html = await response.text();

            if (params.selector) {
                // Extract specific elements using cheerio
                const $ = cheerio.load(html);
                const elements = $(params.selector as string)
                    .map((_, el) => $(el).text().trim())
                    .get();

                return {
                    success: true,
                    data: { url: params.url, elements, count: elements.length },
                    executionTime: Date.now() - startTime,
                };
            } else {
                // Extract main article content using Readability
                const dom = new JSDOM(html, { url: params.url as string });
                const reader = new Readability(dom.window.document);
                const article = reader.parse();

                return {
                    success: true,
                    data: {
                        url: params.url,
                        title: article?.title || '',
                        content: article?.textContent || '',
                        excerpt: article?.excerpt || '',
                    },
                    executionTime: Date.now() - startTime,
                };
            }
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
 * Extract Links Tool
 */
export const extractLinksTool: ToolDefinition = {
    name: 'extract_links',
    description: 'Extract all links from a web page',
    category: 'web',
    parameters: [
        {
            name: 'url',
            type: 'string',
            description: 'URL to extract links from',
            required: true,
        },
        {
            name: 'filter',
            type: 'string',
            description: 'Filter links by pattern (optional)',
            required: false,
        },
    ],
    execute: async (params) => {
        const startTime = Date.now();

        try {
            const response = await fetch(params.url as string);
            const html = await response.text();

            const $ = cheerio.load(html);
            let links = $('a')
                .map((_, el) => ({
                    text: $(el).text().trim(),
                    href: $(el).attr('href') || '',
                }))
                .get()
                .filter((link) => link.href);

            // Apply filter if provided
            if (params.filter) {
                const filterPattern = new RegExp(params.filter as string, 'i');
                links = links.filter((link) => filterPattern.test(link.href));
            }

            return {
                success: true,
                data: { url: params.url, links, count: links.length },
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
 * Extract Table Data Tool
 */
export const extractTableTool: ToolDefinition = {
    name: 'extract_table',
    description: 'Extract table data from a web page',
    category: 'web',
    parameters: [
        {
            name: 'url',
            type: 'string',
            description: 'URL containing the table',
            required: true,
        },
        {
            name: 'tableIndex',
            type: 'number',
            description: 'Index of the table to extract (0-based, default: 0)',
            required: false,
            default: 0,
        },
    ],
    execute: async (params) => {
        const startTime = Date.now();

        try {
            const response = await fetch(params.url as string);
            const html = await response.text();

            const $ = cheerio.load(html);
            const tables = $('table');

            if (tables.length === 0) {
                return {
                    success: false,
                    error: 'No tables found on the page',
                    executionTime: Date.now() - startTime,
                };
            }

            const tableIndex = (params.tableIndex as number) || 0;
            const table = tables.eq(tableIndex);

            const rows: string[][] = [];
            table.find('tr').each((_, tr) => {
                const row: string[] = [];
                $(tr)
                    .find('th, td')
                    .each((_, cell) => {
                        row.push($(cell).text().trim());
                    });
                rows.push(row);
            });

            return {
                success: true,
                data: { url: params.url, rows, rowCount: rows.length },
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
 * Get Page Metadata Tool
 */
export const getPageMetadataTool: ToolDefinition = {
    name: 'get_page_metadata',
    description: 'Extract metadata from a web page (title, description, og:tags, etc.)',
    category: 'web',
    parameters: [
        {
            name: 'url',
            type: 'string',
            description: 'URL to extract metadata from',
            required: true,
        },
    ],
    execute: async (params) => {
        const startTime = Date.now();

        try {
            const response = await fetch(params.url as string);
            const html = await response.text();

            const $ = cheerio.load(html);

            const metadata = {
                title: $('title').text() || $('meta[property="og:title"]').attr('content'),
                description:
                    $('meta[name="description"]').attr('content') ||
                    $('meta[property="og:description"]').attr('content'),
                image: $('meta[property="og:image"]').attr('content'),
                url: $('meta[property="og:url"]').attr('content'),
                siteName: $('meta[property="og:site_name"]').attr('content'),
                author: $('meta[name="author"]').attr('content'),
                keywords: $('meta[name="keywords"]').attr('content'),
                canonical: $('link[rel="canonical"]').attr('href'),
            };

            return {
                success: true,
                data: { url: params.url, metadata },
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
